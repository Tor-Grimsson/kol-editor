# 4.0.0 Public Pages Overview

**Status**: Active
**Last Updated**: 2025-11-11
**Category**: Application Pages

---

## Chapter Index

Reference hub for every outward-facing route. Use this table to jump to the owning doc number:

- **4.0.1** – [Home](./4.0.1-home.md)
- **4.0.2** – [Studio](./4.0.2-studio.md)
- **4.0.3** – [Stack](./4.0.3-stack.md)
- **4.0.4** – [Work](./4.0.4-work.md)
- **4.0.5** – [Newsletter Signup](./4.0.5-newsletter.md)
- **4.2.x** – Collections (Illustrations, Logomarks, Motion)  
- **4.5.x** – Foundry pages + specimen systems  
- **5.x.x** – Workshop routes (see `5.0.0` overview)

---

## Page Structure Patterns

### Common Layout Pattern

Most pages follow this structure:

```jsx
<main className="min-h-screen w-full">
  {/* Hero Section */}
  <HeroSection />

  {/* Content Sections */}
  <div className="main-wrapper">
    <Section1 />
    <Section2 />
    <Section3 />
  </div>

  {/* Global CTA */}
  <CtaGlobal />
</main>
```

### Wrapper Classes

- **`main-wrapper`**: Main content container with consistent padding
- **`card-wrapper`**: Card-style section with background and padding
- **`section-wrapper`**: Standard section wrapper

### Max-Width Patterns

- **1400px**: Standard content max-width (foundry, specimens)
- **1200px**: Narrow content (reading, forms)
- **Full-width**: Hero sections, global CTAs

---

## Page Components

### Hero Sections
Each route owns a hero (`HomeHero`, `StudioHero`, `StackHeroTall`, `WorkHeroSection`) pulled from `apps/web/src/components/sections`.

### Content Sections
Cards, grids, or prose modules specific to each page. Cross-link to collections/foundry/workshop where relevant.

### Global Components
- `CtaGlobal`
- `CmsGlobal` (blog feed on Home/Stack)
- Shared layout utilities (`main-wrapper`, `card-wrapper`)

---

## Typography Patterns

### Page Titles
- `kol-display-section` or `kol-display-lg`
- Used in hero sections

### Section Headings
- `kol-heading-lg` for main section titles
- `kol-heading-sm` for subsection titles

### Body Text
- `kol-mono-text` for primary content
- `kol-mono-sm` for supporting text
- `kol-mono-xs` for labels and small text

---

## Related Documentation

- **Design System Typography**: `2.2.0-design-system-typography.md`
- **Components**: `3.0.0-design-system-components.md`
- **Navigation Shell**: `1.5.0-navigation-system.md`

---

## Notes

Each 4.0.x file documents the live React route, associated SEO settings, and future enhancements. Keep descriptions concise—link to component docs instead of repeating implementation details.
