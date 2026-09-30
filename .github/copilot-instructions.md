# Repository custom instructions for GitHub Copilot

This repository (`devmitra-ai-plugin`) holds reusable coding-guideline skills for AI coding agents, authored primarily as [Claude Code skills](https://code.claude.com/docs/en/plugins) under `skills/<name>/SKILL.md`, with matching path-scoped instructions mirrored here under `.github/instructions/` for GitHub Copilot and under `.cursor/rules/` for Cursor.

When editing or generating code in this repository:

- Path-specific guidance lives in `.github/instructions/*.instructions.md` (scoped via `applyTo` globs) — Copilot should apply those automatically for matching files.
- Each instructions file mirrors a canonical skill in `skills/<name>/SKILL.md`; for the full guided workflow (input gathering, planning, artifact layout) behind a given guideline set, read that file directly.
- When adding a new skill under `skills/`, add a matching `.github/instructions/<name>.instructions.md` and `.cursor/rules/<name>.mdc` so the same guidance is available across Claude Code, Copilot, and Cursor.
