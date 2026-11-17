# Quality gates

What proves a task, and the app, beyond its own tests (SKILL.md → steps 6 and 7). The profile's rigor table says which of these an app kind requires; each required one is a case in the task's `Validation plan`, each run is a `Run log` row, and each finding is a `Defects` row.

## Index
[Stop criteria](#stop-criteria) · [Independence](#independence) · [Code review role](#code-review-role) · [QA role](#qa-role) · [Dependency audit](#dependency-audit) · [Security scan](#security-scan) · [Video evidence](#video-evidence)

## Stop criteria

Written in `plan.md` → `Stop criteria` when the task is planned, and approved with the plan.

- **Done when** is a checklist, not a judgement: each line names the validation case or conformance item that proves it. A task is finished when every line is proven by a run made after the last code change — not when the code looks complete.
- **Stop and ask when** lists the conditions under which the agent ends the turn instead of continuing. The four fixed ones are in the profile's template; add the task's own — for example "the outside service answers differently from its documentation".
- Meeting a stop condition is never a failure to hide. Record a `Blockers` row (and, for an operation, the `operations.md` row), set `phase_build: blocked`, say in plain words what is needed from the human, and end the turn.
- Never widen the task to get past a stop condition: something the plan does not cover is a `Follow-ups` bullet or a revert, as the contract says.

## Independence

The code review and the QA run are done by a role that did not write the code and does not see how it was written.

| Level | How | Recorded as |
|---|---|---|
| 1 | a sub-agent the harness starts with a fresh context, given only the brief and the inputs below | `sub-agent` |
| 2 | a separate session or a different agent, started by the human with the brief | `fresh session` |
| 3 | the building agent itself, working through the brief's checklist | `same agent` |

- Use the highest level the harness offers. Level 3 is allowed only when 1 and 2 are not available; it is named in the `Run log` and is a gap at handover.
- The independent role receives documents and code, never the building conversation, the builder's reasoning, or a statement that something "already works".
- The independent role changes no product file. It reports; the building role fixes; the independent role checks the fix.
- At most three review-and-fix rounds on the same finding; after that it is a blocker for the human.

**Role briefs** — each role's expertise, boundaries, inputs, workflow, checklist, and report form; the brief is the role's whole instruction:
- [`roles/code_reviewer.md`](roles/code_reviewer.md) — the code reviewer.
- [`roles/qa_tester.md`](roles/qa_tester.md) — the QA tester.

**Starting the role**, by level:
1. `sub-agent`: read the role's brief and start a sub-agent with the brief's full text and the paths of its inputs as the whole prompt. When the harness offers a sub-agent defined for the role — named `app-code-reviewer` or `app-qa-tester`, possibly prefixed with the plugin's name — start that one; otherwise a general-purpose sub-agent. Never add the building conversation or a summary of it.
2. `fresh session`: give the human the brief's path and the list of inputs, and ask them to start a new session or a different agent with both; record the pending run and end the turn.
3. `same agent`: work through the brief's workflow and checklist yourself, reading only its inputs; keep its report form.

## Code review role

Required for a `poc` and an `mvp`. Brief: [`roles/code_reviewer.md`](roles/code_reviewer.md).

**Recording**: the building role adds a `Run log` row for the review (by the reviewer's actor, with the independence level), and one `Defects` row per `blocker` and `major`. A `minor` is fixed, or becomes a `Follow-ups` bullet. The review case passes when no `blocker` or `major` defect is open after the reviewer has checked the fixes.

## QA role

Required for every app kind. Brief: [`roles/qa_tester.md`](roles/qa_tester.md).

**Recording**: the building role adds a `Run log` row for the QA run (by the tester's actor, with the independence level and the evidence paths) and one `Defects` row per `blocker`, `major`, and `minor` finding. The QA case passes when every `e2e` case passes in the tester's run and no acceptance criterion is without a case.

## Dependency audit

Run the audit command of the stack's package manager (`architecture.md` → `Commands` → `audit`). Pass: no known vulnerability rated high or critical. A finding is fixed by upgrading or replacing the dependency — a replacement is a plan change, so a revert; one that cannot be fixed is a risk row and an open question for the human.

## Security scan

OWASP ZAP, required for a `poc` or an `mvp` that has a backend. Not run for a `presentation` or a `prototype`.

- **Setup is an operation.** Installing or pulling the scanner is asked in the setup plan (step 3). Read the image or package name and the options of its packaged scans from ZAP's own documentation when the `scan` command is written; do not write them from memory.
- **Targets**: only the app's own parts, started locally by the task — a local address. Never a host the human does not own, never an outside service the app calls. A scan of a hosted environment of the app is an operation of its own, and is the passive scan only.
- **Which scan**:
  - a task that adds or changes a page served to a browser → the baseline (passive) scan of the web client;
  - a task that adds or changes an HTTP route → the API scan, driven by the OpenAPI document;
  - the handover → the full (active) scan of the whole app, running locally with seed data, signed in as a seeded test user where routes need it.
- **Pass**: zero High and zero Medium alerts. Low and Informational alerts are listed in the `Run log` notes and do not fail the case.
- **An alert that is not real**: it may be excluded only with evidence — the request, the response, and why the finding does not apply — recorded as a risk row (`security`, response `accept`) naming the alert, and as an `Assumptions` bullet in an auto mode. An exclusion without that record is a failed case.
- **A real alert**: a `Defects` row; fix the cause and scan again. Never tune the scanner to hide it.
- **Scanner not available** (the setup operation is declined, or the machine cannot run it): follow the profile's rule — a `high` risk row `security scan not run`, response `defer`, trigger `before any publish or deploy`; the `scan` command marked `unavailable`; no scan case planned; a gap at handover. Never report the scan as passed or as not needed.
- Keep the scanner's report in the task's `evidence/`; it shows seeded data only.

## Video evidence

- Record a video of each `e2e` run where the tool can: the end-to-end tool's own recording for a web client, the simulator's or emulator's screen recording for a native one. Recording needs no approval; installing something in order to record is an operation.
- Save it under the task's `evidence/` (the handover's under `project/evidence/`), named `{case or criterion ID}-{run ID}`, and put the path in the `Run log` notes and in `Acceptance` → `Shown how`.
- A video shows seeded data only — no real person's data, no secret, no notification from the human's own machine.
- The runner cannot record: write `video: not available — {reason}` in the `Run log` notes. A missing video never fails a case and never blocks a task.
- When presenting a video to the human, verify that the file exists and plays to the end, then give a clickable link (relative Markdown link and absolute `file://` URL).
