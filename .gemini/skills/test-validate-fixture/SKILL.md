---
name: test-validate-fixture
description: Validate UI component fixture in browser. Opens test page, checks rendering, captures console errors and screenshots.
---

# test-validate-fixture - Component Fixture Validator

Validates that a component test fixture renders correctly in the browser. Uses MCP browser-verify tools to capture screenshots, console errors, and network issues.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "fixture_path": "src/tests/metric-card.html",
  "expected_elements": ["[data-testid='metric-card']", ".metric-value"],
  "wait_for_selector": "[data-testid='metric-card']",
  "timeout": 10000,
  "viewport": {"width": 1280, "height": 720},
  "screenshot": true,
  "dev_server": {
    "active_port": 8080,
    "base_url": "http://localhost:8080",
    "src_root": "src"
  }
}
```

## Instructions

### 1. Use Existing Dev Server (CRITICAL)

**IMPORTANT**: If `dev_server` is provided in the input, USE IT! Do NOT start a new server.

```javascript
// FIRST: Check if dev_server is provided
if (input.dev_server && input.dev_server.active_port > 0) {
  // USE THE EXISTING SERVER - DO NOT START NEW
  const serverUrl = input.dev_server.base_url; // e.g., "http://localhost:8080"
  const srcRoot = input.dev_server.src_root;   // e.g., "src"
  console.log(`Using existing dev server at ${serverUrl}`);
} else {
  // Only start new server if no existing server provided
  const server = await mcp.browser_verify.start_dev_server({
    projectPath: projectDir,
    serverType: "node"
  });
  // Returns: { serverId, port, url }
}
```

### 2. Construct Fixture URL

```javascript
// Use the appropriate server URL based on whether dev_server was provided
const serverUrl = (input.dev_server && input.dev_server.base_url)
  ? input.dev_server.base_url
  : server.url;

// IMPORTANT: Strip the src_root prefix from fixture_path when using dev_server
// Because the server serves FROM src/, the URL path should NOT include "src/"
// fixture_path: src/tests/metric-card.html
// dev_server.src_root: "src"
// URL path should be: tests/metric-card.html (without src/ prefix)

let urlPath = fixturePath;
if (input.dev_server && input.dev_server.src_root) {
  const srcRoot = input.dev_server.src_root;
  // Strip "src/" prefix if fixture_path starts with it
  if (urlPath.startsWith(srcRoot + '/')) {
    urlPath = urlPath.substring(srcRoot.length + 1);
  }
}

const fixtureUrl = `${serverUrl}/${urlPath}`;
// Result: http://localhost:8080/tests/metric-card.html (NOT /src/tests/...)
```

### 3. Load and Verify Page

Use MCP verify_page or full_verification:

```javascript
const result = await mcp.browser_verify.verify_page({
  url: fixtureUrl,
  screenshot: true,
  screenshotPath: `${projectDir}/src/tests/screenshots/metric-card.png`,
  waitFor: 3000
});
```

### 4. Check Initialization Status

Wait for component initialization using Playwright hooks:

```javascript
// The fixture exposes these test utilities:
await page.waitForFunction(() => window.__isInitialized?.() === true, {
  timeout: input.timeout || 10000
});

// Get component instance for inspection
const instance = await page.evaluate(() => window.__getTestInstance?.());
```

### 5. Validate Expected Elements

```javascript
for (const selector of expectedElements) {
  const element = await page.locator(selector);

  if (await element.count() === 0) {
    errors.push(`Missing element: ${selector}`);
  } else if (!(await element.isVisible())) {
    warnings.push(`Element hidden: ${selector}`);
  }
}
```

### 6. Collect Console Errors

```javascript
// Browser-verify captures console output
const consoleErrors = result.consoleErrors || [];
const jsErrors = consoleErrors.filter(e => e.type === 'error');

if (jsErrors.length > 0) {
  status = 'failure';
  errors.push(...jsErrors.map(e => e.message));
}
```

### 7. Check Network Failures

```javascript
// Browser-verify captures network failures
const networkErrors = result.networkErrors || [];
const failedRequests = networkErrors.filter(r => r.status >= 400);

if (failedRequests.length > 0) {
  errors.push(...failedRequests.map(r => `${r.status}: ${r.url}`));
}
```

### 8. Cleanup

```javascript
// ONLY stop the server if we started it (not provided via dev_server)
if (!input.dev_server || !input.dev_server.active_port) {
  await mcp.browser_verify.stop_dev_server({
    serverId: server.serverId
  });
}
// If dev_server was provided, DO NOT stop it - it's managed externally
```

## Output Format

```json
{
  "skill": "test-validate-fixture",
  "status": "success|warning|failure",
  "fixture_url": "http://localhost:3000/src/tests/metric-card.html",
  "initialization": {
    "success": true,
    "time_ms": 1234
  },
  "elements_found": {
    "[data-testid='metric-card']": true,
    ".metric-value": true
  },
  "screenshot": "src/tests/screenshots/metric-card.png",
  "console_errors": [],
  "network_errors": [],
  "warnings": [
    "Element .subtitle not found (optional)"
  ],
  "errors": [],
  "next_action": "proceed|fix_component|fix_fixture"
}
```

## Validation Criteria

| Check | Pass | Warning | Fail |
|-------|------|---------|------|
| Page loads | 200 status | - | 404, 500 |
| Init completes | `__isInitialized()` true | - | Timeout |
| Required elements | All visible | Some hidden | Missing |
| Console errors | None | console.warn | console.error |
| Network | All 200 | - | Any 4xx/5xx |
| Screenshot | Captured | - | Failed |

## MCP Tools Used

| Tool | Purpose |
|------|---------|
| `start_dev_server` | Launch HTTP server for project |
| `verify_page` | Load page, capture diagnostics |
| `analyze_screenshot` | Optional visual analysis |
| `stop_dev_server` | Cleanup after validation |

## Example Usage

**Basic validation:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "fixture_path": "src/tests/metric-card.html",
  "screenshot": true
}
```

**With specific element checks:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "fixture_path": "src/tests/animated-counter.html",
  "expected_elements": [
    "[data-testid='counter-value']",
    "[data-testid='counter-label']"
  ],
  "wait_for_selector": "[data-testid='counter-value']",
  "timeout": 15000
}
```

## Token Efficiency

- Uses MCP tools (no LLM vision needed for basic checks)
- ~5-15 second execution
- Returns actionable pass/fail with specifics
