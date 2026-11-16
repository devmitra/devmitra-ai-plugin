---
name: frontend-development-planner
description: Plans frontend feature (a.k.a. component) work — a new feature, change, bugfix, or technical task — before any code is written, as the planning role of the spec-driven workflow for user-interface work. Derives the stack, project and inputs from the repo, establishes the knowledge bundle, the UX design specification, the locked design-system base (via feature-preview-kit), and the architecture/design pattern, and produces an approved intent, plan, and validation plan (feature model, design, technical spec) that enforce the pattern. Use when asked to plan, scope, or structure a frontend feature, change, or bugfix, choose or document a UI architecture/design pattern, or when a programming skill reverts a task to planning or reports that no approved plan exists; it takes precedence over sdd-engineering-workflow for planning user-interface work. DO NOT use this to write code, feature prototypes, or tests.
---

# Frontend Development Planner

## Purpose
Produce an approved, pattern-conformant intent, plan, and validation plan for a frontend feature so that a stack programming skill can design, build, and validate it from the documents alone, without depending on new user input. This skill holds the **planning role** of the spec-driven development (SDD) workflow for user-interface work: it owns `intent.md`, `plan.md`, the validation plan, and **architecture and design pattern enforcement**; it never writes source code, feature prototypes, or tests. The only built artifact it produces is the project-wide design-system base, through `feature-preview-kit`.

**Output**: a task directory with `status.md`, `intent.md`, `plan.md`, and `validation.md` → `Validation plan` (`phase_intent` and `phase_plan` `approved`); the bundle, the architecture document, the UX design specification, and the locked base when they don't exist yet; and up-to-date `index.md`/`log.md` files.

**References** — follow them exactly:
- [`references/sdd_contract.md`](references/sdd_contract.md) — the SDD contract: terms, layout, discovery, ownership, phases and gates, approvals, task types and tracks, checks, session continuity, rules.
- [`references/sdd_templates.md`](references/sdd_templates.md) — the template of every document.
- [`references/frontend_profile.md`](references/frontend_profile.md) — the frontend profile: added layout, gates F1 and F2, document sections, and checks.
- [`references/intake.md`](references/intake.md) — classifying the input and running the interview (read at step 2).
- [`references/bundle_workflow.md`](references/bundle_workflow.md) — the playbook copied into every bundle (read at step 1.1).
- [`references/ux_design_specification_template.md`](references/ux_design_specification_template.md) and the stack guides in [`references/stacks/`](references/stacks/swift.md).

`sdd_contract.md`, `sdd_templates.md`, `intake.md`, and `bundle_workflow.md` are byte-identical copies of the `sdd-engineering-workflow` skill's files; `frontend_profile.md` is shared, byte-identical, with the stack programming skills.

## Terminology

Terms are defined in the contract's **Terms** and the profile's **Terms**. "Feature" is the unit formerly called "component"; a request that says "component" means the same thing. `{feature}` is the kebab-case directory name; `{feature_name}` is the code-facing name (stack guide → **Plan hints**).

## Context root and discovery

- Run the contract's **Discovery** at every session start: find the bundle by walking up from the working directory, then bundle `index.md` → feature `index.md` → the task's `status.md` first.
- **No bundle yet**: propose `{root}` as the nearest ancestor of the file or module being worked on (or of the working directory) that contains a stack project marker (see [Stack detection](#stack-detection)) or `.git`. If more than one candidate is plausible (e.g. a monorepo), ask. The bundle is created at step 1.1.
- Read broadly, write narrowly: look up existing design and architecture documents from `{root}` upward (nearest wins), but write only to the nearest bundle.
- Keep the indexes and logs current in the same step that changes a document.

## Stack detection

Derive the stack from the repo **and** the task context: project markers at `{root}`, the target files' extensions, and any platform the user names. Pick the stack guide whose **Detection** markers match, and record it in `status.md` → `stack`.

| Stack | Guide |
|---|---|
| Swift (iOS / macOS) | [`references/stacks/swift.md`](references/stacks/swift.md) |

If no guide matches, or the repo and the task point to different stacks, stop and ask. Never plan a stack without a guide.

## Project name

Derive `{project_name}` in this order: the user's request; the stack guide's **Project name** sources; the `{root}` directory name. Record it in `status.md` → `project_name`. Ask only if the sources disagree.

## Approval policy (applies to every step)

Do not move past a gate without explicit user approval, unless the user explicitly says to proceed without asking (e.g., "auto-approve", "don't ask"). Record every gate decision as the contract's **Approvals** says.
- Gates: **G0** bundle location, commit or gitignore, architecture document, agent-instruction pointer (step 1.1); **F1** UX design specification, design-system base, and UI architecture pattern (steps 1.2–1.3); **G1** feature, task type, track, and intent (step 2); **G2** plan, validation plan, the design-phase decision, and any new third-party dependency (step 5).
- G0 and F1 may be one review; G0 may be batched with G1; on the `lite` and `express` tracks G1 and G2 are one review.
- **Asking**: plain chat text, in the interview form of [`references/intake.md`](references/intake.md) — at most 5 numbered questions a round, each with a reason and options, the recommended one first; if a question dialog holds fewer questions or options than a round, send the round in parts and keep the question numbers. A **gate request** is one message with the gate, links to the documents and their revisions, a summary of at most 10 lines, what changed since the last revision, and a closing question that names the gate ("Approve G2, or tell me what to change?").
- Non-interactive session and auto-approve: follow the contract's **Approvals**. Do not assume and continue.
- Never invent external references (URLs, video/document IDs, API endpoints, package names). Ask the user, or use clearly marked placeholders.

## Vibe-coding guardrail

Applies when the user asks to build or extend a UI app or feature without specifications ("vibe code this", "just build it", "quick prototype", "no planning").
1. Do not refuse, and do not hand over to coding. Say once, in at most three sentences, what will be recorded and why — with a spec, a module map, and a decision log, each later change request or bug fix starts from a few short documents instead of a re-read of the codebase — then propose the `express` track.
2. On `express`: one interview round (a question left unanswered is `defaulted` and logged in `Assumptions`); `Module map`, `Decisions`, `Work items`, the profile's `Feature model` and `Design spec`, and a validation plan with a case per acceptance criterion are still complete; G1 and G2 are one gate request.
3. If the user declines the review too, that is auto-approve: record the gates as `auto-approved`, log every assumption, and still write every document.

## Session start

1. Resolve `{root}`, the stack, `{project_name}`, and the feature (if the request names or implies one), then run Discovery.
2. **No open task** for the feature: run step 1 (prerequisites), then step 2.
3. **Open task with `phase_intent` or `phase_plan` `pending`, `in_review`, or `reverted`** — re-entry:
   1. Run the contract's **Resume check**; read `status.md` (`Reverts`, `Blockers`), `validation.md` → `Acceptance`, and the `Open questions` of `intent.md` and `plan.md`.
   2. Add each new revert trigger or re-plan request as an `Open questions` entry in the document it conflicts with; set `open_questions` in `status.md`.
   3. Resolve every open question with the user **before** editing anything else; record each answer.
   4. Revise `intent.md`/`plan.md` (a revision-table row and a new revision per edit) and continue at the first incomplete step (usually step 5).
4. **Open task with both phases `approved`**: planning is done; tell the user to continue with the stack's programming skill (named in the stack guide). If the user asks to re-plan, set the owning phase to `reverted`, record the request in `Reverts`, and go to 3.
5. End every turn that changed a task with the contract's **Session end** (progress, `git.head`, the `Handoff note`, the claim).

## Inputs

Each input is either given by the user or derived from the repo, the feature's `spec.md`, or the UX spec. Derive first, ask only for what is still missing or ambiguous, and record each input's source in `intent.md`. Required inputs:
- **Purpose**, **task type** (`create` = new feature, `change` = modify a specified feature, `bugfix`, `technical`), and the **feature**.
- **Requirements and acceptance criteria**, in the statement forms of the intake guide.
- **Frontend inputs** (profile → `intent.md`): views and navigation, user interactions, user journey (initial → intermediate → final states), inputs/outputs and validation rules, localization languages (default: development language only — flagged), target path/module.
- **Constraints**: platforms, security and privacy (`none` is a valid answer), performance, integration (data, global state, services, presenting other UI).

For a `change`/`bugfix` most inputs are `unchanged (spec)` or derivable: design inputs (layout, transitions/animations, navigation presentation), target path/module (from the architecture document), and platforms (from the UX spec).

## Workflow

| Step | What | Gate |
|---|---|---|
| 1 | Prerequisites, once per `{root}`: bundle, UX spec and base, architecture pattern | G0, F1 |
| 2 | Intake and intent | G1 |
| 3 | Existing work | — |
| 4 | Plan and validation plan | — |
| 5 | Review and approval | G2 |

### 1. Prerequisites (project-wide, once per `{root}`)

Before step 2, the bundle (1.1), a UX design specification with a locked design-system base (1.2), and an architecture document that covers the UI pattern (1.3) must exist and be approved. All are reused by every later task; skip a sub-step whose result already exists and is current.

#### 1.1 Bootstrap the bundle (gate G0)

Skip when Discovery found a bundle.
1. Create `{bundle}/` with `index.md`, `log.md`, `project/workflow.md` (per [`references/bundle_workflow.md`](references/bundle_workflow.md)), and `project/decisions.md` from the templates.
2. Gate G0 — one request covering: the bundle location (default `.agentic_coding/`; any other choice is recorded in `.sdd.json` per the contract's Configuration); whether to commit or gitignore `{bundle_dir}/`; the architecture document (step 1.3); and whether to add a pointer to the repository's agent-instruction file (`AGENTS.md` by default) reading: *"This repository records feature and task context in `{bundle_dir}/` (substitute the configured directory name). Before changing code, read `{bundle_dir}/index.md` and follow `{bundle}/project/workflow.md`."* Add the pointer only on approval. Everything created in step 1 is a proposal until G0 is approved: if the user names another location, move the bundle there; if they decline the bundle, delete it and stop.
3. Record the decision in the bundle `log.md` (`**Creation**`, with the approving actor).

#### 1.2 UX design specification and design-system base (design, part 1; gate F1)

The UX spec describes the project's design language; the **base** (`{bundle}/project/design_system/`, built with the `feature-preview-kit` skill, Phase A) is the ready-to-use template every feature preview reuses. Both must be ready before step 2.

1. Look from `{root}` upward for a repo-specific spec or design system: `DESIGN.md`, `docs/design*`, a design-system/theme module, a Figma link in the README, or `project/ux_design_specification.md` in a bundle. **The nearest repo-specific spec always takes precedence** over this skill's template. If several exist at the same level, ask the user which is authoritative.
2. If one exists, use it. Flag gaps or stale sections to the user, and fill gaps only in `{bundle}/project/ux_design_specification.md`, without contradicting the repo-specific source.
3. If none exists, create one from [`references/ux_design_specification_template.md`](references/ux_design_specification_template.md), extracting each section per the stack guide's **UX spec hints** and asking only for what is missing. Section 2 (Tokens) links to the base instead of duplicating values.
4. **Base**: look for `project/design_system/lock.json` in the nearest bundle (in a monorepo each workspace has its own).
   - **Locked and unmodified** (`fpk info`): reuse it. Record its name and version.
   - **Modified or stale** (sources changed since the lock, or it contradicts the spec): report it and ask whether to re-lock a new version via Phase A.
   - **Missing**: ask the user to choose — **set up the design system** (run `feature-preview-kit` Phase A with the sources the user names plus the repo's code, tokens, and spec) or **neutral kit** (`fpk init` then `fpk lock`, no edits). Never invent brand values.
   Run the kit's CLI with `--root {root}`. Phase A's own build, contrast check, and lock steps apply.
5. Get approval (F1) for the spec and the base together, then save the spec with OKF frontmatter (`type: UX Design Specification`, `status: stable`, a `verified` entry) and list both in the bundle `index.md` (profile → **Layout additions**). A plan whose design phase is `required` cannot reach `approved` without a locked base; if the user can't be asked, record the pending question and stop.

#### 1.3 Architecture and design pattern (gate G0, or F1 when the bundle already exists)

1. Look from `{root}` upward for a repo-specific architecture document (`ARCHITECTURE.md`, `docs/architecture*`) and for `project/architecture.md` in the bundle. **Repo-specific documents take precedence**: link them under `Sources` in `project/architecture.md` and fill only what they leave open.
2. If `project/architecture.md` already documents the UI pattern, its dependency rules, and its conformance rules, reuse it and skip the remaining sub-steps. If it exists but lacks them, add them with approval (F1).
3. Otherwise, follow the stack guide's **How to use**: detect the pattern the codebase already follows, or select one for a new/unstructured codebase via its catalog and decision guide.
4. Write `{bundle}/project/architecture.md` from the contract's template as the stack guide's **Architecture document** section says, including `Commands` (each one run before it is recorded) and `Conformance rules`; get approval; mark it `stable` with a `verified` entry and list it in the bundle `index.md`.

### 2. Intake and intent (gate G1)

Read [`references/intake.md`](references/intake.md) first.
1. **Classify** the input and the task type (intake → **Input kinds**, **Bug or change?**).
2. **Feature**: match the request to a feature in the bundle `index.md`; for a new one, propose `{feature}` (kebab-case) and `{feature_name}` (stack guide → **Plan hints**) and get them approved at G1.
3. **Track**: propose `lite` only when the contract's and the profile's lite conditions all hold; `express` only under the [Vibe-coding guardrail](#vibe-coding-guardrail); otherwise `full`. Propose a split when the intake guide's size limits are exceeded.
4. Derive and validate the inputs (see [Inputs](#inputs)).
5. Create `{task_dir}` (`{bundle}/features/{feature}/tasks/{yyyymmdd}-{task_type}-{slug}/`) with `status.md` (`next: Intent`, `profiles: [frontend]`, `stack`, `project_name`, `feature_name`) and a draft `intent.md` including the profile's `Frontend inputs`. For a `change`/`bugfix`, the intent holds only the delta. Create or update the feature `index.md` and add a `**Creation**` entry to its `log.md`; list a new feature in the bundle `index.md`.
6. Run the interview (intake → **Interview**) until no question is `open`: ask those that change scope or behaviour, and set the rest to `deferred` for the plan.
7. Run the contract's **Intent validation** with the profile's addition, and fix every failure.
8. Set `phase_intent: in_review` and send the gate request (on `lite` and `express`, continue and send one request at step 5). On approval: `phase_intent: approved`, `intent_revision` to the latest revision, `intent.md` to `stable` with `verified`, an `Approvals` row, `next: Plan`.

### 3. Existing work

1. **Spec**: read the feature's `spec.md` and as-built `ux_design.md`, and the closed tasks that shaped them, if they exist; note how this task differs. Code without a spec: intake → **Code without a spec**.
2. **Existing features**: search the repo and the UX spec's "Existing features" for the feature itself and for similar or reusable ones, including partial work (files prefixed `{feature_name}`, TODO/stub implementations, uncommitted changes). Note what is complete, partial, or missing. For a `bugfix`, reproduce the defect and find the root cause with evidence.
3. Record findings in `plan.md` → `Existing work`. If they contradict the intent, add an `Open questions` entry and return to step 2.

### 4. Plan and validation plan

Create `plan.md` from the template plus the profile's sections 11–13 (revision 1, one `Change tracker` row). A `lite` or `express` plan may omit the sections marked **(full)**.

1. **Standards**: search the repo for coding standards (naming, lint config, logging, localization, error handling, testing) and plan per them and per previously closed tasks of this and similar features.
2. **Feature model** (section 11) — analyse the intent and record: the views; navigation and who owns it; every user interaction and its effect; every piece of state with its kind (input, output, internal), owner, mutability (immutable, or mutated only by its owner), reactivity (how a change reaches the UI), and initial value; the feature API; and the state transitions, including loading, empty, and error. Use the stack guide's **Plan hints** for the stack's idioms.
3. **Design spec** (section 12) — decide whether the design phase is `required` (new view, or any UX change) or `skipped` (no UX change, with an as-built design), with a reason, and record it in `1. Scope`. When `required`, record the base (name, version) and the preview scope: the views, overlays, and states to build as a `feature-preview-kit` Phase B preview that reuses the base; check each against the base and resolve any base gap now with the user, by amending the base (F1). List the accessibility requirements.
4. **Technical spec** — the `Module map` (one row per planned file: layer/role from `project/architecture.md`, single responsibility, public interface, allowed and forbidden dependencies); `Interfaces and data`; `Cross-cutting` (error handling, logging, security and privacy, performance, third-party dependencies); and section 13: dependencies and injection (interface, live implementation, mock/preview fixture), integration with the host app, the isolation harness, and localization.
5. **Decisions** — a row for every choice of pattern, technology, dependency, data model, interface, or structure, with its reason and a rejected alternative.
6. **Validation plan** (`validation.md`, from the template) — unit cases for business logic and view models; `e2e` UI cases for critical flows only; an accessibility-audit case for each new view; a `manual` case for each state the user will verify, with where they will see it (profile → `validation.md`). At least one case per acceptance criterion. For a `bugfix`: the reproduction case, then regression cases.
7. **Work items** (remaining work only, each covering acceptance criteria or marked `enabling`; include project scaffolding when the stack guide says the project is not testable yet) and the **Conformance checklist** (every applicable conformance rule of the architecture document, plus the plan-time guardrails below).
8. **Enforce the pattern** — the plan is not ready for review until:
   - every planned file has exactly one layer/role and one responsibility;
   - no `Module map` row breaks the documented dependency direction;
   - no new singleton or global state is introduced without a `Decisions` row;
   - no new pattern is mixed into a module that already follows another one.
   If a requirement cannot be met within the pattern, add it to `Open questions` as a decision for the user (adapt the requirement, or amend the architecture document with approval) — never silently deviate.

#### Plan-time guardrails

- **Isolation**: every view, view model, coordinator, and service is reachable through an injected dependency with a mock, so the feature can be previewed and tested alone and integrated into the host app later.
- **Modularity**: one responsibility per source file; user interface, domain logic, and data access in separate modules, used only through the public interface the `Module map` lists; a file planned beyond 300 lines is split or justified in a `Decisions` row.
- **Reuse**: plan to reuse existing features; where functionality already exists elsewhere, plan to extract it into a shared feature.
- **Dependency injection** over singletons; constructor injection by default.
- **Access control**: plan the minimal public surface of each new type.
- **State**: prefer immutable inputs and a single owner for each mutable state; no state duplicated across owners.
- **Security and privacy**: classify the data the feature handles; plan secure storage, secure transport, no secrets in source, private-by-default logging, and any permission or privacy declarations the stack requires.
- **Accessibility**: plan labels, traits, reading order, scalable text, minimum touch targets, contrast, and reduced-motion behaviour per the UX spec's accessibility baseline.
- **Lists**: plan lazy/virtualized rendering for long, data-driven, or image-bearing lists; an eager container is acceptable for short fixed content — record the choice.
- **Localization**: flag development-language-only scope when no other languages are requested.
- **Third-party libraries**: only when no standard framework/library fits; name a popular, actively maintained library, confirm no known major vulnerabilities and a permissive license (Apache, MIT, BSD, etc.) compatible with the app, and flag it for approval at G2.
- **Testing**: unit tests for business logic and view models; UI tests only for critical flows.

### 5. Review and approval (mandatory gate G2)

1. Run the contract's **Plan completeness** with the profile's additions, and fix every failure.
2. Set `phase_plan: in_review` and send the gate request for `plan.md` and the validation plan (on `lite` and `express`, for `intent.md` too). Each requested change is a new revision; ask again.
3. On explicit approval: set `phase_plan: approved` and `plan_revision` to the latest revision; set `phase_design` to `pending` or `skipped` per the plan; leave `phase_build: pending`; set `next` to `Design` or `Build`; mark `plan.md` `stable` with a `verified` entry; add an `Approvals` row. On `lite` and `express` the same approval also completes step 2.8.
4. Run the contract's **Session end**, then finish by telling the user the task directory path, the track, the design-phase decision, and the programming skill to run next (from the stack guide).
