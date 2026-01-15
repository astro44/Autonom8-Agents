---
name: review-validate-ticket
description: Pre-implementation ticket validation. Checks required fields, platform compatibility, and dependency status. Returns JSON with validation results.
---

# review-validate-ticket - Pre-Implementation Ticket Validation

Validate ticket structure and requirements before implementation begins.

## Input Schema

```json
{
  "ticket_path": "/path/to/ticket.json",
  "project_dir": "/path/to/project",
  "validate": {
    "required_fields": true,
    "platform": true,
    "dependencies": true
  }
}
```

## Validation Checks

### Required Fields

| Field | Required | Validation |
|-------|----------|------------|
| `id` | YES | Non-empty string |
| `title` | YES | Non-empty string |
| `description` | YES | Non-empty string |
| `acceptance_criteria` | YES | Array with at least 1 item |
| `scope.directories` | Recommended | Array of valid paths |
| `scope.files` | Recommended | Array of valid paths |

### Platform Validation

Check if ticket platform matches project.yaml:

```
ticket.platform == project.yaml.type
    YES → Valid
    NO  → Warning (may need different agent)
```

### Dependency Validation

Check if dependencies are satisfied:

```
For each ticket.dependencies:
    └── Check if dependency ticket is deployed
        YES → Continue
        NO  → Block with "waiting_for_dependency"
```

## Output Format

```json
{
  "skill": "review-validate-ticket",
  "status": "valid|invalid|blocked",
  "ticket_id": "TICKET-XXX",
  "platform_detected": "web",
  "validation": {
    "required_fields": {
      "passed": true,
      "missing": []
    },
    "platform": {
      "passed": true,
      "ticket_platform": "web",
      "project_platform": "web"
    },
    "dependencies": {
      "passed": true,
      "satisfied": ["TICKET-001"],
      "unsatisfied": []
    }
  },
  "errors": [],
  "warnings": [],
  "next_action": "proceed|fix|wait"
}
```

## Blocking Conditions

| Condition | Status | Next Action |
|-----------|--------|-------------|
| Missing required fields | invalid | fix |
| Unsatisfied dependencies | blocked | wait |
| Platform mismatch | valid (warning) | proceed |
| All checks pass | valid | proceed |

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Ticket file not found | Return `invalid` with `file_not_found` error |
| Invalid JSON in ticket | Return `invalid` with `parse_error` |
| project.yaml missing | Skip platform check, return warning |
| Circular dependencies | Return `blocked` with `circular_dependency` error |
| Self-dependency | Return `invalid` - ticket depends on itself |
| Empty acceptance_criteria | Return `invalid` - at least 1 criterion required |
| Deployed dependency missing | Return `blocked` - deployment may have failed |

## Usage Examples

**Basic ticket validation:**
```json
{
  "ticket_path": "/projects/oxygen_site/tickets/TICKET-OXY-001.json",
  "project_dir": "/projects/oxygen_site",
  "validate": {
    "required_fields": true,
    "platform": true,
    "dependencies": true
  }
}
```

**Quick field check only:**
```json
{
  "ticket_path": "/projects/app/tickets/TICKET-APP-001.json",
  "project_dir": "/projects/app",
  "validate": {
    "required_fields": true,
    "platform": false,
    "dependencies": false
  }
}
```

**Dependency chain validation:**
```json
{
  "ticket_path": "/projects/api/tickets/TICKET-API-005.json",
  "project_dir": "/projects/api",
  "validate": {
    "required_fields": true,
    "platform": true,
    "dependencies": true
  }
}
```
*Checks if TICKET-API-001 through TICKET-API-004 are deployed.*

**Cross-platform project:**
```json
{
  "ticket_path": "/projects/mono-repo/tickets/TICKET-MONO-001.json",
  "project_dir": "/projects/mono-repo/packages/web",
  "validate": {
    "required_fields": true,
    "platform": true,
    "dependencies": true
  }
}
```
*For mono-repos, point project_dir to the specific package.*

## Token Efficiency

- Fast JSON parsing
- Early exit on first blocking error
- ~1-3 second execution
- Returns actionable fix instructions
