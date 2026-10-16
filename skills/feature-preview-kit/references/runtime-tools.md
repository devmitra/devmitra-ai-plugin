# In-browser tools (built previews)

Every built preview exposes the same tools three ways:
- **WebMCP:** `navigator.modelContext`, when the browser provides it.
- **JavaScript:** `await FPK.call(name, args)`, after `await FPK.ready`.
- **postMessage:** `{type:'fpk:call', id, tool, args}` is answered with `{type:'fpk:result', id, result|error}`.

## `fpk_walk`: test a whole path in one call
```js
await FPK.ready;
await FPK.call('fpk_walk', { steps: [
  { tap: 'Sign in' },                                   // text, or {text|selector|bind, device}
  { expect: { view: 'signin', errors: ['email'] } },
  { type: { email: 'a@b.co', password: 'secret123' } }, // bind path → text
  { tap: 'Sign in' },                                   // waits for simulated latency automatically
  { expect: { view: 'verify', errors: false } },
  { describe: 'web' }                                   // outline of one device
]});
// → { ok, transcript: "1. tap \"Sign in\"  → view=signin errors=email:\"This field is required.\" …", final: "<outline>" }
```
- **Other steps:** `{nav:'view'}`, `{back:true}`, `{reset:true}`, `{set:{path:value}}`, `{wait:ms}`.
- **`expect` keys:** `view`, `text`, `errors` (an array, or `false`), `overlay` (an id, or `false`), `toast`.
- **Options:** `device` (default: the first device), `continueOnFail`, `describeEnd:false`.

## Other tools

| Tool | Use |
|---|---|
| `fpk_describe` | Base, devices and feature summary |
| `fpk_describe_screen {device}` | Text outline of a screen (use it instead of a screenshot) |
| `fpk_validate` | Runtime checks, plus whether the built file was hand-edited |
| `fpk_get_state` · `fpk_set_state {patch, errors}` | Read, or force a state (e.g. preview an error or empty state) |
| `fpk_navigate {view}` · `fpk_back` · `fpk_reset` · `fpk_tap` · `fpk_type` | Single interactions |
| `fpk_set_preview {devices, scale, orientation, solo, tab}` · `fpk_set_theme {theme}` | Preview controls |
| `fpk_check_contrast` | Phase A: WCAG pairs in both themes |
| `fpk_get_log` | Recent events and warnings |

Runtime editing tools (`fpk_upsert_view`, `fpk_set_tokens`, …) exist, but their changes aren't saved to the sources. Edit the files and rebuild instead.

## URL parameters
`?view=<id>&theme=dark&devices=ios,web&solo=ios&scale=1&orientation=landscape&tab=styleguide`. Readiness is signalled by `html[data-fpk-ready="true"]`. For a final screenshot, use `solo=<device>&scale=1` and capture `#fpk-device-<id>`.
