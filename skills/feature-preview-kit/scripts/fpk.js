#!/usr/bin/env node
/*
 * feature-preview-kit CLI — no dependencies (Node 16+). All artifacts live in <root>/.agentic_coding/.
 *
 *   init                      create .agentic_coding/base/ from the kit (Phase A start)
 *   lock [--version v] [--name n]   lock the base sources (Phase A end)
 *   check [slug]              base lock state (+ is the feature's built file up to date); exit 1 on problems
 *   new <slug> [--name "…"] [--demo]   start a feature (blank starter, or the Tasks demo)
 *   build <slug> | --base | --all [--force]   build self-contained HTML (base: base-preview.html with the demo)
 *   validate <slug> [--json]  static checks of a feature's sources (no browser)
 *   extract <file.html> <slug> [--base] [--force]   import a standalone Feature Preview Kit HTML file
 *   list | info [slug]        list features / print a short summary
 *
 * Root: --root <dir>, else the nearest folder upward containing .agentic_coding, else the nearest with .git, else cwd.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SKILL = path.resolve(__dirname, '..');
const ASSETS = path.join(SKILL, 'assets');
const DIR = '.agentic_coding';
const REGION_IDS = ['fpk-config', 'fpk-tokens', 'fpk-token-overrides', 'fpk-components', 'fpk-base-css', 'fpk-page', 'fpk-runtime'];

// ---------- small helpers
const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const rel = (p) => path.relative(process.cwd(), p) || '.';
function die(msg, code = 1) { console.error('fpk: ' + msg); process.exit(code); }
function takeFlag(args, name, hasValue = true) {
  const i = args.indexOf('--' + name); if (i < 0) return undefined;
  if (!hasValue) { args.splice(i, 1); return true; }
  const v = args[i + 1]; if (v === undefined) die(`--${name} needs a value`); args.splice(i, 2); return v;
}
function slugOk(s) { if (!s || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(s)) die(`invalid slug "${s || ''}" — use lowercase letters, digits and dashes`); return s; }
function json(p) { try { return JSON.parse(read(p)); } catch (e) { die(`${rel(p)} is not valid JSON: ${e.message}`); } }

function findRoot(explicit) {
  if (explicit) return path.resolve(explicit);
  let d = process.cwd();
  for (;;) { if (exists(path.join(d, DIR))) return d; const up = path.dirname(d); if (up === d) break; d = up; }
  d = process.cwd();
  for (;;) { if (exists(path.join(d, '.git'))) return d; const up = path.dirname(d); if (up === d) break; d = up; }
  return process.cwd();
}
let ROOT, BASE, FEAT;
function paths(root) { ROOT = root; BASE = path.join(root, DIR, 'base'); FEAT = path.join(root, DIR, 'feature'); }
const featDir = (slug) => path.join(FEAT, slug);

// ---------- hashing (base sources, and runtime-compatible hash of built HTML)
function fnv1a(str) { let h = 0x811c9dc5; for (const b of Buffer.from(str, 'utf8')) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
function canonical(v) { return Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => (o[k] = canonical(v[k]), o), {}) : v; }
const norm = (t) => t.replace(/\r\n/g, '\n').trim();
function sourceHash() {
  const cfg = json(path.join(BASE, 'config.json')); delete (cfg.base || {}).status; delete (cfg.base || {}).lockedAt;
  return 'fnv1a32:' + fnv1a(['config.json\n' + JSON.stringify(canonical(cfg)), 'tokens.css\n' + norm(read(path.join(BASE, 'tokens.css'))), 'base.css\n' + norm(read(path.join(BASE, 'base.css')))].join('\n\0\n'));
}
function maskComments(html) { return html.replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length)); }
function findRegion(html, id) {
  const m = new RegExp('(<(style|script)\\b[^>]*\\bid="' + id + '"[^>]*>)([\\s\\S]*?)(</\\2>)', 'i').exec(maskComments(html));
  if (!m) return null;
  const a = m.index + m[1].length, b = m.index + m[0].length - m[4].length;
  return { a, b, text: html.slice(a, b) };
}
function builtHash(html) { return 'fnv1a32:' + fnv1a(REGION_IDS.map((id) => { const r = findRegion(html, id); return id + '\n' + (r ? norm(r.text) : ''); }).join('\n\u0000\n')); }

function baseState() {
  if (!exists(path.join(BASE, 'config.json'))) return { state: 'missing', msg: `no base — run \`fpk.js init\` (Phase A) in ${rel(ROOT)}` };
  const lockP = path.join(BASE, 'lock.json');
  if (!exists(lockP)) return { state: 'unlocked', msg: 'base not locked — finish Phase A, then `fpk.js lock`' };
  const lock = json(lockP), actual = sourceHash();
  return lock.hash === actual ? { state: 'locked', lock, msg: `base "${lock.name}" ${lock.version} locked` } : { state: 'modified', lock, actual, msg: `base sources changed since lock ${lock.version} — Phase A: run \`fpk.js lock\`; Phase B: revert .agentic_coding/base` };
}

// ---------- build
function compactCss(css) { return css.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.trim()).filter(Boolean).join('\n'); }
// Trim indentation and comment-only lines; skipped if any line could be inside a multi-line template literal.
function compactJs(js) { const lines = js.split('\n'); if (lines.some((l) => (l.match(/`/g) || []).length % 2)) return js; return lines.map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n'); }
function guard(text, tag, file) { if (new RegExp('</' + tag, 'i').test(text)) die(`${file} contains "</${tag}" — not allowed`); return text; }
function buildHtml({ feature, out, title, forceUnlocked }) {
  const st = baseState();
  if (st.state === 'missing') die(st.msg);
  const cfg = json(path.join(BASE, 'config.json'));
  cfg.base = Object.assign({}, cfg.base, { status: forceUnlocked ? 'modified (forced build)' : st.state === 'locked' ? 'locked' : 'unlocked' }, st.lock ? { lockedAt: st.lock.lockedAt, version: st.lock.version } : {});
  const spec = json(path.join(feature, 'spec.json'));
  const opt = (f) => (exists(path.join(feature, f)) ? read(path.join(feature, f)) : '');
  const core = (f) => read(path.join(ASSETS, 'core', f));
  const fill = {
    'fpk-config': '\n' + JSON.stringify(cfg, null, 2).replace(/<\/(script)/gi, '<\\/$1') + '\n',
    'fpk-tokens': '\n' + guard(read(path.join(BASE, 'tokens.css')), 'style', 'base/tokens.css') + '\n',
    'fpk-token-overrides': '',
    'fpk-components': '\n' + compactCss(core('components.css')) + '\n',
    'fpk-base-css': '\n' + guard(read(path.join(BASE, 'base.css')), 'style', 'base/base.css') + '\n',
    'fpk-page': '\n' + compactCss(core('page.css')) + '\n',
    'fpk-feature-css': '\n' + guard(opt('feature.css'), 'style', 'feature.css') + '\n',
    'fpk-spec': '\n' + JSON.stringify(spec, null, 2).replace(/<\/(script)/gi, '<\\/$1') + '\n',
    'fpk-runtime': '\n' + compactJs(core('runtime.js')) + '\n',
    'fpk-feature-logic': '\n' + opt('logic.js').replace(/<\/(script)/gi, '<\\/$1') + '\n',
    'fpk-views': '\n' + guard(read(path.join(feature, 'views.html')), 'script', 'views.html').trim() + '\n'
  };
  let html = core('shell.html');
  for (const [id, text] of Object.entries(fill)) {
    const marker = '@@' + id + '@@';
    if (!html.includes(marker)) die(`shell.html is missing ${marker}`);
    html = html.split(marker).join(text);
  }
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${(title || 'Feature preview').replace(/[<&]/g, '')}</title>`);
  const lockVal = st.state === 'locked' && !forceUnlocked ? builtHash(html) : 'unlocked';
  html = html.replace(/(<meta name="fpk-base-lock" content=")[^"]*(")/, (_, a, b) => a + lockVal + b);
  write(out, html);
  return { out, bytes: Buffer.byteLength(html), base: st };
}

// ---------- static validation (no browser)
function parseAttrs(s) { const o = {}; const re = /([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let m; while ((m = re.exec(s))) o[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''; return o; }
function parseTemplates(html) {
  const out = [], re = /<template\b([^>]*)>([\s\S]*?)<\/template>/g; let m;
  while ((m = re.exec(html))) { const attrs = parseAttrs(m[1]); const kind = 'data-fpk-view' in attrs ? 'view' : 'data-fpk-overlay' in attrs ? 'overlay' : null; out.push({ kind, id: attrs['data-fpk-view'] || attrs['data-fpk-overlay'], attrs, body: m[2] }); }
  return out;
}
function tagsIn(body) { const out = [], re = /<([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g; let m; while ((m = re.exec(body))) out.push({ name: m[1].toLowerCase(), attrs: parseAttrs(m[2]) }); return out; }
function runtimeLists() {
  const rt = read(path.join(ASSETS, 'core', 'runtime.js'));
  const icons = [...rt.slice(rt.indexOf('var ICONS = {'), rt.indexOf('};', rt.indexOf('var ICONS = {'))).matchAll(/'([\w-]+)':\s*'</g)].map((m) => m[1]);
  const rules = [...rt.slice(rt.indexOf('var RULES = {'), rt.indexOf('function validate(map)')).matchAll(/^\s*(\w+): function/gm)].map((m) => m[1]);
  return { icons, rules };
}
function validateFeature(slug) {
  const dir = featDir(slug), issues = [], notes = [];
  if (!exists(dir)) die(`no feature "${slug}" in ${rel(FEAT)}`);
  const st = baseState();
  if (st.state === 'modified' || st.state === 'missing') issues.push('base: ' + st.msg); else if (st.state === 'unlocked') notes.push('base: ' + st.msg);
  if (!exists(path.join(dir, 'views.html'))) { issues.push('views.html is missing'); return { ok: false, issues, notes }; }
  const spec = json(path.join(dir, 'spec.json'));
  const views = {}, overlays = {}, actions = spec.actions || {}, state = spec.state || {};
  const { icons, rules } = runtimeLists();
  const logic = exists(path.join(dir, 'logic.js')) ? read(path.join(dir, 'logic.js')) : '';
  const handlers = new Set([...logic.matchAll(/FPK\.handler\(\s*['"]([\w-]+)['"]/g)].map((m) => m[1]));
  const cfg = exists(path.join(BASE, 'config.json')) ? json(path.join(BASE, 'config.json')) : { devices: [] };
  const onlyOk = new Set(['phone', 'wide', 'ios', 'android', 'tablet', 'web', ...(cfg.devices || []).map((d) => d.id)]);
  const tpls = parseTemplates(read(path.join(dir, 'views.html')));
  const getPath = (o, p) => String(p).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean).reduce((x, k) => (x == null ? undefined : x[k]), o);
  for (const t of tpls) {
    if (!t.kind || !t.id) { issues.push('a <template> has no data-fpk-view / data-fpk-overlay id'); continue; }
    const bag = t.kind === 'view' ? views : overlays;
    if (bag[t.id]) issues.push(`duplicate ${t.kind} "${t.id}"`);
    bag[t.id] = t;
    if (t.attrs['data-layout'] && !['card', 'narrow', 'full', 'flush'].includes(t.attrs['data-layout'])) issues.push(`view "${t.id}": data-layout must be card|narrow|full|flush`);
    if (t.attrs['data-actions']) { try { JSON.parse(t.attrs['data-actions']); } catch (e) { issues.push(`view "${t.id}": data-actions is not valid JSON`); } }
  }
  Object.keys(spec.views || {}).forEach((id) => { if (!views[id]) issues.push(`spec.views.${id} has no <template data-fpk-view="${id}">`); });
  const allViews = new Set([...Object.keys(views), ...Object.keys(spec.views || {})]);
  const initial = spec.initialView || (tpls.find((t) => t.kind === 'view') || {}).id;
  if (!initial || !views[initial]) issues.push(`initialView "${initial}" is not a view template`);
  const routes = {};
  for (const id of Object.keys(views)) { const r = (spec.views && spec.views[id] && spec.views[id].route) || views[id].attrs['data-route']; if (r) { if (routes[r]) issues.push(`route "${r}" used by "${routes[r]}" and "${id}"`); routes[r] = id; } }
  const viewOk = (v) => String(v).includes('{{') || allViews.has(v);
  const actOk = (a) => actions[a] || handlers.has(a);
  const appBarActions = [];
  for (const t of tpls) {
    const where = `${t.kind} "${t.id}"`;
    if (t.attrs['data-onenter'] && !actOk(t.attrs['data-onenter'])) issues.push(`${where}: data-onenter runs unknown action "${t.attrs['data-onenter']}"`);
    try { (JSON.parse(t.attrs['data-actions'] || '[]')).forEach((a) => appBarActions.push([where, a])); } catch (e) {}
    const tags = tagsIn(t.body);
    for (const g of tags) {
      const A = g.attrs, at = (n) => A['data-fp-' + n];
      for (const n of ['nav', 'replace', 'tab']) if (at(n) != null && !viewOk(at(n))) issues.push(`${where}: data-fp-${n} → unknown view "${at(n)}"`);
      for (const n of ['action', 'submit']) if (at(n) != null && !actOk(at(n))) issues.push(`${where}: data-fp-${n} → unknown action "${at(n)}"`);
      if (at('overlay') != null && !overlays[at('overlay')] && !String(at('overlay')).includes('{{')) issues.push(`${where}: data-fp-overlay → unknown overlay "${at('overlay')}"`);
      if (at('icon') != null && !icons.includes(at('icon'))) issues.push(`${where}: unknown icon "${at('icon')}" (see references/components.md)`);
      if (at('bind') != null && getPath(state, at('bind')) === undefined) issues.push(`${where}: data-fp-bind="${at('bind')}" has no initial value in spec.state`);
      if (at('only') != null) at('only').split(/[\s,]+/).filter(Boolean).forEach((x) => { if (!onlyOk.has(x)) issues.push(`${where}: data-fp-only names unknown device "${x}"`); });
      if (g.name === 'script' || Object.keys(A).some((k) => /^on[a-z]+$/.test(k))) issues.push(`${where}: <script> / inline on* handler — use data-fp-* or FPK.handler`);
    }
    // submit buttons inside a form[data-fp-submit] must not also carry data-fp-action
    const formRe = /<form\b[^>]*data-fp-submit[^>]*>([\s\S]*?)<\/form>/g; let fm;
    while ((fm = formRe.exec(t.body))) tagsIn(fm[1]).forEach((g) => { if (g.name === 'button' && g.attrs['data-fp-action'] != null && (g.attrs.type || 'submit') === 'submit') issues.push(`${where}: submit button inside form[data-fp-submit] also has data-fp-action (runs twice) — add type="button" or drop it`); });
    if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(t.body)) notes.push(`${where}: raw colour value — prefer var(--token)`);
  }
  appBarActions.forEach(([where, a]) => {
    if (a.nav && !viewOk(a.nav)) issues.push(`${where}: app-bar action → unknown view "${a.nav}"`);
    if (a.action && !actOk(a.action)) issues.push(`${where}: app-bar action → unknown action "${a.action}"`);
    if (a.overlay && !overlays[a.overlay]) issues.push(`${where}: app-bar action → unknown overlay "${a.overlay}"`);
    if (a.icon && !icons.includes(a.icon)) issues.push(`${where}: app-bar action uses unknown icon "${a.icon}"`);
  });
  const scan = (steps, where) => [].concat(steps || []).forEach((s) => {
    if (!s || typeof s !== 'object') return;
    if ('if' in s) { scan(s.then, where); scan(s.else, where); return; }
    const k = Object.keys(s)[0], a = s[k];
    if (['navigate', 'replace', 'tab'].includes(k)) { const v = typeof a === 'object' ? a.view : a; if (!viewOk(v)) issues.push(`${where}: step ${k} → unknown view "${v}"`); }
    else if (['run', 'call'].includes(k)) { if (!actOk(a)) issues.push(`${where}: step run → unknown action "${a}"`); }
    else if (k === 'overlay') { if (!overlays[a]) issues.push(`${where}: step overlay → unknown overlay "${a}"`); }
    else if (k === 'validate') Object.entries(a).forEach(([f, rs]) => [].concat(rs).forEach((r) => { const rule = typeof r === 'object' ? r.rule : String(r).split('|')[0].split(':')[0]; if (!rules.includes(rule)) issues.push(`${where}: unknown validation rule "${rule}"`); }));
    else if (!['set', 'toggle', 'increment', 'decrement', 'push', 'remove', 'error', 'clearErrors', 'back', 'reset', 'close', 'toast', 'wait', 'log'].includes(k)) issues.push(`${where}: unknown step "${k}"`);
  });
  Object.entries(actions).forEach(([n, steps]) => scan(steps, `action "${n}"`));
  Object.entries(spec.views || {}).forEach(([id, v]) => { if (v.onEnter && typeof v.onEnter !== 'string') scan(v.onEnter, `view "${id}" onEnter`); else if (v.onEnter && !actOk(v.onEnter)) issues.push(`view "${id}": onEnter runs unknown action "${v.onEnter}"`); });
  ((spec.tabBar || {}).items || []).forEach((it) => { if (!allViews.has(it.view)) issues.push(`tabBar item "${it.label}" → unknown view "${it.view}"`); if (it.icon && !icons.includes(it.icon)) issues.push(`tabBar item "${it.label}" uses unknown icon "${it.icon}"`); });
  if (spec.meta && spec.meta.demo) notes.push('spec.meta.demo is true — this is still the demo feature');
  return { ok: issues.length === 0, base: st.state, views: Object.keys(views), overlays: Object.keys(overlays), actions: Object.keys(actions), handlers: [...handlers], issues, notes };
}

// ---------- starter files
const STARTER_VIEWS = `<!-- One <template> per view / overlay. View settings go on the tag (data-title, data-route, data-layout, data-back, data-actions, data-onenter). -->
<template data-fpk-view="start" data-title="{{meta.name}}" data-route="/" data-back="false">
  <div>
    <h2 class="text-h2 fp-h">{{meta.name}}</h2>
    <p class="text-body fp-muted fp-h" style="margin-top:var(--space-1)">Replace this starter view with the feature's first screen.</p>
  </div>
  <button class="fp-btn fp-btn-primary fp-btn-block" type="button" data-fp-toast="It works">Primary action</button>
</template>
`;
const STARTER_LOGIC = `// Optional handlers for logic the step DSL can't express. Register with FPK.handler(name, async (ctx) => { ... }).
// ctx: state, errors, platform, device, get(path), set(path, value), navigate(view, {replace}), back(), reset(),
//      openOverlay(id), closeOverlay(), toast(text), setError(field, msg), clearErrors(), run(steps), wait(ms), log(x)
`;

// ---------- commands
const cmds = {
  init(args) {
    const force = takeFlag(args, 'force', false);
    if (exists(path.join(BASE, 'config.json')) && !force) die(`${rel(BASE)} already exists (use --force to overwrite)`);
    for (const f of ['config.json', 'tokens.css', 'base.css']) write(path.join(BASE, f), read(path.join(ASSETS, 'kit', f)));
    if (exists(path.join(BASE, 'lock.json'))) fs.unlinkSync(path.join(BASE, 'lock.json'));
    const readme = path.join(ROOT, DIR, 'README.md');
    if (!exists(readme)) write(readme, '# .agentic_coding\n\nArtifacts written by coding agents.\n\n- `base/`: design-system base for feature previews (config.json, tokens.css, base.css, lock.json, base-preview.html)\n- `feature/<slug>/`: one clickable feature prototype per folder (views.html, spec.json, feature.css, logic.js → `<slug>.html`)\n\nOpen any built `*.html` in a browser. Edit sources, not built files.\n');
    console.log(`created ${rel(BASE)}/{config.json,tokens.css,base.css} — fill them (Phase A), then: fpk.js build --base && fpk.js lock`);
  },
  lock(args) {
    const version = takeFlag(args, 'version'), name = takeFlag(args, 'name');
    const cfgP = path.join(BASE, 'config.json'); if (!exists(cfgP)) die('no base — run `fpk.js init` first');
    const cfg = json(cfgP);
    if (version || name) { cfg.base = Object.assign({}, cfg.base, version ? { version } : {}, name ? { name } : {}); write(cfgP, JSON.stringify(cfg, null, 2) + '\n'); }
    const lock = { name: cfg.base.name, version: cfg.base.version, hash: sourceHash(), lockedAt: new Date().toISOString().slice(0, 10) };
    write(path.join(BASE, 'lock.json'), JSON.stringify(lock, null, 2) + '\n');
    console.log(`locked base "${lock.name}" ${lock.version} (${lock.hash})`);
    const stale = exists(FEAT) ? fs.readdirSync(FEAT).filter((s) => exists(path.join(featDir(s), s + '.html'))) : [];
    if (stale.length) console.log(`rebuild features to pick up the base: fpk.js build --all (${stale.length})`);
  },
  check(args) {
    const slug = args[0], st = baseState(); let bad = st.state === 'modified' || st.state === 'missing';
    console.log(`${st.state.toUpperCase()}: ${st.msg}`);
    if (slug) {
      const dir = featDir(slugOk(slug)), out = path.join(dir, slug + '.html');
      if (!exists(dir)) die(`no feature "${slug}"`);
      if (!exists(out)) { console.log(`NOT BUILT: run fpk.js build ${slug}`); bad = true; }
      else {
        const t = fs.statSync(out).mtimeMs, srcs = ['views.html', 'spec.json', 'feature.css', 'logic.js'].map((f) => path.join(dir, f)).concat(['config.json', 'tokens.css', 'base.css'].map((f) => path.join(BASE, f))).filter(exists);
        const newer = srcs.filter((p) => fs.statSync(p).mtimeMs > t);
        const html = read(out), lockVal = (/<meta name="fpk-base-lock" content="([^"]*)"/.exec(html) || [])[1];
        if (newer.length) { console.log(`STALE: ${newer.map(rel).join(', ')} changed after the build — run fpk.js build ${slug}`); bad = true; }
        else if (lockVal !== 'unlocked' && lockVal !== builtHash(html)) { console.log(`EDITED: ${rel(out)} was edited by hand — rebuild from sources`); bad = true; }
        else console.log(`UP TO DATE: ${rel(out)}`);
      }
    }
    process.exit(bad ? 1 : 0);
  },
  new(args) {
    const name = takeFlag(args, 'name'), demo = takeFlag(args, 'demo', false), slug = slugOk(args[0]);
    const dir = featDir(slug); if (exists(dir)) die(`${rel(dir)} already exists`);
    const st = baseState(); if (st.state === 'missing') die(st.msg);
    if (demo) for (const f of ['views.html', 'spec.json', 'feature.css', 'logic.js']) write(path.join(dir, f), read(path.join(ASSETS, 'demo', f)));
    else {
      const title = name || slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
      write(path.join(dir, 'views.html'), STARTER_VIEWS);
      write(path.join(dir, 'spec.json'), JSON.stringify({ meta: { name: title, description: '', version: '0.1.0' }, state: {}, actions: {} }, null, 2) + '\n');
      write(path.join(dir, 'feature.css'), '/* feature-only styles — tokens only, feature-prefixed class names */\n');
      write(path.join(dir, 'logic.js'), STARTER_LOGIC);
    }
    console.log(`created ${rel(dir)}/ (${demo ? 'Tasks demo' : 'starter'}) — base ${st.state}${st.state !== 'locked' ? ' ⚠' : ''}`);
  },
  build(args) {
    const force = takeFlag(args, 'force', false), base = takeFlag(args, 'base', false), all = takeFlag(args, 'all', false);
    const st = baseState(); if (st.state === 'missing') die(st.msg);
    if (base) {
      const r = buildHtml({ feature: path.join(ASSETS, 'demo'), out: path.join(BASE, 'base-preview.html'), title: 'Base preview' });
      console.log(`built ${rel(r.out)} (${Math.round(r.bytes / 1024)} KB, base ${st.state}) — demo feature + style guide for reviewing the base`);
      return;
    }
    if (st.state === 'modified' && !force) die(st.msg + ' (use --force to build anyway)');
    const slugs = all ? (exists(FEAT) ? fs.readdirSync(FEAT).filter((s) => exists(path.join(featDir(s), 'spec.json'))) : []) : [slugOk(args[0])];
    if (!slugs.length) die(all ? 'no features to build' : 'usage: build <slug> | --base | --all');
    for (const slug of slugs) {
      const dir = featDir(slug); if (!exists(dir)) die(`no feature "${slug}" — run fpk.js new ${slug}`);
      const v = validateFeature(slug);
      const spec = json(path.join(dir, 'spec.json'));
      const r = buildHtml({ feature: dir, out: path.join(dir, slug + '.html'), title: ((spec.meta || {}).name || slug) + ' · preview', forceUnlocked: st.state === 'modified' });
      console.log(`built ${rel(r.out)} (${Math.round(r.bytes / 1024)} KB, base ${st.state})${v.ok ? '' : ` — ${v.issues.length} validation issue(s): run fpk.js validate ${slug}`}`);
    }
  },
  validate(args) {
    const asJson = takeFlag(args, 'json', false), slug = slugOk(args[0]);
    const r = validateFeature(slug);
    if (asJson) console.log(JSON.stringify(r, null, 2));
    else {
      console.log(`${r.ok ? 'OK' : 'FAIL'} ${slug}: ${r.views.length} views, ${r.overlays.length} overlays, ${r.actions.length} actions, ${r.handlers.length} handlers · base ${r.base}`);
      r.issues.forEach((i) => console.log('  ✗ ' + i));
      r.notes.forEach((n) => console.log('  · ' + n));
    }
    process.exit(r.ok ? 0 : 1);
  },
  extract(args) {
    const withBase = takeFlag(args, 'base', false), force = takeFlag(args, 'force', false);
    const file = args[0], slug = slugOk(args[1]); if (!file) die('usage: extract <file.html> <slug> [--base]');
    const html = read(path.resolve(file)), region = (id) => { const r = findRegion(html, id); return r ? r.text.trim() : null; };
    const dir = featDir(slug); if (exists(dir) && !force) die(`${rel(dir)} already exists (use --force)`);
    const views = /<!-- FPK:VIEWS:START -->([\s\S]*?)<!-- FPK:VIEWS:END -->/.exec(html);
    if (!views || region('fpk-spec') == null) die(`${file} is not a Feature Preview Kit file (no views block or fpk-spec)`);
    let spec; try { spec = JSON.parse(region('fpk-spec')); } catch (e) { die('fpk-spec is not valid JSON: ' + e.message); }
    write(path.join(dir, 'views.html'), views[1].trim() + '\n');
    write(path.join(dir, 'spec.json'), JSON.stringify(spec, null, 2) + '\n');
    write(path.join(dir, 'feature.css'), (region('fpk-feature-css') || '') + '\n');
    write(path.join(dir, 'logic.js'), (region('fpk-feature-logic') || STARTER_LOGIC) + '\n');
    console.log(`extracted feature → ${rel(dir)}/`);
    if (withBase) {
      if (exists(path.join(BASE, 'config.json')) && !force) die(`${rel(BASE)} already exists (use --force)`);
      const cfg = region('fpk-config'), tokens = region('fpk-tokens'), baseCss = region('fpk-base-css');
      write(path.join(BASE, 'config.json'), cfg ? JSON.stringify(JSON.parse(cfg), null, 2) + '\n' : read(path.join(ASSETS, 'kit', 'config.json')));
      write(path.join(BASE, 'tokens.css'), (tokens || read(path.join(ASSETS, 'kit', 'tokens.css'))) + '\n');
      write(path.join(BASE, 'base.css'), (baseCss || '') + '\n');
      console.log(`extracted base → ${rel(BASE)}/ (${cfg ? 'with' : 'kit default'} config) — review, then fpk.js lock`);
    }
  },
  list() {
    const st = baseState(); console.log(`base: ${st.state} — ${st.msg}`);
    if (!exists(FEAT)) return;
    for (const s of fs.readdirSync(FEAT).filter((s) => exists(path.join(featDir(s), 'spec.json')))) {
      const spec = json(path.join(featDir(s), 'spec.json')), built = exists(path.join(featDir(s), s + '.html'));
      console.log(`  ${s}  "${(spec.meta || {}).name || s}"  ${built ? 'built' : 'not built'}`);
    }
  },
  info(args) {
    if (args[0]) { const r = validateFeature(slugOk(args[0])); console.log(JSON.stringify({ views: r.views, overlays: r.overlays, actions: r.actions, handlers: r.handlers, base: r.base, ok: r.ok }, null, 2)); return; }
    const st = baseState(); if (st.state === 'missing') die(st.msg);
    const c = json(path.join(BASE, 'config.json'));
    console.log(JSON.stringify({ root: ROOT, base: Object.assign({}, c.base, { lock: st.state }), brand: { product: c.brand && c.brand.product }, devices: (c.devices || []).map((d) => `${d.id}:${d.kind} ${d.width}x${d.height}`), shell: c.shell }, null, 2));
  }
};

const argv = process.argv.slice(2);
const rootFlag = takeFlag(argv, 'root');
const [cmd, ...rest] = argv;
if (!cmds[cmd]) { console.log(read(__filename).split('\n').slice(2, 15).map((l) => l.replace(/^ \* ?/, '')).join('\n')); process.exit(cmd ? 2 : 0); }
paths(findRoot(rootFlag));
try { cmds[cmd](rest); } catch (e) { die(e.message); }
