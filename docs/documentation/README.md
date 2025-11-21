# System Evolution Documentation

**Version:** 1.0.0
**Date:** 2025-11-18
**Status:** Active

---

## Welcome to the New Documentation System

This directory contains the **next generation** of kolkrabbi's design system documentation, built with a scalable hierarchical structure that can grow from dozens to thousands of documents without losing organization or discoverability.

---

## What Is This?

A complete documentation system featuring:

- **📊 Scalable Numbering**: M.m.p hierarchy (supports 970,299 documents)
- **📂 Content Type Separation**: Research, implementation, reference clearly categorized
- **🔗 Automated Cross-References**: Structured metadata enables smart linking
- **📝 Comprehensive Standards**: Naming conventions, workflows, and best practices
- **🏗️ Foundation Documents**: Repository structure, build system, and architecture

---

## Quick Start

### New Here? Start Here!

1. **[ bla ]**  - **Complete TOC of everything!** ⭐ START HERE FOR BROWSE

### By Role

**👨‍💻 Developers**
- [Repository Structure]

**🎨 Designers**
- [Design System Overview]

**📝 Documentation Writers**
- [Writing Guidelines]

---

## Documentation Structure

### Hierarchical Organization

The documentation follows a **three-tier numerical hierarchy**:

```
M.m.p-Category-Name.md
│ │
│ └─ Patch Number (0-99) - Specific document
│   │
│   └─ Minor Number (0-99) - Sub-domain
│     │
│     └─ Major Number (0-999) - Domain category
```

### Domain Categories

| Range | Category | Description | Status |
|-------|----------|-------------|--------|
| **0.x.x** | Metadata | Documentation about docs | ✅ Active |
| **1.x.x** | Foundation | Architecture & setup | ✅ Active |
| **2.x.x** | Tokens & Typography | Colors, type, prose | ✅ Active |
| **3.x.x** | Components | Atoms → apparatus | ⚙️ In Progress (space reserved for future docs) |
| **4.x.x** | Public Pages | Home / Studio / Stack / Work / Collections / Foundry | ✅ Active |
| **5.x.x** | Workshop | Chess, analytics, effects | ✅ Active |
| **6.x.x** | Research | Findings & studies | 🔄 Ongoing |
| **7.x.x** | Operations | Workflows & processes | ✅ Active |
| **8.x.x** | Decisions | ADRs & rationale | 📅 Planned |
| **9.x.x** | Future | Exploration & RFCs | 📅 Planned |

> **Chapter heads:** Every major range now has an `.0.0` index file (e.g., `0.0.0`, `1.0.0`, `2.0.0`, … `9.0.0`) that lists and links to all child docs. When in doubt, jump to the chapter head and reply with the index number.

---

## Current Documentation

### MMM

## Standards & Conventions

### Document Format

All documents include:

1. **Frontmatter:**
   ```yaml
   ---
   version: 1.0.0
   date: 2025-11-03
   status: active
   content-type: implementation | research | reference | metadata
   category: foundation | design-system | components | etc.
   cross-references:
     parent: M.m.p
     children: [M.m.p, M.m.p]
     related: [M.m.p, M.m.p]
   ---
   ```

2. **H1 Title:**
   ```markdown
   # M.m.p Category: Specific Topic Title
   ```

3. **Standard Sections:**
   - Overview
   - Related Documentation
   - Last Updated

### Cross-References

Always use numbered references:

```markdown
## Related Documentation



## Resources

### System Documentation
- **[Documentation System Proposal](0.0.0-documentation-index.md)** - Original proposal
- **[Writing Guidelines](0.0.1-metadata-writing-guidelines.md)** - Writing standards
- **[Master Index](0.0.2-metadata-index.md)** - All documentation

### Foundation
- **[Repository Structure](1.0.0-foundation-repository-structure.md)** - Project organization
- **[Build System](1.1.0-foundation-build-system.md)** - Build pipeline
- **[Naming Conventions](1.0.1-foundation-naming-conventions.md)** - Naming rules

### Design & Development
- **[Design System Overview](2.0.0-design-system-overview.md)** - Visual language
- **[Development Workflow](7.0.0-operations-development-workflow.md)** - Team processes

### Legacy System (for reference)
- **docs/system/** - Original documentation (being migrated)
- **docs/archive/** - Deprecated and obsolete docs

---

## Questions?

### Can't Find Something?

1. Check the **[Master Index](0.0.2-metadata-index.md)**
2. Review **[Writing Guidelines](0.0.1-metadata-writing-guidelines.md)**
3. Ask in team chat

### Want to Improve the System?

1. Review the **[Proposal](0.0.0-documentation-index.md)**
2. Check existing docs first
3. Propose changes via PR
4. Update this README if needed

### Need to Add Documentation?

1. Read **[Writing Guidelines](0.0.1-metadata-writing-guidelines.md)**
2. Find the right category
3. Use correct M.m.p numbering
4. Create frontmatter with metadata
5. Update Master Index

---

## License

This documentation system is part of the kolkrabbi design system and follows the same licensing terms as the project.

---

**Welcome to the future of documentation!** 🎉

**Last Updated:** 2025-11-03
**Maintained by:** Design System Team
**Location:** `/docs/documentation/`
