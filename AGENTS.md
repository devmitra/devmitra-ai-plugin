# AGENTS.md

`devmitra-ai-plugin` is an **AI-artifact development workspace**: it is where reusable AI artifacts — coding-guideline skills, agent rules, and the plugin manifest — are authored, tested, and maintained for Claude Code, GitHub Copilot, Codex, Cursor, and other agents that read `AGENTS.md`. The product here is the artifact, not an app; any app code an agent writes in this repo exists only to test an artifact (see "Testing skills and other artifacts").

**This file is the source of truth for how agents work in this repository** (layout, authoring, testing, commits). **Each `skills/<name>/SKILL.md` is the source of truth for that skill's own behavior** (gates, workflow, artifact layout); it is a shipped product and must stay self-contained. When a skill is being tested, its `SKILL.md` and `references/` are the only guidance applied — not the matching section below.

---

## Role

- **Workspace role**: AI-artifact engineer — author, review, and test skills and rules so they are precise, minimal, non-ambiguous, and safe to run unattended (every approval gate has a defined behavior when the user cannot be asked).
- **Domain role** (for the artifacts' subject matter): Staff-level software engineer with deep knowledge of the skill's stack. Currently consumer-facing application development — iOS native, Android native, Web (React, Angular, Vue, CSS), Flutter, React-native — and expected to grow to backend and tooling stacks (e.g. Node, Python). Each skill section below may narrow this.

## Repository layout

| Path | Purpose |
|---|---|
| `AGENTS.md` | Source of truth for agent behavior in this repo; cross-agent guidance for AGENTS.md-based agents |
| `skills/sdd-engineering-workflow/` | Parent workflow skill: stack-agnostic spec-driven development lifecycle (intent, plan, validation, status, handoff); owns the shared `.agentic_coding/` contract (`references/sdd_contract.md`, `sdd_templates.md`, `intake.md`, `bundle_workflow.md`) that the other skills copy, and the progress view every workflow skill shows (CLI `scripts/sdd_progress.js`, templates `assets/progress/`) |
| `skills/vibe-coding-to-sdd/` | Application-level profile of the SDD workflow: runs a vibe-coding request for a whole app (MVP, PoC, prototype, interactive presentation) through app intent, design system, architecture, backlog, risks, one SDD task per backlog item, and handover; owns `references/app_profile.md` and the backlog CLI `scripts/backlog.js` |
| `skills/feature-preview-kit/` | Shared preview skill: builds the repo/workspace design-system base and feature-specific clickable previews (CLI `scripts/fpk.js`) |
| `skills/<name>/SKILL.md` (one programming skill per language/stack, e.g. `swift-frontend-programming`, plus the stack-agnostic `frontend-development-planner`) | Canonical Claude Code skill (frontmatter `name` + trigger-oriented `description`), with `references/` for templates and guides |
| `agents/<name>.md` | Claude Code plugin sub-agents: thin adapters (frontmatter with name, description, and tools, plus a short body) for a role whose brief lives in a skill's `references/roles/` — today `app-code-reviewer` and `app-qa-tester` for `vibe-coding-to-sdd` |
| `plugin.json` | Plugin manifest (single source); `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` are symlinks to it — never fork them |
| `.claude-plugin/marketplace.json` | Claude Code marketplace entry |
| `.cursor/rules/<name>.mdc` | Cursor rule for each skill |
| `.test/` | Gitignored sandbox for skill trials (see "Testing skills and other artifacts") |

## Skill catalog

| Skill | Applies to | Section |
|---|---|---|
| `sdd-engineering-workflow` | any request to specify, plan, build, change, fix, validate, resume, or hand off a feature or task, on any stack (no file pattern) | SDD Engineering Workflow Guidelines |
| `vibe-coding-to-sdd` | any request to build, vibe-code, or one-shot a whole app, site, prototype, PoC, MVP, or interactive presentation; any workspace with `{bundle}/project/app.md` (no file pattern) | Vibe Coding to SDD Guidelines |
| `frontend-development-planner` | planning requests for any frontend stack (no file pattern) | Frontend Development Planner Guidelines |
| `feature-preview-kit` | design-system base and feature previews, used by the planner (base) and programming skills (previews) | Feature previews and design-system base |
| `swift-frontend-programming` | `**/*.swift` | Swift Frontend Programming Guidelines |
| _future: React, Node, Python_ | e.g. `**/*.tsx`, `**/*.js`, `**/*.py` | _add per "Adding a skill for a new stack"_ |

## Working in this repository

- **Terminology**: a *feature* is the application-level unit (formerly "component"); a *task* is one unit of work on it (formerly "change"). Earlier names, keys, gates, and directories remain readable through the *Earlier layout* tables of the SDD contract and the frontend profile.

- **Adding or changing a skill**: edit `skills/<name>/SKILL.md` and its `references/`, then keep the matching section in this file and `.cursor/rules/<name>.mdc` consistent with it. Each skill section here is scoped to a file pattern — apply it only when editing or generating matching files.
- **Adding a skill for a new stack** (React, Node, Python, …):
  1. Create `skills/<stack>-<area>-programming/SKILL.md` + `references/`; the skill must be self-contained and must not mention other stacks. Copy `references/sdd_contract.md` and `references/sdd_templates.md` from `sdd-engineering-workflow` and `references/frontend_profile.md` from the planner unchanged, gate design and build on an approved intent and plan from `frontend-development-planner`, and revert to it when later input conflicts with them. A skill for a non-UI stack skips the frontend profile, the planner, and step 2, and gates on a task planned with `sdd-engineering-workflow`.
  2. Add `skills/frontend-development-planner/references/stacks/<stack>.md` (Detection, Project name, UX spec hints, Plan hints, How to use, Catalog, Decision guide, Architecture document with Conformance rules) and a row to the planner's Stack detection table. Only two skills may mention several stacks: the planner, in that table and its `stacks/` files; and `vibe-coding-to-sdd`, in its `references/tech_stack.md` (stack defaults for a whole app) and the tooling tables that file feeds.
  3. Add one section below, headed `## <Stack> <Area> Guidelines`, with an `**Applies to:**` file pattern (e.g. `**/*.tsx`, `**/*.py`) and its guardrails, using the same category headings as other sections where they apply (security, errors, logging, testing, performance, accessibility, localization) so sections stay comparable. Omit categories that don't fit the stack.
  4. Add the `.cursor/rules/<name>.mdc` and a row to the Skill catalog above.
  5. Keep stack-specific tooling (linters, test runners, project scaffolding) inside that skill's section and references — never in the generic sections of this file.
- **Parity**: guidance must be equivalent across Claude Code, AGENTS.md-based agents, and Cursor. Do not let one drift.
- **Shared contract**: `sdd-engineering-workflow` owns `references/sdd_contract.md`, `sdd_templates.md`, `intake.md`, and `bundle_workflow.md`; `frontend-development-planner` owns `references/frontend_profile.md`. The planner ships copies of all four SDD files; each programming skill ships copies of `sdd_contract.md`, `sdd_templates.md`, and `frontend_profile.md`; `vibe-coding-to-sdd` ships copies of `sdd_contract.md` and `sdd_templates.md` and owns `references/app_profile.md`. Every copy must be byte-identical to its owner's file; change them together and verify with `diff`.
- **Independence**: `sdd-engineering-workflow` and its four shared files must stay agent-, harness-, and stack-independent — no tool, command, or stack names. One exception: its `SKILL.md` may run the skill's own bundled script when the same result can be produced by hand (the progress view, `scripts/sdd_progress.js`); the four shared files never name it. Frontend specifics live only in `frontend_profile.md`, the planner, and the stack skills.
- **Sub-agent roles**: a role a skill delegates to (e.g. the independent code reviewer and QA tester) is defined once, as a harness-independent brief in that skill's `references/roles/<role>.md` — role and expertise, boundaries, inputs, workflow, checklist, report form — and the skill passes the brief's full text when it starts the role, so the role works as a sub-agent, a fresh session, or the same agent. A harness-specific agent file (`agents/<name>.md` for Claude Code) is only an adapter: frontmatter, tool limits, and a body that defers to the brief it is given; it never copies the brief's workflow or checklist. Change a role in its brief; touch the adapter only for its name, description, or tools.
- **Skill quality bar**: each rule is a checkable instruction (not advice); templates are validated by actually using them (generate, build, run); every reference file is linked from `SKILL.md`; no invented URLs, IDs, or package names.
- **Manifest**: bump `version` in `plugin.json` for user-visible skill changes; do not edit the symlinks.
- **Never touch repo files while testing an artifact** — test output lives under `.test/` only.
- **Commits**: only when asked; follow the attribution lines supplied by the harness.

---

## SDD Engineering Workflow Guidelines

**Applies to:** any request to specify, plan, build, change, fix, validate, resume, or hand off a feature or task, on any stack; any workspace that has a bundle directory (default `.agentic_coding/`); and any request to build an app or feature fast without specs ("vibe coding"). Not for questions, code review, or edits that change no behaviour.

The spec-driven development lifecycle lives in [`skills/sdd-engineering-workflow/SKILL.md`](skills/sdd-engineering-workflow/SKILL.md); the bundle contract is [`references/sdd_contract.md`](skills/sdd-engineering-workflow/references/sdd_contract.md) and the templates are [`references/sdd_templates.md`](skills/sdd-engineering-workflow/references/sdd_templates.md). The guardrails below are the AGENTS.md-facing copy; the skill wins if the two differ.

### Records & discovery

- **Bundle directory**: `{bundle}` = `{root}/{bundle_dir}`; `{bundle_dir}` defaults to `.agentic_coding` and is set by `bundle_dir` in a repository-root `.sdd.json` (a relative path, no `..`; the CLIs also take `--bundle-dir` or `SDD_BUNDLE_DIR`). It is the only configurable name; never write the literal default in a skill outside the contract, the scripts, and descriptions.
- **Bundle**: `{bundle}/` is an [OKF v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md) bundle with `project/` (workflow playbook, architecture, decisions), `features/{feature}/` (living `spec.md`, tasks), and `tasks/` (work no feature owns). Find it by walking up from the working directory to the repository root; the nearest bundle wins.
- **Task**: one reviewable unit of work — `create`, `change`, `bugfix`, or `technical` — in `{yyyymmdd}-{task_type}-{slug}/` with `status.md`, `intent.md` (what and why), `plan.md` (how, module map, decisions, work items), `validation.md` (validation plan, runs, results, acceptance), and optionally `ux_design.md` and `handoff.md`.
- **Start every session** at the bundle `index.md`, read a task's `status.md` first, and run the resume check (claim, revisions, repository state, handoff) before any other work. Keep `index.md`/`log.md` current in the same step that changes a document.
- **State lives only in the bundle** — never in conversation history, harness memory, or a tool-specific task list. The skill names no tool, command, or agent feature.

### Workflow & approvals

- **Steps**: 0 session start → 1 bootstrap the bundle (G0) → 2 intake and intent (G1) → 3 plan and validation plan (G2) → 4 UX design, only for a new or changed visual interface (G3) → 5 build → 6 validate (G4) → 7 close.
- **Hard gate**: product code only for a task whose intent and plan are approved for their latest revisions and whose design phase is approved or skipped.
- **Human in the loop**: derive before asking; ask at most 5 numbered questions a round, each with options and a recommended default; an unknown becomes an open question, never a guess. Approvals are explicit and recorded in `status.md` → `Approvals`; a general go-ahead in reply to a gate request approves that gate only. If the human can't be asked, record a pending row and stop.
- **Operations**: installing, updating, or removing software on the system; setting up or changing an environment, account, or service; deleting files or data the task did not create; publishing; and deploying each need their own approval, asked before the action and recorded as an `Approvals` row with gate `OP`. No gate approval covers one, and neither does auto-approve — auto-approve waives only the review of documents and of the code built from them, and carries to another task or session only when the bundle records it.
- **Profiles**: user-interface work is planned by `frontend-development-planner` (steps 0–3) and built by the stack programming skill (steps 4–7) under this same contract, with the additions in the frontend profile. A request for a whole application is handed to `vibe-coding-to-sdd` before any task is opened; it opens one task per backlog item under this same contract.
- **Tracks**: `full` by default; `lite` only when the contract's lite conditions hold; `express` only on the human's explicit request for speed. `lite` and `express` merge G1 and G2.
- **Vibe-coding guardrail**: never refuse and never start coding; explain once why records cut later effort and tokens, then use `express`. A gate can be waived (auto-approved, with assumptions logged); a record — intent, module map, decisions, validation plan, `spec.md` — cannot.
- **Reverts**: input that conflicts with an approved document is never applied silently — record a `Reverts` row, set the owning phase to `reverted`, stop, and resolve it with the human. Anything noticed outside the plan, and new scope raised at acceptance, is recorded in `status.md` → `Follow-ups` and becomes a new task — never built unasked.
- **Session end**: before ending any turn that changed a task, update `Progress`, `git.head`, and the `Handoff note` (done, next action, watch out); write `handoff.md` when work is half-finished, an approach was abandoned, or setup is undocumented.
- **Progress view**: show the workflow with its gates, approvers, and progress — rendered from the records by `scripts/sdd_progress.js` (rich text for chat plus the generated `{bundle}/progress.html`), or filled by hand from `assets/progress/progress_template.md` without a shell. Full view at session start and on request; compact view after every step, every gate decision (auto-approved included), blocker, and revert — never after single commands. The page never approves anything; approvals stay in chat.
- **Close**: update the feature `spec.md`, promote feature- and project-scope decisions, and never edit a closed task again.

### Engineering guardrails

- **Modularity**: one responsibility per source file; user interface, domain logic, and data access or I/O in separate modules; one-way dependencies through listed public interfaces; a file beyond 300 lines is split or justified.
- **Decision logging**: every choice of technology, dependency, data model, interface, or structure has a `Decisions` row with its reason and a rejected alternative; a build-time choice that changes the module map, an interface, the data model, or a dependency is a revert.
- **Traceability**: every acceptance criterion is covered by a work item and a validation case; validation evidence is append-only.
- **Security and privacy**: no secrets or personal data in source, logs, fixtures, or artifacts; validate external input at the boundary; never invent URLs, IDs, endpoints, ticket numbers, or package names.
- **Third-party dependencies**: only when the standard library or framework does not cover the need, vetted for maintenance, license, and vulnerabilities, and approved with the plan.
- **Failures**: fix the root cause; never delete or skip a test, weaken an assertion, or suppress a warning to pass; after three attempts or when the human is needed, record a blocker and stop.

---

## Vibe Coding to SDD Guidelines

**Applies to:** any request to build, vibe-code, or one-shot a whole application — an MVP, a proof of concept, a clickable prototype, an interactive HTML presentation, a website, or a mobile app — often from a non-technical person; any request to bring an existing vibe-coded app under specifications; and any workspace that has `{bundle}/project/app.md`. Not for one feature, change, or bug in an app without `project/app.md` (use the SDD Engineering Workflow Guidelines).

The application-level workflow lives in [`skills/vibe-coding-to-sdd/SKILL.md`](skills/vibe-coding-to-sdd/SKILL.md); its data model is [`references/app_profile.md`](skills/vibe-coding-to-sdd/references/app_profile.md) and its templates are [`references/app_templates.md`](skills/vibe-coding-to-sdd/references/app_templates.md). The guardrails below are the AGENTS.md-facing copy; the skill wins if the two differ.

### Scope & approvals

- **Role**: the application-level profile of the SDD workflow. It runs before the first task and after the last; every task in between is an ordinary SDD task that lists `app` in `status.md` → `profiles`. It needs `sdd-engineering-workflow` and `feature-preview-kit`; without them, stop and say so.
- **Steps**: 0 session start → 1 bundle and app intent (G0 + A1) → 2 design system, the look (A2) → 3 architecture, tech stack, and setup plan (A3) → 4 backlog (A4) → 5 risks (A5) → 6 build loop, one SDD task per backlog item (each task's G1–G4) → 7 handover (A6).
- **Records** in `{bundle}/project/`: `app.md`, `app_status.md` (app-level phase state, approval mode, approvals), the locked `design_system/`, `architecture.md`, `backlog.md`, `risks.md`, `operations.md`, `handover.md`. `backlog_tracker.md` and `backlog.html` are generated by `scripts/backlog.js` (`sync`, `check`) and never edited by hand.
- **Progress view**: the SDD workflow's progress view with the app steps A1–A6 above the current task (`sdd_progress.js --profile app`): full at session start, compact at the end of every step and after every gate, so auto-approved gates stay visible. Mandatory in every harness: when the script cannot run or be found, write the view by hand in the same form, say the page was not generated and give the command; never link a page that does not exist.
- **App hard gate**: no task is opened until A1–A5 are approved for the documents' latest revisions; product code is written only inside a task.
- **App kinds**: `presentation`, `prototype`, `poc`, `mvp` — the profile's rigor table decides which steps, tests, and checks apply. A presentation and a prototype never have a backend, a code review, or a security scan, but always have automated end-to-end checks.
- **Fidelity** (presentation and prototype only): both are high-fidelity material made to be shown. `high` by default — an offline, responsive, animated React app on two invented JSON sources (application data; displayable strings), packaged as one HTML file, per [`references/packaged_web_app.md`](skills/vibe-coding-to-sdd/references/packaged_web_app.md); a prototype keeps changes in browser storage with a reset, a presentation only in memory; localization only on request. A prototype showcases its features: the `Showcase` list in `app.md` drives a feature tour, demo scenarios, and a deep link per feature, from one hideable demo panel. `standard` (feature previews, or static HTML) only when the human asks for a quick sketch. Visual references the human names are mood only, never a brand source.
- **Approval modes**, asked once and recorded in `app_status.md`: `review` (every gate), `auto-technical` (the human approves A1, A2, A4, A6; the rest are auto-approved), `auto-all`. Auto-approve waives reviews only: every document is still written in full, and no `manual` validation case is planned in an auto mode.
- **Operations** — setup, update, delete, publish, deploy — are asked before each action in every mode and recorded in `project/operations.md`. The agent never types a password, key, or payment detail.
- **Plain language**: at most 5 numbered questions a round, each with options and a recommended default; no technical term without an explanation; choices shown as what they mean for the human. Derive before asking; never guess; never invent URLs, IDs, accounts, or package names; never write a version number from memory.
- **Reverts**: input that conflicts with an approved app-level document is recorded in `app_status.md` → `Reverts`, the phase is set to `reverted`, and it is resolved with the human. A follow-up becomes work only as a backlog revision through A4.

### Tech stack

- What the human names wins and is reviewed; each finding is a risk row. Otherwise: React on Vite packaged as one offline HTML file for a presentation or prototype with `fidelity: high`, static HTML with TypeScript for a presentation with `fidelity: standard`; React (or Vue) with TypeScript for a web app; SwiftUI for iOS; Jetpack Compose for Android; React Native with NativeWind for hybrid. MVVM in a functional style: views render, view models (hooks or composables) hold state, services are injected interfaces with mocks.
- The look is approved as tokens at A2; the style framework that draws it (Tailwind CSS, Material UI for React only, Bootstrap, or the platform's own) is chosen at A3, and one generated token module is the only place a colour, size, or font literal may appear.
- No backend unless a listed need holds (a secret, shared data, sign-in, background work, stored files, a rule that must be enforced server-side). Default backend: Node.js, TypeScript, Express, layered and serverless-ready (application separate from its listener, stateless, configuration from the environment), described by an OpenAPI document; SQLite or PostgreSQL through one ORM with migrations; files behind an S3-protocol interface; one image per deployable part and one compose file.
- One entry point for commands — a `Makefile` or scripts (`setup`, `dev`, `build`, `lint`, `test`, `e2e`, `audit`, `scan`, `up`, `down`, `migrate`, `seed`, `clean`); a continuous-integration pipeline calls the same targets.

### Logging

- One logging module per part; four levels (`debug`, `info`, `warning`, `error`), each switchable by configuration; structured lines; a correlation ID created where an execution starts and written on every line it causes, so one execution can be followed end to end.
- `info` records the milestones (requests, outside calls, data changes, sign-ins, screens); `warning` the unexpected but survived; `error` every caught and uncaught failure; `debug` the reasoning.
- Sensitive data is never logged at `info`, `warning`, or `error`. At `debug` it may appear only masked, by the logging module.

### Security

- No secret in source, a built client, an image, a log, or a document; every outside input validated at the boundary; framework escaping for output; locked dependencies with a clean audit; no internal detail in user-facing errors.
- Backend: deny by default; server-side permission checks per resource; vetted sign-in handling; parameterised data access; security headers; an origin allow-list; safe cookies and request-forgery protection; rate and size limits; safe uploads; encrypted transport; no administrator rights.

### Testing & quality gates

- Every task's plan has `Stop criteria`: a *done when* checklist naming the case that proves each line, and the *stop and ask when* conditions.
- Per the rigor table: automated unit, integration, and end-to-end tests; an independent code review (`poc`, `mvp`); an independent QA run (every kind); a dependency audit; an OWASP ZAP scan for an app with a backend, against local targets only, passing with zero High and zero Medium alerts. A scanner that cannot run is a `high` risk and a handover gap — never reported as passed.
- The reviewer and the tester work from documents and code with a fresh context and change no product file; the independence level (`sub-agent`, `fresh session`, `same agent`) is recorded with each run.
- Each role is started with its brief — [`references/roles/code_reviewer.md`](skills/vibe-coding-to-sdd/references/roles/code_reviewer.md) and [`references/roles/qa_tester.md`](skills/vibe-coding-to-sdd/references/roles/qa_tester.md): expertise, boundaries, inputs, workflow, checklist, and report form. The tester reads no source code and writes only evidence. Where the harness offers a sub-agent defined for the role (`app-code-reviewer`, `app-qa-tester`), use it, with the brief as its prompt.
- Video evidence of end-to-end runs where the runner can record, with seeded data only; a missing video never blocks.
- The handover lists every gap — anything not delivered, not verified, or verified by a weaker method — and every open risk.

---

## Frontend Development Planner Guidelines

**Applies to:** any request to plan, scope, or structure a frontend feature, change, or bugfix, or to choose/document an architecture or design pattern — for every frontend stack. No source, prototype, or test files are written in this phase.

Planning and architecture/design-pattern enforcement live in [`skills/frontend-development-planner/SKILL.md`](skills/frontend-development-planner/SKILL.md); stack specifics live in its `references/stacks/<stack>.md`. The guardrails below are the AGENTS.md-facing copy; the skill wins if the two differ.

### Scope & approvals

- **Role**: the planning role of the SDD workflow for user-interface work — the contract, gates, tracks, human-in-the-loop protocol, and vibe-coding guardrail of the SDD Engineering Workflow Guidelines apply, with the additions in [`references/frontend_profile.md`](skills/frontend-development-planner/references/frontend_profile.md).
- **Output**: a task directory under `{bundle}/features/{feature}/tasks/` with `status.md`, `intent.md`, `plan.md`, and `validation.md` → `Validation plan` (`phase_intent` and `phase_plan` `approved`), per [`references/sdd_contract.md`](skills/frontend-development-planner/references/sdd_contract.md) and the templates in [`references/sdd_templates.md`](skills/frontend-development-planner/references/sdd_templates.md).
- **Knowledge bundle**: `{bundle}/` is an [OKF v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md) bundle; start every session from its `index.md` and keep `index.md`/`log.md` current in the same step that changes a document.
- **Ownership**: the planner alone writes `intent.md`, `plan.md`, and the validation plan; every edit adds a revision-table row. `status.md` holds phase state (`phase_intent`, `phase_plan`, `phase_design`, `phase_build`, `phase_validation`), approvals, and progress.
- **Derive before asking**: stack (repo markers + task context), project name (stack guide sources), and inputs (repo, feature `spec.md`, UX spec), recording each input's source; propose a feature name for approval when none is given.
- **Track**: `lite` only for a small task meeting the contract's and the profile's lite conditions, approved by the user; `express` only on the user's explicit request for speed; otherwise `full`.
- **Re-entry**: on a revert or re-plan, turn each trigger into an `Open questions` entry in the document it conflicts with, and resolve all of them with the user before editing it.
- **Project-wide prerequisites (owned by the planner)**:
  - Bundle: created at bootstrap with `project/workflow.md` and `project/decisions.md` (gate G0).
  - Design-system base: a locked `{bundle}/project/design_system/` built with `feature-preview-kit` Phase A (reuse if locked; otherwise the user chooses set-up or neutral kit); a plan whose design phase is required cannot be approved without it. Nested `{root}` (monorepo workspaces) each own a base; nearest wins.
  - UX design specification: the nearest repo spec (`DESIGN.md`, `docs/design*`, theme module) takes precedence; otherwise create `{bundle}/project/ux_design_specification.md` from [`references/ux_design_specification_template.md`](skills/frontend-development-planner/references/ux_design_specification_template.md).
  - Architecture: the repo document takes precedence; otherwise detect or select a pattern via the stack guide and write `{bundle}/project/architecture.md`, including commands and conformance rules.
- **Approvals**: the bundle and architecture document (G0); the UX spec, base, and UI pattern (F1); feature, task type, track, and intent (G1); the plan with its validation plan, the design-phase decision, and any new third-party dependency (G2) — explicit user approval unless the user says to proceed without asking. If the user can't be asked, record a pending `Approvals` row and the open question, and stop.
- **Progress view**: shown as the SDD Engineering Workflow Guidelines say — full at session start, compact after each step and gate decision.
- **Plan completeness**: the intent passes validation, no open question remains, every acceptance criterion maps to a work item and a validation case, and every choice of pattern, technology, dependency, data model, interface, or structure has a `Decisions` row.
- No stack guide for the detected stack → stop and ask; never plan without one.

### Architecture & maintainability

- Every planned file has exactly one layer/role and one responsibility in the plan's `Module map`, with allowed and forbidden dependencies.
- No `Module map` row may break the documented dependency direction; don't mix a new pattern into a module that follows another.
- Dependency injection over singletons; a new singleton or global state needs a written justification.
- Access control discipline — plan the minimal public surface.
- The plan's `Conformance checklist` lists every applicable conformance rule; the programming skill must tick each one in `validation.md` → `Conformance` before acceptance.
- A requirement that can't be met within the pattern is surfaced to the user as a decision — never a silent deviation.

### Other plan-time guidelines

- **Feature model**: views, navigation, interactions, and every state's kind (input/output/internal), owner, mutability, and reactivity.
- **Isolation**: every view, view model, coordinator, and service is injected and has a mock, so the feature can be previewed and tested alone.
- **Security and privacy**: classify handled data; plan secure storage/transport, no secrets in source or artifacts, private-by-default logging, and required permission/privacy declarations.
- **Accessibility**: plan labels, traits, reading order, scalable text, touch targets, contrast, and reduced motion.
- **Reuse**: reuse existing components; plan extraction when functionality already exists elsewhere.
- **Performance**: plan lazy/virtualized rendering for long, data-driven, or image-bearing lists; record the choice for short fixed content.
- **Localization**: flag development-language-only scope when no languages are requested.
- **Testing**: plan unit cases for business logic and view models, UI (`e2e`) cases only for critical flows, an accessibility-audit case per new view, and a `manual` case per state the user will verify.

---

## Swift Frontend Programming Guidelines (iOS / macOS)

**Applies to:** `**/*.swift`

Guardrails for iOS/macOS frontend development in Swift, SwiftUI/UIKit, and associated Swift Testing/XCTest/XCUITest code. Detailed design/development/test workflow lives in [`skills/swift-frontend-programming/SKILL.md`](skills/swift-frontend-programming/SKILL.md); planning, the UX spec, and the architecture document come from Frontend Development Planner Guidelines above; the guardrails below are the AGENTS.md-facing copy for agents that don't load skills, and the skill wins if the two differ.

### Scope, context root & approvals

- **Scope**: develop isolated, injectable features and views that can be previewed, tested, and launched alone, then integrated into the main app. Ensure a testable project (unit and UI test targets, isolation harness); scaffold one only when none exists, with user approval (XcodeGen template: [`references/project_template.yml`](skills/swift-frontend-programming/references/project_template.yml)).
- **Role**: the building role of the SDD workflow for Swift user-interface work, under [`references/sdd_contract.md`](skills/swift-frontend-programming/references/sdd_contract.md) and [`references/frontend_profile.md`](skills/swift-frontend-programming/references/frontend_profile.md).
- **Sources of truth**: approved `intent.md` > `plan.md` > `ux_design.md`. Never edit `intent.md`, the validation plan, or `plan.md` (except appending `Decisions` rows); input that conflicts with them reverts the task to planning (`phase_plan: reverted`, `Reverts` row, stop).
- **Root (`{root}`)**: the directory holding the nearest `{bundle_dir}/` bundle (default `.agentic_coding`), found by walking up from the working path; may be nested. No bundle means no approved plan — run the planner. The Xcode project (`project.yml`, `*.xcodeproj`, `*.xcworkspace`, `Package.swift`) is looked up in `{root}`. Artifacts are written under `{bundle}/` (committed by default; the user may gitignore it).
- **Hard gate**: design or code only for a task whose `status.md` has `stack: swift`, `profiles` listing `frontend`, and `phase_intent` and `phase_plan` `approved` for the documents' latest revisions, with a valid intent and complete plan; otherwise stop and run the planner first.
- **Phases**: design (`ux_design.md` in the task directory plus a `feature-preview-kit` Phase B preview in `{bundle}/features/{feature}/preview/` built on the locked base, never editing the base; a base gap reverts to planning; feedback within the plan is revised, conflicting feedback reverts), build (progress tracked per plan work item in `status.md`, every run logged in `validation.md`), validation and user verification on a simulator or Mac window with remarks recorded in `validation.md` → `Acceptance`, then close (`spec.md`, promoted decisions, closing handoff note). `spec.md` changes only at close.
- **Session continuity**: run the resume check (claim, revisions, repository state, handoff) at session start; before ending any turn that changed the task, update `Progress`, `git.head`, and the `Handoff note`, and write `handoff.md` when the contract requires it. Show the SDD progress view — full at session start, compact after each step and gate decision.
- **Failures**: record unresolved build/test/tooling failures in `status.md` → `Blockers`; never skip tests or suppress warnings to pass; after three attempts or when user action is needed, set `phase_build: blocked` and stop.
- **Approvals**: do not advance past project scaffolding (F2), the feature preview (G3), or user verification (G4) without explicit user approval (a dependency not in the plan is a plan conflict) — unless the user explicitly says to proceed without asking. If the user can't be asked, stop and record the pending question; never assume. In auto-approve mode, log every assumption.
- Never invent URLs, video/document IDs, endpoints, or package names — ask or use marked placeholders.
- When presenting a feature preview, verify it yourself first, then give the user a clickable link in chat (relative Markdown link + absolute `file://` URL).

### Naming convention

Follow repo-specific naming conventions if they exist; otherwise follow the [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/).

### Third-party libraries

Use only the third-party libraries named in the approved plan (the planner vets vulnerabilities and permissive licensing — Apache, MIT, BSD, etc. — and gets approval). Any other library is a plan conflict: revert to planning.

### Secure coding

- Do not expose sensitive, secret, or private information in code. Inject such information via proper configuration.
- Sanitize/escape all user-generated content before rendering.
- `Info.plist` usage descriptions for every permission; `PrivacyInfo.xcprivacy` entries for required-reason APIs or data collection.
- No secrets, personal data, or real user content in previews, fixtures, screenshots, logs, or `{bundle}` artifacts.

### Accessibility (a11y)

- Semantic UI first: standard controls before custom accessibility code; modifiers describe, never patch, the UI.
- VoiceOver: localized `accessibilityLabel` (plus hint/value where useful), correct traits, decorative images hidden, grouping and reading order set.
- Dynamic Type: text styles only, `@ScaledMetric` for scaling metrics, no clipping up to accessibility sizes.
- Touch targets at least 44x44 pt; WCAG AA contrast in light and dark mode; respect Increase Contrast and Differentiate Without Color.
- Respect Reduce Motion and Reduce Transparency.
- Keyboard: Full Keyboard Access (iOS) / key view loop (macOS), `@FocusState`, Escape dismisses modals; Voice Control labels match visible text.
- Automated `performAccessibilityAudit()` in a UI test per new view, plus manual Accessibility Inspector/VoiceOver checks.

### Memory & safety

- Avoid force-unwrapping (`!`) in production code — use `guard let`/`if let`, or `??` with sensible defaults. Reserve force-unwraps for cases with a provable invariant.
- No force-casts (`as!`) — prefer `as?` with explicit handling of the failure case.
- Avoid retain cycles — use `[weak self]` / `[unowned self]` in closures, especially in async callbacks, delegates, and Combine/async streams.
- Avoid implicitly unwrapped optionals (`!` in declarations) except for well-justified cases (e.g., `@IBOutlet`s configured before use).
- For closures, confirm variable availability before use inside the closure via `guard let`/`if let`.
- Clean up closures as soon as their functional scope is over.

### Concurrency

- Use Swift Concurrency (`async/await`, actors) correctly — avoid mixing GCD and structured concurrency without clear boundaries.
- Mark UI-mutating code `@MainActor` — never touch UI from a background thread.
- Guard shared mutable state with actors, not manual locks/queues, where possible.
- Handle task cancellation explicitly in long-running `Task`s (`Task.isCancelled` or `withTaskCancellationHandler`).
- No data races — enable Swift 6 strict concurrency checking where feasible.

### Error handling

- No silent `catch {}` blocks — every caught error should be logged, surfaced, or explicitly justified as ignorable.
- Use typed/domain errors (`enum: Error`) rather than generic `NSError` or `String`-based errors.
- Don't use exceptions/`fatalError` for recoverable conditions — reserve `fatalError`/`precondition` for truly unrecoverable programmer errors.

### Logging

Check whether a centralized logging framework is already in use. If not, use the minimal OSLog wrapper in [`skills/swift-frontend-programming/references/logging.md`](skills/swift-frontend-programming/references/logging.md) (Swift 6 clean).

- Never expose secret, sensitive, or private information in logs — use OSLog `privacy: .private` by default, or mask it.
- Log errors/exceptions with full detail.
- Warning level for unexpected behavior or input.
- Info level for major events/checkpoints/milestones.
- Debug level for debugging only — disabled in production builds.
- Each log level independently enable/disable-able.

### API & data handling

- Validate and sanitize server responses — don't force-decode JSON; use `Codable` with proper optional/failable handling.
- No hardcoded secrets/API keys in source — use Keychain or build-time injection, not plist/config files committed to source control.
- Use Keychain for sensitive data, never `UserDefaults`.
- Certificate/App Transport Security compliance — no arbitrary loads over HTTP without explicit, justified exceptions.

### Architecture & maintainability

- Apply the pattern in `project/architecture.md` uniformly, placing each file per the plan's `Module map`; tick each `Conformance checklist` item in `validation.md` → `Conformance` with evidence before verification — avoid massive view controllers/views mixing business logic and UI.
- Isolated components: every dependency is a protocol with a live implementation and a mock, injected via initializer or `@Environment`; a `#Preview` per planned state.
- State per the plan: inputs `let`/`@Binding`, internal state `private(set)` with one owner, outputs as callbacks.
- Dependency injection over singletons for testability, except where a singleton is genuinely justified (e.g., `URLSession.shared`).
- Access control discipline — default to `private`/`fileprivate`; expose only what's needed.

### Testing & CI

- Unit tests required for business logic and view models, not just UI smoke tests.
- SwiftLint (or equivalent) enforced in CI, not just locally.
- No compiler warnings tolerated — treat warnings as errors in CI builds.
- UI tests for critical flows (auth, checkout, core navigation); keep them few — they are slow.
- Never hardcode a simulator name — pick one from `xcrun simctl list devices available`. Run `xcodebuild build-for-testing` then `test-without-building` with `-destination 'platform=iOS Simulator,id={UDID}'`.
- Swift 6: mark XCUITest classes `@MainActor`; set `accessibilityIdentifier` on interactive elements.

### Performance

- Avoid retain-heavy patterns in SwiftUI — unnecessary `@State`/`@Published` triggering re-renders.
- Profile with Instruments for memory leaks and main-thread hangs before shipping, especially on lists/scroll views with images.
- Lazy-load images and heavy views (`LazyVStack`/`LazyHStack`/`List`, proper cell reuse in `UITableView`/`UICollectionView`) — required for long, data-driven, or image-bearing lists. A plain `VStack` is fine for short, fixed content (roughly < 30 rows, no images); note the choice in the plan.

### Localization

- All user-facing strings are localizable: `Text("literal")`/`LocalizedStringKey`, `String(localized:)`, and a String Catalog (`Localizable.xcstrings`); use interpolation/plural variations, never concatenation.
- Locale-aware formatting (`FormatStyle`, `Measurement`) for dates, numbers, units.
- Leading/trailing alignment for RTL; check long strings; localize accessibility labels.
- Default is development-language only — flag it in the plan; bundled/API content is localized by its provider.

### Other guidelines

- **Reuse**: favor reusable components — if a functional part of the code already exists elsewhere in the repo, extract it into a shared reusable component.
- **Lean code**: use inline functions and function chaining; prefer `filter`/`map`/`reduce` over manual loops; prefer system frameworks/libraries over custom implementations where possible.

---

## Feature previews and design-system base

**Applies to:** the design phase of any stack. [`skills/feature-preview-kit/SKILL.md`](skills/feature-preview-kit/SKILL.md) is the source of truth: the planner runs Phase A (the base in `{bundle}/project/design_system/`, once per `{root}`), the programming skill runs Phase B (one preview per feature in `{bundle}/features/{feature}/preview/`) and never edits the base. Run its CLI with `--root {root}`; `fpk migrate` moves a bundle from the earlier `base/` and `feature/<slug>/` folders.

---

## Testing skills and other artifacts

**Applies to:** any request to test, evaluate, or trial a skill, rule set, or other artifact in this repository.

- **Location**: all generated items go under `.test/{yyyymmdd}/{test_name}/` (e.g. `.test/20261002/biryani_recipe/`), where `{test_name}` (the test item / test repo name) and the test specification come from the user's prompt. If the name is missing, ask. `.test/` is gitignored; ensure it is listed in `.gitignore`.
- **Treat `.test/{yyyymmdd}/{test_name}/` as `{root}`** for the skill under test: its `{bundle_dir}/`, project files, and sources are generated inside it, so the repo's own files are never touched.
- **Test specification first**: write `TEST_SPECIFICATION.md` in that directory — subject, functional spec as given, the skill-workflow checklist (step → expected artifact → pass criterion), and acceptance tests — before generating anything else.
- **Follow the skill exactly**, including its approval gates. Take guidance only from the skill under test (`SKILL.md` and its `references/`); do not apply the matching AGENTS.md section. Do not simulate approvals; if a gate can't be answered, stop and report. Do not re-run a test unless the user asks.
- **Report**: finish with the skill's own report plus a "Skill findings" section listing gaps, ambiguities, and fixes suggested for the skill. Also, **in the report specify estimated token usage to perform the task using skill**
- Provide clickable links in chat for any HTML output the skill produces (relative Markdown link plus absolute `file://` URL).
- Run the stack's own build, lint and test tooling as the skill specifies; a skill is not considered passing until its generated code builds and its tests run.
