# AGENTS.md

`devmitra-ai-plugin` is an **AI-artifact development workspace**: it is where reusable AI artifacts — coding-guideline skills, agent rules, and the plugin manifest — are authored, tested, and maintained for Claude Code, GitHub Copilot, Codex, Cursor, and other agents that read `AGENTS.md`. The product here is the artifact, not an app; any app code an agent writes in this repo exists only to test an artifact (see "Testing skills and other artifacts").

**This file is the source of truth for how agents work in this repository** (layout, authoring, testing, commits). **Each `skills/<name>/SKILL.md` is the source of truth for that skill's own behavior** (gates, workflow, artifact layout); it is a shipped product and must stay self-contained. When a skill is being tested, its `SKILL.md` and `references/` are the only guidance applied — not the matching section below.

---

## Role

- **Workspace role**: AI-artifact engineer — author, review, and test skills and rules so they are precise, minimal, non-ambiguous, and safe to run unattended (every approval gate has a defined behavior when the user cannot be asked).
- **Domain role** (for the artifacts' subject matter): Staff-level software engineer with deep knowledge of the skill's stack. Currently consumer-facing application development — iOS native, Android native, Web (React, Angular, Vue, CSS), Flutter, React-native — and expected to grow to backend and tooling stacks (e.g. Node, Python). Each skill section below may narrow this.

## Repository layout

| Path | Purpose |
|---|---|
| `AGENTS.md` | Source of truth for agent behavior in this repo; cross-agent guidance for AGENTS.md-based agents |
| `skills/feature-preview-kit/` | Shared preview skill: builds the repo/workspace design-system base and feature-specific clickable previews (CLI `scripts/fpk.js`) |
| `skills/<name>/SKILL.md` (one programming skill per language/stack, e.g. `swift-frontend-programming`, plus the stack-agnostic `frontend-development-planner`) | Canonical Claude Code skill (frontmatter `name` + trigger-oriented `description`), with `references/` for templates and guides |
| `plugin.json` | Plugin manifest (single source); `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` are symlinks to it — never fork them |
| `.claude-plugin/marketplace.json` | Claude Code marketplace entry |
| `.cursor/rules/<name>.mdc` | Cursor rule for each skill |
| `.test/` | Gitignored sandbox for skill trials (see "Testing skills and other artifacts") |

## Skill catalog

| Skill | Applies to | Section |
|---|---|---|
| `frontend-development-planner` | planning requests for any frontend stack (no file pattern) | Frontend Development Planner Guidelines |
| `feature-preview-kit` | design-system base and feature previews, used by the planner (base) and programming skills (previews) | Feature previews and design-system base |
| `swift-frontend-programming` | `**/*.swift` | Swift Frontend Programming Guidelines |
| _future: React, Node, Python_ | e.g. `**/*.tsx`, `**/*.js`, `**/*.py` | _add per "Adding a skill for a new stack"_ |

## Working in this repository

- **Terminology**: "feature" replaces "component" as the unit of work; requests, keys, directories, and files using the old name remain readable (see the contract's *Terminology and compatibility*). The OKF `type` strings are unchanged.

- **Adding or changing a skill**: edit `skills/<name>/SKILL.md` and its `references/`, then keep the matching section in this file and `.cursor/rules/<name>.mdc` consistent with it. Each skill section here is scoped to a file pattern — apply it only when editing or generating matching files.
- **Adding a skill for a new stack** (React, Node, Python, …):
  1. Create `skills/<stack>-<area>-programming/SKILL.md` + `references/`; the skill must be self-contained and must not mention other stacks. Copy `references/change_artifacts.md` and `references/artifact_templates.md` from the planner unchanged, gate design/development on an approved plan from `frontend-development-planner`, and revert to it when later input conflicts with the plan.
  2. Add `skills/frontend-development-planner/references/stacks/<stack>.md` (Detection, Project name, UX spec hints, Plan hints, How to use, Catalog, Decision guide, Output template with Conformance rules) and a row to the planner's Stack detection table. The planner is the only skill that may mention several stacks, and only in that table and its `stacks/` files.
  3. Add one section below, headed `## <Stack> <Area> Guidelines`, with an `**Applies to:**` file pattern (e.g. `**/*.tsx`, `**/*.py`) and its guardrails, using the same category headings as other sections where they apply (security, errors, logging, testing, performance, accessibility, localization) so sections stay comparable. Omit categories that don't fit the stack.
  4. Add the `.cursor/rules/<name>.mdc` and a row to the Skill catalog above.
  5. Keep stack-specific tooling (linters, test runners, project scaffolding) inside that skill's section and references — never in the generic sections of this file.
- **Parity**: guidance must be equivalent across Claude Code, AGENTS.md-based agents, and Cursor. Do not let one drift.
- **Handoff contract**: every copy of `references/change_artifacts.md` and `references/artifact_templates.md` (planner and each programming skill) must be byte-identical; change them together and verify with `diff`.
- **Skill quality bar**: each rule is a checkable instruction (not advice); templates are validated by actually using them (generate, build, run); every reference file is linked from `SKILL.md`; no invented URLs, IDs, or package names.
- **Manifest**: bump `version` in `plugin.json` for user-visible skill changes; do not edit the symlinks.
- **Never touch repo files while testing an artifact** — test output lives under `.test/` only.
- **Commits**: only when asked; follow the attribution lines supplied by the harness.

---

## Frontend Development Planner Guidelines

**Applies to:** any request to plan, scope, or structure a frontend feature, change, or bugfix, or to choose/document an architecture or design pattern — for every frontend stack. No source, prototype, or test files are written in this phase.

Planning and architecture/design-pattern enforcement live in [`skills/frontend-development-planner/SKILL.md`](skills/frontend-development-planner/SKILL.md); stack specifics live in its `references/stacks/<stack>.md`. The guardrails below are the AGENTS.md-facing copy; the skill wins if the two differ.

### Scope & approvals

- **Output**: a change directory under `{root}/.agentic_coding/{feature_name}/changes/` with `status.md`, `intent.md`, `plan.md` (`phase_plan: approved`), per [`references/change_artifacts.md`](skills/frontend-development-planner/references/change_artifacts.md) and the templates in [`references/artifact_templates.md`](skills/frontend-development-planner/references/artifact_templates.md).
- **Knowledge bundle**: `{root}/.agentic_coding/` is an [OKF v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md) bundle; start every session from its `index.md` and keep `index.md`/`log.md` current in the same step that changes a document.
- **Ownership**: the planner alone writes `intent.md` and `plan.md`; every edit adds a `Change tracker` row. `status.md` holds phase state (`phase_plan`, `phase_design`, `phase_dev`), approvals, and progress.
- **Derive before asking**: stack (repo markers + task context), project name (stack guide sources), and inputs (repo, baseline, UX spec), recording each input's source; propose a feature name for approval when none is given.
- **Track**: `lite` only for a small `change`/`bugfix` meeting the contract's lite conditions, approved by the user; otherwise `full`.
- **Re-entry**: on a revert or re-plan, turn each trigger into a `plan.md` → `Open questions` entry and resolve all of them with the user before editing the plan.
- **Repo-wide prerequisites (owned by the planner)**:
  - Design-system base: a locked `{root}/.agentic_coding/base/` built with `feature-preview-kit` Phase A (reuse if locked; otherwise the user chooses set-up or neutral kit); planning cannot be approved without it. Nested `{root}` (monorepo workspaces) each own a base; nearest wins.
  - UX design specification: the nearest repo spec (`DESIGN.md`, `docs/design*`, theme module) takes precedence; otherwise create `{root}/.design/{project_name}_design_specification.md` from [`references/ux_design_specification_template.md`](skills/frontend-development-planner/references/ux_design_specification_template.md).
  - Architecture: the repo document takes precedence; otherwise detect or select a pattern via the stack guide and save `{root}/.agentic_coding/design_and_architecture_patterns.md`, including conformance rules.
- **Approvals**: feature name and intent, UX spec, architecture document, plan (including the design-phase decision), and any new third-party dependency need explicit user approval unless the user says to proceed without asking. If the user can't be asked, record a pending `Approvals` row and the open question, and stop.
- **Plan completeness**: the intent passes validation, no open question remains, every acceptance criterion maps to a work item and a test.
- No stack guide for the detected stack → stop and ask; never plan without one.

### Architecture & maintainability

- Every planned file has exactly one layer/role in the plan's `Architecture mapping`, with allowed and forbidden dependencies.
- No mapping row may break the documented dependency direction; don't mix a new pattern into a module that follows another.
- Dependency injection over singletons; a new singleton or global state needs a written justification.
- Access control discipline — plan the minimal public surface.
- The plan's `Conformance checklist` lists every applicable conformance rule; the programming skill must tick it before reporting.
- A requirement that can't be met within the pattern is surfaced to the user as a decision — never a silent deviation.

### Other plan-time guidelines

- **Feature model**: views, navigation, interactions, and every state's kind (input/output/internal), owner, mutability, and reactivity.
- **Isolation**: every view, view model, coordinator, and service is injected and has a mock, so the feature can be previewed and tested alone.
- **Security and privacy**: classify handled data; plan secure storage/transport, no secrets in source or artifacts, private-by-default logging, and required permission/privacy declarations.
- **Accessibility**: plan labels, traits, reading order, scalable text, touch targets, contrast, and reduced motion.
- **Reuse**: reuse existing components; plan extraction when functionality already exists elsewhere.
- **Performance**: plan lazy/virtualized rendering for long, data-driven, or image-bearing lists; record the choice for short fixed content.
- **Localization**: flag development-language-only scope when no languages are requested.
- **Testing**: plan unit tests for business logic and view models; UI tests only for critical flows.

---

## Swift Frontend Programming Guidelines (iOS / macOS)

**Applies to:** `**/*.swift`

Guardrails for iOS/macOS frontend development in Swift, SwiftUI/UIKit, and associated Swift Testing/XCTest/XCUITest code. Detailed design/development/test workflow lives in [`skills/swift-frontend-programming/SKILL.md`](skills/swift-frontend-programming/SKILL.md); planning, the UX spec, and the architecture document come from Frontend Development Planner Guidelines above; the guardrails below are the AGENTS.md-facing copy for agents that don't load skills, and the skill wins if the two differ.

### Scope, context root & approvals

- **Scope**: develop isolated, injectable features and views that can be previewed, tested, and launched alone, then integrated into the main app. Ensure a testable project (unit and UI test targets, isolation harness); scaffold one only when none exists, with user approval (XcodeGen template: [`references/project_template.yml`](skills/swift-frontend-programming/references/project_template.yml)).
- **Sources of truth**: approved `intent.md` > `plan.md` > `design.md`. Never edit `intent.md`/`plan.md`; input that conflicts with them reverts the change to planning (`phase_plan: reverted`, `Reverts` row, stop).
- **Root (`{root}`)**: the agent's closest context directory (nearest ancestor of the working path containing `project.yml`, `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, or `.git`); may be nested. Read existing design/architecture docs from `{root}` upward; write new artifacts at the nearest `{root}` under `.design/` and `.agentic_coding/` (committed by default; the user may gitignore them).
- **Hard gate**: design or code only for a change whose `status.md` has `stack: swift` and `phase_plan: approved` for the plan's latest revision, with a valid intent and complete plan; otherwise stop and run the planner first.
- **Phases**: design (`design.md` in the change directory plus a `feature-preview-kit` Phase B preview in `.agentic_coding/feature/{feature_slug}/` built on the locked base, never editing the base; a base gap reverts to planning; feedback within the plan is revised, conflicting feedback reverts), development (progress tracked per plan work item in `status.md`), user verification on a simulator or Mac window with remarks recorded, then `report.md` as the handoff. Baselines update only at completion.
- **Failures**: record unresolved build/test/tooling failures in `status.md` → `Failures and blockers`; never skip tests or suppress warnings to pass; after three attempts or when user action is needed, set `phase_dev: blocked` and stop.
- **Approvals**: do not advance past project scaffolding, the feature preview, or user verification without explicit user approval (a dependency not in the plan is a plan conflict) — unless the user explicitly says to proceed without asking. If the user can't be asked, stop and record the pending question; never assume. In auto-approve mode, log every assumption.
- Never invent URLs, video/document IDs, endpoints, or package names — ask or use marked placeholders.
- When presenting a feature preview, verify it yourself first, then give the user a clickable link in chat (relative Markdown link + absolute `file://` URL).

### Naming convention

Follow repo-specific naming conventions if they exist; otherwise follow the [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/).

### Third-party libraries

Use only the third-party libraries named in the approved plan (the planner vets vulnerabilities and permissive licensing — Apache, MIT, BSD, etc. — and gets approval). Any other library is a plan conflict: revert to planning.

### Secure coding

- Do not expose sensitive, secret, or private information in code. Inject such information via proper configuration.
- Sanitize/escape all user-generated content before rendering.
- `Info.plist` usage descriptions for every permission; `PrivacyInfo.xcprivacy` entries for required-reason APIs or data collection.
- No secrets, personal data, or real user content in previews, fixtures, screenshots, logs, or `.agentic_coding/` artifacts.

### Accessibility (a11y)

- Semantic UI first: standard controls before custom accessibility code; modifiers describe, never patch, the UI.
- VoiceOver: localized `accessibilityLabel` (plus hint/value where useful), correct traits, decorative images hidden, grouping and reading order set.
- Dynamic Type: text styles only, `@ScaledMetric` for scaling metrics, no clipping up to accessibility sizes.
- Touch targets at least 44x44 pt; WCAG AA contrast in light and dark mode; respect Increase Contrast and Differentiate Without Color.
- Respect Reduce Motion and Reduce Transparency.
- Keyboard: Full Keyboard Access (iOS) / key view loop (macOS), `@FocusState`, Escape dismisses modals; Voice Control labels match visible text.
- Automated `performAccessibilityAudit()` in a UI test per new view, plus manual Accessibility Inspector/VoiceOver checks.

### Memory & safety

- Avoid force-unwrapping (`!`) in production code — use `guard let`/`if let`, or `??` with sensible defaults. Reserve force-unwraps for cases with a provable invariant.
- No force-casts (`as!`) — prefer `as?` with explicit handling of the failure case.
- Avoid retain cycles — use `[weak self]` / `[unowned self]` in closures, especially in async callbacks, delegates, and Combine/async streams.
- Avoid implicitly unwrapped optionals (`!` in declarations) except for well-justified cases (e.g., `@IBOutlet`s configured before use).
- For closures, confirm variable availability before use inside the closure via `guard let`/`if let`.
- Clean up closures as soon as their functional scope is over.

### Concurrency

- Use Swift Concurrency (`async/await`, actors) correctly — avoid mixing GCD and structured concurrency without clear boundaries.
- Mark UI-mutating code `@MainActor` — never touch UI from a background thread.
- Guard shared mutable state with actors, not manual locks/queues, where possible.
- Handle task cancellation explicitly in long-running `Task`s (`Task.isCancelled` or `withTaskCancellationHandler`).
- No data races — enable Swift 6 strict concurrency checking where feasible.

### Error handling

- No silent `catch {}` blocks — every caught error should be logged, surfaced, or explicitly justified as ignorable.
- Use typed/domain errors (`enum: Error`) rather than generic `NSError` or `String`-based errors.
- Don't use exceptions/`fatalError` for recoverable conditions — reserve `fatalError`/`precondition` for truly unrecoverable programmer errors.

### Logging

Check whether a centralized logging framework is already in use. If not, use the minimal OSLog wrapper in [`skills/swift-frontend-programming/references/logging.md`](skills/swift-frontend-programming/references/logging.md) (Swift 6 clean).

- Never expose secret, sensitive, or private information in logs — use OSLog `privacy: .private` by default, or mask it.
- Log errors/exceptions with full detail.
- Warning level for unexpected behavior or input.
- Info level for major events/checkpoints/milestones.
- Debug level for debugging only — disabled in production builds.
- Each log level independently enable/disable-able.

### API & data handling

- Validate and sanitize server responses — don't force-decode JSON; use `Codable` with proper optional/failable handling.
- No hardcoded secrets/API keys in source — use Keychain or build-time injection, not plist/config files committed to source control.
- Use Keychain for sensitive data, never `UserDefaults`.
- Certificate/App Transport Security compliance — no arbitrary loads over HTTP without explicit, justified exceptions.

### Architecture & maintainability

- Apply the pattern in `design_and_architecture_patterns.md` uniformly, placing each file per the plan's `Architecture mapping`; tick each `Conformance checklist` item in `status.md` → `Conformance` with evidence before verification — avoid massive view controllers/views mixing business logic and UI.
- Isolated components: every dependency is a protocol with a live implementation and a mock, injected via initializer or `@Environment`; a `#Preview` per planned state.
- State per the plan: inputs `let`/`@Binding`, internal state `private(set)` with one owner, outputs as callbacks.
- Dependency injection over singletons for testability, except where a singleton is genuinely justified (e.g., `URLSession.shared`).
- Access control discipline — default to `private`/`fileprivate`; expose only what's needed.

### Testing & CI

- Unit tests required for business logic and view models, not just UI smoke tests.
- SwiftLint (or equivalent) enforced in CI, not just locally.
- No compiler warnings tolerated — treat warnings as errors in CI builds.
- UI tests for critical flows (auth, checkout, core navigation); keep them few — they are slow.
- Never hardcode a simulator name — pick one from `xcrun simctl list devices available`. Run `xcodebuild build-for-testing` then `test-without-building` with `-destination 'platform=iOS Simulator,id={UDID}'`.
- Swift 6: mark XCUITest classes `@MainActor`; set `accessibilityIdentifier` on interactive elements.

### Performance

- Avoid retain-heavy patterns in SwiftUI — unnecessary `@State`/`@Published` triggering re-renders.
- Profile with Instruments for memory leaks and main-thread hangs before shipping, especially on lists/scroll views with images.
- Lazy-load images and heavy views (`LazyVStack`/`LazyHStack`/`List`, proper cell reuse in `UITableView`/`UICollectionView`) — required for long, data-driven, or image-bearing lists. A plain `VStack` is fine for short, fixed content (roughly < 30 rows, no images); note the choice in the plan.

### Localization

- All user-facing strings are localizable: `Text("literal")`/`LocalizedStringKey`, `String(localized:)`, and a String Catalog (`Localizable.xcstrings`); use interpolation/plural variations, never concatenation.
- Locale-aware formatting (`FormatStyle`, `Measurement`) for dates, numbers, units.
- Leading/trailing alignment for RTL; check long strings; localize accessibility labels.
- Default is development-language only — flag it in the plan; bundled/API content is localized by its provider.

### Other guidelines

- **Reuse**: favor reusable components — if a functional part of the code already exists elsewhere in the repo, extract it into a shared reusable component.
- **Lean code**: use inline functions and function chaining; prefer `filter`/`map`/`reduce` over manual loops; prefer system frameworks/libraries over custom implementations where possible.

---

## Feature previews and design-system base

**Applies to:** the design phase of any stack. [`skills/feature-preview-kit/SKILL.md`](skills/feature-preview-kit/SKILL.md) is the source of truth: the planner runs Phase A (base, once per `{root}`), the programming skill runs Phase B (one preview per feature) and never edits the base. Run its CLI with `--root {root}`.

---

## Testing skills and other artifacts

**Applies to:** any request to test, evaluate, or trial a skill, rule set, or other artifact in this repository.

- **Location**: all generated items go under `.test/{yyyymmdd}/{test_name}/` (e.g. `.test/20261002/biryani_recipe/`), where `{test_name}` (the test item / test repo name) and the test specification come from the user's prompt. If the name is missing, ask. `.test/` is gitignored; ensure it is listed in `.gitignore`.
- **Treat `.test/{yyyymmdd}/{test_name}/` as `{root}`** for the skill under test: its `.design/`, `.agentic_coding/`, project files, and sources are generated inside it, so the repo's own files are never touched.
- **Test specification first**: write `TEST_SPECIFICATION.md` in that directory — subject, functional spec as given, the skill-workflow checklist (step → expected artifact → pass criterion), and acceptance tests — before generating anything else.
- **Follow the skill exactly**, including its approval gates. Take guidance only from the skill under test (`SKILL.md` and its `references/`); do not apply the matching AGENTS.md section. Do not simulate approvals; if a gate can't be answered, stop and report. Do not re-run a test unless the user asks.
- **Report**: finish with the skill's own report plus a "Skill findings" section listing gaps, ambiguities, and fixes suggested for the skill. Also, **in the report specify estimated token usage to perform the task using skill**
- Provide clickable links in chat for any HTML output the skill produces (relative Markdown link plus absolute `file://` URL).
- Run the stack's own build, lint and test tooling as the skill specifies; a skill is not considered passing until its generated code builds and its tests run.
