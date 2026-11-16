# UX design specification template

One-page template for `{root}/.agentic_coding/project/ux_design_specification.md`: just enough project-wide context to plan and build consistent features. Extract from the repo first (see the stack guide's "UX spec hints" for where each section lives), ask the user only for gaps, mark unknowns `TBD`. Start the file with OKF frontmatter: `type: UX Design Specification`, `title`, `description` (one sentence), `status`, and `generated`.

## Index
[1 Platform](#1-platform) · [2 Tokens](#2-tokens) · [3 Existing features](#3-existing-features) · [4 Conventions](#4-conventions) · [5 References](#5-references)

## 1. Platform
Target platforms, minimum OS/browser versions, UI framework, architecture pattern (link `architecture.md`, which sits next to this file in the bundle).

## 2. Tokens
Link the design-system base (`design_system/tokens.css`, next to this file) instead of duplicating values.
- **Colors**: semantic names (background, text, accent, error) and where defined.
- **Typography**: text styles and where defined.
- **Spacing/radii**: scale values.
- **Icons**: icon set or custom assets; asset location.

## 3. Existing features
`name - path - purpose`

## 4. Conventions
Navigation model, light/dark support, localization approach, accessibility baseline (text scaling, screen reader, minimum touch target).

## 5. References
Figma files or brand guidelines, if any.
