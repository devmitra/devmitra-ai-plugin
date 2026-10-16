---
name: feature-preview-kit
description: Build clickable single-file HTML prototypes of ONE feature, flow or UI component, shown in sync on iPhone, Android, tablet and web, styled with the repo's own design system. Use when asked to prototype, mock up, preview or demo a feature/screen/component, or to set up or import a design system (from code, tokens, Figma, PDF, website or screenshots) for such previews. All artifacts go in .agentic_coding/ at the repo or workspace root.
---

# Feature Preview Kit

You write small source files; a script builds a self-contained HTML preview. Never hand-edit built HTML.

```
.agentic_coding/
  base/              Phase A — once per repo
    config.json        brand, devices, nav/overlay styling, style-guide notes
    tokens.css         fonts, colours (light + dark), type, spacing, radius, component tokens
    base.css           repo-specific component overrides / extra base components
    lock.json          written by `lock`
    base-preview.html  built: style guide + demo feature
  feature/<slug>/    Phase B — one per prototype
    views.html  spec.json  feature.css  logic.js   →  <slug>.html (built)
```

CLI (no dependencies, Node 16+). Below, `fpk` = `node <this-skill-dir>/scripts/fpk.js`:

| Command | Use |
|---|---|
| `fpk init` · `fpk build --base` · `fpk lock --version 1.0.0` | Phase A: create, review, lock the base |
| `fpk new <slug> --name "…"` (`--demo` = full reference feature) | Phase B: start a feature |
| `fpk validate <slug>` · `fpk build <slug>` · `fpk check <slug>` | Phase B: static checks, build, freshness |
| `fpk build --all` | rebuild every feature after a base change |
| `fpk extract <file.html> <slug> [--base]` | import an existing standalone kit HTML |
| `fpk list` · `fpk info [slug]` | overview |

## Token budget rules
- **Never read** built `*.html` files or anything in `assets/core/`. They are large and you don't need them.
- Read a `references/` file only when the step below points to it.
- Check with `fpk validate` first (no browser). In a browser, prefer one `fpk_walk` call over many taps or screenshots.

## Which phase?
- **Phase A:** the user asks to set up or import a design system, **or** `.agentic_coding/base/lock.json` is missing when a feature is requested. If it's missing and the user just wants a quick preview, ask: "set up the design system first, or use the neutral kit?" The neutral kit is `fpk init` then `fpk lock` with no edits.
- **Phase B:** everything else (prototype a feature or component).

## Phase A: design-system base (read `references/phase-a-base.md`)
1. `fpk init`.
2. Extract values from the user's sources (ranked: code > token files > Figma > PDF > website > images). Write `tokens.css`, `config.json` and `base.css`. Never invent brand values; record derived or approximate ones in `config.json` → `base.notes`.
3. `fpk build --base`, open `base/base-preview.html`, and run `fpk_check_contrast` (all pairs must pass in light and dark). Click through the demo on every device.
4. `fpk lock --version 1.0.0`. Report the sources, the derived values and the contrast results.

## Phase B: feature prototype (read `references/phase-b-feature.md`; look up `references/syntax.md` and `references/components.md` as needed)
1. `fpk new <slug> --name "<Feature>"`.
2. Plan views (screens), overlays (sheets/dialogs) and states (empty, loading, error, success) from the request.
3. Write `views.html`: one `<template>` per view or overlay, with view settings on the tag. Use `fp-*` components and `data-fp-*` behaviour.
4. Write `spec.json`: `meta`, initial `state` for every bound field, `actions` (step DSL), and an optional `tabBar`.
5. Add `logic.js` handlers only for logic the DSL can't express. Add `feature.css` only if the components don't cover it (tokens only).
6. Run `fpk validate <slug>` and fix every ✗. Then `fpk build <slug>`.
7. If you have a browser tool, open the built file and run `FPK.call('fpk_walk', {steps:[…]})` for each path (happy path, validation errors, overlays, back, nav). See `references/runtime-tools.md`.
8. Report: path to `<slug>.html`, the views and paths covered, and any **base gaps** (things the base lacked; propose them as a Phase A change, never edit the base in Phase B).

## Hard rules
- Phase B never edits `.agentic_coding/base/`. The build refuses a changed base.
- One feature per folder; no app around it. Nav items for other areas can point to placeholder views.
- Use tokens only: no raw colours, sizes or fonts. No `<script>` or `on*=` in templates.
- Prefer the base's extra components (listed in its style guide) over new feature CSS.
