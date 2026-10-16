# Artifact templates

Templates for the documents defined in [`change_artifacts.md`](change_artifacts.md). Both skills ship byte-identical copies of this file. Replace `{placeholders}`; keep headings and their order. Section markers: **(required)**, **(full)** = required on the full track and optional on lite, **(optional)** = write `n/a` or `unchanged (baseline)` when it doesn't apply.

## Index
[Bundle index](#bundle-indexmd) · [Feature index](#feature-indexmd) · [log.md](#logmd) · [status.md](#statusmd) · [intent.md](#intentmd) · [plan.md](#planmd) · [design.md](#designmd) · [report.md](#reportmd) · [Baselines](#baselines)

## Bundle `index.md`

```markdown
---
okf_version: 0.2
---
# Repository knowledge
* [Architecture and design patterns](design_and_architecture_patterns.md) - {description}
* [UX design specification]({relative path to the UX spec}) - {description}
* [Design-system base](base/config.json) - {base name and version, locked | neutral kit}
* [History](log.md) - Prerequisites and features added over time.

# Features
* [{feature_name}]({feature_name}/index.md) - {one-line purpose}
```

## Feature `index.md`

```markdown
# Baseline
* [Intent]({feature_name}_intent.md) - {description}
* [Design]({feature_name}_design.md) - {description}
* [Prototype](../feature/{feature_slug}/{feature_slug}.html) - Baseline HTML preview.
* [History](log.md) - Changes opened, reverted, and completed.

# Open change: {change_dir}
* [Status](changes/{change_dir}/status.md) - {type} ({track}): {description}
* [Intent](changes/{change_dir}/intent.md) - {description}
* [Plan](changes/{change_dir}/plan.md) - {description}
* [Design](changes/{change_dir}/design.md) - {description, only if the design phase is required}

# Completed changes
* [{change_dir}](changes/{change_dir}/report.md) - {type}: {description}
```

Omit a baseline entry until the document exists. At completion, move the change's entries to `Completed changes` as a single link to its report.

## `log.md`

```markdown
# {Feature name or "Repository"} update log

## {yyyy-mm-dd}
* **Completion**: [{change_dir}](changes/{change_dir}/report.md) completed; baseline intent and design updated.
* **Revert**: [{change_dir}](changes/{change_dir}/status.md) design → plan: {trigger}.
* **Creation**: Opened [{change_dir}](changes/{change_dir}/status.md) ({type}, {track}).
```

## `status.md`

```markdown
---
type: Change Status
title: "{feature_name}: {slug}"
description: Phase state and handoff for {type} {slug}.
generated: { by: {actor}, at: {iso_datetime} }
change_type: {feature | change | bugfix}
track: {full | lite}
feature: {feature_name}
also_touches: []
project_name: {project_name}
stack: {stack}
root: {path of {root} relative to the repository root, "." when equal}
plan_revision: 0           # plan revision the current plan approval applies to
phase_plan: pending        # pending | in_review | approved | reverted
phase_design: pending      # pending | in_review | approved | skipped | reverted
phase_dev: pending         # pending | in_progress | blocked | in_review | done
next: Plan                 # Plan | Design | Development | Verification | done
open_questions: 0          # count only; questions live in plan.md → Open questions
---
# {feature_name}: {slug} — status

## Index
[Approvals](#approvals) · [Reverts](#reverts) · [Assumptions](#assumptions) · [Development progress](#development-progress) · [Conformance](#conformance) · [Build and test runs](#build-and-test-runs) · [Failures and blockers](#failures-and-blockers) · [User verification](#user-verification)

## Approvals
| Gate | Artifact (revision) | Decision | By | At | Notes |
|---|---|---|---|---|---|

## Reverts
| At | From phase | Trigger | Conflicts with (document › section) |
|---|---|---|---|

## Assumptions
{Auto-approve mode only: one bullet per assumption or self-approved gate.}

## Development progress
| Work item | Plan rev | State | Files | Evidence |
|---|---|---|---|---|
{State: todo | doing | done | blocked. One row per plan work item, in plan order.}

## Conformance
| Item | Result | Evidence (file › symbol) |
|---|---|---|

## Build and test runs
| At | Command (summary) | Destination | Result |
|---|---|---|---|

## Failures and blockers
| ID | At | Step | Error (redacted excerpt) | Attempts | Status | Next action |
|---|---|---|---|---|---|---|
{Status: open | resolved | needs-user.}

## User verification
| Round | At | Shown on | Remark | Classification | Action |
|---|---|---|---|---|---|
{Classification: within plan | conflicts with intent/plan/design.}
```

## `intent.md`

Owned by the planner. For a `change`/`bugfix`, write only what is added or altered and mark the rest `unchanged (baseline)`.

```markdown
---
type: Change Intent
title: "{feature_name}: {slug} intent"
description: {One sentence: what changes and why.}
status: draft
generated: { by: {actor}, at: {iso_datetime} }
---
# {feature_name} — intent ({type})

## Index
[Summary](#summary) · [Functional specification](#functional-specification) · [Design inputs](#design-inputs) · [Technical inputs](#technical-inputs) · [Acceptance criteria](#acceptance-criteria) · [Security and privacy](#security-and-privacy) · [Out of scope](#out-of-scope)

## Summary (required)
- **Purpose**: {what the feature is for, or what this change fixes}
- **Task type**: {feature | change | bugfix}
- **Feature name**: {feature_name} — {user-given | proposed and approved on {date}}
- **Proposed track**: {full | lite} — {reason}

## Functional specification (required)
Each item: content, then `Source: user | repo:<path> | baseline | derived`.
### Views and navigation
{Views in the feature; how each is entered and exited.}
### User interactions
{Per element: tap, selection, drag, scroll, toggle, pan/zoom, multi-tap, or non-interactive → response.}
### User journey
{Initial → intermediate → final states, and the transitions between them.}
### Inputs, outputs, and validation
{Data passed in, results/events passed out, and validation rules per input field (or `n/a`).}

## Design inputs (full)
{Layout (orientation, scroll/split/grid/list/card), transitions and animations, navigation presentation. Must not contradict the UX spec.}

## Technical inputs (required)
- **Integration**: {data sources, services, global state, other UI presented}
- **Localization languages**: {list | development language only (flagged)}
- **Target path/module**: {path | derived from the architecture document}
- **Platforms**: {derived from the UX spec unless the change alters them}

## Acceptance criteria (required)
1. **AC1**: {observable result}

## Security and privacy (required)
{Sensitive data handled, permissions needed, or `none`.}

## Out of scope (optional)
```

## `plan.md`

Owned by the planner. Every edit, including an intent edit, adds a `Change tracker` row and raises the revision.

```markdown
---
type: Change Plan
title: "{feature_name}: {slug} plan"
description: {One sentence: what will be built and how it is verified.}
status: draft
revision: 1
generated: { by: {actor}, at: {iso_datetime} }
---
# {feature_name} — plan ({type}, {track})

## Index
[Change tracker](#change-tracker) · [Open questions](#open-questions) · [1. Scope](#1-scope) · [2. Existing work](#2-existing-work) · [3. Feature model](#3-feature-model) · [4. Design spec](#4-design-spec) · [5. Technical spec](#5-technical-spec) · [6. Test spec](#6-test-spec) · [7. Work items](#7-work-items) · [8. Conformance checklist](#8-conformance-checklist)

## Change tracker
| Rev | At | By | Sections | Change | Trigger |
|---|---|---|---|---|---|
| 1 | {iso_datetime} | {actor} | all | Initial plan | {user request} |
{Trigger: user request | review feedback | open question Qn | revert (status.md → Reverts).}

## Open questions
| ID | Raised (phase, by) | Question | State | Answer → sections updated |
|---|---|---|---|---|
{State: open | answered. The plan cannot be approved while any question is open.}

## 1. Scope (required)
- **Type / track**: {type} / {track} — {lite eligibility reasoning, or why full}
- **Feature / also touches**: {feature_name} / {list or none}
- **Root / stack / project**: {root} / {stack} / {project_name}
- **References**: [architecture]({path}) · [UX spec]({path}) · [baseline intent]({path}) · [baseline design]({path})

## 2. Existing work (required)
{Baseline differences; features to reuse or extract; partial work to continue.}

## 3. Feature model (full)
### Views
| View | Purpose | Entry | Exit |
|---|---|---|---|
### Navigation
{Who owns navigation (e.g. coordinator/router) and the routes.}
### User interactions
| Element | Interaction | Effect (state change or output) |
|---|---|---|
### State
| State | Kind | Owner | Mutability | Reactivity | Initial |
|---|---|---|---|---|---|
{Kind: input | output | internal. Mutability: immutable | mutated by owner only. Reactivity: how a change propagates to the UI.}
### Feature API
{Initializer parameters, bindings, and output callbacks/events.}
### State transitions
{Initial → … → final, including loading, empty, and error.}

## 4. Design spec (required)
- **Design phase**: {required | skipped} — {reason}
- **States to render**: {list}
- **Design-system base**: {name, version, lock state, path}; {reused | set up | neutral kit}
- **Preview scope**: {feature_slug}; views, overlays, and states to build in `feature/{feature_slug}/`
- **Layout and token notes**: {references to base tokens and UX spec}
- **Accessibility requirements**: {labels, traits, reading order, Dynamic Type, targets, contrast, motion}

## 5. Technical spec (required)
### Architecture mapping
| File | Layer / role | May depend on | Must not depend on |
|---|---|---|---|
### Dependencies and injection
| Dependency (protocol) | Live implementation | Mock / preview fixture | Injected via |
|---|---|---|---|
### Integration
{How the host app wires the feature (composition root) and what it must inject.}
### Error handling (full)
### Logging (full)
### Security and privacy (required)
{Data classification, storage, transport, permissions/privacy declarations.}
### Accessibility (full)
### Localization (full)
### Performance (full)
### Third-party dependencies (required)
{`none`, or name, version, license, vulnerability check — needs approval at the plan gate.}

## 6. Test spec (required)
| ID | Level | Subject | Scenario | Covers |
|---|---|---|---|---|
{Level: unit | UI | accessibility audit. Bugfix: reproduction and regression test rows.}
- **Isolation harness**: {how previews and UI tests show the feature alone with mocks, per state}
- **User verification**: {where the user will see it: simulator/device/Mac window, and which states}

## 7. Work items (required)
| ID | Task | Files | Depends on | Covers |
|---|---|---|---|---|

## 8. Conformance checklist (required)
| ID | Rule | Source |
|---|---|---|
{Source: architecture conformance rule | plan guardrail.}
```

## `design.md`

Owned by the programming skill; required only when `plan.md` → `Design spec` says `required`.

```markdown
---
type: Change Design
title: "{feature_name}: {slug} design"
description: {One sentence: what the design covers.}
status: draft
revision: 1
plan_revision: {n}
generated: { by: {actor}, at: {iso_datetime} }
---
# {feature_name} — design

## Index
[Revisions](#revisions) · [Layout](#layout-and-structure) · [Tokens](#tokens) · [States](#states) · [Interactions](#interactions) · [Appearance](#appearance) · [Accessibility](#accessibility) · [Feature API](#feature-api) · [Prototype](#prototype) · [Review log](#review-log)

## Revisions
| Rev | At | Change | Trigger |
|---|---|---|---|

## Layout and structure
## Tokens
| Element | Token | Base / UX spec reference |
|---|---|---|
{Tokens the base lacks are base gaps: record them in the review log and revert to planning; never add them in this phase.}
## States
| State | Visual | Trigger |
|---|---|---|
## Interactions
{Gestures, transitions, animations, haptics, navigation; Reduce Motion behaviour.}
## Appearance
{Light/dark, Dynamic Type range, right-to-left, long strings, size classes.}
## Accessibility
| Element | Label | Traits | Hint | Order |
|---|---|---|---|---|
{Touch targets, contrast results, Reduce Motion/Transparency, keyboard focus.}
## Feature API
{Must match plan.md → Feature API.}
## Prototype
[{feature_slug}.html](../../../feature/{feature_slug}/{feature_slug}.html) - built with `feature-preview-kit`; base {name} {version}.
## Review log
| Round | At | Feedback | Classification | Action |
|---|---|---|---|---|
{Classification: design revision | conflicts with intent/plan (→ revert).}
```

## `report.md`

Owned by the programming skill; the final handoff for the change.

```markdown
---
type: Change Report
title: "{feature_name}: {slug} report"
description: {One sentence: what was delivered and its verification result.}
status: stable
generated: { by: {actor}, at: {iso_datetime} }
---
# {feature_name} — report ({type}, plan rev {n})

## Index
[Summary](#summary) · [Delivered files](#delivered-files) · [Tests](#tests) · [Acceptance criteria](#acceptance-criteria) · [Conformance](#conformance) · [User verification](#user-verification) · [Failures](#failures-and-resolutions) · [Integration notes](#integration-notes) · [Follow-ups](#follow-ups)

## Summary
## Delivered files
| File | Layer / role | Purpose |
|---|---|---|
## Tests
{Commands (summary), destination, passed/failed/skipped counts.}
## Acceptance criteria
| AC | Result | Evidence (test ID or verification round) |
|---|---|---|
## Conformance
{Link to status.md → Conformance, with any notes.}
## User verification
{Remarks and how each was resolved.}
## Failures and resolutions
## Integration notes
{What the host app must inject and where to wire the feature.}
## Follow-ups
{Open items, deviations approved by the user, suggested next changes.}
```

## Baselines

`{feature_name}_intent.md` and `{feature_name}_design.md` use the `intent.md` and `design.md` templates with `type: Component Intent` / `Component Design`, the full (not delta) content, and a `Source changes` list linking every change that shaped them, newest first. The baseline prototype is the preview in `feature/{feature_slug}/`. Drop the `Proposed track` line and the `Revisions`/`Review log` sections.
