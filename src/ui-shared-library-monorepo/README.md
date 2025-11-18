# @kol/ui

Shared UI components and design tokens for kolkrabbi.io monorepo.

## Installation

This is an internal package. Apps import it via workspace protocol:

```json
{
  "dependencies": {
    "@kol/ui": "workspace:*"
  }
}
```

## Usage

### Import Design Tokens

In your app's entry CSS file:

```css
@import "tailwindcss";
@import "@kol/ui/theme.css";
```

### Import Components

```jsx
import { Button, Tag, Container, SectionTitle } from '@kol/ui'
import { SanityImage } from '@kol/ui/common'
```

## Package Structure

```
src/
├── atoms/           # Atomic components (Button, Tag, Container, SectionTitle)
├── common/          # Common utilities (SanityImage)
├── specimen/        # Font specimen embed components
└── index.js         # Main export file

theme.css            # Design system tokens (Tailwind v4)
```

## Atomic Components

### Button

```jsx
<Button variant="primary" href="/link">Click me</Button>
<Button variant="secondary" onClick={handleClick}>Action</Button>
<Button variant="accent">Highlight</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'accent'` (default: `'primary'`)
- `href`: Link destination (renders as `<a>`)
- `onClick`: Click handler (renders as `<button>`)
- `className`: Additional classes
- `style`: Inline styles

### Tag

```jsx
<Tag variant="primary">Featured</Tag>
<Tag variant="accent">New</Tag>
<Tag variant="red">Limited</Tag>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'accent' | 'red'` (default: `'primary'`)
- `className`: Additional classes

### Container

```jsx
<Container>
  <h1>Content inside max-width container</h1>
</Container>
```

Uses the `.container` class from theme.css with proper spacing tokens.

### SectionTitle

```jsx
<SectionTitle>My Section</SectionTitle>
```

Uses `kol-heading-section` class for large section headings.

## Common Components

### SanityImage

Handles Sanity image rendering with automatic URL building.

```jsx
import { SanityImage } from '@kol/ui/common'
import { sanityClient } from './lib/sanity'

<SanityImage 
  image={imageObject} 
  alt="Description"
  width={2000}
  sanityClient={sanityClient}
/>
```

**Props:**
- `image`: Sanity image object or URL string
- `alt`: Alt text
- `width`: Image width (default: 2000)
- `height`: Image height (optional)
- `sanityClient`: Sanity client instance (required for URL building)
- `className`: Additional classes

## Design System

The theme.css file provides:

### Typography Classes
- Display: `.kol-heading-display`, `.kol-heading-section`, `.kol-heading-subsection`
- Headings: `.kol-h1` through `.kol-h6`
- Body: `.kol-body-lg`, `.kol-body`, `.kol-body-sm`
- Labels: `.kol-label`, `.kol-meta`, `.kol-mono`

### Component Classes
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-accent`
- Tags: `.tag`, `.tag-secondary`, `.tag-accent`, `.tag-red`
- Cards: `.card`
- Layout: `.section`, `.container`

### Design Tokens
All tokens available via CSS custom properties:
- Font families: `--font-family-*`
- Colors: `--color-*`
- Spacing: `--spacing-*`
- Border radius: `--radius-*`
- Shadows: `--shadow-*`
- Transitions: `--transition-*`

## Rules

- **No TypeScript** - This package uses `.jsx` only
- **Tailwind v4 only** - Use `@theme` tokens from theme.css
- **No app-specific logic** - Keep components generic and reusable
- Layout components (Navbar, Footer) are app-specific and NOT included here

## Development

When adding new components:

1. Create component in appropriate directory
2. Export from directory's `index.js`
3. Import and re-export from `src/index.js`
4. Document in this README
5. Ensure Tailwind v4 compliance (use design tokens)

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-04
