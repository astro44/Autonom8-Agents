# validate-scope

Validate that implementation stays within defined scope boundaries.

## Purpose

Checks that code changes only touch files and directories that were authorized in the ticket scope. Prevents scope creep and unauthorized modifications to critical files.

## Platforms

All platforms

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-123",
  "allowed_dirs": ["src/features/auth", "src/components/forms"],
  "allowed_patterns": ["*.ts", "*.tsx", "*.css"],
  "forbidden_patterns": ["*.config.*", "*.env*", "package.json"],
  "files_changed": ["src/features/auth/login.ts", "src/config/app.ts"]
}
```

- `project_dir` (required): Root directory of project
- `ticket_id` (required): Ticket being validated
- `allowed_dirs` (required): Directories in scope
- `allowed_patterns` (optional): File patterns allowed
- `forbidden_patterns` (optional): Patterns always forbidden
- `files_changed` (optional): Files to validate (default: git diff)

## Validation Rules

### Directory Scope
- Files must be within allowed_dirs
- Subdirectories are included
- Parent directories are excluded

### File Patterns
- Check against allowed_patterns
- Check against forbidden_patterns
- Config files require explicit approval

### Sensitive Files
- .env files always flagged
- credentials.* always flagged
- *.secret.* always flagged

## Output Schema

```json
{
  "skill": "validate-scope",
  "status": "in_scope|out_of_scope|needs_review",
  "ticket_id": "TICKET-123",
  "summary": {
    "files_checked": 8,
    "in_scope": 6,
    "out_of_scope": 2,
    "sensitive": 0
  },
  "files": {
    "in_scope": [
      {"file": "src/features/auth/login.ts", "reason": "within allowed_dirs"}
    ],
    "out_of_scope": [
      {
        "file": "src/config/app.ts",
        "reason": "outside allowed_dirs",
        "suggestion": "Add src/config to scope or move changes"
      }
    ],
    "sensitive": []
  },
  "next_action": "proceed|expand_scope|reject"
}
```

## Error Handling

- No scope defined: Return error with setup hint
- Git not available: Use files_changed parameter
- Empty changeset: Return success with note

## Examples

### All In Scope
```json
{
  "skill": "validate-scope",
  "status": "in_scope",
  "summary": {
    "files_checked": 12,
    "in_scope": 12,
    "out_of_scope": 0
  },
  "next_action": "proceed"
}
```

### Scope Violation
```json
{
  "skill": "validate-scope",
  "status": "out_of_scope",
  "summary": {
    "files_checked": 8,
    "in_scope": 5,
    "out_of_scope": 3
  },
  "files": {
    "out_of_scope": [
      {"file": "package.json", "reason": "forbidden_pattern match"}
    ]
  },
  "next_action": "expand_scope"
}
```
