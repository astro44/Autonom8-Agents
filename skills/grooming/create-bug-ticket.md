# create-bug-ticket

Generate a bug ticket from failure output.

## Purpose

Automatically create structured bug tickets from test failures, build errors, or QA findings. Ensures consistent bug reporting format and captures all relevant diagnostic information for efficient debugging.

## Platforms

All platforms (platform-agnostic)

## Input Schema

```json
{
  "failure_type": "test|build|qa|runtime",
  "source_ticket_id": "TICKET-001",
  "error_output": "Error message or stack trace",
  "context": {
    "platform": "web",
    "file_path": "src/components/Button.tsx",
    "line_number": 42,
    "test_name": "Button.spec.ts",
    "environment": "ci|local|staging"
  },
  "severity": "critical|high|medium|low",
  "project_dir": "/path/to/project"
}
```

- `failure_type` (required): Type of failure that triggered bug creation
- `source_ticket_id` (optional): Original ticket that caused the failure
- `error_output` (required): Raw error message, stack trace, or failure description
- `context` (required): Contextual information about the failure
- `severity` (optional): Bug severity, auto-detected if not provided
- `project_dir` (optional): Project directory for file resolution

## Failure Type Definitions

### test
- Unit test failure
- Integration test failure
- E2E test failure
- Includes: test name, assertion, expected vs actual

### build
- Compilation error
- Type error
- Lint failure
- Includes: file, line, error code

### qa
- Visual regression
- Accessibility violation
- Performance budget exceeded
- Includes: screenshot, baseline, diff

### runtime
- Console error
- Uncaught exception
- API failure
- Includes: stack trace, request/response

## Execution Steps

1. **Parse Error Output**: Extract structured information from raw error
2. **Detect Root Cause**: Analyze error pattern to identify likely cause
3. **Determine Severity**: Auto-detect if not provided based on:
   - Critical: Build broken, deployment blocked
   - High: Core functionality broken
   - Medium: Feature degraded but workaround exists
   - Low: Minor issue, cosmetic
4. **Generate Bug ID**: Create unique identifier (format: BUG-{source}-{sequence})
5. **Build Ticket JSON**: Construct complete bug ticket
6. **Suggest Fix**: If pattern recognized, suggest potential fix approach
7. **Return Ticket**: Structured bug ticket ready for tracking

## Output Schema

```json
{
  "skill": "create-bug-ticket",
  "status": "success|failure",
  "bug_ticket": {
    "id": "BUG-OXY-001-001",
    "title": "TypeError in Button component onClick handler",
    "status": "assigned",
    "priority": "high",
    "severity": "high",
    "type": "bug",
    "source_ticket": "OXY-001",
    "platform": "web",
    "description": "Auto-generated from test failure",
    "reproduction_steps": [
      "1. Navigate to /dashboard",
      "2. Click the Submit button",
      "3. Observe console error"
    ],
    "expected_behavior": "Button click triggers form submission",
    "actual_behavior": "TypeError: Cannot read property 'submit' of undefined",
    "error_details": {
      "type": "TypeError",
      "message": "Cannot read property 'submit' of undefined",
      "file": "src/components/Button.tsx",
      "line": 42,
      "stack_trace": "..."
    },
    "environment": {
      "platform": "web",
      "browser": "Chrome 120",
      "os": "macOS",
      "node_version": "20.10.0"
    },
    "suggested_fix": {
      "approach": "Add null check before accessing form.submit",
      "files_likely_affected": ["src/components/Button.tsx"],
      "confidence": "high"
    },
    "labels": ["bug", "auto-generated", "test-failure"],
    "created_at": "2024-01-03T10:30:00Z"
  },
  "next_action": "assign|investigate|duplicate_check"
}
```

### Status Values
- `success`: Bug ticket created successfully
- `failure`: Could not create ticket (insufficient information)

### Next Action Values
- `assign`: Ready to assign to developer
- `investigate`: Needs more information
- `duplicate_check`: May be duplicate of existing bug

## Severity Auto-Detection Rules

```
IF error contains "FATAL" OR "CRITICAL" OR build_blocked → critical
IF error in core_path (src/core/, src/auth/) → high
IF test_type = "e2e" AND failure_count > 3 → high
IF error is TypeError OR ReferenceError → medium
IF error is style OR cosmetic → low
ELSE → medium
```

## Error Handling

- Unparseable error output: Create ticket with raw error in description
- Missing context: Fill with "unknown" and flag for investigation
- Duplicate detection: Check against recent bugs, suggest if likely duplicate

## Examples

### Test Failure Bug
```json
{
  "skill": "create-bug-ticket",
  "status": "success",
  "bug_ticket": {
    "id": "BUG-OXY-042-001",
    "title": "ImpactChart fails to render with empty data",
    "status": "assigned",
    "priority": "high",
    "severity": "high",
    "type": "bug",
    "source_ticket": "OXY-042",
    "platform": "web",
    "description": "E2E test 'ImpactChart renders correctly' failed due to unhandled empty array case",
    "error_details": {
      "type": "Error",
      "message": "Cannot read property 'map' of undefined",
      "file": "src/components/Dashboard/ImpactChart.tsx",
      "line": 28
    },
    "suggested_fix": {
      "approach": "Add default empty array fallback: data ?? []",
      "files_likely_affected": ["src/components/Dashboard/ImpactChart.tsx"],
      "confidence": "high"
    }
  },
  "next_action": "assign"
}
```

### Build Failure Bug
```json
{
  "skill": "create-bug-ticket",
  "status": "success",
  "bug_ticket": {
    "id": "BUG-OXY-042-002",
    "title": "TypeScript compilation error: Property 'metrics' does not exist",
    "status": "assigned",
    "priority": "critical",
    "severity": "critical",
    "type": "bug",
    "source_ticket": "OXY-042",
    "platform": "web",
    "description": "Build blocked due to type error introduced in recent changes",
    "error_details": {
      "type": "TS2339",
      "message": "Property 'metrics' does not exist on type 'DashboardData'",
      "file": "src/components/Dashboard/ImpactChart.tsx",
      "line": 15
    },
    "suggested_fix": {
      "approach": "Add 'metrics' property to DashboardData interface in types.ts",
      "files_likely_affected": ["src/types.ts", "src/components/Dashboard/ImpactChart.tsx"],
      "confidence": "high"
    }
  },
  "next_action": "assign"
}
```
