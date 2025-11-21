---
description: Create a git commit with proper message formatting (NO AI attribution)
---

Create a git commit for the current changes following these strict rules:

## CRITICAL: No AI Attribution
- **NEVER** add "Generated with Claude Code"
- **NEVER** add "Co-Authored-By: Claude"
- **NEVER** add any AI attribution of any kind
- This is a hard requirement from LLM_RULES.md

## Process:

1. Run `git status` and `git diff --staged` to see what will be committed

2. If nothing is staged, ask the user what files to stage

3. Analyze the changes and draft a commit message that:
   - Follows conventional commit format: `type: description`
   - Types: feat, fix, refactor, docs, style, test, chore
   - Focuses on the "why" rather than the "what"
   - Is concise (1-2 sentences)
   - Uses present tense ("add" not "added")
   - Does NOT include any AI attribution

4. Show the user the proposed commit message and ask for approval

5. After approval, run:
   ```bash
   git commit -m "your message here"
   ```

6. Run `git status` after commit to verify success

## Example Commit Messages:

✅ Good:
- `feat: add custom stepper component for number inputs`
- `fix: remove excessive padding from input components`
- `refactor: reorganize icon system into active/library structure`
- `docs: add icon system documentation`

❌ Bad (has AI attribution):
- `feat: add custom stepper component

Generated with Claude Code`
- `fix: input padding

Co-Authored-By: Claude <noreply@anthropic.com>`

## Notes:
- Use `yarn` for any package manager commands (per LLM_RULES.md)
- Keep commits focused (one logical change per commit)
- Stage files carefully before committing
