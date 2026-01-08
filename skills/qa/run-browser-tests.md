# run-browser-tests

Execute browser-based E2E tests using Playwright or Cypress.

## Purpose

Runs end-to-end browser tests against a running application. Handles browser lifecycle, captures screenshots on failure, and returns structured results with timing and failure details.

## Platforms

Web (auto-detected from package.json)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "base_url": "http://localhost:3000",
  "browser": "chromium|firefox|webkit|all",
  "headless": true,
  "filter": "pattern or test name",
  "timeout": 60000,
  "retries": 2,
  "screenshot_on_failure": true
}
```

- `project_dir` (required): Root directory of target project
- `base_url` (optional): URL to test against, default from config
- `browser` (optional): Browser to use, default "chromium"
- `headless` (optional): Run headless, default true
- `filter` (optional): Filter pattern for specific tests
- `timeout` (optional): Test timeout in ms, default 60000
- `retries` (optional): Retry count on failure, default 2
- `screenshot_on_failure` (optional): Capture screenshots, default true

## Framework Detection

### Playwright (playwright.config.ts/js)
```bash
npx playwright test $filter --project=$browser --reporter=json
```

### Cypress (cypress.config.ts/js)
```bash
npx cypress run --browser $browser --spec "$filter" --reporter json
```

## Execution Steps

1. **Detect Framework**: Check for playwright.config or cypress.config
2. **Verify Server**: Ensure base_url is accessible
3. **Build Command**: Construct test command with options
4. **Execute Tests**: Run with timeout and capture output
5. **Collect Artifacts**: Gather screenshots, videos, traces
6. **Parse Results**: Extract pass/fail from reporter output
7. **Return Summary**: Include failures and artifact paths

## Output Schema

```json
{
  "skill": "run-browser-tests",
  "status": "success|failure|partial",
  "framework": "playwright|cypress",
  "browser": "chromium",
  "results": {
    "total": 24,
    "passed": 22,
    "failed": 2,
    "skipped": 0,
    "duration_ms": 45000,
    "failures": [
      {
        "test": "login.spec.ts > should redirect after login",
        "error": "Timeout waiting for selector #dashboard",
        "screenshot": "test-results/login-failure.png",
        "trace": "test-results/login-trace.zip"
      }
    ]
  },
  "artifacts": {
    "screenshots": ["test-results/*.png"],
    "videos": ["test-results/*.webm"],
    "traces": ["test-results/*.zip"]
  },
  "base_url_tested": "http://localhost:3000",
  "next_action": "fix|proceed|investigate"
}
```

## Error Handling

- Server not running: Return failure with startup instructions
- Browser launch failed: Try fallback browser or return error
- Timeout exceeded: Kill process, save partial results
- Missing dependencies: Return with `npx playwright install` hint

## Examples

### All Tests Pass
```json
{
  "skill": "run-browser-tests",
  "status": "success",
  "framework": "playwright",
  "browser": "chromium",
  "results": {
    "total": 45,
    "passed": 45,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 62000,
    "failures": []
  },
  "next_action": "proceed"
}
```

### Test Failures
```json
{
  "skill": "run-browser-tests",
  "status": "failure",
  "framework": "playwright",
  "browser": "chromium",
  "results": {
    "total": 45,
    "passed": 43,
    "failed": 2,
    "skipped": 0,
    "duration_ms": 58000,
    "failures": [
      {
        "test": "checkout.spec.ts > should complete purchase",
        "error": "Element #submit-btn not visible",
        "screenshot": "test-results/checkout-failure.png"
      }
    ]
  },
  "next_action": "fix"
}
```
