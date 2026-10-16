# Change artifacts contract

Shared handoff between the planning skill (`frontend-development-planner`) and the stack programming skill (e.g. `swift-frontend-programming`). Both skills ship byte-identical copies of this file and of [`artifact_templates.md`](artifact_templates.md). The artifacts, not the conversation, carry context between sessions and phases.

## Index
[Knowledge bundle (OKF)](#knowledge-bundle-okf) · [Terminology and compatibility](#terminology-and-compatibility) · [Layout](#layout) · [Discovery](#discovery) · [Ownership](#ownership) · [Phases and approvals](#phases-and-approvals) · [Task types and tracks](#task-types-and-tracks) · [Sources of truth](#sources-of-truth) · [Validation](#validation) · [Security and privacy](#security-and-privacy) · [Rules](#rules)

## Knowledge bundle (OKF)

`{root}/.agentic_coding/` is a knowledge bundle in [Open Knowledge Format (OKF) v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md). It holds the repo-wide architecture plus every feature's baseline and changes.

- **Concept documents** (every `.md` except `index.md` and `log.md`) start with YAML frontmatter: `type` (required, from the table below), `title`, `description` (one sentence), `status: draft | stable | deprecated`, and `generated: { by: <actor>, at: <ISO 8601 UTC> }`. Extra keys (e.g. phase fields in `status.md`) are allowed.
- **Approval**: an approved document gets `status: stable` and a `verified` entry `{ by: <actor>, at: <ISO 8601 UTC> }`. A superseded baseline document is never deleted; set `status: deprecated`.
- **Actors**: `human:{id}` for the user (`{id}` = git `user.name`, else `user`; never an email), `{skill-name}/{plugin version}` for an agent (e.g. `frontend-development-planner/0.3.0`).
- **`index.md`** (reserved, no frontmatter except `okf_version: 0.2` in the bundle root): `# Heading` sections of `* [Title](path) - description` entries, where the description is the linked document's frontmatter `description`.
- **`log.md`** (reserved, no frontmatter): newest-first `## YYYY-MM-DD` sections of `* **Creation|Update|Revert|Completion**: <prose with links>` entries.
- **Links** are relative Markdown paths (OKF §6.1 relative form), so they stay clickable in editors and on Git hosts.

| Document | `type` |
|---|---|
| `design_and_architecture_patterns.md` | `Architecture` |
| `{feature_name}_intent.md` / `{feature_name}_design.md` | `Component Intent` / `Component Design` |
| change `status.md` | `Change Status` |
| change `intent.md` / `plan.md` / `design.md` / `report.md` | `Change Intent` / `Change Plan` / `Change Design` / `Change Report` |
| `.design/{project_name}_design_specification.md` (outside the bundle, linked from the root index) | `UX Design Specification` |

Templates for every document: [`artifact_templates.md`](artifact_templates.md).

## Terminology and compatibility

"Feature" is the unit of work formerly called "component"; a request that says "component" means the same thing. For backward compatibility:
- Writers use the feature names (`{feature_name}`, `feature:` frontmatter key, `{feature_name}/` directory, `{feature_name}_intent.md` / `_design.md`). The OKF `type` strings (`Component Intent`, `Component Design`) are stable identifiers and do not change.
- Readers also accept the legacy names: the `component:` key, a `{component_name}/` directory, and `{component_name}_*.md` files, and treat them as the feature's. Existing documents are rewritten to the feature names only when their change next updates them; never rename a completed change's files.
- Skill names, gate IDs (P1–P4, D1–D3), step numbers, and `status.md` phase fields are unchanged.
- `{feature_slug}` is the kebab-case form of `{feature_name}`; it names the feature's preview folder.

## Layout

```
{root}/.agentic_coding/                    # OKF bundle
  index.md                                 # architecture, UX spec, features
  log.md                                   # prerequisites created/changed, features added
  design_and_architecture_patterns.md      # repo-wide architecture
  base/                                    # design-system base for previews (feature-preview-kit, Phase A)
    config.json  tokens.css  base.css  lock.json  base-preview.html
  feature/{feature_slug}/                  # living feature preview (feature-preview-kit, Phase B)
    views.html  spec.json  logic.js  feature.css  {feature_slug}.html
  {feature_name}/
    index.md                               # baseline, open change, completed changes
    log.md                                 # change opened / reverted / completed
    {feature_name}_intent.md             # baseline intent (as built)
    {feature_name}_design.md             # baseline design (as built)
    changes/
      {yyyymmdd}-{type}-{slug}/            # {change_dir}; type: feature | change | bugfix
        status.md                          # phase state, approvals, progress, failures, verification
        intent.md                          # what changes and why (delta for change/bugfix)
        plan.md                            # design, technical and test spec for this change
        design.md                          # optional: required when phase_design is not skipped; links the preview in feature/{feature_slug}/
        verification-{n}.png               # optional verification screenshots
        report.md                          # final report = handoff
{root}/.design/
  {project_name}_design_specification.md   # repo-wide UX spec, unless a repo DESIGN.md (or equivalent) exists
```

- `base/` and `feature/{feature_slug}/` are written only through the `feature-preview-kit` skill: the planner owns `base/` (planning phase), the programming skill owns `feature/{feature_slug}/` (design phase). `base/` is repo- or workspace-wide: one per `{root}`, nearest wins, so each workspace of a monorepo has its own. The skill's CLI runs with `--root {root}`.
- `.design/` and `.agentic_coding/` are committed by default. The planner asks once per `{root}` whether to gitignore them and records the answer in the bundle `log.md`.
- Feature-level files are prefixed with `{feature_name}`; files inside a change directory are not.

## Discovery

Every session starts here, before reading anything else:
1. Read `{root}/.agentic_coding/index.md` → architecture, UX spec, feature list.
2. Read `{feature_name}/index.md` → baseline documents, the open change, completed changes.
3. Open only the documents the current step needs and follow their links.

If an index is missing or does not list an existing document, fix the index before continuing. Whoever creates, moves, completes, or deprecates a document updates the matching `index.md` and `log.md` in the same step.

## Ownership

| Artifact | Written by | Read by |
|---|---|---|
| `index.md`, `log.md` (all levels) | the skill that changes a listed document, in the same step | both |
| `design_and_architecture_patterns.md` | planner | both |
| UX spec | planner; links to `base/` for tokens and does not duplicate them | both |
| `base/` (locked design-system base) | planner, via `feature-preview-kit` Phase A; never edited in the design phase | both |
| `feature/{feature_slug}/` preview | programming, via `feature-preview-kit` Phase B | both |
| change `status.md` | planner: creates it; identity fields, `track`, `plan_revision`, `phase_plan`, plan approvals. Programming: `phase_design`, `phase_dev`, `next`, design/dev sections, and `phase_plan: reverted` only | both |
| change `intent.md`, `plan.md` | planner only | both |
| change `design.md`, `report.md`, screenshots | programming | both |
| baseline `{feature_name}_intent.md`, `{feature_name}_design.md` (the preview in `feature/{feature_slug}/` becomes the baseline prototype) | programming, at change completion only | both |

## Phases and approvals

`status.md` frontmatter is the single record of phase state; its `Approvals` table is the single record of gate decisions.

| Phase | Field | Loop |
|---|---|---|
| Plan | `phase_plan: pending → in_review → approved` | Rejected → `pending`, planner revises (new plan revision). `reverted` (set by design/dev or a re-plan request) → planner resolves open questions → `in_review` → `approved`. |
| Design | `phase_design: pending → in_review → approved`, or `skipped` | Feedback within the approved intent and plan → `pending`, revise the design. Feedback that conflicts with them, or a **base gap** (a token, component, or device the locked `base/` lacks) → `phase_design: reverted`, `phase_plan: reverted`; the planner amends the base. |
| Development | `phase_dev: pending → in_progress → in_review → done` | `blocked` while an unresolved failure needs the user. Verification feedback within the plan → `in_progress`. Conflicting feedback → `phase_plan: reverted`. |

- `next: Plan | Design | Development | Verification | done` always names the step to resume.
- **Revert**: record a row in `status.md` → `Reverts` (trigger and what it conflicts with), set `next: Plan`, add a `**Revert**` entry to the feature `log.md`, and stop. The planner turns each revert trigger into an `Open questions` entry in `plan.md` before changing anything else.
- **Re-approval after a revert**: the planner sets `phase_design` back to `pending` (or `skipped`, per the plan) and `phase_dev` to `pending`. Progress rows stay `done` only if their work item is unchanged in the new plan revision; the programming skill re-checks them at session start.
- **Approval record**: one `Approvals` row per gate decision — gate, artifact and revision, decision (`pending | approved | rejected | reverted`), by (actor), at, notes.
- **Non-interactive session**: at a gate, add an `Approvals` row with decision `pending`, set the phase to `in_review`, and end the turn. Never assume an answer.
- **Auto-approve** (only when the user explicitly says to proceed without asking): decision `approved` by the agent actor; log every assumption in `status.md` → `Assumptions`.

## Task types and tracks

| Type | Track | Plan | Design | Development and test |
|---|---|---|---|---|
| `feature` | full | full | full | full |
| `change` | full or lite | intent delta and plan against the baseline | required only if the UX changes, otherwise `skipped` | full; merge the delta into the baseline at completion |
| `bugfix` | lite unless UX or state changes | reproduction, root cause, fix, regression test | `skipped` unless the UX is affected | regression test mandatory; update the baseline intent only if it described the wrong behaviour |

**Lite track** — allowed only when all hold: one feature, ≤ 3 source files changed, no new view, navigation, state, or public API, no new dependency, and no UX change. The planner proposes it and the user approves it at the plan gate. The templates mark which sections a lite plan may omit. If a lite change turns out to break any condition, revert to the plan phase with `track: full`.

**Design in two parts**: the planning phase makes sure a locked `base/` exists (reusing it, or setting it up with the user); the design phase builds the feature preview on that base. The base is never changed in the design phase.

**Design phase decision**: the planner records `required` or `skipped` (with a reason) in `plan.md` → `Design spec`; the user approves it with the plan. The programming skill follows it and never re-decides.

## Sources of truth

- Repo-wide constraints: the architecture document and the UX spec.
- Within a change: approved `intent.md` > approved `plan.md` (current revision) > approved `design.md` > code.
- User input in a later phase that conflicts with an approved document is never applied silently: revert to the phase that owns that document.

## Validation

**Intent** (planner before the plan gate; programming at its session gate):
1. Frontmatter is valid and every section the template marks *required* is present and non-empty; optional sections hold content, `n/a`, or `unchanged (baseline)`.
2. Every input names its source (`user`, `repo:<path>`, `baseline`, or `derived`).
3. Acceptance criteria are numbered (`AC1`…) and each states an observable result.
4. Nothing contradicts the UX spec, the architecture document, or (for `change`/`bugfix`) the baseline intent.
5. No secrets, personal data, or invented external references.

**Plan completeness** (gate for `phase_plan: approved`): the intent is valid; every section required for the track is filled; no `Open questions` entry is `open`; every planned file has exactly one row in the `Architecture mapping` and no row breaks the architecture's dependency rules; every acceptance criterion is covered by a work item and a test; every applicable conformance rule is in the `Conformance checklist`; `status.md` → `plan_revision` equals the plan's latest `Change tracker` revision.

## Security and privacy

- Artifacts are committed: never write secrets, credentials, tokens, personal data, or real user content into them. Use marked placeholders (`{API_BASE_URL}`, `<redacted>`).
- Redact secrets and personal data from command output before recording it in `status.md` or `report.md`.
- Never invent URLs, IDs, endpoints, or package names; ask, or use marked placeholders.

## Rules

- **Hard gate**: design starts only when `phase_plan: approved`, `plan_revision` matches the plan's latest revision, and `base/lock.json` exists and is unmodified; development additionally needs `phase_design` `approved` or `skipped`.
- **Plan edits**: only the planner edits `intent.md` or `plan.md`. Every edit adds a `Change tracker` row to `plan.md` (intent edits included); an edit after approval sets `phase_plan: in_review` until the new revision is approved.
- **Baselines** change only when a change completes. A completed change directory is never edited again.
- A new feature is its first change (type `feature`).
- One open change per feature; if another is open, warn the user and ask which to continue. A change touching several features lives under the primary feature and lists the others in `also_touches`; their `index.md` files link to it.
