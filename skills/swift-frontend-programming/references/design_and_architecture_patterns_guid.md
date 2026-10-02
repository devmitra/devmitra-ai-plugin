# Design and architecture pattern guideline

Used when `{root}/.agentic_coding/design_and_architecture_patterns.md` does not yet exist for a
project (see `SKILL.md` → "Workflow" → "0.2 Architecture and design pattern"). Inspect the existing codebase
first — if it already follows a recognizable pattern, document *that* one rather than introducing
a new one. Only pick fresh from the catalog below for a new project or an unstructured codebase,
and always get user approval before writing the final doc.

## How to use this guide

1. **Detect existing signals** — search for `ViewModel`, `Coordinator`, `Reducer`/`Store`
   (TCA), `Presenter`/`Interactor`/`Router` (VIPER/Clean Swift), `Repository`, `UseCase`, or a
   `Package.swift` with feature-module targets. Reuse what's already dominant in the repo even if
   it isn't the "best" choice in the abstract — consistency beats theoretical purity.
2. **Gather project characteristics**: UI framework (SwiftUI vs UIKit vs mixed), app size/screen
   count, team size, expected lifespan, testability requirements, state complexity (simple local
   state vs deep shared/cross-feature state), and whether the app already ships with a dependency
   (e.g. ships TCA or RxSwift).
3. **Select a pattern** using the catalog and decision guide below.
4. **Fill in the template** ("Output template") and save it as
   `{root}/.agentic_coding/design_and_architecture_patterns.md`.
5. **Review with the user and get explicit approval** before generating code against it.

## Catalog of patterns for iOS/macOS

### MV (Model-View, Apple-native)
View binds directly to an `@Observable` model; no separate ViewModel layer (the SwiftUI view itself plays the ViewModel role).
- **Best for**: small apps, single-screen features, prototypes, screens with only local/derived
  state and thin logic.
- **Trade-offs**: logic tends to leak into the View as the screen grows; less testable in
  isolation since business logic isn't behind a separate, mockable type.

### MVVM (Model-View-ViewModel)
View binds to an `@Observable` (or `ObservableObject`) ViewModel that exposes state and intent
methods; the ViewModel owns business/presentation logic and talks to services/repositories.
- **Best for**: the default choice for most production SwiftUI and UIKit screens — a rotating
  team can ship features without relearning the app each sprint. Plays natively with SwiftUI via
  `@Observable` (iOS 17+/macOS 14+), `@State`, and `@Binding` — no reactive library required.
- **Trade-offs**: doesn't prescribe navigation or data-layer boundaries on its own — pair it with
  the Coordinator and Repository patterns below as the app grows past a handful of screens.

### MVVM-C (MVVM + Coordinator)
MVVM for the View/ViewModel pair, plus a Coordinator/Router object that owns navigation state
(`NavigationPath`/routes) and decides which screen to present next.
- **Best for**: multi-screen apps, apps with deep linking, apps where navigation flows are
  reused across features or need to be unit-tested independently of views.
- **Trade-offs**: extra indirection for very small apps; worth the cost once there are more than
  ~5-6 screens or any non-trivial navigation graph.

### TCA (The Composable Architecture) / other unidirectional (Redux-style) architectures
Single source of truth `State`, `Action` enum, and a `Reducer` that produces the next state;
side effects modeled explicitly and are testable deterministically.
- **Best for**: apps with complex, deeply shared, or highly concurrent state; teams that value
  exhaustive testability and are willing to accept the learning curve and external dependency
  (or the boilerplate of rolling an equivalent in-house).
- **Trade-offs**: steeper onboarding, more boilerplate per feature, and a third-party dependency
  (unless building a bespoke reducer-based store) — don't reach for it by default; reach for it
  when MVVM's implicit state mutation is already causing bugs.

### VIPER (View-Interactor-Presenter-Entity-Router)
Strict separation: View (dumb), Interactor (business logic), Presenter (presentation logic),
Entity (data), Router (navigation), each behind a protocol.
- **Best for**: legacy UIKit codebases that already use it, or teams that need maximal enforced
  separation for compliance/testability reasons.
- **Trade-offs**: heavy boilerplate (5 files per screen), slow to iterate in SwiftUI-first apps;
  generally superseded by MVVM-C or Clean Architecture for new work.

### Clean Swift (VIP cycle)
Similar goals to VIPER with a unidirectional View → Interactor → Presenter → View data cycle.
- **Best for**: same niche as VIPER — existing Clean-Swift UIKit codebases.
- **Trade-offs**: same boilerplate cost as VIPER; avoid for new SwiftUI work.

### Clean Architecture (layered: Presentation / Domain / Data)
Not a UI pattern by itself — a layering strategy usually combined with MVVM or TCA for the
Presentation layer: Presentation (View/ViewModel) → Domain (UseCases/Interactors, pure Swift,
no framework imports) → Data (Repositories, network/persistence implementations).
- **Best for**: apps with non-trivial business rules that must stay framework-agnostic and
  independently testable, multi-platform apps (iOS + macOS + watchOS) sharing a Domain layer, or
  apps built as Swift packages/modules.
- **Trade-offs**: more upfront structure than a flat MVVM app needs; adopt when there's real
  business logic to protect, not for a handful of CRUD screens.

### MVC (Model-View-Controller, UIKit `UIViewController`-centric)
Default UIKit pattern; avoid for new code.
- **Best for**: nothing new — only relevant when directly extending an existing MVC UIKit
  screen without room to migrate it.
- **Trade-offs**: naturally collapses into "Massive View Controller" once a screen has any real
  logic; do not introduce this for new components.

## Supporting patterns (compose with any of the above)

- **Coordinator/Router**: centralizes navigation so Views never decide "what screen comes next."
  Owns `NavigationPath`/routes, exposes `push`/`pop`/`present` methods, is unit-testable without
  rendering a View. Pairs with MVVM, Clean Architecture, and VIPER alike.
- **Repository**: abstracts a data source (network, disk, cache) behind a protocol so
  ViewModels/Interactors depend on an interface, not a concrete `URLSession`/CoreData call —
  enables mocking in tests.
- **UseCase/Interactor**: a single-purpose type encapsulating one business operation
  (`FetchUserProfileUseCase`), composed from one or more Repositories. Keeps ViewModels thin and
  business rules independently testable.
- **Dependency Injection**: constructor injection by default; a lightweight DI container or
  `@Environment`/`EnvironmentValues` (SwiftUI) for cross-cutting dependencies. Avoid singletons
  except where genuinely justified (e.g. `URLSession.shared`).

## Decision guide

| Signal | Recommended pattern |
|---|---|
| Single screen, local state only, prototype | MV |
| Typical production SwiftUI/UIKit app, 1-team ownership | MVVM (+ Repository for data access) |
| More than ~5 screens, deep links, reusable flows | MVVM-C |
| Complex/shared state, heavy concurrency, exhaustive test needs | TCA (or equivalent unidirectional reducer) |
| Significant framework-agnostic business rules, multi-platform target | Clean Architecture (Presentation/Domain/Data), Presentation layer in MVVM or TCA |
| Existing VIPER/Clean Swift/MVC codebase | Keep the existing pattern for consistency; don't mix patterns within one module |

Default when nothing else applies: **MVVM + Coordinator + Repository + constructor-based DI.**

## Output template

Fill this in and save as `{root}/.agentic_coding/design_and_architecture_patterns.md`:

```markdown
# {App/Module name} — Architecture

## Chosen pattern
{Pattern name, e.g. "MVVM-C"}

## Why
{1-3 sentences tying the decision-guide signals above to this project.}

## Layers and responsibilities
- {Layer name}: {responsibility, allowed dependencies, disallowed dependencies}
- ...

## Folder/target structure
{e.g. Features/{Feature}/View, ViewModel, Coordinator; Domain/UseCases; Data/Repositories}

## Navigation
{Coordinator/Router responsibilities, or NavigationStack ownership if no Coordinator.}

## Dependency injection
{Constructor injection convention; DI container if any; where the composition root lives.}

## State management
{How state flows: e.g. @Observable ViewModel → View; or Action → Reducer → State for TCA.}

## Testing approach
{What must be unit-testable in isolation per layer; mocking strategy for Repositories/services.}

## Conventions and file naming
{e.g. {Feature}View.swift, {Feature}ViewModel.swift, {Feature}Coordinator.swift}
```

## Example skeleton (MVVM-C default)

```swift
// MARK: - ViewModel
@Observable
final class ProfileViewModel {
    private(set) var state: State = .loading
    private let fetchProfile: FetchUserProfileUseCase

    enum State {
        case loading
        case loaded(UserProfile)
        case failed(Error)
    }

    init(fetchProfile: FetchUserProfileUseCase) {
        self.fetchProfile = fetchProfile
    }

    @MainActor
    func onAppear() async {
        do {
            state = .loaded(try await fetchProfile())
        } catch {
            state = .failed(error)
        }
    }
}

// MARK: - UseCase (Domain layer — no UIKit/SwiftUI imports)
struct FetchUserProfileUseCase {
    let repository: UserProfileRepository
    func callAsFunction() async throws -> UserProfile {
        try await repository.fetchProfile()
    }
}

// MARK: - Repository protocol (Data layer boundary)
protocol UserProfileRepository {
    func fetchProfile() async throws -> UserProfile
}

// MARK: - Coordinator
@Observable
final class AppCoordinator {
    var path = NavigationPath()

    func showProfile(for userID: String) {
        path.append(Route.profile(userID))
    }
}
```
