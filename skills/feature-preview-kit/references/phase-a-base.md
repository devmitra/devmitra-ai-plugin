# Phase A: build the design-system base

Run `fpk init` first. It creates `.agentic_coding/base/{config.json,tokens.css,base.css}` from the neutral kit. Edit only those three files.

## 1. Sources, ranked (higher wins; record every one in `config.json` → `base.sources`)

| # | Source | Extract |
|---|---|---|
| 1 | Repo code | `tailwind.config.*`, theme/tokens TS, global CSS `:root` vars, SCSS vars, MUI/Chakra themes, iOS `Assets.xcassets` colours, Android `colors.xml`/`themes.xml`, Compose `Color.kt`/`Type.kt`. Exact values. |
| 2 | Token JSON (DTCG, Style Dictionary, Figma Tokens) | Flatten to the names below, resolving aliases. |
| 3 | Figma (MCP or exports) | Variables, text styles, effects. |
| 4 | Brand PDF | Hex or RGB from the colour pages (CMYK only as a last resort, and flag it); typefaces; type scale; logo rules. |
| 5 | Website URL | `:root` vars plus computed styles of body, h1–h3, links, buttons, inputs, cards, nav (snippet below). |
| 6 | Images / screenshots | Sampled colours and estimated sizes. Mark them `approximate` in `sources[].note`. |

```js
// run in the live site to read its tokens and key computed styles
const pick=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return{s,color:c.color,bg:c.backgroundColor,font:c.fontFamily,size:c.fontSize,weight:c.fontWeight,lh:c.lineHeight,radius:c.borderRadius,border:c.borderColor,shadow:c.boxShadow,h:c.height,tt:c.textTransform}};
JSON.stringify({vars:[...document.styleSheets].flatMap(x=>{try{return[...x.cssRules]}catch{return[]}}).filter(r=>r.selectorText===':root').flatMap(r=>[...r.style].filter(p=>p.startsWith('--')).map(p=>[p,r.style.getPropertyValue(p).trim()])),els:['body','h1','h2','h3','a','button','input','nav','header','[class*=card]','[class*=primary]'].map(pick)});
```

**Rules:**
- **Never invent values.** Derive missing ones (e.g. the dark theme) from real values and write `derived: …` in `base.notes`.
- **Copy the logo exactly.** Use inline `<svg>` or a `data:` URI in `brand.logo`. If there is no logo, use the product name as text.
- **Resolve conflicts by rank.** When sources disagree, the higher rank wins. List each conflict in `base.notes`.

## 2. `tokens.css`: keep every name; add more if needed

| Group | Names |
|---|---|
| Surfaces / lines / text | `bg` `surface` `surface-2` · `border` (decorative) `border-strong` (control edge, 3:1) · `ink` `ink-muted` (4.5:1) |
| Brand | `primary` `primary-hover` `primary-soft` `on-primary` · `secondary` `secondary-soft` `on-secondary` |
| Status | `success` `warning` `danger` `info`, each with `-soft`; `on-danger` |
| Other colour | `disabled-bg` `disabled-ink` `focus` `knob` `overlay` `device-bezel` `device-glass` |
| Effects | `shadow-sm` `shadow-md` `shadow-lg` |
| Fonts | `--font-sans` `--font-mono` (stacks with system fallbacks) |
| Scale | `space-1`…`space-7`, `radius-sm` `radius-md` `radius-lg` `radius-pill` |
| Component | `btn-height` `btn-radius` `btn-font-size` `btn-font-weight` `btn-text-transform` `btn-letter-spacing` `input-height` `input-radius` `card-radius` `card-shadow` `badge-radius` `appbar-height` |
| Type classes | `.text-display` `.text-h1` `.text-h2` `.text-h3` `.text-body-lg` `.text-body` `.text-caption` `.text-label` `.text-code` |

**Colour roles:**
- **Primary:** the main CTA colour.
- **Secondary:** the next brand hue (neutral if the brand has only one).
- **Status text:** sits on its own `-soft` fill.

**Both themes:** define `:root, [data-theme="light"]` and `[data-theme="dark"]`.

**Fonts:**
- **Hosted:** `@import` at the top of `tokens.css`.
- **Licensed:** `@font-face` with a base64 woff2 `data:` URI (about 2 weights) so built files stay self-contained.
- **Otherwise:** the closest system stack, with a note.

## 3. `base.css`
Prefer component tokens. Use `base.css` only for what tokens can't express, or for extra base components the product uses everywhere. Name extras with a product prefix (e.g. `.acme-chip`) and use tokens only. Document every extra in `config.json` → `styleGuide.sections`.

## 4. `config.json`

| Key | Values |
|---|---|
| `base` | `name`, `version` (semver), `sources` (strings or `{label,url,note}`), `notes` |
| `brand` | `product` (name in web header/sidebar; `{{meta.product}}`), `logo` (inline `<svg>` with `currentColor`, or `data:image/…`) |
| `devices[]` | `{id, kind: ios\|android\|tablet\|web, label, model, width, height, rotatable?}`. Ship only what the product targets. For `web`, height includes the 44px toolbar. |
| `shell.appBarAlign.<kind>` | `center` or `leading` |
| `shell.nav` | `phone: bottom` · `tablet: bottom\|sidebar` · `web: top\|sidebar`. Each feature decides whether it has nav items; the base decides how they look. |
| `shell.tabBarLabels` | `true` or `false` (icon-only) |
| `shell.overlay` | `phone: sheet\|dialog`, `wide: sheet\|dialog` |
| `shell.statusBarTime` | e.g. `"9:41"` |
| `styleGuide` | `principles` (3–6 short rules), `sections` `[{title, description, html}]` for extras and do/don't examples |

## 5. Review and lock
1. Run `fpk build --base` and open `.agentic_coding/base/base-preview.html`.
2. Run `FPK.call('fpk_check_contrast')`. It must report `pass: true`, or every failure must be explained in `base.notes`. Fix brand colours that fail as text by adding a darker text token, and keep the original value for fills.
3. Check the Style guide tab in light and dark. Walk the demo on every device: tab bar or sidebar, sheet or dialog, toasts, focus.
4. Run `fpk lock --version 1.0.0` (add `--name "Acme Design System"` if needed).
5. Report: the sources used, derived or approximate values, contrast results, open questions.

**Later changes:** edit the base, run `fpk lock --version <next>`, then `fpk build --all`.
