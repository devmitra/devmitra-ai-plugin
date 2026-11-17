# Packaged web app guide

How to build a `presentation` or a `prototype` with `fidelity: high`: a modern, responsive, animated web app that runs offline on invented data and is delivered as **one HTML file** with every script, style, font, and image inside it. Read it at step 2 (visual references), at step 3 (stack, structure, conformance rules), and when planning the foundation item and each task of such an app. It does not apply to a `poc`, an `mvp`, or `fidelity: standard`.

## Index
[When it applies](#when-it-applies) · [Deliverable](#deliverable) · [Showcase](#showcase) · [Visual references](#visual-references) · [Stack](#stack) · [Structure](#structure) · [Data sources](#data-sources) · [Liveness](#liveness) · [Strings and localization](#strings-and-localization) · [Look, motion, and liveness checklist](#look-motion-and-liveness-checklist) · [Packaging](#packaging) · [Commands](#commands) · [Testing](#testing) · [Conformance rules](#conformance-rules) · [Foundation item](#foundation-item)

## When it applies

**Purpose**: a vibe-coded `presentation` or `prototype` is high-fidelity material made to be shown — to investors, users, or a team. It must look finished and feel alive; a `prototype` must also show off what the app's features do (see [Showcase](#showcase)).

- `fidelity` is recorded in `app.md` and `app_status.md` for a `presentation` and a `prototype` (`n/a` for a `poc` and an `mvp`).
- **Default `high`.** It is not asked as a question: the A1 gate request says in one plain sentence what the human will get — "a polished, animated demo that opens from one file and feels like a real app" — and that they may ask for a quick clickable sketch instead.
- **`standard`** only when the human asks for a sketch, a quick mock-up, or plain previews: a `prototype` is then the `feature-preview-kit` previews, a `presentation` the static HTML default of [`tech_stack.md`](tech_stack.md). Record the human's words in a decision row.
- In an auto mode with no answer, `high` is used and logged under `Assumptions`.

## Deliverable

One file, `{app-slug}.html`, that:
1. opens by double-click from the file system (`file://`) in a current desktop or mobile browser, with no server and no install;
2. makes no network request — no content delivery network, no web font service, no analytics, no remote image;
3. is responsive across the devices in `app.md` → `platforms` and the base's devices (phone, tablet, desktop widths), with no horizontal scroll at phone width;
4. follows the system's light or dark setting where the locked base defines both;
5. carries the app's whole story: every journey of `app.md` can be completed in it with the invented data.

A `prototype` built this way has app code; its tasks write product code under the same rules as any other task.

## Showcase

A `prototype` is judged by how well it shows the app's features, not only by whether they can be reached. A `presentation`'s showcase is its story: its sections, in order, each carrying one message, under checklist item 9 below.

1. **Showcase list** — `app.md` → `Showcase`: the features to highlight, in the order they are shown, each with the journey it demonstrates, the audience it is for, and its value in one plain sentence ("See where your money went this month at a glance"). Derived from the journeys and confirmed at A1; with no answer, the order is the journeys' order.
2. **Feature tour** — started from a visible "Take the tour" control and from `#/tour`: one step per showcased feature, each opening the real screen in its scenario and highlighting the element that matters with a short caption from the strings file. Next, back, and skip; operable by keyboard; never blocks the app once closed.
3. **Demo scenarios** — named seed scenarios (for example `first visit`, `busy month`, `something failed`), each a set in `app-data.json`, chosen from the demo panel. Choosing one reseeds the data, so every feature can be shown in its best state and its edge states without typing.
4. **Deep links** — every showcased feature has a hash link that opens it in its scenario, so a presenter can jump straight to it; the links are listed in the handover.
5. **Demo panel** — the tour, the scenario choice, Reset demo data, and the language switch when there is one, live together in one small panel, styled apart from the app's own interface. One control hides it for clean screenshots and recordings.
6. **Demo script** — the handover's test script for a `prototype` is the showcase walk-through: for each showcased feature, its link, what to click, and what it shows.
7. **Built with the features** — the foundation item builds the tour, the scenario switch, and the demo panel; each feature task adds its own tour step, scenario, and deep link, and its validation proves them.

## Visual references

Asked at step 2, in the same question as the design sources: "Name one to three websites or apps whose look or feel you like, and what you like about each — for example *the calm spacing of X*, *the card animations of Y*." `none` is an answer.

- A reference is **inspiration for mood** — layout, density, typography feel, motion style, how states are shown. It is never a brand source: its logo, name, images, illustrations, copy, and code are never copied, and its colours are used only when the human owns that brand.
- Brand values still come only from the human's own sources (SKILL.md → step 2); a reference never overrides a locked token.
- Look at a public reference read-only, without signing in. Record each reference, what the human liked, and what was taken from it, in the base's `config.json` → `base.notes` and in `app.md` → `Constraints` → `Visual references`.
- Show at A2 how each liked quality appears in the style guide, in one line each.

## Stack

Defaults for this app kind; what the human named still wins and is reviewed ([`tech_stack.md`](tech_stack.md) → *Rules*). Each choice is a `project/decisions.md` row with a reason and a rejected alternative; every package is a candidate, vetted and version-checked when the foundation item is planned.

| Part | Default (candidate) | Rejected alternative to record |
|---|---|---|
| Language and UI | React with TypeScript, on Vite | static HTML without a framework — too little structure for stateful, animated screens |
| Style framework | as [`tech_stack.md`](tech_stack.md) → *Style framework* says: Tailwind CSS by default; Material UI for form-, table-, or dashboard-heavy apps; Bootstrap when the human supplied it | — |
| Navigation | hash-based routing (candidate: the hash router of React Router); a `presentation` with one linear story may use a state-held section index mirrored to the hash | history-API routing — does not work from `file://` |
| Animation | CSS transitions and keyframes first; a motion library (candidate: Motion for React) only when layout, list, or shared-element animation needs it | a heavy animation or 3D runtime without a journey that needs it |
| Packaging | Vite with `vite-plugin-singlefile` | Bun's standalone HTML build (a second toolchain); Parcel plus an inliner (two steps) |
| Unit tests / end-to-end | Vitest / Playwright | — |

- No backend, no remote API, no sign-in service — ever.
- The MVVM pattern of [`tech_stack.md`](tech_stack.md) → *Design pattern* applies unchanged: views render, hooks hold state, services are injected interfaces with mocks.

## Structure

```
src/
  main.tsx                 entry: providers (data service, strings, theme), router
  theme/tokens.ts          the token module: generated from the base's tokens.css, plus motion tokens
  data/
    app-data.json          application data source (invented seed data)
    strings.{lang}.json    displayable-strings source, one file per language
    schema.ts              the data model's types and the load-time check
  services/
    DataService.ts         interface: the operations the screens need
    JsonDataService.ts     live implementation over app-data.json (and storage, for a prototype)
    MockDataService.ts     mock for tests and isolated views
  i18n/strings.ts          the strings module: `t(key, params)`, the current language
  features/{feature}/      views, view-model hooks, components of one feature
  shared/                  reusable components (no feature logic)
```

## Data sources

Two JSON files, both committed, both invented — never a copy of real data.

**Application data — `app-data.json`**
- Shaped as the app's data model: one top-level key per entity, records with IDs, references by ID. Its types live in `schema.ts`; a unit test loads the file and checks it against them.
- Realistic and varied: plausible names, amounts, dates, and long and short texts; enough records to fill every list, and the edge cases each state needs (an empty collection reachable through a seed scenario, a very long name, a zero amount).
- Domain content — product names, article bodies, sample messages — belongs here, not in the strings file.
- Read only through `DataService`; no component imports the JSON.

**Displayable strings — `strings.{lang}.json`**
- Every text a person sees or hears that is not domain content: headings, labels, buttons, placeholders, empty states, errors, toasts, confirmations, the page title, accessibility labels, and image alt texts.
- Keys are dotted and grouped by feature: `{feature}.{view}.{element}`; shared texts under `common.`.
- Parameters are named placeholders (`"Hello, {name}"`); plurals are separate keys (`.one`, `.other`) until a library is added. A sentence is never built by joining strings.

## Liveness

What happens when a person clicks Save, Add, Edit, or Delete:

| App kind | Behaviour | Reset |
|---|---|---|
| `prototype` | the change is kept in the browser's storage (`localStorage`) and survives a reload | a visible **Reset demo data** control restores the seed |
| `presentation` | the change is kept in memory while the page is open | a reload restores the seed |

Rules for a `prototype`'s storage:
1. On first load, copy the seed into storage under one key, `{app-slug}:data:v{data_version}`; read and write only through `JsonDataService`.
2. Raising `data_version` (a field of `app-data.json`) discards stored data and reseeds, so a changed seed is always seen.
3. Storage that is unavailable or full (private browsing, quota) falls back to memory and shows a one-line notice; the app keeps working.
4. The app says, in its footer or settings, that it is a demo and keeps data only in this browser. The data class of everything stored is `public` or `internal`; a field that invites personal data is a risk row.

For both kinds:
- `DataService` simulates a short response delay, set in one configuration value and zero in tests, so loading states are seen.
- Every journey's failure path that `app.md` or the intent names is reachable on purpose — through a seed scenario or a clearly marked demo control — so it can be shown and tested.

## Strings and localization

- One language by default: the language the human wrote in. Its file is `strings.{lang}.json`.
- `src/i18n/strings.ts` is a small typed lookup — `t(key, params)` — with no library. A missing key renders the key itself, logs a `warning`, and fails a unit test that compares every key used in code with the file.
- **Localization is optional and only on request.** When the human asks for more languages, it becomes an `N` requirement (`languages`) and a `non-functional` backlog item through A4. That item adds: one `strings.{lang}.json` per language, a language switcher, locale-aware dates, numbers, and currency through the platform's `Intl`, right-to-left layout checks when a right-to-left language is added, and — only if plurals, gender, or formatting outgrow the lookup — an internationalization library (candidates: react-i18next, FormatJS), vetted at that task's G2.
- Domain content in `app-data.json` is translated only when the human asks for it; then each localized field holds one value per language.

## Look, motion, and liveness checklist

Each line is a checkable rule; the foundation item makes it possible, each feature task proves it for its screens.
1. Every size, colour, radius, shadow, font, duration, and easing comes from the token module.
2. **Motion tokens** — `duration.fast`, `duration.base`, `duration.slow`, `easing.standard`, `easing.emphasized` — are defined in the token module (the base has none); the values are a `project/decisions.md` row.
3. Every screen has its states designed and reachable: loading (skeleton or placeholder, not a bare spinner where content has a known shape), empty (with a next action), error (with a way out), and success (feedback the person sees).
4. Interactive elements show hover, pressed, focus-visible, and disabled states.
5. Screen changes, overlays, list additions and removals, and toasts are animated with the motion tokens; no animation delays input or blocks a click.
6. With `prefers-reduced-motion: reduce`, movement is replaced by an instant change or a short fade.
7. Content is realistic — no "Lorem ipsum", no "Test 1" — and images are invented or license-free, embedded in the file.
8. Layout is checked at phone, tablet, and desktop widths; touch targets are at least 44 by 44 CSS pixels; contrast passes in light and dark.
9. A `presentation` adds: keyboard navigation between sections (arrow keys, space, Home, End), a progress indicator, and a hash per section so a section can be reopened.

## Packaging

The `package` command builds `dist/{app-slug}.html`.

1. Vite with `vite-plugin-singlefile` and its recommended build settings: every script and style inlined, no code splitting, no lazy `import()`.
2. Every image and font is imported from `src/` so it is inlined as a data URI. Nothing goes in `public/` — the plugin does not inline it.
3. SVG is a component or inline markup, or uses a loader approved in the plan; the plugin does not inline SVG files on its own.
4. Fonts: the base's font files, imported in CSS and inlined; or the system font stack. Never a font service URL.
5. No cookie, no service worker, no history-API route — none work from `file://`.
6. A Content Security Policy `<meta>` tag, if any, allows the inlined code (`'unsafe-inline'`, a hash, or a nonce); the build's warning about it is a failure.
7. The file size is reported by `package`. Above 5 MB, compress images or drop unused fonts; still above it, a risk row (`delivery`) and the size in the handover.
8. Read the plugin's current options and its Vite requirement from its own documentation when the foundation item is planned; do not configure it from memory.

## Commands

Added to [`tech_stack.md`](tech_stack.md) → *Commands and CI/CD*; each recorded in `architecture.md` → `Commands` after the foundation item has run it.

| Target | Does |
|---|---|
| `dev` | starts the Vite development server |
| `package` | builds `dist/{app-slug}.html` and prints its size |
| `e2e` | runs `package`, then the end-to-end tests against the packaged file |

`audit` applies (the app has dependencies); `scan` does not.

## Testing

- **End-to-end, against the deliverable**: Playwright opens `dist/{app-slug}.html` by its `file://` URL — never the development server — with every request whose scheme is not `file:`, `data:`, or `blob:` aborted and counted; any such request fails the run. One case per journey, recorded on video, plus each named failure path.
- Run each journey at phone width and at desktop width.
- A `prototype` case that changes data also reloads the page and checks the change is kept, then uses **Reset demo data** and checks the seed is back. A `presentation` case checks that a reload restores the seed.
- One case with reduced motion emulated checks that every journey still completes.
- A `prototype` adds: the tour runs from start to end, each step on its screen; each deep link opens its feature in its scenario; each scenario loads; the demo panel hides and shows.
- **Unit**: the strings key check, the seed-against-schema check, and each view-model hook and `JsonDataService` operation.
- When `qa_run` is `yes`, the QA tester receives the packaged file's path and the `e2e` command (see [`roles/qa_tester.md`](roles/qa_tester.md)).

## Conformance rules

Copied at step 3 into `architecture.md` → `Conformance rules`, each with its own `C` ID and this file as source (for example `C9 — packaged W3`), together with the *client* rules of the [engineering baseline](engineering_baseline.md).

| ID | Rule |
|---|---|
| W1 | The deliverable is one HTML file that opens from `file://` and makes no network request. |
| W2 | Routing is hash-based; no history-API route, cookie, or service worker. |
| W3 | No component imports `app-data.json`; data is read and written only through the injected `DataService`. |
| W4 | No user-visible text literal in a component; every such text comes from `t()` and exists in every `strings.{lang}.json`. |
| W5 | No colour, size, radius, font, duration, or easing literal outside the token module. |
| W6 | Every animation honours `prefers-reduced-motion`. |
| W7 | Every screen's loading, empty, error, and success states are reachable and tested. |
| W8 | A `prototype` persists changes under one versioned storage key, falls back to memory, and offers Reset demo data; a `presentation` stores nothing. |
| W9 | Every image and font is embedded in the packaged file; nothing is served from `public/`. |
| W10 | A `prototype` shows every feature of `app.md` → `Showcase` through a tour step, a demo scenario, and a deep link, all reached from one demo panel that can be hidden. |

## Foundation item

The first backlog item (kind `enabling`) of such an app delivers: the Vite and React project; the token module with the motion tokens; the strings module and the first strings file; `schema.ts`, `app-data.json`, `DataService` with its live implementation and mock; the router; the logging module of the baseline's client rules; the `dev`, `build`, `lint`, `test`, `package`, `e2e`, and `audit` commands; and an `e2e` case that opens the packaged file offline and reaches the first screen. A `prototype`'s foundation item also builds the demo panel, the scenario switch, and the tour (a small in-house component on the tokens; a tour library only when vetted and approved at its G2). Feature items then add screens on this base, one journey at a time — for a `prototype`, each with its tour step, scenario, and deep link.
