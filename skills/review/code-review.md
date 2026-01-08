# code-review

Automated code review for implementation quality and best practices.

## Purpose

Reviews code changes for quality issues, security vulnerabilities, performance concerns, and adherence to project conventions. Returns structured feedback with severity levels and suggested fixes.

## Platforms

All platforms (language-aware)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "files": ["src/api.ts", "src/utils.ts"],
  "diff_only": true,
  "base_branch": "main",
  "checks": ["security", "performance", "style", "complexity"],
  "severity_threshold": "warning"
}
```

- `project_dir` (required): Root directory of project
- `files` (optional): Specific files to review (default: changed files)
- `diff_only` (optional): Only review changed lines
- `base_branch` (optional): Branch to diff against
- `checks` (optional): Categories to check
- `severity_threshold` (optional): Minimum severity to report

## Review Categories

### Security
- SQL injection patterns
- XSS vulnerabilities
- Hardcoded secrets/credentials
- Unsafe deserialization
- Path traversal risks

### Performance
- N+1 query patterns
- Unnecessary re-renders
- Missing memoization
- Inefficient algorithms
- Large bundle imports

### Style
- Naming conventions
- File organization
- Import ordering
- Comment quality
- Code formatting

### Complexity
- Cyclomatic complexity > 10
- Deep nesting (> 4 levels)
- Long functions (> 50 lines)
- Large files (> 500 lines)
- High coupling

## Output Schema

```json
{
  "skill": "code-review",
  "status": "pass|warnings|issues",
  "summary": {
    "files_reviewed": 5,
    "total_issues": 12,
    "by_severity": {
      "critical": 1,
      "error": 3,
      "warning": 8
    }
  },
  "issues": [
    {
      "file": "src/api.ts",
      "line": 45,
      "severity": "critical",
      "category": "security",
      "rule": "sql-injection",
      "message": "Unsanitized user input in SQL query",
      "snippet": "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
      "suggestion": "Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])"
    }
  ],
  "metrics": {
    "avg_complexity": 8.2,
    "max_complexity": 15,
    "coverage_estimate": 72
  },
  "next_action": "fix|approve|discuss"
}
```

## Error Handling

- Parse error: Return with syntax location
- Unknown language: Return partial review
- Large file: Review in chunks
- Binary file: Skip with note

## Examples

### Clean Review
```json
{
  "skill": "code-review",
  "status": "pass",
  "summary": {
    "files_reviewed": 8,
    "total_issues": 0
  },
  "next_action": "approve"
}
```

### Issues Found
```json
{
  "skill": "code-review",
  "status": "issues",
  "summary": {
    "files_reviewed": 5,
    "total_issues": 4,
    "by_severity": {"error": 2, "warning": 2}
  },
  "next_action": "fix"
}
```
