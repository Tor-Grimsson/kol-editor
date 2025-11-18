# 7.0.0 Operations: Development Workflow

**Version:** 1.0.0
**Date:** 2025-11-03
**Status:** Active
**Content Type:** reference
**Category:** operations

---

## Overview

This document outlines the development workflow, processes, and operational standards for the kolkrabbi design system. Following these practices ensures quality, consistency, and maintainability across all projects.

### Chapter Index

| Number | Title | Focus |
|--------|-------|-------|
| `7.0.0` | Development Workflow (this doc) | Branching, review, releases |
| `7.1.0` / `7.1.1` | LLM Agent Protocols | Context + cheat sheets |
| `7.5.x` | (Reserved) Page ops | Use `4.0.x` for public pages |
| `7.6.0` | Site Content | Content governance |
| `7.6.1` | About Kolkrabbi | About page content |
| `7.6.2` | Projects & Use Cases | Portfolio content |
| `7.6.3` | Hosting & DNS | Domain + DNS reference |

---

## Development Workflow

### Branch Strategy

**Main Branches:**

1. **`main`**
   - Production-ready code
   - Always deployable
   - Protected branch (require PR)
   - Deploys to production on merge

2. **`develop`**
   - Integration branch
   - Feature branches merge here
   - Tested and QA'd before main
   - Deploys to staging

3. **Feature Branches**
   - Format: `feature/descriptive-name`
   - Examples:
     - `feature/add-button-component`
     - `feature/update-color-system`
     - `feature/implement-data-table`

4. **Bug Fix Branches**
   - Format: `bugfix/issue-description`
   - Examples:
     - `bugfix/fix-button-hover`
     - `bugfix/correct-spacing-issue`

5. **Hot Fix Branches**
   - Format: `hotfix/critical-issue`
   - Production emergencies only
   - Merge to main and develop

6. **Documentation Branches**
   - Format: `docs/document-name`
   - Examples:
     - `docs/update-design-system`
     - `docs/add-component-examples`

### Branch Lifecycle

```mermaid
gitgraph
  commit id: "main"
  branch develop
  checkout develop
  commit id: "feature branch"
  checkout develop
  merge feature branch
  checkout main
  merge develop
```

**Process:**
1. Create feature branch from `develop`
2. Develop and commit changes
3. Open pull request to `develop`
4. Review, test, and merge
5. After QA, merge `develop` to `main`
6. Deploy to production

---

## Commit Standards

### Conventional Commits

**Format:**
```
<type>[optional scope]: <subject>

<body>

<footer>
```

**Types:**

- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation changes
- **style** - Code style changes (formatting, etc.)
- **refactor** - Code refactoring
- **test** - Adding or updating tests
- **chore** - Build process or auxiliary tool changes
- **perf** - Performance improvements
- **ci** - CI/CD changes

**Examples:**

```bash
# Component addition
git commit -m "feat(button): Add primary variant with hover state

- Implements primary variant for Button component
- Adds hover and active states
- Includes accessibility improvements
- Updates documentation"

# Bug fix
git commit -m "fix(color): Correct primary color contrast ratio

- Adjusts --kol-color-primary from hsl(220, 90%, 56%) to hsl(221, 83%, 53%)
- Meets WCAG 2.1 AA standards (4.5:1)
- Updates color tables documentation"

# Documentation
git commit -m "docs(system): Add build system documentation

- Documents Turborepo pipeline
- Explains caching strategy
- Includes troubleshooting guide
- References: 1.1.0 Foundation: Build System"

# Refactor
git commit -m "refactor(ui): Simplify Button component API

- Removes unnecessary variant prop options
- Standardizes size prop values
- Improves TypeScript types
- BREAKING CHANGE: Size prop now accepts 'sm' | 'md' | 'lg'"
```

### Commit Best Practices

1. **Use imperative mood:** "Add feature" not "Added feature"
2. **Keep subject line under 50 characters**
3. **Explain what and why, not how**
4. **Reference issues/PRs in footer**
5. **Breaking changes require `BREAKING CHANGE:` in footer**

**Breaking Change Example:**
```bash
git commit -m "feat(button): Remove deprecated variant prop

- Removes 'outline' variant (use 'tertiary' instead)
- Deprecates 'size' values 'xs' and 'xl'
- Migrate to 'sm' and 'lg'

BREAKING CHANGE: variant prop no longer accepts 'outline'
Use variant='tertiary' instead

Closes #123"
```

---

## Pull Request Process

### PR Checklist

**Before Opening PR:**

- [ ] Code follows naming conventions
- [ ] Code is properly formatted
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] Documentation is updated
- [ ] Examples are working
- [ ] Commit messages follow conventions

**When Opening PR:**

- [ ] Clear, descriptive title
- [ ] Detailed description
- [ ] Screenshots/videos (if UI changes)
- [ ] Links to related docs
- [ ] Checklist of changes
- [ ] Testing instructions

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Documentation update

## Changes Made

- List specific changes
- Include file names
- Mention components modified

## Testing

- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Accessibility tested
- [ ] Cross-browser testing
- [ ] Mobile responsive tested

## Related Documentation

- [2.1.0 Design System: Colors](link)
- [3.1.0 Components: Atoms](link)

## Screenshots

If applicable, add screenshots

## Checklist

- [ ] Code follows project conventions
- [ ] Self-reviewed code
- [ ] Code is well documented
- [ ] Tests added/updated
- [ ] Documentation updated
```

### PR Review Process

**Reviewers:**
- At least 1 reviewer required
- Design system changes require design review
- Architecture changes require tech lead review

**Review Checklist:**

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] No code duplication
- [ ] Appropriate abstractions
- [ ] Error handling in place

**Design System:**
- [ ] Uses design tokens (not hardcoded values)
- [ ] Follows component API standards
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Theming support included

**Testing:**
- [ ] Adequate test coverage
- [ ] Tests are meaningful
- [ ] Edge cases covered

**Documentation:**
- [ ] Comments explain complex logic
- [ ] README updated
- [ ] API docs updated
- [ ] Examples included

### PR Merge Strategy

**Merge Options:**

1. **Squash and Merge** (Recommended for feature branches)
   - Keeps main branch history clean
   - Each PR becomes single commit
   - Commit message = PR title + description

2. **Rebase and Merge** (For long-running branches)
   - Preserves commit history
   - Cleaner linear history
   - Use when commit history is important

3. **Merge Commit** (Not recommended)
   - Creates merge commits
   - Messy history
   - Avoid unless necessary

**Merge Process:**
1. All CI checks pass
2. All reviews approved
3. Conflicts resolved
4. Squash and merge to main/develop

---

## Code Review Standards

### For Authors

**Before Requesting Review:**
- Self-review first
- Run all tests
- Check linting
- Test in multiple browsers
- Update documentation

**Writing PR Description:**
- Explain the problem
- Describe the solution
- Show before/after screenshots
- List breaking changes
- Provide testing instructions

### For Reviewers

**Review Focus:**

1. **Architecture:**
   - Does it fit the overall design?
   - Is it maintainable?
   - Are dependencies appropriate?

2. **Design System:**
   - Uses design tokens?
   - Follows component standards?
   - Accessible?
   - Responsive?

3. **Code Quality:**
   - Readable and clear?
   - Proper error handling?
   - No code duplication?
   - Adequate comments?

4. **Testing:**
   - Are there tests?
   - Do tests cover edge cases?
   - Are tests meaningful?

**Review Comments:**

**Praise good practices:**
```markdown
Great use of semantic tokens here! This makes the component
themeable out of the box.
```

**Ask questions:**
```markdown
What's the reasoning behind using `cubic-bezier(0.4, 0, 0.2, 1)`
for the animation? Have we considered `ease-in-out`?
```

**Request changes:**
```markdown
This hardcoded color value should use a design token:

Instead of:
background-color: #0066ff;

Use:
background-color: var(--kol-color-primary);
```

**Blocking issues (must fix):**
- Security vulnerabilities
- Breaking changes not documented
- Major design violations
- Critical bugs

**Non-blocking (can discuss):**
- Alternative approaches
- Style preferences
- Minor optimizations
- Documentation improvements

---

## Documentation Standards

### When to Document

**Always Document:**
- New design tokens
- New components
- Component API changes
- Design decisions
- Architecture changes
- Build process changes

**Document First, Code Second:**
- Complex features
- Breaking changes
- New systems
- Migration guides

### Documentation Process

**For Components:**
1. Update component README
2. Add usage examples
3. Document props API
4. Include screenshots
5. Update design system docs

**For Design Tokens:**
1. Document token purpose
2. Show usage examples
3. Include in color/typography tables
4. Reference from design system overview

**For Architecture:**
1. Document decision and rationale
2. Include diagrams if helpful
3. Link to related docs
4. Update architecture overview

### Documentation Quality

**Good Documentation:**
- Clear and concise
- Includes examples
- Shows real use cases
- Kept up-to-date
- Links to related docs

**Bad Documentation:**
- Outdated information
- No examples
- Unclear explanations
- Incomplete
- Missing context

---

## Testing Standards

### Test Coverage

**Minimum Coverage:**
- Components: 80% line coverage
- Utilities: 90% line coverage
- Hooks: 85% line coverage
- Integration: Critical paths covered

**What to Test:**
- Component rendering
- Props handling
- Event handling
- State changes
- Edge cases
- Error states

### Test Types

**Unit Tests:**
```javascript
// Button.test.jsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalled()
  })
})
```

**Integration Tests:**
```javascript
// FormField.test.jsx
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'

describe('FormField', () => {
  it('validates input and shows error', async () => {
    render(<FormField required />)
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    expect(await screen.findByText('Required')).toBeInTheDocument()
  })
})
```

**Accessibility Tests:**
```javascript
import { render } from '@testing-library/react'
import { Button } from './Button'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Testing Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test Button.test.jsx

# Run tests matching pattern
yarn test --testNamePattern="Button"
```

---

## Release Process

### Version Numbering

**Semantic Versioning (SemVer):**
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

**Examples:**
```bash
v1.0.0 - Initial release
v1.1.0 - Add new component (backward compatible)
v1.1.1 - Fix component bug (backward compatible)
v2.0.0 - Breaking API change
```

### Release Workflow

**1. Prepare Release:**
```bash
# Update version
yarn workspace @kol/ui version 1.1.0

# Update changelog
# Update release notes
```

**2. Create Release PR:**
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0
# Update version numbers
# Update changelog
git commit -m "chore(release): v1.1.0"
git push origin release/v1.1.0
# Open PR to develop
```

**3. QA and Testing:**
- Run full test suite
- Test in staging environment
- Verify documentation
- Get approvals

**4. Merge and Tag:**
```bash
# Merge to main
git checkout main
git merge release/v1.1.0
git tag v1.1.0
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/v1.1.0
git push origin develop
```

**5. Deploy:**
- Build packages
- Publish to npm (if applicable)
- Deploy docs site
- Notify team

### Changelog Format

**Keep a CHANGELOG.md:**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-11-03

### Added
- New Button component with primary variant
- Color token for primary brand color
- Documentation for design system overview

### Changed
- Updated typography scale in design tokens
- Improved component testing setup

### Fixed
- Resolved color contrast issues in Button
- Fixed spacing inconsistency in Card component

### Deprecated
- Legacy color tokens (use semantic tokens instead)

### Removed
- Removed deprecated `outline` variant from Button

### Security
- Updated dependencies to address CVE-2025-1234
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn test --coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn build

  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn test:a11y
```

### Deployment Workflow

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: yarn build

      - name: Deploy to Production
        run: yarn deploy:prod
```

---

## Quality Gates

### Before Merge to Develop

- [ ] All CI checks pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Design system compliance checked

### Before Merge to Main

- [ ] Tested in staging environment
- [ ] QA approved
- [ ] Documentation complete
- [ ] Changelog updated
- [ ] Version bumped (if needed)

### Before Release

- [ ] Full test suite passes
- [ ] Accessibility tests pass
- [ ] Performance tests pass
- [ ] Documentation reviewed
- [ ] Release notes prepared

---

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear all caches
yarn clean
rm -rf node_modules
rm -rf .turbo
yarn install
yarn build
```

**Tests Failing:**
```bash
# Run tests in watch mode to debug
yarn test --watch

# Run specific test
yarn test Button.test.jsx --watch
```

**Type Errors:**
```bash
# Type check
yarn typecheck

# Fix TypeScript errors
# Run from package root
yarn workspace @kol/ui run typecheck
```

**Linting Errors:**
```bash
# Check linting
yarn lint

# Auto-fix
yarn lint --fix
```

---

## Related Documentation

**Foundation:**
- [1.0.0 Foundation: Repository Structure](1.0.0-foundation-repository-structure.md)
- [1.0.1 Foundation: Naming Conventions](1.0.1-foundation-naming-conventions.md)
- [1.1.0 Foundation: Build System](1.1.0-foundation-build-system.md)

**Design System:**
- [2.0.0 Design System: Overview](2.0.0-design-system-overview.md)

**Metadata:**
- [0.0.1 Metadata: Writing Guidelines](0.0.1-metadata-writing-guidelines.md)

---

**Last Updated:** 2025-11-03
**Next Review:** 2025-12-03
