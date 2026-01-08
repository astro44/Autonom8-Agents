# validate-ticket

Validate ticket JSON structure before processing.

## Purpose

Pre-flight validation of ticket files to ensure they conform to the expected schema before sprint execution begins. Catches structural issues early to prevent downstream failures.

## Platforms

All platforms (platform-agnostic validation)

## Input Schema

```json
{
  "ticket_path": "/path/to/ticket.json",
  "strict": false
}
```

- `ticket_path` (required): Absolute path to the ticket JSON file
- `strict` (optional): If true, fail on warnings; default false

## Validation Rules

### Required Fields
- `id`: Ticket identifier (string)
- `title`: Ticket title (string)
- `status`: Current status (assigned|in-progress|code-review|testing|deployed|failed)
- `platform`: Target platform (web|flutter|ios|android|python|golang|java|csharp|terraform|solidity|solana)

### Recommended Fields
- `description`: Detailed description
- `acceptance_criteria`: Array of criteria
- `files_to_modify`: Array of file paths
- `dependencies`: Array of dependent ticket IDs

### Schema Validation
1. Check JSON is valid and parseable
2. Verify all required fields exist and have correct types
3. Validate status is a known value
4. Validate platform is supported
5. Check file paths in files_to_modify exist (warning if not)
6. Verify dependencies reference valid ticket IDs (warning if unresolved)

## Execution Steps

1. Read ticket file from `ticket_path`
2. Parse JSON and validate structure
3. Check required fields
4. Validate field types and enum values
5. Run platform-specific validation if applicable
6. Collect errors and warnings
7. Return structured result

## Output Schema

```json
{
  "skill": "validate-ticket",
  "status": "success|failure",
  "ticket_id": "TICKET-001",
  "platform_detected": "web",
  "results": {
    "valid": true,
    "errors": [],
    "warnings": [
      {"field": "files_to_modify[2]", "message": "File does not exist: src/missing.ts"}
    ],
    "fields_checked": 12,
    "schema_version": "1.0"
  },
  "next_action": "proceed|fix|abort"
}
```

### Status Values
- `success`: Ticket is valid (may have warnings)
- `failure`: Ticket has errors that must be fixed

### Next Action Values
- `proceed`: Ticket is valid, continue to implementation
- `fix`: Ticket has issues, return to author
- `abort`: Critical error, cannot process

## Error Handling

- File not found: Return failure with clear error message
- Invalid JSON: Return failure with parse error details
- Missing required field: Return failure listing missing fields
- Invalid enum value: Return failure with valid options

## Examples

### Valid Ticket
```json
{
  "skill": "validate-ticket",
  "status": "success",
  "ticket_id": "OXY-001",
  "platform_detected": "web",
  "results": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "fields_checked": 15,
    "schema_version": "1.0"
  },
  "next_action": "proceed"
}
```

### Invalid Ticket
```json
{
  "skill": "validate-ticket",
  "status": "failure",
  "ticket_id": null,
  "platform_detected": null,
  "results": {
    "valid": false,
    "errors": [
      {"field": "id", "message": "Required field missing"},
      {"field": "platform", "message": "Invalid value 'nodejs', expected one of: web, flutter, ios, android, python, golang, java, csharp, terraform, solidity, solana"}
    ],
    "warnings": [],
    "fields_checked": 8,
    "schema_version": "1.0"
  },
  "next_action": "fix"
}
```
