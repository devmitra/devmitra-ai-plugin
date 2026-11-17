#!/usr/bin/env node
/*
 * sdd_progress.js — renders the SDD workflow progress view from the bundle records.
 *
 * Reads (never writes): {bundle}/log.md, every tasks/{task}/status.md and features/{feature}/tasks/{task}/status.md,
 *                       and for an application project/app_status.md, app.md, backlog.md, operations.md.
 * Writes:               {bundle}/progress.html — generated, never edited by hand (skipped with --no-html or when no bundle exists).
 * Prints:               the rich-text (Markdown) view to stdout, to be shown to the human in chat as is.
 * Templates:            ../assets/progress/progress_template.md and progress_template.html.
 *
 * Usage:
 *   sdd_progress.js [--view full|compact] [--task <task_id>] [--profile sdd|app] [--project <name>]
 *                   [--root <dir>] [--bundle-dir <rel>] [--by <actor>] [--no-html] [--json]
 *
 *   --view      full: explains the process and shows a table (session start, or when the human asks); compact (default): two lines.
 *   --task      the task to show; default: the open task the app's next backlog item links to, else the open task written last.
 *   --profile   app shows the application steps (default when project/app_status.md exists).
 *   --json      print the view data instead of the Markdown (for debugging).
 *
 * {bundle} = {root}/{bundle_dir}. Root: --root <dir>, else the nearest folder upward containing {bundle_dir}, else the current directory.
 * Bundle directory: --bundle-dir <rel>, else $SDD_BUNDLE_DIR, else "bundle_dir" in the nearest .sdd.json found upward
 *                   from --root or the current directory, else .agentic_coding.
 * No dependencies. Node 16+.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets', 'progress');
const DEFAULT_DIR = '.agentic_coding';
let BUNDLE_DIR = DEFAULT_DIR;

function fail(message) { console.error('✗ ' + message); process.exit(1); }

// ---------- arguments and discovery (same rules as the other bundle CLIs) ----------

function parseArgs(argv) {
  const a = { view: 'compact', html: true, json: false };
  const value = (i) => { if (i >= argv.length) fail('Missing value for ' + argv[i - 1]); return argv[i]; };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--view') a.view = value(++i);
    else if (k === '--task') a.task = value(++i);
    else if (k === '--profile') a.profile = value(++i);
    else if (k === '--project') a.project = value(++i);
    else if (k === '--root') a.root = value(++i);
    else if (k === '--bundle-dir') a.bundleDir = value(++i);
    else if (k === '--by') a.by = value(++i);
    else if (k === '--no-html') a.html = false;
    else if (k === '--json') a.json = true;
    else if (k === '-h' || k === '--help') { usage(); process.exit(0); }
    else fail('Unknown argument: ' + k);
  }
  if (!['full', 'compact'].includes(a.view)) fail('--view must be full or compact');
  if (a.profile && !['sdd', 'app'].includes(a.profile)) fail('--profile must be sdd or app');
  return a;
}
function usage() {
  console.log('Usage: sdd_progress.js [--view full|compact] [--task <task_id>] [--profile sdd|app] [--project <name>]\n' +
    '                      [--root <dir>] [--bundle-dir <rel>] [--by <actor>] [--no-html] [--json]');
}

function resolveBundleDir(flag, startDir) {
  let v = flag || process.env.SDD_BUNDLE_DIR;
  if (!v) {
    let dir = startDir;
    for (;;) {
      const file = path.join(dir, '.sdd.json');
      if (fs.existsSync(file)) {
        try { v = JSON.parse(fs.readFileSync(file, 'utf8')).bundle_dir; } catch (e) { fail(file + ' is not valid JSON: ' + e.message); }
        break;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  if (v === undefined || v === null || v === '') return DEFAULT_DIR;
  if (typeof v !== 'string' || path.isAbsolute(v) || v.includes('\\') || v.split('/').some((x) => x === '..' || x === '')) {
    fail('invalid bundle_dir "' + v + '" - use a relative path without "..", a leading "/" or a backslash');
  }
  return v.replace(/\/+$/, '');
}

function findRoot(explicit) {
  if (explicit) return path.resolve(explicit);
  let dir = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(dir, BUNDLE_DIR))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

// ---------- Markdown record parsing ----------

const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);

function readFrontmatter(text) {
  const out = {};
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text || '');
  if (!match) return out;
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^".*"/.test(value)) value = /^"(.*?)"/.exec(value)[1];
    else value = value.replace(/\s+#.*$/, '').trim();
    out[kv[1]] = value;
  }
  return out;
}
function atOf(value) { const m = /at:\s*([^\s,}]+)/.exec(value || ''); return m ? m[1] : ''; }

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}
/** Rows of the first table under the `## {heading}` section (or of the first table in the file when heading is null), keyed by the lower-cased header. */
function table(text, heading) {
  const lines = (text || '').split(/\r?\n/);
  const start = heading === null ? -1 : lines.findIndex((l) => new RegExp('^##\\s+' + heading + '\\s*$', 'i').test(l));
  if (heading !== null && start < 0) return [];
  let header = null;
  const rows = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line)) break;
    if (!line.trim().startsWith('|')) { if (header && rows.length) break; continue; }
    const cells = splitRow(line);
    if (!header) { header = cells.map((c) => c.toLowerCase()); continue; }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const row = {};
    header.forEach((h, idx) => { row[h] = cells[idx] || ''; });
    rows.push(row);
  }
  return rows;
}
function col(row, ...names) { for (const n of names) if (row[n] !== undefined) return row[n]; return ''; }
function plain(text) { return String(text || '').replace(/\*\*|`/g, '').trim(); }
function nextAction(text) { const m = /\*\*Next action\*\*:\s*(.+)/.exec(text || ''); return m ? plain(m[1]) : ''; }
function exists(bundle, rel) { return fs.existsSync(path.join(bundle, rel)); }
function docs(bundle, list) { return list.filter((d) => d.href && exists(bundle, d.href)); }
function clip(s, n) { s = plain(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

function approvals(text) {
  return table(text, 'Approvals').map((r) => ({
    gate: plain(col(r, 'gate')),
    artifact: plain(col(r, 'artifact (revision)', 'artifact')),
    decision: plain(col(r, 'decision')).toLowerCase(),
    by: plain(col(r, 'by')),
    at: plain(col(r, 'at')),
    notes: clip(col(r, 'notes'), 240),
  })).filter((d) => d.gate);
}

// ---------- step catalogue (plain language, shown to the human) ----------

const TASK_STEPS = [
  { id: 'start', n: 0, name: 'Start', short: 'Find the records, resume', gate: '',
    explain: 'Find the bundle and resume where the last session stopped, after checking who last worked on the task and what changed since.' },
  { id: 'bootstrap', n: 1, name: 'Bootstrap', short: 'Set up the records', gate: 'G0',
    explain: 'Create the knowledge bundle with its workflow playbook, the architecture document, and the decision log.',
    approves: 'the bundle location, commit or gitignore, architecture.md, the agent-instruction pointer' },
  { id: 'intent', n: 2, name: 'Intent', short: 'What and why', gate: 'G1',
    explain: 'Requirements and acceptance criteria in plain words; every open question answered, or defaulted and logged.',
    approves: 'the feature, task type, track, and intent.md' },
  { id: 'plan', n: 3, name: 'Plan', short: 'How, and how it is tested', gate: 'G2',
    explain: 'Which files change and why, the decisions with their reasons, the work items, and at least one test case per acceptance criterion.',
    approves: 'plan.md, the validation plan, the design-phase decision, any new dependency' },
  { id: 'design', n: 4, name: 'UX design', short: 'Screens and states', gate: 'G3',
    explain: 'Every screen and state is described, with a clickable preview where the stack has one. Only for work that changes what users see.',
    approves: 'ux_design.md and its preview' },
  { id: 'build', n: 5, name: 'Build', short: 'One work item at a time', gate: '',
    explain: 'Each work item changes only its planned files and is done only when its tests exist and pass.' },
  { id: 'validate', n: 6, name: 'Validate', short: 'Every test run; you accept', gate: 'G4',
    explain: 'The whole validation plan runs against the finished code; you accept the results.',
    approves: 'the validation results' },
  { id: 'close', n: 7, name: 'Close', short: 'Spec updated, handed off', gate: '',
    explain: 'spec.md is updated to describe what was built, decisions are promoted, and follow-ups are listed.' },
];
const TASK_NEXT = { Intent: 'intent', Plan: 'plan', Design: 'design', Build: 'build', Validation: 'validate', Close: 'close' };
const TASK_GATE_STEP = { G1: 'intent', G2: 'plan', F1: 'plan', G3: 'design', F2: 'build', G4: 'validate', A6: 'validate' };

const APP_STEPS = [
  { id: 'app_intent', n: 1, name: 'App intent', short: 'What the app is', gate: 'G0 + A1', key: 'A1', gates: ['G0', 'A1'], phase: 'phase_app_intent', next: 'Intent',
    explain: 'The bundle is set up and the app is described in plain words: who it is for, the journeys, requirements, success criteria, and what is out of scope.',
    approves: 'app.md, the bundle location, and the approval mode' },
  { id: 'design_system', n: 2, name: 'Look', short: 'How it looks', gate: 'A2', key: 'A2', gates: ['A2'], phase: 'phase_design_system', next: 'Design system',
    explain: 'Colours, fonts, sizes, and components are fixed once as a locked design system, so every screen looks the same.',
    approves: 'the locked design-system base and its style guide' },
  { id: 'architecture', n: 3, name: 'Architecture', short: 'How it is built', gate: 'A3', key: 'A3', gates: ['A3'], phase: 'phase_architecture', next: 'Architecture',
    explain: 'The tech stack, the structure of the code, the commands, and the rules every task follows. Installs and accounts are listed as operations and asked separately.',
    approves: 'architecture.md, the stack decisions, the conformance rules' },
  { id: 'backlog', n: 4, name: 'Backlog', short: 'What is built, in order', gate: 'A4', key: 'A4', gates: ['A4'], phase: 'phase_backlog', next: 'Backlog',
    explain: 'The app is sliced into small backlog items, each built and tested as its own task.',
    approves: 'backlog.md: items, order, priorities' },
  { id: 'risks', n: 5, name: 'Risks', short: 'What could go wrong', gate: 'A5', key: 'A5', gates: ['A5'], phase: 'phase_risks', next: 'Risks',
    explain: 'Every risk gets a level and a response; the ones that need work become backlog items.',
    approves: 'risks.md and the backlog items it adds' },
  { id: 'build_loop', n: 6, name: 'Build', short: 'One task per backlog item', gate: 'G1–G4 per task', key: 'task', gates: [], phase: 'phase_tasks', next: 'Build',
    explain: 'Each backlog item runs the task steps: intent, plan, design, build, validate, close.',
    approves: "each task's intent, plan, design, and results" },
  { id: 'handover', n: 7, name: 'Handover', short: 'The finished app', gate: 'A6', key: 'A6', gates: ['A6'], phase: 'phase_handover', next: 'Handover',
    explain: 'Every success criterion is checked end to end; you get a run guide, a test script, and the list of gaps and open risks.',
    approves: 'the finished app, handover.md, its gaps and open risks' },
];
const APP_DOCS = {
  app_intent: ['project/app.md'], design_system: ['project/design_system/base-preview.html'],
  architecture: ['project/architecture.md', 'project/decisions.md'], backlog: ['project/backlog.md', 'project/backlog.html'],
  risks: ['project/risks.md'], build_loop: ['project/backlog_tracker.md'], handover: ['project/handover.md'],
};
const MODES = {
  review: 'Every gate waits for your explicit approval.',
  'auto-approve': 'Gates are auto-approved on your instruction and logged; operations are still asked.',
  'auto-technical': 'You approve what the app does, how it looks, what is in scope, and the final result; technical steps are auto-approved.',
  'auto-all': 'Every gate is auto-approved and logged; you look at the end. Operations are still asked.',
};
const MATRIX = {
  columns: ['review', 'auto-technical', 'auto-all'],
  rows: [['G0 + A1 App intent', 'A1'], ['A2 Design system', 'A2'], ['A3 Architecture and stack', 'A3'], ['A4 Backlog', 'A4'],
    ['A5 Risks', 'A5'], ['Task G1, G2, G3, G4', 'task'], ['A6 Handover', 'A6'], ['OP Operations', 'OP']],
  who: {
    review: { A1: 'you', A2: 'you', A3: 'you', A4: 'you', A5: 'you', task: 'you', A6: 'you', OP: 'you' },
    'auto-technical': { A1: 'you', A2: 'you', A3: 'auto', A4: 'you', A5: 'auto', task: 'auto', A6: 'you', OP: 'you' },
    'auto-all': { A1: 'auto', A2: 'auto', A3: 'auto', A4: 'auto', A5: 'auto', task: 'auto', A6: 'auto', OP: 'you' },
  },
};

// ---------- state ----------

function phaseState(value, isNext, decisions) {
  switch (value) {
    case 'approved': case 'accepted': {
      const last = decisions.filter((d) => ['approved', 'auto-approved'].includes(d.decision)).pop();
      return last && last.decision === 'auto-approved' ? 'auto' : 'approved';
    }
    case 'in_review': return 'review';
    case 'in_progress': return 'active';
    case 'blocked': return 'blocked';
    case 'reverted': return 'reverted';
    case 'skipped': return 'skipped';
    case 'done': return 'done';
    default: return isNext ? 'active' : 'todo';
  }
}

function humanise(taskId) {
  const s = String(taskId).replace(/^\d{8}-(create|change|bugfix|technical)-/, '').replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function findTasks(bundle) {
  const out = [];
  const scan = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const file = path.join(dir, name, 'status.md');
      if (fs.existsSync(file)) out.push(file);
    }
  };
  scan(path.join(bundle, 'tasks'));
  const features = path.join(bundle, 'features');
  if (fs.existsSync(features)) for (const f of fs.readdirSync(features)) scan(path.join(features, f, 'tasks'));
  return out;
}

function loadTask(bundle, file, approver, withBootstrap) {
  const text = read(file);
  const fm = readFrontmatter(text);
  const dir = path.dirname(file);
  const rel = (name) => path.relative(bundle, path.join(dir, name)).split(path.sep).join('/');
  const id = fm.title || path.basename(dir);
  const decisions = approvals(text);
  const ops = decisions.filter((d) => d.gate === 'OP');
  const gated = decisions.filter((d) => d.gate !== 'OP');
  const nextStep = TASK_NEXT[fm.next] || null;
  const closed = fm.next === 'done';
  const phase = { intent: fm.phase_intent, plan: fm.phase_plan, design: fm.phase_design, build: fm.phase_build, validate: fm.phase_validation };
  const featureSpec = fm.feature && fm.feature !== 'none' ? 'features/' + fm.feature + '/spec.md' : '';
  const docMap = {
    intent: [{ label: 'intent.md', href: rel('intent.md') }],
    plan: [{ label: 'plan.md', href: rel('plan.md') }, { label: 'validation.md', href: rel('validation.md') }],
    design: [{ label: 'ux_design.md', href: rel('ux_design.md') }],
    build: [{ label: 'handoff.md', href: rel('handoff.md') }],
    validate: [{ label: 'validation.md', href: rel('validation.md') }],
    close: [{ label: 'spec.md', href: featureSpec }],
  };
  const progressRows = table(text, 'Progress');
  const steps = TASK_STEPS.filter((s) => withBootstrap || !['start', 'bootstrap'].includes(s.id)).map((s) => {
    const step = Object.assign({}, s, { approves: s.approves || '', approver: s.gate ? approver : 'none', docs: docs(bundle, docMap[s.id] || []), decisions: [] });
    step.decisions = gated.filter((d) => (TASK_GATE_STEP[d.gate] || nextStep || 'close') === s.id);
    if (s.id === 'start' || s.id === 'bootstrap') step.state = 'done';
    else if (s.id === 'close') step.state = closed ? 'done' : nextStep === 'close' ? 'active' : 'todo';
    else step.state = phaseState(phase[s.id], !closed && nextStep === s.id, step.decisions);
    if (s.id === 'design' && step.state === 'skipped') step.approver = 'none';
    if (s.id === 'build' && progressRows.length) {
      const items = progressRows.map((r) => ({ id: plain(col(r, 'work item')), state: plain(col(r, 'state')).toLowerCase() || 'todo' }));
      step.progress = { done: items.filter((w) => w.state === 'done').length, total: items.length, unit: 'work items', items };
    }
    return step;
  });
  const blockers = table(text, 'Blockers').filter((r) => /open|needs-human/i.test(col(r, 'status')))
    .map((r) => ({ id: plain(col(r, 'id')), problem: clip(col(r, 'problem (redacted excerpt)', 'problem'), 160), next: clip(col(r, 'next action'), 160) }));
  const reverts = table(text, 'Reverts').map((r) => ({ from: plain(col(r, 'from phase')), trigger: clip(col(r, 'trigger'), 160) }));
  return {
    id, title: humanise(id), type: fm.task_type || '', track: fm.track || '', feature: fm.feature || 'none',
    backlogItem: fm.backlog_item || '', status: rel('status.md'), next: fm.next || 'Intent', closed,
    generatedAt: atOf(fm.generated), nextAction: nextAction(text), steps, blockers, reverts,
    ops: ops.map((o, i) => ({ id: 'OP', category: 'operation', action: o.artifact, decision: o.decision, by: o.by, at: o.at, n: i })),
    autoApproved: gated.some((d) => d.decision === 'auto-approved'),
  };
}

/** A task that is not opened yet, shown so the human sees the steps ahead. */
function placeholderTask(withBootstrap, bootstrapState, approver, title) {
  const steps = TASK_STEPS.filter((s) => withBootstrap || !['start', 'bootstrap'].includes(s.id)).map((s) => {
    const step = Object.assign({}, s, { approves: s.approves || '', approver: s.gate ? approver : 'none', docs: [], decisions: [], state: 'todo' });
    if (s.id === 'start') step.state = 'done';
    if (s.id === 'bootstrap') step.state = bootstrapState;
    if (s.id === 'intent' && withBootstrap && ['approved', 'auto', 'done'].includes(bootstrapState)) step.state = 'active';
    return step;
  });
  return { id: '', title, type: '—', track: '—', feature: 'none', status: '', next: 'Intent', closed: false, placeholder: true, steps, blockers: [], reverts: [], ops: [] };
}

function bootstrapRecord(bundle) {
  const log = read(path.join(bundle, 'log.md')) || '';
  const line = log.split(/\r?\n/).find((l) => /\*\*Creation\*\*/.test(l) && /bundle|G0/i.test(l) && !/^\s*\*\s*\*\*Creation\*\*:\s*Opened/.test(l));
  if (!line) return null;
  const by = /((?:human|agent):[^\s,;)]+)/.exec(line);
  const at = /(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/.exec(line);
  return { gate: 'G0', decision: 'approved', by: by ? by[1] : '', at: at ? at[1] : '', artifact: 'bundle', notes: clip(line.replace(/^\s*\*\s*/, ''), 240) };
}

function projectName(bundle, root, given) {
  if (given) return given;
  const app = readFrontmatter(read(path.join(bundle, 'project', 'app.md')));
  if (app.title) return app.title.replace(/\s+[—-]\s+app intent$/i, '');
  const arch = readFrontmatter(read(path.join(bundle, 'project', 'architecture.md')));
  if (arch.title && !/\{/.test(arch.title)) return arch.title.replace(/\s+architecture$/i, '');
  return path.basename(root);
}

// ---------- model ----------

function build(args) {
  const root = findRoot(args.root);
  const bundle = path.join(root, BUNDLE_DIR);
  const hasBundle = fs.existsSync(bundle);
  const appStatusText = hasBundle ? read(path.join(bundle, 'project', 'app_status.md')) : null;
  const profile = args.profile || (appStatusText ? 'app' : 'sdd');
  const isApp = profile === 'app';
  const fmApp = readFrontmatter(appStatusText);
  if (!fmApp.next) fmApp.next = 'Intent';
  const appDecisions = approvals(appStatusText);

  // Mode
  let mode = isApp ? (fmApp.approval_mode || 'review') : 'review';
  const taskFiles = hasBundle ? findTasks(bundle) : [];
  const taskApprover = (m) => (isApp ? MATRIX.who[m] && MATRIX.who[m].task : m === 'review' ? 'you' : 'auto') || 'you';

  let tasks = taskFiles.map((f) => loadTask(bundle, f, taskApprover(mode), !isApp));
  if (!isApp && tasks.some((t) => !t.closed && t.autoApproved)) {
    mode = 'auto-approve';
    tasks = taskFiles.map((f) => loadTask(bundle, f, 'auto', true));
  }

  // Bootstrap (G0) for a plain SDD bundle
  const g0 = hasBundle ? bootstrapRecord(bundle) : null;
  const bootstrapState = !hasBundle ? 'active' : g0 ? 'approved' : 'review';
  const applyBootstrap = (t) => t.steps.forEach((s) => {
    if (s.id === 'bootstrap') { s.state = bootstrapState; s.decisions = g0 ? [g0] : []; s.docs = hasBundle ? docs(bundle, [{ label: 'index.md', href: 'index.md' }, { label: 'workflow.md', href: 'project/workflow.md' }, { label: 'architecture.md', href: 'project/architecture.md' }]) : []; }
  });
  tasks.forEach(applyBootstrap);

  // Application lane
  let app = null;
  if (isApp) {
    const projectDir = path.join(bundle, 'project');
    const backlogRows = table(read(path.join(projectDir, 'backlog.md')), 'Items');
    const backlog = backlogRows.map((r) => {
      const cell = col(r, 'task');
      const link = /\[[^\]]*\]\(([^)]+)\)/.exec(cell);
      const item = { id: plain(col(r, 'id')), item: plain(col(r, 'item')), state: 'todo', task: null };
      if (/^removed$/i.test(plain(cell))) item.state = 'skipped';
      else if (/^existing$/i.test(plain(cell))) item.state = 'done';
      else if (link) {
        const abs = path.resolve(projectDir, link[1]);
        const t = tasks.find((x) => path.resolve(bundle, x.status) === abs);
        if (t) {
          item.task = t.id;
          t.title = item.id + ' ' + item.item;
          const states = t.steps.map((s) => s.state);
          item.state = t.closed ? 'done' : states.includes('blocked') ? 'blocked' : states.includes('reverted') ? 'reverted' : states.includes('review') ? 'review' : 'active';
        }
      }
      return item;
    });
    const nextId = (APP_STEPS.find((s) => s.next === fmApp.next) || {}).id;
    const steps = APP_STEPS.map((s) => {
      const decisions = appDecisions.filter((d) => s.gates.includes(d.gate));
      const step = Object.assign({}, s, { approver: (MATRIX.who[mode] || MATRIX.who.review)[s.key] || 'you', decisions,
        docs: docs(bundle, (APP_DOCS[s.id] || []).map((h) => ({ label: path.basename(h) === 'base-preview.html' ? 'Style guide' : path.basename(h) === 'backlog.html' ? 'Backlog board' : path.basename(h), href: h }))) });
      step.state = phaseState(fmApp[s.phase], fmApp.next !== 'done' && nextId === s.id, decisions);
      if (s.id === 'build_loop') {
        const live = backlog.filter((b) => b.state !== 'skipped');
        if (live.length) step.progress = { done: live.filter((b) => b.state === 'done').length, total: live.length, unit: 'backlog items' };
      }
      delete step.key; delete step.gates; delete step.phase; delete step.next;
      return step;
    });
    const ops = table(read(path.join(projectDir, 'operations.md')), null);
    app = {
      kind: fmApp.app_kind || '', next: fmApp.next || 'Intent', status: 'project/app_status.md', nextAction: nextAction(appStatusText),
      steps, backlog,
      operations: ops.map((r) => ({ id: plain(col(r, 'id')), category: plain(col(r, 'category')), action: plain(col(r, 'exact action', 'action')),
        decision: plain(col(r, 'decision')).toLowerCase(), by: plain(col(r, 'by')), at: plain(col(r, 'decided at', 'at')) })).filter((o) => o.id),
    };
  }

  // Current task
  let current = null;
  if (args.task) {
    current = tasks.find((t) => t.id === args.task || path.basename(path.dirname(t.status)) === args.task);
    if (!current) fail('No task "' + args.task + '" in ' + bundle);
  }
  if (!current && app) {
    const item = app.backlog.find((b) => b.task && !['done', 'skipped'].includes(b.state));
    if (item) current = tasks.find((t) => t.id === item.task);
  }
  if (!current) current = tasks.filter((t) => !t.closed).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
  if (!current && !app) current = null;
  if (!current) {
    const nextItem = app && app.backlog.find((b) => b.state === 'todo');
    const ph = placeholderTask(!isApp, bootstrapState, taskApprover(mode), nextItem ? nextItem.id + ' ' + nextItem.item + ' (not opened yet)' : 'Next task (not opened yet)');
    applyBootstrap(ph);
    tasks.push(ph);
    current = ph;
  }
  tasks.sort((a, b) => (a === current ? -1 : b === current ? 1 : b.generatedAt && a.generatedAt ? b.generatedAt.localeCompare(a.generatedAt) : 0));

  // Where things stand
  let lane = 'task', stepId = null, text = '';
  const curStep = (t) => (t.steps.find((s) => ['review', 'blocked', 'reverted', 'active'].includes(s.state)) || {}).id || null;
  if (app && !['Build'].includes(app.next) && !(app.next === 'Handover' && current && !current.placeholder && !current.closed)) {
    lane = 'app';
    stepId = (app.steps.find((s) => ['review', 'blocked', 'reverted', 'active'].includes(s.state)) || app.steps[app.steps.length - 1]).id;
    text = app.nextAction || (!appStatusText ? 'No records yet. Next: set up the bundle and describe the app in plain words, then ask for G0 and A1.'
      : 'App step: ' + (app.steps.find((s) => s.id === stepId) || {}).name);
  } else {
    stepId = curStep(current);
    if (!hasBundle) text = 'No records yet. Next: set up the bundle and its architecture document, then ask for G0.';
    else if (!isApp && bootstrapState === 'review') text = 'The bundle and its architecture document are proposed and waiting for your review (G0).';
    else if (current.placeholder) text = (app && app.nextAction) || 'No open task. Next: open a task and write its intent (G1).';
    else text = current.nextAction || (app && app.nextAction) || 'Next: ' + current.next;
  }

  // Waiting on the human
  const waiting = [];
  const reviewSteps = [];
  if (app) app.steps.filter((s) => s.state === 'review').forEach((s) => reviewSteps.push({ s, scope: 'App' }));
  if (current) current.steps.filter((s) => s.state === 'review').forEach((s) => reviewSteps.push({ s, scope: current.title }));
  const gatesInReview = reviewSteps.map((r) => r.s.gate.replace(/\s/g, '')).join('+');
  if (/^G1\+G2$/.test(gatesInReview)) waiting.push({ gate: 'G1 + G2', what: 'intent.md, plan.md, and the validation plan of ' + current.title, reply: 'Approve G1 and G2' });
  else reviewSteps.forEach(({ s, scope }) => {
    const gate = s.gate;
    const reply = gate === 'G0 + A1' ? 'Approve G0 and A1' : 'Approve ' + gate;
    const scoped = scope !== 'App' && s.id !== 'bootstrap' && !current.placeholder;
    waiting.push({ gate, what: (s.approves || s.name) + (scoped ? ' — ' + scope : ''), reply });
  });
  const allOps = (app ? app.operations : []).concat(tasks.reduce((acc, t) => acc.concat(t.ops), []));
  allOps.filter((o) => o.decision === 'pending').forEach((o) => waiting.push({ gate: o.id, what: o.action, reply: o.id === 'OP' ? 'Approve the operation: ' + o.action : 'Approve ' + o.id }));

  // Last decision
  const every = [];
  if (app) app.steps.forEach((s) => s.decisions.forEach((d) => every.push(Object.assign({ scope: 'App' }, d))));
  tasks.forEach((t) => t.steps.forEach((s) => s.decisions.forEach((d) => every.push(Object.assign({ scope: t.title }, d)))));
  allOps.forEach((o) => { if (o.decision !== 'pending') every.push({ gate: o.id, decision: o.decision, by: o.by, at: o.at, artifact: o.action, scope: 'Operation' }); });
  const last = every.filter((d) => d.at).sort((a, b) => a.at.localeCompare(b.at)).pop() || null;

  const data = {
    schema: 1,
    generated: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    generatedBy: args.by || '',
    bundle: BUNDLE_DIR,
    project: projectName(bundle, root, args.project),
    profile,
    mode: { name: mode, label: MODES[mode] || '', source: isApp ? 'app_status.md › approval_mode' : mode === 'review' ? 'default: no auto-approve instruction recorded' : "the task's Approvals (auto-approved rows)" },
    matrix: isApp ? { columns: MATRIX.columns, rows: MATRIX.rows.map(([label, key]) => [label].concat(MATRIX.columns.map((c) => MATRIX.who[c][key]))) } : null,
    now: { lane, step: stepId, text, waitingOnYou: waiting, last },
    app: app ? { kind: app.kind, next: app.next, status: app.status, steps: app.steps, backlog: app.backlog } : null,
    currentTask: current.id || '',
    tasks: tasks.map((t) => ({ id: t.id, title: t.title, type: t.type, track: t.track, feature: t.feature, status: t.status, next: t.next,
      closed: t.closed, steps: t.steps, blockers: t.blockers, reverts: t.reverts })),
    operations: allOps.map((o) => ({ id: o.id, category: o.category, action: o.action, decision: o.decision, by: o.by, at: o.at })),
  };
  return { data, root, bundle, hasBundle };
}

// ---------- rich text (Markdown) ----------

const ICON = { approved: '✅', done: '✅', auto: '🤖', review: '🟡', active: '🔵', todo: '⚪', skipped: '⏭️', blocked: '⛔', reverted: '↩️' };
const WORDS = { approved: 'approved by you', done: 'done', auto: 'auto-approved', review: 'waiting for your review', active: 'in progress',
  todo: 'not started', skipped: 'skipped', blocked: 'blocked — needs you', reverted: 'reverted — being re-planned' };
const DEC_ICON = { approved: '✅', 'auto-approved': '🤖', pending: '🟡', rejected: '↩️', reverted: '↩️' };

function stamp(iso) { return iso ? iso.replace('T', ' ').replace(/:\d\d(\.\d+)?Z$/, 'Z') : ''; }
function who(by) { return String(by || '').replace(/^(human|agent):/, ''); }
function cell(text) { return String(text || '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' '); }
function gateShort(s) { return s.gate === 'G0 + A1' ? 'A1' : /per task/.test(s.gate) ? '' : s.gate; }

function strip(steps, currentId) {
  return steps.map((s) => {
    const g = gateShort(s);
    let label = (g ? g + ' ' : '') + s.name + (s.progress ? ' ' + s.progress.done + '/' + s.progress.total : '');
    if (s.id === currentId) label = '**' + label + '**';
    return ICON[s.state] + ' ' + label;
  }).join(' → ');
}
function rows(steps, currentId) {
  return steps.map((s) => {
    const last = s.decisions.filter((d) => d.decision !== 'pending').pop();
    let state = WORDS[s.state];
    if (last && ['approved', 'auto'].includes(s.state)) state = (last.decision === 'approved' ? 'approved by ' + who(last.by) : 'auto-approved') + ' ' + stamp(last.at);
    if (s.progress) state += ' · ' + s.progress.done + '/' + s.progress.total + ' ' + s.progress.unit;
    let step = s.n + ' ' + s.name + ' — ' + s.short.charAt(0).toLowerCase() + s.short.slice(1);
    if (s.id === currentId) step = '**' + step + '** ◀ now';
    return { icon: ICON[s.state], step: cell(step), gate: cell(s.gate || '—'), approves: cell(s.approves || '—'),
      approver: s.gate && s.approver !== 'none' ? s.approver : '—', state: cell(state) };
  });
}

function renderTemplate(tpl, ctx) {
  tpl = tpl.replace(/^\s*<!--[\s\S]*?-->\s*\r?\n/, '').replace(/^[ \t]*(\{\{[#^/]\w+\}\})[ \t]*\r?\n/gm, '$1');
  const lookup = (stack, name) => { for (let i = stack.length - 1; i >= 0; i--) { const c = stack[i]; if (c && typeof c === 'object' && name in c) return c[name]; } return undefined; };
  const part = (t, stack) => {
    let out = '', i = 0, m;
    const re = /\{\{([#^/]?)(\w+)\}\}/g;
    while ((m = re.exec(t))) {
      out += t.slice(i, m.index);
      const kind = m[1], name = m[2];
      if (kind === '') { const v = lookup(stack, name); out += v === undefined || v === null || v === false ? '' : String(v); i = re.lastIndex; continue; }
      if (kind === '/') fail('Template: unexpected {{/' + name + '}}');
      const close = new RegExp('\\{\\{([#^/])' + name + '\\}\\}', 'g');
      close.lastIndex = re.lastIndex;
      let depth = 1, end = -1, after = 0, c;
      while ((c = close.exec(t))) { if (c[1] === '/') { if (--depth === 0) { end = c.index; after = close.lastIndex; break; } } else depth++; }
      if (end < 0) fail('Template: unclosed {{' + kind + name + '}}');
      const inner = t.slice(re.lastIndex, end), v = lookup(stack, name);
      const truthy = Array.isArray(v) ? v.length > 0 : !!v;
      if (kind === '#' && truthy) out += Array.isArray(v) ? v.map((x) => part(inner, stack.concat([x]))).join('') : part(inner, stack.concat([v]));
      if (kind === '^' && !truthy) out += part(inner, stack);
      i = after; re.lastIndex = after;
    }
    return out + t.slice(i);
  };
  return part(tpl, [ctx]).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function markdown(model, view, htmlFile) {
  const D = model.data;
  const full = view === 'full';
  const t = D.tasks.find((x) => x.id === D.currentTask) || D.tasks[0];
  const appNow = D.now.lane === 'app' ? D.now.step : null;
  const taskNow = D.now.lane === 'task' ? D.now.step : null;
  const last = D.now.last;
  const waiting = D.now.waitingOnYou.length
    ? D.now.waitingOnYou.map((w) => '🟡 **' + w.gate + '** — ' + w.what + '. Reply "' + w.reply + '", or tell me what to change.').join(' · ')
    : 'nothing — operations (installs, accounts, deletes, publishing, deploys) are always asked in the chat';
  const ctx = {
    full, project: D.project, bundle: D.bundle, mode: D.mode.name, mode_label: D.mode.label,
    app: !!D.app, kind: D.app ? D.app.kind : '',
    app_strip: D.app ? strip(D.app.steps, appNow) : '',
    app_table: full && !!D.app && D.now.lane === 'app', app_rows: D.app ? rows(D.app.steps, appNow) : [],
    task: !!t, task_title: t ? t.title : '', task_type: t && t.type !== '—' ? t.type : '', track: t && t.track !== '—' ? t.track : '',
    task_strip: t ? strip(t.steps, taskNow) : '',
    task_table: full && !!t && D.now.lane === 'task', task_rows: t ? rows(t.steps, taskNow) : [],
    last: last ? (DEC_ICON[last.decision] || '•') + ' ' + last.gate + ' ' + last.decision + (last.decision === 'approved' ? ' by ' + who(last.by) : '') +
      ' — ' + [last.artifact, last.scope].filter(Boolean).join(', ') + ' · ' + stamp(last.at) : '',
    next: D.now.text, waiting,
    html: !!htmlFile,
    html_rel: htmlFile ? path.relative(process.cwd(), htmlFile).split(path.sep).join('/') : '',
    html_url: htmlFile ? 'file://' + htmlFile.split(path.sep).map(encodeURIComponent).join('/').replace(/^\/?/, '/').replace(/^\/([A-Za-z])%3A/, '/$1:') : '',
  };
  return renderTemplate(fs.readFileSync(path.join(ASSETS, 'progress_template.md'), 'utf8'), ctx);
}

// ---------- main ----------

function main() {
  const args = parseArgs(process.argv.slice(2));
  BUNDLE_DIR = resolveBundleDir(args.bundleDir, args.root ? path.resolve(args.root) : process.cwd());
  const model = build(args);
  if (args.json) { console.log(JSON.stringify(model.data, null, 2)); return; }
  let htmlFile = null;
  if (args.html && model.hasBundle) {
    const tpl = fs.readFileSync(path.join(ASSETS, 'progress_template.html'), 'utf8');
    const LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029);
    const json = JSON.stringify(model.data).replace(/</g, "\\u003c").split(LS).join("\\u2028").split(PS).join("\\u2029");
    if (!tpl.includes('__SDD_PROGRESS_DATA__')) fail('progress_template.html has no __SDD_PROGRESS_DATA__ placeholder');
    htmlFile = path.join(model.bundle, 'progress.html');
    fs.writeFileSync(htmlFile, tpl.replace('__SDD_PROGRESS_DATA__', () => json));
  }
  process.stdout.write(markdown(model, args.view, htmlFile));
}

main();
