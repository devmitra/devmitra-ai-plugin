# App intake

How to turn what the human says into a valid `app.md` (SKILL.md → step 1), how to start from an app that already exists, and how to slice the app into backlog items (step 4).

## Index
[Recognising the app kind](#recognising-the-app-kind) · [Interview](#interview) · [Plain-language rules](#plain-language-rules) · [Existing app](#existing-app) · [Slicing](#slicing)

## Recognising the app kind

| The human says | App kind | Confirm by asking |
|---|---|---|
| "a deck", "a presentation", "an interactive page to show …", "a landing page" with nothing to store | `presentation` | "Does anyone type in something that must be kept?" — yes means not a presentation |
| "a mock-up", "a clickable demo", "show how it would work", "for a pitch" | `prototype` | "Should the buttons really save and calculate, or only look as if they do?" |
| "try whether …", "prove that …", "a quick experiment", one risky idea | `poc` | "Is it enough that the one idea works, with made-up data?" |
| "a first version", "people will use it", "launch", sign-in, real data | `mvp` | "Will real people put their own information into it?" |

Unclear between two: propose the smaller one, and write in `app.md` → `App kind` what the larger would add. The human decides at A1.

## Interview

1. **Derive first**: the request, every file or link the human gave, and the repository. Record each derived fact with its source.
2. **Coverage checklist** — for each topic, name the source that answers it or add an `Open questions` row:
   - the problem, and what is true when the app exists;
   - who uses it, and where (phone, computer, both);
   - the three to seven things a user completes (the journeys), and for each what the user sees at the end;
   - for a `prototype` or `presentation`: who it will be shown to, and — for a `prototype` — which features matter most to show them, in what order (the `Showcase`);
   - what happens the first time, when there is nothing to show yet;
   - what happens when the user types something wrong, and when something fails;
   - what information the app keeps or sends, and whether any of it is about a person, or secret;
   - whether people sign in, and whether they see each other's information;
   - other systems it talks to, and who owns those accounts;
   - where it will run: on the human's computer, as a link others can open, or for real users;
   - deadline, budget including paid services, and rules it must follow;
   - brand and design inputs;
   - any technology the human asked for;
   - what it deliberately does not do;
   - the approval mode (profile → **Approval modes**).
3. **Rank** what is still open by how much the answer changes the build: app kind and journeys first, then data and sign-in, then delivery target, then the rest.
4. **Ask one round at a time**, in the form SKILL.md → *Talking to the human* gives. The first round goes in the opening message (SKILL.md → *Opening message*): the approval mode is question 1, so at most 2 interview questions follow it — the two ranked highest above. Later rounds carry up to 5.
5. **Record** each answer in `Open questions` (state `answered`, the answer, the sections it changed) before using it. `defaults` from the human is an answer. `defaulted` is only for a question left unanswered in an auto mode; add its default to `app_status.md` → `Assumptions`.
6. **Repeat** until no question is `open`. A question about how a feature behaves in detail is not asked here: it belongs to that feature's task. Ask at app level only what changes the app kind, a journey, the data, the platforms, or the delivery target.

## Plain-language rules

- Say what a choice means for the human, not what it is called. Not "SQLite or PostgreSQL?" but "Will more than a handful of people use it at the same time?".
- One idea per question. Give an example with each option.
- A word the human did not use first is explained in the same sentence, or replaced.
- Do not ask the human to choose between technologies unless they named one. Technology is decided at step 3 and shown as *choice — what it means for you*.
- Never ask for a password, key, or card number in chat. Ask the human to enter it themselves where it belongs.

## Existing app

For a repository that already holds a vibe-coded app without specifications.

1. **Do not reverse-engineer the whole app.** Read the entry points, the configuration, the README, and the project files — enough to list what exists.
2. **Bootstrap** the bundle with `sdd-engineering-workflow` step 1, which derives `architecture.md` from the code and runs each command before recording it.
3. **`app.md`**: fill the journeys from what the human says and what was observed running; mark each `observed` or `claimed by the human` in section 9. What was not read is listed under `What is unknown`.
4. **Design system** (step 2): the kit's Phase A reads the code first; the human reviews what was extracted.
5. **Architecture** (step 3): record the stack as found, then run the stack guide's *Review of a given stack* and compare the code with the engineering baseline. Each difference — no tests, no logging module, a secret in source, a query built from strings, no migrations — is a risk row. A secret found in source is reported to the human at once, by file and line, without copying its value into any document.
6. **Backlog** (step 4): each existing feature is one row with `Task` = `existing`. New work, and the mitigation of each risk the human chooses to act on, are ordinary rows. Nothing existing is rewritten unless a row says so.
7. A task that touches existing code without a spec follows the SDD intake guide's *Code without a spec*: it specifies only the area it touches, and its `spec.md` is `coverage: partial`.

## Slicing

Turning `app.md` into `backlog.md` → `Items`.

1. **One item is one task**: one feature, or one technical outcome, that a person can review in one sitting. An item expected to need more than 7 `must` requirements or more than 10 work items is split.
2. **Slice by journey, not by layer.** An item delivers something a user can do end to end — screen, logic, and stored data together — never "all the screens" or "the whole API".
3. **Kinds**:
   - `enabling` — the foundation item: project structure, commands, the logging module, the token module, the test harness, containers and migrations when there is a backend. First, where the rigor table requires it. With `fidelity: high`, its content is [`packaged_web_app.md`](packaged_web_app.md) → *Foundation item*.
   - `feature` — a `create` task for a new feature; a later item on the same feature is a `change`.
   - `non-functional` — an app-level requirement (`N`) that no single feature carries: sign-in and permissions, accessibility pass, performance, languages (only when the human asked for more than one language).
   - `mitigation` — work added by a risk.
   - `handover` — the last item.
4. **Order**: the foundation; then the thinnest end-to-end slice of the most important journey; then the remaining `must` items by dependency; then `should`; then `could`; then handover. An item that others wait for comes before them.
5. **Priority**: `must` — a success criterion fails without it; `should` — expected, and the app is still usable without it; `could` — only if time allows. On a `poc`, only the items the proof needs are `must`.
6. **Outcome sentence**: what the human can do or see when the item is done, with no technical term — "You can add an expense and see it in the list", not "CRUD for expenses".
7. **Cover everything**: each `J`, `N`, and `SC` appears in the `Covers` cell of some item. What is left out on purpose goes under `Not in this backlog` with the reason.
