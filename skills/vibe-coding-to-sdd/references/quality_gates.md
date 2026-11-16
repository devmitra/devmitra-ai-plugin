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

## Code review role

Required for a `poc` and an `mvp`. Give the reviewer this brief.

**Inputs**: the task's `intent.md`, `plan.md`, and `validation.md` → `Validation plan`; `project/architecture.md`; the list of files the task created or changed, and their content or diff.

**Check, in this order**:
1. **Plan conformance**: every changed file has a `Module map` row and holds only the responsibility that row names; nothing imports what its row forbids; no file, public symbol, dependency, or stored field exists that the plan does not list.
2. **Conformance rules**: each item of the plan's `Conformance checklist`, including every engineering-baseline rule — find the code that satisfies it, or report it missing.
3. **Correctness against the intent**: each acceptance criterion — the code path that produces its result, and each failure path the intent names.
4. **Security**: untrusted input reaching a query, a file path, a command, HTML, or a log; a route without its permission check; a secret or personal data in source, a fixture, or a log line.
5. **Logging**: the events the plan lists exist at their levels; the correlation ID is passed on; no sensitive field is logged outside the masking rule.
6. **Tests**: each validation case asserts a result a user or caller can observe; no test is skipped, weakened, or passing for the wrong reason.
7. **Maintainability**: a file over 300 lines without its `Decisions` row; duplicated logic; dead code; a name that misleads.

**Report** — one row per finding, nothing else:

| Severity | File › symbol | Rule or criterion | What is wrong | Suggested fix |
|---|---|---|---|---|

- `blocker`: wrong behaviour, a security hole, a secret, or a broken plan or conformance rule.
- `major`: a missing failure path, a missing or meaningless test, sensitive data in a log.
- `minor`: maintainability. `note`: an observation that needs no change.
- No finding: say so, and list what was checked.

**Recording**: the building role adds a `Run log` row for the review (by the reviewer's actor, with the independence level), and one `Defects` row per `blocker` and `major`. A `minor` is fixed, or becomes a `Follow-ups` bullet. The review case passes when no `blocker` or `major` defect is open after the reviewer has checked the fixes.

## QA role

Required for every app kind. Give the tester this brief.

**Inputs**: the task's `intent.md` (acceptance criteria) and `validation.md` → `Validation plan`; `project/architecture.md` → `Commands`; for the handover, `app.md` → `Success criteria`. Not the plan's design, and not the source code — the tester works from what the app should do.

**Do**:
1. Start the app with the recorded commands, from a clean state with the seed data. A command that fails as recorded is the first finding.
2. Run every `e2e` case of the validation plan with the stack's end-to-end tool, recording video and keeping the tool's trace or screenshots on failure.
3. For each acceptance criterion, perform it as written — the given, the action, the result — in the running app, and compare with what the case asserts. A criterion with no case, or a case that passes while the app does not do what the criterion says, is a finding.
4. Try each journey's unhappy paths the intent names: wrong input, nothing to show yet, a failure of something it depends on.
5. On a `prototype`: run the kit's automated walk over every path of the preview — the main path, validation errors, overlays, back, navigation.
6. Where the baseline applies: pick one journey and follow its correlation ID through the logs of every part.

**Report**: per case — pass or fail, and the evidence path; per finding — the steps to reproduce, what was expected (the criterion's ID), what happened.

**Recording**: the building role adds a `Run log` row for the QA run (by the tester's actor, with the independence level and the evidence paths) and one `Defects` row per finding. The QA case passes when every `e2e` case passes in the tester's run and no acceptance criterion is without a case.

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
