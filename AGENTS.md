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
| `skills/<name>/SKILL.md` (one skill per language/stack, e.g. `swift-frontend-programming`) | Canonical Claude Code skill (frontmatter `name` + trigger-oriented `description`), with `references/` for templates and guides |
| `plugin.json` | Plugin manifest (single source); `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` are symlinks to it — never fork them |
| `.claude-plugin/marketplace.json` | Claude Code marketplace entry |
| `.cursor/rules/<name>.mdc` | Cursor rule for each skill |
| `.test/` | Gitignored sandbox for skill trials (see "Testing skills and other artifacts") |

## Skill catalog

| Skill | Applies to | Section |
|---|---|---|
| `swift-frontend-programming` | `**/*.swift` | Swift Frontend Programming Guidelines |
| _future: React, Node, Python_ | e.g. `**/*.tsx`, `**/*.js`, `**/*.py` | _add per "Adding a skill for a new stack"_ |

## Working in this repository

- **Adding or changing a skill**: edit `skills/<name>/SKILL.md` and its `references/`, then keep the matching section in this file and `.cursor/rules/<name>.mdc` consistent with it. Each skill section here is scoped to a file pattern — apply it only when editing or generating matching files.
- **Adding a skill for a new stack** (React, Node, Python, …):
  1. Create `skills/<stack>-<area>-programming/SKILL.md` + `references/`; the skill must be self-contained and must not mention other stacks.
  2. Add one section below, headed `## <Stack> <Area> Guidelines`, with an `**Applies to:**` file pattern (e.g. `**/*.tsx`, `**/*.py`) and its guardrails, using the same category headings as other sections where they apply (security, errors, logging, testing, performance, accessibility, localization) so sections stay comparable. Omit categories that don't fit the stack.
  3. Add the `.cursor/rules/<name>.mdc` and a row to the Skill catalog above.
  4. Keep stack-specific tooling (linters, test runners, project scaffolding) inside that skill's section and references — never in the generic sections of this file.
- **Parity**: guidance must be equivalent across Claude Code, AGENTS.md-based agents, and Cursor. Do not let one drift.
- **Skill quality bar**: each rule is a checkable instruction (not advice); templates are validated by actually using them (generate, build, run); every reference file is linked from `SKILL.md`; no invented URLs, IDs, or package names.
- **Manifest**: bump `version` in `plugin.json` for user-visible skill changes; do not edit the symlinks.
- **Never touch repo files while testing an artifact** — test output lives under `.test/` only.
- **Commits**: only when asked; follow the attribution lines supplied by the harness.

---

## Swift Frontend Programming Guidelines (iOS / macOS)

**Applies to:** `**/*.swift`

Guardrails for iOS/macOS frontend development in Swift, SwiftUI/UIKit, and associated Swift Testing/XCTest/XCUITest code. Detailed component-generation workflow (inputs gathering, planning, artifact layout) lives in [`skills/swift-frontend-programming/SKILL.md`](skills/swift-frontend-programming/SKILL.md); the guardrails below are the AGENTS.md-facing copy for agents that don't load skills, and the skill wins if the two differ.

### Scope, context root & approvals

- **Scope**: develop components and views, not repository structure. Scaffold a project only as a fallback, with user approval (XcodeGen template: [`references/project_template.yml`](skills/swift-frontend-programming/references/project_template.yml)) — and only if no `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, or `project.yml` exists.
- **Root (`{root}`)**: the agent's closest context directory (nearest ancestor of the working path containing `project.yml`, `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, or `.git`); may be nested. Read existing design/architecture docs from `{root}` upward; write new artifacts at the nearest `{root}` under `.design/` and `.agentic_coding/` (committed by default; the user may gitignore them).
- **Approvals**: do not advance past inputs, intent/plan, design prototype, project scaffolding, or a new third-party dependency without explicit user approval — unless the user explicitly says to proceed without asking. If the user can't be asked, stop and record the pending question; never assume. In auto-approve mode, log every assumption.
- Never invent URLs, video/document IDs, endpoints, or package names — ask or use marked placeholders.
- When presenting an HTML design prototype, verify it yourself first, then give the user a clickable link in chat (relative Markdown link + absolute `file://` URL).

### Naming convention

Follow repo-specific naming conventions if they exist; otherwise follow the [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/).

### Third-party libraries

When a needed component isn't available in standard frameworks/libraries, prefer a popular, actively-maintained third-party library. Before adding one: confirm it has no known major vulnerabilities, confirm it's under a permissive open-source license (Apache, MIT, BSD, etc.) with no conflict with the app's licensing, and flag any conflict or new dependency to the user before adding it.

### Secure coding

- Do not expose sensitive, secret, or private information in code. Inject such information via proper configuration.
- Sanitize/escape all user-generated content before rendering.

### Accessibility (a11y)

- Semantic UI first.
- Keyboard navigability for every interactive element (tab order, focus states, escape-to-close on modals).
- Color contrast meeting WCAG AA at minimum.
- ARIA/accessibility APIs used correctly, not as a patch.
- Automated checks (axe-core, Lighthouse, or platform equivalents) in CI, plus periodic manual/screen-reader testing.

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

- Consistent architecture pattern (MVVM, TCA, etc.) applied uniformly — avoid massive view controllers/views mixing business logic and UI.
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

## Testing skills and other artifacts

**Applies to:** any request to test, evaluate, or trial a skill, rule set, or other artifact in this repository.

- **Location**: all generated items go under `.test/{yyyymmdd}/{test_name}/` (e.g. `.test/20261002/biryani_recipe/`), where `{test_name}` (the test item / test repo name) and the test specification come from the user's prompt. If the name is missing, ask. `.test/` is gitignored; ensure it is listed in `.gitignore`.
- **Treat `.test/{yyyymmdd}/{test_name}/` as `{root}`** for the skill under test: its `.design/`, `.agentic_coding/`, project files, and sources are generated inside it, so the repo's own files are never touched.
- **Test specification first**: write `TEST_SPECIFICATION.md` in that directory — subject, functional spec as given, the skill-workflow checklist (step → expected artifact → pass criterion), and acceptance tests — before generating anything else.
- **Follow the skill exactly**, including its approval gates. Take guidance only from the skill under test (`SKILL.md` and its `references/`); do not apply the matching AGENTS.md section. Do not simulate approvals; if a gate can't be answered, stop and report. Do not re-run a test unless the user asks.
- **Report**: finish with the skill's own report plus a "Skill findings" section listing gaps, ambiguities, and fixes suggested for the skill. Also, **in the report specify estimated token usage to perform the task using skill**
- Provide clickable links in chat for any HTML output the skill produces (relative Markdown link plus absolute `file://` URL).
- Run the stack's own build, lint and test tooling as the skill specifies; a skill is not considered passing until its generated code builds and its tests run.
