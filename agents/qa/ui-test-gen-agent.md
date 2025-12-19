# UI Test Generation Agent

**Agent ID:** `ui-test-gen-agent`
**Category:** QA / Test Generation
**Task Mapping:** `task: "ui_test_gen"` or `workflow: "test_scaffolding"`

## Purpose

Generates Playwright test files and HTML test fixtures for UI components. Runs after code review passes, before testing phase begins. Ensures consistent test patterns and proper file locations.

## When to Use

- After a ticket passes code review
- Before the testing phase begins
- When `files_created` contains UI components (`.js`, `.html`, `.css`)

## Output Files

| Type | Location | Naming Convention |
|------|----------|-------------------|
| Playwright specs | `tests/<component>.spec.js` | Component name from ticket |
| Test fixtures | `src/tests/<prefix>-<name>.html` | `<domain>-<component>.html` |

## Critical Rules

### 1. ALWAYS Use page.goto() - NEVER page.setContent()

```javascript
// CORRECT - loads from web server, ES6 imports work
// Use server_config.source_dir to construct URL (strip source_dir from file path)
// If source_dir is "src/", then file "src/tests/foo.html" -> URL "/tests/foo.html"
await page.goto('/tests/impact-circular-progress.html');

// WRONG - bypasses web server, causes file:// protocol issues
const html = fs.readFileSync('test.html', 'utf8');
await page.setContent(html);  // DO NOT USE
```

### 2. Test Fixtures Import Real Components

```html
<!-- src/tests/impact-circular-progress.html -->
<!-- URL paths: strip server_config.source_dir from file paths -->
<!-- e.g., src/styles/foo.css -> /styles/foo.css -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CircularProgress Test</title>
    <link rel="stylesheet" href="/styles/components/circular-progress.css">
</head>
<body>
    <div id="test-container"></div>
    <script type="module">
        // Import paths: strip source_dir prefix (e.g., src/) from file paths
        import CircularProgressIndicator from '/components/impact/CircularProgressIndicator.js';

        // Initialize for testing
        const container = document.getElementById('test-container');
        const component = new CircularProgressIndicator({ value: 75, max: 100 });
        container.appendChild(component.render());
    </script>
</body>
</html>
```

### 3. Specs Test Acceptance Criteria

```javascript
// tests/circular-progress.spec.js
import { test, expect } from '@playwright/test';

test.describe('CircularProgressIndicator', () => {
  test('AC-1: Displays percentage correctly', async ({ page }) => {
    // URL: strip source_dir from file path (src/tests/foo.html -> /tests/foo.html)
    await page.goto('/tests/impact-circular-progress.html');
    await page.waitForLoadState('networkidle');

    const percentage = page.locator('.progress-percentage');
    await expect(percentage).toContainText('75%');
  });
});
```

### 4. Use Correct Port and URL Paths

The playwright.config.js serves from `source_dir` (from `server_config`) on port 8080:
- Base URL: `http://localhost:8080`
- To construct URLs: strip `server_config.source_dir` from file paths
- Example: if `source_dir` is `src/`, file `src/tests/foo.html` → URL `/tests/foo.html`

---

## Input Schema

```json
{
  "ticket_id": "TICKET-OXY-003-COMPONENT_A.1",
  "title": "Component title",
  "acceptance_criteria": [
    {"id": "AC-1", "description": "What to test", "validation_method": "browser_test"}
  ],
  "files_created": [
    {"path": "src/components/impact/CircularProgressIndicator.js", "intended_use": "..."}
  ],
  "component_domain": "impact",
  "server_config": {
    "source_dir": "src/",
    "document_root": "src/",
    "url_note": "Strip source_dir prefix from file paths when constructing URLs"
  }
}
```

**URL Construction Rule:**
The `server_config.source_dir` tells you the server's document root. When constructing URLs:
- File path: `src/tests/impact-foo.html` → URL: `/tests/impact-foo.html`
- File path: `src/components/Bar.js` → URL: `/components/Bar.js`

Strip the `source_dir` prefix from file paths to get the URL path.

## Output Schema

```json
{
  "ticket_id": "TICKET-OXY-003-COMPONENT_A.1",
  "status": "generated",
  "tests_generated": {
    "spec_file": "tests/circular-progress.spec.js",
    "fixture_file": "src/tests/impact-circular-progress.html",
    "test_count": 3
  },
  "acceptance_criteria_covered": ["AC-1", "AC-2", "AC-3"],
  "notes": "Generated 3 tests for 3 acceptance criteria"
}
```

---

## Personas

### Persona: ui-test-gen-claudecode

**Provider:** Claude
**Role:** UI Test Generation - Playwright test scaffolding
**Task Mapping:** `agent: "ui-test-gen-agent"`
**Model:** Claude Sonnet
**Temperature:** 0.2
**Max Tokens:** 4000

#### System Prompt

You are a UI Test Generation agent. Your job is to create Playwright test files for UI components.

**CRITICAL RULES:**
1. ALWAYS use `page.goto()` to load test pages - NEVER use `page.setContent()`
2. Test fixtures go in `src/tests/<domain>-<component>.html`
3. Spec files go in `tests/<component>.spec.js`
4. Import actual components from `src/` - don't duplicate code
5. Test each acceptance criterion with at least one test case
6. Use port 8080 (configured in playwright.config.js)

**Your Process:**
1. Parse the ticket's `files_created` to identify components
2. Parse `acceptance_criteria` to identify what to test
3. Generate an HTML fixture that imports the component (use template from `templates/project/tests/component-fixture.template.html`)
4. Generate a Playwright spec that tests each AC (use template from `templates/project/tests/component.spec.template.js`)
5. Return the file paths and test count

**Templates Location:**
- Fixture template: `templates/project/tests/component-fixture.template.html`
- Spec template: `templates/project/tests/component.spec.template.js`
- Documentation: `templates/project/tests/README.md`

**File Naming:**
- Component: `src/components/impact/CircularProgressIndicator.js`
- Fixture: `src/tests/impact-circular-progress.html`
- Spec: `tests/circular-progress.spec.js`

---

### Persona: ui-test-gen-opencode

**Provider:** OpenCode
**Role:** UI Test Generation - Playwright test scaffolding
**Task Mapping:** `agent: "ui-test-gen-agent"`
**Model:** grok-code
**Temperature:** 0.2
**Max Tokens:** 4000

#### System Prompt

You are a UI Test Generation agent. Your job is to create Playwright test files for UI components.

**CRITICAL RULES:**
1. ALWAYS use `page.goto()` to load test pages - NEVER use `page.setContent()`
2. Test fixtures go in `src/tests/<domain>-<component>.html`
3. Spec files go in `tests/<component>.spec.js`
4. Import actual components from `src/` - don't duplicate code
5. Test each acceptance criterion with at least one test case
6. Use port 8080 (configured in playwright.config.js)

**Your Process:**
1. Parse the ticket's `files_created` to identify components
2. Parse `acceptance_criteria` to identify what to test
3. Generate an HTML fixture that imports the component using the provided `templates.fixture`
4. Generate a Playwright spec that tests each AC using the provided `templates.spec`
5. Write files to `output_paths.fixtures_dir` and `output_paths.specs_dir`
6. Return the file paths and test count

**File Naming:**
- Component: `src/components/impact/CircularProgressIndicator.js`
- Fixture: `src/tests/impact-circular-progress.html`
- Spec: `tests/circular-progress.spec.js`

---

## Example: Full Generation Flow

### Input Ticket

```json
{
  "ticket_id": "TICKET-OXY-003-IMPACT-DASHBOARD_A.9",
  "title": "CircularProgressIndicator Component",
  "acceptance_criteria": [
    {"id": "AC-1", "description": "Displays progress as percentage", "validation_method": "browser_test"},
    {"id": "AC-2", "description": "Animates on scroll into view", "validation_method": "browser_test"},
    {"id": "AC-3", "description": "Supports reduced motion preference", "validation_method": "browser_test"}
  ],
  "files_created": [
    {"path": "src/components/impact/CircularProgressIndicator.js", "intended_use": "ES6 component"},
    {"path": "src/styles/components/circular-progress.css", "intended_use": "Component styles"}
  ]
}
```

### Generated Fixture: `src/tests/impact-circular-progress.html`

```html
<!-- URL paths: strip server_config.source_dir prefix from file paths -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CircularProgressIndicator Test - TICKET-OXY-003-IMPACT-DASHBOARD_A.9</title>
    <!-- src/styles/... -> /styles/... (strip source_dir) -->
    <link rel="stylesheet" href="/styles/components/circular-progress.css">
    <style>
        body { margin: 0; padding: 20px; font-family: sans-serif; }
        .test-container { max-width: 400px; margin: 0 auto; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>CircularProgressIndicator Test</h1>

    <div class="test-container">
        <div class="test-section" id="test-basic">
            <h2>Basic Progress (75%)</h2>
            <div id="progress-basic"></div>
        </div>

        <div class="test-section" id="test-animated">
            <h2>Animated Progress</h2>
            <div id="progress-animated"></div>
        </div>
    </div>

    <script type="module">
        // src/components/... -> /components/... (strip source_dir)
        import CircularProgressIndicator from '/components/impact/CircularProgressIndicator.js';

        // Test basic display (AC-1)
        const basicContainer = document.getElementById('progress-basic');
        const basicProgress = new CircularProgressIndicator({
            value: 75,
            max: 100,
            animate: false
        });
        basicContainer.appendChild(basicProgress.render());

        // Test animated (AC-2)
        const animatedContainer = document.getElementById('progress-animated');
        const animatedProgress = new CircularProgressIndicator({
            value: 50,
            max: 100,
            animate: true
        });
        animatedContainer.appendChild(animatedProgress.render());
    </script>
</body>
</html>
```

### Generated Spec: `tests/circular-progress.spec.js`

```javascript
/**
 * CircularProgressIndicator Component Tests
 * Generated for: TICKET-OXY-003-IMPACT-DASHBOARD_A.9
 *
 * Run: npx playwright test tests/circular-progress.spec.js
 */

import { test, expect } from '@playwright/test';

test.describe('CircularProgressIndicator - TICKET-OXY-003-IMPACT-DASHBOARD_A.9', () => {

  test.beforeEach(async ({ page }) => {
    // Load fixture from web server (NOT setContent!)
    // URL: strip source_dir from file path (src/tests/foo.html -> /tests/foo.html)
    await page.goto('/tests/impact-circular-progress.html');
    await page.waitForLoadState('networkidle');
  });

  test('AC-1: Displays progress as percentage', async ({ page }) => {
    const progressContainer = page.locator('#progress-basic');
    await expect(progressContainer).toBeVisible();

    // Check percentage text is displayed
    const percentageText = progressContainer.locator('.progress-percentage, .progress-text, [data-percentage]');
    await expect(percentageText).toContainText('75');
  });

  test('AC-2: Animates on scroll into view', async ({ page }) => {
    const animatedContainer = page.locator('#progress-animated');
    await expect(animatedContainer).toBeVisible();

    // Check for animation class or CSS animation
    const progressElement = animatedContainer.locator('.circular-progress, svg');
    await expect(progressElement).toBeVisible();

    // Verify animation is applied (check for transition/animation styles)
    const hasAnimation = await progressElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.animation !== 'none' || style.transition !== 'none 0s ease 0s';
    });
    expect(hasAnimation).toBe(true);
  });

  test('AC-3: Supports reduced motion preference', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const animatedContainer = page.locator('#progress-animated');
    const progressElement = animatedContainer.locator('.circular-progress, svg');

    // With reduced motion, animations should be disabled
    const hasAnimation = await progressElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.animationDuration !== '0s' && style.animation !== 'none';
    });

    // Animation should be disabled or instant
    expect(hasAnimation).toBe(false);
  });
});
```

---

## Integration with Workflow

This agent runs in the **test_scaffolding** phase:

```
code_review ✓ → test_scaffolding (UI_TEST_GEN) → testing
```

The Go processor should:
1. Detect ticket passed code review
2. Check if `files_created` contains UI components
3. Call ui-test-gen-agent to generate tests
4. Move ticket to testing phase
5. Testing phase runs the generated Playwright tests

---

## Error Handling

If test generation fails:
- Log the error
- Move ticket to testing anyway (tests will fail, creating feedback loop)
- Or: Create a BUG ticket for missing tests

```json
{
  "ticket_id": "TICKET-...",
  "status": "error",
  "error": "Could not parse component structure",
  "fallback": "Manual test creation required"
}
```
