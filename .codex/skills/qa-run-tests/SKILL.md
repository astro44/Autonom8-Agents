---
name: qa-run-tests
description: Run Playwright tests with intelligent port detection. Reuses existing dev servers to avoid port conflicts. Returns JSON with test results and server status.
---

# qa-run-tests - Smart Test Runner

Run tests for a ticket with intelligent port detection and server reuse.

## Input Schema

```json
{
  "ticket_id": "TICKET-XXX",
  "project_dir": "/path/to/project",
  "scope": "ticket|changed|all",
  "bail": true,
  "fix": false
}
```

## Behavior

### 1. Port Detection (CRITICAL)

Before starting any server, check if a dev server is already running:

```bash
# Check if port 8080 is in use
lsof -i :8080 | grep LISTEN

# Check if port 8081 is in use (fallback)
lsof -i :8081 | grep LISTEN

# Check for running dev server processes
pgrep -f "python.*http.server|python.*SimpleHTTP|npx serve|live-server"
```

**Port Decision Logic:**
1. If port 8080 is in use AND it's our project's server → REUSE (don't start new)
2. If port 8080 is in use by another process → use port 8081 or next available
3. If no server running → start new server on port 8080

### 2. Server Reuse Protocol

```
project_dir contains running server?
    YES → Get PID and verify it's our server
          └── Use existing server URL (http://localhost:8080)
    NO  → Start new server
          └── Record PID for cleanup
```

### 3. Test Execution

Run Playwright tests with the detected/started server:

```bash
# If using existing server
PLAYWRIGHT_BASE_URL=http://localhost:8080 npx playwright test tests/

# If started new server, use that URL
```

### 4. Output Format

```json
{
  "skill": "qa-run-tests",
  "status": "success|failure|partial",
  "server": {
    "reused": true,
    "port": 8080,
    "pid": 12345,
    "url": "http://localhost:8080"
  },
  "tests": {
    "passed": 5,
    "failed": 0,
    "skipped": 1
  },
  "errors": [],
  "warnings": [],
  "next_action": "proceed|fix|review"
}
```

## Implementation Instructions

1. **Check for existing server first**
   - Use `lsof -i :8080` to detect running servers
   - Parse output to verify it's our dev server (check working directory)

2. **Start server only if needed**
   ```bash
   # Only if no server found
   cd $project_dir
   python3 -m http.server 8080 &
   SERVER_PID=$!
   ```

3. **Run tests with proper URL**
   ```bash
   PLAYWRIGHT_BASE_URL=http://localhost:$PORT npx playwright test --reporter=json
   ```

4. **Parse test results and return JSON**

5. **Do NOT kill server if it was reused** (preserve for next test run)

## Error Handling

| Scenario | Action |
|----------|--------|
| Port 8080 in use by unknown process | Try 8081, 8082... up to 8099 |
| No available ports | Return error with "next_action": "fix" |
| Tests fail | Return "status": "failure" with error details |
| Server startup fails | Return "status": "failure" with server error |

## Usage Examples

**Run all tests for a ticket:**
```json
{
  "ticket_id": "TICKET-OXY-001",
  "project_dir": "/projects/oxygen_site",
  "scope": "ticket"
}
```

**Run only changed file tests (CI mode):**
```json
{
  "ticket_id": "TICKET-OXY-001",
  "project_dir": "/projects/oxygen_site",
  "scope": "changed",
  "bail": true
}
```

**Run full test suite:**
```json
{
  "ticket_id": "TICKET-OXY-001",
  "project_dir": "/projects/oxygen_site",
  "scope": "all",
  "bail": false
}
```

**Auto-fix mode (update snapshots):**
```json
{
  "ticket_id": "TICKET-OXY-001",
  "project_dir": "/projects/oxygen_site",
  "scope": "ticket",
  "fix": true
}
```

## Token Efficiency

- Uses bash commands, not full agent context
- Returns structured JSON, not prose
- Reuses servers to avoid startup overhead
- ~10-60 second execution depending on test count
