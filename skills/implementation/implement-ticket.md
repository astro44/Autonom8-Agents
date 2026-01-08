# implement-ticket

Execute implementation of a validated ticket with platform detection.

## Purpose

Core implementation skill that takes a validated ticket and produces working code. Automatically detects platform from project context and applies appropriate patterns, conventions, and best practices.

## Platforms

All platforms (auto-detected)

## Input Schema

```json
{
  "ticket_path": "/path/to/ticket.json",
  "project_dir": "/path/to/project",
  "context_file": "/path/to/CONTEXT.md",
  "dry_run": false,
  "allow_tools": true
}
```

- `ticket_path` (required): Path to validated ticket JSON
- `project_dir` (required): Root directory of target project
- `context_file` (optional): Path to CONTEXT.md for project conventions
- `dry_run` (optional): If true, plan only without file changes
- `allow_tools` (optional): If true, enable file creation/modification

## Platform Detection

Detect platform from project structure:

```
IF pubspec.yaml EXISTS → flutter
IF go.mod EXISTS → golang
IF requirements.txt OR pyproject.toml EXISTS → python
IF *.tf EXISTS → terraform
IF foundry.toml OR contracts/*.sol EXISTS → solidity
IF Anchor.toml EXISTS → solana
IF package.json + (index.html OR src/) → web
IF *.xcodeproj OR Package.swift → ios
IF app/build.gradle → android
ELSE → unknown
```

## Execution Steps

1. **Load Ticket**: Read and parse ticket JSON from `ticket_path`
2. **Detect Platform**: Scan `project_dir` for platform indicators
3. **Load Context**: Read CONTEXT.md for coding conventions
4. **Plan Implementation**:
   - Identify files to create/modify
   - Determine implementation order
   - Map acceptance criteria to code changes
5. **Execute Changes** (if not dry_run):
   - Create new files with proper structure
   - Modify existing files preserving patterns
   - Add tests if required by platform
6. **Validate Results**:
   - Check files were created/modified
   - Verify no syntax errors
   - Confirm acceptance criteria addressed
7. **Return Summary**: Structured JSON with results

## Platform-Specific Rules

### Web (React/Vue/Angular)
- Follow component patterns from CONTEXT.md
- Use existing CSS methodology (BEM, Tailwind, etc.)
- Import from established barrel files
- Add Playwright test stubs if ui-test-gen enabled

### Flutter
- Follow widget patterns from CONTEXT.md
- Use existing state management (Provider, Bloc, Riverpod)
- Add golden tests if visual-qa-flutter enabled

### Python
- Follow PEP8 and project conventions
- Use existing patterns for async/sync
- Add pytest tests with fixtures

### Golang
- Follow project module structure
- Use established error handling patterns
- Add table-driven tests

### Terraform
- Follow module patterns
- Use existing variable conventions
- Include validation blocks

## Output Schema

```json
{
  "skill": "implement-ticket",
  "status": "success|failure|partial",
  "ticket_id": "TICKET-001",
  "platform_detected": "web",
  "results": {
    "files_created": [
      {"path": "src/components/Button.tsx", "lines": 45}
    ],
    "files_modified": [
      {"path": "src/index.ts", "changes": "Added export"}
    ],
    "tests_added": [
      {"path": "tests/Button.spec.ts", "type": "playwright"}
    ],
    "acceptance_criteria_addressed": [
      {"criterion": "Button displays loading state", "status": "implemented"}
    ],
    "warnings": []
  },
  "next_action": "verify|review|fix"
}
```

### Status Values
- `success`: All changes completed successfully
- `partial`: Some changes completed, others blocked
- `failure`: Implementation failed, no changes made

### Next Action Values
- `verify`: Run tests to verify implementation
- `review`: Ready for code review
- `fix`: Issues found, needs correction

## Error Handling

- Platform detection fails: Return failure with guidance
- File conflict: Return failure, don't overwrite without explicit flag
- Syntax error in generated code: Return failure with error details
- Missing dependencies: Return partial with dependency list

## Examples

### Successful Implementation
```json
{
  "skill": "implement-ticket",
  "status": "success",
  "ticket_id": "OXY-042",
  "platform_detected": "web",
  "results": {
    "files_created": [
      {"path": "src/components/Dashboard/ImpactChart.tsx", "lines": 87},
      {"path": "src/components/Dashboard/ImpactChart.css", "lines": 34}
    ],
    "files_modified": [
      {"path": "src/components/Dashboard/index.ts", "changes": "Added ImpactChart export"}
    ],
    "tests_added": [
      {"path": "tests/e2e/impact-chart.spec.ts", "type": "playwright"}
    ],
    "acceptance_criteria_addressed": [
      {"criterion": "Chart displays impact metrics", "status": "implemented"},
      {"criterion": "Chart is responsive", "status": "implemented"}
    ],
    "warnings": []
  },
  "next_action": "verify"
}
```

### Dry Run (Planning Only)
```json
{
  "skill": "implement-ticket",
  "status": "success",
  "ticket_id": "OXY-042",
  "platform_detected": "web",
  "results": {
    "dry_run": true,
    "planned_files_create": [
      "src/components/Dashboard/ImpactChart.tsx",
      "src/components/Dashboard/ImpactChart.css"
    ],
    "planned_files_modify": [
      "src/components/Dashboard/index.ts"
    ],
    "estimated_lines": 120,
    "dependencies_required": []
  },
  "next_action": "review"
}
```
