---
id: pr-drafter-agent
provider: opencode
role: documentation
purpose: "Generate pull request descriptions, commit messages, and code review comments from diffs."
inputs:
  - repos/**/.git/
  - tickets/inbox/pr_context.json
  - context/kb/pr_templates.md
outputs:
  - tickets/drafts/pr_description.md
  - tickets/drafts/commit_messages.txt
  - tickets/drafts/review_comments.json
permissions:
  - read: repos
  - read: tickets/inbox
  - read: context
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent uses open-source models (like CodeLlama) to generate high-quality pull request descriptions, commit messages, and review comments. Optimized for efficiency and running locally without API limits.

# Workflow

1. **Diff Analysis**
   - Extract git diff
   - Identify changed files
   - Categorize changes
   - Calculate impact

2. **Change Summary**
   - Group related changes
   - Identify feature additions
   - Note bug fixes
   - Track refactoring

3. **PR Description Generation**
   - Write executive summary
   - List key changes
   - Note breaking changes
   - Add testing notes

4. **Commit Message Creation**
   - Follow conventional commits
   - Group atomic changes
   - Write clear descriptions
   - Add issue references

5. **Review Preparation**
   - Generate review checklist
   - Highlight risk areas
   - Suggest review focus
   - Create test scenarios

# Constraints

- **Local execution** - Runs on local hardware
- **Diff size limits** - Process diffs under 10MB
- **No external calls** - Fully offline capable
- **Fast response** - Optimize for speed over perfection

# Trigger

- Manual: `/agent-run pr-drafter-agent`
- Pre-commit hook
- PR creation workflow
- Git push events

# Example Command

```bash
opencode.sh --agent pr-drafter-agent --goal "generate PR description for current branch"
```

# Templates

## PR Description Template
```markdown
## Summary
Brief description of what this PR accomplishes

## Changes
- ✨ Feature: New user authentication system
- 🐛 Fix: Resolved memory leak in data processor
- ♻️ Refactor: Simplified error handling logic
- 📝 Docs: Updated API documentation

## Type of Change
- [ ] Bug fix (non-breaking change)
- [x] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [x] Code follows style guidelines
- [x] Self-review completed
- [x] Documentation updated
- [x] No new warnings

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123, References #456
```

## Commit Message Format
```
type(scope): subject

body

footer
```

### Examples
```
feat(auth): add OAuth2 login support

Implemented OAuth2 authentication flow with support for
Google and GitHub providers. Includes token refresh logic
and secure session management.

Closes #234
```

```
fix(api): prevent SQL injection in user search

Sanitized user input in search queries using parameterized
queries. Added input validation for special characters.

Security: High
```

# Output Format

## PR Description (pr_description.md)
```markdown
## 🎯 Summary
This PR implements the new payment processing module with Stripe integration

## 📋 Changes

### Features
- Integrated Stripe payment gateway
- Added subscription management
- Implemented webhook handlers

### Fixes
- Fixed decimal precision in price calculations
- Resolved timezone issues in billing cycles

### Refactoring
- Extracted payment logic to service layer
- Simplified error handling

## 📊 Impact Analysis
- **Files Changed:** 23
- **Lines Added:** 1,250
- **Lines Removed:** 450
- **Test Coverage:** 85%

## ⚠️ Breaking Changes
None

## ✅ Testing
- Added 45 unit tests
- Added 12 integration tests
- Manual testing with test Stripe account

## 📝 Documentation
- Updated API documentation
- Added Stripe setup guide
- Created troubleshooting guide
```

## Commit Messages (commit_messages.txt)
```
feat(payments): integrate Stripe payment gateway

feat(payments): add subscription management endpoints

fix(payments): correct decimal precision in calculations

refactor(payments): extract logic to service layer

test(payments): add comprehensive payment flow tests

docs(payments): add Stripe integration guide
```