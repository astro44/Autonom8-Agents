---
name: validate-ticket
description: Pre-decomposition ticket validation. Fast structural check for required fields, platform detection, and dependency status. Blocks invalid tickets early.
---

# validate-ticket - Pre-Decomposition Ticket Validation

Lightweight pre-flight check that validates ticket structure before decomposition begins. Catches structural issues early to avoid wasted LLM calls.

## Input Schema

```json
{
  "ticket_path": "/path/to/ticket.json",
  "ticket_id": "TICKET-XXX",
  "validate": {
    "required_fields": true,
    "platform": true,
    "dependencies": true
  }
}
```

## Instructions

### 1. Load and Parse Ticket

```bash
# Read ticket JSON
cat "$ticket_path" | jq .

# Quick structure validation
jq -e '.id and .title and .description' "$ticket_path"
```

### 2. Required Fields Check

| Field | Required | Validation |
|-------|----------|------------|
| `id` | YES | Non-empty, matches ticket_id param |
| `title` | YES | Non-empty string |
| `description` | YES | Non-empty string, >10 chars |
| `acceptance_criteria` | YES | Array with >=1 item |
| `scope.allowed_directories` | Recommended | Array of paths |

### 3. Platform Detection

Detect platform from ticket or project.yaml:

```
ticket.platform exists?
    YES → Use ticket.platform
    NO  → Infer from scope.allowed_directories:
          - src/components → "web"
          - lib/src → "flutter"
          - Sources/ → "ios"
          - contracts/ → "solidity"
          - terraform/ → "infrastructure"
```

### 4. Dependency Check

```
ticket.dependencies exists and not empty?
    YES → For each dependency:
          └── Check tickets/sprint_current/deployed/{dep}.json exists
              YES → satisfied
              NO  → unsatisfied (blocking)
    NO  → Skip (no dependencies)
```

## Output Format

```json
{
  "skill": "validate-ticket",
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
      "detected": "web"
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

## Decision Logic

```
Missing required fields?
    YES → status: "invalid", next_action: "fix"

Unsatisfied dependencies?
    YES → status: "blocked", next_action: "wait"

Platform mismatch with project.yaml?
    YES → Add warning, continue

All checks pass?
    YES → status: "valid", next_action: "proceed"
```

## Error Types

| Error | Severity | Blocking |
|-------|----------|----------|
| `missing_id` | CRITICAL | YES |
| `missing_title` | CRITICAL | YES |
| `missing_description` | CRITICAL | YES |
| `empty_acceptance_criteria` | HIGH | YES |
| `unsatisfied_dependency` | HIGH | YES (blocked) |
| `platform_mismatch` | LOW | NO (warning) |

## Usage Examples

**Basic validation:**
```json
{
  "ticket_path": "/projects/oxygen_site/tickets/TICKET-OXY-001.json",
  "ticket_id": "TICKET-OXY-001",
  "validate": {
    "required_fields": true,
    "platform": true,
    "dependencies": true
  }
}
```

**Fields only (skip dependency check):**
```json
{
  "ticket_path": "/projects/app/tickets/TICKET-APP-001.json",
  "ticket_id": "TICKET-APP-001",
  "validate": {
    "required_fields": true,
    "platform": false,
    "dependencies": false
  }
}
```

## Difference from review-validate-ticket

| Aspect | validate-ticket | review-validate-ticket |
|--------|-----------------|------------------------|
| When | Before decomposition | Before implementation |
| Speed | Fast (<1s) | Moderate (1-3s) |
| Depth | Structural only | Includes project context |
| Blocking | Blocks decomposition | Blocks implementation |

## Token Efficiency

- JSON parsing only, no LLM inference
- Early exit on first blocking error
- ~0.5-1 second execution
- Returns structured JSON for programmatic use
