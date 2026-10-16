# Components (`fp-*`), type, tokens, icons

| Need | Markup |
|---|---|
| Buttons | `fp-btn` + `fp-btn-primary` / `-secondary` (outlined) / `-tertiary` (text) / `-danger`; sizes `fp-btn-sm` / `fp-btn-lg`; `fp-btn-block`; `disabled` attribute for inactive |
| Icon button / FAB | `<button class="fp-icon-btn" aria-label="…"><i data-fp-icon="more"></i></button>`, `fp-fab` |
| Text field | `<div class="fp-field"><label class="fp-label" for="x">…</label><input class="fp-input" id="x"><span class="fp-help">…</span></div>`; also `select.fp-input` and `textarea.fp-input`; errors: `span.fp-help.fp-help-error[data-fp-error]` |
| Checkbox / radio | `<label class="fp-check"><input type="checkbox"><span>Label</span></label>` |
| Switch | `<label class="fp-switch"><input type="checkbox"><span class="fp-switch-track"></span>Label</label>` |
| Badge | `fp-badge` + `-primary` `-secondary` `-success` `-warning` `-danger` |
| Alert | `<div class="fp-alert fp-alert-success"><i data-fp-icon="check-circle"></i><div><strong>Title</strong>Text</div></div>` (info is the default; also `-warning`, `-danger`) |
| Card | `div.fp-card > h3.fp-card-title + p.fp-card-meta + div.fp-card-actions` |
| List | `ul.fp-list > li > button.fp-list-item > span.fp-avatar + span.fp-list-text(span.fp-list-title + span.fp-list-sub) + i.fp-chevron[data-fp-icon=chev]` |
| Segmented tabs | `div.fp-tabs > button.fp-tab[aria-selected="{{tab == 'a'}}"][data-fp-set="tab='a'"]` |
| Dialog buttons row | `div.fp-dialog-actions` (inside an overlay) |
| Layout | `fp-row` (wrap row) `fp-stack` (column) `fp-spacer` `fp-divider` `fp-muted` `fp-h` (no margin) `fp-link` |

The view root, and any form inside it, is already a column with a `space-4` gap. The **base may add components** (e.g. `.acme-chip`). They're listed in its Style guide tab and in `.agentic_coding/base/config.json` → `styleGuide.sections`.

**Type classes:** `text-display` `text-h1` `text-h2` (phone screen titles) `text-h3` `text-body-lg` `text-body` `text-caption` `text-label` `text-code`.

**Tokens for feature.css:** `var(--bg|surface|surface-2|border|border-strong|ink|ink-muted|primary|primary-soft|on-primary|secondary|secondary-soft|success|warning|danger|info and -soft|disabled-bg|disabled-ink)`, `var(--space-1…7)`, `var(--radius-sm|md|lg|pill)`, `var(--shadow-sm|md|lg)`, `var(--font-sans|mono)`.

**Icons** (`<i data-fp-icon="…">`): back close menu more plus minus check check-circle chev chev-down arrow-right home search user users settings bell mail lock eye info warn heart star trash edit calendar cart filter phone download refresh sun moon logout focus rotate.
