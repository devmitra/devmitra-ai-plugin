---
name: vibe-coding-to-sdd
description: Runs a vibe-coding request for a whole application under spec-driven development (SDD) — an MVP, a proof of concept, a clickable prototype, or an interactive HTML presentation, often asked for by a non-technical person. Records the app intent, the design system, the architecture and tech stack, a backlog, and a risk register — each approved by the human, or auto-approved on their instruction — then builds the app one SDD task per backlog item with automated tests, independent review and QA, a security scan, and a project handover. Use when asked to build, vibe-code ("vibe code"), or one-shot a whole app, website, mobile app, prototype, PoC, MVP, or interactive presentation ("build me an app that …", "just build it"); to bring an existing vibe-coded app under specifications; or when the workspace has `{bundle}/project/app.md`. It takes precedence over sdd-engineering-workflow for whole-application requests. DO NOT use for one feature, change, or bug in an app that has no `project/app.md` (use sdd-engineering-workflow), or for questions and code review.
---

# Vibe Coding to SDD

## Purpose
Give a person who describes an app in plain words the speed of vibe coding and the records of spec-driven development. This skill is the **application-level profile** of the SDD workflow: it runs before the first task and after the last, and every task in between is an ordinary SDD task. The human — often non-technical — decides what the app is, how it looks, and what is in scope; the agent decides and documents the rest, and builds it.

**Output**: in `{bundle}/project/` — `app.md`, `app_status.md`, a locked `design_system/`, `architecture.md`, `backlog.md` with its generated tracker and board, `risks.md`, `operations.md`, and `handover.md`; one SDD task per backlog item; and the working app with its tests.

**References** — follow them exactly:
- [`references/app_profile.md`](references/app_profile.md) — the profile: terms, layout, gates A1–A6, approval modes, operations, app kinds and rigor, additions to task documents, checks.
- [`references/app_templates.md`](references/app_templates.md) — the template of every app-level document.
- [`references/app_intake.md`](references/app_intake.md) — the plain-language interview, the existing-app path, and slicing an app into backlog items (read at steps 1 and 4).
- [`references/tech_stack.md`](references/tech_stack.md) — choosing or reviewing the stack, the style framework, the backend, and the commands (read at step 3).
- [`references/engineering_baseline.md`](references/engineering_baseline.md) — the logging and security rules that become conformance rules (read at step 3).
- [`references/quality_gates.md`](references/quality_gates.md) — stop criteria, the independent review and QA roles, the security scan, and video evidence (read at steps 6 and 7).
- [`references/sdd_contract.md`](references/sdd_contract.md) and [`references/sdd_templates.md`](references/sdd_templates.md) — byte-identical copies of the `sdd-engineering-workflow` skill's files.
- [`scripts/backlog.js`](scripts/backlog.js) — builds the tracker and the board from `backlog.md`. Below, `backlog` = `node <this-skill-dir>/scripts/backlog.js` (Node 16+, no dependencies).
- The **progress view** of `sdd-engineering-workflow` (its SKILL.md → *Progress view*) — the app steps A1–A6 above the current task's steps, in chat and in `{bundle}/progress.html`. Below, `progress` = `node <sdd-engineering-workflow dir>/scripts/sdd_progress.js`. See [Progress view](#progress-view) for finding it and for the by-hand fallback.

## Principles
1. **Records before code, at every size.** No task is opened before the app-level documents its app kind requires are approved; no product code is written outside a task.
2. **Rigor follows the app kind.** A presentation is not an MVP: the profile's rigor table says which steps, tests, and checks apply.
3. **Auto-approve waives reviews — never records, never operations.** Every document is written in full in every mode; installing, setting up, updating, deleting, publishing, and deploying are always asked.
4. **Plain language to the human.** Technical choices are shown as what they mean for the human: cost, time, what can change later.
5. **One source per fact.** `backlog.md` is the only backlog; a task's `status.md` is the only record of its state; the tracker and the board are generated.

## Required skills
- `sdd-engineering-workflow` — runs the bundle bootstrap and every task. Not available → stop and tell the human; never build without it.
- `feature-preview-kit` — builds the design-system base (step 2) and every feature preview. Not available → stop before step 2 and tell the human.
- A planning or programming skill for the task's stack, when one is installed, plans and builds that task under its own rules and this profile's additions. When none is installed, `sdd-engineering-workflow` runs the task with the defaults in [`references/tech_stack.md`](references/tech_stack.md).

## Talking to the human
- Ask in plain chat text: at most 5 numbered questions a round, each with one line on why it matters and two to four options, the recommended one first. The human may answer by number and letter, or say `defaults`.
- A question or option shown to the human contains no technical term without a plain explanation next to it, and each option says what it means for them.
- Derive before asking: the request, files the human gave, the repository. An unknown is an `Open questions` row, never a guess.
- **Gate request** — one message: the gate and what is approved; links to the documents and, where one exists, the page to look at; at most 10 lines of summary; what changed since the last revision; and a closing question that names the gate ("Approve A4, or tell me what to change?").
- Never invent URLs, IDs, endpoints, account names, or package names; never write a version number from memory — read it from the registry or the tool when the plan is written.

## Approval modes and operations
- The mode is asked once, in the first interview round, and recorded in `app_status.md` (`approval_mode`, and a `MODE` row quoting the human's words): `review`, `auto-technical`, or `auto-all` — the profile's **Approval modes** table says which gates each mode auto-approves. With no answer, the mode is `review`.
- An auto-approved gate is recorded as the contract's **Approvals** says: decision `auto-approved`, by the agent actor, notes quoting the `MODE` row, every choice the human would have made logged under `Assumptions`.
- **Operations** (profile → **Operations**) are asked in every mode, before each one, and recorded in `project/operations.md`. A declined or unanswered operation is not performed.
- A session in which the human cannot be asked: record the gate or operation as `pending`, write the `Handoff note`, and end the turn.

## Workflow

| Step | What | Gate |
|---|---|---|
| 0 | Session start: find the bundle, resume, or route | — |
| 1 | Bundle and app intent | G0 + A1 |
| 2 | Design system — the look | A2 |
| 3 | Architecture, tech stack, and setup plan | A3 |
| 4 | Backlog | A4 |
| 5 | Risks | A5 |
| 6 | Build loop — one SDD task per backlog item | each task's G1–G4 |
| 7 | Handover | A6 |

Every app kind passes every step; the profile's rigor table decides how much each step holds. End every turn that changed a document with the [session end](#session-end).

### 0. Session start
1. Run the contract's **Discovery**.
2. **Bundle with `project/app.md`**: read `project/app_status.md` (frontmatter and `Handoff note`), check its claim as the contract's **Resume check** says, and resume at `next`. With `next: Build`, run `backlog check` and continue the open task, or pick the next item (step 6).
3. **Bundle without `project/app.md`**: a request for one feature, change, or bug belongs to `sdd-engineering-workflow`. A request to extend it into a whole app, or to bring it under an app-level backlog, continues at step 1.2.
4. **No bundle, repository has product code**: the existing-app path of [`references/app_intake.md`](references/app_intake.md), from step 1.
5. **No bundle, empty or new directory**: step 1.
6. A request that conflicts with an approved app-level document is an [app-level revert](#app-level-revert), never a silent edit.
7. Show the full [progress view](#progress-view) (`--view full`; `--profile app` matters only until `project/app_status.md` exists). This comes before the first question, even when no bundle exists yet.

### 1. Bundle and app intent (gates G0 + A1)
Read [`references/app_intake.md`](references/app_intake.md) first.
1. Bootstrap the bundle with `sdd-engineering-workflow` step 1. For a new app `project/architecture.md` stays `draft`; step 3 completes it.
2. Say once, in at most three sentences, what will be recorded and why: the app is built in small approved pieces, so a later change or fix starts from a few short documents instead of a re-read of all the code.
3. Derive the app kind, platforms, journeys, data, and constraints from the request and any files given; create `project/app.md` and `project/app_status.md` from the templates; list both in the bundle `index.md`.
4. Run the interview until no question is `open`. The first round always includes the approval mode and, when it cannot be derived, the app kind and the delivery target. Set `task_track` in `app_status.md` to `express`, as the SDD vibe-coding guardrail proposes; set it to `full` only when the human asks to review each task's intent and plan separately.
5. Run the profile's **App intent validation** and fix every failure.
6. Set `phase_app_intent: in_review` and send one gate request for G0 and A1. On approval: `phase_app_intent: approved`, `app_revision` to the latest revision, `app.md` to `stable` with `verified`, an `Approvals` row, `next: Design system`.

### 2. Design system — the look (gate A2)
Approves how the app looks, not which library draws it; the library is chosen at step 3.
1. Ask for design sources, in one question: a brand or design guideline, existing HTML or CSS, a public URL, screenshots — or none.
2. Run `feature-preview-kit` Phase A with `--root {root}`: the sources the human named and, for an existing app, its code. With no source, offer the choice the kit defines — set one up from a few questions (name, main colour, tone), or the neutral kit. Never invent brand values.
3. Set the base's devices from `app.md` → `platforms`.
4. Verify the built style guide yourself — the kit's contrast check passes or every failure is explained — and lock the base.
5. Set `phase_design_system: in_review` and send the gate request with a clickable link to `project/design_system/base-preview.html` (relative Markdown link and absolute `file://` URL). Feedback is a new base version, re-locked. On approval: `phase_design_system: approved`, an `Approvals` row naming the base version, `next: Architecture`.

### 3. Architecture, tech stack, and setup plan (gate A3)
Read [`references/tech_stack.md`](references/tech_stack.md) and [`references/engineering_baseline.md`](references/engineering_baseline.md) first. For a `prototype`, sub-steps 1, 2, and 5 reduce to one decision row — the feature previews are the deliverable and no app code is written — and `architecture.md` describes the previews as its structure, with the preview kit's commands.
1. **The human gave a stack or architecture**: keep it, and run the stack guide's *Review of a given stack*. Each finding is a risk row with a proposed response, shown to the human; a finding that makes a `must` requirement impossible is an open question.
2. **None given**: choose with the stack guide's defaults — frontend per platform, the style framework, whether a backend is needed, data and storage, and the commands.
3. Record every choice as a row of `project/decisions.md` (reason, rejected alternative, source `A3`). Set `has_backend` in `app_status.md`.
4. Complete `project/architecture.md` from the contract's template: `Overview`, `Structure` (layers and their dependency rules), `Conventions`, `Commands` (each marked `not run` until the foundation task runs it), and `Conformance rules` — the pattern's rules plus every rule of the engineering baseline that applies to the app kind.
5. **Setup plan**: list every operation the build will need — runtimes, package managers, a container runtime and images, test browsers or simulators, the scanner, accounts — as rows of `project/operations.md` with decision `pending`. Ask for the continuous-integration provider and the deployment target, or record `none for now`.
6. Run the profile's **Architecture completeness**.
7. Set `phase_architecture: in_review` and send the gate request: the stack in a table of *choice — what it means for you*, the risks found, and the setup plan. The setup plan is asked as operations in the same message and answered separately; it is never auto-approved. On approval: `phase_architecture: approved`, `architecture.md` to `stable` with `verified`, an `Approvals` row, `next: Backlog`.

### 4. Backlog (gate A4)
1. Slice the app into backlog items as [`references/app_intake.md`](references/app_intake.md) → *Slicing* says, and write `project/backlog.md` from the template in build order.
2. Run `backlog sync --root {root}`: it writes `project/backlog_tracker.md` and `project/backlog.html`. Never edit either by hand. List all three in the bundle `index.md`.
3. Run the profile's **Backlog completeness**; `backlog check --root {root}` must pass.
4. Set `phase_backlog: in_review` and send the gate request with a clickable link to `project/backlog.html`. On approval: `phase_backlog: approved`, `backlog_revision` to the latest revision, `backlog.md` to `stable` with `verified`, an `Approvals` row, `next: Risks`.
5. After approval, adding, removing, reordering, or re-prioritising an item is a new backlog revision through A4. Opening a task and its state changes are not revisions.

### 5. Risks (gate A5)
1. Write `project/risks.md` from the template: the risks found at step 3, plus product, security, privacy, delivery, cost, dependency, and operations risks derived from `app.md`, the architecture, and the backlog. Give each a likelihood, an impact, the level the template's table yields, and a response: `avoid`, `mitigate`, `transfer`, `defer`, or `accept`.
2. Link every `avoid` and `mitigate` risk to the backlog item or conformance rule that carries it out. A mitigation that needs work adds a backlog item of kind `mitigation` — a backlog revision, approved with this gate.
3. Run the profile's **Risk completeness**, then `backlog sync`.
4. Set `phase_risks: in_review` and send the gate request: the `high` risks first, each in one plain sentence with its response, then the backlog items added. On approval: `phase_risks: approved`, `risks_revision`, `risks.md` to `stable` with `verified`, an `Approvals` row (and an A4 row when the backlog changed), `next: Build`.

### 6. Build loop
Read [`references/quality_gates.md`](references/quality_gates.md) first. Check the profile's **App hard gate** before opening any task. Set `phase_tasks: in_progress`.

For each backlog item, in order, whose dependencies are closed:
1. **Open the task** with the skill that covers it (see [Required skills](#required-skills)), giving it the backlog row, the journeys and requirements it covers, and the risks it mitigates. Use `task_track` from `app_status.md`. Put the task's `status.md` link in the item's `Task` cell and run `backlog sync`.
2. **Intent and plan** (the task's G1 and G2) with the profile's additions: `App context` in `intent.md`, `Stop criteria` in `plan.md`, the validation cases the rigor table requires, and every applicable baseline rule in the `Conformance checklist`. List each operation the task needs under `Stop criteria`.
3. **Design** (G3), for a task with a new or changed visual interface: `ux_design.md` and a `feature-preview-kit` Phase B preview on the locked base, linked from `Prototype`. Walk the preview yourself before showing it. A base gap reverts the task to its plan and the base to step 2.
4. **Build** as the task's skill says, one work item at a time, under the engineering baseline.
5. **Validate** (G4): run the whole validation plan; then the independent review, the independent QA run, the dependency audit, and the security scan, as the rigor table requires and [`references/quality_gates.md`](references/quality_gates.md) describes; record video evidence where the runner supports it. Every finding is a `Defects` row; fix and run again until the profile's additions to **Validation completeness** hold.
6. **Stop** when a stop condition of the plan's `Stop criteria` is met: record the blocker and end the turn. Never work around one.
7. **Close** the task as its skill says. Then: run `backlog sync`; set the status of each risk this item mitigates, with the evidence; copy each `Follow-ups` bullet of the task to `app_status.md` → `Follow-ups`; rewrite the `Handoff note`.
8. A follow-up becomes work only as a backlog revision through A4.

When every item except the handover item is closed or `removed`: `next: Handover`.

### 7. Handover (gate A6)
The handover is the last backlog item: a `technical` task, opened and run like any other.
1. Its work items: run every success criterion of `app.md` end to end against the finished app, recording video; run the security scan and the dependency audit on the whole app where the rigor table requires them; write the run guide in the repository's `README`; write `project/handover.md` from the template.
2. **Gaps**: compare the finished app with `app.md` journey by journey and requirement by requirement. Everything not delivered, not verified, or verified by a weaker method than planned — a review by the same agent, a scan not run, a manual case without a result — is a `GAP` row. A gap is never left out to make the result look complete.
3. Give the human the test script from `handover.md` and ask them to try the app. Record what they report as the task's `Acceptance` rows.
4. Run the profile's **Handover completeness**. Set `phase_handover: in_review` and send one gate request for the task's G4 and A6: what was built, the test and scan results, the gaps, the open risks, and what is needed before real users or a public release.
5. On approval: close the task; `phase_handover: accepted`, `phase_tasks: done`, `handover.md` to `stable` with `verified`, an `Approvals` row, `next: done`, `claim: none`; run `backlog sync`; add a `**Completion**` entry to the bundle `log.md`.
6. Publishing or deploying the app is not part of the handover. If the human asks for it, it is an operation: the request lists every `high` risk that is not `closed` and every gap.

### App-level revert
Used when new input, review feedback, or a task's revert conflicts with an approved `app.md`, design system, `architecture.md`, `backlog.md`, or `risks.md`:
1. Add a `Reverts` row in `app_status.md` (trigger, and the document › section it conflicts with), set that document's phase to `reverted` and `next` to its step, and add a `**Revert**` entry to the bundle `log.md`.
2. Stop work toward the conflicting input; open tasks the change does not touch may continue.
3. Turn each trigger into an `Open questions` row, resolve every one with the human, revise the document (new revision), and return through its gate. Then re-check each open task against the new revision; a task it conflicts with reverts as the contract says.

### Session end
Before ending any turn that changed an app-level document or a task: run the contract's **Session end** for the task; run `backlog sync`; in `app_status.md` set `generated` and `claim`, rewrite the `Handoff note` (done, next action, watch out), and set `next`; then show the compact [progress view](#progress-view).

## Progress view
The human sees the workflow, its gates, and where the work stands in **every** harness; a turn that ends a step, decides a gate, or records a blocker or a revert without the view is incomplete. The bundled script is one way to render it, never a condition for showing it.
1. **Script** — when you can run commands: locate `sdd_progress.js` (it ships in the `sdd-engineering-workflow` skill's `scripts/` directory; if the path is unknown, search the skills directories of the workspace and the user's home for that file name), then run `progress --root {root} --profile app --by {actor}` (add `--view full` at session start and on request). Put its printed text in your message unchanged, and give the human the clickable link to the generated `{bundle}/progress.html` (relative Markdown link plus absolute `file://` URL).
2. **By hand** — when you cannot run commands, cannot find the script, or it fails: write the view yourself into your message from `app_status.md` and the open task's `status.md`, in the form of the `sdd-engineering-workflow` skill's `assets/progress/progress_template.md` (if that file is unreadable, use this form):
   - one line, `SDD · {project} › {task title} · {approval mode} mode`;
   - the app strip: `A1 intent → A2 design system → A3 architecture → A4 backlog → A5 risks → Build → A6 handover`, each step with its icon (✅ approved · 🤖 auto-approved · 🟡 waiting for the human · 🔵 in progress · ⚪ not started · ⏭️ skipped · ⛔ blocked · ↩️ reverted), the current step in bold; the current task's strip G1 → G2 → G3 → Build → G4 the same way (full view: a table of step, gate, what is approved, who approves, state);
   - `Just now` (the latest gate decision, by whom), `Next`, and `Waiting on you`.
3. **The page** — `progress.html` exists only when the script ran. When it did not, say so in one line and give the command (`progress --root {root} --profile app`, with the script's real path) for the human to run, so the page is one step away; never invent a page or a link to a file that does not exist.
4. Never skip the view because a script is missing, a shell is unavailable, or the harness has its own task list; the view comes from the records, which are always written.

## Engineering baseline
Every app with product code follows [`references/engineering_baseline.md`](references/engineering_baseline.md): one logging module with `debug`, `info`, `warning`, and `error` levels that makes each execution traceable end to end and never logs sensitive data unmasked; and the security rules for the client and the backend. The rules enter `architecture.md` → `Conformance rules` at step 3, so each task's plan lists them and each task's validation proves them.

## Report
At the end of each step, tell the human in a few plain lines: what was recorded, what was decided for them and why, what is next, and anything they must do; end with the compact [progress view](#progress-view) (never omitted), which also shows every gate an approval mode auto-approved. Give a clickable link — relative Markdown link plus absolute `file://` URL — to every HTML page or video they are asked to look at.
