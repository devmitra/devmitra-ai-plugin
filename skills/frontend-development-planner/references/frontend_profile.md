# Frontend profile

Extends the SDD contract ([`sdd_contract.md`](sdd_contract.md), templates in [`sdd_templates.md`](sdd_templates.md)) for user-interface work. The planning skill (`frontend-development-planner`) and every stack programming skill (e.g. `swift-frontend-programming`) ship byte-identical copies of this file. A task that uses it lists `frontend` in `status.md` → `profiles`. Where this file and the contract differ, the contract wins.

## Index
[Terms](#terms) · [Layout additions](#layout-additions) · [Ownership additions](#ownership-additions) · [Profile gates](#profile-gates) · [Design in two parts](#design-in-two-parts) · [Document additions](#document-additions) · [Check additions](#check-additions) · [Earlier layout](#earlier-layout)

## Terms

- **`{feature}`**: the contract's kebab-case feature directory name. **`{feature_name}`**: the code-facing name of the same feature, formed as the stack guide says (e.g. a type-name prefix); source and test files are prefixed with it.
- **`{stack}`**: the stack whose guide matched; **`{project_name}`**: the project's name, derived as the planning skill says.
- **Component**: a request that says "component" means a feature.
- **Roles**: the planning role is `frontend-development-planner`; the building role is the stack programming skill the stack guide names.
- **Base**: the design-system base — the locked tokens, component styles, and devices that every feature preview is built on.
- **`status.md` keys** added by this profile: `stack`, `project_name`, `feature_name`.

## Layout additions

```
{root}/.agentic_coding/
  project/
    ux_design_specification.md     # project-wide UX spec, unless the repository has its own (DESIGN.md or equivalent)
    design_system/                 # the base (feature-preview-kit, Phase A)
      config.json  tokens.css  base.css  lock.json  base-preview.html
  features/{feature}/
    preview/                       # living feature preview (feature-preview-kit, Phase B)
      views.html  spec.json  logic.js  feature.css  {feature}.html
    tasks/{task_id}/
      verification-{n}.png         # optional: screenshots taken for acceptance
```

- `project/ux_design_specification.md` is a concept document with `type: UX Design Specification`. It and the base are listed under `# Project` in the bundle `index.md`:
  `* [UX design specification](project/ux_design_specification.md) - {description}` and `* [Design system](project/design_system/config.json) - {base name and version; locked | neutral kit}`.
- A feature's preview is listed under `# Spec` in its `index.md`: `* [Preview](preview/{feature}.html) - Clickable preview.`
- `design_system/` and `preview/` are written only through the `feature-preview-kit` skill, whose CLI runs with `--root {root}`. The base is project-wide: one per `{root}`, nearest wins, so each workspace of a monorepo has its own.

## Ownership additions

| Artifact | Written by | When |
|---|---|---|
| `project/ux_design_specification.md` | planning; links to the base for tokens and does not duplicate them | prerequisites (gate F1) |
| `project/design_system/` | planning, via `feature-preview-kit` Phase A | prerequisites (gate F1); never in the Design phase |
| `features/{feature}/preview/` | building, via `feature-preview-kit` Phase B | Design phase |
| task `ux_design.md` | building | Design phase |
| `verification-{n}.png` | building | Validation phase |

## Profile gates

| Gate | Approves | Asked by | When |
|---|---|---|---|
| **F1** | the UX design specification; the base, created, reused, or amended; and the UI architecture pattern with its conformance rules, when `project/architecture.md` lacks them | planning | before G2; may be batched with G0 |
| **F2** | project setup that creates or changes the project structure | building | before the first work item is built |

The contract's gates keep their meaning: **G3** approves `ux_design.md` together with the feature preview built on the locked base; **G4** is the human's verification of the built feature running in isolation.

## Design in two parts

1. **Planning** makes sure a locked base exists — reusing it, or setting it up with the human (F1). A plan cannot be approved without one when its design phase is `required`.
2. **The Design phase** builds the feature preview on that base. The base is never changed in the Design phase.

A **base gap** — a token, component, or device the locked base lacks — found in the Design phase is a revert: `phase_design: reverted`, `phase_plan: reverted`, `next: Plan`. The planning role amends and re-locks the base under F1, then returns through G2.

## Document additions

Each block is added after the core sections of the named template, in this order, keeping the core sections unchanged. Markers as in the templates.

### `status.md` frontmatter

```yaml
profiles: [frontend]
stack: {stack}
project_name: {project_name}
feature_name: {feature_name}
```

### `intent.md`

```markdown
## 6. Frontend inputs (required)
Each item ends with `Source: user | repo:<path> | spec | derived`.
- **Views and navigation**: {the views; how each is entered and left}
- **User interactions**: {per element: tap, selection, drag, scroll, toggle, text entry, or non-interactive → response}
- **User journey**: {initial → intermediate → final states, and the transitions between them}
- **Inputs, outputs, and validation**: {data passed in, results or events passed out, validation rule per input field — or `n/a`}
- **Design inputs** (full): {layout, transitions and animations, navigation presentation; must not contradict the UX spec}
- **Localization languages**: {list | development language only (flagged)}
- **Target path / module**: {path | derived from the architecture document}
```

For a `change` or `bugfix`, write only what differs and mark the rest `unchanged (spec)`.

### `plan.md`

```markdown
## 11. Feature model (full)
### Views
| View | Purpose | Entry | Exit |
|---|---|---|---|
### Navigation
{Who owns navigation (e.g. coordinator or router) and the routes.}
### User interactions
| Element | Interaction | Effect (state change or output) |
|---|---|---|
### State
| State | Kind | Owner | Mutability | Reactivity | Initial |
|---|---|---|---|---|---|
{Kind: input | output | internal. Mutability: immutable | mutated by owner only. Reactivity: how a change reaches the UI.}
### Feature API
{Initializer parameters, bindings, and output callbacks or events.}
### State transitions
{Initial → … → final, including loading, empty, and error.}

## 12. Design spec (required)
- **States to render**: {list}
- **Base**: {name, version, lock state}; {reused | set up | neutral kit}
- **Preview scope**: the views, overlays, and states to build in `features/{feature}/preview/`
- **Layout and token notes**: {references to base tokens and the UX spec}
- **Base gaps**: {`none`, or each gap and how F1 resolved it}
- **Accessibility requirements**: {labels, roles, reading and focus order, text scaling, targets, contrast, motion}

## 13. Frontend technical spec (required)
### Dependencies and injection
| Dependency (interface) | Live implementation | Mock / preview fixture | Injected via |
|---|---|---|---|
### Integration
{How the host app wires the feature (composition root) and what it must inject.}
### Isolation harness
{How previews and UI tests show the feature alone, with mocks, in each planned state.}
### Localization (full)
```

The design-phase decision stays in `1. Scope`; file placement stays in `4. Module map` (one layer or role per file, from the architecture document); error handling, logging, security, performance, and third-party dependencies stay in `6. Cross-cutting`.

### `validation.md`

No added sections. In `Validation plan`:
- **Levels**: unit tests of business logic and view models are `unit`; a UI test of a critical flow is `e2e`; the accessibility audit of each new view is an `e2e` case; each state the human will verify on a simulator, device, or window is a `manual` case.
- **Environment** names where the human will see the feature (simulator, device, or window) and how the isolation harness launches it.
- Screenshots taken for acceptance are saved as `verification-{n}.png` in the task directory and named in `Acceptance` → `Shown how`.

### `ux_design.md`

```markdown
## Tokens
| Element | Token | Base / UX spec reference |
|---|---|---|
{A token the base lacks is a base gap: record it in the review log and revert; never add it in this phase.}

## Appearance
{Light and dark, text-size range, right-to-left, long strings, size classes or breakpoints.}

## Feature API
{Must match plan.md → Feature API.}
```

`Prototype` links the built preview: `[{feature}.html](../../preview/{feature}.html)` — built with `feature-preview-kit`; base {name} {version}.

### `spec.md`

```markdown
## Feature model
{As built: views, navigation owner, state table, and feature API.}

## Preview
[{feature}.html](preview/{feature}.html) — base {name} {version}.
```

`Interfaces and data` also records the integration notes: what the host app must inject and where the feature is wired.

## Check additions

- **Intent validation**: `Frontend inputs` is filled, and nothing contradicts the UX design specification.
- **Lite conditions**: additionally, no new view, navigation, or state.
- **Plan completeness**:
  1. `stack`, `project_name`, and `feature_name` are set in `status.md`, and a stack guide exists for the stack.
  2. When the design phase is `required`: `project/design_system/lock.json` exists and the base is unmodified; every view and state of the `Feature model` is in the `Preview scope`; no base gap is unresolved.
  3. Every row of `Dependencies and injection` has a mock; the isolation harness is planned as `Module map` rows.
  4. Every piece of state has one owner; no state is duplicated across owners.
  5. Every new view has an accessibility-audit case in the validation plan, and `Accessibility requirements` is filled.
- **Hard gate** (Design phase): the base recorded in `plan.md` → `Design spec` is locked and unmodified.

## Earlier layout

Read the earlier names as below; write only the current ones. `feature-preview-kit`'s `fpk migrate` moves the two preview-kit directories.

| Earlier | Current |
|---|---|
| `base/` at the bundle root | `project/design_system/` |
| `feature/{feature_slug}/` at the bundle root | `features/{feature}/preview/` |
| `{root}/.design/{project_name}_design_specification.md` | `project/ux_design_specification.md` |
| `feature:` / `component:` key holding the code-facing name; `{feature_slug}` | `feature_name:`; `feature:` holds `{feature}` |
| gates P1 / P2 / P3 / P4 | G1 / F1 / G0 or F1 / G2 |
| gates D1 / D2 / D3 | F2 / G3 / G4 |
| `status.md` → `Development progress` / `Failures and blockers` | `status.md` → `Progress` / `Blockers` |
| `status.md` → `Build and test runs` / `Conformance` / `User verification` | `validation.md` → `Run log` / `Conformance` / `Acceptance` |
| `plan.md` → `Architecture mapping` / `Test spec` | `plan.md` → `Module map` / `validation.md` → `Validation plan` |
