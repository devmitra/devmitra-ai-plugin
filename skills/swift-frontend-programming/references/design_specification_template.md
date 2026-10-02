# Design Specification Template

Use this template for `{root}/.design/{project_name}_design_specification.md`. Keep it short (about one page): it only needs enough context for a developer to build a consistent component, not to design a product. Extract each item from the repo first (asset catalogs, theme files, existing views), ask the user only for what is missing, and mark unknowns as `TBD`.

## 1. Platform
- Platforms and minimum OS versions, UI framework (SwiftUI/UIKit), and architecture pattern.

## 2. Tokens
- **Colors**: semantic names (background, text, accent, error) and where they are defined.
- **Typography**: text styles and where they are defined.
- **Spacing and radii**: scale values.
- **Icons**: SF Symbols or custom, and the asset location.

## 3. Existing components
- Reusable components as `name - path - purpose`.

## 4. Conventions
- Navigation model, light/dark mode support, localization approach, and accessibility baseline (Dynamic Type, VoiceOver, minimum touch target).

## 5. References
- Links to Figma files or brand guidelines, if any.
