# Agent-KOL Context Cheat Sheet
**Quick reference to get agents back on track without burning context**

> **META-PRINCIPLE**: Don't just add "IMPORTANT!!!" everywhere. Actually READ the code around you, LOOK at connected files, and COPY working patterns. Exclamation marks don't fix behavior.

## 🎯 Core Principles

1. **COMMON SENSE FIRST** - Read the lines above and below. Check surroundings. Don't make up tokens or invent APIs.
2. **STEP BACK, BIG PICTURE** - Before diving in, understand the connected components, parent context, and overall architecture.
3. **NON-DESTRUCTIVE development** - Create new components, don't modify existing ones
4. **Use design tokens** - Never hardcode hex colors or pixel values
5. **Theme-aware** - All components must work in light/dark modes
6. **Follow the system** - When in doubt, check existing components for patterns

---

## 🎨 Essential CSS Tokens

### Border Tokens (Most Common)
```css
var(--kol-border-default)    /* 8% foreground - STANDARD CHOICE */
var(--kol-border-subtle)     /* 4% foreground - lighter */
var(--kol-border-strong)     /* 16% foreground - heavier */
var(--kol-border-hover)      /* 16% foreground - interactive states */
```

**Usage:**
```jsx
// Inline styles
style={{ borderTop: '1px solid var(--kol-border-default)' }}
style={{ borderColor: 'var(--kol-border-default)' }}

// Utility classes (preferred)
className="border border-auto"          // Uses --kol-border-default
className="border-t border-fg-08"       // 8% foreground opacity
```

### Text/Foreground Tokens
```css
var(--kol-surface-on-primary)    /* Main text color */
var(--kol-surface-on-secondary)  /* Secondary surface text */
var(--kol-surface-on-inverse)    /* Inverted surface text */
```

### Background Tokens
```css
var(--kol-surface-primary)       /* Main background */
var(--kol-surface-secondary)     /* Cards, panels */
var(--kol-surface-tertiary)      /* Nested elements */
var(--kol-surface-inverse)       /* Dark mode flip */
```

---

## 📝 Typography Classes

### Helper Classes (UI text, labels)
```css
.kol-helper-xs        /* 12px fixed, normal case */
.kol-helper-xxs       /* 10px fixed, normal case */
.kol-helper-uc-xs     /* 12px fixed, UPPERCASE */
.kol-helper-uc-xxs    /* 10px fixed, UPPERCASE */
```

### Mono Classes (code, data, metrics)
```css
.kol-mono-xs          /* 10px → 14px responsive */
.kol-mono-xxs         /* 8px → 12px responsive */
.kol-mono-sm          /* 12px → 16px responsive */
.kol-mono-md          /* 14px → 18px responsive */
```

### Label Classes (pills, tags, badges)
```css
.kol-label-mono-xs    /* 10px → 14px uppercase mono */
.kol-label-mono-md    /* 12px → 16px uppercase mono */
.kol-label-sm         /* Small label */
.kol-label-md         /* Medium label */
```

### Display Classes (headings, titles)
```css
.kol-display-xl       /* Extra large display */
.kol-display-lg       /* Large display */
.kol-display-md       /* Medium display */
.kol-display-sm       /* Small display */
```

### Body Classes (paragraph text)
```css
.kol-body-lg          /* Large body text */
.kol-body-md          /* Medium body text */
.kol-body-sm          /* Small body text */
```

---

## 🛠️ Common Utility Classes

### Border Utilities
```css
.border-auto          /* Uses --kol-border-default */
.border-fg-08         /* 8% foreground opacity */
.border-fg-16         /* 16% foreground opacity */
.divider-auto         /* Standard divider line */
```

### Text Color Utilities
```css
.text-auto            /* Main foreground color */
.text-auto-inverse    /* Inverted foreground */
.text-auto-secondary  /* Secondary text */
.text-fg-48           /* 48% foreground opacity */
.text-fg-64           /* 64% foreground opacity */
```

### Background Utilities
```css
.bg-surface-primary       /* Main background */
.bg-surface-secondary     /* Card/panel background */
.bg-auto                  /* Theme-aware auto background */
.bg-auto-inverse          /* Inverted background */
```

### Interactive States
```css
.hoverFlipTheme       /* Flips theme colors on hover */
```

---

## 📂 Key File Locations

### Design System Core
```
packages/ui/theme.css           # All CSS custom properties/tokens
packages/ui/css/utilities.css   # Utility classes
packages/ui/css/components.css  # Typography classes
```

### Documentation
```
docs/documentation/2.1.0-design-system-colors.md      # Color system
docs/documentation/2.1.1-color-cheat-sheet.md         # Quick color ref
docs/documentation/2.2.0-design-system-typography.md  # Typography system
docs/documentation/2.2.1-typography-cheat-sheet.md    # Quick typo ref
```

### Component Libraries
```
packages/ui/src/atoms/       # Atomic components (buttons, inputs, etc)
packages/ui/src/molecules/   # Composed components (cards, forms, etc)
apps/web/src/components/     # App-specific components
```

---

## 🚨 Common Mistakes & Fixes

### ❌ Wrong: Hardcoded colors
```jsx
style={{ borderColor: '#dbdbdb' }}
style={{ color: '#ffffff' }}
```

### ✅ Correct: Use tokens
```jsx
style={{ borderColor: 'var(--kol-border-default)' }}
style={{ color: 'var(--kol-surface-on-primary)' }}
// OR use utility classes:
className="border-auto text-auto"
```

---

### ❌ Wrong: Modifying existing components
```jsx
// Don't edit existing GlyphGrid.jsx
export const GlyphGrid = ({ glyphs }) => { ... }
```

### ✅ Correct: Create new variations
```jsx
// Create new GlyphGridSelectable.jsx
export const GlyphGridSelectable = ({ glyphs, onSelect }) => { ... }
```

---

### ❌ Wrong: Non-existent tokens
```jsx
style={{ background: 'var(--kol-text-on-primary)' }}  // Wrong purpose
style={{ border: 'var(--kol-surface-border)' }}       // Doesn't exist
```

### ✅ Correct: Proper tokens
```jsx
style={{ background: 'var(--kol-surface-secondary)' }}
style={{ borderTop: '1px solid var(--kol-border-default)' }}
```

---

### ❌ Wrong: Incomplete border syntax
```jsx
style={{ borderTop: 'var(--kol-border-default)' }}  // Missing width & style
```

### ✅ Correct: Full border syntax
```jsx
style={{ borderTop: '1px solid var(--kol-border-default)' }}
// OR use utility:
className="border-t border-auto"
```

---

## 🎯 Quick Decision Tree

**Need to add a border?**
→ Use `border-top: 1px solid var(--kol-border-default)` or `className="border-t border-auto"`

**Need text color?**
→ Use `color: var(--kol-surface-on-primary)` or `className="text-auto"`

**Need a background?**
→ Use `background: var(--kol-surface-secondary)` or `className="bg-surface-secondary"`

**Need monospace text for data/metrics?**
→ Use `className="kol-mono-xs"` or similar

**Need to modify an existing component?**
→ DON'T. Create a new component instead.

**Unsure which token to use?**
→ Check similar existing components for patterns
→ Look in `packages/ui/theme.css` for available tokens
→ Grep the codebase for usage examples: `grep -r "kol-border" apps/web/src/`

---

## 🔗 Connected Components & Files

**Before creating/modifying any component, check:**

1. **Connected Components** - What other components use this? Search for imports:
   ```bash
   grep -r "import.*ComponentName" apps/web/src/
   ```

2. **Connected Files** - What files are imported by this component?
   - Read the imports at the top of the file
   - Check those files for patterns and token usage
   - Don't reinvent what already exists

3. **Similar Components** - Find similar patterns:
   ```bash
   # Find components with similar names
   find apps/web/src -name "*Glyph*" -o -name "*Font*"

   # Find components using similar tokens
   grep -r "kol-border-default" apps/web/src/
   ```

4. **Parent Components** - Where is this rendered?
   - Check the component that imports this
   - Understand the context and available props
   - Match the styling patterns of siblings

**Example workflow:**
```
Working on: GlyphInspector.jsx
1. Read imports at top → sees it imports GlyphItem, Extraction
2. Read GlyphItem.jsx → see how it styles borders, uses tokens
3. Read Extraction.jsx → see how metrics overlay works
4. Grep for similar usage → find FoundryCharacterSets uses same pattern
5. Copy the pattern, don't invent new tokens
```

---

## 🔍 Quick Debugging

**Component not appearing?**
1. Check if you're using valid CSS tokens (not making them up)
2. Verify imports are correct
3. Check console for errors
4. **Read connected files** - check components you're importing

**Styles not applying?**
1. Are you using design tokens or hardcoded values? (Use tokens!)
2. Is the syntax correct? (`borderTop: '1px solid var(--token)'` not just `var(--token)`)
3. Check if global CSS is overriding (use browser DevTools)
4. **Read lines above and below** - copy the pattern from surrounding code

**Theme not working?**
1. Are you using semantic tokens? (`var(--kol-border-default)` not `#dbdbdb`)
2. Check if component is wrapped in proper theme provider
3. Verify tokens exist in `packages/ui/theme.css`
4. **Check connected components** - how do they handle theming?

---

## 📖 When to Dig Deeper

This cheat sheet covers 90% of common cases. For deeper dives:

- **Complex animations**: Check `docs/documentation/3.*.md` files
- **Foundry-specific patterns**: See `docs/documentation/4.*.md` files
- **Session-specific context**: Check `docs/llm-context/SESSION-LOGS/`
- **Component architecture**: Read existing similar components first

---

**Last updated**: 2025-11-09
**Purpose**: Quick agent context recovery without context bloat
**Principle**: When lost, read this first. When still lost, read the full docs.
