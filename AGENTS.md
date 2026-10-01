# AGENTS.md

This repository (`devmitra-ai-plugin`) holds reusable coding-guideline skills for AI coding agents, authored primarily as [Claude Code skills](https://code.claude.com/docs/en/plugins) under `skills/<name>/SKILL.md`, with matching guidance mirrored here for GitHub Copilot, Codex, and other agents that read `AGENTS.md`, and under `.cursor/rules/` for Cursor.

The plugin manifest `plugin.json` lives at the repository root as the single source of truth, with `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` kept as symlinks back to it — so Claude Code and Cursor both discover the same manifest without duplication.

Each section below is scoped to a file pattern — apply it only when editing or generating matching files. Each section mirrors a canonical skill in `skills/<name>/SKILL.md`; for the full guided workflow (input gathering, planning, artifact layout) behind a given guideline set, read that file directly.

When adding a new skill under `skills/`, add a matching section here (with its applicable file pattern) and a `.cursor/rules/<name>.mdc`, so the same guidance is available across Claude Code, AGENTS.md-based agents, and Cursor.

---

## Role
Consider role as Staff level software engineer with deep knowledge of Consumer facing application development like iOS native, Android native, Web (React, Angular, Vue, CSS), Flutter, React-native.
---

## Swift Frontend Programming Guidelines (iOS / macOS)

**Applies to:** `**/*.swift`

Guardrails for iOS/macOS frontend development in Swift, SwiftUI/UIKit, and associated Swift Testing/XCTest/XCUITest code. This is the AGENTS.md-facing mirror of the canonical skill at [`skills/swift-frontend-programming/SKILL.md`](skills/swift-frontend-programming/SKILL.md) — for the full component-generation workflow (inputs gathering, planning, artifact layout), read that file directly.

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

Check whether a centralized logging framework is already in use. If not, use [`skills/swift-frontend-programming/references/logging.md`](skills/swift-frontend-programming/references/logging.md) to implement one.

- Never expose secret, sensitive, or private information in logs — mask it.
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
- UI tests for critical flows (auth, checkout, core navigation).

### Performance

- Avoid retain-heavy patterns in SwiftUI — unnecessary `@State`/`@Published` triggering re-renders.
- Profile with Instruments for memory leaks and main-thread hangs before shipping, especially on lists/scroll views with images.
- Lazy-load images and heavy views (`LazyVStack`/`LazyHStack`, proper cell reuse in `UITableView`/`UICollectionView`).

### Other guidelines

- **Reuse**: favor reusable components — if a functional part of the code already exists elsewhere in the repo, extract it into a shared reusable component.
- **Lean code**: use inline functions and function chaining; prefer `filter`/`map`/`reduce` over manual loops; prefer system frameworks/libraries over custom implementations where possible.
