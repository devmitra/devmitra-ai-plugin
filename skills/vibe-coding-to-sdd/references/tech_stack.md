# Tech stack guide

How to choose the stack when the human gave none, and how to review one they gave (SKILL.md → step 3). Every choice made here is a row of `project/decisions.md` with a reason and a rejected alternative, and is shown to the human as *choice — what it means for you*.

## Index
[Rules](#rules) · [Client](#client) · [Design pattern](#design-pattern) · [Style framework](#style-framework) · [Is a backend needed?](#is-a-backend-needed) · [Backend](#backend) · [Data and files](#data-and-files) · [Containers](#containers) · [Commands and CI/CD](#commands-and-cicd) · [Test tooling](#test-tooling) · [Review of a given stack](#review-of-a-given-stack)

## Rules

- **What the human asked for wins.** A named stack, framework, or architecture is kept and reviewed (see [Review of a given stack](#review-of-a-given-stack)); the defaults below apply only where the human named nothing.
- **Existing code wins next**: an existing app keeps the stack it has.
- **Named products below are default candidates, not facts to copy.** Each third-party dependency is vetted when the task that adds it is planned — actively maintained, a license compatible with the app, no known major vulnerability — and approved at that task's G2, as the SDD guardrails require.
- **Never write a version from memory.** Read the current stable version from the registry or the tool when the plan is written, and record it in the plan.
- **The smallest stack that meets the app intent.** Each added part — a framework, a backend, a database, a service — needs a requirement in `app.md` that it serves, named in its decision row.

## Client

| `app.md` platform | Default | Language | Use instead when |
|---|---|---|---|
| `html` or `web`, a `presentation` or `prototype` with `fidelity: high` | React on Vite, packaged as one offline HTML file — [`packaged_web_app.md`](packaged_web_app.md) | TypeScript | — |
| `html` (a `presentation` with `fidelity: standard`) | static HTML and CSS with TypeScript, built to files that open without a server; no UI framework | TypeScript | the page needs many reusable stateful parts → `fidelity: high` |
| `web` | React with a build tool (candidate: Vite) | TypeScript | the human, their team, or existing code uses Vue → Vue with the same build tool |
| `ios` | SwiftUI | Swift | — |
| `android` | Jetpack Compose | Kotlin | — |
| `hybrid` (one codebase for iOS and Android) | React Native with NativeWind | TypeScript | — |

- A `prototype` with `fidelity: standard` has no client stack: its deliverable is the feature previews.
- With `fidelity: high`, [`packaged_web_app.md`](packaged_web_app.md) adds its stack, structure, `package` command, offline `e2e` tests, and conformance rules `W1`–`W10` to the defaults below.
- Choose `hybrid` over two native apps when the human wants both phones from one budget and needs no platform-specific capability; record what is given up.
- When a planning or programming skill for the chosen stack is installed, its own stack guide decides the pattern and the project structure; this file's defaults fill only what it leaves open.

## Design pattern

MVVM in a functional style, on every client stack:

| Role | React | Vue | SwiftUI | Jetpack Compose |
|---|---|---|---|---|
| View — renders state, sends user actions; no logic | function component | single-file component with `<script setup>` | `View` | `@Composable` function |
| View model — holds the screen's state and actions | custom hook | composable function | observable view-model type | `ViewModel` exposing immutable state |
| Model — domain rules and data access | plain functions and service interfaces | same | same | same |
| Injection and shared state | Context provider | `provide` / `inject` | initializer or environment | constructor parameters |

React Native follows the React column.

Rules recorded as conformance rules in `architecture.md`:
- A view imports its view model and components only — never a service, the network, or storage.
- A view model receives its services through injection, never by importing a concrete implementation.
- Domain functions are pure where they can be: same input, same output, no hidden state.
- State has one owner; data flows down and actions flow up.
- Every service is an interface with a live implementation and a mock, so each feature runs and is tested alone.

## Style framework

The look is approved at A2 as tokens (the locked base). This step chooses the library that draws it; the tokens stay the single source.

| Framework | Works with | Choose when |
|---|---|---|
| Tailwind CSS | React, Vue; React Native through NativeWind | the default — tokens map directly onto its theme |
| Material UI | React only | a React app that is mostly forms, tables, and dashboards and benefits from ready-made components |
| Bootstrap | any web client | the human supplied Bootstrap-based HTML or CSS, or asked for it |
| the platform's own styling | SwiftUI, Jetpack Compose | always on native clients |

- A framework that does not work with the chosen client is not offered: no Material UI with Vue.
- **Token module**: the foundation item generates one module from the base's `tokens.css` — the Tailwind theme, the Material UI theme, Bootstrap's variables, the SwiftUI colour and font definitions, or the Compose theme. Conformance rule: no colour, size, radius, or font literal in UI code outside the token module.
- A change of look after A2 is a new base version through A2, then a regenerated token module — never an edit of the module alone.

## Is a backend needed?

Default: **no backend**. A backend is added only when at least one holds, and the decision row names which:
- a secret must be kept from the user — a key for a paid or private service;
- several users share data, or a user reaches their data from several devices;
- people sign in, or see different things by role;
- something must happen when no user has the app open;
- files are stored for later or shared;
- a rule must be enforced where the user cannot bypass it — payments, quotas, moderation.

None holds: the client keeps its data on the device, or uses fixed sample data, and `has_backend: false`. A `presentation` and a `prototype` never have a backend.

## Backend

Default: Node.js with TypeScript and Express, as one service that serves this app's clients (a backend-for-frontend).

- **Layers**: route (HTTP in and out, validation) → use case (rules) → repository or gateway (database, files, outside services). Dependencies point inward; a route never queries the database.
- **Serverless-ready** — recorded as conformance rules, so the service can later run as containers or as functions without a rewrite:
  1. The application is built by a function that returns it without listening on a port; the listener lives in a separate entry file.
  2. No state in memory or on local disk between requests: sessions, uploads, caches, and jobs live in the database, the object store, or an outside service.
  3. All configuration comes from the environment, is validated at start, and the service refuses to start when a required value is missing.
  4. Start-up does no slow work; connections are opened once and reused.
  5. A health route reports readiness without touching user data.
- **Interface description**: the routes are described by an OpenAPI document kept next to the code and checked against it by a test. The security scan and the client read it.
- **Sign-in**: decided at A3 when `app.md` needs it — an established identity service, or a vetted library; never hand-written password or token cryptography. Choosing a service means creating an account: an operation.
- **Logging and security**: the [engineering baseline](engineering_baseline.md).

## Data and files

- **Database** — SQLite by default. PostgreSQL when at least one holds: more than one instance of the backend will run, or it will run as functions; several users write at the same time; the delivery target is `production`; the human expects the data to outlive the machine it runs on.
- **Access**: through one ORM or query builder that supports both databases (candidates: Prisma, Drizzle ORM), so a later move from SQLite to PostgreSQL changes configuration and migrations, not code. No query is built from strings.
- **Migrations**: every schema change is a migration file, committed, applied by one command. A migration that drops or rewrites data states so in its plan; running any migration against a hosted database is an operation.
- **Seed data**: invented, committed, applied by one command; used by the tests and the videos. Never a copy of real data.
- **Files and objects**: behind one storage interface using the S3 protocol. Locally an S3-compatible store runs as a container (candidate: MinIO); hosted, the provider the human names. No file is stored on the service's own disk.

## Containers

Required when the app has a backend; optional for a client-only app.

- One image definition per deployable part: multi-stage build, a base image pinned to a version, a non-root user, a health check, no secret in any layer, and an ignore file that keeps local files out.
- One compose file starts the local environment: the backend, the database when it is PostgreSQL, the object store when files are stored, and the web client when it is served.
- Installing a container runtime and pulling a base image are operations, listed in the setup plan.
- No container runtime on the machine and the human declines to install one: run the parts directly, record a risk row (`operations`), and note it as a gap at handover.

## Commands and CI/CD

One entry point for every routine action: a `Makefile` on macOS and Linux, or scripts in `scripts/` — Bash, and PowerShell when the human works on Windows. Each target is recorded in `architecture.md` → `Commands` after the foundation item has run it.

| Target | Does |
|---|---|
| `setup` | installs the project's dependencies inside the workspace and prepares local configuration from the example file |
| `dev` | starts the app for development |
| `build` | builds every part |
| `lint` | runs the linter and the type check; warnings fail |
| `test` | runs unit and integration tests |
| `e2e` | runs the end-to-end tests against a locally started app, recording video |
| `audit` | runs the dependency audit |
| `package` | builds the single offline HTML file (only with `fidelity: high`) |
| `scan` | runs the security scan (only with a backend) |
| `up` / `down` | starts and stops the local containers |
| `migrate` / `seed` | applies migrations; loads seed data |
| `clean` | removes build output — never data or configuration |

- **Continuous integration**: ask the human which provider their repository host offers, or record `none for now`. The pipeline file is a work item of the foundation item; it calls the same targets — `lint`, `build`, `test`, `e2e`, `audit` — and adds nothing the targets do not do. Pushing it is a `publish` operation.
- **Deployment**: ask where the app will run only when the delivery target is `shared-demo` or `production`. Deployment configuration may be written as a work item; running it is a `deploy` operation, never part of a task's acceptance.
- No hosting account, domain, or provider is invented: an unknown one is a marked placeholder and an open question.

## Test tooling

| Client | Unit | End-to-end, with video |
|---|---|---|
| `html`, `web` | the build tool's test runner (candidate: Vitest) | Playwright |
| `ios` | Swift Testing or XCTest | XCUITest; the simulator's screen recording |
| `android` | JUnit | Compose UI tests on an emulator; the emulator's screen recording |
| `hybrid` | the React Native project's test runner | a device-automation tool approved at A3 (candidates: Maestro, Detox) |
| backend | the same runner as the web client, against a test database | requests through the OpenAPI document |

Installing a test browser, a simulator, or an emulator is an operation, listed in the setup plan.

## Review of a given stack

When the human names a stack or an architecture, keep it and check it. Each finding is a risk row with a proposed response; none is a reason to replace the human's choice silently.

1. **Fit**: does it serve the app kind, every platform, and the delivery target in `app.md`?
2. **Parts that do not work together**: a style framework the client cannot use; a database or local file storage that cannot work where the backend will run; a native capability the hybrid framework lacks.
3. **Health of each named dependency**: maintained, license, known vulnerabilities — checked now, not from memory.
4. **Security**: does anything named make a baseline rule impossible — secrets in the client, no server-side checks?
5. **Testability**: can every journey be run end to end automatically on this stack?
6. **Cost and ownership**: paid services, accounts the human must own, and who maintains it after handover.
7. **Baseline gaps**: which engineering-baseline rules need extra work on this stack.

A finding that makes a `must` requirement or a baseline rule impossible is an open question for the human — adapt the requirement, or change the stack — never a silent deviation. In the decision row for each given choice, the reason is `named by the human` and the rejected alternative is this guide's default, with why it was not used.
