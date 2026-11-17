# App templates

Templates for the app-level documents defined in [`app_profile.md`](app_profile.md). Task documents use [`sdd_templates.md`](sdd_templates.md) with the profile's additions. Replace `{placeholders}`; keep headings and their order; delete the `{guidance}` lines. Frontmatter follows the contract's rules for concept documents; an approved document gets `status: stable` and a `verified` entry.

## Index
[app.md](#appmd) · [app_status.md](#app_statusmd) · [backlog.md](#backlogmd) · [risks.md](#risksmd) · [operations.md](#operationsmd) · [handover.md](#handovermd) · [Bundle index entries](#bundle-index-entries)

## `app.md`

What the app is and why. Written for a reader who is not a developer.

```markdown
---
type: App Intent
title: "{app_name} — app intent"
description: {One sentence: what the app is and who it is for.}
status: draft
revision: 1
generated: { by: {actor}, at: {timestamp} }
app_kind: {presentation | prototype | poc | mvp}
fidelity: {high | standard | n/a}   # presentation and prototype: high unless the human asked for a quick sketch; n/a otherwise
platforms: [{html | web | ios | android | hybrid}]
delivery_target: {local | shared-demo | production}
---
# {app_name} — app intent

## Revisions
| Rev | At | By | Sections | Change | Trigger |
|---|---|---|---|---|---|
| 1 | {timestamp} | {actor} | all | Initial app intent | {user request} |

## Open questions
| ID | Question | Options (recommended first) | State | Answer → sections updated |
|---|---|---|---|---|
{State: open | answered | defaulted. The app intent cannot be approved while any question is open.}

## 1. Summary (required)
- **Problem and outcome**: {what is hard today, and what is true when the app exists}
- **Users**: {who uses it, and in what situation}
- **App kind**: {app kind} — {why this kind, and what the next larger kind would add}
- **Fidelity**: {high: a polished, animated demo that opens from one file and feels real | standard: a quick clickable sketch, quoting the human | n/a}
- **Showcase** (a `prototype` with `fidelity: high`; `n/a` otherwise): {features to highlight, in the order shown — each: feature, journey ID, audience, its value in one plain sentence}
- **Platforms and devices**: {where it runs}
- **Delivery target**: {local: runs on the human's computer | shared-demo: others can open it | production: real users}
- **Starting point**: {new app | existing code — see section 9}

## 2. User journeys (required)
Each line ends with `Source: user | repo:<path> | file:<name> | derived`.
- **J1** {name}: {user} {does what, step by step}, so that {outcome}. Source: {source}
{Three to seven journeys. A journey is something a user completes, not a screen.}

## 3. App-level requirements (required)
- **N1** (must) [{security | privacy | accessibility | performance | languages | offline | compliance | operations}]: The app shall {rule}. Source: {source}
{Rules that hold across features. Priority: must | should. `none identified` when there are none.}

## 4. Data (required)
| Data | Example (invented) | Class | Kept where | Leaves the device? |
|---|---|---|---|---|
{Class: public | internal | personal | secret. `none` when the app stores and sends nothing.}

## 5. Integrations (required)
{Each outside system the app talks to: what for, who owns the account. `none` otherwise. Never an invented URL or account — use a marked placeholder such as {PAYMENT_PROVIDER}.}

## 6. Success criteria (required)
1. **SC1** (J1): Given {starting situation}, when {the user does this}, then {what they can see}.

## 7. Constraints (required)
- **Deadline**: {date | none}
- **Budget**: {limit, including paid services | none stated}
- **Compliance**: {rules the app must follow | none stated}
- **Brand and design inputs**: {guideline, HTML, CSS, URL, or screenshots the human gave | none}
- **Visual references**: {websites or apps the human likes, and what they like about each — mood only, never a brand source | none | n/a}
- **Technology asked for**: {stack or architecture the human named, quoted | none}

## 8. Out of scope (required)
{What this app deliberately does not do, or `none identified`.}

## 9. Existing code (only for an existing app)
- **Where**: {paths}
- **What it does today**: {the journeys that work, as observed — each marked `observed` or `claimed by the human`}
- **What is unknown**: {areas not read; they stay unspecified until a task touches them}
```

## `app_status.md`

```markdown
---
type: App Status
title: "{app_name} — app status"
description: {One sentence: where the app stands.}
generated: { by: {actor}, at: {timestamp} }
app_kind: {presentation | prototype | poc | mvp}
fidelity: n/a                      # high | standard | n/a — as in app.md
approval_mode: not-chosen          # not-chosen | review | auto-technical | auto-all — not-chosen until the human answers; gates then wait as in review
task_track: express                # express | full
has_backend: undecided             # undecided | true | false — set at A3
qa_run: undecided                  # undecided | yes | no — independent QA run, set at A3 (default: no for presentation and prototype, yes for poc and mvp)
phase_app_intent: pending          # pending | in_review | approved | reverted
phase_design_system: pending       # pending | in_review | approved | reverted
phase_architecture: pending        # pending | in_review | approved | reverted
phase_backlog: pending             # pending | in_review | approved | reverted
phase_risks: pending               # pending | in_review | approved | reverted
phase_tasks: pending               # pending | in_progress | blocked | done
phase_handover: pending            # pending | in_progress | in_review | accepted
next: Intent                       # Intent | Design system | Architecture | Backlog | Risks | Build | Handover | done
app_revision: 0                    # revision the A1 approval applies to
backlog_revision: 0                # revision the A4 approval applies to
risks_revision: 0                  # revision the A5 approval applies to
open_questions: 0                  # count of `open` questions in the app-level documents
claim: { by: {actor}, at: {timestamp} }     # or: none
---
# {app_name} — app status

[App intent](app.md) · [Architecture](architecture.md) · [Backlog](backlog.md) · [Tracker](backlog_tracker.md) · [Risks](risks.md) · [Operations](operations.md) · [Handover](handover.md)
{Keep only the links to documents that exist.}

## Handoff note
- **Done**: {what is finished, in one or two lines}
- **Next action**: {one concrete action: a step, a backlog item, or a question to ask}
- **Watch out**: {what the next session must know, or `none`}
{At most 10 lines; rewritten at every session end.}

## Approvals
| Gate | Artifact (revision) | Decision | By | At | Notes |
|---|---|---|---|---|---|
{Gate: MODE, G0, A1–A6. Decision: pending | approved | rejected | auto-approved | reverted. Notes quote the human's words; an auto-approved row quotes the MODE row. Operations are recorded in operations.md, not here.}

## Reverts
| At | From step | Trigger | Conflicts with (document › section) |
|---|---|---|---|

## Assumptions
{One bullet per auto-approved gate or defaulted question, with the choice made for the human; `none` otherwise.}

## Follow-ups
{One bullet per follow-up copied from a closed task, or noticed outside any task. Each is a candidate backlog item, added only as a backlog revision through A4; `none` otherwise.}
```

## `backlog.md`

The only backlog. `scripts/backlog.js` reads the `Items` table, so keep its column names and their order.

```markdown
---
type: Backlog
title: "{app_name} — backlog"
description: {One sentence: how many items, and what they add up to.}
status: draft
revision: 1
app_revision: {n}
generated: { by: {actor}, at: {timestamp} }
---
# {app_name} — backlog

## Revisions
| Rev | At | By | Change | Trigger |
|---|---|---|---|---|
| 1 | {timestamp} | {actor} | Initial backlog | A1 approval |

## Items
| ID | Item | Outcome | Kind | Feature | Task type | Priority | Depends on | Covers | Task |
|---|---|---|---|---|---|---|---|---|---|
| BL1 | {short name} | {one plain sentence: what the human can do or see when it is done} | {feature | non-functional | enabling | mitigation | handover} | {feature | none} | {create | change | bugfix | technical} | {must | should | could} | {BL IDs | —} | {J, N, SC, RK IDs | enabling} | — |
{Rows are in build order. `Task`: `—` until the task is opened, then a link to its status.md; `existing` for something already built without a spec; `removed` for a dropped item, whose row and ID are kept.}

## Not in this backlog
{Things asked for or noticed that were left out, each with the reason; `none` otherwise.}
```

`backlog_tracker.md` and `backlog.html` are written by `backlog sync` from this table and from each linked task's `status.md`. They have no template: never write or edit them by hand.

## `risks.md`

```markdown
---
type: Risk Register
title: "{app_name} — risks"
description: {One sentence: how many risks, and the highest level open.}
status: draft
revision: 1
generated: { by: {actor}, at: {timestamp} }
---
# {app_name} — risks

## Revisions
| Rev | At | By | Change | Trigger |
|---|---|---|---|---|
| 1 | {timestamp} | {actor} | Initial register | A3 and A4 |

## Risks
| ID | Risk | Category | Likelihood | Impact | Level | Response | Action | Linked to | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| RK1 | If {cause}, then {event}, leading to {consequence}. | {product | technical | security | privacy | delivery | cost | dependency | operations} | {low | medium | high} | {low | medium | high} | {level} | {avoid | mitigate | transfer | defer | accept} | {see below} | {BL, C, or OP ID | —} | {human | agent} | open |
{Action — avoid: what is not done or done differently; mitigate: what reduces it; transfer: who takes it; defer: the trigger or date that reopens it; accept: why it is tolerable.}
{Status: open | mitigated | closed | occurred. Setting a status, with its evidence in the Action cell, is not a revision; any other change is, through A5.}

## Level
| Likelihood ↓ / Impact → | low | medium | high |
|---|---|---|---|
| **low** | low | low | medium |
| **medium** | low | medium | high |
| **high** | medium | high | high |
```

## `operations.md`

```markdown
---
type: Operations Log
title: "{app_name} — operations"
description: Every action asked of the human that reaches beyond the workspace, with its decision.
status: stable
generated: { by: {actor}, at: {timestamp} }
---
# {app_name} — operations

| ID | Asked at | Category | Exact action | Target | Why | How to undo | Asked by | Decision | By | Decided at | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| OP1 | {timestamp} | {setup | update | delete | publish | deploy} | {the command or the click, exactly} | {machine, service, remote, or environment} | {what needs it} | {the undo action, or `cannot be undone`} | {step or task_id} | pending | — | — | — |
{Decision: pending | approved | rejected — set once, with the human's words in Notes. Rows are added, never edited or removed. Secrets appear by name only.}
```

## `handover.md`

Written by the handover task. Its first three sections are for a reader who is not a developer.

```markdown
---
type: Project Handover
title: "{app_name} — handover"
description: {One sentence: what is handed over and in what state.}
status: draft
generated: { by: {actor}, at: {timestamp} }
---
# {app_name} — handover

## 1. What you have
{Three to six plain sentences: what the app does, for whom, and how complete it is against the app intent.}

## 2. How to run it
| To | Do this |
|---|---|
{Set up, start, stop, run the tests — commands from architecture.md that were run. What must be installed first.}

## 3. Try it yourself
| Step | Do | You should see | Result |
|---|---|---|---|
{One block of steps per success criterion. `Result` is filled with what the human reports: pass | fail | not tried.}

## 4. Delivered
| Feature | Backlog items | Spec | Preview | Video |
|---|---|---|---|---|

## 5. Not delivered
| Backlog item | Why | What it would take |
|---|---|---|
{`none` when every item is closed.}

## 6. Quality evidence
| Check | Scope | Result | Evidence |
|---|---|---|---|
{Automated tests (counts), independent review, independent QA run, dependency audit, security scan, traceability — each with the run it comes from, `not required for this app kind`, or, for the QA run of a presentation or prototype with `qa_run: no`, `not run — optional, skipped by choice`.}

## 7. Gaps
| ID | Gap | Against | Effect | Suggested next step |
|---|---|---|---|---|
| GAP1 | {what is missing, unverified, or verified by a weaker method} | {J, N, SC, BL, or the check} | {what the human cannot rely on} | {a candidate backlog item} |

## 8. Open risks
| Risk | Level | Response | What to watch |
|---|---|---|---|
{Every risk in risks.md that is not `closed`.}

## 9. Environment
- **Needs installed**: {runtimes and tools}
- **Settings**: {environment variable names and what each is for — never a value}
- **Accounts and services**: {each, and who owns it}
- **Operations performed**: {OP IDs approved and done}

## 10. Before real users or a public release
{What must be true first: each open `high` risk, each gap that affects safety or data, hosting, backups, monitoring, legal texts — each as a candidate backlog item. Publishing and deploying are operations and need their own approval.}

## 11. Where everything is
- **Why it is built this way**: [architecture](architecture.md) · [decisions](decisions.md)
- **What each feature does**: the `spec.md` of each feature, listed in the bundle [index](../index.md)
- **To change or fix something**: open a task from a backlog item, or ask for a change — the workflow is in [workflow](workflow.md)
```

## Bundle index entries

Added under `# Project` in the bundle `index.md` as each document is created:

```markdown
* [App intent](project/app.md) - {description}
* [App status](project/app_status.md) - {description}
* [Design system](project/design_system/config.json) - {base name and version; locked | neutral kit}
* [Backlog](project/backlog.md) - {description}
* [Backlog tracker](project/backlog_tracker.md) - Generated state of every backlog item.
* [Backlog board](project/backlog.html) - Clickable view of the backlog and its progress.
* [Risks](project/risks.md) - {description}
* [Operations](project/operations.md) - Every action asked of the human that reaches beyond the workspace, with its decision.
* [Handover](project/handover.md) - {description}
```
