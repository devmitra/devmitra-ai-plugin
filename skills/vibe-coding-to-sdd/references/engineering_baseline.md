# Engineering baseline

Rules every app with product code follows, on top of the SDD engineering guardrails. At step 3 each rule that applies to the app kind is copied into `project/architecture.md` → `Conformance rules` with its own `C` ID and this file's ID as its source (for example `C7 — baseline L3`). From there every task's plan lists it and every task's validation proves it.

**Which rules apply**: a `poc` and an `mvp` — all of them. A `presentation`, and a `prototype` with `fidelity: high` — the rules marked *client*. A `prototype` with `fidelity: standard` — none.

## Index
[Logging and traceability](#logging-and-traceability) · [What each level records](#what-each-level-records) · [Sensitive data](#sensitive-data) · [Security — client and backend](#security--client-and-backend) · [Security — backend](#security--backend) · [Security — mobile and desktop clients](#security--mobile-and-desktop-clients) · [Proving the rules](#proving-the-rules)

## Logging and traceability

The aim: any one execution of the app — one user action, from the tap to the stored row and back — can be followed afterwards from the logs alone.

| ID | Rule | Applies |
|---|---|---|
| L1 | All logging goes through one logging module per part (client, backend). Product code calls nothing else to write a log line — no direct console or print call outside that module. | client, backend |
| L2 | The module has exactly four levels — `debug`, `info`, `warning`, `error` — and a threshold read from configuration, so each level can be turned on or off without changing code. `debug` is off unless configuration turns it on; a production build ships with it off. | client, backend |
| L3 | Every execution carries a correlation ID: created where the execution starts (a user action in the client, or a request arriving without one), sent with every call to another part, and written on every log line the execution causes. | client, backend |
| L4 | Every log line is structured — a timestamp, the level, the correlation ID, the component, an event name, and named fields — not a sentence with values pasted in. | client, backend |
| L5 | Log lines are written to a destination chosen by configuration, behind one interface. The default is the standard output. An outside log service is added only when the human names one; setting it up is an operation. | client, backend |
| L6 | No error is swallowed: every caught error is logged at `error`, or at `warning` with the reason it is recoverable, and every uncaught one is logged by a top-level handler before the app reports it. | client, backend |

## What each level records

A task's plan lists, in `Cross-cutting` → `Logging`, the events it adds at each level.

| Level | Records | Minimum events |
|---|---|---|
| `error` | a failure the execution could not recover from | every caught and uncaught error: type, message, stack, the operation that failed |
| `warning` | something unexpected that the execution survived | rejected input; a retry; a fallback taken; a call slower than its limit; a permission denied; use of something deprecated |
| `info` | the milestones of an execution | app start and stop, with version and the *names* of the settings in use; each request received and answered (method, route, status, duration); each call to an outside system (which, result, duration); each change of stored data (what kind, its ID, who); each sign-in, sign-out, and failed sign-in; each screen entered in the client; each background job started and finished |
| `debug` | what a developer needs to follow the logic | entry and exit of each use case with the shape of its input and output; each branch decision that changes the result; each query with its duration; state before and after a change |

Together the `info` lines of one correlation ID tell what happened; the `debug` lines tell why.

## Sensitive data

| ID | Rule | Applies |
|---|---|---|
| L7 | Sensitive data is: secrets, credentials, tokens, and keys; anything `app.md` → `Data` classes as `personal` or `secret`; payment details; the content of users' files and messages. The field names that hold it are listed in one place in the logging module. | client, backend |
| L8 | At `info`, `warning`, and `error`, sensitive data is never logged — not even masked. Log the kind of thing and its ID instead. | client, backend |
| L9 | At `debug`, sensitive data may appear only masked, and the masking is done by the logging module, not by the caller: a value in a listed field is replaced before the line is written — fully for secrets, credentials, tokens, keys, and payment details; partly (for example the last four characters) for other personal data. | client, backend |
| L10 | Request and response bodies are never logged whole at any level; only the named fields a task's plan lists. | backend |

## Security — client and backend

| ID | Rule | Applies |
|---|---|---|
| S1 | No secret, key, or credential in source, in a built client, in an image, in a log, or in a bundle document. Configuration comes from the environment; a committed example file lists the *names* only, and the real file is ignored by version control. | client, backend |
| S2 | Every input from outside — a form, a request, a file, a link, a response from another system — is validated at the boundary against a schema (type, length, range, format) before it is used. | client, backend |
| S3 | Text from users or other systems is shown through the framework's escaping. Raw HTML is inserted only through a sanitiser, and each such place is a `Decisions` row. | client |
| S4 | Dependencies are locked to exact versions by a committed lock file; the dependency audit reports no known vulnerability rated high or critical. | client, backend |
| S5 | A message shown to the user never contains a stack trace, a query, a path, or another internal detail; the detail goes to the log. | client, backend |

## Security — backend

| ID | Rule |
|---|---|
| S6 | Deny by default: every route requires sign-in unless the plan lists it as public. |
| S7 | Permission is checked on the server for every request, against the resource asked for — who owns it, or which role may touch it. A check in the client is never the only one. |
| S8 | Passwords and tokens are handled by an established identity service or a vetted library; none is stored or compared in plain form; sessions and tokens expire. |
| S9 | The database is reached only through the ORM or parameterised queries. |
| S10 | Every response carries security headers: a content security policy, no content-type sniffing, a frame policy, a referrer policy; strict transport security when hosted. |
| S11 | Cross-origin requests are allowed only from an origin list read from configuration — never every origin together with credentials. |
| S12 | Cookies that carry a session are `Secure`, `HttpOnly`, and `SameSite`; a state-changing request authenticated by a cookie is protected against cross-site request forgery. |
| S13 | Every public route has a rate limit and a request-size limit; sign-in and other costly routes have stricter ones. |
| S14 | An uploaded file has a size limit and a type allow-list checked against its content, gets a generated name, is kept in the object store, and is never executed or served from the service's own disk. |
| S15 | Outside a local machine, traffic is encrypted in transit. |
| S16 | The service and its containers run without administrator rights. |

## Security — mobile and desktop clients

| ID | Rule |
|---|---|
| S17 | Tokens and other sensitive values are kept in the platform's secure storage, never in plain preferences or files. |
| S18 | The app asks for a device permission only when the feature that needs it is used, and every permission has its declared purpose text. |
| S19 | A link that opens the app is validated like any other input before it changes state or navigates. |

## Proving the rules

- The foundation item builds the logging module and its tests: a `unit` case that each listed sensitive field is absent at `info`, `warning`, and `error` and masked at `debug`; a `unit` case that the threshold turns each level on and off.
- A task that adds a request path has the profile's traceability case: one correlation ID found in the log lines of every layer the request crosses.
- A task that adds a route has an `integration` case for each of S6 and S7 on that route: refused without sign-in, refused for another user's resource.
- S1 and S4 are proven by `static` cases: a search of the source and build output for the patterns of secrets, and the audit command.
- S10–S13 are proven by the security scan where it runs, and otherwise by an `integration` case on one route of each kind.
- A rule that a task cannot meet is never dropped: it is an open question for the human, and — if they accept the deviation — a risk row.
