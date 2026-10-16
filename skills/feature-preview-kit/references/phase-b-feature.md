# Phase B: feature prototype

## Files in `.agentic_coding/feature/<slug>/`

| File | Content |
|---|---|
| `views.html` | One `<template data-fpk-view="id" …settings…>` per screen and one `<template data-fpk-overlay="id">` per sheet or dialog. The first view is the start view. |
| `spec.json` | `{ meta: {name, description, baseUrl?}, state: {…}, actions: {…}, tabBar?: {items:[{view,label,icon}]}, views?: {id: overrides}, initialView? }` |
| `logic.js` | Optional: `FPK.handler('name', async (ctx) => …)` |
| `feature.css` | Optional: feature-prefixed classes, tokens only |

## Minimal example

`views.html`
```html
<template data-fpk-view="list" data-title="Team" data-route="/team" data-layout="narrow" data-back="false"
          data-actions='[{"icon":"plus","label":"Invite","overlay":"invite"}]'>
  <ul class="fp-list" data-fp-if="members" data-fp-each="members as m">
    <li><button class="fp-list-item" type="button" data-fp-set="sel={{m.id}}" data-fp-nav="detail">
      <span class="fp-avatar">{{m.initials}}</span>
      <span class="fp-list-text"><span class="fp-list-title">{{m.name}}</span><span class="fp-list-sub">{{m.role}}</span></span>
      <i data-fp-icon="chev" class="fp-chevron"></i></button></li>
  </ul>
  <div class="fp-alert" data-fp-if="!members"><i data-fp-icon="info"></i><div><strong>No members yet</strong>Invite your first teammate.</div></div>
</template>

<template data-fpk-view="detail" data-title="Member" data-route="/team/{{sel}}" data-back="auto">
  <p class="text-body">Member {{sel}}</p>
</template>

<template data-fpk-overlay="invite">
  <h3 class="text-h3 fp-h">Invite member</h3>
  <form data-fp-submit="sendInvite" novalidate>
    <div class="fp-field"><label class="fp-label" for="em">Email</label>
      <input class="fp-input" id="em" type="email" data-fp-bind="inviteEmail">
      <span class="fp-help fp-help-error" data-fp-error="inviteEmail"></span></div>
    <button class="fp-btn fp-btn-primary fp-btn-block" type="submit" data-fp-disabled="loading">
      <span data-fp-if="!loading">Send invite</span><span data-fp-if="loading">Sending…</span></button>
  </form>
</template>
```

`spec.json`
```json
{ "meta": { "name": "Team list", "description": "Browse and invite members." },
  "state": { "members": [{ "id": 1, "name": "Asha Kumar", "role": "Designer", "initials": "AK" }], "sel": null, "inviteEmail": "", "loading": false },
  "actions": { "sendInvite": [
    { "validate": { "inviteEmail": ["required", "email"] } },
    { "set": { "loading": true } }, { "wait": 600 }, { "set": { "loading": false } },
    { "close": true }, { "toast": "Invite sent to {{inviteEmail}}" } ] } }
```

For a complete reference (filters, handlers, delete confirm, settings), run `fpk new tasks-demo --demo` and read its `views.html`, `spec.json` and `logic.js`.

## Checklist
- **Every screen is a view; every modal is an overlay.** Use an `auto` overlay so the base decides between sheet and dialog.
- **Show the states:** empty (`data-fp-if="!list"`), loading (`loading` flag + `wait`), error (a `validate` or `error` step), success (a toast or a result view).
- **Every `data-fp-bind` path has an initial value in `state`.** One primary button per view; visible labels; error text that says how to fix the problem.
- **Add `tabBar` only if the feature has peer views.** The base renders it as a tab bar, sidebar or top nav.
- **Wide screens:** `data-layout="card"` (forms) or `narrow` (lists). Use `data-fp-only="wide"` or `"phone"` only for genuinely different content.
- **Base gaps:** if you need a colour, component or device the base lacks, report it as a gap. Don't edit `.agentic_coding/base/`.

## Verify
1. `fpk validate <slug>` must print `OK`.
2. `fpk build <slug>`.
3. With a browser, open `.agentic_coding/feature/<slug>/<slug>.html` and run one `fpk_walk` per path (see `runtime-tools.md`). Check `?theme=dark` once.
4. `fpk check <slug>` must print `UP TO DATE`.
5. Report the built file, the paths walked (pass/fail), the states covered and any base gaps.
