# Intake and interview

How to turn what the human gives you into a task and a valid `intent.md` (SKILL.md → *Intake and intent*).

## Index
[Input kinds](#input-kinds) · [Bug or change?](#bug-or-change) · [Feature and name](#feature-and-name) · [Sizing and splitting](#sizing-and-splitting) · [Statement forms](#statement-forms) · [Interview](#interview) · [Code without a spec](#code-without-a-spec)

## Input kinds

| Input | Recognise it by | Task type | Derive first | Gaps to ask about |
|---|---|---|---|---|
| Feature details | a description of a capability, a requirements excerpt, a screen or API sketch | `create`; `change` if the feature has a `spec.md` | purpose, users, behaviours, data in and out | edge cases, failure behaviour, limits, what is out of scope |
| User story | "As a … I want … so that …" | `create` or `change`, by whether the feature has a `spec.md` | role → users; goal → requirements; benefit → purpose | acceptance criteria, owning feature, priority |
| Technical task | refactor, migrate, upgrade, restructure, add tooling, investigate | `technical` | motivation, target state | invariants, the measure of done, rollback |
| Bug | what happens differs from what should | `bugfix` | observed, expected, the violated requirement in `spec.md` | reproduction steps, environment and version, frequency, impact |
| Change request | alter behaviour that already exists | `change` | what changes and why, the affected requirements in `spec.md` | what must stay the same, existing data and users, backward compatibility |

A message that mixes kinds (a bug and a new capability) becomes one task per kind; propose the split and the order.

## Bug or change?

- The behaviour contradicts `spec.md` → `bugfix`.
- The behaviour matches `spec.md` but is no longer wanted → `change` (the spec is what changes).
- `spec.md` is silent, or there is none → ask the human which behaviour is intended, and record the answer as the source.

## Feature and name

1. Match the request to a feature in the bundle `index.md` (by name, then by the files it touches in each spec's `Module map`).
2. No match: propose a kebab-case name of one to three words that follows the repository's vocabulary (`order-history`), and get it approved at G1.
3. Work that no feature owns (build tooling, a repository-wide upgrade) is a `technical` task in `{bundle}/tasks/`.

## Sizing and splitting

One task is one increment a person can review in one sitting. Propose a split, in dependency order, when any holds:
- it would create more than one feature;
- it has more than 7 `must` requirements, not counting those that only say how invalid input or a failure is handled, or would need more than 10 work items;
- it mixes a behaviour change with a `technical` restructuring of the same code (restructure first, then change).

Record the tasks not started as `Out of scope` items naming the follow-up task.

## Statement forms

- **Requirement**: `When {trigger}, the {system} shall {response}.` Always-true rules drop the trigger: `The {system} shall {rule}.` One response per requirement: triggers that share the same response may share a requirement (`When A, B, or C, the {system} shall {response}`); two different responses are two requirements.
- **Acceptance criterion**: `Given {precondition}, when {action}, then {observable result}.` Observable means a person or a test can see it: an output, a stored value, a message, a status code — not an internal state.
- **Invariant** (`technical`): `The {system} shall still {behaviour}`, checked by an existing test or a before-and-after measurement.
- Replace vague words (*fast*, *simple*, *secure*, *user-friendly*, *etc.*) with a number, a named rule, or an example — or raise an open question.

## Interview

1. **Derive before asking**: the request, the bundle (`spec.md`, closed tasks, decisions), then the repository (code, tests, configuration, documentation). Record each derived fact with its source.
2. **Run the coverage checklist** before the first round. For each topic, name the source that answers it or add an `Open questions` row: who uses it; the main success path; the empty or first-use state; what happens on invalid input; what happens on failure (data that is missing, unreadable, or not valid; an operation that cannot complete); what data is stored or sent, and whether any of it is personal or secret; platforms, versions, and limits; what is out of scope.
3. **List anything else still unknown** as `Open questions` rows — never fill a gap with a guess.
4. **Rank** by how much the answer changes the build: scope and behaviour first, then data and failure handling, then limits, then wording.
5. **Ask one round at a time**: at most 5 questions, numbered, each with a one-line reason it matters and two to four options, the recommended one first and marked. Tell the human they can answer by number and letter, or say `defaults`.
6. **Record** every answer in `Open questions` (state `answered`, the answer, the sections it changed) before using it. `defaults` from the human is an answer: the recommended option, state `answered`. State `defaulted` is only for a question left unanswered on the `express` track or under auto-approve; add its default to `status.md` → `Assumptions`.
7. **Repeat** until no question is `open`. Ask only questions whose answer changes scope or behaviour; set any other — wording, or a detail of how it is built — to `deferred` with the reason, and the plan settles it in a `Decisions` row. A new question raised by an answer goes into the next round, not into an assumption.

## Code without a spec

When the task touches a feature that exists in code but has no `spec.md`:
1. Do not reverse-engineer the whole feature. Read only the area the task touches and record its current behaviour in `plan.md` → `Existing work`.
2. Write the intent against that recorded behaviour; where it is unclear whether current behaviour is intended, ask.
3. At close, create `spec.md` with `coverage: partial`, holding the requirements this task specified and listing the unspecified areas under `Known limitations`.
