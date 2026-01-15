---
name: deploy-check
description: Pre-deployment validation. Verifies files exist, no broken references, build succeeds, and critical paths work before marking ticket deployed.
---

# deploy-check - Pre-Deployment Validation

Final validation before marking a ticket as deployed. Ensures all files exist, references are valid, and the build succeeds.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "ticket_path": "/path/to/ticket.json",
  "checks": ["files_exist", "imports_valid", "build", "smoke_test"]
}
```

## Instructions

### 1. Verify files_created Exist

```bash
# For each file in ticket.files_created
for file in $(jq -r '.files_created[].path' "$ticket_path"); do
    if [[ ! -f "$project_dir/$file" ]]; then
        echo "MISSING: $file"
    fi
done
```

### 2. Validate Import References

```bash
# Check all imports in created files resolve
for file in $(jq -r '.files_created[].path' "$ticket_path" | grep -E '\.(js|ts)$'); do
    # Extract imports and verify targets exist
    grep -E "^import .* from ['\"]" "$project_dir/$file"
done
```

### 3. Run Build

```bash
# Detect build system and run
if [[ -f "package.json" ]]; then
    npm run build 2>&1
elif [[ -f "Makefile" ]]; then
    make build 2>&1
elif [[ -f "go.mod" ]]; then
    go build ./... 2>&1
fi
```

### 4. Smoke Test Critical Paths

```bash
# Start server and test critical endpoints
python3 -m http.server 8080 &
SERVER_PID=$!
sleep 2

# Test main page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/

# Cleanup
kill $SERVER_PID
```

## Output Format

```json
{
  "skill": "deploy-check",
  "status": "ready|blocked|failed",
  "ticket_id": "TICKET-OXY-003",
  "checks": {
    "files_exist": {
      "passed": true,
      "expected": 5,
      "found": 5,
      "missing": []
    },
    "imports_valid": {
      "passed": true,
      "checked": 12,
      "broken": []
    },
    "build": {
      "passed": true,
      "duration_ms": 3200,
      "warnings": 2,
      "errors": 0
    },
    "smoke_test": {
      "passed": true,
      "endpoints_tested": 3,
      "all_200": true
    }
  },
  "errors": [],
  "warnings": ["Build produced 2 warnings"],
  "next_action": "deploy|fix"
}
```

## Check Details

| Check | What it Validates | Blocking |
|-------|-------------------|----------|
| `files_exist` | All files_created are on disk | YES |
| `imports_valid` | No broken import statements | YES |
| `build` | Build completes without errors | YES |
| `smoke_test` | Server starts, pages load | YES |
| `lint_clean` | No lint errors (optional) | NO |
| `tests_pass` | Unit tests pass (optional) | NO |

## Decision Logic

```
Any files missing?
    YES → status: "blocked", next_action: "fix"

Any broken imports?
    YES → status: "blocked", next_action: "fix"

Build failed?
    YES → status: "failed", next_action: "fix"

Smoke test failed?
    YES → status: "failed", next_action: "fix"

All checks pass?
    YES → status: "ready", next_action: "deploy"
```

## Usage Examples

**Full pre-deployment check:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-003",
  "ticket_path": "/projects/oxygen_site/tickets/sprint_current/testing/TICKET-OXY-003.json",
  "checks": ["files_exist", "imports_valid", "build", "smoke_test"]
}
```

**Quick file check only:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-003",
  "ticket_path": "/projects/oxygen_site/tickets/sprint_current/testing/TICKET-OXY-003.json",
  "checks": ["files_exist"]
}
```

**Build verification:**
```json
{
  "project_dir": "/projects/api-service",
  "ticket_id": "TICKET-API-001",
  "ticket_path": "/projects/api-service/tickets/testing/TICKET-API-001.json",
  "checks": ["files_exist", "build"]
}
```

## Token Efficiency

- File system checks (no LLM)
- Parallelized validation
- ~5-30 second execution
- Returns actionable blockers
