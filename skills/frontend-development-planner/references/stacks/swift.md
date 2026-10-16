# Swift (iOS / macOS) stack guide

Stack-specific input for the planner: detecting the Swift stack and project name, Swift hints for the UX spec (SKILL.md → "1.1 UX design specification") and for the plan (SKILL.md → "4. Plan"), and picking or documenting an iOS/macOS architecture pattern when `{root}/.agentic_coding/design_and_architecture_patterns.md` doesn't exist yet (SKILL.md → "1.2 Architecture and design pattern").

## Index
- [Detection](#detection) — markers that select this stack
- [Project name](#project-name) — where to read `{project_name}`
- [UX spec hints](#ux-spec-hints) — where to extract each template section from
- [Plan hints](#plan-hints) — naming, state, isolation, accessibility, security idioms
- [How to use](#how-to-use) — detect → gather → select → fill → approve
- [Catalog](#catalog) — MV, MVVM, MVVM-C, TCA, VIPER, Clean Swift, Clean Architecture, MVC
- [Supporting patterns](#supporting-patterns) — Coordinator, Repository, UseCase, DI
- [Decision guide](#decision-guide) — signal → pattern, default
- [Output template](#output-template) — doc to save
- [Example skeleton](#example-skeleton-mvvm-c-default) — Swift code

## Detection
`{root}` contains `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, or `project.yml` (XcodeGen), or the target files are `*.swift`. Programming skill: `swift-frontend-programming`.

## Project name
In order: `name:` in `project.yml`; the `*.xcodeproj`/`*.xcworkspace` basename; `name:` in `Package.swift`; otherwise the planner's fallback (the `{root}` directory name).

## UX spec hints
Fill [`../ux_design_specification_template.md`](../ux_design_specification_template.md) from:
- **Platform**: deployment targets in `project.yml`/`*.xcodeproj`/`Package.swift`; SwiftUI vs UIKit from `import` usage.
- **Colors**: `Assets.xcassets` color sets, `Color`/`UIColor` extensions or theme files.
- **Typography**: Dynamic Type text styles (`.font(.body)`, `UIFont.preferredFont`) and any `Font` extensions.
- **Icons**: SF Symbols (`Image(systemName:)`) vs custom assets in `Assets.xcassets`.
- **Existing features**: reusable `View`/`UIView` types outside feature folders.
- **Design-system base** (feature-preview-kit Phase A sources, ranked above Figma/PDF): `Assets.xcassets` colour sets (light/dark appearances), `Color`/`UIColor`/`Font` extensions and theme files for tokens; Dynamic Type styles for the type scale; spacing/radius constants; device list from the deployment targets (iPhone, plus iPad/Mac when targeted).
- **Conventions**: `NavigationStack`/`NavigationSplitView`/coordinators; `Localizable.xcstrings`; accessibility baseline = Dynamic Type, VoiceOver, 44x44 pt touch targets.

## Plan hints
- **Feature name**: UpperCamelCase noun phrase matching the repo's type names (e.g. `RecipeList`); files are `{feature_name}View.swift`, `{feature_name}ViewModel.swift`, and so on, per the architecture document's file naming.
- **State kinds → Swift**: input = `let` initializer parameter (immutable) or `@Binding` (owned by the parent); internal = `private(set) var` on an `@Observable` view model, or `@State private var` for view-only UI state; output = a closure or `async` callback in the initializer, never a shared mutable object.
- **Reactivity**: `@Observable` (iOS 17+/macOS 14+) or `ObservableObject` + `@Published` for older targets; `AsyncSequence` for streams; mark UI-mutating types `@MainActor`.
- **Isolation harness**: each dependency is a protocol with a live type and a mock; `#Preview` blocks per planned state using mocks; UI tests launch the host app with launch arguments (e.g. `-uiFeature {feature_name} -uiState {state}`) that a `#if DEBUG` branch of the composition root maps to the feature with mocks. Plan that branch as a mapping row.
- **Accessibility**: `accessibilityLabel`/`Hint`/`Value`, traits, grouping and sort priority, Dynamic Type text styles and `@ScaledMetric`, 44x44 pt targets, Reduce Motion/Transparency, Increase Contrast, Differentiate Without Color, keyboard focus (`@FocusState`, Full Keyboard Access, macOS key view loop), and `performAccessibilityAudit()` in a UI test.
- **Security and privacy**: Keychain for secrets and tokens; ATS on; `Info.plist` usage descriptions for every permission; `PrivacyInfo.xcprivacy` entries when using required-reason APIs or collecting data; OSLog `privacy: .private` by default.

## How to use
1. **Detect existing signals**: search for `ViewModel`, `Coordinator`, `Reducer`/`Store`, `Presenter`/`Interactor`/`Router`, `Repository`, `UseCase`, or a `Package.swift` with feature modules. If a pattern is already dominant, document *that* one; consistency beats theoretical purity. Pick fresh only for a new or unstructured codebase.
2. **Gather characteristics**: UI framework, screen count, team size, lifespan, testability needs, state complexity, existing dependencies (TCA, RxSwift).
3. **Select** via the catalog and decision guide.
4. **Fill** the output template; save to `{root}/.agentic_coding/design_and_architecture_patterns.md`.
5. **Get explicit user approval** before planning against it.

## Catalog

| Pattern | What | Best for | Trade-offs |
|---|---|---|---|
| **MV** | View binds directly to an `@Observable` model; no ViewModel | Small apps, prototypes, local-state screens | Logic leaks into Views; less testable |
| **MVVM** | View binds to an `@Observable`/`ObservableObject` ViewModel owning presentation/business logic | Default for most SwiftUI/UIKit screens; no reactive library needed (iOS 17+/macOS 14+) | No navigation/data-layer rules; add Coordinator + Repository as app grows |
| **MVVM-C** | MVVM + Coordinator owning navigation state (`NavigationPath`/routes) | Multi-screen (>~5-6) apps, deep links, reusable/unit-tested flows | Extra indirection for tiny apps |
| **TCA / unidirectional** | Single `State`, `Action` enum, `Reducer`; explicit, deterministic side effects | Complex/shared/concurrent state, exhaustive testing | Learning curve, boilerplate, third-party dependency; use only when MVVM's implicit mutation causes bugs |
| **VIPER** | View, Interactor, Presenter, Entity, Router behind protocols | Legacy UIKit already using it | ~5 files/screen; poor fit for SwiftUI; superseded for new work |
| **Clean Swift (VIP)** | VIPER-like unidirectional View → Interactor → Presenter → View | Existing Clean-Swift UIKit code | Same cost as VIPER; avoid for new SwiftUI |
| **Clean Architecture** | Layering, not a UI pattern: Presentation (MVVM/TCA) → Domain (UseCases, pure Swift) → Data (Repositories) | Framework-agnostic business rules, multi-platform shared Domain, modular packages | Upfront structure; skip for a few CRUD screens |
| **MVC (UIKit)** | `UIViewController`-centric | Only extending existing MVC screens | Becomes Massive View Controller; don't use for new code |

## Supporting patterns
- **Coordinator/Router**: owns navigation (`NavigationPath`/routes, `push`/`pop`/`present`) so Views never decide the next screen; unit-testable without rendering.
- **Repository**: hides a data source (network, disk, cache) behind a protocol so ViewModels/Interactors depend on an interface; enables mocking.
- **UseCase/Interactor**: one business operation (`FetchUserProfileUseCase`) composed from Repositories; keeps ViewModels thin.
- **Dependency Injection**: constructor injection by default; lightweight container or `@Environment` for cross-cutting deps. No singletons unless justified (e.g. `URLSession.shared`).

## Decision guide

| Signal | Pattern |
|---|---|
| Single screen, local state, prototype | MV |
| Typical production app, one team | MVVM (+ Repository) |
| >~5 screens, deep links, reusable flows | MVVM-C |
| Complex/shared state, heavy concurrency, exhaustive tests | TCA (or equivalent reducer) |
| Framework-agnostic business rules, multi-platform | Clean Architecture, Presentation in MVVM/TCA |
| Existing VIPER/Clean Swift/MVC | Keep it; don't mix patterns within a module |

Default: **MVVM + Coordinator + Repository + constructor-based DI.**

## Output template

```markdown
# {App/Module name} — Architecture

## Chosen pattern
{e.g. "MVVM-C"}

## Why
{1-3 sentences tying decision-guide signals to this project.}

## Layers and responsibilities
- {Layer}: {responsibility, allowed and disallowed dependencies}

## Folder/target structure
{e.g. Features/{Feature}/View, ViewModel, Coordinator; Domain/UseCases; Data/Repositories}

## Navigation
{Coordinator/Router responsibilities, or NavigationStack ownership.}

## Dependency injection
{Convention; container if any; composition root location.}

## State management
{e.g. @Observable ViewModel → View; or Action → Reducer → State.}

## Testing approach
{Per-layer isolation; mocking strategy for Repositories/services.}

## Conventions and file naming
{e.g. {Feature}View.swift, {Feature}ViewModel.swift, {Feature}Coordinator.swift}

## Conformance rules
{Checkable rules the planner copies into each plan's Conformance checklist, e.g.:
- Views contain no business logic or data access; they bind to a ViewModel.
- ViewModels depend on Repository/UseCase protocols, never concrete data sources.
- Domain imports no SwiftUI/UIKit.
- Navigation decisions live in the Coordinator, not in Views.
- Dependencies are injected via initializers; no new singletons.}
```

## Example skeleton (MVVM-C default)

```swift
// ViewModel
@Observable
final class ProfileViewModel {
    enum State { case loading, loaded(UserProfile), failed(Error) }

    private(set) var state: State = .loading
    private let fetchProfile: FetchUserProfileUseCase

    init(fetchProfile: FetchUserProfileUseCase) { self.fetchProfile = fetchProfile }

    @MainActor
    func onAppear() async {
        do { state = .loaded(try await fetchProfile()) } catch { state = .failed(error) }
    }
}

// UseCase (Domain: no UIKit/SwiftUI imports)
struct FetchUserProfileUseCase {
    let repository: UserProfileRepository
    func callAsFunction() async throws -> UserProfile { try await repository.fetchProfile() }
}

// Repository protocol (Data boundary)
protocol UserProfileRepository { func fetchProfile() async throws -> UserProfile }

// Coordinator
@Observable
final class AppCoordinator {
    var path = NavigationPath()
    func showProfile(for userID: String) { path.append(Route.profile(userID)) }
}
```
