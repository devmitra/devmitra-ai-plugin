---
name: frontend-development-planner
description: Plans frontend feature (a.k.a. component) work (new feature, change, or bugfix) before any code is written — derives the stack, project and inputs from the repo, establishes the repo-wide UX design specification, locked design-system base (via feature-preview-kit), and architecture/design pattern, and produces an approved intent and plan (feature model, design, technical and test spec) that enforces the pattern. Use when asked to plan, scope, or structure a frontend feature, change, or bugfix, choose or document an architecture/design pattern, or when a programming skill reverts a change to planning or reports that no approved plan exists. DO NOT use this to write code, feature prototypes, or tests.
---

# Frontend Development Planner

## Purpose
Produce an approved, pattern-conformant intent and plan for a frontend feature so that a stack programming skill can design, build, and test it from the documents alone, without depending on new user input. This skill owns planning, `intent.md`, `plan.md`, and **architecture and design pattern enforcement**; it never writes source code, feature prototypes, or tests. The only built artifact it produces is the repo-wide design-system base, through `feature-preview-kit`.

**Output**: a change directory with `status.md`, `intent.md`, and `plan.md` (`phase_plan: approved`), the repo-wide UX design specification and architecture document when they don't exist yet, and up-to-date OKF `index.md`/`log.md` files. Layout, phases, ownership, validation, and security rules are in [`references/change_artifacts.md`](references/change_artifacts.md); document templates are in [`references/artifact_templates.md`](references/artifact_templates.md). Follow both exactly.

## Terminology

"Feature" is the unit of work formerly called "component"; requests that say "component" mean the same thing. Read legacy `component:` keys, `{component_name}/` directories, and `{component_name}_*.md` files as the feature's; write the feature names (see the contract's **Terminology and compatibility**).

## Context root (`{root}`)

`{root}` is the agent's closest context directory, and may be nested (repo root, sub-repo/package root, or workspace/project root).
- Start from the path of the file/module being worked on (or the working directory if none) and walk up to the nearest directory containing a stack project marker (see [Stack detection](#stack-detection)) or `.git`. That is `{root}`.
- If more than one candidate is plausible (e.g., a monorepo), ask the user, then record the choice in `status.md` → `root` and `plan.md` → `Scope`.
- Read broadly, write narrowly: look up existing design/architecture documents from `{root}` upward (nearest wins), but always write new artifacts under the nearest `{root}`.

## Knowledge discovery

`{root}/.agentic_coding/` is an OKF knowledge bundle covering the architecture and every feature's baseline and changes. Start every session with the contract's **Discovery** steps (bundle `index.md` → feature `index.md` → linked documents). Keep the indexes and logs current in the same step that changes a document.

## Stack detection

Derive the stack from the repo **and** the task context: project markers at `{root}`, the target files' extensions, and any platform the user names. Pick the stack guide whose **Detection** markers match, and record it in `status.md` → `stack`.

| Stack | Guide |
|---|---|
| Swift (iOS / macOS) | [`references/stacks/swift.md`](references/stacks/swift.md) |

If no guide matches, or the repo and the task point to different stacks, stop and ask. Never plan a stack without a guide.

## Project name

Derive `{project_name}` in this order: the user's request; the stack guide's **Project name** sources; the `{root}` directory name. Record it in `status.md` → `project_name`. Ask only if the sources disagree.

## Approval policy (applies to every step)

Do not move past a gate without explicit user approval, unless the user explicitly says to proceed without asking (e.g., "auto-approve", "don't ask"). Record every gate decision in `status.md` → `Approvals`.
- Gates: **P1** feature name, task type, track, and intent (step 2); **P2** UX design specification and design-system base created, reused, or gap-filled (step 1.1); **P3** architecture document (step 1.2); **P4** plan, including the design-phase decision and any new third-party dependency (step 5).
- P1 may be batched with P4; P2 may be batched with P3.
- Non-interactive session: follow the contract's non-interactive rule (pending `Approvals` row, phase `in_review`, end the turn); put unanswered questions in `plan.md` → `Open questions`. Do not assume and continue.
- Auto-approve: follow the contract's auto-approve rule.
- Never invent external references (URLs, video/document IDs, API endpoints, package names). Ask the user, or use clearly marked placeholders.

## Session start

1. Resolve `{root}`, the stack, `{project_name}`, and `{feature_name}` (if the request names or implies one), then run Discovery.
2. **No open change** for the feature: run step 1 (prerequisites), then step 2.
3. **Open change with `phase_plan` `pending`, `in_review`, or `reverted`** — re-entry:
   1. Read `status.md` (`Reverts`, `User verification`, `Failures and blockers`) and `plan.md` → `Open questions`.
   2. Add each new revert trigger or re-plan request as an `Open questions` entry; set `open_questions` in `status.md`.
   3. Resolve every open question with the user **before** editing anything else; record each answer.
   4. Update `intent.md`/`plan.md`, add a `Change tracker` row per edit, and continue at the first incomplete step (usually step 5).
4. **Open change with `phase_plan: approved`**: planning is done; tell the user to continue with the stack's programming skill (named in the stack guide). If the user asks to re-plan, set `phase_plan: reverted`, record the request in `Reverts`, and go to 3.

## Inputs

Each input is either given by the user or derived from the repo, the baseline, or the UX spec. Derive first, ask only for what is still missing or ambiguous, and record each input's source in `intent.md`. Required inputs:
- **Purpose**, **task type** (`feature` = new feature, `change` = modify an existing feature, `bugfix`), and **feature name**.
- **Functional specification**: views and navigation, user interactions, user journey (initial → intermediate → final states), inputs/outputs and validation rules.
- **Technical inputs**: integration (data, global state, services, presenting other UI); localization languages (default: development language only — flagged).
- **Acceptance criteria** and **security/privacy** notes (`none` is a valid answer).

Optional inputs — for a `change`/`bugfix` these are usually `unchanged (baseline)` or derivable: design inputs (layout, transitions/animations, navigation presentation), target path/module (from the architecture document), and platforms (from the UX spec).

## Workflow

| Step | What | Gate |
|---|---|---|
| 1 | Prerequisites (UX spec, architecture), once per `{root}` | P2, P3 |
| 2 | Inputs and intent | P1 |
| 3 | Existing work | — |
| 4 | Plan | — |
| 5 | Review and approval | P4 |

### 1. Prerequisites (repo-wide, once per `{root}`)

Before step 2, a UX design specification with a locked design-system base (1.1) and an architecture document (1.2) must exist and be approved. Both are reused by every later change; skip a sub-step whose document already exists and is current. Then make sure the bundle `index.md` and `log.md` exist and list both (templates: bundle index, log), and ask once whether to gitignore `.design/` and `.agentic_coding/` (contract → Layout).

#### 1.1 UX design specification and design-system base (design, part 1)

The UX spec describes the repo's design language; the **base** (`{root}/.agentic_coding/base/`, built with the `feature-preview-kit` skill, Phase A) is the ready-to-use template every feature preview reuses. Both must be ready before step 2.

1. Look from `{root}` upward for a repo-specific spec or design system: `DESIGN.md`, `docs/design*`, a design-system/theme module, a Figma link in the README, or `{root}/.design/*_design_specification.md`. **The nearest repo-specific spec always takes precedence** over this skill's template. If several exist at the same level, ask the user which is authoritative.
2. If one exists, use it. Flag gaps or stale sections to the user, and fill gaps only in `{root}/.design/{project_name}_design_specification.md`, without contradicting the repo-specific source.
3. If none exists, create one from [`references/ux_design_specification_template.md`](references/ux_design_specification_template.md), extracting each section per the stack guide's **UX spec hints** and asking only for what is missing. Section 2 (Tokens) links to the base instead of duplicating values.
4. **Base**: look for `{root}/.agentic_coding/base/lock.json` (nearest `{root}` upward; in a monorepo each workspace has its own).
   - **Locked and unmodified** (`fpk info`): reuse it. Record its name and version.
   - **Modified or stale** (sources changed since the lock, or it contradicts the spec): report it and ask whether to re-lock a new version via Phase A.
   - **Missing**: ask the user to choose — **set up the design system** (run `feature-preview-kit` Phase A with the sources the user names plus the repo's code, tokens, and spec) or **neutral kit** (`fpk init` then `fpk lock`, no edits). Never invent brand values.
   Run the kit's CLI with `--root {root}`. Phase A's own build, contrast check, and lock steps apply.
5. Get approval (P2) for the spec and the base together, then save the spec with OKF frontmatter (`type: UX Design Specification`) and list both in the bundle `index.md`. Planning cannot reach `approved` without a locked base; if the user can't be asked, record a pending `Approvals` row and the open question, and stop.

#### 1.2 Architecture and design pattern

1. Look from `{root}` upward for a repo-specific architecture document (`ARCHITECTURE.md`, `docs/architecture*`) or `{root}/.agentic_coding/design_and_architecture_patterns.md`. **Repo-specific documents take precedence.** If it documents the pattern and its dependency rules, reuse it and skip the remaining sub-steps; if it lacks dependency or conformance rules, add them to `design_and_architecture_patterns.md` with approval.
2. Otherwise, follow the stack guide's **How to use**: detect the pattern the codebase already follows, or select one for a new/unstructured codebase via its catalog and decision guide.
3. Fill the stack guide's **Output template**, including **Conformance rules**; get approval (P3); save as `{root}/.agentic_coding/design_and_architecture_patterns.md` with OKF frontmatter (`type: Architecture`).

### 2. Inputs and intent

1. **Feature name**: use the user's name, or propose one that follows the repo's naming conventions (stack guide → **Plan hints**) and get approval (P1).
2. **Task type and track**: classify the task; propose the `lite` track only when the contract's lite conditions all hold, otherwise `full`.
3. Derive and validate the inputs (see [Inputs](#inputs)); ask for anything still unclear.
4. Create `{change_dir}` (`{root}/.agentic_coding/{feature_name}/changes/{yyyymmdd}-{type}-{slug}/`) with `status.md` and `intent.md` from the templates (`phase_plan: pending`, `next: Plan`). For a `change`/`bugfix`, the intent holds only the delta. Create or update the feature `index.md` and add a `**Creation**` entry to its `log.md`; list a new feature in the bundle `index.md`.
5. Run the contract's **Intent validation** and fix every failure before step 3.

### 3. Existing work

1. **Baseline**: read the baseline intent and design, and the reports of completed changes, if they exist; note how this change differs.
2. **Existing features**: search the repo and the UX spec's "Existing features" for the feature itself and for similar or reusable ones, including partial work (files prefixed `{feature_name}`, TODO/stub implementations, uncommitted changes). Note what is complete, partial, or missing.
3. Record findings in `plan.md` → `Existing work`. If they contradict the intent, add an `Open questions` entry and return to step 2.

### 4. Plan

Create `plan.md` from the template (revision 1, one `Change tracker` row). A `lite` plan may omit the sections the template marks **(full)**.

1. **Standards**: search the repo for coding standards (naming, lint config, logging, localization, error handling, testing) and plan per them and per previously completed changes of this and similar features.
2. **Feature model** — analyse the intent and record: the views; navigation and who owns it; every user interaction and its effect; every piece of state with its kind (input, output, internal), owner, mutability (immutable, or mutated only by its owner), reactivity (how a change reaches the UI), and initial value; the feature API; and the state transitions, including loading, empty, and error. Use the stack guide's **Plan hints** for the stack's idioms.
3. **Design spec** — decide whether the design phase is `required` (new view, or any UX change) or `skipped` (no UX change, with a baseline design), with a reason. When `required`, record the base (name, version) and the preview scope: `{feature_slug}`, the views, overlays, and states to build as a `feature-preview-kit` Phase B preview that reuses the base; check each against the base and note any base gap now (resolve it with the user before approval, by amending the base). List the accessibility requirements.
4. **Technical spec** — the `Architecture mapping` (one row per planned file, layer/role and allowed/forbidden dependencies from `design_and_architecture_patterns.md`), dependencies and injection (protocol, live implementation, mock/preview fixture), integration with the host app, error handling, logging, security and privacy, accessibility, localization, performance, and third-party dependencies.
5. **Test spec** — unit tests for business logic and view models, UI tests for critical flows only, an accessibility audit for each new view, the isolation harness (previews and UI tests that show the feature alone with mocks, per state), and how the user will verify the result. For a `bugfix`: reproduction and regression test.
6. **Work items** (remaining work only, each covering acceptance criteria) and the **Conformance checklist** (every applicable **Conformance rule** from the architecture document, plus the plan-time guardrails below).
7. **Enforce the pattern** — the plan is not ready for review until:
   - every planned file has exactly one layer/role;
   - no mapping row breaks the documented dependency direction;
   - no new singleton or global state is introduced without a written justification;
   - no new pattern is mixed into a module that already follows another one.
   If a requirement cannot be met within the pattern, add it to `Open questions` as a decision for the user (adapt the requirement, or amend the architecture document with approval) — never silently deviate.

#### Plan-time guardrails

- **Isolation**: every view, view model, coordinator, and service is reachable through an injected dependency with a mock, so the feature can be previewed and tested alone and integrated into the host app later.
- **Reuse**: plan to reuse existing features; where functionality already exists elsewhere, plan to extract it into a shared feature.
- **Dependency injection** over singletons; constructor injection by default.
- **Access control**: plan the minimal public surface of each new type.
- **State**: prefer immutable inputs and a single owner for each mutable state; no state duplicated across owners.
- **Security and privacy**: classify the data the feature handles; plan secure storage, secure transport, no secrets in source, private-by-default logging, and any permission or privacy declarations the stack requires.
- **Accessibility**: plan labels, traits, reading order, scalable text, minimum touch targets, contrast, and reduced-motion behaviour per the UX spec's accessibility baseline.
- **Lists**: plan lazy/virtualized rendering for long, data-driven, or image-bearing lists; an eager container is acceptable for short fixed content — record the choice.
- **Localization**: flag development-language-only scope when no other languages are requested.
- **Third-party libraries**: only when no standard framework/library fits; name a popular, actively maintained library, confirm no known major vulnerabilities and a permissive license (Apache, MIT, BSD, etc.) compatible with the app, and flag it for approval at P4.
- **Testing**: unit tests for business logic and view models; UI tests only for critical flows.

### 5. Review and approval (mandatory gate P4)

1. Run the contract's **Plan completeness** check and fix every failure.
2. Set `phase_plan: in_review`, `plan_revision` to the latest revision, and ask the user to review `intent.md` and `plan.md` (batch P1 here if it is still open). Each requested change is a new plan revision; ask again.
3. On explicit approval: set `phase_plan: approved`; set `phase_design` to `pending` or `skipped` per the design spec; set `phase_dev: pending`; set `next` to `Design` or `Development`; mark `intent.md` and `plan.md` `status: stable` with a `verified` entry; add an `Approvals` row.
4. Finish by telling the user the change directory path, the track, the design-phase decision, and the programming skill to run next (from the stack guide).
