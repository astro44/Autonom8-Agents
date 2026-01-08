# triage-bug

Classify and prioritize bug reports.

## Purpose

Analyzes bug reports to determine severity, affected components, and root cause category. Assigns priority based on impact and provides initial investigation hints.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "bug_id": "BUG-456",
  "title": "Login fails after password reset",
  "description": "Users report unable to login...",
  "steps_to_reproduce": ["1. Reset password", "2. Try to login"],
  "expected": "Login succeeds",
  "actual": "Error: Invalid credentials",
  "environment": "production",
  "affected_users": 150,
  "error_logs": "AuthError: Token mismatch at..."
}
```

- `bug_id` (required): Bug identifier
- `title` (required): Bug title
- `description` (required): Detailed description
- `steps_to_reproduce` (optional): Reproduction steps
- `expected` (optional): Expected behavior
- `actual` (optional): Actual behavior
- `environment` (optional): Environment affected
- `affected_users` (optional): User impact count
- `error_logs` (optional): Relevant error logs

## Severity Classification

| Severity | Criteria |
|----------|----------|
| critical | System down, data loss, security breach |
| high | Major feature broken, workaround difficult |
| medium | Feature degraded, workaround available |
| low | Minor issue, cosmetic, edge case |

## Root Cause Categories

- **auth**: Authentication/authorization
- **data**: Data corruption/validation
- **ui**: Display/interaction issues
- **perf**: Performance degradation
- **integration**: Third-party/API issues
- **config**: Configuration errors

## Output Schema

```json
{
  "skill": "triage-bug",
  "status": "success",
  "bug_id": "BUG-456",
  "classification": {
    "severity": "high",
    "priority": "P0",
    "category": "auth",
    "confidence": 0.87
  },
  "impact": {
    "affected_users": 150,
    "affected_features": ["login", "password-reset"],
    "revenue_impact": "potential"
  },
  "investigation_hints": [
    "Check token generation in password reset flow",
    "Verify token expiry timing",
    "Review recent auth service deployments"
  ],
  "similar_bugs": ["BUG-123", "BUG-234"],
  "suggested_assignee": "auth-team",
  "next_action": "investigate|hotfix|schedule"
}
```

## Examples

### Critical Bug
```json
{
  "skill": "triage-bug",
  "status": "success",
  "classification": {
    "severity": "critical",
    "priority": "P0",
    "category": "auth"
  },
  "next_action": "hotfix"
}
```

### Low Priority Bug
```json
{
  "skill": "triage-bug",
  "status": "success",
  "classification": {
    "severity": "low",
    "priority": "P3",
    "category": "ui"
  },
  "next_action": "schedule"
}
```
