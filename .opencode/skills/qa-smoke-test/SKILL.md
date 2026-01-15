---
name: qa-smoke-test
description: Fast pre-QA sanity check. Validates files exist, server responds, and basic page loads before running full test suite. Returns JSON with pass/fail status.
---

# qa-smoke-test - Fast Pre-QA Validation

Quick sanity check before running full QA. Catches obvious issues early to save time.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "checks": ["files_exist", "server_responds", "page_loads", "no_console_errors"]
}
```

## Checks Performed

### 1. Files Exist
Verify critical files from ticket.files_created exist:

```bash
for file in ${ticket.files_created}; do
  [ -f "$project_dir/$file" ] || echo "MISSING: $file"
done
```

### 2. Server Responds
Check dev server is running and healthy:

```bash
# Check if server is running
lsof -i :8080 | grep LISTEN

# Health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
# Expected: 200
```

### 3. Page Loads
Verify main entry point loads without errors:

```bash
# Quick Playwright check
npx playwright test --grep "@smoke" --timeout=10000
```

### 4. No Console Errors
Check browser console for errors on page load:

```javascript
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
await page.goto(url);
// errors.length should be 0
```

### 5. Critical Assets Load
Verify CSS/JS/images return 200:

```javascript
const failedRequests = [];
page.on('requestfailed', req => {
  failedRequests.push(req.url());
});
await page.goto(url, { waitUntil: 'networkidle' });
// failedRequests.length should be 0
```

## Output Format

```json
{
  "skill": "qa-smoke-test",
  "status": "pass|fail",
  "duration_ms": 2340,
  "checks": {
    "files_exist": {
      "passed": true,
      "total": 5,
      "missing": []
    },
    "server_responds": {
      "passed": true,
      "port": 8080,
      "status_code": 200
    },
    "page_loads": {
      "passed": true,
      "load_time_ms": 1200
    },
    "console_errors": {
      "passed": false,
      "errors": ["Uncaught TypeError: Cannot read property 'x' of undefined"]
    },
    "assets_load": {
      "passed": true,
      "total": 12,
      "failed": []
    }
  },
  "summary": {
    "total_checks": 5,
    "passed": 4,
    "failed": 1
  },
  "errors": [
    {
      "check": "console_errors",
      "message": "JavaScript error on page load",
      "details": "Uncaught TypeError in main.js"
    }
  ],
  "next_action": "proceed|fix"
}
```

## Decision Logic

```
Any check failed?
    YES → status: "fail", next_action: "fix"
    NO  → status: "pass", next_action: "proceed"
```

## Failure Handling

| Check | Failure | Recommendation |
|-------|---------|----------------|
| files_exist | Missing files | Check ticket implementation |
| server_responds | Server not running | Start dev server |
| page_loads | Page timeout | Check entry point HTML |
| console_errors | JS errors | Fix before proceeding |
| assets_load | 404 on assets | Check file paths |

## Usage Examples

**Basic smoke test:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-001",
  "checks": ["files_exist", "server_responds", "page_loads"]
}
```

**Full smoke test:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-001",
  "checks": ["files_exist", "server_responds", "page_loads", "no_console_errors", "assets_load"]
}
```

## When to Use

- **Before qa-run-tests**: Catch obvious failures fast
- **After implementation**: Quick validation before full QA
- **CI/CD pipeline**: Fast gate before expensive tests

## Token Efficiency

- Runs in ~2-5 seconds
- No full test suite execution
- Returns structured JSON, no prose
- Fails fast on first critical error
