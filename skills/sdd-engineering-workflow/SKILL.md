---
name: sdd-engineering-workflow
description: Runs spec-driven development (SDD) for any software task with any coding agent — turns feature details, a user story, a technical task, a bug, or a change request into human-approved intent, plan, and validation documents, then tracks build, validation, and handoff in a knowledge bundle (default directory `.agentic_coding/`) so a later session or a different agent can recover the context, specifications, and reasoning. Use when asked to specify, plan, build, change, fix, validate, resume, or hand off a feature or task; when the workspace has a bundle directory (default `.agentic_coding/`); or when asked to build an app or feature fast without specs ("vibe coding", "just build it"). DO NOT use for questions, code review, or edits that change no behaviour (typos, comments, formatting).
---

# SDD Engineering Workflow

## Purpose
Establish a spec-driven development lifecycle that any agent, in any harness, can start, continue, and audit: the human and the agent co-develop the specifications, the agent builds from them, and the records stay with the code. This skill owns the workflow and its records; it works on its own, and stack or domain skills add their guidelines on top (see [Working with other skills](#working-with-other-skills)).

**Output**: a task directory in `{bundle}/` holding `status.md`, `intent.md`, `plan.md`, `validation.md`, and when needed `ux_design.md` and `handoff.md`; the working code and tests; and an updated feature `spec.md`, indexes, and logs.

**References** — follow them exactly:
- [`references/sdd_contract.md`](references/sdd_contract.md) — the contract: terms, layout, discovery, ownership, phases and gates, approvals, task types and tracks, checks, session continuity, rules.
- [`references/sdd_templates.md`](references/sdd_templates.md) — the template of every document.
- [`references/intake.md`](references/intake.md) — classifying the input and running the interview (read at step 2).
- [`references/bundle_workflow.md`](references/bundle_workflow.md) — the playbook copied into every bundle (read at step 1).
- [`scripts/sdd_progress.js`](scripts/sdd_progress.js) with [`assets/progress/progress_template.md`](assets/progress/progress_template.md) and [`assets/progress/progress_template.html`](assets/progress/progress_template.html) — render the [progress view](#progress-view). Below, `progress` = `node <this-skill-dir>/scripts/sdd_progress.js` (Node 16+, no dependencies).

## Principles
1. **The artifacts carry the context, not the conversation.** Anything a later session needs is written into the bundle before the turn ends.
2. **What and why, then how, then code.** The intent is approved before the plan; the validation plan is approved before any product code.
3. **Co-developed with the human.** An approved document changes only through its gate.
4. **A gate can be waived by the human; a record cannot.** Speed shortens the conversation, never the documents.
5. **Derive before asking; never guess.** An unknown becomes an open question, not an assumption.
6. **The developer owns the code.** Documents explain and trace the code; they are kept reviewable, and `spec.md` always describes what is actually built.

## Agent and harness independence
- This skill needs only three abilities: reading and writing files in the workspace, asking the human in chat, and — when available — running shell commands. It names no tool, command, or agent feature. Where your harness has an equivalent (a question dialog, a task list, sub-agents), you may use it, provided the same records are written.
- State lives only in the bundle. Never rely on conversation history, harness memory, or a tool-specific task list for anything a later session needs.
- The bundled `progress` script is optional: it only renders the [progress view](#progress-view) from the records, and the same view can be written by hand. The view itself is not optional: a missing script or shell never excuses omitting it.
- No shell: you cannot run commands, so ask the human to run each validation command and record the run with their actor. No git, or a repository that does not track the task's product files (for example, it ignores `{root}`): omit the `git` anchor, write `n/a` in the `Run log` → `Commit` column, and skip the repository step of the resume check.
- Identify yourself and read the time as the contract's **Terms** define.

## Human-in-the-loop protocol
- **Asking**: plain chat text, in the form of the interview in [`references/intake.md`](references/intake.md) — at most 5 numbered questions a round, each with a reason and options, the recommended one first. If your harness's question dialog holds fewer questions or options than a round, send the round in parts and keep the question numbers.
- **Decisions that are always the human's**: scope and behaviour, any trade-off the user of the software would notice, a new third-party dependency, anything hard to undo, and every gate.
- **Gate request** — one message containing: the gate and what is being approved; links to the documents with their revisions; a summary of at most 10 lines; what changed since the last revision; and a closing question that names the gate — "Approve G2, or tell me what to change?" — so that a short reply is unambiguous.
- **Recording, non-interactive sessions, and auto-approve**: per the contract's **Approvals**. Never assume an answer and continue.
- **Operations**: installing, updating, or removing software on the system; setting up or changing an environment, account, or service; deleting files or data the task did not create; publishing; and deploying each need their own approval, asked and recorded as the contract's **Approvals** → *Operations* says. A gate approval never covers one, and neither does auto-approve: auto-approve waives the review of documents and of the code built from them, nothing else.
- Never invent external references (URLs, IDs, endpoints, ticket numbers, package names); ask, or use marked placeholders.

## Progress view
Shows the human the workflow, every gate, who approves it, and where the work stands. It is rendered from the bundle records and is never a record itself.
- **Render** after the records of the step are written, so the view shows the decision just made. With a shell: `progress --root {root} --by {actor}` (add `--view full`, and `--task {task_id}` when more than one task is open). It prints the rich text — put it in your message unchanged — and writes `{bundle}/progress.html`; before the bundle exists, it writes the page to the system temporary folder and names it in its output. Without a shell, or when the script cannot be found or fails: fill [`assets/progress/progress_template.md`](assets/progress/progress_template.md) by hand from `status.md` and put it in your message; say in one line that the page was not generated and give the command that makes it, with the script's real path. Never link a page that does not exist.
- **Full view**: at session start — after step 0, or before step 1 when there is no bundle — and whenever the human asks where things stand.
- **Opening view** (`--view opening`): only the title, the strip, and the page link — for a profile skill's short opening message.
- **Compact view**: at the end of every step; after every gate decision, including `auto-approved` and `pending`; and when a blocker or a revert is recorded. In a gate request it goes before the closing question. Never after single commands or file edits.
- An auto-approved gate is always shown: the view is how the human sees what was decided for them.
- `progress.html` is generated: never edit it by hand; it follows the bundle's commit or gitignore choice (G0). Its *Copy reply* button only copies text — an approval counts only when the human sends it in chat.

## Vibe-coding guardrail
Applies when the human asks to build or extend an app or feature without specifications — "vibe code this", "just build it", "quick prototype", "no planning", "one-shot it" — or sends a multi-file build request and declines to specify it.

1. **Do not refuse, and do not start coding.** Say once, in at most three sentences, what you will record and why: with a spec, a module map, and a decision log, each later change request or bug fix starts from a few short documents instead of a re-read of the whole codebase — less effort and fewer tokens every time. Then propose the `express` track.
2. **Express floor** — the least this skill does, whatever is said about speed:
   - *Intent*: one interview round; a question left unanswered is set to `defaulted` and its default logged in `Assumptions`. Requirements and acceptance criteria are still written.
   - *Plan*: complete `Module map`, `Decisions`, and `Work items`, and a validation plan with at least one case per acceptance criterion, automated wherever the stack has a test runner.
   - *Gates*: G1 and G2 as one gate request; G4 at the end.
   - *Build*: one work item at a time, as in step 5; never the whole app in one work item.
   - *Close*: `spec.md` and the promoted decisions, as in step 7.
3. **The human declines the review too** ("don't ask me, just build it"): that is auto-approve — record each gate as `auto-approved`, log every assumption, do not stop at G1–G3, and still write every document. Ask for acceptance (G4) at the end unless the instruction named acceptance. Operations keep their own approval (see [Human-in-the-loop protocol](#human-in-the-loop-protocol)).
4. The [Engineering guardrails](#engineering-guardrails) apply in full on every track.
5. A later request on an app built this way is a `change` or `bugfix` against its `spec.md`; an app built earlier with no spec follows *Code without a spec* in [`references/intake.md`](references/intake.md).
6. **A whole application** — an app, a site, a prototype, or a product with several features in one request — is never built as one task. When an application-level profile skill is available (see [Working with other skills](#working-with-other-skills)), hand the request to it before opening any task. Without one, split it as *Sizing and splitting* in [`references/intake.md`](references/intake.md) says and run this guardrail on each task.

## Workflow

| Step | What | Gate |
|---|---|---|
| 0 | Session start: find the bundle, discover, resume | — |
| 1 | Bootstrap the bundle (once per `{root}`) | G0 |
| 2 | Intake and intent | G1 |
| 3 | Plan and validation plan | G2 |
| 4 | UX design (only if the plan requires it) | G3 |
| 5 | Build | — |
| 6 | Validate | G4 |
| 7 | Close | — |

Every step ends in a recorded state, so each can run in its own session or be done by a different agent. End every turn that changed a task with the contract's **Session end** (see [Handoff](#handoff)).

### 0. Session start
1. Run the contract's **Discovery**. No bundle → step 1.
2. Find the task: the one the request names; otherwise the open task of the feature the request concerns. Several candidates → ask. None → step 2.
3. An existing task: run the contract's **Resume check**, then continue at `status.md` → `next`. If the request conflicts with an approved document, [revert](#revert).
4. A request to change behaviour or structure with no task — including "just fix it" and "quick change" — opens a task at step 2. Never write product code first.
5. Show the [progress view](#progress-view), full.

### 1. Bootstrap the bundle (gate G0)
1. Propose `{root}`: the repository root, or the workspace or package directory the human names.
2. Create `index.md`, `log.md`, `project/workflow.md` (per [`references/bundle_workflow.md`](references/bundle_workflow.md)), and `project/decisions.md` from the templates.
3. Create `project/architecture.md`:
   - The repository has its own architecture or convention documents (`ARCHITECTURE.md`, `docs/architecture*`, decision records, contribution guides): they take precedence. Link them under `Sources` and fill only what they leave open.
   - Existing code, no documents: derive the structure, conventions, and commands from the code, and run each command before recording it.
   - Empty repository: record only what is known and leave `status: draft`; the first task's plan decides stack and structure as `Decisions` rows of scope `project`, and completes the document as a work item.
4. Gate G0 — one request covering: the bundle location (default `.agentic_coding/`; any other choice is recorded in `.sdd.json` per the contract's Configuration); whether to commit or gitignore `{bundle_dir}/`; the architecture document; and whether to add a pointer to the repository's agent-instruction file (`AGENTS.md` by default) reading: *"This repository records feature and task context in `{bundle_dir}/` (substitute the configured directory name). Before changing code, read `{bundle_dir}/index.md` and follow `{bundle}/project/workflow.md`."* Add the pointer only on approval. Everything created in 2–3 is a proposal until G0 is approved: if the human names another location, move the bundle there; if they decline the bundle, delete it and stop.
5. Record the decision in the bundle `log.md` (`**Creation**`, with the approving actor) and mark the approved documents `stable` with a `verified` entry.

### 2. Intake and intent (gate G1)
Read [`references/intake.md`](references/intake.md) first.
1. Classify the input and the task type; identify the feature, or propose a name for a new one.
2. Derive everything the request, the bundle, and the repository can answer, recording each source.
3. Check the size and propose a split if the intake guide's limits are exceeded.
4. Propose the track: `lite` only when the contract's lite conditions all hold; `express` only under the [Vibe-coding guardrail](#vibe-coding-guardrail); otherwise `full`.
5. Create `{task_dir}` with `status.md` (`next: Intent`) and a draft `intent.md`; update the indexes and add a `**Creation**` log entry.
6. Run the interview until no question is `open`: ask those that change scope or behaviour, and set the rest to `deferred` for the plan, as the intake guide says.
7. Run the contract's **Intent validation** and fix every failure.
8. Set `phase_intent: in_review` and send the gate request (on `lite` and `express`, continue to step 3 and send one request for G1 and G2). On approval: `phase_intent: approved`, `intent_revision` to the latest revision, `intent.md` to `stable` with `verified`, an `Approvals` row, `next: Plan`.

### 3. Plan and validation plan (gate G2)
1. **Existing work**: search the repository and the bundle for code to reuse, partial work, and similar features. For a `bugfix`, reproduce the defect and find the root cause with evidence before planning the fix; if it cannot be reproduced, raise an open question.
2. Write `plan.md` from the template, applying the [Engineering guardrails](#engineering-guardrails): `Module map` first, then interfaces, cross-cutting concerns, `Decisions`, `Work items`, and the `Conformance checklist` from `architecture.md` → `Conformance rules`, plus any rule a work item of this plan adds to that document (source `added by W{n}`). Settle every question the intent `deferred` in a `Decisions` row.
3. Write `validation.md` → `Validation plan`: at least one case per acceptance criterion, at the lowest level that proves it, automated wherever the stack has a test runner, using the commands in `architecture.md`.
4. Record the design-phase decision (contract → **Task types and tracks**).
5. If a requirement cannot be met within `architecture.md`, raise it as an open question for the human — adapt the requirement, or amend the architecture as a planned work item. Never deviate silently.
6. Run the contract's **Plan completeness** and fix every failure.
7. Set `phase_plan: in_review` and send the gate request for `plan.md` and the validation plan. Each requested change is a new revision; ask again. On approval: `phase_plan: approved`, `plan_revision` to the latest revision, `plan.md` to `stable` with `verified`, `phase_design` to `pending` or `skipped`, an `Approvals` row, `next: Design` or `Build`. On `lite` and `express` the same approval also completes step 2.8.

### 4. UX design (gate G3)
Only when `phase_design` is `pending`. Write `ux_design.md` from the template, covering every view and state the plan lists — following a profile skill for the user-interface stack when one is available. Set `phase_design: in_review` and send the gate request. Feedback within the intent and plan is a design revision; feedback that conflicts with them is a [revert](#revert). On approval: `phase_design: approved`, the document to `stable` with `verified`, an `Approvals` row, `next: Build`.

### 5. Build
1. Check the contract's **Hard gate**. Not met → go to the phase that is not approved; do not code.
2. Set `phase_build: in_progress`. On the first run add one `Progress` row per work item (`todo`) and record the `git` anchor.
3. For each work item, dependencies first: set its row to `doing` with yourself as owner; change only the files it lists, as the `Module map` assigns them; write its validation cases; run the lint, build, and test commands from `architecture.md` — a command that needs files a later work item creates is run on the files that exist, and in full by the work item that completes them; append a `Run log` row; then set the row to `done` with the run as evidence. A work item is done only when its cases exist and pass.
4. Commit only if the human or the repository's rules ask for it; then make one commit per work item with `{task_id} W{n}` in the message and record the commit as evidence.
5. A choice made while building that a maintainer would later ask "why?" about is appended to `plan.md` → `Decisions` (phase `build`). A choice that would change the `Module map`, an interface, the data model, or a dependency is not a decision row — it is a [revert](#revert).
   - *Decision row*: the return shape of a function whose name and parameters the plan lists; making one listed error type a subtype of another; the name of a private helper.
   - *Revert*: adding, removing, or renaming a file, a public symbol, a command, a message the user sees, or a stored field; importing what the `Module map` forbids; a new dependency.
   - When two sections of the plan contradict each other and one reading satisfies both without changing a listed row, take it and log a decision row naming both sections; otherwise revert.
6. **Follow-ups**: something you notice that the plan does not cover and that does not stop the work item — a gap in behaviour, a limitation, new scope — is a bullet in `status.md` → `Follow-ups`. Never build it unasked.
7. **Failures**: record any failure not fixed at the first attempt in `status.md` → `Blockers`. Fix the root cause; never delete or skip a test, weaken an assertion, disable a lint rule, or suppress a warning to get a pass. After three failed attempts at the same failure, or when it needs something only the human can provide, set it to `needs-human`, set `phase_build: blocked`, say what is needed, and end the turn. A failure caused by the plan is a [revert](#revert).
8. **Operations**: when a work item needs an operation, ask for it before performing it and record the decision (contract → **Approvals** → *Operations*). Rejected or unanswered, and the work item cannot be finished without it: record a blocker as in 7.
9. When every row is `done`: `phase_build: done`, `next: Validation`.

### 6. Validate (gate G4)
1. Set `phase_validation: in_progress`. Run every case of the validation plan against the current code — the whole plan, not only the last work item's cases — and record each run. Fill `Results` and tick every `Conformance checklist` item in `Conformance` with evidence.
2. A failing case is a `Defects` row: fix it under step 5 if the plan covers it and run the whole plan again; otherwise [revert](#revert).
3. Run the contract's **Validation completeness**. Set `validation.md` → `result: passed` and `phase_validation: in_review`.
4. Send the gate request with: counts of cases passed, failed, and not run; the commands to run the software and its tests; each `manual` case with its steps, for the human to perform and report — saying that an approval without a result accepts that case as `not run`; and any deviation, deferred defect, or follow-up.
5. Record each manual-case result the human reports as a `Run log` row with their actor, and update `Results`. Record every remark in `Acceptance` and classify it as the contract's **Acceptance remarks** define.
6. On approval: `phase_validation: accepted`, `validation.md` to `stable` with `verified`, an `Approvals` row, `next: Close`. A manual case the human gave no result for stays `not run`: say so in the `Approvals` note and add a `Follow-ups` bullet. A project document that one of this task's work items wrote or completed becomes `stable` with the same `verified` entry.

### 7. Close
1. Update the feature's `spec.md` as the contract's task-type table says (create it for a `create` task; `coverage: partial` for code that had no spec), linking each acceptance criterion to the case that proves it and adding this task to `Source tasks`. List every `Follow-ups` bullet that describes how the built feature behaves under `Known limitations`.
2. Promote decisions: scope `feature` → `spec.md` → `Decisions`; scope `project` → `project/decisions.md`. Each keeps a link to its row in the task plan.
3. In `status.md`: rewrite the `Handoff note` as Delivered / Verified / Follow-ups (every bullet of the `Follow-ups` section), set `next: done` and `claim: none`. Set a remaining `handoff.md` to `deprecated`.
4. Move the task to `Closed tasks` in the feature `index.md` (or mark it `closed` in the bundle index) and add a `**Completion**` log entry.
5. Run the contract's **Close checklist**, then give the human the links to `status.md`, `validation.md`, and `spec.md`, and three lines: what was built, the validation result, the follow-ups. Each follow-up is a candidate new task; never start one unasked.

### Handoff
Before ending any turn that changed a task — finished or not — run the contract's **Session end**: `Progress`, `git.head`, the `Handoff note`, `handoff.md` when the contract requires it, and the claim; then show the compact [progress view](#progress-view). Write `handoff.md` from facts you checked in this session and list the rest as assumed. When the human asks to hand a task to another agent or session, do the same and tell them the path of `status.md` — that file is all the receiver needs to start.

### Revert
Used whenever new input, review feedback, a failure, or an acceptance remark conflicts with an approved intent, plan, or design:
1. Record it and set the phases as the contract's **Revert** rule says.
2. Stop work toward the conflicting input and tell the human what conflicts with what.
3. As the planning role: turn each trigger into an `Open questions` entry, resolve every one with the human, then revise the document (new revision) and return through its gate.

## Engineering guardrails
Applied when planning (step 3) and checked when building and validating (steps 5–6). Each one is also a `Conformance checklist` row with source `skill guardrail`.

- **Modularity**: every source file has the single responsibility its `Module map` row names. User interface, domain logic, and data access or I/O live in separate modules. Modules use each other only through the public interface the map lists; dependencies point one way, with no cycles. A source file planned at, or grown beyond, 300 lines is split or justified in a `Decisions` row.
- **Injected dependencies**: a module receives what it depends on (parameters, constructors, or the stack's injection mechanism). A new singleton or global mutable state needs a `Decisions` row.
- **Minimal surface**: only what the `Module map` lists as public interface is exported or public.
- **Reuse**: use what exists before writing new code; plan an extraction as its own work item when the same logic exists elsewhere.
- **Decision logging**: every choice of technology, dependency, data model, interface, or structure has a `Decisions` row with its reason and a rejected alternative.
- **Security and privacy**: classify the data handled; validate external input at the boundary; no secrets or personal data in source, logs, fixtures, or artifacts; configuration comes from the environment, not from literals.
- **Errors**: no swallowed errors; every failure path named in the intent has handling and a validation case.
- **Logging**: use the repository's logging facility and levels; log nothing sensitive.
- **Third-party dependencies**: only when the standard library or the framework in use does not cover the need; actively maintained, a license compatible with the project, no known major vulnerability; approved at G2. An unplanned dependency is a revert.
- **Tests prove behaviour**: a `bugfix` reproduction case fails before the fix and passes after it; every case asserts an observable result of its acceptance criterion.

## Working with other skills
- **Stack or coding-guideline skills**: when one exists for the language or framework being built, apply its coding, testing, and tooling rules during steps 4–6. This skill's records, gates, and guardrails still apply.
- **Profiles** (contract → **Profiles**): a profile may add prerequisites, document sections, and a design and build process. When a profile's planning skill covers the task's domain (for example user-interface work), it runs steps 1–3 and its building skill runs steps 4–7, under this same contract. List the profile in `status.md` → `profiles`. Where a profile and the contract differ, the contract wins.
- **Application-level profiles**: a profile for a whole application runs before the first task and after the last — it owns the application's intent, backlog, and handover, and records a standing approval mode in its own project document. Each task it opens runs steps 2–7 here, with the sections and validation cases that profile adds.
- **No such skill**: build from the plan, the repository's conventions in `architecture.md`, and the guardrails above.
