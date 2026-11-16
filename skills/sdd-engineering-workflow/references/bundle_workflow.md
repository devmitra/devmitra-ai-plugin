# Bundle playbook

The page that makes a bundle self-describing: an agent or person who does not have this skill can still read, resume, and update the bundle by following it. At bootstrap (SKILL.md → *Bootstrap the bundle*), copy the block below unchanged to `{bundle}/project/workflow.md`, replacing only `{actor}` and `{timestamp}`. When this file changes in a later skill version, replace the bundle's copy as a work item of the next task.

```markdown
---
type: Playbook
title: How to work in this bundle
description: Rules any agent or person follows to read, resume, and update the spec-driven development records in this directory.
status: stable
generated: { by: {actor}, at: {timestamp} }
---
# How to work in this bundle

This directory is an Open Knowledge Format (OKF) v0.2 bundle maintained with spec-driven development: every feature and task has documents, approved by a human, that say what was intended, how it was built, how it was proven, and why. If your environment provides the `sdd-engineering-workflow` skill, use it — it is the full version of these rules. Otherwise follow this page.

## Read
1. `../index.md` lists the project documents, the features, and the project-level tasks.
2. `../features/{feature}/index.md` lists the feature's `spec.md` (what is built, with its decisions) and its tasks.
3. Read a task in this order, stopping when you have what you need: `status.md` (state and `Handoff note`), `handoff.md` if present, `intent.md` (what and why), `plan.md` (how, and the decisions), `validation.md` (the proof).
4. To learn why something is built the way it is: `spec.md` → `Decisions` → the linked task plan. Project-wide choices are in `decisions.md`, next to this file.

## Before changing code
- Find the task that covers the change. If there is none, open one: write its intent, plan, and validation plan in the form of the most recent task, and get the human's approval of them before coding. Only an edit that changes no behaviour (typo, comment, formatting) needs no task.
- For an open task, write product code only when `status.md` shows `phase_intent` and `phase_plan` as `approved` and `phase_design` as `approved` or `skipped`. Resume at the step named in `next`.
- If `claim` in `status.md` names someone else, or the repository holds changes that the `Handoff note` and `handoff.md` do not explain, ask the human before continuing. Never overwrite or discard such changes unasked.

## While working
- Never edit an approved `intent.md` or `plan.md`. If new input conflicts with one, add a row to `status.md` → `Reverts`, set that phase to `reverted`, stop, and ask the human. The one exception: append a row to `plan.md` → `Decisions` for a choice made while building.
- Record progress per work item in `status.md` → `Progress`. Record every test run and result in `validation.md`; its run log, defects, and acceptance rows are added, never edited.
- Note anything you notice that the task does not cover — a gap, a limitation, new scope — under `status.md` → `Follow-ups`. Do not build it unasked.
- Approval comes only from the human, as an explicit statement, and is recorded in `status.md` → `Approvals`. Never assume an answer; write the question down and ask.
- Never write secrets, credentials, or personal data into these documents, and never invent URLs, IDs, or package names.

## Before you stop
- Update `Progress`, set `git.head`, and rewrite the `Handoff note` in `status.md`: what is done, the one next action, what to watch out for.
- If work is half-finished, an approach was tried and dropped, or setup is needed that the documents do not describe, write `handoff.md` and say which of its claims you verified.
- Keep every `index.md` and `log.md` current in the same step that creates, closes, or deprecates a document.
- A closed task (`next: done`) is never edited again; a new request is a new task. `spec.md` changes only when a task closes.
```
