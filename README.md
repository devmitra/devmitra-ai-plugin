# devmitra-ai-plugin

A collection of practical, opinionated coding guideline skills for AI coding agents — distilled from 16+ years of hands-on development across iOS, web (React/Angular/Vue), backend (Node/Python/Java), cloud-native (Docker/Kubernetes/OpenShift), AWS/Azure, and databases (Postgres/MSSQL/MySQL).

Each skill teaches an AI coding agent how to produce code that matches the guardrails, conventions, and workflow a senior engineer would expect for that domain — not just working code, but code that's secure, testable, and maintainable. Guidance is authored once per domain and made available to three coding agents:

- **[Claude Code](https://code.claude.com/docs/en/plugins)** — installed as a plugin, skills auto-discovered from `skills/`.
- **GitHub Copilot** — path-scoped custom instructions under `.github/instructions/`.
- **Cursor** — project rules under `.cursor/rules/`.

## Installation

### Claude Code

```
/plugin marketplace add devmitra/devmitra-ai-plugin
/plugin install devmitra-ai-plugin@devmitra-marketplace
```

Or, in one step (Claude Code v2.1.275+):

```
/plugin install devmitra-ai-plugin --marketplace devmitra/devmitra-ai-plugin
```

### GitHub Copilot

Copilot reads `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` automatically from any repository they're present in — clone or vendor this repo's `.github/` directory into your project (or add this repo as a submodule) so those files are picked up.

### Cursor

Cursor reads `.cursor/rules/*.mdc` automatically from the project root — copy or symlink this repo's `.cursor/rules/` directory into your project.

## Skills

| Skill | Domain | Claude Code | Copilot | Cursor |
|---|---|---|---|---|
| swift-frontend-programming | iOS / macOS | [SKILL.md](skills/swift-frontend-programming/SKILL.md) | [instructions](.github/instructions/swift-frontend-programming.instructions.md) | [rule](.cursor/rules/swift-frontend-programming.mdc) |

More skills covering other domains will be added over time.

## Repository layout

```
.claude-plugin/
  plugin.json          # plugin manifest
  marketplace.json     # self-hosted marketplace entry for installation
skills/
  <skill-name>/
    SKILL.md            # canonical skill definition (frontmatter + guidelines + workflow)
    references/         # supporting reference docs, loaded on demand
.github/
  copilot-instructions.md         # repo-wide Copilot instructions
  instructions/<skill-name>.instructions.md   # path-scoped Copilot mirror of a skill
.cursor/
  rules/<skill-name>.mdc          # path-scoped Cursor mirror of a skill
```

## Contributing

Each skill lives in its own directory under `skills/` with a `SKILL.md` describing its purpose, required inputs, guardrails, and workflow — this is the canonical source. Keep guidance concrete and enforceable rather than aspirational, and prefer linking out to a `references/` doc over inlining large examples in `SKILL.md`.

When adding or updating a skill, mirror its guardrails into a matching `.github/instructions/<skill-name>.instructions.md` (with an `applyTo` glob) and `.cursor/rules/<skill-name>.mdc` (with `description`/`globs`/`alwaysApply` frontmatter) so Copilot and Cursor users get the same guidance. The mirrored files can point back to the skill's `SKILL.md`/`references/` for the fuller agentic workflow rather than duplicating it.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
