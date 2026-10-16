(function () {
  'use strict';
  var VERSION = '1.2.0-skill';
  var SOURCE = ''; // the untouched file, captured at the top of boot(); used by export and the base lock
  var STOP = {};

  // ---------- icons (24×24, 2px stroke, currentColor)
  var ICONS = {
    'back': '<path d="M15 18l-6-6 6-6"/>',
    'close': '<path d="M6 6l12 12M18 6L6 18"/>',
    'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'more': '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'minus': '<path d="M5 12h14"/>',
    'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    'chev': '<path d="M9 6l6 6-6 6"/>',
    'chev-down': '<path d="M6 9l6 6 6-6"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'home': '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.5 3.6-5.2 6.5-5.2s5.3 1.7 6.5 5.2"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.7.7 2.9 2.4 3.5 5.2"/>',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    'bell': '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
    'lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    'eye': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    'warn': '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h.01"/>',
    'heart': '<path d="M12 20s-7.5-4.6-9-9.3C2 7.4 4.3 5 7 5c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 2.7 0 5 2.4 4 5.7C19.5 15.4 12 20 12 20z"/>',
    'star': '<path d="M12 3.5l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.9l6-.9z"/>',
    'trash': '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    'edit': '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'cart': '<path d="M3 4h2l2.4 11h10.8L21 8H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
    'filter': '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    'phone': '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    'download': '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    'refresh': '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'moon': '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    'logout': '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    'focus': '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    'rotate': '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 3.5v5h-5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20.5v-5h5"/>'
  };
  function iconSvg(name, cls) {
    var p = ICONS[name] || ICONS.info;
    return '<svg class="fp-icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  var SB_ICONS = '<span class="fp-statusbar-icons" aria-hidden="true">' +
    '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
    '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.3A10.6 10.6 0 0 0 8 .4 10.6 10.6 0 0 0 .5 3.4l1.3 1.3A8.7 8.7 0 0 1 8 2.2zm0 3.6c1.4 0 2.7.5 3.7 1.5L13 6a7 7 0 0 0-10 0l1.3 1.3c1-1 2.3-1.5 3.7-1.5zM8 9.4 6 11.4l2 .6 2-.6z"/></svg>' +
    '<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor"/><rect x="25" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45"/></svg></span>';

  // ---------- device kinds (chrome geometry); the device list itself comes from fpk-config
  var KINDS = {
    ios:     { phone: true,  pad: 12, radius: 62, screenRadius: 50, unit: 'pt' },
    android: { phone: true,  pad: 10, radius: 44, screenRadius: 34, unit: 'dp' },
    tablet:  { phone: false, pad: 20, radius: 44, screenRadius: 24, unit: 'pt' },
    web:     { phone: false, pad: 0,  radius: 0,  screenRadius: 0,  unit: 'px' }
  };
  var DEFAULT_CONFIG = {
    base: { name: 'Feature Preview Kit', version: '0.0.0', status: 'template', sources: [], notes: '' },
    brand: { product: '', logo: '' },
    devices: [
      { id: 'ios', kind: 'ios', label: 'iPhone', model: 'iPhone 15', width: 393, height: 852 },
      { id: 'android', kind: 'android', label: 'Android', model: 'Pixel 8', width: 412, height: 915 },
      { id: 'tablet', kind: 'tablet', label: 'Tablet', model: 'iPad', width: 820, height: 1180, rotatable: true },
      { id: 'web', kind: 'web', label: 'Web', model: 'Desktop', width: 1280, height: 800 }
    ],
    shell: { appBarAlign: { ios: 'center', android: 'leading', tablet: 'center', web: 'leading' }, nav: { phone: 'bottom', tablet: 'bottom', web: 'top' }, tabBarLabels: true, overlay: { phone: 'sheet', wide: 'dialog' }, statusBarTime: '9:41' },
    styleGuide: { principles: [], sections: [] }
  };
  // Regions covered by the base lock, in hash order. Phase B must leave all of them untouched.
  var BASE_REGIONS = ['fpk-config', 'fpk-tokens', 'fpk-token-overrides', 'fpk-components', 'fpk-base-css', 'fpk-page', 'fpk-runtime'];

  // ---------- store
  var S = {
    config: null, spec: null, bodies: { views: {}, overlays: {} }, featureCss: null, tokenOverrides: { light: {}, dark: {} },
    state: {}, errors: {}, stack: [], overlay: null, toast: null,
    theme: 'light', log: [], configDirty: false, baseDirty: false, relock: false, tplOpen: { views: {}, overlays: {} }, busy: 0,
    ui: { tab: 'prototype', devices: [], scale: 'fit', orientation: 'portrait', solo: null }
  };
  var HANDLERS = {};
  var frames = {};
  var listeners = [];

  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function current() { return S.stack[S.stack.length - 1]; }
  function devices() { return S.config.devices; }
  function deviceIds() { return devices().map(function (d) { return d.id; }); }
  function dev(id) { return devices().filter(function (d) { return d.id === id; })[0]; }
  function isPhone(d) { return KINDS[d.kind].phone; }
  function product() { return (S.spec && S.spec.meta && S.spec.meta.product) || S.config.brand.product || ''; }

  function log(type, detail, level) {
    var entry = { t: new Date().toISOString().slice(11, 23), type: type, detail: detail, level: level || 'i' };
    S.log.push(entry); if (S.log.length > 300) S.log.shift();
    if (level === 'w') console.warn('[FPK]', type, detail); else if (level === 'e') console.error('[FPK]', type, detail);
    listeners.forEach(function (fn) { try { fn(entry); } catch (e) {} });
    scheduleInspector();
  }

  // Track running action chains so fpk_walk can wait until the prototype is idle.
  function track(p) { S.busy++; return Promise.resolve(p).then(function (r) { S.busy--; return r; }, function (e) { S.busy--; throw e; }); }
  async function idle(maxMs) { var t0 = Date.now(); await sleep(0); while (S.busy > 0 && Date.now() - t0 < (maxMs || 8000)) await sleep(25); await new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }

  // ---------- base lock (same algorithm as fpk.js: FNV-1a 32 over UTF-8 of the base regions)
  // Region lookup ignores HTML comments (masked to equal length) so tag-like text in comments never matches.
  function maskComments(html) { return html.replace(/<!--[\s\S]*?-->/g, function (m) { return ' '.repeat(m.length); }); }
  function findRegion(html, id) {
    var m = new RegExp('(<(style|script)\\b[^>]*\\bid="' + id + '"[^>]*>)([\\s\\S]*?)(</\\2>)', 'i').exec(maskComments(html));
    if (!m) return null;
    var openEnd = m.index + m[1].length, closeStart = m.index + m[0].length - m[4].length;
    return { openEnd: openEnd, closeStart: closeStart, text: html.slice(openEnd, closeStart) };
  }
  function regionText(html, id) { var r = findRegion(html, id); return r ? r.text : null; }
  function fnv1a(str) {
    var bytes = new TextEncoder().encode(str), h = 0x811c9dc5;
    for (var i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  function baseHash(html) {
    return 'fnv1a32:' + fnv1a(BASE_REGIONS.map(function (id) { var t = regionText(html, id); return id + '\n' + (t == null ? '' : t.replace(/\r\n/g, '\n').trim()); }).join('\n\u0000\n'));
  }
  function lockValue(html) { var m = /<meta name="fpk-base-lock" content="([^"]*)"/.exec(html); return m ? m[1] : 'unlocked'; }
  function baseStatus() {
    var expected = lockValue(SOURCE), actual = baseHash(SOURCE), b = S.config.base || {};
    var state = expected === 'unlocked' ? 'unlocked' : (expected === actual ? 'locked' : 'modified');
    if (state !== 'modified' && S.baseDirty) state = state === 'unlocked' ? 'unlocked-edited' : 'edited';
    return { state: state, name: b.name, version: b.version, expected: expected, actual: actual,
      message: { locked: 'Base "' + b.name + '" ' + b.version + ' is intact.', unlocked: 'Base not locked yet: finish Phase A and run `fpk.js lock`.', 'unlocked-edited': 'Unlocked base with runtime edits (copy them into .agentic_coding/base, then lock).',
        edited: 'Base edited at runtime (Phase A tools). Copy the changes into .agentic_coding/base and run `fpk.js lock`.', modified: 'This built file was edited after it was built. Edit the sources in .agentic_coding/ and rebuild with `fpk.js build` instead.' }[state] };
  }

  // ---------- paths & expressions
  function splitPath(p) { return String(p).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean); }
  function getPath(obj, p) { var parts = splitPath(p), o = obj; for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; } return o; }
  function setPath(obj, p, v) {
    var parts = splitPath(p), o = obj;
    for (var i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null || typeof o[parts[i]] !== 'object') o[parts[i]] = /^\d+$/.test(parts[i + 1]) ? [] : {}; o = o[parts[i]]; }
    o[parts[parts.length - 1]] = v;
  }
  function resolvePath(p, scope) {
    var parts = splitPath(p), head = parts[0], rest = parts.slice(1).join('.');
    if (scope && Object.prototype.hasOwnProperty.call(scope, head)) return getPath(scope, p);
    if (head === 'state') return getPath(S.state, rest);
    if (head === 'errors') return getPath(S.errors, rest);
    if (head === 'meta') return getPath(Object.assign({ product: product() }, S.spec.meta || {}), rest);
    if (head === 'brand') return getPath(S.config.brand || {}, rest);
    if (head === 'view') return parts.length === 1 ? current() : getPath(S.spec.views[current()] || {}, rest);
    if (head === 'platform') return scope && scope.platform;
    if (head === 'device') return scope && scope.device;
    return getPath(S.state, p);
  }
  function literal(t) {
    if (/^'.*'$|^".*"$/.test(t)) return { v: t.slice(1, -1) };
    if (/^-?\d+(\.\d+)?$/.test(t)) return { v: Number(t) };
    if (t === 'true') return { v: true }; if (t === 'false') return { v: false };
    if (t === 'null') return { v: null }; if (t === 'undefined') return { v: undefined };
    return null;
  }
  function truthy(v) { return Array.isArray(v) ? v.length > 0 : !!v; }
  function evalExpr(expr, scope) {
    expr = String(expr == null ? '' : expr).trim();
    if (!expr) return undefined;
    var i, parts, v;
    if (expr.indexOf('||') > -1) { parts = expr.split('||'); for (i = 0; i < parts.length; i++) { v = evalExpr(parts[i], scope); if (truthy(v) || i === parts.length - 1) return v; } }
    if (expr.indexOf('&&') > -1) { parts = expr.split('&&'); for (i = 0; i < parts.length; i++) { v = evalExpr(parts[i], scope); if (!truthy(v) || i === parts.length - 1) return v; } }
    var m = /^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/.exec(expr);
    if (m) {
      var a = evalExpr(m[1], scope), b = evalExpr(m[3], scope);
      switch (m[2]) { case '==': case '===': return a == b || String(a) === String(b); case '!=': case '!==': return !(a == b || String(a) === String(b)); case '>': return a > b; case '<': return a < b; case '>=': return a >= b; case '<=': return a <= b; }
    }
    if (expr[0] === '!') return !truthy(evalExpr(expr.slice(1), scope));
    var lit = literal(expr); if (lit) return lit.v;
    return resolvePath(expr, scope);
  }
  function interp(tpl, scope) {
    return String(tpl).replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, e) { var v = evalExpr(e, scope); return v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v)); });
  }
  function resolveValue(v, scope) {
    if (typeof v === 'string') { var m = /^\{\{\s*([^}]+?)\s*\}\}$/.exec(v); if (m) return clone(evalExpr(m[1], scope)); return v.indexOf('{{') > -1 ? interp(v, scope) : v; }
    if (Array.isArray(v)) return v.map(function (x) { return resolveValue(x, scope); });
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function (k) { o[k] = resolveValue(v[k], scope); }); return o; }
    return v;
  }

  // ---------- template compiler (per frame; collects bindings)
  function onlyMatches(list, f) {
    var d = f.d, tags = [d.id, d.kind, isPhone(d) ? 'phone' : 'wide'];
    return list.split(/[\s,]+/).filter(Boolean).some(function (t) { return tags.indexOf(t) > -1; });
  }
  function compile(html, scope, f) {
    var t = document.createElement('template');
    t.innerHTML = html;
    processChildren(t.content, scope, f);
    return t.content;
  }
  function processChildren(node, scope, f) { Array.prototype.slice.call(node.childNodes).forEach(function (c) { processNode(c, scope, f); }); }
  function processNode(node, scope, f) {
    if (node.nodeType === 3) { if (node.nodeValue.indexOf('{{') > -1) f.bindings.push({ k: 'text', node: node, tpl: node.nodeValue, scope: scope }); return; }
    if (node.nodeType !== 1) return;
    var el = node;
    if (el.hasAttribute('data-fp-only') && !onlyMatches(el.getAttribute('data-fp-only'), f)) { el.remove(); return; }
    if (el.hasAttribute('data-fp-icon')) {
      var holder = document.createElement('span'); holder.innerHTML = iconSvg(el.getAttribute('data-fp-icon'), el.getAttribute('class'));
      var svg = holder.firstChild; if (el.hasAttribute('data-fp-if')) svg.setAttribute('data-fp-if', el.getAttribute('data-fp-if'));
      el.replaceWith(svg); el = svg;
    }
    if (el.id) el.id = f.id + '-' + el.id;
    if (el.tagName === 'LABEL' && el.htmlFor) el.htmlFor = f.id + '-' + el.htmlFor;
    Array.prototype.slice.call(el.attributes).forEach(function (a) {
      if (a.value.indexOf('{{') > -1 && a.name !== 'data-fp-each') f.bindings.push({ k: 'attr', el: el, name: a.name, tpl: a.value, scope: scope });
    });
    if (el.hasAttribute('data-fp-if')) f.bindings.push({ k: 'if', el: el, expr: el.getAttribute('data-fp-if'), scope: scope });
    if (el.hasAttribute('data-fp-bind')) f.bindings.push({ k: 'value', el: el, path: el.getAttribute('data-fp-bind'), scope: scope });
    if (el.hasAttribute('data-fp-error')) f.bindings.push({ k: 'error', el: el, field: el.getAttribute('data-fp-error') });
    if (el.hasAttribute('data-fp-disabled')) f.bindings.push({ k: 'disabled', el: el, expr: el.getAttribute('data-fp-disabled'), scope: scope });
    if (el.hasAttribute('data-fp-class')) f.bindings.push({ k: 'class', el: el, expr: el.getAttribute('data-fp-class'), scope: scope });
    if (el.hasAttribute('data-fp-text')) f.bindings.push({ k: 'textexpr', el: el, expr: el.getAttribute('data-fp-text'), scope: scope });
    if (el.hasAttribute('data-fp-each')) {
      var spec = el.getAttribute('data-fp-each').split(/\s+as\s+/), path = spec[0].trim(), alias = (spec[1] || 'item').trim();
      var tplHtml = el.innerHTML; el.innerHTML = '';
      var arr = evalExpr(path, scope); if (!Array.isArray(arr)) arr = [];
      arr.forEach(function (item, i) {
        var sc = Object.assign({}, scope); sc[alias] = item; sc.index = i;
        el.appendChild(compile(tplHtml, sc, f));
      });
      return;
    }
    processChildren(el.tagName === 'TEMPLATE' ? el.content : el, scope, f);
  }
  function applyBindings(f, skipEl) {
    f.bindings.forEach(function (b) {
      switch (b.k) {
        case 'text': b.node.nodeValue = interp(b.tpl, b.scope); break;
        case 'attr': b.el.setAttribute(b.name, interp(b.tpl, b.scope)); break;
        case 'if': b.el.hidden = !truthy(evalExpr(b.expr, b.scope)); break;
        case 'textexpr': var tv = evalExpr(b.expr, b.scope); b.el.textContent = tv == null ? '' : tv; break;
        case 'disabled': b.el.disabled = truthy(evalExpr(b.expr, b.scope)); break;
        case 'error': var msg = S.errors[b.field]; b.el.textContent = msg || ''; b.el.hidden = !msg; break;
        case 'class':
          b.expr.split(';').forEach(function (pair) { var i = pair.indexOf(':'); if (i < 0) return; b.el.classList.toggle(pair.slice(0, i).trim(), truthy(evalExpr(pair.slice(i + 1), b.scope))); });
          break;
        case 'value':
          var el = b.el, v = resolvePath(b.path, b.scope);
          if (S.errors[b.path]) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
          if (el === skipEl) break;
          if (el.type === 'checkbox') el.checked = !!v;
          else if (el.type === 'radio') el.checked = String(v) === el.value;
          else if (el.value !== (v == null ? '' : String(v))) el.value = v == null ? '' : v;
          break;
      }
    });
  }

  // ---------- frames
  function rotated(d) { return !!d.rotatable && S.ui.orientation === 'landscape'; }
  function screenSize(d) {
    var w = d.width, h = d.height; if (rotated(d)) { var t = w; w = h; h = t; }
    return d.kind === 'web' ? { w: w, h: h - 44 } : { w: w, h: h };
  }
  function dims(d) {
    var s = screenSize(d), k = KINDS[d.kind];
    return d.kind === 'web' ? { w: s.w + 2, h: s.h + 44 + 2 } : { w: s.w + 2 * k.pad, h: s.h + 2 * k.pad };
  }
  function frameMarkup(d) {
    var mount = '<div class="fpk-mount"></div>', t = esc(S.config.shell.statusBarTime || '9:41'), attrs = ' data-platform="' + d.kind + '" data-device="' + esc(d.id) + '"';
    if (d.kind === 'ios') return '<div class="fp-device fp-iphone"><div class="fp-screen"' + attrs + '><div class="fp-island"></div><div class="fp-statusbar"><span>' + t + '</span>' + SB_ICONS + '</div>' + mount + '<div class="fp-home-indicator"></div></div></div>';
    if (d.kind === 'android') return '<div class="fp-device fp-android"><div class="fp-screen"' + attrs + '><div class="fp-punch"></div><div class="fp-statusbar"><span>' + t + '</span>' + SB_ICONS + '</div>' + mount + '<div class="fp-android-nav"></div></div></div>';
    if (d.kind === 'tablet') return '<div class="fp-device fp-tablet"><div class="fp-screen"' + attrs + '><div class="fp-statusbar"><span>' + t + '</span>' + SB_ICONS + '</div>' + mount + '<div class="fp-home-indicator"></div></div></div>';
    return '<div class="fp-browser"><div class="fp-browser-bar"><span class="fp-browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="fp-browser-url">' + iconSvg('lock') + '<span class="fpk-url"></span></span><span style="width:52px"></span></div><div class="fp-screen"' + attrs + '>' + mount + '</div></div>';
  }
  function buildStage() {
    var stage = $('#fpk-stage'); stage.innerHTML = ''; frames = {};
    devices().forEach(function (d) {
      var card = document.createElement('article'); card.className = 'fpk-card'; card.id = 'fpk-device-' + d.id; card.setAttribute('data-device', d.id);
      card.innerHTML = '<div class="fpk-card-head"><div><strong>' + esc(d.label || d.id) + '</strong><span class="fpk-sub"></span></div><div class="fp-row" style="gap:var(--space-2)">' +
        (d.rotatable ? '<button class="fpk-iconbtn" data-rotate>' + iconSvg('rotate') + 'Rotate</button>' : '') +
        '<button class="fpk-iconbtn" data-solo>' + iconSvg('focus') + '<span>Focus</span></button></div></div>' +
        '<div class="fp-fit"><div class="fpk-scaler">' + frameMarkup(d) + '</div></div>';
      stage.appendChild(card);
      var f = frames[d.id] = { id: d.id, d: d, card: card, screen: $('.fp-screen', card), shell: $('.fp-device, .fp-browser', card), mount: $('.fpk-mount', card), fit: $('.fp-fit', card), scaler: $('.fpk-scaler', card), bindings: [], lastView: null };
      wireScreen(f);
      $('[data-solo]', card).addEventListener('click', function () { S.ui.solo = S.ui.solo === d.id ? null : d.id; layout(); });
      var rot = $('[data-rotate]', card);
      if (rot) rot.addEventListener('click', function () { setPreview({ orientation: S.ui.orientation === 'portrait' ? 'landscape' : 'portrait' }); });
    });
  }
  function buildChips() {
    var chips = $('#fpk-device-chips'); $all('.fpk-chip', chips).forEach(function (c) { c.remove(); });
    devices().forEach(function (d) {
      var b = document.createElement('button'); b.className = 'fpk-chip'; b.setAttribute('data-device', d.id); b.textContent = d.label || d.id;
      b.addEventListener('click', function () {
        var on = S.ui.devices.indexOf(d.id) > -1; if (on && S.ui.devices.length === 1) return;
        S.ui.devices = on ? S.ui.devices.filter(function (x) { return x !== d.id; }) : deviceIds().filter(function (x) { return x === d.id || S.ui.devices.indexOf(x) > -1; });
        S.ui.solo = null; layout();
      });
      chips.appendChild(b);
    });
  }
  function sizeFrame(f) {
    var d = f.d, k = KINDS[d.kind], s = screenSize(d), dm = dims(d);
    f.shell.style.width = dm.w + 'px';
    if (d.kind !== 'web') { f.shell.style.height = dm.h + 'px'; f.shell.style.padding = k.pad + 'px'; f.shell.style.borderRadius = k.radius + 'px'; f.screen.style.borderRadius = k.screenRadius + 'px'; }
    f.screen.style.width = s.w + 'px'; f.screen.style.height = s.h + 'px';
    $('.fpk-sub', f.card).textContent = (d.model ? d.model + ' · ' : '') + (d.kind === 'web' ? s.w + '×' + (s.h + 44) : s.w + '×' + s.h) + ' ' + k.unit;
  }
  function layout() {
    var stage = $('#fpk-stage'); if (!stage) return;
    var visible = S.ui.solo ? [S.ui.solo] : deviceIds().filter(function (id) { return S.ui.devices.indexOf(id) > -1; });
    var cs = getComputedStyle(stage), avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), gap = parseFloat(cs.columnGap) || 32;
    var s;
    if (S.ui.scale !== 'fit') s = Number(S.ui.scale) || 1;
    else if (S.ui.solo) { var sd = dims(dev(S.ui.solo)); s = Math.min(1, avail / sd.w, Math.max(320, window.innerHeight - 190) / sd.h); }
    else {
      var row = visible.filter(function (id) { return dev(id).kind !== 'web'; }), webs = visible.filter(function (id) { return dev(id).kind === 'web'; });
      var sumW = row.reduce(function (a, id) { return a + dims(dev(id)).w; }, 0);
      s = 1;
      if (row.length) s = Math.min(s, (avail - gap * (row.length - 1)) / sumW);
      webs.forEach(function (id) { s = Math.min(s, avail / dims(dev(id)).w); });
      if (visible.length === 1) s = Math.min(1, avail / dims(dev(visible[0])).w);
      s = Math.max(0.25, s);
    }
    devices().forEach(function (d) {
      var f = frames[d.id]; if (!f) return;
      var on = visible.indexOf(d.id) > -1;
      sizeFrame(f);
      var dm = dims(d);
      f.card.hidden = !on;
      $('[data-solo] span', f.card).textContent = S.ui.solo === d.id ? 'Show all' : 'Focus';
      f.fit.style.width = Math.round(dm.w * s) + 'px'; f.fit.style.height = Math.round(dm.h * s) + 'px';
      f.scaler.style.transform = 'scale(' + s + ')';
    });
    S.ui.appliedScale = s;
    syncToolbar();
  }

  // ---------- render
  var renderQueued = false;
  function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(function () { renderQueued = false; renderAll(); }); }
  function renderAll(focusInfo) {
    var active = document.activeElement, fi = focusInfo;
    if (!fi && active && active.closest && active.closest('.fp-screen') && active.hasAttribute('data-fp-bind')) {
      fi = { dev: active.closest('.fp-screen').getAttribute('data-device'), bind: active.getAttribute('data-fp-bind'), start: active.selectionStart, end: active.selectionEnd };
    }
    Object.keys(frames).forEach(function (id) { renderFrame(frames[id]); });
    if (fi) {
      var el = $('.fp-screen[data-device="' + fi.dev + '"] [data-fp-bind="' + fi.bind + '"]');
      if (el) { el.focus({ preventScroll: true }); try { if (fi.start != null) el.setSelectionRange(fi.start, fi.end); } catch (e) {} }
    }
    syncToolbar(); scheduleInspector();
    document.documentElement.setAttribute('data-fpk-view', current() || '');
  }
  function navMode(d) {
    var n = S.config.shell.nav || {};
    if (d.kind === 'web') return n.web || 'top';
    if (d.kind === 'tablet') return n.tablet || 'bottom';
    return n.phone || 'bottom';
  }
  function brandHtml() {
    var logo = S.config.brand.logo || '', h = '';
    if (/^\s*<svg[\s>]/i.test(logo)) h += '<span class="fpk-brand-logo" aria-hidden="true">' + logo + '</span>';
    else if (/^(data:image\/|https?:\/\/|\.{0,2}\/)/.test(logo)) h += '<span class="fpk-brand-logo"><img src="' + esc(logo) + '" alt=""></span>';
    return h + '<span>' + esc(product()) + '</span>';
  }
  function navItemsHtml(tabBar, cls, withIcons) {
    return tabBar.items.map(function (it) {
      return '<button' + (cls ? ' class="' + cls + '"' : '') + ' type="button" data-fp-tab="' + esc(it.view) + '"' + (S.stack[0] === it.view ? ' aria-current="page"' : '') + ' aria-label="' + esc(it.label) + '">' + (withIcons ? iconSvg(it.icon || 'home') : '') + '<span class="fpk-tab-label">' + esc(it.label) + '</span></button>';
    }).join('');
  }
  function renderFrame(f) {
    var d = f.d, kind = d.kind, viewId = current(), view = S.spec.views[viewId] || {}, wide = !isPhone(d), mode = navMode(d);
    var oldBody = $('.fp-screen-body', f.mount), keepScroll = f.lastView === viewId && oldBody ? oldBody.scrollTop : 0;
    f.bindings = []; f.mount.innerHTML = ''; f.mount.className = 'fpk-mount';
    var scope = { platform: kind, device: d.id };
    var ab = view.appBar === false ? null : Object.assign({ back: 'auto' }, view.appBar || {});
    var tabBar = S.spec.tabBar && view.tabBar !== false && (S.spec.tabBar.items || []).length ? S.spec.tabBar : null;
    var align = (S.config.shell.appBarAlign || {})[kind] || 'center';
    var host = f.mount;

    // sidebar navigation (tablet / web, when the shell says so and the feature has nav items)
    if (tabBar && mode === 'sidebar') {
      f.mount.classList.add('has-sidebar');
      f.mount.appendChild(compile('<nav class="fpk-sidebar"><div class="fpk-sidebar-brand">' + brandHtml() + '</div>' + navItemsHtml(tabBar, '', true) + '</nav>', scope, f));
      host = document.createElement('div'); host.className = 'fpk-main'; f.mount.appendChild(host);
    }

    // app bar / web header
    if (kind === 'web') {
      var h = '';
      if (ab && showBack(ab)) h += '<button class="fp-icon-btn" type="button" data-fp-back aria-label="Back">' + iconSvg('back') + '</button>';
      if (mode !== 'sidebar' || !tabBar) h += '<span class="fpk-webbar-brand">' + brandHtml() + '</span>';
      if (tabBar && mode === 'top') h += '<nav class="fpk-webnav">' + navItemsHtml(tabBar, '', false) + '</nav>';
      else if (ab) h += '<h1 class="fp-appbar-title">' + esc(ab.title || view.title || '') + '</h1>';
      h += '<span class="fp-spacer"></span>' + actionButtons(ab);
      var wb = document.createElement('div'); wb.className = 'fp-appbar fpk-webbar'; wb.setAttribute('data-align', 'leading');
      wb.appendChild(compile(h, scope, f)); host.appendChild(wb);
    } else if (ab) {
      var bar = document.createElement('div'); bar.className = 'fp-appbar'; bar.setAttribute('data-platform', kind); bar.setAttribute('data-align', align);
      var left = showBack(ab) ? '<button class="fp-icon-btn" type="button" data-fp-back aria-label="Back">' + iconSvg(ab.backIcon || 'back') + '</button>' : (align === 'leading' ? '<span style="width:8px"></span>' : '<span class="fp-appbar-spacer"></span>');
      var acts = actionButtons(ab);
      bar.appendChild(compile(left + '<h1 class="fp-appbar-title">' + esc(ab.title || view.title || '') + '</h1>' + (acts || (align === 'leading' ? '' : '<span class="fp-appbar-spacer"></span>')), scope, f));
      host.appendChild(bar);
    }

    // body
    var body = document.createElement('div'); body.className = 'fp-screen-body';
    var v = document.createElement('div'); v.className = 'fp-view'; v.setAttribute('data-layout', view.layout || 'card'); v.setAttribute('data-view', viewId || '');
    var inner = document.createElement('div'); inner.className = 'fp-view-inner';
    var src = S.bodies.views[viewId];
    if (src == null) src = '<div class="fp-alert fp-alert-warning"><i data-fp-icon="warn"></i><div><strong>Missing template</strong>No &lt;template data-fpk-view="' + esc(viewId) + '"&gt; found.</div></div>';
    inner.appendChild(compile(src, scope, f));
    v.appendChild(inner); body.appendChild(v); host.appendChild(body);

    // bottom tab bar
    var bottomBar = tabBar && kind !== 'web' && mode === 'bottom';
    if (bottomBar) host.appendChild(compile('<nav class="fp-tabbar' + (S.config.shell.tabBarLabels === false ? ' no-labels' : '') + '">' + navItemsHtml(tabBar, 'fp-tabbar-item', true) + '</nav>', scope, f));

    // overlay
    $all(':scope > [data-fpk-scrim]', f.screen).forEach(function (n) { n.remove(); });
    if (S.overlay) {
      var ov = (S.spec.overlays || {})[S.overlay] || {}, om = S.config.shell.overlay || {};
      var type = ov.type && ov.type !== 'auto' ? ov.type : (wide ? (om.wide || 'dialog') : (om.phone || 'sheet'));
      var scrim = document.createElement('div'); scrim.className = 'fp-scrim' + (type === 'dialog' ? ' is-center' : ''); scrim.setAttribute('data-fpk-scrim', '');
      var panel = document.createElement('div'); panel.className = type === 'dialog' ? 'fp-dialog' : 'fp-sheet'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
      if (type !== 'dialog') panel.innerHTML = '<div class="fp-sheet-grip"></div>';
      var ob = document.createElement('div'); ob.className = 'fpk-overlay-body';
      ob.appendChild(compile(S.bodies.overlays[S.overlay] || '<p>Missing overlay template "' + esc(S.overlay) + '"</p>', scope, f));
      panel.appendChild(ob); scrim.appendChild(panel); f.screen.appendChild(scrim);
    }

    // toast
    $all(':scope > .fpk-toast-layer', f.screen).forEach(function (n) { n.remove(); });
    if (S.toast) {
      var tl = document.createElement('div'); tl.className = 'fpk-toast-layer'; tl.innerHTML = '<div class="fp-toast" role="status">' + esc(S.toast.text) + '</div>';
      var bottom = kind === 'web' ? 32 : kind === 'android' ? 40 : 44;
      if (bottomBar) bottom += 60;
      tl.style.bottom = bottom + 'px';
      f.screen.appendChild(tl);
    }

    // url
    if (kind === 'web') {
      var route = view.route != null ? interp(view.route, scope) : '/' + (viewId || '');
      $('.fpk-url', f.card).innerHTML = esc((S.spec.meta || {}).baseUrl || 'app.example.com') + '<b>' + esc(route) + '</b>';
    }

    applyBindings(f);
    if (keepScroll) body.scrollTop = keepScroll;
    f.lastView = viewId;
  }
  function showBack(ab) { return ab.back === true || (ab.back === 'auto' && S.stack.length > 1); }
  function actionButtons(ab) {
    if (!ab || !ab.actions || !ab.actions.length) return '';
    return ab.actions.map(function (a) {
      var attrs = '';
      if (a.action) attrs += ' data-fp-action="' + esc(a.action) + '"';
      if (a.nav) attrs += ' data-fp-nav="' + esc(a.nav) + '"';
      if (a.overlay) attrs += ' data-fp-overlay="' + esc(a.overlay) + '"';
      if (a.toast) attrs += ' data-fp-toast="' + esc(a.toast) + '"';
      return '<button class="fp-icon-btn" type="button" aria-label="' + esc(a.label || a.icon) + '"' + attrs + '>' + iconSvg(a.icon || 'more') + '</button>';
    }).join('');
  }
  function refreshBindings(skipEl) { Object.keys(frames).forEach(function (id) { applyBindings(frames[id], skipEl); }); scheduleInspector(); }

  // ---------- interaction
  var TRIGGER = '[data-fp-nav],[data-fp-back],[data-fp-action],[data-fp-overlay],[data-fp-close],[data-fp-toast],[data-fp-set],[data-fp-toggle],[data-fp-tab],[data-fp-reset],[data-fp-replace]';
  function wireScreen(f) {
    var sc = function () { return { platform: f.d.kind, device: f.id }; };
    f.screen.addEventListener('click', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-fpk-scrim')) { log('tap', { device: f.id, target: 'scrim' }); closeOverlay(); return; }
      var t = e.target.closest(TRIGGER);
      if (!t || !f.screen.contains(t) || t.disabled) return;
      if (t.tagName === 'A' || (t.type === 'submit' && t.form)) e.preventDefault();
      log('tap', { device: f.id, target: describeEl(t) });
      track(runSteps(stepsFor(t), { scope: sc() }));
    });
    f.screen.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = e.target.getAttribute('data-fp-submit');
      log('submit', { device: f.id, action: a });
      if (a) track(runSteps([{ run: a }], { scope: sc() }));
    });
    function onInput(e) {
      var el = e.target, path = el.getAttribute && el.getAttribute('data-fp-bind'); if (!path) return;
      var v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.type === 'radio' && !el.checked) return;
      if (el.type === 'number' || el.type === 'range') v = el.value === '' ? '' : Number(el.value);
      setPath(S.state, path, v);
      if (S.errors[path]) delete S.errors[path];
      if (el.hasAttribute('data-fp-live')) renderAll(); else refreshBindings(el);
    }
    f.screen.addEventListener('input', onInput);
    f.screen.addEventListener('change', onInput);
  }
  function parseSet(str) {
    var out = {};
    str.split(';').forEach(function (pair) {
      var i = pair.indexOf('='); if (i < 0) return;
      var k = pair.slice(0, i).trim(), raw = pair.slice(i + 1).trim(), lit = literal(raw), v;
      if (lit) v = lit.v; else { try { v = JSON.parse(raw); } catch (e) { v = raw; } }
      out[k] = v;
    });
    return out;
  }
  function stepsFor(t) {
    var s = [], d = t.dataset;
    if (d.fpSet) s.push({ set: parseSet(d.fpSet) });
    if (d.fpToggle) s.push({ toggle: d.fpToggle });
    if (d.fpAction) s.push({ run: d.fpAction });
    if ('fpClose' in d) s.push({ close: true });
    if (d.fpOverlay) s.push({ overlay: d.fpOverlay });
    if ('fpBack' in d) s.push({ back: true });
    if (d.fpNav) s.push({ navigate: d.fpNav });
    if (d.fpReplace) s.push({ navigate: { view: d.fpReplace, replace: true } });
    if (d.fpTab) s.push({ tab: d.fpTab });
    if ('fpReset' in d) s.push({ reset: true });
    if (d.fpToast) s.push({ toast: d.fpToast });
    return s;
  }
  function visibleText(el) {
    var c = el.cloneNode(true);
    $all('[hidden]', c).forEach(function (n) { n.remove(); });
    $all('*', c).forEach(function (n) { n.after(' '); });
    return (c.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function describeEl(el) { return el.tagName.toLowerCase() + ' "' + (el.getAttribute('aria-label') || visibleText(el)).slice(0, 60) + '"'; }

  // ---------- action DSL
  var RULES = {
    required: function (v) { return !(v == null || v === '' || v === false || (Array.isArray(v) && !v.length)) || 'This field is required.'; },
    email: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.'; },
    minLength: function (v, n) { return !v || String(v).length >= +n || 'Use at least ' + n + ' characters.'; },
    maxLength: function (v, n) { return !v || String(v).length <= +n || 'Use ' + n + ' characters or fewer.'; },
    digits: function (v, n) { return !v || new RegExp('^\\d{' + n + '}$').test(v) || 'Enter ' + n + ' digits.'; },
    number: function (v) { return v === '' || v == null || !isNaN(Number(v)) || 'Enter a number.'; },
    min: function (v, n) { return v === '' || v == null || Number(v) >= +n || 'Must be at least ' + n + '.'; },
    max: function (v, n) { return v === '' || v == null || Number(v) <= +n || 'Must be ' + n + ' or less.'; },
    pattern: function (v, re) { return !v || new RegExp(re).test(v) || 'Check the format.'; },
    equals: function (v, path) { return v === resolvePath(path) || "Values don't match."; },
    checked: function (v) { return v === true || 'Please confirm to continue.'; }
  };
  function validate(map) {
    var errs = {};
    Object.keys(map).forEach(function (field) {
      var v = resolvePath(field);
      [].concat(map[field]).some(function (r) {
        var rule, arg, msg;
        if (typeof r === 'object') { rule = r.rule; arg = r.value; msg = r.message; }
        else { var bar = r.indexOf('|'); if (bar > -1) { msg = r.slice(bar + 1); r = r.slice(0, bar); } var c = r.indexOf(':'); rule = c > -1 ? r.slice(0, c) : r; arg = c > -1 ? r.slice(c + 1) : undefined; }
        var fn = RULES[rule]; if (!fn) { log('validate', 'Unknown rule "' + rule + '"', 'w'); return false; }
        var res = fn(v, arg); if (res !== true) { errs[field] = msg || res; return true; }
        return false;
      });
    });
    return errs;
  }
  function ctxApi(ctx) {
    return {
      state: S.state, errors: S.errors, platform: ctx.scope && ctx.scope.platform, device: ctx.scope && ctx.scope.device,
      get: function (p) { return resolvePath(p, ctx.scope); },
      set: function (p, v) { if (typeof p === 'object') Object.keys(p).forEach(function (k) { setPath(S.state, k, p[k]); }); else setPath(S.state, p, v); scheduleRender(); },
      navigate: function (v, o) { navigate(v, o && o.replace); }, back: back, reset: reset,
      openOverlay: openOverlay, closeOverlay: closeOverlay, toast: toast,
      setError: function (k, m) { S.errors[k] = m; scheduleRender(); }, clearErrors: function () { S.errors = {}; scheduleRender(); },
      run: function (steps) { return runSteps(steps, ctx); }, wait: sleep,
      log: function (d) { log('handler', d); }
    };
  }
  async function runSteps(steps, ctx) {
    ctx = ctx || {};
    steps = [].concat(steps || []);
    for (var i = 0; i < steps.length; i++) {
      var r;
      try { r = await runStep(steps[i], ctx); } catch (e) { log('error', e.message, 'e'); return STOP; }
      if (r === STOP) return STOP;
    }
  }
  async function runStep(step, ctx) {
    if (!step || typeof step !== 'object') return;
    var sc = ctx.scope;
    if ('if' in step) return runSteps(truthy(evalExpr(step['if'], sc)) ? step.then : step['else'], ctx);
    var k = Object.keys(step)[0], a = step[k];
    switch (k) {
      case 'set': Object.keys(a).forEach(function (p) { setPath(S.state, p, resolveValue(a[p], sc)); }); scheduleRender(); break;
      case 'toggle': [].concat(a).forEach(function (p) { setPath(S.state, p, !resolvePath(p, sc)); }); scheduleRender(); break;
      case 'increment': var ip = typeof a === 'string' ? a : a.path; setPath(S.state, ip, (Number(resolvePath(ip)) || 0) + (a.by || 1)); scheduleRender(); break;
      case 'decrement': var dp = typeof a === 'string' ? a : a.path; setPath(S.state, dp, (Number(resolvePath(dp)) || 0) - (a.by || 1)); scheduleRender(); break;
      case 'push': var arr = resolvePath(a.path); if (!Array.isArray(arr)) { arr = []; setPath(S.state, a.path, arr); } arr.push(resolveValue(a.value, sc)); scheduleRender(); break;
      case 'remove':
        var list = resolvePath(a.path); if (!Array.isArray(list)) break;
        if (a.index != null) list.splice(Number(resolveValue(a.index, sc)), 1);
        else if (a.where) { var w = resolveValue(a.where, sc); setPath(S.state, a.path, list.filter(function (it) { return !Object.keys(w).every(function (key) { return String(it[key]) === String(w[key]); }); })); }
        scheduleRender(); break;
      case 'validate':
        var errs = validate(a);
        Object.keys(a).forEach(function (f) { delete S.errors[f]; });
        Object.assign(S.errors, errs); scheduleRender();
        if (Object.keys(errs).length) { log('validate', errs, 'w'); return STOP; }
        break;
      case 'error': Object.keys(a).forEach(function (f) { S.errors[f] = interp(a[f], sc); }); scheduleRender(); log('error-set', a); return STOP;
      case 'clearErrors': S.errors = {}; scheduleRender(); break;
      case 'navigate': var nv = resolveValue(a, sc); if (typeof nv === 'object') navigate(nv.view, nv.replace); else navigate(nv); break;
      case 'replace': navigate(resolveValue(a, sc), true); break;
      case 'back': back(); break;
      case 'reset': reset(); break;
      case 'tab': switchTab(resolveValue(a, sc)); break;
      case 'overlay': openOverlay(resolveValue(a, sc)); break;
      case 'close': closeOverlay(); break;
      case 'toast': toast(interp(a, sc)); break;
      case 'wait': await sleep(Number(a) || 0); break;
      case 'log': log('log', resolveValue(a, sc)); break;
      case 'run': case 'call':
        var name = resolveValue(a, sc);
        if (S.spec.actions && S.spec.actions[name]) { log('action', name); return runSteps(S.spec.actions[name], ctx); }
        if (HANDLERS[name]) { log('handler', name); var hr = await HANDLERS[name](ctxApi(ctx)); scheduleRender(); if (hr === false) return STOP; break; }
        log('action', 'Unknown action "' + name + '"', 'w'); return STOP;
      default: log('step', 'Unknown step "' + k + '"', 'w');
    }
  }

  // ---------- navigation
  function navigate(id, replace) {
    if (!S.spec.views[id]) { log('navigate', 'Unknown view "' + id + '"', 'w'); return false; }
    if (replace) S.stack[S.stack.length - 1] = id; else if (current() !== id) S.stack.push(id);
    S.overlay = null; log('navigate', { to: id, replace: !!replace, stack: S.stack.slice() });
    renderAll(); enter(id); return true;
  }
  function back() {
    if (S.overlay) return closeOverlay();
    if (S.stack.length > 1) { S.stack.pop(); log('back', { to: current() }); renderAll(); return true; }
    return false;
  }
  function switchTab(id) {
    if (!S.spec.views[id]) { log('tab', 'Unknown view "' + id + '"', 'w'); return; }
    S.stack = [id]; S.overlay = null; log('tab', id); renderAll(); enter(id);
  }
  function reset() {
    S.state = clone(S.spec.state || {}); S.errors = {}; S.overlay = null; S.toast = null;
    S.stack = [S.spec.initialView || Object.keys(S.spec.views)[0]];
    log('reset', { view: current() }); renderAll(); enter(current());
  }
  function enter(id) { var v = S.spec.views[id]; if (v && v.onEnter) track(runSteps(typeof v.onEnter === 'string' ? [{ run: v.onEnter }] : v.onEnter, {})); }
  function openOverlay(id) {
    if (S.bodies.overlays[id] == null) { log('overlay', 'Unknown overlay "' + id + '"', 'w'); return; }
    S.overlay = id; log('overlay', id); renderAll();
  }
  function closeOverlay() { if (!S.overlay) return false; log('close', S.overlay); S.overlay = null; renderAll(); return true; }
  var toastTimer;
  function toast(text) {
    S.toast = { text: text }; log('toast', text); renderAll();
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { S.toast = null; renderAll(); }, 2800);
  }

  // ---------- theme, tokens, config, preview controls
  function setTheme(t) {
    S.theme = t === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', S.theme);
    var b = $('#fpk-theme'); if (b) b.innerHTML = iconSvg(S.theme === 'dark' ? 'sun' : 'moon') + (S.theme === 'dark' ? 'Light' : 'Dark');
    renderSwatches(); log('theme', S.theme);
  }
  function tokenOverrideCss() {
    function block(sel, o) { var k = Object.keys(o); return k.length ? sel + ' {\n' + k.map(function (n) { return '  --' + n + ': ' + o[n] + ';'; }).join('\n') + '\n}\n' : ''; }
    return block(':root, [data-theme="light"]', S.tokenOverrides.light) + block('[data-theme="dark"]', S.tokenOverrides.dark);
  }
  function setTokens(tokens, theme) {
    theme = theme || 'all';
    Object.keys(tokens).forEach(function (n) {
      var name = n.replace(/^--/, ''), val = String(tokens[n]);
      if (!/^[A-Za-z0-9_-]+$/.test(name) || /[;{}<>]/.test(val)) throw new Error('Invalid token ' + name);
      if (theme === 'all' || theme === 'light') S.tokenOverrides.light[name] = val;
      if (theme === 'all' || theme === 'dark') S.tokenOverrides.dark[name] = val;
    });
    $('#fpk-token-overrides').textContent = tokenOverrideCss();
    S.baseDirty = true; renderStyleGuide(); renderBaseBadge(); log('tokens', { theme: theme, tokens: tokens });
  }
  function normalizeConfig(c) {
    c = c || {};
    var out = Object.assign({}, clone(DEFAULT_CONFIG), c);
    out.base = Object.assign({}, DEFAULT_CONFIG.base, c.base || {});
    out.brand = Object.assign({}, DEFAULT_CONFIG.brand, c.brand || {});
    out.shell = Object.assign({}, clone(DEFAULT_CONFIG.shell), c.shell || {});
    out.shell.appBarAlign = Object.assign({}, DEFAULT_CONFIG.shell.appBarAlign, (c.shell || {}).appBarAlign || {});
    out.shell.nav = Object.assign({}, DEFAULT_CONFIG.shell.nav, (c.shell || {}).nav || {});
    out.shell.overlay = Object.assign({}, DEFAULT_CONFIG.shell.overlay, (c.shell || {}).overlay || {});
    out.styleGuide = Object.assign({ principles: [], sections: [] }, c.styleGuide || {});
    var seen = {};
    out.devices = (Array.isArray(c.devices) && c.devices.length ? c.devices : clone(DEFAULT_CONFIG.devices)).filter(function (d) {
      var ok = d && KINDS[d.kind] && /^[A-Za-z0-9_-]+$/.test(d.id || '') && !seen[d.id] && d.width > 0 && d.height > 0;
      if (!ok) log('config', 'Ignoring invalid device ' + JSON.stringify(d), 'w'); else seen[d.id] = true;
      return ok;
    });
    if (!out.devices.length) out.devices = clone(DEFAULT_CONFIG.devices);
    return out;
  }
  function applyConfig(raw) {
    S.config = normalizeConfig(raw);
    var ids = deviceIds();
    S.ui.devices = S.ui.devices.filter(function (id) { return ids.indexOf(id) > -1; });
    if (!S.ui.devices.length) S.ui.devices = ids.slice();
    if (S.ui.solo && ids.indexOf(S.ui.solo) < 0) S.ui.solo = null;
    DEV.enum = ids; DEV.description = 'Device id: ' + ids.join(', ') + ' (default ' + ids[0] + '). All devices stay in sync.';
    $('#fpk-base-name').textContent = S.config.base.name + (S.config.base.version && S.config.base.version !== '0.0.0' ? ' ' + S.config.base.version : '');
    var logo = S.config.brand.logo;
    if (logo) $('#fpk-logo').innerHTML = /^\s*<svg[\s>]/i.test(logo) ? '<span class="fpk-brand-logo">' + logo + '</span>' : '<span class="fpk-brand-logo"><img src="' + esc(logo) + '" alt=""></span>';
    buildStage(); buildChips();
  }
  function setPreview(o) {
    if (o.devices) { var ids = deviceIds(); S.ui.devices = [].concat(o.devices).filter(function (p) { return ids.indexOf(p) > -1; }); if (!S.ui.devices.length) S.ui.devices = ids.slice(); }
    if (o.scale != null) S.ui.scale = String(o.scale);
    if (o.orientation) S.ui.orientation = o.orientation === 'landscape' ? 'landscape' : 'portrait';
    if ('solo' in o) S.ui.solo = dev(o.solo) ? o.solo : null;
    if (o.tab) showTab(o.tab);
    layout();
  }
  function showTab(tab) {
    if (['prototype', 'styleguide', 'inspector', 'agent'].indexOf(tab) < 0) return;
    S.ui.tab = tab;
    $all('#fpk-tabs .fp-tab').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === tab)); });
    ['prototype', 'styleguide', 'inspector', 'agent'].forEach(function (t) { $('#fpk-tab-' + t).hidden = t !== tab; });
    if (tab === 'prototype') layout();
    if (tab === 'styleguide') renderSwatches();
    if (tab === 'inspector') { fillEditors(); renderInspector(); }
  }
  function syncToolbar() {
    $all('#fpk-device-chips .fpk-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(S.ui.devices.indexOf(c.getAttribute('data-device')) > -1)); });
    var sel = $('#fpk-view-select'); if (sel && sel.value !== current()) sel.value = current();
    var sc = $('#fpk-scale'); if (sc) sc.value = S.ui.scale;
    var bk = $('#fpk-back'); if (bk) bk.disabled = S.stack.length < 2 && !S.overlay;
  }
  function fillViewSelect() {
    var sel = $('#fpk-view-select'); if (!sel) return;
    sel.innerHTML = Object.keys(S.spec.views).map(function (id) { return '<option value="' + esc(id) + '">' + esc((S.spec.views[id].title || id) + '  ·  ' + id) + '</option>'; }).join('');
    sel.value = current();
  }
  function renderBaseBadge() {
    var st = baseStatus(), b = $('#fpk-base-badge'); if (!b) return;
    var map = { locked: ['fp-badge-success', 'Base locked'], unlocked: ['', 'Unlocked kit'], 'unlocked-edited': ['fp-badge-warning', 'Kit edited'], edited: ['fp-badge-warning', 'Base edited · relock'], modified: ['fp-badge-danger', 'Base modified'] }[st.state];
    b.className = 'fp-badge ' + map[0]; b.textContent = map[1]; b.title = st.message; b.hidden = false;
  }

  // ---------- style guide (read live from the token block) & inspector & agent panels
  function tokenNames() {
    var txt = ($('#fpk-tokens').textContent || '') + '\n' + ($('#fpk-token-overrides').textContent || ''), seen = {}, out = [], m, re = /--([A-Za-z0-9_-]+)\s*:/g;
    while ((m = re.exec(txt))) if (!seen[m[1]]) { seen[m[1]] = 1; out.push(m[1]); }
    return out;
  }
  function typeClasses() {
    var txt = $('#fpk-tokens').textContent || '', seen = {}, out = [], m, re = /\.(text-[A-Za-z0-9_-]+)\s*\{/g;
    while ((m = re.exec(txt))) if (!seen[m[1]]) { seen[m[1]] = 1; out.push(m[1]); }
    return out;
  }
  function renderSwatches() {
    var box = $('#fpk-swatches'); if (!box || !window.CSS || !CSS.supports) return;
    var cs = getComputedStyle(document.documentElement);
    box.innerHTML = tokenNames().map(function (n) {
      var v = cs.getPropertyValue('--' + n).trim();
      if (!v || !CSS.supports('color', v) || /^-?[\d.]+(px|rem|em|%)?$/.test(v)) return '';
      return '<div class="fpk-swatch"><i style="background:var(--' + n + ')"></i><div><b>' + esc(n) + '</b><code>' + esc(v) + '</code></div></div>';
    }).join('');
  }
  function renderBaseInfo() {
    var c = S.config, b = c.base, st = baseStatus(), box = $('#fpk-base-info'); if (!box) return;
    var src = (b.sources || []).map(function (s) { return '<li>' + esc(typeof s === 'string' ? s : (s.label || '') + (s.url ? ' — ' + s.url : '') + (s.note ? ' (' + s.note + ')' : '')) + '</li>'; }).join('');
    var devs = devices().map(function (d) { return esc((d.label || d.id) + ' (' + d.kind + ', ' + d.width + '×' + d.height + (d.rotatable ? ', rotatable' : '') + ')'); }).join(', ');
    var sh = c.shell;
    box.innerHTML = '<h2>' + esc(b.name) + ' <span class="fp-badge ' + (st.state === 'locked' ? 'fp-badge-success' : st.state === 'modified' ? 'fp-badge-danger' : 'fp-badge-warning') + '" style="vertical-align:middle">' + esc(st.state) + '</span></h2>' +
      '<p>' + esc(b.notes || 'Repo-specific base for feature prototypes.') + '</p>' +
      '<div class="fpk-box"><dl class="fpk-dl"><dt>Version</dt><dd>' + esc(b.version) + (b.lockedAt ? ' · locked ' + esc(b.lockedAt) : '') + '</dd>' +
      '<dt>Product</dt><dd>' + esc(c.brand.product || '—') + '</dd>' +
      '<dt>Devices</dt><dd>' + devs + '</dd>' +
      '<dt>Shell</dt><dd>App bar: ' + esc(Object.keys(sh.appBarAlign).map(function (k) { return k + ' ' + sh.appBarAlign[k]; }).join(', ')) + ' · Nav: phone ' + esc(sh.nav.phone) + ', tablet ' + esc(sh.nav.tablet) + ', web ' + esc(sh.nav.web) + ' · Tab labels: ' + (sh.tabBarLabels === false ? 'off' : 'on') + ' · Overlays: phone ' + esc(sh.overlay.phone) + ', wide ' + esc(sh.overlay.wide) + '</dd>' +
      '<dt>Lock</dt><dd><code class="text-code">' + esc(st.expected) + '</code>' + (st.state === 'modified' ? ' ≠ <code class="text-code">' + esc(st.actual) + '</code>' : '') + '</dd>' +
      (src ? '<dt>Sources</dt><dd><ul style="margin:0;padding-left:var(--space-4)">' + src + '</ul></dd>' : '') +
      ((c.styleGuide.principles || []).length ? '<dt>Principles</dt><dd><ul style="margin:0;padding-left:var(--space-4)">' + c.styleGuide.principles.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></dd>' : '') +
      '</dl></div>';
  }
  function hydrateIcons(root) { $all('[data-fp-icon]', root).forEach(function (el) { var h = document.createElement('span'); h.innerHTML = iconSvg(el.getAttribute('data-fp-icon'), el.getAttribute('class')); el.replaceWith(h.firstChild); }); }
  function renderStyleGuide() {
    renderBaseInfo();
    var cs = getComputedStyle(document.documentElement);
    $('#fpk-type').innerHTML = typeClasses().map(function (c) {
      var probe = document.createElement('div'); probe.className = c; probe.style.position = 'absolute'; probe.style.visibility = 'hidden'; document.body.appendChild(probe);
      var pc = getComputedStyle(probe), meta = pc.fontSize + ' / ' + pc.lineHeight + ' · ' + pc.fontWeight + '<br>' + esc(pc.fontFamily.split(',')[0].replace(/"/g, '')); probe.remove();
      return '<div class="fpk-typerow"><code>.' + c + '<br>' + meta + '</code><div class="' + c + '">' + (c === 'text-code' ? 'data-fp-nav="verify"' : 'Preview any feature on every screen') + '</div></div>';
    }).join('');
    var names = tokenNames();
    $('#fpk-spacing').innerHTML = names.filter(function (n) { return /^space-/.test(n); }).map(function (n) { return '<div><i style="width:var(--' + n + ');height:var(--' + n + ')"></i>' + n + ' · ' + esc(cs.getPropertyValue('--' + n).trim()) + '</div>'; }).join('');
    $('#fpk-radius').innerHTML = names.filter(function (n) { return /^radius-/.test(n); }).map(function (n) { return '<div><i style="width:72px;height:48px;background:var(--primary-soft);border:2px solid var(--primary);border-radius:var(--' + n + ')"></i>' + n + '</div>'; }).join('');
    $('#fpk-icons').innerHTML = Object.keys(ICONS).map(function (n) { return '<div>' + iconSvg(n) + n + '</div>'; }).join('');
    hydrateIcons($('#fpk-tab-styleguide'));
    $('#fpk-sg-extra').innerHTML = (S.config.styleGuide.sections || []).map(function (sec) {
      return '<div class="fpk-section"><h2>' + esc(sec.title || '') + '</h2>' + (sec.description ? '<p>' + esc(sec.description) + '</p>' : '') + '<div class="fpk-demo">' + (sec.html || '') + '</div></div>';
    }).join('');
    hydrateIcons($('#fpk-sg-extra'));
    renderSwatches();
  }
  var inspQueued = false;
  function scheduleInspector() { if (inspQueued || S.ui.tab !== 'inspector') return; inspQueued = true; setTimeout(function () { inspQueued = false; renderInspector(); }, 60); }
  function renderInspector() {
    if (!$('#fpk-kv') || !S.spec) return;
    var st = baseStatus();
    $('#fpk-kv').innerHTML = '<dt>Base</dt><dd>' + esc(S.config.base.name + ' ' + S.config.base.version + ' · ' + st.state) + '</dd><dt>View</dt><dd>' + esc(current()) + '</dd><dt>Stack</dt><dd>' + esc(S.stack.join(' → ')) + '</dd><dt>Overlay</dt><dd>' + esc(S.overlay || '—') + '</dd><dt>Errors</dt><dd>' + esc(JSON.stringify(S.errors)) + '</dd>';
    $('#fpk-state').textContent = JSON.stringify(S.state, null, 2);
    $('#fpk-log').innerHTML = S.log.slice(-80).reverse().map(function (e) { return '<li class="' + e.level + '"><time>' + e.t + '</time><span><b>' + esc(e.type) + '</b> ' + esc(typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail)) + '</span></li>'; }).join('');
  }
  function fillEditors() {
    $('#fpk-spec-editor').value = JSON.stringify(S.spec, null, 2);
    $('#fpk-body-name').textContent = current();
    $('#fpk-body-editor').value = (S.bodies.views[current()] || '').replace(/^\n+|\s+$/g, '');
  }
  function renderAgentPanel() {
    $('#fpk-tools').innerHTML = '<tr><th>Tool</th><th>Phase</th><th>What it does</th><th>Arguments</th></tr>' + TOOLS.map(function (t) {
      var props = (t.inputSchema && t.inputSchema.properties) || {}, req = (t.inputSchema && t.inputSchema.required) || [];
      var args = Object.keys(props).map(function (k) { return '<code>' + k + (req.indexOf(k) > -1 ? '' : '?') + '</code>: ' + esc(props[k].description || props[k].type || ''); }).join('<br>') || '—';
      return '<tr><td><code>' + t.name + '</code></td><td>' + (t.phase || 'any') + '</td><td>' + esc(t.description) + '</td><td>' + args + '</td></tr>';
    }).join('');
  }

  // ---------- spec loading & validation
  function readSource() {
    var cfg;
    try { cfg = JSON.parse($('#fpk-config').textContent); } catch (e) { cfg = null; log('config', 'Invalid fpk-config JSON: ' + e.message, 'e'); }
    applyConfig(cfg);
    var spec;
    try { spec = JSON.parse($('#fpk-spec').textContent); } catch (e) { spec = { meta: { name: 'Spec JSON error' }, views: { error: { title: 'Error' } }, initialView: 'error' }; S.bodies.views.error = '<div class="fp-alert fp-alert-danger"><i data-fp-icon="warn"></i><div><strong>Invalid fpk-spec JSON</strong>' + esc(e.message) + '</div></div>'; log('spec', e.message, 'e'); }
    spec.views = spec.views || {}; spec.overlays = spec.overlays || {}; spec.actions = spec.actions || {}; spec.state = spec.state || {}; spec.meta = spec.meta || {};
    var firstView = null;
    $all('#fpk-views template[data-fpk-view]').forEach(function (t) {
      var id = t.getAttribute('data-fpk-view'); if (!firstView) firstView = id;
      S.bodies.views[id] = t.innerHTML; S.tplOpen.views[id] = t.outerHTML.match(/^<template[^>]*>/)[0];
      spec.views[id] = mergeViewMeta(viewMetaFromTemplate(t, id), spec.views[id]);
      if (spec.views[id].title == null) spec.views[id].title = id;
    });
    $all('#fpk-views template[data-fpk-overlay]').forEach(function (t) {
      var id = t.getAttribute('data-fpk-overlay'), ty = t.getAttribute('data-type');
      S.bodies.overlays[id] = t.innerHTML; S.tplOpen.overlays[id] = t.outerHTML.match(/^<template[^>]*>/)[0];
      spec.overlays[id] = Object.assign(ty ? { type: ty } : {}, spec.overlays[id] || {});
    });
    if (!spec.initialView) spec.initialView = firstView || Object.keys(spec.views)[0];
    S.spec = spec;
  }
  // View settings can live on the template tag: data-title, data-route, data-layout, data-back (auto|true|false),
  // data-appbar="false", data-actions='[{"icon":"plus","label":"Add","overlay":"add"}]', data-tabbar="false", data-onenter.
  function viewMetaFromTemplate(t, id) {
    var m = {}, a = function (n) { return t.getAttribute('data-' + n); };
    if (a('title') != null) m.title = a('title');
    if (a('route') != null) m.route = a('route');
    if (a('layout')) m.layout = a('layout');
    if (a('appbar') === 'false') m.appBar = false;
    else {
      var ab = {};
      if (a('back') != null) ab.back = a('back') === 'auto' ? 'auto' : a('back') === 'true';
      if (a('actions')) { try { ab.actions = JSON.parse(a('actions')); } catch (e) { log('view', id + ': data-actions is not valid JSON', 'w'); } }
      if (Object.keys(ab).length) m.appBar = ab;
    }
    if (a('tabbar') === 'false') m.tabBar = false;
    if (a('onenter')) m.onEnter = a('onenter');
    return m;
  }
  function mergeViewMeta(attr, js) {
    if (!js) return attr;
    var out = Object.assign({}, attr, js);
    if (attr.appBar && js.appBar && typeof js.appBar === 'object') out.appBar = Object.assign({}, attr.appBar, js.appBar);
    return out;
  }
  function validateSpec() {
    var issues = [], notes = [], sp = S.spec, views = sp.views || {}, st = baseStatus();
    if (st.state === 'modified') issues.push('BASE MODIFIED: ' + st.message + ' (expected ' + st.expected + ', got ' + st.actual + ')');
    if (st.state === 'edited' || st.state === 'unlocked-edited') notes.push(st.message);
    if (st.state === 'unlocked') notes.push('This file has no base lock yet (raw kit or unfinished Phase A).');
    if (!views[sp.initialView]) issues.push('initialView "' + sp.initialView + '" is not a view.');
    Object.keys(views).forEach(function (id) { if (S.bodies.views[id] == null) issues.push('View "' + id + '" has no <template data-fpk-view="' + id + '">.'); });
    var routes = {};
    Object.keys(views).forEach(function (id) { var r = views[id].route; if (r) { if (routes[r]) issues.push('Route "' + r + '" is used by "' + routes[r] + '" and "' + id + '".'); routes[r] = id; } });
    var ids = deviceIds();
    function scan(html, where) {
      var t = document.createElement('template'); t.innerHTML = html;
      $all('[data-fp-nav],[data-fp-replace],[data-fp-tab]', t.content).forEach(function (el) { var v = el.getAttribute('data-fp-nav') || el.getAttribute('data-fp-replace') || el.getAttribute('data-fp-tab'); if (v.indexOf('{{') < 0 && !views[v]) issues.push(where + ': navigates to unknown view "' + v + '".'); });
      $all('[data-fp-action],[data-fp-submit]', t.content).forEach(function (el) { var a = el.getAttribute('data-fp-action') || el.getAttribute('data-fp-submit'); if (!(sp.actions || {})[a] && !HANDLERS[a]) issues.push(where + ': unknown action "' + a + '".'); });
      $all('[data-fp-overlay]', t.content).forEach(function (el) { var o = el.getAttribute('data-fp-overlay'); if (S.bodies.overlays[o] == null) issues.push(where + ': unknown overlay "' + o + '".'); });
      $all('[data-fp-icon]', t.content).forEach(function (el) { var n = el.getAttribute('data-fp-icon'); if (!ICONS[n]) issues.push(where + ': unknown icon "' + n + '".'); });
      $all('[data-fp-bind]', t.content).forEach(function (el) { var b = el.getAttribute('data-fp-bind'); if (getPath(sp.state, b) === undefined) issues.push(where + ': binds "' + b + '", which has no initial value in state.'); });
      $all('[data-fp-only]', t.content).forEach(function (el) { el.getAttribute('data-fp-only').split(/[\s,]+/).filter(Boolean).forEach(function (tag) { if (['phone', 'wide', 'ios', 'android', 'tablet', 'web'].indexOf(tag) < 0 && ids.indexOf(tag) < 0) issues.push(where + ': data-fp-only names unknown platform/device "' + tag + '".'); }); });
      $all('form[data-fp-submit] [data-fp-action][type="submit"], form[data-fp-submit] button:not([type])[data-fp-action]', t.content).forEach(function () { issues.push(where + ': a submit button inside form[data-fp-submit] also has data-fp-action (it would run twice). Give it type="button" or drop the attribute.'); });
      $all('script, [onclick], [onload], [onerror], [oninput], [onchange], [onsubmit]', t.content).forEach(function () { issues.push(where + ': contains <script> or an inline on* handler; use data-fp-* attributes, the step DSL or FPK.handler.'); });
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(html)) notes.push(where + ': contains a raw colour value; prefer var(--token).');
    }
    Object.keys(S.bodies.views).forEach(function (id) { scan(S.bodies.views[id], 'view "' + id + '"'); });
    Object.keys(S.bodies.overlays).forEach(function (id) { scan(S.bodies.overlays[id], 'overlay "' + id + '"'); });
    function scanSteps(steps, where) {
      [].concat(steps || []).forEach(function (st2) {
        if (!st2 || typeof st2 !== 'object') return;
        if ('if' in st2) { scanSteps(st2.then, where); scanSteps(st2['else'], where); return; }
        var k = Object.keys(st2)[0], a = st2[k];
        if ((k === 'navigate' || k === 'replace' || k === 'tab')) { var v = typeof a === 'object' ? a.view : a; if (String(v).indexOf('{{') < 0 && !views[v]) issues.push(where + ': step navigates to unknown view "' + v + '".'); }
        if ((k === 'run' || k === 'call') && !(sp.actions || {})[a] && !HANDLERS[a]) issues.push(where + ': runs unknown action "' + a + '".');
        if (k === 'overlay' && S.bodies.overlays[a] == null) issues.push(where + ': opens unknown overlay "' + a + '".');
        if (k === 'validate') Object.keys(a).forEach(function (f) { [].concat(a[f]).forEach(function (r) { var rule = typeof r === 'object' ? r.rule : String(r).split('|')[0].split(':')[0]; if (!RULES[rule]) issues.push(where + ': unknown validation rule "' + rule + '".'); }); });
      });
    }
    Object.keys(sp.actions || {}).forEach(function (a) { scanSteps(sp.actions[a], 'action "' + a + '"'); });
    Object.keys(views).forEach(function (id) { if (views[id].onEnter && typeof views[id].onEnter !== 'string') scanSteps(views[id].onEnter, 'view "' + id + '" onEnter'); });
    if (sp.tabBar) (sp.tabBar.items || []).forEach(function (it) { if (!views[it.view]) issues.push('tabBar item "' + it.label + '" points to unknown view "' + it.view + '".'); });
    return { ok: issues.length === 0, issues: issues, notes: notes, base: { state: st.state, name: S.config.base.name, version: S.config.base.version } };
  }
  function applySpec(spec, opts) {
    spec.views = spec.views || {}; spec.overlays = spec.overlays || {}; spec.actions = spec.actions || {}; spec.state = spec.state || {}; spec.meta = spec.meta || {};
    S.spec = spec;
    $('#fpk-title').textContent = spec.meta.name || 'Feature';
    document.title = (spec.meta.name ? spec.meta.name + ' · ' : '') + (S.config.base.name || 'Feature Preview Kit');
    fillViewSelect();
    if (opts && opts.reset) reset();
    else { if (!S.spec.views[current()]) S.stack = [S.spec.initialView || Object.keys(S.spec.views)[0]]; renderAll(); }
    fillViewSelect();
  }

  // ---------- export
  function replaceRegion(html, id, text) { var r = findRegion(html, id); return r ? html.slice(0, r.openEnd) + text + html.slice(r.closeStart) : html; }
  function exportHtml() {
    var html = SOURCE;
    html = replaceRegion(html, 'fpk-spec', '\n' + JSON.stringify(S.spec, null, 2).replace(/<\/(script)/gi, '<\\/$1') + '\n');
    if (S.configDirty) html = replaceRegion(html, 'fpk-config', '\n' + JSON.stringify(S.config, null, 2).replace(/<\/(script)/gi, '<\\/$1') + '\n');
    var tpls = Object.keys(S.bodies.views).map(function (id) { return (S.tplOpen.views[id] || '<template data-fpk-view="' + id + '">') + S.bodies.views[id].replace(/^\n?/, '\n').replace(/\s*$/, '\n') + '</template>'; })
      .concat(Object.keys(S.bodies.overlays).map(function (id) { return (S.tplOpen.overlays[id] || '<template data-fpk-overlay="' + id + '">') + S.bodies.overlays[id].replace(/^\n?/, '\n').replace(/\s*$/, '\n') + '</template>'; })).join('\n\n');
    html = html.replace(/(<!-- FPK:VIEWS:START -->)[\s\S]*?(<!-- FPK:VIEWS:END -->)/, function (_, a, b) { return a + '\n' + tpls + '\n' + b; });
    html = replaceRegion(html, 'fpk-token-overrides', tokenOverrideCss());
    if (S.featureCss != null) html = replaceRegion(html, 'fpk-feature-css', '\n' + S.featureCss.replace(/<\/style/gi, '') + '\n');
    html = html.replace(/<html[^>]*>/, function (tag) { return tag.replace(/ data-theme="[^"]*"/, ' data-theme="light"').replace(/ data-fpk-(ready|view)="[^"]*"/g, ''); });
    if (S.relock) { var h = baseHash(html); html = html.replace(/(<meta name="fpk-base-lock" content=")[^"]*(")/, function (_, a, b) { return a + h + b; }); }
    return html;
  }
  function download() {
    var blob = new Blob([exportHtml()], { type: 'text/html' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ((S.spec.meta.name || 'feature-preview').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'feature-preview') + '.html';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ---------- screen description for agents
  function describeScreen(id) {
    var f = frames[id || deviceIds()[0]]; if (!f) throw new Error('Unknown device "' + id + '". Devices: ' + deviceIds().join(', '));
    var lines = ['device: ' + f.id + ' (' + f.d.kind + ')', 'view: ' + current() + ' (' + interp((S.spec.views[current()] || {}).title || '', { platform: f.d.kind, device: f.id }) + ')', 'stack: ' + S.stack.join(' > ')];
    if (S.overlay) lines.push('overlay: ' + S.overlay);
    if (S.toast) lines.push('toast: "' + S.toast.text + '"');
    lines.push('---');
    function visible(el) { for (var n = el; n && n !== f.screen; n = n.parentElement) { if (n.hidden || getComputedStyle(n).display === 'none') return false; } return true; }
    $all('h1,h2,h3,h4,p,label,button,a,input,select,textarea,.fp-badge,.fp-alert,.fp-list-title,[role="status"]', f.screen).forEach(function (el) {
      if (!visible(el) || el.closest('.fp-statusbar')) return;
      if (el.matches('label') && el.querySelector('input')) { var inp = el.querySelector('input'); lines.push((inp.type === 'checkbox' ? 'switch/checkbox' : inp.type) + ' "' + visibleText(el) + '" checked=' + inp.checked + (inp.dataset.fpBind ? ' [bind=' + inp.dataset.fpBind + ']' : '')); return; }
      if (el.closest('label') && el.matches('input')) return;
      if (el.closest('button') && !el.matches('button')) return;
      if (el.closest('.fp-alert') && !el.matches('.fp-alert')) return;
      var t = el.tagName.toLowerCase();
      if (t === 'input' || t === 'select' || t === 'textarea') {
        var lab = el.id ? $('label[for="' + el.id + '"]', f.screen) : null;
        lines.push(t + (el.type && t === 'input' ? '[' + el.type + ']' : '') + ' "' + (lab ? visibleText(lab) : el.placeholder || '') + '" value="' + (el.type === 'password' ? '•'.repeat(el.value.length) : el.value) + '"' + (el.getAttribute('aria-invalid') === 'true' ? ' INVALID' : '') + (el.disabled ? ' disabled' : '') + (el.dataset.fpBind ? ' [bind=' + el.dataset.fpBind + ']' : ''));
        return;
      }
      if (t === 'label') return;
      var txt = el.getAttribute('aria-label') || visibleText(el);
      if (!txt) return;
      var extra = []; ['nav', 'action', 'overlay', 'back', 'close', 'reset', 'tab', 'set'].forEach(function (k) { var a = el.getAttribute('data-fp-' + k); if (a != null) extra.push(k + (a ? '=' + a : '')); });
      if (el.disabled) extra.push('disabled');
      if (el.getAttribute('aria-current') === 'page') extra.push('current');
      if (el.type === 'submit' && el.form && el.form.dataset.fpSubmit) extra.push('submit=' + el.form.dataset.fpSubmit);
      lines.push((t === 'button' || t === 'a' ? 'button' : el.classList.contains('fp-alert') ? 'alert' : t) + ' "' + txt.slice(0, 120) + '"' + (extra.length ? ' [' + extra.join(', ') + ']' : ''));
    });
    return lines.join('\n');
  }
  function findTarget(args) {
    var f = frames[args.device || deviceIds()[0]]; if (!f) throw new Error('Unknown device "' + args.device + '". Devices: ' + deviceIds().join(', '));
    var el = null;
    if (args.selector) el = $(args.selector, f.screen);
    else if (args.text) {
      var want = String(args.text).trim().toLowerCase();
      var label = function (e) { return (visibleText(e) || e.getAttribute('aria-label') || '').toLowerCase(); };
      el = $all('button, a, [data-fp-nav], [data-fp-action], [data-fp-overlay], label, .fp-list-item', f.screen).filter(function (e) { return !e.closest('[hidden]') && (label(e).indexOf(want) > -1 || (e.getAttribute('aria-label') || '').toLowerCase().indexOf(want) > -1); })
        .sort(function (a, b) { return label(a).length - label(b).length; })[0] || null;
    } else if (args.bind) el = $('[data-fp-bind="' + args.bind + '"]', f.screen);
    if (!el) throw new Error('No element matches ' + JSON.stringify(args));
    return el;
  }

  // ---------- contrast check (Phase A)
  var CONTRAST_PAIRS = [
    ['ink', 'bg', 4.5], ['ink', 'surface', 4.5], ['ink-muted', 'surface', 4.5], ['ink-muted', 'bg', 4.5],
    ['on-primary', 'primary', 4.5], ['primary', 'surface', 4.5], ['primary', 'primary-soft', 4.5],
    ['on-secondary', 'secondary', 4.5], ['secondary', 'secondary-soft', 4.5], ['on-danger', 'danger', 4.5], ['danger', 'surface', 4.5],
    ['success', 'success-soft', 4.5], ['warning', 'warning-soft', 4.5], ['danger', 'danger-soft', 4.5], ['info', 'info-soft', 4.5], ['ink', 'info-soft', 4.5],
    ['bg', 'ink', 4.5], ['border-strong', 'surface', 3], ['focus', 'bg', 3]
  ];
  function checkContrast(extra) {
    var canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    function rgba(c) { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); var d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; }
    function over(fg, bg) { var a = fg[3]; return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1]; }
    function lum(c) { return [0, 1, 2].map(function (i) { var v = c[i] / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
    var pairs = CONTRAST_PAIRS.concat(extra || []), out = [];
    ['light', 'dark'].forEach(function (theme) {
      var probe = document.createElement('div'); probe.setAttribute('data-theme', theme); probe.style.display = 'none'; document.body.appendChild(probe);
      var cs = getComputedStyle(probe), page = rgba(cs.getPropertyValue('--bg').trim() || '#fff');
      pairs.forEach(function (p) {
        var fv = cs.getPropertyValue('--' + p[0]).trim(), bv = cs.getPropertyValue('--' + p[1]).trim();
        if (!fv || !bv) { out.push({ theme: theme, fg: p[0], bg: p[1], ratio: null, min: p[2], pass: false, note: 'token missing' }); return; }
        var b = over(rgba(bv), page), f = over(rgba(fv), b), l1 = lum(f), l2 = lum(b), r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        out.push({ theme: theme, fg: p[0], bg: p[1], ratio: Math.round(r * 100) / 100, min: p[2], pass: r >= p[2] });
      });
      probe.remove();
    });
    return { pass: out.every(function (r) { return r.pass; }), failures: out.filter(function (r) { return !r.pass; }), results: out };
  }

  // ---------- tools (WebMCP + FPK.call + postMessage)
  function obj(props, req) { return { type: 'object', properties: props || {}, required: req || [] }; }
  var DEV = { type: 'string', description: 'Device id (default: first device). All devices stay in sync.' };
  function baseEdit() { S.baseDirty = true; S.configDirty = true; renderBaseBadge(); }
  var TOOLS = [
    { name: 'fpk_describe', readOnly: true, description: 'Start here. Base (design system) info and lock state, devices, and the feature: meta, views, overlays, actions, current view.', inputSchema: obj(),
      run: function () { var st = baseStatus(); return { kit: 'Feature Preview Kit ' + VERSION, base: { name: S.config.base.name, version: S.config.base.version, state: st.state, message: st.message }, devices: devices(), shell: S.config.shell, feature: { meta: S.spec.meta, initialView: S.spec.initialView, currentView: current(), stack: S.stack, views: Object.keys(S.spec.views).map(function (id) { var v = S.spec.views[id]; return { id: id, title: v.title, route: v.route, layout: v.layout || 'card' }; }), overlays: Object.keys(S.bodies.overlays), actions: Object.keys(S.spec.actions || {}), handlers: Object.keys(HANDLERS), stateKeys: Object.keys(S.spec.state || {}) }, editing: 'Generated file. Edit sources in .agentic_coding/base (Phase A) or .agentic_coding/feature/<slug> (Phase B) and rebuild with fpk.js build. Use fpk_walk to test paths.' }; } },
    { name: 'fpk_get_spec', readOnly: true, description: 'Feature spec JSON plus the HTML template of every view and overlay, and the feature CSS.', inputSchema: obj(),
      run: function () { return { spec: S.spec, templates: S.bodies, featureCss: S.featureCss != null ? S.featureCss : $('#fpk-feature-css').textContent }; } },
    { name: 'fpk_get_state', readOnly: true, description: 'Runtime state: current view, stack, overlay, toast, state values, validation errors, preview settings.', inputSchema: obj(),
      run: function () { return { view: current(), stack: S.stack, overlay: S.overlay, toast: S.toast && S.toast.text, state: S.state, errors: S.errors, theme: S.theme, preview: { devices: S.ui.devices, scale: S.ui.scale, orientation: S.ui.orientation, solo: S.ui.solo } }; } },
    { name: 'fpk_describe_screen', readOnly: true, description: 'Text outline of what is visible on a device: headings, fields with values and errors, buttons with their data-fp-* behaviour. Use instead of a screenshot.', inputSchema: obj({ device: DEV }),
      run: function (a) { return describeScreen(a.device); } },
    { name: 'fpk_navigate', description: 'Go to a view (push, or replace the top with replace=true).', inputSchema: obj({ view: { type: 'string', description: 'View id' }, replace: { type: 'boolean', description: 'Replace instead of push' } }, ['view']),
      run: function (a) { if (!navigate(a.view, a.replace)) throw new Error('Unknown view "' + a.view + '". Views: ' + Object.keys(S.spec.views).join(', ')); return { view: current(), stack: S.stack }; } },
    { name: 'fpk_back', description: 'Close the open overlay, or pop one view.', inputSchema: obj(), run: function () { back(); return { view: current(), stack: S.stack, overlay: S.overlay }; } },
    { name: 'fpk_reset', description: 'Restart the flow: initial view, initial state, no errors.', inputSchema: obj(), run: function () { reset(); return { view: current(), state: S.state }; } },
    { name: 'fpk_tap', description: 'Tap an element in a device by CSS selector, visible text or bound state path. Runs its real behaviour.', inputSchema: obj({ selector: { type: 'string', description: 'CSS selector inside the screen' }, text: { type: 'string', description: 'Visible text (case-insensitive substring)' }, bind: { type: 'string', description: 'data-fp-bind path' }, device: DEV }),
      run: async function (a) { var el = findTarget(a); if (el.matches('label') && el.querySelector('input')) el = el.querySelector('input'); el.click(); await sleep(30); return { tapped: describeEl(el), view: current(), overlay: S.overlay }; } },
    { name: 'fpk_type', description: 'Type into an input (replaces its value) and fire input events like a user.', inputSchema: obj({ text: { type: 'string', description: 'Text to enter' }, bind: { type: 'string', description: 'data-fp-bind path of the input' }, selector: { type: 'string', description: 'CSS selector (alternative to bind)' }, device: DEV }, ['text']),
      run: function (a) { var el = findTarget({ selector: a.selector, bind: a.bind, device: a.device }); el.value = a.text; el.dispatchEvent(new Event('input', { bubbles: true })); return { bind: el.getAttribute('data-fp-bind'), value: el.value, state: S.state }; } },
    { name: 'fpk_set_state', description: 'Merge values into runtime state (or replace it) to preview filled, empty or error states.', inputSchema: obj({ patch: { type: 'object', description: 'Dot-path → value' }, errors: { type: 'object', description: 'Field → error message' }, replace: { type: 'boolean', description: 'Replace the whole state with patch' } }),
      run: function (a) { if (a.replace) S.state = clone(a.patch || {}); else Object.keys(a.patch || {}).forEach(function (k) { setPath(S.state, k, a.patch[k]); }); if (a.errors) S.errors = Object.assign({}, a.errors); renderAll(); return { state: S.state, errors: S.errors }; } },
    { name: 'fpk_upsert_view', phase: 'B', description: 'Create or replace a view: metadata and/or its HTML template (fp-* classes, data-fp-* attributes).', inputSchema: obj({ id: { type: 'string', description: 'View id ([A-Za-z0-9_-])' }, title: { type: 'string', description: 'App bar title' }, route: { type: 'string', description: 'URL path shown in the web frame' }, layout: { type: 'string', enum: ['card', 'narrow', 'full', 'flush'], description: 'Wide-screen layout' }, appBar: { description: 'false, or {back:"auto"|true|false, title?, actions?:[{icon,label,action|nav|overlay|toast}]}' }, tabBar: { type: 'boolean', description: 'false hides the feature nav on this view' }, onEnter: { description: 'Action name or step array run on arrival' }, body: { type: 'string', description: 'HTML template' } }, ['id']),
      run: function (a) { if (!/^[A-Za-z0-9_-]+$/.test(a.id)) throw new Error('Invalid id'); var v = S.spec.views[a.id] || {}; ['title', 'route', 'layout', 'appBar', 'tabBar', 'onEnter'].forEach(function (k) { if (k in a) v[k] = a[k]; }); S.spec.views[a.id] = v; if (a.body != null) S.bodies.views[a.id] = a.body; else if (S.bodies.views[a.id] == null) S.bodies.views[a.id] = '<p class="text-body">' + esc(a.title || a.id) + '</p>'; fillViewSelect(); renderAll(); return { view: a.id, validation: validateSpec() }; } },
    { name: 'fpk_remove_view', phase: 'B', description: 'Delete a view and its template.', inputSchema: obj({ id: { type: 'string' } }, ['id']),
      run: function (a) { delete S.spec.views[a.id]; delete S.bodies.views[a.id]; S.stack = S.stack.filter(function (v) { return v !== a.id; }); if (!S.stack.length) S.stack = [S.spec.initialView]; fillViewSelect(); renderAll(); return { views: Object.keys(S.spec.views), validation: validateSpec() }; } },
    { name: 'fpk_upsert_overlay', phase: 'B', description: 'Create or replace an overlay (sheet/dialog per the base shell, or forced with type).', inputSchema: obj({ id: { type: 'string' }, type: { type: 'string', enum: ['auto', 'sheet', 'dialog'] }, body: { type: 'string', description: 'HTML template' } }, ['id', 'body']),
      run: function (a) { S.spec.overlays[a.id] = Object.assign(S.spec.overlays[a.id] || {}, a.type ? { type: a.type } : {}); S.bodies.overlays[a.id] = a.body; renderAll(); return { overlay: a.id, validation: validateSpec() }; } },
    { name: 'fpk_set_action', phase: 'B', description: 'Create or replace a named action (array of DSL steps). steps=null deletes it.', inputSchema: obj({ name: { type: 'string' }, steps: { type: ['array', 'null'], description: 'Step objects' } }, ['name', 'steps']),
      run: function (a) { if (a.steps === null) delete S.spec.actions[a.name]; else S.spec.actions[a.name] = a.steps; return { actions: Object.keys(S.spec.actions), validation: validateSpec() }; } },
    { name: 'fpk_patch_spec', phase: 'B', description: 'Set any value in the feature spec by dot path (e.g. "meta.name", "initialView", "state.email", "views.verify.title", "tabBar"). value=null deletes.', inputSchema: obj({ path: { type: 'string' }, value: { description: 'Any JSON value' } }, ['path']),
      run: function (a) { var parts = splitPath(a.path); if (a.value === null) { var parent = parts.length > 1 ? getPath(S.spec, parts.slice(0, -1).join('.')) : S.spec; if (parent) delete parent[parts[parts.length - 1]]; } else setPath(S.spec, a.path, a.value); applySpec(S.spec, { reset: /^state(\.|$)|^initialView$/.test(a.path) }); return { ok: true, validation: validateSpec() }; } },
    { name: 'fpk_set_spec', phase: 'B', description: 'Replace the whole feature spec (templates kept unless given).', inputSchema: obj({ spec: { type: 'object' }, templates: { type: 'object', description: '{views:{id:html}, overlays:{id:html}}' } }, ['spec']),
      run: function (a) { if (a.templates) { S.bodies.views = a.templates.views || S.bodies.views; S.bodies.overlays = a.templates.overlays || S.bodies.overlays; } applySpec(clone(a.spec), { reset: true }); return { ok: true, validation: validateSpec() }; } },
    { name: 'fpk_set_feature_css', phase: 'B', description: 'Replace the feature-specific stylesheet (tokens only, feature-prefixed class names).', inputSchema: obj({ css: { type: 'string' } }, ['css']),
      run: function (a) { S.featureCss = a.css; $('#fpk-feature-css').textContent = a.css; return { ok: true }; } },
    { name: 'fpk_get_config', phase: 'A', readOnly: true, description: 'The base configuration: base info, brand, devices, shell styles, style-guide extras.', inputSchema: obj(), run: function () { return S.config; } },
    { name: 'fpk_set_config', phase: 'A', description: 'PHASE A ONLY (changes the locked base). Set a base config value by dot path, e.g. "brand.product", "devices", "shell.nav.web" ("top"|"sidebar"), "shell.appBarAlign.ios", "styleGuide.sections". Rebuilds the devices.', inputSchema: obj({ path: { type: 'string' }, value: { description: 'Any JSON value' } }, ['path', 'value']),
      run: function (a) { var c = clone(S.config); setPath(c, a.path, a.value); applyConfig(c); baseEdit(); layout(); renderAll(); renderStyleGuide(); return { config: S.config, base: baseStatus() }; } },
    { name: 'fpk_set_tokens', phase: 'A', description: 'PHASE A ONLY (changes the locked base). Override design tokens (names without --) for one theme or both. Fold them into fpk-tokens before locking.', inputSchema: obj({ tokens: { type: 'object', description: 'e.g. {"primary":"#5b3cc4","btn-radius":"999px"}' }, theme: { type: 'string', enum: ['all', 'light', 'dark'] } }, ['tokens']),
      run: function (a) { setTokens(a.tokens, a.theme); return { overrides: S.tokenOverrides, base: baseStatus().state }; } },
    { name: 'fpk_lock_base', phase: 'A', description: 'PHASE A ONLY. Mark the base as locked (optionally set name/version). The new lock hash is written by fpk_export_html; save that output as the base file. CLI equivalent: node fpk.js lock <file>.', inputSchema: obj({ name: { type: 'string' }, version: { type: 'string' } }),
      run: function (a) { if (a.name) S.config.base.name = a.name; if (a.version) S.config.base.version = a.version; S.config.base.status = 'locked'; S.config.base.lockedAt = new Date().toISOString().slice(0, 10); S.configDirty = true; S.relock = true; S.baseDirty = false; applyConfig(S.config); layout(); renderAll(); renderStyleGuide(); return { ok: true, next: 'Call fpk_export_html and save the result as the base file.' }; } },
    { name: 'fpk_check_contrast', phase: 'A', readOnly: true, description: 'WCAG contrast of the required token pairs (text 4.5:1, borders/focus 3:1) in light and dark. Add pairs as [[fg, bg, min], ...].', inputSchema: obj({ extra: { type: 'array', description: 'Extra [fgToken, bgToken, minRatio] pairs' } }), run: function (a) { return checkContrast(a.extra); } },
    { name: 'fpk_base_status', readOnly: true, description: 'Lock state of the base: locked, unlocked, edited (runtime, unsaved) or modified (file changed after lock).', inputSchema: obj(), run: function () { return baseStatus(); } },
    { name: 'fpk_set_theme', description: 'Switch the page between light and dark.', inputSchema: obj({ theme: { type: 'string', enum: ['light', 'dark'] } }, ['theme']), run: function (a) { setTheme(a.theme); return { theme: S.theme }; } },
    { name: 'fpk_set_preview', description: 'Control the preview page: visible devices, scale, orientation of rotatable devices, focus one device, active tab.', inputSchema: obj({ devices: { type: 'array', items: { type: 'string' }, description: 'Device ids' }, scale: { description: '"fit" or a number like 0.5' }, orientation: { type: 'string', enum: ['portrait', 'landscape'] }, solo: { type: ['string', 'null'], description: 'Device id to focus, null for all' }, tab: { type: 'string', enum: ['prototype', 'styleguide', 'inspector', 'agent'] } }),
      run: function (a) { setPreview(a); return { devices: S.ui.devices, scale: S.ui.scale, appliedScale: S.ui.appliedScale, orientation: S.ui.orientation, solo: S.ui.solo, tab: S.ui.tab }; } },
    { name: 'fpk_walk', description: 'Run a whole user path in ONE call and get a compact transcript. Steps (in order): {"tap":"Sign in"} or {"tap":{"text"|"selector"|"bind", "device"}}; {"type":{"email":"a@b.co","password":"secret123"}} (bind path → text); {"nav":"view"}; {"back":true}; {"reset":true}; {"set":{"path":value}}; {"wait":ms}; {"expect":{"view":"id","text":"visible text","errors":["field"]|false,"overlay":"id"|false,"toast":"text"}}; {"describe":true|"deviceId"}. Waits for actions (incl. simulated latency) to finish after each step. Stops at the first failure unless continueOnFail.', inputSchema: obj({ steps: { type: 'array', description: 'Step objects' }, device: DEV, continueOnFail: { type: 'boolean' }, describeEnd: { type: 'boolean', description: 'Append the final screen outline (default true)' } }, ['steps']),
      run: async function (a) { return walk(a); } },
    { name: 'fpk_validate', readOnly: true, description: 'Check the base lock, spec and templates: unknown views, actions, overlays, icons, rules, devices, unbound state, duplicate routes, inline scripts.', inputSchema: obj(), run: function () { return validateSpec(); } },
    { name: 'fpk_get_log', readOnly: true, description: 'Recent events (taps, navigation, actions, validation failures, warnings).', inputSchema: obj({ limit: { type: 'number' } }), run: function (a) { return S.log.slice(-(a.limit || 50)); } },
    { name: 'fpk_export_html', readOnly: true, description: 'The complete HTML file with every runtime edit written back (feature regions; base regions and a new lock only after Phase A tools). Save it over the file to persist.', inputSchema: obj(), run: function () { return exportHtml(); } }
  ];
  async function walk(a) {
    var device = a.device || deviceIds()[0], lines = [], ok = true, steps = [].concat(a.steps || []);
    function summary() {
      var e = Object.keys(S.errors);
      return 'view=' + current() + (S.overlay ? ' overlay=' + S.overlay : '') + (e.length ? ' errors=' + e.map(function (k) { return k + ':"' + S.errors[k] + '"'; }).join(',') : '') + (S.toast ? ' toast="' + S.toast.text + '"' : '');
    }
    await idle();
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i] || {}, k = Object.keys(st)[0], v = st[k], label = k + ' ' + JSON.stringify(v), fail = null;
      try {
        if (k === 'tap') { var q = typeof v === 'string' ? { text: v } : Object.assign({}, v); q.device = q.device || device; var el = findTarget(q); if (el.matches('label') && el.querySelector('input')) el = el.querySelector('input'); el.click(); }
        else if (k === 'type') { Object.keys(v).forEach(function (b) { var inp = findTarget({ bind: b, device: device }); inp.value = v[b]; inp.dispatchEvent(new Event('input', { bubbles: true })); }); }
        else if (k === 'nav') { if (!navigate(v)) throw new Error('unknown view "' + v + '"'); }
        else if (k === 'back') back();
        else if (k === 'reset') reset();
        else if (k === 'set') { Object.keys(v).forEach(function (p) { setPath(S.state, p, v[p]); }); renderAll(); }
        else if (k === 'wait') await sleep(Number(v) || 0);
        else if (k === 'describe') { lines.push((i + 1) + '. describe\n' + describeScreen(v === true ? device : v).replace(/^/gm, '   ')); continue; }
        else if (k === 'expect') {
          var miss = [];
          if (v.view && current() !== v.view) miss.push('view is ' + current() + ', expected ' + v.view);
          if (v.overlay !== undefined && (S.overlay || false) !== v.overlay) miss.push('overlay is ' + (S.overlay || false));
          if (v.errors === false && Object.keys(S.errors).length) miss.push('unexpected errors ' + Object.keys(S.errors).join(','));
          if (Array.isArray(v.errors)) v.errors.forEach(function (f) { if (!S.errors[f]) miss.push('no error on ' + f); });
          if (v.toast && !(S.toast && S.toast.text.indexOf(v.toast) > -1)) miss.push('toast is ' + (S.toast ? '"' + S.toast.text + '"' : 'none'));
          if (v.text && describeScreen(v.device || device).toLowerCase().indexOf(String(v.text).toLowerCase()) < 0) miss.push('text "' + v.text + '" not visible');
          if (miss.length) throw new Error(miss.join('; '));
        }
        else throw new Error('unknown walk step "' + k + '"');
        await idle();
      } catch (e) { fail = e.message; }
      lines.push((i + 1) + '. ' + label + (fail ? '  ✗ ' + fail : '  → ' + summary()));
      if (fail) { ok = false; if (!a.continueOnFail) break; }
    }
    var res = { ok: ok, transcript: lines.join('\n') };
    if (a.describeEnd !== false) res.final = describeScreen(device);
    log('walk', { ok: ok, steps: steps.length });
    return res;
  }
  var TOOL_MAP = {}; TOOLS.forEach(function (t) { TOOL_MAP[t.name] = t; });
  async function call(name, args) {
    var t = TOOL_MAP[name]; if (!t) throw new Error('Unknown tool "' + name + '". Tools: ' + Object.keys(TOOL_MAP).join(', '));
    log('tool', { name: name, args: args || {} });
    return t.run(args || {});
  }
  var mcpStatus = 'not available';
  function registerWebMCP() {
    var mc = navigator.modelContext;
    if (!mc) { mcpStatus = 'not available'; return; }
    var defs = TOOLS.map(function (t) {
      return { name: t.name, description: t.description, inputSchema: t.inputSchema, annotations: t.readOnly ? { readOnlyHint: true } : undefined,
        execute: async function (args) {
          try { var r = await call(t.name, args); return { content: [{ type: 'text', text: typeof r === 'string' ? r : JSON.stringify(r, null, 2) }] }; }
          catch (e) { return { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true }; }
        } };
    });
    try {
      if (typeof mc.provideContext === 'function') { mc.provideContext({ tools: defs }); mcpStatus = 'registered with navigator.modelContext.provideContext'; }
      else if (typeof mc.registerTool === 'function') { defs.forEach(function (d) { mc.registerTool(d); }); mcpStatus = 'registered with navigator.modelContext.registerTool'; }
    } catch (e) { mcpStatus = 'registration failed: ' + e.message; log('webmcp', e.message, 'e'); }
  }
  window.addEventListener('message', async function (e) {
    var d = e.data; if (!d || d.type !== 'fpk:call') return;
    var reply = { type: 'fpk:result', id: d.id };
    try { reply.result = await call(d.tool, d.args); } catch (err) { reply.error = err.message; }
    if (e.source) e.source.postMessage(reply, e.origin === 'null' || !e.origin ? '*' : e.origin);
  });

  // ---------- boot
  var readyResolve; var ready = new Promise(function (r) { readyResolve = r; });
  function boot() {
    SOURCE = '<!doctype html>\n' + document.documentElement.outerHTML;
    var q = new URLSearchParams(location.search);
    if (q.get('devices')) S.ui.devices = q.get('devices').split(',');
    if (q.get('scale')) S.ui.scale = q.get('scale');
    if (q.get('orientation')) S.ui.orientation = q.get('orientation');
    if (q.get('solo')) S.ui.solo = q.get('solo');
    readSource();
    $('#fpk-back').innerHTML = iconSvg('back') + 'Back';
    $('#fpk-reset').innerHTML = iconSvg('refresh') + 'Restart';
    $('#fpk-download').innerHTML = iconSvg('download') + '<span>Download</span>';
    $('#fpk-back').addEventListener('click', back);
    $('#fpk-reset').addEventListener('click', reset);
    $('#fpk-download').addEventListener('click', download);
    $('#fpk-theme').addEventListener('click', function () { setTheme(S.theme === 'dark' ? 'light' : 'dark'); });
    $('#fpk-view-select').addEventListener('change', function (e) { navigate(e.target.value); });
    $('#fpk-scale').addEventListener('change', function (e) { setPreview({ scale: e.target.value }); });
    $all('#fpk-tabs .fp-tab').forEach(function (b) { b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); }); });
    $('#fpk-log-clear').addEventListener('click', function () { S.log = []; renderInspector(); });
    function showIssues(r, prefix) { var ul = $('#fpk-issues'); ul.hidden = false; ul.innerHTML = (r.ok ? '<li style="color:var(--success)">' + (prefix || '') + 'No issues found.</li>' : r.issues.map(function (i) { return '<li style="color:var(--danger)">' + esc(i) + '</li>'; }).join('')) + (r.notes || []).map(function (n) { return '<li class="fp-muted">' + esc(n) + '</li>'; }).join(''); }
    $('#fpk-validate').addEventListener('click', function () { showIssues(validateSpec()); });
    $('#fpk-spec-apply').addEventListener('click', function () {
      try { applySpec(JSON.parse($('#fpk-spec-editor').value), { reset: true }); showIssues(validateSpec(), 'Applied. '); }
      catch (e) { var ul = $('#fpk-issues'); ul.hidden = false; ul.innerHTML = '<li style="color:var(--danger)">' + esc(e.message) + '</li>'; }
    });
    $('#fpk-body-apply').addEventListener('click', function () { S.bodies.views[$('#fpk-body-name').textContent] = '\n' + $('#fpk-body-editor').value + '\n'; renderAll(); });
    window.addEventListener('resize', function () { if (S.ui.tab === 'prototype') layout(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.overlay) closeOverlay(); });

    var theme = q.get('theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    renderStyleGuide();
    setTheme(theme);
    applySpec(S.spec, { reset: true });
    if (q.get('view') && S.spec.views[q.get('view')]) navigate(q.get('view'));
    showTab(q.get('tab') || 'prototype');
    layout();
    registerWebMCP();
    renderBaseBadge();
    $('#fpk-mcp-status').innerHTML = '<b>WebMCP:</b> ' + esc(mcpStatus) + '. Fallbacks: <code class="text-code">window.FPK.call(tool, args)</code> and the <code class="text-code">postMessage</code> bridge are always on. ' + TOOLS.length + ' tools.';
    renderAgentPanel();
    var v = validateSpec(); v.issues.forEach(function (i) { log('validate', i, 'w'); });
    document.documentElement.setAttribute('data-fpk-ready', 'true');
    log('ready', { view: current(), base: baseStatus().state, webmcp: mcpStatus });
    readyResolve(true);
  }

  window.FPK = {
    version: VERSION, ready: ready, boot: boot, call: call,
    tools: TOOLS.map(function (t) { return { name: t.name, phase: t.phase || 'any', description: t.description, inputSchema: t.inputSchema }; }),
    handler: function (name, fn) { HANDLERS[name] = fn; },
    on: function (fn) { listeners.push(fn); },
    navigate: function (v, r) { return navigate(v, r); }, back: back, reset: reset,
    getState: function () { return TOOL_MAP.fpk_get_state.run({}); }, walk: walk, exportHtml: exportHtml, baseStatus: function () { return baseStatus(); }, icons: Object.keys(ICONS)
  };
})();
