<!--
SDD progress view — rich-text (Markdown) template. Rendered by scripts/sdd_progress.js; without a shell, fill it by hand.
Syntax: {{field}} is replaced; {{#x}}…{{/x}} renders when x is set (once per row for a list); {{^x}}…{{/x}} renders when x is not set.
Views: full (session start, or when the human asks where things stand) sets `full`; compact (after a step or a gate) does not.
Fields:
  project, bundle            project name; bundle directory name
  mode, mode_label           approval mode (review | auto-approve | auto-technical | auto-all) and what it means for the human
  task, task_title, task_type, track      set when a task exists (or the next one is shown)
  app, kind                  set for an application (app_status.md exists)
  app_strip, task_strip      one line: each step as icon, gate, name, joined by " → "; the current step in bold
  app_table/app_rows, task_table/task_rows   a table only in the full view, for the lane the human is in
    rows: icon, step, gate, approves, approver (you | auto | —), state
  last                       the latest decision: icon, gate, decision, by, artifact, time
  next                       the next action (the Handoff note's "Next action")
  waiting                    each gate or operation waiting on the human, with the reply that approves it; else "nothing"
  html, html_rel, html_url   the interactive page: relative link and absolute file:// URL
Icons: ✅ approved by you or done · 🤖 auto-approved · 🟡 waiting for your review · 🔵 in progress · ⚪ not started · ⏭️ skipped · ⛔ blocked · ↩️ reverted
-->
{{#full}}
## 🧭 SDD workflow — {{project}}
Every piece of work passes approval gates before code changes: **what and why** (G1), **how, and how it is tested** (G2), **how it looks** (G3, only for screens), and **does it work** (G4). Everything is recorded in `{{bundle}}/`, so any session or agent can pick up where the last one stopped. Auto-approve skips the waiting, never the documents; installs, deletes, publishing, and deploys are always asked.

{{/full}}
{{^full}}
**SDD · {{project}}{{#task}} › {{task_title}}{{/task}}** · {{mode}} mode{{#track}} · {{track}} track{{/track}}
{{/full}}
{{#app}}
{{#full}}
**App**{{#kind}} · {{kind}}{{/kind}} · approval mode **{{mode}}** — {{mode_label}}
{{/full}}
{{app_strip}}
{{#app_table}}

| | Step | Gate | What is approved | Who approves | State |
|---|---|---|---|---|---|
{{#app_rows}}
| {{icon}} | {{step}} | {{gate}} | {{approves}} | {{approver}} | {{state}} |
{{/app_rows}}
{{/app_table}}
{{/app}}
{{#task}}
{{#full}}

**Task** · {{task_title}}{{#task_type}} · {{task_type}}{{/task_type}}{{#track}} · {{track}} track{{/track}}{{^app}} · approval mode **{{mode}}** — {{mode_label}}{{/app}}
{{/full}}
{{task_strip}}
{{#task_table}}

| | Step | Gate | What is approved | Who approves | State |
|---|---|---|---|---|---|
{{#task_rows}}
| {{icon}} | {{step}} | {{gate}} | {{approves}} | {{approver}} | {{state}} |
{{/task_rows}}
{{/task_table}}
{{/task}}

{{#last}}
**Just now** · {{last}}
{{/last}}
**Next** · {{next}}
**Waiting on you** · {{waiting}}
{{#html}}
**Interactive view** · [progress.html]({{html_rel}}) · {{html_url}}
{{/html}}
{{#full}}

_✅ approved by you · 🤖 auto-approved · 🟡 waiting for your review · 🔵 in progress · ⚪ not started · ⏭️ skipped · ⛔ blocked · ↩️ reverted_
{{/full}}
