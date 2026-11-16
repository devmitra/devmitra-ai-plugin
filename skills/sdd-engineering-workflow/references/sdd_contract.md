# SDD contract

Data model and rules of the `.agentic_coding/` knowledge bundle used by `sdd-engineering-workflow`. The artifacts, not the conversation, carry context between sessions, agents, and harnesses. A skill that extends this workflow (see [Profiles](#profiles)) ships a byte-identical copy of this file and of [`sdd_templates.md`](sdd_templates.md).

## Index
[Terms](#terms) · [Knowledge bundle (OKF)](#knowledge-bundle-okf) · [Layout](#layout) · [Discovery](#discovery) · [Ownership](#ownership) · [Phases and gates](#phases-and-gates) · [Approvals](#approvals) · [Task types and tracks](#task-types-and-tracks) · [Sources of truth](#sources-of-truth) · [Checks](#checks) · [Session continuity](#session-continuity) · [Security and privacy](#security-and-privacy) · [Rules](#rules) · [Profiles](#profiles) · [Earlier layout](#earlier-layout)

## Terms

- **`{root}`**: the directory that contains `.agentic_coding/`. **`{bundle}`** = `{root}/.agentic_coding`.
- **Feature**: an application-level capability or component with a living specification (`spec.md`). `{feature}` is its kebab-case directory name.
- **Task**: one reviewable unit of work with a `task_type`: `create` (new feature), `change` (modify a specified feature), `bugfix`, or `technical` (refactor, migration, upgrade, tooling, spike). `{task_id}` = `{yyyymmdd}-{task_type}-{slug}`; `{task_dir}` is its directory.
- **Work item**: one step of a task's plan.
- **Role**: *planning* (writes the intent, the plan, and the validation plan), *building* (writes code, progress, and validation results), *human* (answers questions, approves gates, owns the code). One agent may hold both agent roles, in different phases.
- **Actor**: `human:{id}` (`{id}` = git `user.name`, else `user`; never an email), or `{agent}/{version}` built from the agent and model or version names the harness states (e.g. `my-agent/1.4`); `agent/unknown` when it states none. Never invent one.
- **Timestamp**: ISO 8601 UTC read from the system clock (e.g. `date -u +%Y-%m-%dT%H:%M:%SZ`); never estimated. A date — in a `{task_id}`, a `log.md` heading, or a decision row — is the UTC date of the same clock.
- **IDs**: `R` requirement, `AC` acceptance criterion, `Q` open question, `D` decision, `W` work item, `V` validation case, `RUN` validation run, `DEF` defect, `B` blocker, `C` conformance rule — each followed by a number. `R` and `AC` are scoped to the feature and continue across its tasks; all others are scoped to their document. An ID is never renumbered or reused; a dropped item keeps its row, marked `removed`.

## Knowledge bundle (OKF)

`{bundle}` is a knowledge bundle in [Open Knowledge Format (OKF) v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md).

- **Concept documents** (every `.md` except `index.md` and `log.md`) start with YAML frontmatter: `type` (required, from the table below), `title`, `description` (one sentence), `status: draft | stable | deprecated`, and `generated: { by: <actor>, at: <timestamp> }`, where `at` is the last meaningful content change. Extra keys are allowed (e.g. the phase fields of `status.md`).
- **Approval**: an approved document gets `status: stable` and a `verified` entry `{ by: <actor>, at: <timestamp> }`. `verified.by` is `human:{id}` only when the human approved it; an auto-approved document is verified by the agent actor. A project document that a task's work item writes or completes stays `draft` until that task is accepted, and is verified with its G4 decision. A superseded document is never deleted; set `status: deprecated`.
- **`index.md`** (reserved, no frontmatter except `okf_version: "0.2"` in the bundle root): `# Heading` sections of `* [Title](path) - description` entries, where the description is the linked document's frontmatter `description`.
- **`log.md`** (reserved, no frontmatter): newest-first `## YYYY-MM-DD` sections of `* **Creation|Update|Revert|Handoff|Completion**: <prose with links>` entries.
- **Links** are relative Markdown paths, so they stay clickable in editors and on Git hosts.

| Document | `type` |
|---|---|
| `project/workflow.md` | `Playbook` |
| `project/architecture.md` | `Architecture` |
| `project/decisions.md` | `Decision Log` |
| `features/{feature}/spec.md` | `Feature Spec` |
| `features/{feature}/ux_design.md` | `Feature UX Design` |
| task `status.md` | `Task Status` |
| task `intent.md` / `plan.md` / `validation.md` | `Task Intent` / `Task Plan` / `Task Validation` |
| task `ux_design.md` / `handoff.md` | `Task UX Design` / `Task Handoff` |

Templates for every document: [`sdd_templates.md`](sdd_templates.md).

## Layout

```
{root}/.agentic_coding/                 # {bundle}
  index.md                              # project documents, features, project-level tasks
  log.md                                # bundle created, features added, project documents changed
  project/
    workflow.md                         # how any agent or person reads and updates this bundle
    architecture.md                     # structure, conventions, commands, conformance rules
    decisions.md                        # project-wide decisions and their reasons
  features/
    {feature}/
      index.md                          # spec, open tasks, closed tasks
      log.md                            # tasks opened, reverted, handed off, completed
      spec.md                           # living as-built specification
      ux_design.md                      # optional: as-built UX design
      tasks/
        {task_id}/                      # {task_dir}
          status.md                     # phase state, approvals, progress, blockers, handoff note
          intent.md                     # what and why (a delta for change / bugfix)
          plan.md                       # how: module map, decisions, work items
          validation.md                 # validation plan, runs, results, acceptance
          ux_design.md                  # optional: required when phase_design is not skipped
          handoff.md                    # optional: see Session continuity
  tasks/
    {task_id}/                          # same files; a task that no single feature owns
```

- **Where a task lives**: under the feature it changes. A task touching several features lives under the primary one and lists the others in `also_touches`; their `index.md` files link to it. Only a task that no feature owns (most `technical` tasks) lives in `{bundle}/tasks/`. Identify the owner before creating the directory; a task directory never moves.
- A new feature is created by its first task (`create`).
- `project`, `features`, and `tasks` are reserved names at the bundle root.
- `{bundle}` is committed by default. Whether to gitignore it is asked once per `{root}` (gate G0) and recorded in the bundle `log.md`.

## Discovery

Every session starts here, before reading anything else.

1. **Find the bundle**: starting at the working directory (or the directory of the file being worked on), walk up through its ancestors to the repository root (the nearest ancestor holding `.git`); with no repository, check the working directory only. The first directory holding `.agentic_coding/index.md` is `{root}`.
   - Several bundles on that path (nested workspaces): the nearest is the working bundle and the only one written to; the `project/` documents of the outer ones are read as inherited constraints.
   - None found: there is no bundle yet (the skill's bootstrap step creates one, with approval).
2. Read `{bundle}/index.md` → project documents, features, project-level tasks.
3. Read the feature's `index.md` → `spec.md`, open tasks, closed tasks.
4. For a task, read in this order and stop as soon as the current step is covered: `status.md` (frontmatter and `Handoff note`) → `handoff.md` if it exists → `intent.md` → `plan.md` → `validation.md`.
5. To answer *why something is built the way it is*: the feature's `spec.md` → `Decisions` → the linked task plan; for project-wide choices, `project/decisions.md`.

If an index is missing or does not list an existing document, fix the index before continuing. Whoever creates, closes, or deprecates a document updates the matching `index.md` and `log.md` in the same step.

## Ownership

| Artifact | Written by | When |
|---|---|---|
| `index.md`, `log.md` (all levels) | the role that changes a listed document | same step |
| `project/workflow.md` | planning (copied unchanged from the skill) | bootstrap |
| `project/architecture.md` | planning | bootstrap; later only with the human's approval — as a profile prerequisite, or as a planned work item of an approved task |
| `project/decisions.md` | planning creates it; building adds rows | bootstrap; task close (decisions with scope `project`) |
| `intent.md` | planning only | Intent phase; later only through a revert |
| `plan.md` | planning only — except `Decisions`, to which the building role appends rows | Plan phase; later only through a revert |
| `validation.md` → `Validation plan` | planning only | Plan phase |
| `validation.md` → all other sections | building; append-only | Build and Validation phases |
| `ux_design.md` | the role the plan names | Design phase |
| `status.md` | planning creates it and owns `task_type`, `track`, `feature`, the revision fields, `phase_intent`, `phase_plan`; building owns the rest, and may set `phase_intent` / `phase_plan` to `reverted` only | every phase |
| `handoff.md` | the role ending the session | session end |
| `spec.md`, feature `ux_design.md` | building | task close only |
| product source and tests | building | Build phase |

## Phases and gates

`status.md` frontmatter is the single record of phase state.

| Phase | Field and states | Gate | Loop |
|---|---|---|---|
| Bootstrap (once per `{root}`) | — | **G0**: bundle location, commit or gitignore, `architecture.md`, agent-instruction pointer | recorded in the bundle `log.md` |
| Intent | `phase_intent: pending → in_review → approved` | **G1**: feature, task type, track, `intent.md` | Rejected → `pending`, new intent revision. `reverted` when later input conflicts with it. |
| Plan | `phase_plan: pending → in_review → approved` | **G2**: `plan.md`, the validation plan, the design-phase decision, every new third-party dependency | Rejected → `pending`, new plan revision. `reverted` when later input conflicts with it. |
| UX design | `phase_design: skipped`, or `pending → in_review → approved` | **G3**: `ux_design.md` | Feedback within the intent and plan → `pending`. Conflicting feedback → revert. |
| Build | `phase_build: pending → in_progress → done` | — | `blocked` while a blocker needs the human. |
| Validation | `phase_validation: pending → in_progress → in_review → accepted` | **G4**: acceptance of the validation results | See *Acceptance remarks* below. |
| Close | `next: done` | — | The task is then read-only. |

- `next: Intent | Plan | Design | Build | Validation | Close | done` always names the step to resume.
- **Revert**: add a `Reverts` row in `status.md` (trigger, and the document › section it conflicts with), set the owning phase to `reverted` (a reverted intent also reverts the plan; a reverted plan also sets an active `phase_design` to `reverted`), set `next` to that phase, add a `**Revert**` entry to the owner's `log.md`, and stop work toward the conflicting input. The planning role turns each trigger into an `Open questions` entry and resolves all of them with the human before editing the document.
- **Re-approval after a revert**: set `phase_design` to `pending` or `skipped` per the plan and `phase_build` to `pending`. A `Progress` row stays `done` only if its work item is unchanged in the new plan revision.
- **Acceptance remarks** (G4) are classified one by one: *defect within the plan* → `phase_build: in_progress`, fix, validate again; *conflicts with the intent, plan, or design* → revert; *new scope* → a new task, recorded in `status.md` → `Follow-ups`, never added to this one.

## Approvals

`status.md` → `Approvals` is the single record of gate decisions (G0, which precedes any task, is recorded in the bundle `log.md` instead): one row per decision — gate, artifact and revision, decision (`pending | approved | rejected | auto-approved | reverted`), by (actor), at, notes.

- **Explicit only**: an approval is the human's explicit statement about that gate. Silence, a change of subject, or an answer to a different question is not approval. A general go-ahead ("looks good, continue") given in reply to a gate request approves that gate only — never a later gate — and is not auto-approve. Quote the human's words in the row's notes.
- **Batching**: G0 may be batched with G1. On the `lite` and `express` tracks G1 and G2 are one review. No other gates are batched.
- **Non-interactive session** (the human cannot be asked): add a row with decision `pending`, set the phase to `in_review`, write the `Handoff note`, and end the turn. Never assume an answer.
- **Auto-approve** — only when the human explicitly says to proceed without asking (for one gate or for all): decision `auto-approved`, by the agent actor, notes quoting the instruction; every choice the human would have made is logged in `status.md` → `Assumptions`, and the phase field is set to `approved`. The documents are still written in full: **a gate can be waived, a record cannot**. Auto-approve covers G4 only when the instruction names acceptance explicitly and no `manual` validation case lacks a result.

## Task types and tracks

| Type | Intent | Plan | Validation | At close |
|---|---|---|---|---|
| `create` | full requirements and acceptance criteria | full | at least one case per acceptance criterion | create `spec.md` |
| `change` | delta against `spec.md`: added, modified, removed | impact on the existing module map | cases for changed criteria, plus regression cases for criteria of touched modules | merge the delta into `spec.md` |
| `bugfix` | observed, expected, reproduction | root cause with evidence, then the fix | a reproduction case that fails before the fix and passes after it, plus regression cases | update `spec.md` only if it described the wrong behaviour or was silent — then add the missing requirement and criterion |
| `technical` | motivation, target state, invariants | steps, risks, rollback | at least one case per invariant | update `architecture.md` and the module maps of affected specs, as planned |

A `technical` spike produces a decision, not product code: its result is a `Decisions` row and its code is discarded unless a later task plans it.

| Track | When | Gates | Documents |
|---|---|---|---|
| `full` | default | G1, G2, G3 (if design is required), G4 — each on its own | every section |
| `lite` | all lite conditions hold; proposed by the agent, approved at G1 | G1 and G2 in one review; G4 | sections marked **(full)** may be omitted |
| `express` | only on the human's explicit request for speed (the planning skill's *Vibe-coding guardrail*) | G1 and G2 in one review; unanswered questions take recorded defaults; G4 | as `lite`, but `Module map`, `Decisions`, and `Work items` are always complete |

**Lite conditions** — all must hold: one feature or none; at most 3 source files changed; no new module, public interface, data model, dependency, or UX change. A lite or express task that turns out to need more reverts to the Plan phase with `track: full`.

**Design-phase decision**: the plan records `required` (any new or changed visual interface: a screen, view, page, or its layout) or `skipped`, with a reason; the human approves it at G2. A text or programmatic interface — a command line, an API, a file format — needs no design phase: it is specified in `plan.md` → `Interfaces and data`. No later phase re-decides it.

## Sources of truth

- **Project-wide**: the repository's own architecture and convention documents, then `project/architecture.md`, then `project/decisions.md`.
- **Within a task**: approved `intent.md` > approved `plan.md` (current revision) > approved `ux_design.md` > code.
- **Over time**: `spec.md` states what is built. When code and `spec.md` disagree, neither wins silently — ask the human which is right and open a `bugfix` (the code is wrong) or a `change` (the spec is outdated).
- Input in a later phase that conflicts with an approved document is never applied silently: revert to the phase that owns that document.

## Checks

**Intent validation** (before G1; repeated by the building role at its session start):
1. Frontmatter is valid; every section required for the task type is filled; optional sections hold content or `n/a`.
2. Every requirement and constraint names its source (`user`, `repo:<path>`, `spec`, or `derived`).
3. Every `must` requirement has at least one acceptance criterion; every criterion names the requirement it covers and states an observable result.
4. For `create` and `change`, requirements say what and why, not how: a technology, file, or type name appears only as a stated constraint with its source.
5. No `Open questions` entry is `open`. A question that changes neither scope nor behaviour may be `deferred` to the plan, with its reason. On `express` or under auto-approve, a question the human left unanswered is `defaulted`, with its default in `status.md` → `Assumptions`.
6. Nothing contradicts `spec.md` or `architecture.md` except what the delta lists as modified or removed.
7. No secrets, personal data, or invented external references.

**Plan completeness** (before G2):
1. The intent passes validation and `phase_intent` is `approved` for its latest revision (or is in the same review).
2. Every section required for the track is filled; no `Open questions` entry is `open`; every question the intent `deferred` is settled by a `Decisions` row.
3. `Module map`: every file to create or change has exactly one row with exactly one responsibility; no row breaks a dependency rule of `architecture.md`.
4. Every choice of technology, dependency, data model, interface, or structure has a `Decisions` row with its reason and at least one rejected alternative (or `none considered: {why}`).
5. Every acceptance criterion is covered by at least one work item and one validation case; every work item names its files and covers a criterion or is marked `enabling`.
6. Every validation case has a level, steps or a command, and an expected result; a `bugfix` has its reproduction case; a `technical` task has a case per invariant.
7. `Conformance checklist` lists every applicable conformance rule.
8. `plan.md` → `intent_revision` equals the intent's latest revision. (`status.md` → `plan_revision` is set at approval and checked by the hard gate.)
9. The sections agree with each other: every file, module, and public symbol named in `Interfaces and data`, `Cross-cutting`, and `Work items` has a `Module map` row, and nothing they describe needs a dependency that row's `Must not depend on` forbids.

**Validation completeness** (before G4):
1. Every validation case has a result from a recorded run made after the last code change.
2. No case is `fail`; `not run` is allowed only for `manual` cases handed to the human in the G4 request.
3. Every acceptance criterion in `Results` is `pass`, or `pending human` when only manual cases handed to the human cover it.
4. Every `Conformance` row is `pass`; no defect and no blocker is `open`.

**Close checklist**: the G4 decision is `approved` or `auto-approved`; `spec.md` is updated per the task-type table; decisions are promoted; `handoff.md` is absent or `deprecated`; every `Follow-ups` bullet is in the closing `Handoff note`; `index.md` and `log.md` are current; `status.md` has `next: done` and `claim: none`.

## Session continuity

- **Claim**: every write to `status.md` sets `generated` and `claim` to the writer and the current time. `claim: none` means the task is free to pick up.
- **Git anchor** (only when a git repository tracks the task's product files — not when there is no repository, or when it ignores `{root}`): `status.md` → `git` holds the task's `branch`, the `base` commit it started from, and `head`, the commit current at the last session end.
- **Session end** — before ending any turn that changed the task: bring `Progress` up to date, set `git.head`, rewrite the `Handoff note` (at most 10 lines: done, next action, watch out), write `handoff.md` when required, and set `claim: none` if this session will do no more work on the task.
- **`handoff.md` is required** when the session stops with `phase_build: in_progress | blocked` or `phase_validation: in_progress` and at least one holds: uncommitted or half-finished edits exist; an approach was tried and abandoned; the next agent needs environment setup the documents do not describe; a question for the human is pending outside `Open questions`. It is overwritten at each handoff (one `**Handoff**` entry in the owner's `log.md` per handoff), states which of its claims were verified and which are assumed, and is set to `status: deprecated` once its next actions are done or superseded.
- **Resume check** — at session start on an existing task, before any other work:
  1. **Claim**: if `claim.by` is another actor, tell the human who last held the task and when, and ask before continuing.
  2. **Revisions**: `intent_revision` and `plan_revision` equal the documents' latest revisions and both phases are `approved`; otherwise resume at the phase that is not.
  3. **Repository** (only with a git anchor): compare the current branch with `git.branch`, and list commits and uncommitted changes since `git.head` that touch files of the plan. Changes the `Handoff note` or `handoff.md` explains are expected. Report unexplained ones to the human and ask how to treat them; never overwrite or discard them unasked.
  4. **Handoff**: spot-check what `handoff.md` lists as verified (files exist, commands run); treat what it lists as assumed as unverified.
  5. **Progress**: re-check every `done` row whose work item changed in a newer plan revision.
  6. Take the claim and resume at `next`.
- **Parallel work**: an agent takes only `Progress` rows that have no owner, or its own. Two agents never work on work items whose `Files` overlap.

## Security and privacy

- Artifacts are committed: never write secrets, credentials, tokens, personal data, or real user content into them. Use marked placeholders (`{API_BASE_URL}`, `<redacted>`).
- Redact secrets and personal data from command output before recording it.
- Never invent URLs, IDs, endpoints, ticket numbers, or package names; ask, or use marked placeholders.

## Rules

- **Hard gate**: product code is written only for a task whose `phase_intent` and `phase_plan` are `approved` for the latest revisions and whose `phase_design` is `approved` or `skipped`. Investigation during the Intent and Plan phases may read and run code and may add a reproduction test or script; it changes no product code.
- **Document edits**: `intent.md` and `plan.md` are at revision 1 until their first gate request is sent; edits before that raise nothing. From then on, every edit adds a row to that document's revision table and raises its revision; an edit after approval sets its phase to `in_review` until the new revision is approved. Appending a `Decisions` row during Build raises no revision.
- **Append-only evidence**: rows of `Run log`, `Defects`, and `Acceptance` in `validation.md` are added, never edited or deleted, except to set a defect's status and resolution.
- **`spec.md`** changes only when a task closes. A closed task directory is never edited again; a new request is a new task.
- **Open tasks per feature**: before opening a task on a feature that has an open one, tell the human and ask whether to continue the open one or to open a second; a second is allowed only when the planned files of the two do not overlap.
- **Scope**: an edit that changes no behaviour (typo, comment, formatting) needs no task. Everything else does.

## Profiles

A profile is a set of skills that specialises this workflow for a domain or stack: usually one skill holding the planning role and one or more holding the building role. A profile may:
- add approvals of its own — prerequisites before G2, or steps of the build — each with its own gate ID and `Approvals` row;
- add frontmatter keys to `status.md`, and sections after the core sections of any task document and of `spec.md`;
- define how the UX design phase and the build are carried out, and add guardrails and checks to them;
- add project documents under `project/`, and directories for its own files under `project/` and `features/{feature}/`.

A profile may not rename or remove a core artifact, section, field, ID, or gate; skip or reorder a gate; or let a role write a document it does not own. A task that uses profiles lists them in `status.md` → `profiles`. Where a profile and this contract differ, the contract wins.

## Earlier layout

Bundles written before `project/`, `features/`, and `tasks/` existed use other names. Read them as below; write only the current names.

| Earlier | Current |
|---|---|
| `design_and_architecture_patterns.md` | `project/architecture.md` |
| `{feature_name}/` at the bundle root | `features/{feature}/` |
| `{feature_name}_intent.md` / `{feature_name}_design.md` | `spec.md` / feature `ux_design.md` |
| `changes/{yyyymmdd}-{type}-{slug}/`, type `feature` | `tasks/{task_id}/`, type `create` |
| change `design.md` | task `ux_design.md` |
| change `report.md` | `validation.md` (results, acceptance) and the closing `Handoff note` |
| `phase_dev` | `phase_build` and `phase_validation` |
| `type: Change …` / `Component …` | `Task …` / `Feature …` |

Migrate a feature to the current layout only as a planned work item of a task the human approved, by moving its directory; the content of closed task documents is never rewritten.
