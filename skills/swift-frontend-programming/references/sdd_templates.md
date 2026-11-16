# SDD templates

Templates for the documents defined in [`sdd_contract.md`](sdd_contract.md). A skill that extends the workflow ships a byte-identical copy of this file. Replace `{placeholders}`; keep headings and their order; delete the `{guidance}` lines. Section markers: **(required)**; **(full)** = required on the `full` track, optional on `lite` and `express`; **(type: x)** = only for that task type; **(optional)** = write `n/a` when it does not apply.

## Index
[Bundle index](#bundle-indexmd) · [Feature index](#feature-indexmd) · [log.md](#logmd) · [architecture.md](#projectarchitecturemd) · [decisions.md](#projectdecisionsmd) · [status.md](#statusmd) · [intent.md](#intentmd) · [plan.md](#planmd) · [validation.md](#validationmd) · [ux_design.md](#ux_designmd) · [handoff.md](#handoffmd) · [spec.md](#specmd)

## Bundle `index.md`

```markdown
---
okf_version: "0.2"
---
# Project
* [Workflow](project/workflow.md) - Rules any agent or person follows to read, resume, and update this bundle.
* [Architecture](project/architecture.md) - {description}
* [Decisions](project/decisions.md) - Project-wide decisions and their reasons.
* [History](log.md) - Bundle and project-document changes, features added.

# Features
* [{feature}](features/{feature}/index.md) - {one-line purpose}

# Tasks
* [{task_id}](tasks/{task_id}/status.md) - {open | closed}: {description}
```

`# Tasks` lists only tasks in `{bundle}/tasks/`.

## Feature `index.md`

```markdown
# Spec
* [Spec](spec.md) - {description}
* [UX design](ux_design.md) - {description}
* [History](log.md) - Tasks opened, reverted, handed off, and completed.

# Open tasks
* [{task_id}](tasks/{task_id}/status.md) - {description}

# Closed tasks
* [{task_id}](tasks/{task_id}/status.md) - {description}
```

Omit a `# Spec` entry until the document exists. A task of another feature that lists this one in `also_touches` is linked here too, with its relative path.

## `log.md`

```markdown
# {Feature name or "Project"} log

## {yyyy-mm-dd}
* **Completion**: [{task_id}](tasks/{task_id}/status.md) closed; spec updated.
* **Handoff**: [{task_id}](tasks/{task_id}/handoff.md) handed off by {actor} at {next}.
* **Revert**: [{task_id}](tasks/{task_id}/status.md) {from phase} → {to phase}: {trigger}.
* **Creation**: Opened [{task_id}](tasks/{task_id}/status.md) ({task_type}, {track}).
```

## `project/architecture.md`

Repository documents take precedence: link them under `Sources` and fill only what they leave open.

```markdown
---
type: Architecture
title: "{project_name} architecture"
description: {One sentence: the system and the pattern it follows.}
status: draft
generated: { by: {actor}, at: {timestamp} }
---
# {project_name} — architecture

## Sources
{Repository documents that take precedence (path - what it governs), or `none`.}

## Overview
{What the system is, its stack and runtime, in three sentences or fewer.}

## Structure
| Module / layer | Responsibility | May depend on | Must not depend on |
|---|---|---|---|

## Conventions
{Naming, error handling, logging, configuration, testing — or links to the repository documents that define them.}

## Commands
| Purpose | Command | Notes |
|---|---|---|
{Install, build, run, lint, test. Verified by running them; mark any that was not run.}

## Conformance rules
| ID | Rule |
|---|---|
| C1 | {A checkable rule, e.g. "No module imports from a layer above it."} |
```

## `project/decisions.md`

```markdown
---
type: Decision Log
title: "{project_name} decisions"
description: Project-wide decisions and their reasons, newest first.
status: stable
generated: { by: {actor}, at: {timestamp} }
---
# {project_name} — decisions

| ID | Date | Decision | Reason | Rejected alternatives | Source |
|---|---|---|---|---|---|
| PD1 | {yyyy-mm-dd} | {what was decided} | {why} | {what else was considered, and why not} | [{task_id} D{n}]({relative path to plan.md}) |
{A superseded row is kept and marked `superseded by PD{n}`.}
```

## `status.md`

```markdown
---
type: Task Status
title: "{task_id}"
description: {One sentence: what this task delivers.}
generated: { by: {actor}, at: {timestamp} }
task_type: {create | change | bugfix | technical}
track: {full | lite | express}
feature: {feature | none}
also_touches: []
profiles: []
root: {path of {root} relative to the repository root, "." when equal}
phase_intent: pending      # pending | in_review | approved | reverted
phase_plan: pending        # pending | in_review | approved | reverted
phase_design: skipped      # skipped | pending | in_review | approved | reverted
phase_build: pending       # pending | in_progress | blocked | done
phase_validation: pending  # pending | in_progress | in_review | accepted
next: Intent               # Intent | Plan | Design | Build | Validation | Close | done
intent_revision: 0         # revision the current intent approval applies to
plan_revision: 0           # revision the current plan approval applies to
open_questions: 0          # count of `open` questions in intent.md and plan.md
claim: { by: {actor}, at: {timestamp} }                       # or: none
git: { branch: {branch}, base: {commit}, head: {commit} }     # omit when no git repository tracks the product files
---
# {task_id} — status

[Intent](intent.md) · [Plan](plan.md) · [Validation](validation.md) · [UX design](ux_design.md) · [Handoff](handoff.md)
{Keep only the links to documents that exist.}

## Handoff note
- **Done**: {what is finished, in one or two lines}
- **Next action**: {one concrete action: a work item, a command, or a question to ask}
- **Watch out**: {pitfalls the next session must know, or `none`}
{At most 10 lines; rewritten at every session end. At close: Delivered / Verified / Follow-ups.}

## Approvals
| Gate | Artifact (revision) | Decision | By | At | Notes |
|---|---|---|---|---|---|
{Gate: G1–G4, a profile's gate, or `OP` (an operation: write the exact action and its target in the artifact column). Decision: pending | approved | rejected | auto-approved | reverted. An `OP` row is never `auto-approved`.}

## Progress
| Work item | Plan rev | State | Owner | Files | Evidence |
|---|---|---|---|---|---|
{State: todo | doing | done | blocked. One row per plan work item, in plan order. Evidence: run ID and, when committed, the commit.}

## Blockers
| ID | At | Step | Problem (redacted excerpt) | Attempts | Status | Next action |
|---|---|---|---|---|---|---|
{Status: open | resolved | needs-human.}

## Reverts
| At | From phase | Trigger | Conflicts with (document › section) |
|---|---|---|---|

## Assumptions
{One bullet per auto-approved gate, defaulted question, or unexplained repository change the human told you to adopt; `none` otherwise.}

## Follow-ups
{One bullet per gap, limitation, or new scope noticed while building, validating, or at acceptance that this task does not cover; `none` otherwise. Each is a candidate new task, never built unasked.}
```

## `intent.md`

What and why. For a `change` or `bugfix`, write only what is added or altered.

```markdown
---
type: Task Intent
title: "{task_id} intent"
description: {One sentence: what changes and why.}
status: draft
revision: 1
generated: { by: {actor}, at: {timestamp} }
---
# {Feature or task title} — intent ({task_type})

## Revisions
| Rev | At | By | Sections | Change | Trigger |
|---|---|---|---|---|---|
| 1 | {timestamp} | {actor} | all | Initial intent | {user request} |
{Trigger: user request | review feedback | open question Qn | revert (status.md → Reverts).}

## Open questions
| ID | Question | Options (recommended first) | State | Answer → sections updated |
|---|---|---|---|---|
{State: open | answered | defaulted | deferred. The intent cannot be approved while any question is open. `deferred`: changes neither scope nor behaviour and is left to the plan, with the reason.}

## 1. Summary (required)
- **Purpose**: {the problem this solves, or the outcome wanted}
- **Input**: {feature details | user story | technical task | bug | change request} — {where it came from: the user's message, a file path, or a ticket ID the user gave}
- **Task type / track**: {task_type} / {track} — {why this track}
- **Feature**: {feature} — {existing | new, name approved on {date}} · also touches: {list | none}
- **Users and context**: {who uses it and when, or `n/a`}

## 2. Specification (required)
{Fill the block for the task type and delete the other three. Each line ends with `Source: user | repo:<path> | spec | derived`.}

### Requirements (type: create)
- **R1** (must): {When {trigger}, the {system} shall {response}.} Source: {source}
{Priority: must | should.}

### Delta (type: change)
- **Added**: **R{n}** (must): {statement} Source: {source}
- **Modified**: **R{n}**: {new statement} — was: {old statement} Source: {source}
- **Removed**: **R{n}**: {reason} Source: {source}
- **Unchanged**: {everything else in [spec.md]({path})}

### Defect (type: bugfix)
- **Observed**: {what happens}
- **Expected**: {what should happen} — {R{n} / AC{n} of spec.md that it violates, or `unspecified`}
- **Reproduction**: {numbered steps, input data, environment}
- **Impact**: {who is affected and how often}

### Target state (type: technical)
- **Motivation**: {why now}
- **Target state**: {what is true when it is done}
- **Invariants**: **R{n}** (must): {behaviour that must not change} Source: {source}

## 3. Acceptance criteria (required)
1. **AC1** (R1): Given {precondition}, when {action}, then {observable result}.

## 4. Constraints (required)
- **Platforms and compatibility**: {targets, versions, backward compatibility — or `n/a`}
- **Security and privacy**: {data handled, permissions needed — or `none`}
- **Performance and scale**: {limits or targets — or `n/a`}
- **Integration**: {systems, data, and interfaces it must work with — or `none`}

## 5. Out of scope (required)
{What this task deliberately does not do, or `none identified`.}
```

## `plan.md`

How. After the first gate request, every edit except an appended `Decisions` row adds a `Change tracker` row and raises the revision.

```markdown
---
type: Task Plan
title: "{task_id} plan"
description: {One sentence: what will be built and how it is proven.}
status: draft
revision: 1
intent_revision: {n}
generated: { by: {actor}, at: {timestamp} }
---
# {Feature or task title} — plan ({task_type}, {track})

## Change tracker
| Rev | At | By | Sections | Change | Trigger |
|---|---|---|---|---|---|
| 1 | {timestamp} | {actor} | all | Initial plan | {user request} |

## Open questions
| ID | Question | Options (recommended first) | State | Answer → sections updated |
|---|---|---|---|---|
{State: open | answered | defaulted. The plan cannot be approved while any question is open.}

## 1. Scope (required)
- **References**: [intent](intent.md) · [validation](validation.md) · [spec]({path}) · [architecture]({path})
- **Design phase**: {required | skipped} — {reason}
- **Profiles**: {list | none}

## 2. Existing work (required)
{What already exists: code to reuse or extend, partial work, similar features. `bugfix`: the root cause with evidence (file › symbol, failing reproduction). Code without a spec: the current behaviour of the touched area only.}

## 3. Approach (full)
{The solution in a few sentences: what is added, what is changed, what stays.}

## 4. Module map (required)
| File | Module / layer | Single responsibility | Public interface | May depend on | Must not depend on |
|---|---|---|---|---|---|
{One row per file to create or change. A file with two responsibilities is two files.}

## 5. Interfaces and data (full)
{Public APIs, commands, events, and data models this task adds or changes, with their inputs, outputs, and errors.}

## 6. Cross-cutting (required)
- **Error handling**: {how failures are detected, reported, and recovered}
- **Logging**: {what is logged at which level; nothing sensitive}
- **Security and privacy**: {data classification, storage, transport, permissions}
- **Performance**: {where it matters and the approach, or `n/a`}
- **Third-party dependencies**: {`none`, or name, version, license, vulnerability check — approved at G2}

## 7. Decisions (required)
| ID | Phase | Decision | Reason | Rejected alternatives | Scope |
|---|---|---|---|---|---|
{Phase: plan | build. Scope: task | feature | project. The building role appends rows; it never edits one.}

## 8. Work items (required)
| ID | Task | Files | Depends on | Covers |
|---|---|---|---|---|
{Remaining work only, each small enough to build and check on its own. Covers: AC / R IDs, or `enabling`. Work items with no dependency between them and no shared file may run in parallel.}

## 9. Risks and rollback (full)
{What could go wrong, how it would be noticed, and how to undo the change.}

## 10. Conformance checklist (required)
| ID | Rule | Source |
|---|---|---|
{Source: architecture conformance rule C{n} | added by W{n} (a rule a work item of this plan adds to `architecture.md`) | skill guardrail.}
```

## `validation.md`

`Validation plan` is written and approved with the plan; every other section is filled during Build and Validation and is append-only.

```markdown
---
type: Task Validation
title: "{task_id} validation"
description: {One sentence: how the task is proven and the current result.}
status: draft
plan_revision: {n}
result: pending            # pending | passed | failed
generated: { by: {actor}, at: {timestamp} }
---
# {Feature or task title} — validation

## 1. Validation plan
- **Environment**: {runtime, tools, and versions needed; setup steps}
- **Commands**: {how to run the automated cases}

| ID | Level | Subject | Steps or command | Expected result | Covers |
|---|---|---|---|---|---|
{Level: static | unit | integration | e2e | manual. `bugfix`: the first case is the reproduction, expected to fail before the fix.}

## 2. Run log
| Run | At | By | Commit | Command (summary) | Passed | Failed | Skipped | Notes |
|---|---|---|---|---|---|---|---|---|
{Commit: the commit, plus `+dirty` when uncommitted changes were present; `n/a` when the task has no git anchor.}

## 3. Results
| AC | Cases | Result | Evidence (run › case) |
|---|---|---|---|
{One row per acceptance criterion, from the latest run. Result: `fail` — a case failed; `pass` — at least one case ran and every case that ran passed (name a manual case still waiting in the evidence cell: `V{n} pending human`); `pending human` — only manual cases cover it and none has a result; `not run` — no case ran.}

## 4. Conformance
| ID | Result | Evidence (file › symbol) |
|---|---|---|

## 5. Defects
| ID | At | Case | Description | Status | Resolution |
|---|---|---|---|---|---|
{Status: open | fixed | deferred (with the human's approval, listed as a follow-up).}

## 6. Acceptance
| Round | At | Shown how | Remark | Classification | Action |
|---|---|---|---|---|---|
{Classification: accepted | defect within plan | conflicts with intent/plan/design | new scope.}
```

## `ux_design.md`

Only when the plan's design phase is `required`. A profile for the user-interface stack may add sections after these.

```markdown
---
type: Task UX Design
title: "{task_id} UX design"
description: {One sentence: what the design covers.}
status: draft
revision: 1
plan_revision: {n}
generated: { by: {actor}, at: {timestamp} }
---
# {Feature or task title} — UX design

## Revisions
| Rev | At | Change | Trigger |
|---|---|---|---|

## Views and layout
{Each view or screen, its structure, and its behaviour across sizes.}

## States
| View | State | What the user sees | Trigger |
|---|---|---|---|
{Include loading, empty, error, and disabled where they apply.}

## Interactions
{Per element: the action and its response; navigation; motion.}

## Accessibility
{Labels, focus and reading order, text scaling, contrast, targets, reduced motion.}

## Prototype (optional)
{Link to a mock-up or clickable prototype, or `n/a`.}

## Review log
| Round | At | Feedback | Classification | Action |
|---|---|---|---|---|
{Classification: design revision | conflicts with intent/plan (→ revert).}
```

## `handoff.md`

Written when the contract's *Session continuity* requires it; overwritten at each handoff.

```markdown
---
type: Task Handoff
title: "{task_id} handoff"
description: {One sentence: where the task stands and what comes next.}
status: stable
generated: { by: {actor}, at: {timestamp} }
to: {any | role or agent the human named}
---
# {task_id} — handoff

## State
- **Phase / next**: {phase state} / {next}
- **Work items**: done {IDs}; in progress {IDs}; not started {IDs}
- **Repository**: branch {branch}, commit {commit}; uncommitted: {files, or `none`}

## In-flight work
{What is half-finished, in which file and function, and what remains.}

## Tried and abandoned
| Approach | Why it was dropped | Evidence |
|---|---|---|

## Next actions
1. {Concrete, ordered actions: file, command, or question.}

## Environment
{Setup the documents do not describe: tools, versions, services, environment variable names. No secret values.}

## Confidence
- **Verified**: {claims checked in this session, and how}
- **Assumed**: {claims not checked}
```

## `spec.md`

The living, as-built specification of a feature. Written at task close only; holds the full content, not a delta.

```markdown
---
type: Feature Spec
title: "{feature} spec"
description: {One sentence: what the feature does.}
status: stable
coverage: {full | partial}
generated: { by: {actor}, at: {timestamp} }
---
# {feature} — spec

## Purpose
{What the feature is for and who uses it.}

## Requirements
- **R1** (must): {statement}

## Acceptance criteria
1. **AC1** (R1): Given …, when …, then … — proven by [{task_id} V{n}]({relative path to validation.md})

## Module map
| File | Module / layer | Responsibility | Public interface |
|---|---|---|---|

## Interfaces and data
{Public APIs, commands, events, and data models, as built.}

## Decisions
| Decision | Reason | Source |
|---|---|---|
| {what} | {why} | [{task_id} D{n}]({relative path to plan.md}) |

## How to validate
{Commands that run the feature's tests, and the manual checks.}

## Known limitations
{Deferred defects, unspecified areas (when `coverage: partial`), and follow-ups.}

## Source tasks
* [{task_id}](tasks/{task_id}/status.md) - {task_type}: {description}
{Newest first.}
```

A feature's as-built `ux_design.md` uses the task `ux_design.md` template with `type: Feature UX Design`, the full content, and no `Revisions` or `Review log`.
