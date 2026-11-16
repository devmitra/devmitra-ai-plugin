#!/usr/bin/env node
/*
 * backlog.js — builds the backlog tracker and the backlog board of an app.
 *
 * Source of truth:  {bundle}/project/backlog.md  (the `Items` table)
 *                   and the status.md of every task an item links to.
 * Generated:        {bundle}/project/backlog_tracker.md
 *                   {bundle}/project/backlog.html
 *
 * Commands:
 *   sync  [--root <dir>] [--by <actor>]   validate the backlog, then write both generated files
 *   check [--root <dir>]                  validate the backlog and report whether the generated files are current
 *
 * {bundle} = {root}/{bundle_dir}. Root: --root <dir>, else the nearest folder upward containing {bundle_dir}, else the current directory.
 * Bundle directory: --bundle-dir <rel>, else $SDD_BUNDLE_DIR, else "bundle_dir" in the nearest .sdd.json found upward
 *                   from --root or the current directory, else .agentic_coding.
 * No dependencies. Node 16+.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const KINDS = ['feature', 'non-functional', 'enabling', 'mitigation', 'handover'];
const TASK_TYPES = ['create', 'change', 'bugfix', 'technical'];
const PRIORITIES = ['must', 'should', 'could'];
const COLUMNS = ['id', 'item', 'outcome', 'kind', 'feature', 'task type', 'priority', 'depends on', 'covers', 'task'];
const NONE = /^(—|–|-|none|n\/a|)$/i;

// state → [label for the human, colour token]
const STATES = {
  planned: ['Not started', 'muted'],
  specifying: ['Being specified', 'info'],
  designing: ['Being designed', 'info'],
  building: ['Being built', 'info'],
  validating: ['Being tested', 'info'],
  'in review': ['Waiting for your review', 'warning'],
  accepted: ['Accepted', 'success'],
  done: ['Done', 'success'],
  blocked: ['Blocked — needs you', 'danger'],
  reverted: ['Being re-planned', 'danger'],
  existing: ['Already built', 'muted'],
  removed: ['Removed', 'muted'],
  missing: ['Task record missing', 'danger'],
};
const ACTIVE = ['specifying', 'designing', 'building', 'validating', 'in review', 'accepted', 'reverted'];

function fail(message) { console.error('✗ ' + message); process.exit(1); }

function parseArgs(argv) {
  const args = { command: argv[0], root: null, by: null };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--root') args.root = argv[++i];
    else if (argv[i] === '--bundle-dir') args.bundleDir = argv[++i];
    else if (argv[i] === '--by') args.by = argv[++i];
    else fail('Unknown argument: ' + argv[i]);
  }
  return args;
}

const DEFAULT_DIR = '.agentic_coding';
let BUNDLE_DIR = DEFAULT_DIR;

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

function readFrontmatter(text) {
  const out = {};
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
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

function splitRow(line) {
  const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/);
  return cells.map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

function parseItems(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+Items\s*$/i.test(line));
  if (start < 0) fail('backlog.md has no "## Items" section.');
  let header = null;
  const items = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line)) break;
    if (!line.trim().startsWith('|')) { if (header && items.length) break; continue; }
    const cells = splitRow(line);
    if (!header) {
      header = cells.map((cell) => cell.toLowerCase());
      const absent = COLUMNS.filter((name) => !header.includes(name));
      if (absent.length) fail('The Items table lacks the column(s): ' + absent.join(', '));
      continue;
    }
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    const row = {};
    header.forEach((name, index) => { row[name] = cells[index] || ''; });
    items.push(row);
  }
  if (!header) fail('The "## Items" section has no table.');
  return items;
}

function ids(cell) { return NONE.test(cell.trim()) ? [] : cell.split(/[,\s]+/).filter(Boolean); }
function plain(text) { return String(text).replace(/\*\*|`/g, '').trim(); }

function taskState(projectDir, cell) {
  const value = cell.trim();
  if (NONE.test(value)) return { state: 'planned' };
  if (/^existing$/i.test(value)) return { state: 'existing' };
  if (/^removed$/i.test(value)) return { state: 'removed' };
  const link = /\[([^\]]*)\]\(([^)]+)\)/.exec(value);
  if (!link) return { state: 'missing', problem: 'Task cell is neither —, existing, removed, nor a link' };
  const file = path.resolve(projectDir, link[2]);
  if (!fs.existsSync(file)) return { state: 'missing', label: link[1], href: link[2], problem: 'linked status.md not found: ' + link[2] };
  const fm = readFrontmatter(fs.readFileSync(file, 'utf8'));
  const phases = [fm.phase_intent, fm.phase_plan, fm.phase_design];
  let state = 'specifying';
  if (fm.next === 'done') state = 'done';
  else if (fm.phase_build === 'blocked') state = 'blocked';
  else if (phases.includes('reverted')) state = 'reverted';
  else if (fm.phase_validation === 'accepted') state = 'accepted';
  else if (fm.phase_validation === 'in_review') state = 'in review';
  else if (fm.phase_validation === 'in_progress' || fm.phase_build === 'done') state = 'validating';
  else if (fm.phase_build === 'in_progress') state = 'building';
  else if (fm.phase_plan === 'approved' && ['pending', 'in_review'].includes(fm.phase_design)) state = 'designing';
  return { state, label: link[1], href: link[2], next: fm.next || '' };
}

function load(root) {
  const projectDir = path.join(root, BUNDLE_DIR, 'project');
  const backlogFile = path.join(projectDir, 'backlog.md');
  if (!fs.existsSync(backlogFile)) fail('Not found: ' + backlogFile);
  const text = fs.readFileSync(backlogFile, 'utf8');
  const fm = readFrontmatter(text);
  const items = parseItems(text).map((row) => {
    const task = taskState(projectDir, row.task);
    const feature = NONE.test(row.feature) ? '' : plain(row.feature);
    const previewRel = feature ? path.join('..', 'features', feature, 'preview', feature + '.html') : '';
    return {
      id: plain(row.id), item: plain(row.item), outcome: plain(row.outcome), kind: plain(row.kind).toLowerCase(),
      feature, taskType: plain(row['task type']).toLowerCase(), priority: plain(row.priority).toLowerCase(),
      dependsOn: ids(row['depends on']), covers: plain(row.covers), task,
      preview: previewRel && fs.existsSync(path.join(projectDir, previewRel)) ? previewRel.split(path.sep).join('/') : '',
    };
  });
  const app = (fm.title || 'App').replace(/\s*[—–-]\s*backlog\s*$/i, '') || 'App';
  return { projectDir, app, revision: fm.revision || '?', items };
}

function validate(model) {
  const problems = [];
  const byId = new Map();
  for (const item of model.items) {
    if (!/^BL\d+$/.test(item.id)) problems.push(`${item.id || '(empty ID)'}: an ID is BL followed by a number`);
    if (byId.has(item.id)) problems.push(`${item.id}: ID used twice`);
    byId.set(item.id, item);
    if (!item.item) problems.push(`${item.id}: Item is empty`);
    if (!item.outcome) problems.push(`${item.id}: Outcome is empty`);
    if (!KINDS.includes(item.kind)) problems.push(`${item.id}: Kind must be one of ${KINDS.join(' | ')}`);
    if (!TASK_TYPES.includes(item.taskType)) problems.push(`${item.id}: Task type must be one of ${TASK_TYPES.join(' | ')}`);
    if (!PRIORITIES.includes(item.priority)) problems.push(`${item.id}: Priority must be one of ${PRIORITIES.join(' | ')}`);
    if (!item.covers || NONE.test(item.covers)) problems.push(`${item.id}: Covers is empty (write the IDs it covers, or "enabling")`);
    if (item.task.problem) problems.push(`${item.id}: ${item.task.problem}`);
  }
  const position = new Map(model.items.map((item, index) => [item.id, index]));
  for (const item of model.items) {
    for (const dep of item.dependsOn) {
      const target = byId.get(dep);
      if (!target) { problems.push(`${item.id}: depends on ${dep}, which does not exist`); continue; }
      if (item.task.state === 'removed') continue;
      if (target.task.state === 'removed') problems.push(`${item.id}: depends on ${dep}, which is removed`);
      if (position.get(dep) > position.get(item.id)) problems.push(`${item.id}: is listed before ${dep}, which it depends on`);
    }
  }
  const visiting = new Set(), finished = new Set();
  const visit = (id, trail) => {
    if (finished.has(id) || !byId.has(id)) return;
    if (visiting.has(id)) { problems.push('Dependency cycle: ' + trail.concat(id).join(' → ')); return; }
    visiting.add(id);
    byId.get(id).dependsOn.forEach((dep) => visit(dep, trail.concat(id)));
    visiting.delete(id); finished.add(id);
  };
  model.items.forEach((item) => visit(item.id, []));
  const live = model.items.filter((item) => item.task.state !== 'removed');
  const handover = live.filter((item) => item.kind === 'handover');
  if (handover.length > 1) problems.push('More than one handover item');
  if (handover.length === 1 && live[live.length - 1] !== handover[0]) problems.push(`${handover[0].id}: the handover item must be last`);
  return problems;
}

function summarise(model) {
  const live = model.items.filter((item) => item.task.state !== 'removed');
  const count = (states) => live.filter((item) => states.includes(item.task.state)).length;
  const finished = new Set(live.filter((item) => ['done', 'existing'].includes(item.task.state)).map((item) => item.id));
  for (const item of model.items) item.waitingFor = item.dependsOn.filter((dep) => !finished.has(dep));
  return {
    total: live.length, done: count(['done', 'existing']), active: count(ACTIVE),
    blocked: count(['blocked', 'missing']), planned: count(['planned']),
  };
}

function cell(text) { return String(text).replace(/\|/g, '\\|'); }

function trackerMarkdown(model, sum, by, at) {
  const rows = model.items.map((item) => {
    const task = item.task.href ? `[${item.task.label}](${item.task.href})` : '—';
    const waiting = ['done', 'existing', 'removed'].includes(item.task.state) || !item.waitingFor.length ? '—' : item.waitingFor.join(', ');
    return `| ${item.id} | ${cell(item.item)} | ${item.priority} | ${item.task.state} | ${item.task.next || '—'} | ${task} | ${waiting} |`;
  });
  return [
    '---',
    'type: Backlog Tracker',
    `title: "${model.app} — backlog tracker"`,
    'description: Generated state of every backlog item.',
    'status: stable',
    `generated: { by: ${by}, at: ${at} }`,
    `backlog_revision: ${model.revision}`,
    '---',
    `# ${model.app} — backlog tracker`,
    '',
    'Generated by `backlog sync` from [backlog.md](backlog.md) and the `status.md` of each task. Never edit this file.',
    '',
    `**Progress**: ${sum.done} of ${sum.total} done · ${sum.active} in progress · ${sum.blocked} blocked · ${sum.planned} not started`,
    '',
    '| ID | Item | Priority | State | Next step | Task | Waiting for |',
    '|---|---|---|---|---|---|---|',
    ...rows,
    '',
    'State: planned · specifying · designing · building · validating · in review · accepted · done · blocked · reverted · existing · removed · missing.',
    '',
  ].join('\n');
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

const FALLBACK_TOKENS = `:root{--bg:#f6f7f9;--surface:#fff;--surface-2:#eef0f3;--border:#d9dde3;--ink:#14181f;--ink-muted:#5b6472;
--primary:#0d6e63;--primary-soft:#dcf1ed;--on-primary:#fff;--success:#157a3f;--success-soft:#e0f3e7;--warning:#a15c00;--warning-soft:#fdf0d9;
--danger:#c42b2b;--danger-soft:#fde8e8;--info:#1f5fbf;--info-soft:#e3edfb;--disabled-bg:#e4e7ec;--disabled-ink:#9aa2ae;
--font-sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;
--radius-md:10px;--radius-lg:16px;--radius-pill:999px;--shadow-sm:0 1px 3px rgba(16,24,40,.1)}`;

const PAGE_CSS = `*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:400 15px/22px var(--font-sans)}
main{max-width:860px;margin:0 auto;padding:var(--space-6) var(--space-4)}
h1{font:700 28px/34px var(--font-sans);margin:0}.sub{color:var(--ink-muted);margin:4px 0 var(--space-5)}
.bar{height:10px;border-radius:var(--radius-pill);background:var(--surface-2);overflow:hidden}
.bar span{display:block;height:100%;background:var(--primary)}
.counts{display:flex;flex-wrap:wrap;gap:var(--space-4);margin:var(--space-3) 0 var(--space-6);color:var(--ink-muted)}
.counts b{color:var(--ink)}
ol{list-style:none;margin:0;padding:0;display:grid;gap:var(--space-3)}
li{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:var(--space-4)}
li.removed{opacity:.55}.top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.id{font-weight:600;color:var(--ink-muted)}h2{font:600 18px/24px var(--font-sans);margin:0;flex:1 1 240px}
.chip{border-radius:var(--radius-pill);padding:2px 10px;font:600 12px/18px var(--font-sans);white-space:nowrap}
.muted{background:var(--surface-2);color:var(--ink-muted)}.info{background:var(--info-soft);color:var(--info)}
.success{background:var(--success-soft);color:var(--success)}.warning{background:var(--warning-soft);color:var(--warning)}
.danger{background:var(--danger-soft);color:var(--danger)}
p{margin:var(--space-2) 0 0}.meta{color:var(--ink-muted);font-size:13px;line-height:18px}
a{color:var(--primary)}footer{margin-top:var(--space-6);color:var(--ink-muted);font-size:13px}`;

function boardHtml(model, sum, tokensCss) {
  const percent = sum.total ? Math.round((sum.done / sum.total) * 100) : 0;
  const cards = model.items.map((item) => {
    const [label, colour] = STATES[item.task.state];
    const meta = [item.priority, item.kind];
    if (item.waitingFor.length && !['done', 'existing', 'removed'].includes(item.task.state)) meta.push('waits for ' + item.waitingFor.join(', '));
    const links = [];
    if (item.preview) links.push(`<a href="${esc(item.preview)}">Open the preview</a>`);
    if (item.task.href) links.push(`<a href="${esc(item.task.href)}">Task record</a>`);
    return `<li class="${item.task.state === 'removed' ? 'removed' : ''}">
<div class="top"><span class="id">${esc(item.id)}</span><h2>${esc(item.item)}</h2><span class="chip ${colour}">${esc(label)}</span></div>
<p>${esc(item.outcome)}</p>
<p class="meta">${esc(meta.join(' · '))}${links.length ? ' · ' + links.join(' · ') : ''}</p>
</li>`;
  });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="backlog.js — generated from backlog.md; never edit">
<title>${esc(model.app)} — backlog</title>
<style>${FALLBACK_TOKENS}</style>
<style>${tokensCss.replace(/<\/style/gi, '<\\/style')}</style>
<style>${PAGE_CSS}</style>
<script>document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';</script>
</head>
<body>
<main>
<h1>${esc(model.app)}</h1>
<p class="sub">What is being built, in order, and how far it is.</p>
<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="Items done"><span style="width:${percent}%"></span></div>
<div class="counts"><span><b>${sum.done}</b> of <b>${sum.total}</b> done</span><span><b>${sum.active}</b> in progress</span><span><b>${sum.blocked}</b> blocked</span><span><b>${sum.planned}</b> not started</span></div>
<ol>
${cards.join('\n')}
</ol>
<footer>Backlog revision ${esc(model.revision)}. Generated from backlog.md.</footer>
</main>
</body>
</html>
`;
}

function withoutStamp(text) { return text.replace(/^generated:.*$/m, 'generated:'); }

function build(root, by) {
  const model = load(root);
  const problems = validate(model);
  const sum = summarise(model);
  const trackerFile = path.join(model.projectDir, 'backlog_tracker.md');
  const boardFile = path.join(model.projectDir, 'backlog.html');
  const tokensFile = path.join(model.projectDir, 'design_system', 'tokens.css');
  const tokensCss = fs.existsSync(tokensFile) ? fs.readFileSync(tokensFile, 'utf8') : '';
  const oldTracker = fs.existsSync(trackerFile) ? fs.readFileSync(trackerFile, 'utf8') : '';
  const oldBoard = fs.existsSync(boardFile) ? fs.readFileSync(boardFile, 'utf8') : '';
  const previous = /^generated:\s*\{\s*by:\s*(.+?),\s*at:/m.exec(oldTracker);
  const actor = by || (previous ? previous[1] : 'agent/unknown');
  const at = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const tracker = trackerMarkdown(model, sum, actor, at);
  const board = boardHtml(model, sum, tokensCss);
  return {
    model, problems, sum, trackerFile, boardFile, tracker, board,
    trackerCurrent: withoutStamp(oldTracker) === withoutStamp(tracker),
    boardCurrent: oldBoard === board,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!['sync', 'check'].includes(args.command)) {
    console.log('Usage: backlog.js sync [--root <dir>] [--by <actor>] [--bundle-dir <rel>]\n       backlog.js check [--root <dir>] [--bundle-dir <rel>]');
    process.exit(args.command ? 1 : 0);
  }
  BUNDLE_DIR = resolveBundleDir(args.bundleDir, args.root ? path.resolve(args.root) : process.cwd());
  const result = build(findRoot(args.root), args.by);
  result.problems.forEach((problem) => console.error('✗ ' + problem));
  if (result.problems.length) fail(`backlog.md has ${result.problems.length} problem(s); nothing was written.`);
  const s = result.sum;
  const line = `${s.done} of ${s.total} done · ${s.active} in progress · ${s.blocked} blocked · ${s.planned} not started`;
  if (args.command === 'check') {
    if (!result.trackerCurrent) console.error('✗ backlog_tracker.md is stale — run sync');
    if (!result.boardCurrent) console.error('✗ backlog.html is stale — run sync');
    if (!result.trackerCurrent || !result.boardCurrent) process.exit(1);
    console.log('✓ backlog valid, tracker and board current — ' + line);
    return;
  }
  if (!result.trackerCurrent) fs.writeFileSync(result.trackerFile, result.tracker);
  if (!result.boardCurrent) fs.writeFileSync(result.boardFile, result.board);
  console.log(`✓ ${result.trackerCurrent && result.boardCurrent ? 'already current' : 'written'} — ${line}`);
  console.log('  ' + result.trackerFile + '\n  ' + result.boardFile);
}

main();
