---
name: swift-frontend-programming
description: Guideline for designing, building, and testing isolated, injectable iOS/macOS frontend features (a.k.a. components) in Swift (SwiftUI/UIKit) with Swift Testing, XCTest and XCUITest, from an approved plan. Use this skill when generating or modifying Swift frontend code, feature previews, or tests for a planned feature, change, or bugfix. Requires an approved intent and plan from frontend-development-planner; reverts to it when later input conflicts with them. DO NOT use this for planning or non-frontend development.
---

# Swift Skill for iOS and Mac Frontend Development

## Purpose
Design, generate, and test efficient, secure, and performance-optimized Swift features for iOS and macOS from an approved intent and plan. Each feature is built in isolation — every view, model, view model, coordinator, and service is injected and mockable — so it can be previewed and tested alone and integrated into the main app later.

**Scope**: this skill holds the **building role** of the spec-driven development (SDD) workflow for Swift user-interface work — testable project setup, feature design, build, validation, user verification, and close. Planning, `intent.md`, `plan.md`, the validation plan, the UX design specification, the design-system base, and the architecture/design pattern are owned by the `frontend-development-planner` skill; this skill consumes them and never plans on its own.

**Sources of truth**: the approved `intent.md` and `plan.md` (current revisions), then the approved `ux_design.md`. User input that conflicts with them is never applied silently — revert to planning (see [Revert to planning](#revert-to-planning)).

**References** — follow them exactly:
- [`references/sdd_contract.md`](references/sdd_contract.md) — the SDD contract: terms, layout, discovery, ownership, phases and gates, approvals, checks, session continuity, rules.
- [`references/sdd_templates.md`](references/sdd_templates.md) — the template of every document.
- [`references/frontend_profile.md`](references/frontend_profile.md) — the frontend profile: added layout, gates F1 and F2, document sections, and checks.
- [`references/logging.md`](references/logging.md) and [`references/project_template.yml`](references/project_template.yml).

The first three are byte-identical copies of the files shipped by `sdd-engineering-workflow` and `frontend-development-planner`.

## Context root (`{root}`)

`{root}` is the directory that holds the nearest `{bundle_dir}/` bundle (`{bundle_dir}` defaults to `.agentic_coding`, see the contract's **Configuration**), found with the contract's **Discovery** (walk up from the file or module being worked on, or from the working directory). It may be nested (repo root, sub-repo/package root, or workspace/project root).
- No bundle on that path: there is no approved plan — stop and tell the user to run `frontend-development-planner`.
- The Xcode project is looked up in `{root}`: `project.yml`, `*.xcodeproj`, `*.xcworkspace`, or `Package.swift`. If the open task's `status.md` → `root` names a different directory, use that one. If still ambiguous, ask the user.

## Terminology

Terms are defined in the contract's **Terms** and the profile's **Terms**. "Feature" is the unit formerly called "component"; requests that say "component" mean the same thing. `{feature}` is the kebab-case directory name; `{feature_name}` is the code-facing UpperCamelCase name that prefixes source and test files. Both are read from `status.md`.

## Knowledge discovery and session continuity

`{bundle}/` is an OKF knowledge bundle covering the project documents and every feature's spec and tasks. Start every session with the contract's **Discovery** (bundle `index.md` → feature `index.md` → the task's `status.md` first) and its **Resume check**; end every turn that changed the task with its **Session end** (`Progress`, `git.head`, the `Handoff note`, `handoff.md` when required, the claim). Keep the indexes and logs current in the same step that changes a document. Show the progress view as `sdd-engineering-workflow` → *Progress view* says — full at session start, compact after each step and gate decision (`node <sdd-engineering-workflow dir>/scripts/sdd_progress.js --root {root}`).

## Approval policy (applies to every step)

Do not move past a gate without explicit user approval, unless the user explicitly says to proceed without asking (e.g., "auto-approve", "don't ask"). Record every gate decision in `status.md` → `Approvals`.
- Gates: **F2** project setup that creates or changes project structure (step 2); **G3** `ux_design.md` and the feature preview built on the locked design-system base (step 3); **G4** user verification of the built feature (step 5).
- A **gate request** is one message with the gate, links to the documents and their revisions, a summary of at most 10 lines, what changed since the last revision, and a closing question that names the gate ("Approve G3, or tell me what to change?").
- A needed third-party dependency, file, or behaviour that the approved plan does not contain is a plan conflict, not a gate: revert to planning.
- Non-interactive session and auto-approve: follow the contract's **Approvals** (pending row, phase `in_review`, end the turn). Do not assume and continue.
- Never invent external references (URLs, video/document IDs, API endpoints, package names). Ask the user, or use clearly marked placeholders.

## Artifacts

Layout, phases, ownership, checks, and security rules are in the contract and the profile; templates are in [`references/sdd_templates.md`](references/sdd_templates.md) plus the profile's **Document additions**. This skill writes only:
- in the task directory: `status.md` (`phase_design`, `phase_build`, `phase_validation`, `next`, `claim`, `git`, and its `Handoff note`, `Progress`, `Blockers`, `Reverts` sections and its own `Approvals` rows; `phase_intent` / `phase_plan` to `reverted` only), `ux_design.md`, every section of `validation.md` except `Validation plan`, appended rows of `plan.md` → `Decisions`, verification screenshots, and `handoff.md`;
- the feature preview in `{bundle}/features/{feature}/preview/`, through the `feature-preview-kit` skill (Phase B); never the design-system base in `{bundle}/project/design_system/`;
- source and test files, prefixed with `{feature_name}` (e.g. `{feature_name}View.swift`), placed per the plan's `Module map`;
- at close: the feature's `spec.md` and as-built `ux_design.md`, promoted rows of `project/decisions.md`, and the feature's `index.md` and `log.md`.

It never edits `intent.md`, the rest of `plan.md`, or the `Validation plan`.

## Guardrails and main coding guidelines

Mandatory guardrails for Swift coding, organized by category:

### Naming convention and standard guidelines

Follow repo-specific naming conventions if they exist; otherwise follow the [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/).

### Third-party libraries

Use only the third-party libraries the approved plan names (the planner checked vulnerabilities and license, and the user approved them). Any other library is a plan conflict — revert to planning.

### Secure coding and privacy
- **Secure coding**: Do not expose sensitive, secret, or private information in code. Always inject such information via proper configuration.
- **Sanitize/escape** all user-generated content before rendering.
- Add an `Info.plist` usage description for every permission the feature requests, and `PrivacyInfo.xcprivacy` entries when it uses required-reason APIs or collects data.
- Never put secrets, personal data, or real user content in previews, fixtures, screenshots, logs, or artifacts; use synthetic data.

### Accessibility (a11y)
- **Semantic UI first**: standard controls and SwiftUI/UIKit semantics before custom accessibility code; accessibility modifiers describe, never patch, the UI.
- **VoiceOver**: every meaningful element has a localized `accessibilityLabel`, plus `accessibilityHint`/`accessibilityValue` where they add meaning; correct traits (`.isButton`, `.isHeader`, `.isSelected`); decorative images hidden; related elements grouped (`accessibilityElement(children:)`); reading order set where layout order differs (`accessibilitySortPriority`).
- **Dynamic Type**: text styles only, no fixed font sizes; `@ScaledMetric` for spacing/icons that scale; layouts work up to accessibility sizes (`.accessibility5`) without clipped text.
- **Touch targets**: at least 44x44 pt for every interactive element.
- **Contrast and color**: WCAG AA (4.5:1 text, 3:1 large text and UI features) in light and dark mode; respect Increase Contrast and Differentiate Without Color.
- **Motion and transparency**: respect Reduce Motion (`accessibilityReduceMotion`) and Reduce Transparency.
- **Keyboard and focus**: every interactive element reachable with Full Keyboard Access (iOS) or the key view loop (macOS); focus managed with `@FocusState`; modals dismiss with Escape (`.onExitCommand`/`.keyboardShortcut(.cancelAction)`).
- **Voice Control**: labels match visible text; `accessibilityInputLabels` for alternatives.
- **Automated checks**: an XCUITest per new view calls `XCUIApplication().performAccessibilityAudit()`; check manually with Accessibility Inspector and VoiceOver before user verification.

### Memory & Safety
- **Avoid force-unwrapping (`!`)** in production code — use `guard let`/`if let`, or `??` with sensible defaults. Force-unwraps should be reserved for cases with a provable invariant.
- **No force-casts (`as!`)** — prefer `as?` with explicit handling of the failure case.
- **Avoid retain cycles** — use `[weak self]` / `[unowned self]` in closures, especially in async callbacks, delegates, and Combine/async streams.
- **Avoid implicitly unwrapped optionals (`!` in declarations)** except for well-justified cases (e.g., `@IBOutlet`s configured before use).
- For closures, always keep track of variables declared in the parent scope, and confirm variable availability before using them inside a closure via `guard let` or `if let`.
- **Clean up closures** as soon as their functional scope is over — closures can cause memory leaks.
- **Perform static analysis** to find memory retention cycles and leaks.

### Concurrency
- **Use Swift Concurrency (`async/await`, actors) correctly** — avoid mixing GCD and structured concurrency without clear boundaries.
- **Mark UI-mutating code `@MainActor`** — never touch UI from a background thread.
- **Guard shared mutable state with actors**, not manual locks/queues, where possible.
- **Handle task cancellation** explicitly in long-running `Task`s (check `Task.isCancelled` or use `withTaskCancellationHandler`).
- **No data races** — enable Swift 6 strict concurrency checking where feasible to catch these at compile time.

### Error Handling
- **No silent `catch {}` blocks** — every caught error should be logged, surfaced, or explicitly justified as ignorable.
- **Use typed/domain errors** (`enum: Error`) rather than generic `NSError` or `String`-based errors.
- **Don't use exceptions/`fatalError` for recoverable conditions** — reserve `fatalError`/`precondition` for truly unrecoverable programmer errors.

### Logging

**Logger implementation**: Check whether a centralized logging framework is already in use. If not, use the minimal OSLog wrapper in [`references/logging.md`](references/logging.md) (Swift 6 clean).

Log as much as possible with appropriate context. Guidelines:
- Never expose secret, sensitive, or private information in logs — use OSLog `privacy: .private` by default (or masking in the logging framework if it's missing).
- Always log errors and exceptions with full detail.
- Use warning level for unexpected behavior or input, with key details.
- Use info level for major events, checkpoints, or milestones (these can also feed analytics and user-journey timelines).
- Use debug level for debugging only — ensure debug logs are disabled in production builds.
- Ensure the logging framework supports enabling/disabling each level (error, warning, info, debug) independently.

### API & Data Handling
- **Validate and sanitize server responses** — don't force-decode JSON; use `Codable` with proper optional/failable handling.
- **No hardcoded secrets/API keys** in source — use secure storage (Keychain) or build-time injection, not plist/config files committed to source control.
- **Use Keychain for sensitive data**, never `UserDefaults`.
- **Certificate/App Transport Security compliance** — no arbitrary loads over HTTP without explicit, justified exceptions.

### Maintainability and isolation
- **Consistent architecture pattern**: apply the pattern in `project/architecture.md` (MVVM, TCA, etc.) uniformly, per the plan's `Module map` — avoid massive view controllers/views mixing business logic and UI.
- **Isolated features**: every dependency in the plan's `Dependencies and injection` table is a protocol with a live implementation and a mock; views, view models, coordinators, and services receive dependencies through their initializers (or `@Environment`) so each can be previewed, tested, and integrated without the rest of the app.
- **State per the plan's feature model**: inputs immutable (`let`) or `@Binding`; internal state `private(set)` with a single owner; outputs as callbacks.
- **Dependency injection over singletons** for testability, except where a singleton is genuinely justified (e.g., `URLSession.shared`).
- **Access control discipline** — default to `private`/`fileprivate`; only expose what's needed (`public`/`open` used deliberately, especially in frameworks).

### Testing & CI
- **Unit tests required for business logic and view models**, not just UI smoke tests.
- **SwiftLint (or equivalent) enforced in CI**, not just locally.
- **No compiler warnings tolerated** — treat warnings as errors in CI builds.
- **UI tests for critical flows** (auth, checkout, core navigation) and accessibility audits, as listed in the validation plan.

### Performance
- **Avoid retain-heavy patterns in SwiftUI** — unnecessary `@State`/`@Published` triggering re-renders.
- **Profile with Instruments** for memory leaks and main-thread hangs before shipping, especially on lists/scroll views with images.
- **Lazy-load images and heavy views** (`LazyVStack`/`LazyHStack`/`List`, proper cell reuse in `UITableView`/`UICollectionView`) as the plan's `Cross-cutting` → `Performance` specifies.

### Localization
- **All user-facing strings must be localizable**: use `Text("literal")`/`LocalizedStringKey`, `String(localized:)`, and a String Catalog (`Localizable.xcstrings`) — no hardcoded display strings built by concatenation; use interpolation/plural variations.
- Format dates, numbers, and units with locale-aware formatters (`FormatStyle`, `Measurement`); never hand-format.
- Use leading/trailing (not left/right) alignment and padding so right-to-left layouts work; verify long strings do not truncate.
- Add accessibility labels as localized strings too.
- Provide `.xcstrings` entries for every language in the intent's `Frontend inputs` → `Localization languages` (default: development language only).

## Other coding guideline

- **Reusable coding**: reuse or extract the shared features listed in the plan's `Existing work`.
- **Lite and minimal coding**: Use inline functions, macros, and function chaining to write minimal code. Use `filter`, `map`, and `reduce` to process collections. Prefer system frameworks/libraries over custom implementations where possible.

## Workflow

| Step | What | Phase field | Gate |
|---|---|---|---|
| 1 | Session start and hard gate | — | — |
| 2 | Testable project setup | — | F2 (only if structure changes) |
| 3 | Design | `phase_design` | G3 |
| 4 | Build | `phase_build` | — |
| 5 | Validation and user verification | `phase_validation` | G4 |
| 6 | Close | `next: done` | — |

Planning belongs to `frontend-development-planner`. Each step ends in a recorded state, so each can run in its own session or be continued by a different agent; the artifacts, not the conversation, carry the context forward.

### 1. Session start and hard gate

1. Resolve `{root}` and run Discovery. Find the open task for the feature (feature `index.md` → `Open tasks`; `status.md` with `next` other than `done`). If several features have open tasks and the request doesn't say which, ask.
2. Run the contract's **Resume check**. Read `status.md`, `handoff.md` (if present), `intent.md`, `plan.md`, `validation.md`, `ux_design.md` (if any), the architecture document and UX spec linked from `plan.md` → `Scope`, and the feature's `spec.md` and as-built `ux_design.md` if they exist. Take `{feature}`, `{feature_name}`, and `{project_name}` from `status.md`.
3. Check the gate. All must hold:
   - `stack: swift` and `profiles` lists `frontend`;
   - `phase_intent` and `phase_plan` are `approved`, and `intent_revision` and `plan_revision` equal the documents' latest revisions;
   - `intent.md` passes the contract's **Intent validation** and `plan.md` passes **Plan completeness**, each with the profile's additions;
   - the architecture document and the UX spec exist;
   - when `phase_design` is not `skipped`: `{bundle}/project/design_system/lock.json` exists and the base is unmodified (`fpk info`), matching the base recorded in `plan.md` → `Design spec`.
4. **Gate not met** — including a direct request such as "update the UX of X" or "fix bug Y" with no approved plan: stop, tell the user what is missing, and tell them to run the `frontend-development-planner` skill. Do not plan and do not write code.
5. **Gate met**: resume at `next`: `Design` → step 3; `Build` → step 4 (requires `phase_design` `approved` or `skipped`); `Validation` → step 5; `Close` → step 6.

### 2. Testable project setup

Run once per task, before the first step that builds (step 4). The feature must be buildable, previewable, unit-testable, UI-testable, and launchable in isolation.
1. Look in `{root}` for an existing Xcode project, workspace, Swift package, or `project.yml`. If one exists, use it as-is and add new files to its targets; never overwrite it.
2. Check it has what the validation plan needs: a unit test target, a UI test target, a host app that can show the feature alone (the isolation harness in the plan), and a scheme that runs the tests. Missing pieces that the plan's work items cover are added in step 4; anything else is a structural change that needs approval (F2).
3. If no project exists, ask for approval (F2) to scaffold a minimal one with [`references/project_template.yml`](references/project_template.yml) (XcodeGen, MIT license; ask before installing it). Fill in `{project_name}`, `{bundle_prefix}`, `{ios_version}`, save as `{root}/project.yml`, then run `xcodegen generate`.
4. If the user declines, ask which build setup to use instead. If none is usable, record a `needs-human` blocker and set `phase_build: blocked`.

### 3. Design (`phase_design`) — part 2: the feature preview

Skip this step when `phase_design: skipped` — the planner and the user own that decision. Otherwise create `ux_design.md` in the task directory from the template plus the profile's sections, using `intent.md` (frontend inputs), the plan's feature model and design spec, the UX spec, and the as-built design. Cover:

- **Views and layout**: view hierarchy, spacing, alignment, and adaptive behavior across device sizes, orientations, and Dynamic Type sizes.
- **Tokens**: colors, typography, spacing, corner radii, and icons from the locked base (`project/design_system/tokens.css`) and the UX spec. Do not hardcode values. A token, component, or device the base lacks is a **base gap**: record it in `ux_design.md` → `Review log` and [revert to planning](#revert-to-planning) so the planner amends the base. Never edit `project/design_system/` here.
- **States**: every state the plan lists (default, loading, empty, error, disabled, selected, pressed/focused as applicable).
- **Interactions**: gestures, transitions, animations, haptics, and navigation. Respect Reduce Motion.
- **Appearance**: light/dark mode and localization, including right-to-left layouts and long strings.
- **Accessibility**: per the [Accessibility guardrails](#accessibility-a11y) — labels, traits, reading order, focus order, touch targets, and contrast.
- **Feature API**: inputs, outputs/callbacks, and bindings, matching the plan's feature API.

Then build the clickable preview with the `feature-preview-kit` skill (Phase B; follow its `SKILL.md` and references, and run its CLI with `--root {root}`; below, `fpk` = `node <feature-preview-kit dir>/scripts/fpk.js`) and get approval:

1. Run `fpk new {feature} --name "{feature_name}"` (the preview lives in `{bundle}/features/{feature}/preview/`; on a `change`, update the existing folder). Write `views.html` and `spec.json` for the plan's views, overlays, and states, plus `logic.js`/`feature.css` only when the kit's DSL and components can't cover it. Link the built `{feature}.html` from `ux_design.md` → `Prototype`, and list the preview in the feature `index.md`.
2. Run `fpk validate {feature}` until it prints OK, then `fpk build {feature}`. The build refuses a changed base.
3. Show every planned state in light and dark mode on the base's devices; use the kit's `fpk_walk` for the happy path, validation errors, overlays, and back navigation, and `fpk check {feature}` must print `UP TO DATE`.
4. Mirror the planned VoiceOver labels in the preview's visible labels and semantics.
5. Open and verify the preview yourself before presenting it. Then set `phase_design: in_review` and send the gate request with a clickable link — a Markdown link to the file's path plus the absolute `file://` URL.
6. Classify each piece of feedback in `ux_design.md` → `Review log`:
   - **Design revision** (within the approved intent and plan): set `phase_design: pending`, revise `ux_design.md` and the preview sources (new design revision), rebuild, and present again.
   - **Conflicts with the intent or plan** (new state, view, navigation, data, behaviour), or a base gap: [revert to planning](#revert-to-planning).
7. On explicit approval (G3): set `phase_design: approved`, `next: Build`; mark `ux_design.md` `status: stable` with a `verified` entry; add an `Approvals` row.
If the kit or Node is unavailable, record a `needs-human` blocker in `status.md` → `Blockers`, set `phase_build: blocked`, and stop.

### 4. Build (`phase_build: in_progress`)

Requires the hard gate of step 1 and `phase_design` `approved` or `skipped`. Set `phase_build: in_progress`, `next: Build`; on the first run record the `git` anchor.

1. **Track progress**: on the first run, add one `Progress` row per plan work item (`todo`). Work through items in plan order, dependencies first; set each row to `doing` with yourself as owner, then `done` with the files and evidence (run ID, and the commit when committed) before starting the next. On resume, continue at the first row that is not `done`.
2. **Build each work item** exactly as the `Module map` specifies (layer, single responsibility, allowed and forbidden dependencies). If the plan cannot be followed without deviating from it, [revert to planning](#revert-to-planning).
   - Views are previewable: a `#Preview` per planned state, using mocks from the plan's `Dependencies and injection` table.
   - Every dependency is injected; mocks and preview fixtures use synthetic data.
   - Wire the isolation harness the plan specifies so UI tests and verification can launch the feature alone.
3. **Lint, build, test** after each work item that changes code, and record each run in `validation.md` → `Run log`:
   - Run `swiftlint` or the workspace/repo-specific linter, and fix lint errors.
   - Build the target to verify the files are included and there are no errors or warnings.
   - Write the cases of the validation plan that the work item covers: `unit` cases with Swift Testing; `e2e` cases with XCUITest only for the listed critical flows and accessibility audits. Swift 6: mark XCUITest classes `@MainActor`; give interactive elements `accessibilityIdentifier`s. For a `bugfix`, the reproduction case must fail before the fix and pass after it. A work item is `done` only when its cases exist and pass.
   - Run tests via Xcode MCP or the CLI, using the commands in the architecture document. Never hardcode a simulator name; pick one from `xcrun simctl list devices available`:
     1. `xcodegen generate` (only if the project is XcodeGen-based)
     2. `xcodebuild build-for-testing -project {project}.xcodeproj -scheme {scheme} -destination 'platform=iOS Simulator,id={UDID}'` (macOS: `-destination 'platform=macOS'`)
     3. `xcodebuild test-without-building` with the same destination
4. **Decisions**: a choice made while building that a maintainer would later ask "why?" about is appended to `plan.md` → `Decisions` (phase `build`). A choice that would change the `Module map`, an interface, the data model, or a dependency is a plan conflict: [revert to planning](#revert-to-planning). When two sections of the plan contradict each other and one reading satisfies both without changing a listed row, take it and log a decision row naming both sections; otherwise revert. Something noticed that the plan does not cover and that does not stop the work item is a bullet in `status.md` → `Follow-ups`, never built unasked.
5. **Commits**: commit only if the user or the repository's rules ask for it; then make one commit per work item with `{task_id} W{n}` in the message.
6. When every work item is `done`, the build is clean, and all tests pass, set `phase_build: done`, `next: Validation`, and go to step 5.

#### Failures and errors

Record every build, lint, test, tooling, or environment failure that is not fixed on the first attempt in `status.md` → `Blockers`: step, redacted error excerpt, attempts, status, next action.
- Fix the root cause. Never delete or skip a test, weaken an assertion, disable a lint rule, or suppress a warning to get a pass.
- After three failed attempts at the same failure, or when it needs something only the user can provide (tooling install, signing, credentials, a missing simulator runtime), set its status `needs-human`, set `phase_build: blocked`, tell the user what is needed, and end the turn.
- When it is resolved, set its status `resolved` and `phase_build: in_progress`.
- A failure caused by the plan itself (wrong file, missing dependency, impossible requirement) is a plan conflict: [revert to planning](#revert-to-planning).
- Never report a step done with a failing build or failing tests.

### 5. Validation and user verification (`phase_validation`, gate G4)

1. Set `phase_validation: in_progress`. Run every automated case of the validation plan against the current code — the whole plan, not only the last work item's cases — and record each run in `Run log`. Fill `Results`, and tick every item of the plan's `Conformance checklist` in `validation.md` → `Conformance` with evidence (file › symbol). A failing case or an item that cannot be ticked is a `Defects` row: fix it under step 4 if the plan covers it, otherwise [revert to planning](#revert-to-planning).
2. Show the built feature running in isolation via the harness, in the states of the `manual` cases:
   - **iOS**: boot the chosen simulator (`xcrun simctl boot {UDID}`; `open -a Simulator`), build the host app for it (`xcodebuild build … -derivedDataPath {derived_data}`), install it (`xcrun simctl install {UDID} {app_path}`), and launch it with the harness arguments (`xcrun simctl launch {UDID} {bundle_id} {harness_args}`).
   - **macOS**: build with `-destination 'platform=macOS'` and open the app with the harness arguments (`open {app_path} --args {harness_args}`).
   - Capture a screenshot per state as `verification-{n}.png` in the task directory (iOS: `xcrun simctl io {UDID} screenshot {path}`).
   - If the app cannot be launched (no GUI session, missing runtime), record the blocker, share the screenshots or previews that are available, and say so.
3. Run the contract's **Validation completeness**, set `validation.md` → `result: passed` and `phase_validation: in_review`, and send the gate request: counts of cases passed, failed, and not run; the commands to run the feature and its tests; each `manual` case with its screenshot, for the user to verify and report — saying that an approval without a result accepts that case as `not run`; and any deviation, deferred defect, or follow-up.
4. Record each manual-case result the user reports as a `Run log` row with their actor, and update `Results`. Record every remark in `validation.md` → `Acceptance` and classify it as the contract's **Acceptance remarks** define:
   - **Defect within the plan** (a defect or polish the plan already covers): set `phase_build: in_progress`, fix it as a step 4 change, and validate again (next round).
   - **Conflicts with the intent, plan, or design**: [revert to planning](#revert-to-planning).
   - **New scope**: record it in `status.md` → `Follow-ups` for a new task; never add it to this one.
5. On explicit approval (G4): set `phase_validation: accepted`, mark `validation.md` `status: stable` with a `verified` entry, add an `Approvals` row, set `next: Close`, and go to step 6. A `manual` case the user gave no result for stays `not run`: say so in the `Approvals` note and add a `Follow-ups` bullet.

### 6. Close

1. Update the feature's `spec.md` as the contract's task-type table says (create it for a `create` task), with the profile's `Feature model` and `Preview` sections and, under `Interfaces and data`, the integration notes (what the host app must inject and where to wire the feature). Link each acceptance criterion to the case that proves it and add this task to `Source tasks`.
2. If a design was approved, write or merge the feature's as-built `ux_design.md`; the preview in `{bundle}/features/{feature}/preview/` is the living prototype.
3. Promote decisions: scope `feature` → `spec.md` → `Decisions`; scope `project` → `project/decisions.md`.
4. In `status.md`: rewrite the `Handoff note` as Delivered / Verified / Follow-ups, set `next: done` and `claim: none`. Set a remaining `handoff.md` to `deprecated`.
5. Update the feature `index.md` (move the task to `Closed tasks`, list new documents) and add a `**Completion**` entry to its `log.md`.
6. Run the contract's **Close checklist**. Do not edit the task directory afterwards; a new request starts a new task via `frontend-development-planner`.
7. Finish by giving the user clickable links to `status.md`, `validation.md`, and `spec.md`, and a three-line summary (what was built, test result, verification result).

### Revert to planning

Used whenever user input, a design review, a failure, or verification feedback conflicts with the approved intent, plan, or design:
1. Add a `Reverts` row in `status.md` (trigger, and the document › section it conflicts with).
2. Set `phase_plan: reverted` and `next: Plan` (when the intent itself is what conflicts, also `phase_intent: reverted` and `next: Intent`); set `phase_design: reverted` if the design phase was active; leave `phase_build` and its progress rows as they are.
3. Add a `**Revert**` entry to the feature `log.md`.
4. Run the contract's **Session end**, stop, tell the user why, and tell them to run `frontend-development-planner`. Do not change code toward the conflicting input.
