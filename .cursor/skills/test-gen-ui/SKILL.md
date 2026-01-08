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
