---
name: swift-frontend-programming
description: Guideline for designing, building, and testing isolated, injectable iOS/macOS frontend features (a.k.a. components) in Swift (SwiftUI/UIKit) with Swift Testing, XCTest and XCUITest, from an approved plan. Use this skill when generating or modifying Swift frontend code, feature previews, or tests for a planned feature, change, or bugfix. Requires an approved plan from frontend-development-planner; reverts to it when later input conflicts with the plan. DO NOT use this for planning or non-frontend development.
---

# Swift Skill for iOS and Mac Frontend Development

## Purpose
Design, generate, and test efficient, secure, and performance-optimized Swift features for iOS and macOS from an approved intent and plan. Each feature is built in isolation — every view, model, view model, coordinator, and service is injected and mockable — so it can be previewed and tested alone and integrated into the main app later.

**Scope**: testable project setup, feature design, development, test, user verification, and the final report. Planning, `intent.md`, `plan.md`, the repo-wide UX design specification, and the architecture/design pattern are owned by the `frontend-development-planner` skill; this skill consumes them and never plans on its own.

**Sources of truth**: the approved `intent.md` and `plan.md` (current revision), then the approved `design.md`. User input that conflicts with them is never applied silently — revert to planning (see [Revert to planning](#revert-to-planning)).

## Context root (`{root}`)

`{root}` is the agent's closest context directory, and may be nested (repo root, sub-repo/package root, or workspace/project root).
- Start from the path of the file/module being worked on (or the working directory if none) and walk up to the nearest directory containing `project.yml`, `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, or `.git`. That is `{root}`.
- If the open change's `status.md` → `root` names a different directory, use that one. If still ambiguous, ask the user.

## Terminology

"Feature" is the unit of work formerly called "component"; requests that say "component" mean the same thing. Read legacy `component:` keys, `{component_name}/` directories, and `{component_name}_*.md` files as the feature's; write the feature names (see the contract's **Terminology and compatibility**).

## Knowledge discovery

`{root}/.agentic_coding/` is an OKF knowledge bundle covering the architecture and every feature's baseline and changes. Start every session with the contract's **Discovery** steps (bundle `index.md` → feature `index.md` → linked documents). Keep the indexes and logs current in the same step that changes a document.

## Approval policy (applies to every step)

Do not move past a gate without explicit user approval, unless the user explicitly says to proceed without asking (e.g., "auto-approve", "don't ask"). Record every gate decision in `status.md` → `Approvals`.
- Gates: **D1** project setup that creates or changes project structure (step 2); **D2** feature preview built on the locked design-system base (step 3); **D3** user verification of the built feature (step 5).
- A needed third-party dependency, file, or behaviour that the approved plan does not contain is a plan conflict, not a gate: revert to planning.
- Non-interactive session: follow the contract's non-interactive rule (pending `Approvals` row, phase `in_review`, end the turn). Do not assume and continue.
- Auto-approve: follow the contract's auto-approve rule.
- Never invent external references (URLs, video/document IDs, API endpoints, package names). Ask the user, or use clearly marked placeholders.

## Artifacts

Layout, phases, ownership, validation, and security rules are in [`references/change_artifacts.md`](references/change_artifacts.md); templates are in [`references/artifact_templates.md`](references/artifact_templates.md). Follow both exactly. This skill writes only:
- in the change directory: `status.md` (`phase_design`, `phase_dev`, `next`, and its design/dev sections; `phase_plan: reverted` only), `design.md`, verification screenshots, and `report.md`;
- the feature preview in `{root}/.agentic_coding/feature/{feature_slug}/` (`{feature_slug}` = kebab-case `{feature_name}`), through the `feature-preview-kit` skill (Phase B); never the design-system base in `{root}/.agentic_coding/base/`;
- source and test files, prefixed with `{feature_name}` (e.g. `{feature_name}View.swift`), placed per the plan's `Architecture mapping`;
- at completion: the baseline `{feature_name}_intent.md`, `{feature_name}_design.md`, and the feature's `index.md` and `log.md`.

It never edits `intent.md` or `plan.md`.

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
- **Consistent architecture pattern**: apply the pattern in `design_and_architecture_patterns.md` (MVVM, TCA, etc.) uniformly, per the plan's `Architecture mapping` — avoid massive view controllers/views mixing business logic and UI.
- **Isolated features**: every dependency in the plan's `Dependencies and injection` table is a protocol with a live implementation and a mock; views, view models, coordinators, and services receive dependencies through their initializers (or `@Environment`) so each can be previewed, tested, and integrated without the rest of the app.
- **State per the plan's feature model**: inputs immutable (`let`) or `@Binding`; internal state `private(set)` with a single owner; outputs as callbacks.
- **Dependency injection over singletons** for testability, except where a singleton is genuinely justified (e.g., `URLSession.shared`).
- **Access control discipline** — default to `private`/`fileprivate`; only expose what's needed (`public`/`open` used deliberately, especially in frameworks).

### Testing & CI
- **Unit tests required for business logic and view models**, not just UI smoke tests.
- **SwiftLint (or equivalent) enforced in CI**, not just locally.
- **No compiler warnings tolerated** — treat warnings as errors in CI builds.
- **UI tests for critical flows** (auth, checkout, core navigation) and accessibility audits, as listed in the plan's test spec.

### Performance
- **Avoid retain-heavy patterns in SwiftUI** — unnecessary `@State`/`@Published` triggering re-renders.
- **Profile with Instruments** for memory leaks and main-thread hangs before shipping, especially on lists/scroll views with images.
- **Lazy-load images and heavy views** (`LazyVStack`/`LazyHStack`/`List`, proper cell reuse in `UITableView`/`UICollectionView`) as the plan's performance section specifies.

### Localization
- **All user-facing strings must be localizable**: use `Text("literal")`/`LocalizedStringKey`, `String(localized:)`, and a String Catalog (`Localizable.xcstrings`) — no hardcoded display strings built by concatenation; use interpolation/plural variations.
- Format dates, numbers, and units with locale-aware formatters (`FormatStyle`, `Measurement`); never hand-format.
- Use leading/trailing (not left/right) alignment and padding so right-to-left layouts work; verify long strings do not truncate.
- Add accessibility labels as localized strings too.
- Provide `.xcstrings` entries for every language in the intent's localization languages (default: development language only).

## Other coding guideline

- **Reusable coding**: reuse or extract the shared features listed in the plan's `Existing work`.
- **Lite and minimal coding**: Use inline functions, macros, and function chaining to write minimal code. Use `filter`, `map`, and `reduce` to process collections. Prefer system frameworks/libraries over custom implementations where possible.

## Workflow

| Step | What | Phase field | Gate |
|---|---|---|---|
| 1 | Session start and hard gate | — | — |
| 2 | Testable project setup | — | D1 (only if structure changes) |
| 3 | Design | `phase_design` | D2 |
| 4 | Development and test | `phase_dev: in_progress` | — |
| 5 | User verification | `phase_dev: in_review` | D3 |
| 6 | Report and completion | `phase_dev: done` | — |

Planning belongs to `frontend-development-planner`. Each step ends in a recorded state, so each can run in its own session; the artifacts, not the conversation, carry the context forward.

### 1. Session start and hard gate

1. Resolve `{root}` and run Discovery. Find the open change for the feature (feature `index.md` → `Open change`; `status.md` with `next` other than `done`). If several features have open changes and the request doesn't say which, ask.
2. Read `status.md`, `intent.md`, `plan.md`, `design.md` (if any), the architecture document and UX spec linked from `plan.md` → `Scope`, and the baseline intent and design if they exist. Take `{feature_name}` and `{project_name}` from `status.md`.
3. Check the gate. All must hold:
   - `stack: swift`;
   - `phase_plan: approved` and `plan_revision` equals the plan's latest `Change tracker` revision;
   - `intent.md` passes the contract's **Intent validation** and `plan.md` passes **Plan completeness**;
   - the architecture document and the UX spec exist;
   - when `phase_design` is not `skipped`: `{root}/.agentic_coding/base/lock.json` exists and the base is unmodified (`fpk info`), matching the base recorded in `plan.md` → `Design spec`.
4. **Gate not met** — including a direct request such as "update the UX of X" or "fix bug Y" with no approved plan: stop, tell the user what is missing, and tell them to run the `frontend-development-planner` skill. Do not plan and do not write code.
5. **Gate met**: re-check `Development progress` rows against the current plan revision (contract → re-approval rule), then resume at `next`: `Design` → step 3; `Development` → step 4 (requires `phase_design` `approved` or `skipped`); `Verification` → step 5.

### 2. Testable project setup

Run once per change, before the first step that builds (step 4). The feature must be buildable, previewable, unit-testable, UI-testable, and launchable in isolation.
1. Look in `{root}` for an existing Xcode project, workspace, Swift package, or `project.yml`. If one exists, use it as-is and add new files to its targets; never overwrite it.
2. Check it has what the plan's test spec needs: a unit test target, a UI test target, a host app that can show the feature alone (the isolation harness in the plan), and a scheme that runs the tests. Missing pieces that the plan maps are added in step 4; anything else is a structural change that needs approval (D1).
3. If no project exists, ask for approval (D1) to scaffold a minimal one with [`references/project_template.yml`](references/project_template.yml) (XcodeGen, MIT license; ask before installing it). Fill in `{project_name}`, `{bundle_prefix}`, `{ios_version}`, save as `{root}/project.yml`, then run `xcodegen generate`.
4. If the user declines, ask which build setup to use instead. If none is usable, record a `needs-user` failure and set `phase_dev: blocked`.

### 3. Design (`phase_design`) — part 2: the feature preview

Skip this step when `phase_design: skipped` — the planner and the user own that decision. Otherwise create `design.md` (template) in the change directory from `intent.md` (design inputs), the plan's feature model and design spec, the UX spec, and the baseline design. Cover:

- **Layout and structure**: view hierarchy, spacing, alignment, and adaptive behavior across device sizes, orientations, and Dynamic Type sizes.
- **Design tokens**: colors, typography, spacing, corner radii, and icons from the locked base (`base/tokens.css`) and the UX spec. Do not hardcode values. A token, component, or device the base lacks is a **base gap**: record it in `design.md` → `Review log` and [revert to planning](#revert-to-planning) so the planner amends the base. Never edit `base/` here.
- **States**: every state the plan lists (default, loading, empty, error, disabled, selected, pressed/focused as applicable).
- **Interactions**: gestures, transitions, animations, haptics, and navigation. Respect Reduce Motion.
- **Appearance**: light/dark mode and localization, including right-to-left layouts and long strings.
- **Accessibility**: per the [Accessibility guardrails](#accessibility-a11y) — labels, traits, reading order, focus order, touch targets, and contrast.
- **Feature API**: inputs, outputs/callbacks, and bindings, matching the plan's feature API.

Then build the clickable preview with the `feature-preview-kit` skill (Phase B; follow its `SKILL.md` and references, and run its CLI with `--root {root}`; below, `fpk` = `node <feature-preview-kit dir>/scripts/fpk.js`) and get approval:

1. Run `fpk new {feature_slug} --name "{feature_name}"` (the preview lives in `{root}/.agentic_coding/feature/{feature_slug}/`; on a `change`, update the existing folder). Write `views.html` and `spec.json` for the plan's views, overlays, and states, plus `logic.js`/`feature.css` only when the kit's DSL and components can't cover it. Link the built `{feature_slug}.html` from `design.md` → `Prototype`; list `design.md` in the feature `index.md`.
2. Run `fpk validate {feature_slug}` until it prints OK, then `fpk build {feature_slug}`. The build refuses a changed base.
3. Show every planned state in light and dark mode on the base's devices; use the kit's `fpk_walk` for the happy path, validation errors, overlays, and back navigation, and `fpk check {feature_slug}` must print `UP TO DATE`.
4. Mirror the planned VoiceOver labels in the preview's visible labels and semantics.
5. Open and verify the preview yourself before presenting it. Then set `phase_design: in_review` and give the user a clickable link in the chat — a Markdown link to the file's path plus the absolute `file://` URL.
6. Classify each piece of feedback in `design.md` → `Review log`:
   - **Design revision** (within the approved intent and plan): set `phase_design: pending`, revise `design.md` and the preview sources (new design revision), rebuild, and present again.
   - **Conflicts with the intent or plan** (new state, view, navigation, data, behaviour), or a base gap: [revert to planning](#revert-to-planning).
7. On explicit approval (D2): set `phase_design: approved`, `next: Development`; mark `design.md` `status: stable` with a `verified` entry; add an `Approvals` row.
If the kit or Node is unavailable, record a `needs-user` failure in `status.md` → `Failures and blockers`, set `phase_dev: blocked`, and stop.

### 4. Development and test (`phase_dev: in_progress`)

Requires `phase_plan: approved` and `phase_design` `approved` or `skipped`. Set `phase_dev: in_progress`, `next: Development`.

1. **Track progress**: on the first run, add one `Development progress` row per plan work item (`todo`). Work through items in plan order; set each row to `doing`, then `done` with the files and evidence (build, test ID) before starting the next. On resume, continue at the first row that is not `done`.
2. **Build each work item** exactly as the `Architecture mapping` specifies (layer, allowed and forbidden dependencies). If the plan cannot be followed without deviating from it, [revert to planning](#revert-to-planning).
   - Views are previewable: a `#Preview` per planned state, using mocks from the plan's injection table.
   - Every dependency is injected; mocks and preview fixtures use synthetic data.
   - Wire the isolation harness the plan specifies so UI tests and verification can launch the feature alone.
3. **Lint, build, test** after each work item that changes code, and record each run in `Build and test runs`:
   - Run `swiftlint` or the workspace/repo-specific linter, and fix lint errors.
   - Build the target to verify the files are included and there are no errors or warnings.
   - Write the tests from the plan's test spec: unit tests with Swift Testing; XCUITests only for the listed critical flows and accessibility audits. Swift 6: mark XCUITest classes `@MainActor`; give interactive elements `accessibilityIdentifier`s. For a `bugfix`, the regression test must fail before the fix and pass after it.
   - Run tests via Xcode MCP or the CLI. Never hardcode a simulator name; pick one from `xcrun simctl list devices available`:
     1. `xcodegen generate` (only if the project is XcodeGen-based)
     2. `xcodebuild build-for-testing -project {project}.xcodeproj -scheme {scheme} -destination 'platform=iOS Simulator,id={UDID}'` (macOS: `-destination 'platform=macOS'`)
     3. `xcodebuild test-without-building` with the same destination
4. **Conformance**: tick every item of the plan's `Conformance checklist` in `status.md` → `Conformance` with evidence (file › symbol). An item that cannot be ticked is a deviation: fix the code, or [revert to planning](#revert-to-planning).
5. When every work item is `done`, the build is clean, and all tests pass, set `next: Verification` and go to step 5.

#### Failures and errors

Record every build, lint, test, tooling, or environment failure that is not fixed on the first attempt in `status.md` → `Failures and blockers`: step, redacted error excerpt, attempts, status, next action.
- Fix the root cause. Never delete or skip a test, weaken an assertion, disable a lint rule, or suppress a warning to get a pass.
- After three failed attempts at the same failure, or when it needs something only the user can provide (tooling install, signing, credentials, a missing simulator runtime), set its status `needs-user`, set `phase_dev: blocked`, tell the user what is needed, and end the turn.
- When it is resolved, set its status `resolved` and `phase_dev: in_progress`.
- A failure caused by the plan itself (wrong file, missing dependency, impossible requirement) is a plan conflict: [revert to planning](#revert-to-planning).
- Never report a step done with a failing build or failing tests.

### 5. User verification (`phase_dev: in_review`, gate D3)

1. Show the built feature running in isolation via the harness, in the plan's verification states:
   - **iOS**: boot the chosen simulator (`xcrun simctl boot {UDID}`; `open -a Simulator`), build the host app for it (`xcodebuild build … -derivedDataPath {derived_data}`), install it (`xcrun simctl install {UDID} {app_path}`), and launch it with the harness arguments (`xcrun simctl launch {UDID} {bundle_id} {harness_args}`).
   - **macOS**: build with `-destination 'platform=macOS'` and open the app with the harness arguments (`open {app_path} --args {harness_args}`).
   - Capture a screenshot per state as `verification-{n}.png` in the change directory (iOS: `xcrun simctl io {UDID} screenshot {path}`).
   - If the app cannot be launched (no GUI session, missing runtime), record the failure, share the screenshots or previews that are available, and say so.
2. Set `phase_dev: in_review` and ask the user to verify. Record every remark in `status.md` → `User verification`.
3. Classify each remark:
   - **Within the plan** (defect or polish the plan already covers): set `phase_dev: in_progress`, fix it as a step 4 change, and verify again (next round).
   - **Conflicts with the intent, plan, or design**: [revert to planning](#revert-to-planning).
4. On explicit approval (D3): add an `Approvals` row and go to step 6.

### 6. Report and completion

1. Write `report.md` in the change directory from the template: summary, delivered files, test results, acceptance criteria with evidence, conformance, user verification remarks and resolutions, failures and resolutions, integration notes (what the host app must inject and where to wire the feature), and follow-ups.
2. Update the baselines:
   - merge `intent.md` into `{feature_name}_intent.md` (create it for a `feature`), following the contract's task-type table;
   - if a design was approved, merge `design.md` into `{feature_name}_design.md`; the preview in `{root}/.agentic_coding/feature/{feature_slug}/` is the baseline prototype;
   - add this change to each baseline's `Source changes`; set `status: stable`.
3. Update the feature `index.md` (move the change to `Completed changes`, list new baseline documents) and add a `**Completion**` entry to its `log.md`.
4. Set `phase_dev: done` and `next: done` in `status.md`. Do not edit the change directory afterwards; a new request starts a new change via `frontend-development-planner`.
5. The report is the handoff: finish by giving the user the report's clickable link and a three-line summary (what was built, test result, verification result).

### Revert to planning

Used whenever user input, a design review, a failure, or verification feedback conflicts with the approved intent, plan, or design:
1. Add a `Reverts` row in `status.md` (trigger, and the document › section it conflicts with).
2. Set `phase_plan: reverted` and `next: Plan`; set `phase_design: reverted` if the design phase was active; leave `phase_dev` and its progress rows as they are.
3. Add a `**Revert**` entry to the feature `log.md`.
4. Stop, tell the user why, and tell them to run `frontend-development-planner`. Do not change code toward the conflicting input.
