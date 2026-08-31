# REAL_i Theming & Contrast Guidelines

This document outlines the design token system for REAL_i to ensure full compatibility with both **Dark Mode** and **Light Mode**.

## Core Concept: The Surface Scale

REAL_i uses a shifting "surface" token scale (`--surface-50` through `--surface-950`).
Instead of static colors, these tokens automatically invert based on the active theme:

| Token | Dark Mode Appearance | Light Mode Appearance | Usage |
|---|---|---|---|
| `surface-950` | Very Dark Navy / Black | Warm Off-White / Cream | Main app background, body background |
| `surface-900` | Dark Navy | Slightly deeper Off-White | Cards, Modals, inner containers |
| `surface-800` | Slate Navy | Soft Gray/Cream | Hover states for cards, secondary inputs |
| ... | ... | ... | ... |
| `surface-300` | Light Gray | Dark Slate | Muted text, secondary labels |
| `surface-50` | Pure White / Off-White | Deep Navy / Black | **Primary Text**, Headings, Icons |

## Rule #1: DO NOT hardcode `text-white` or `text-black`

**Anti-Pattern:**
```jsx
<div className="bg-surface-900">
  <h1 className="text-white">Welcome</h1>
</div>
```
*Why this breaks:* In Light Mode, `bg-surface-900` becomes an off-white cream. `text-white` remains white. The text becomes invisible.

**Correct Pattern:**
```jsx
<div className="bg-surface-900">
  <h1 className="text-surface-50">Welcome</h1>
</div>
```
*Why this works:* In Dark Mode, `text-surface-50` is white. In Light Mode, it automatically shifts to deep navy, ensuring perfect WCAG contrast against the cream background.

## Rule #2: Exception for Colored Buttons

When building a solid colored button (e.g., Primary Gold, Danger Red, Success Emerald), you **SHOULD** use `text-white` because the button's background color does not shift between themes.

**Correct Pattern (Solid Button):**
```jsx
<button className="bg-primary-600 hover:bg-primary-500 text-white">
  Save Changes
</button>
```

**Correct Pattern (Solid Danger Button):**
```jsx
<button className="bg-rose-600 hover:bg-rose-500 text-white">
  Delete Account
</button>
```

## Summary Checklist
- Is the text sitting on a `bg-surface-*` element? 👉 Use `text-surface-50` or `text-surface-300`.
- Is the text sitting on a solid brand/utility color (`bg-primary-*`, `bg-rose-*`)? 👉 Use `text-white`.
- Never use fixed gray scales (e.g., `text-gray-100`, `bg-slate-900`) for structural UI elements. Always use the `surface` tokens.
