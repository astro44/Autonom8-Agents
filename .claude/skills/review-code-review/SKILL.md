---
name: review-code-review
description: Automated code review for security, design tokens, and accessibility. Checks for XSS, hardcoded colors, missing ARIA attributes. Returns JSON with issues.
---

# review-code-review - Automated Code Review

Quick code review checking for common issues.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "files": ["src/components/Foo.js"],
  "checks": ["security", "design_tokens", "accessibility"]
}
```

## Review Checks

### Security (CRITICAL)

| Pattern | Severity | Fix |
|---------|----------|-----|
| `innerHTML = ` with variable | HIGH | Use `textContent` or DOM APIs |
| `eval()` with external data | CRITICAL | Remove, use safe alternatives |
| `document.write()` | MEDIUM | Use DOM APIs |
| Hardcoded credentials | CRITICAL | Move to env vars |
| `onclick="..."` inline handlers | MEDIUM | Use addEventListener |

### Design Tokens

| Pattern | Severity | Fix |
|---------|----------|-----|
| Hardcoded hex colors (`#fff`) | HIGH | Use `var(--color-*)` |
| Hardcoded px values | MEDIUM | Use `var(--spacing-*)` |
| Magic numbers in CSS | MEDIUM | Extract to design tokens |
| Inline styles with colors | HIGH | Use CSS classes |

### Accessibility

| Pattern | Severity | Fix |
|---------|----------|-----|
| `<img>` without `alt` | HIGH | Add `alt` attribute |
| Icon without `aria-label` | MEDIUM | Add label for screen readers |
| Non-semantic elements for buttons | HIGH | Use `<button>` |
| Missing `role` on interactive elements | MEDIUM | Add appropriate role |

## Output Format

```json
{
  "skill": "review-code-review",
  "status": "approved|rejected|needs_fixes",
  "files_reviewed": 3,
  "issues": [
    {
      "file": "src/components/Foo.js",
      "line": 42,
      "severity": "HIGH",
      "category": "security",
      "message": "innerHTML with variable data - XSS risk",
      "fix": "Use textContent for plain text or sanitize input"
    }
  ],
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 0
  },
  "errors": [],
  "warnings": [],
  "next_action": "proceed|fix|review"
}
```

## Decision Logic

| Issues Found | Status | Next Action |
|--------------|--------|-------------|
| 0 issues | approved | proceed |
| Only LOW/MEDIUM | approved | proceed (with warnings) |
| Any HIGH | needs_fixes | fix |
| Any CRITICAL | rejected | fix (mandatory) |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `file_not_found` | File path doesn't exist | Check ticket files_created |
| `parse_error` | Invalid JS/CSS syntax | Run linter first |
| `binary_file` | Attempted to review image/binary | Skip, return warning |
| `permission_denied` | Can't read file | Check file permissions |
| `empty_file` | File has no content | Skip with warning |

## Usage Examples

**Security-focused review:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-001",
  "files": [
    "src/components/UserInput.js",
    "src/utils/api.js"
  ],
  "checks": ["security"]
}
```

**Full review (all checks):**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-002",
  "files": [
    "src/components/Dashboard.jsx",
    "src/styles/dashboard.css"
  ],
  "checks": ["security", "design_tokens", "accessibility"]
}
```

**Design system compliance:**
```json
{
  "project_dir": "/projects/design-system",
  "ticket_id": "TICKET-DS-001",
  "files": [
    "src/components/Button.jsx",
    "src/components/Card.jsx"
  ],
  "checks": ["design_tokens", "accessibility"]
}
```

**Single file quick check:**
```json
{
  "project_dir": "/projects/api-client",
  "ticket_id": "TICKET-API-001",
  "files": ["src/auth/login.js"],
  "checks": ["security"]
}
```

## Token Efficiency

- Pattern-based scanning, not full AST
- Returns only actionable issues
- ~5-15 second execution
- Batches file reads for speed
