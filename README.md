# devmitra-ai-plugin

A collection of practical, opinionated coding guideline skills for AI coding agents — distilled from 16+ years of hands-on development across iOS, web (React/Angular/Vue), backend (Node/Python/Java), cloud-native (Docker/Kubernetes/OpenShift), AWS/Azure, and databases (Postgres/MSSQL/MySQL).

Each skill teaches an AI coding agent how to produce code that matches the guardrails, conventions, and workflow a senior engineer would expect for that domain — not just working code, but code that's secure, testable, and maintainable. Guidance is authored once per domain and made available to three coding agents:

- **[Claude Code](https://code.claude.com/docs/en/plugins)** — installed as a plugin, skills auto-discovered from `skills/`.
- **GitHub Copilot, Codex, and other [AGENTS.md](https://agents.md/)-compatible agents** — a single root `AGENTS.md`.
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

### GitHub Copilot, Codex, and other AGENTS.md-compatible agents

These agents read a root-level `AGENTS.md` automatically — copy or symlink this repo's `AGENTS.md` into your project root (or merge its sections into an existing `AGENTS.md`) so it's picked up.

### Cursor

Cursor reads `.cursor/rules/*.mdc` automatically from the project root — copy or symlink this repo's `.cursor/rules/` directory into your project.

## Skills

| Skill | Domain | Claude Code | AGENTS.md | Cursor |
|---|---|---|---|---|
| swift-frontend-programming | iOS / macOS | [SKILL.md](skills/swift-frontend-programming/SKILL.md) | [section](AGENTS.md#swift-frontend-programming-guidelines-ios--macos) | [rule](.cursor/rules/swift-frontend-programming.mdc) |

More skills covering other domains will be added over time.

## Repository layout

```
plugin.json            # plugin manifest (single source of truth)
.claude-plugin/
  plugin.json          # symlink -> ../plugin.json, so Claude Code discovers the manifest
  marketplace.json     # self-hosted marketplace entry for installation
.cursor-plugin/
  plugin.json          # symlink -> ../plugin.json, so Cursor discovers the manifest
skills/
  <skill-name>/
    SKILL.md            # canonical skill definition (frontmatter + guidelines + workflow)
    references/         # supporting reference docs, loaded on demand
AGENTS.md               # Copilot/Codex/AGENTS.md-compatible mirror, one section per skill
.cursor/
  rules/<skill-name>.mdc          # path-scoped Cursor mirror of a skill
```

`plugin.json` lives at the repository root as the canonical manifest; `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` are symlinks to it, so every tool that expects a manifest in its own conventional directory reads the same file.

## Contributing

Each skill lives in its own directory under `skills/` with a `SKILL.md` describing its purpose, required inputs, guardrails, and workflow — this is the canonical source. Keep guidance concrete and enforceable rather than aspirational, and prefer linking out to a `references/` doc over inlining large examples in `SKILL.md`.

When adding or updating a skill, mirror its guardrails into a new section in `AGENTS.md` (noting the applicable file pattern) and into a matching `.cursor/rules/<skill-name>.mdc` (with `description`/`globs`/`alwaysApply` frontmatter) so Copilot/AGENTS.md-based agents and Cursor users get the same guidance. The mirrored content can point back to the skill's `SKILL.md`/`references/` for the fuller agentic workflow rather than duplicating it.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
