---
name: test-gen-ui
description: Generate Playwright test specs from UI components. Creates test scaffolding with selectors, fixtures, and common interactions.
---

# test-gen-ui - UI Test Generator

Generates Playwright test specifications from UI components. Creates test scaffolding, selectors, and fixtures for visual and interaction testing.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "components": [
    {"path": "src/components/MetricCard.js", "type": "component"},
    {"path": "src/pages/index.html", "type": "page"}
  ],
  "test_dir": "tests/",
  "include_visual": true
}
```

## CRITICAL: Anti-Patterns to AVOID

**NEVER import browser ES6 modules directly in Playwright test files:**

```javascript
// WRONG - This will FAIL at runtime because Playwright tests run in Node.js
// Node.js cannot execute browser ES6 modules
import { MyComponent } from '../../src/components/MyComponent.js';  // ❌ NEVER DO THIS

// CORRECT - Load components via browser context using page.goto()
test.beforeEach(async ({ page }) => {
  await page.goto('/tests/my-component-fixture.html');  // ✅ Component loads in browser
});
```

**NEVER use page.setContent() with ES6 modules:**

```javascript
// WRONG - page.setContent() bypasses web server, breaks ES6 module imports
await page.setContent('<script type="module">import {X} from "..."</script>');  // ❌

// CORRECT - Use page.goto() to load from web server (port 8080)
await page.goto('/tests/fixture.html');  // ✅ Server handles module resolution
```

**WHY THIS MATTERS:**
- Playwright tests execute in Node.js runtime
- Browser ES6 modules use different import resolution than Node.js
- `page.setContent()` doesn't have a base URL for relative imports
- The error "Cannot find module" occurs because Node tries to resolve browser paths

## CRITICAL: File Paths vs URL Paths

**Test fixtures must be created in `src/tests/` (NOT `tests/`):**

```
FILE PATH (where to create):     src/tests/my-component.html
URL PATH (in page.goto()):       /tests/my-component.html

The server runs from src/ directory, so:
- src/tests/*.html → served at /tests/*.html
- src/pages/*.html → served at /pages/*.html

WRONG: Creating fixture at tests/my-component.html (project root)
RIGHT: Creating fixture at src/tests/my-component.html (under src/)
```

**Directory structure:**
```
project/
├── tests/                    # Playwright spec files (.spec.js) - Node.js context
│   └── my-component.spec.js  # Test runs in Node.js, uses page.goto()
└── src/                      # Server root (server_root: src/)
    ├── tests/                # Test fixtures - Browser context
    │   └── my-component.html # Served at /tests/my-component.html
    ├── pages/                # Production pages
    │   └── index.html        # Served at /pages/index.html
    └── components/           # Components
        └── MyComponent.js    # Imported by fixtures via browser
```

## Instructions

### 1. Analyze Component Structure

```javascript
// Extract testable elements:
// - data-testid attributes
// - Interactive elements (buttons, inputs, links)
// - Dynamic content regions
// - State-dependent elements

// Look for patterns:
const patterns = {
  testId: /data-testid=["']([^"']+)["']/g,
  buttons: /<button[^>]*>/g,
  inputs: /<input[^>]*>/g,
  links: /<a[^>]*href/g
};
```

### 2. Generate Test Selectors

```javascript
// From component analysis, generate selectors:
const selectors = {
  // Prefer data-testid
  metricCard: '[data-testid="metric-card"]',

  // Fall back to semantic selectors
  submitButton: 'button[type="submit"]',

  // Avoid fragile selectors
  // BAD: '.container > div:nth-child(2) > span'
};
```

### 3. Create Test Structure

```javascript
// tests/components/metric-card.spec.js
import { test, expect } from '@playwright/test';

test.describe('MetricCard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders metric value', async ({ page }) => {
    const card = page.locator('[data-testid="metric-card"]');
    await expect(card).toBeVisible();
    await expect(card.locator('.metric-value')).not.toBeEmpty();
  });

  test('handles click interaction', async ({ page }) => {
    const card = page.locator('[data-testid="metric-card"]');
    await card.click();
    // Assert state change
  });

  test('visual regression', async ({ page }) => {
    const card = page.locator('[data-testid="metric-card"]');
    await expect(card).toHaveScreenshot('metric-card.png');
  });
});
```

### 4. Generate Fixtures

```javascript
// tests/fixtures/metrics.ts
export const mockMetrics = {
  sewageTreated: { value: 2500000, unit: 'liters' },
  areasServed: { value: 15, unit: 'communities' }
};
```

## Output Format

```json
{
  "skill": "test-gen-ui",
  "status": "success|partial|failure",
  "files_generated": [
    {
      "path": "tests/components/metric-card.spec.js",
      "tests_count": 5,
      "coverage": ["render", "interaction", "visual"]
    }
  ],
  "selectors_extracted": 12,
  "fixtures_created": 2,
  "warnings": [
    "Component Dashboard.js has no data-testid attributes"
  ],
  "suggestions": [
    {
      "file": "src/components/Dashboard.js",
      "suggestion": "Add data-testid='dashboard-container' to root element"
    }
  ],
  "next_action": "proceed|review"
}
```

## Test Categories Generated

| Category | Description | Example |
|----------|-------------|---------|
| Render | Component mounts and displays | `toBeVisible()` |
| Content | Text/values display correctly | `toHaveText()` |
| Interaction | Clicks, hovers, inputs work | `click()`, `fill()` |
| State | State changes reflect in UI | `toHaveClass()` |
| Visual | Screenshot comparison | `toHaveScreenshot()` |
| Accessibility | ARIA, focus, keyboard | `toHaveAttribute('aria-*')` |

## Usage Examples

**Generate tests for ticket components:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-003",
  "components": [
    {"path": "src/components/impact/MetricCard.js", "type": "component"},
    {"path": "src/components/impact/BeforeAfterComparison.js", "type": "component"}
  ],
  "test_dir": "src/tests/",
  "include_visual": true
}
```

**Page-level test generation:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-001",
  "components": [
    {"path": "src/pages/index.html", "type": "page"}
  ],
  "test_dir": "tests/e2e/",
  "include_visual": false
}
```

## Token Efficiency

- Pattern extraction from source
- Template-based generation
- ~5-15 second execution
- Returns files ready to run
