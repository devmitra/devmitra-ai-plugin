# Syntax reference

## Template tag settings
`<template data-fpk-view="id" …>`. `spec.views.<id>` can override any of these with the same keys (`title`, `route`, `layout`, `appBar`, `tabBar`, `onEnter`).

| Attribute | Values | Default |
|---|---|---|
| `data-title` | text, `{{expr}}` allowed | the view id |
| `data-route` | URL path shown in the web frame, `{{expr}}` allowed | `/<id>` |
| `data-layout` | `card` (centred card up to 480px on wide screens) · `narrow` (up to 640px) · `full` · `flush` | `card` |
| `data-back` | `auto` (shown when there is history) · `true` · `false` | `auto` |
| `data-appbar` | `false` hides the app bar | shown |
| `data-actions` | JSON `[{"icon","label","action"\|"nav"\|"overlay"\|"toast"}]` (app-bar icon buttons) | none |
| `data-tabbar` | `false` hides the feature nav on this view | shown |
| `data-onenter` | action or handler run on arrival | none |

Overlays: `<template data-fpk-overlay="id" data-type="auto|sheet|dialog">`.

## Behaviour attributes (inside templates)

| Attribute | Effect |
|---|---|
| `data-fp-nav="view"` · `data-fp-replace="view"` · `data-fp-back` · `data-fp-reset` · `data-fp-tab="view"` | Navigate: push / replace / pop (or close the overlay) / restart / switch nav root |
| `data-fp-action="name"` | Run an action (spec) or a handler (logic.js) |
| `data-fp-submit="name"` on `<form>` | Run on submit. The submit button must not also have `data-fp-action`. |
| `data-fp-overlay="id"` · `data-fp-close` | Open / close an overlay (the scrim and Esc also close it) |
| `data-fp-toast="text {{x}}"` | Toast |
| `data-fp-set="a=1; b='x'; c={{item.id}}"` · `data-fp-toggle="path"` | Set state (runs before the other behaviours) / flip a boolean |
| `data-fp-bind="path"` | Two-way binding for an input, select, textarea, checkbox or radio. Clears its error on input. |
| `data-fp-live` | With a bind: re-render on every keystroke (live filters) |
| `data-fp-error="path"` | Shows that field's error; hidden when there is none |
| `data-fp-if="expr"` · `data-fp-disabled="expr"` · `data-fp-text="expr"` · `data-fp-class="cls: expr; cls2: expr"` | Conditional show / disable / text / classes |
| `data-fp-each="list as item"` | Repeat children; inside, use `{{item.x}}` and `{{index}}` |
| `data-fp-icon="name"` on `<i>` | Built-in icon (classes are kept) |
| `data-fp-only="phone wide ios android tablet web <deviceId>"` | Render only on matching devices |
| `{{expr}}` | Interpolation in text and attributes (escaped) |

Write normal `id` / `for` pairs; they are namespaced per device automatically.

## Expressions
- **Paths:** `email`, `cart.items.length`, `items[0].name` read from state.
- **Prefixes:** `state.`, `errors.`, `meta.`, `brand.`, `view`, `platform` (device kind), `device` (device id), plus loop aliases.
- **Literals:** `'text'`, numbers, `true`, `false`, `null`.
- **Operators:** `!`, `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`. There are no parentheses and no arithmetic; use a handler for those. An empty array counts as false.

## Action steps (`spec.actions.<name>`: an array, run in order)
A failed `validate`, or an `error` step, stops the list.

| Step | Example |
|---|---|
| `set` | `{"set":{"loading":true,"draft.name":"{{name}}"}}`. A value that is a single `{{expr}}` keeps its type. |
| `toggle` · `increment` · `decrement` | `{"toggle":"open"}` `{"increment":"qty"}` `{"decrement":{"path":"qty","by":2}}` |
| `push` · `remove` | `{"push":{"path":"items","value":{…}}}` `{"remove":{"path":"items","where":{"id":"{{sel}}"}}}` or `{"index":0}` |
| `validate` | `{"validate":{"email":["required","email"],"pin":["digits:4\|Enter your 4-digit PIN."]}}` |
| `error` · `clearErrors` | `{"error":{"code":"That code has expired."}}` (stops the list) |
| `navigate` · `replace` · `back` · `reset` · `tab` | `{"navigate":"detail"}` `{"navigate":{"view":"done","replace":true}}` `{"back":true}` |
| `overlay` · `close` · `toast` | `{"overlay":"confirm"}` `{"close":true}` `{"toast":"Saved {{name}}"}` |
| `wait` | `{"wait":600}` (simulated latency; pair it with a `loading` flag) |
| `if` | `{"if":"code == '000000'","then":[…],"else":[…]}` |
| `run` · `log` | `{"run":"otherActionOrHandler"}` `{"log":"x={{x}}"}` |

**Validation rules** take the form `rule[:arg][|message]`: `required` `email` `minLength:n` `maxLength:n` `digits:n` `number` `min:n` `max:n` `pattern:regex` `equals:path` `checked`.

## Handlers (`logic.js`)
```js
FPK.handler('loadSelected', (ctx) => {
  ctx.set('selected', (ctx.get('items') || []).find((i) => String(i.id) === String(ctx.get('sel'))) || null);
});
```
The `ctx` object provides: `state`, `errors`, `platform`, `device`, `get(path)`, `set(path, value | {path: value})`, `navigate(view, {replace})`, `back()`, `reset()`, `openOverlay(id)`, `closeOverlay()`, `toast(text)`, `setError(field, msg)`, `clearErrors()`, `run(steps)`, `wait(ms)` and `log(x)`. Return `false` to stop the calling step list. No network calls.
