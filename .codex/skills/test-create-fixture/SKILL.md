---
name: test-create-fixture
description: Create HTML test fixture AND Playwright spec for UI components. Uses project templates to create isolated test pages for TDD validation. Web-specific enhancement creates both files.
---

# test-create-fixture - Component Test Fixture & Spec Creator

Creates HTML test fixture files AND Playwright spec files for UI components. Used by dev agents during TDD to create isolated test pages before implementation.

**Web Platform Enhancement:** For web projects, this skill creates BOTH the fixture HTML AND the Playwright spec file to avoid silent failures from missing specs.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX_A.1",
  "component_path": "src/components/impact/MetricCard.js",
  "fixture_path": "src/tests/metric-card.html",
  "spec_path": "tests/metric-card.spec.js",
  "component_name": "MetricCard",
  "component_class": "MetricCard",
  "platform": "web",
  "acceptance_criteria": [
    {"id": "AC-001", "description": "Counter animates from 0 to target"},
    {"id": "AC-002", "description": "Displays unit label correctly"}
  ]
}
```

**Note:** `spec_path` is REQUIRED for web platform. If not provided, derive from fixture_path:
- `src/tests/metric-card.html` → `tests/metric-card.spec.js`

## CRITICAL: Use Absolute URL Paths (NOT Relative)

**NEVER use relative paths like `../../` in fixture imports.**

The server runs from `src/` directory, making `src/` the web root:
- `src/tests/*.html` → served at `/tests/*.html`
- `src/components/**/*.js` → served at `/components/**/*.js`

**WHY relative paths break:**
```
fixture_path: src/tests/metric-card.html
component_path: src/components/impact/MetricCard.js

WRONG: ../../components/impact/MetricCard.js
       → resolves to project_root/components/impact/MetricCard.js (OUTSIDE src/)
       → FILE NOT FOUND

RIGHT: /components/impact/MetricCard.js
       → resolves from server root (src/) to src/components/impact/MetricCard.js
       → FILE FOUND ✓
```

## Instructions

### 1. Locate Templates

```bash
# Fixture template location (in order of priority):
# 1. Project-specific: {project_dir}/templates/tests/component-fixture.html
# 2. Harness: {project_dir}/harness/templates/component-fixture.html
# 3. Global: templates/project/tests/web/component-fixture.template.html

# Spec template location (web platform only):
# 1. Project-specific: {project_dir}/templates/tests/component.spec.template.js
# 2. Global: templates/project/tests/web/component.spec.template.js
```

### 2. Process Template Variables

Replace mustache-style variables in templates:

### Shared Variables (Fixture + Spec)

| Variable | Source | Example |
|----------|--------|---------|
| `{{TICKET_ID}}` | input.ticket_id | TICKET-OXY-003_A.1 |
| `{{COMPONENT_NAME}}` | input.component_name | MetricCard |
| `{{COMPONENT_CLASS}}` | input.component_class | MetricCard |
| `{{#ACCEPTANCE_CRITERIA}}` | Loop over ACs | Creates test sections |
| `{{AC_ID}}` | Each AC ID | AC-001 |
| `{{AC_DESCRIPTION}}` | Each AC description | Counter animates... |

### Fixture-Specific Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{COMPONENT_PATH}}` | Absolute URL from server root | /components/impact/MetricCard.js |
| `{{COMPONENT_CSS}}` | CSS absolute URL | /styles/metric-card.css |
| `{{COMPONENT_OPTIONS}}` | Default init options | `{}` or from ticket |
| `{{COMPONENT_SELECTOR}}` | data-* attribute name (kebab-case) | circular-progress |

### Spec-Specific Variables (Web Platform)

| Variable | Source | Example |
|----------|--------|---------|
| `{{SPEC_FILENAME}}` | Basename of spec_path | metric-card.spec.js |
| `{{FIXTURE_FILENAME}}` | Basename of fixture_path | metric-card.html |

### 3. Calculate Absolute URL Paths

**CRITICAL: Check for `import_prefix` in context first!**

The `import_prefix` context variable tells you if the server needs a path prefix (e.g., `/src`).

```javascript
// FIRST: Check if import_prefix is provided in context
// If import_prefix = "/src", paths need the /src prefix
// If import_prefix = "", server serves from src/ directly

function toAbsoluteUrl(filePath, importPrefix) {
  // Remove src/ prefix if present to get relative path
  let relativePath = filePath;
  if (filePath.startsWith('src/')) {
    relativePath = filePath.slice(4); // Remove 'src/'
  }

  // Apply import_prefix if provided (e.g., "/src" when server runs from project root)
  if (importPrefix) {
    return importPrefix + '/' + relativePath;
  }

  // Default: assume server runs from src/, no prefix needed
  return '/' + relativePath;
}

// Examples WITH import_prefix="/src" (server at project root):
// src/components/impact/MetricCard.js → /src/components/impact/MetricCard.js
// src/styles/metric-card.css → /src/styles/metric-card.css

// Examples WITHOUT import_prefix (server at src/):
// src/components/impact/MetricCard.js → /components/impact/MetricCard.js
// src/styles/metric-card.css → /styles/metric-card.css
```

**Always check context for `import_prefix` before generating import paths!**

### 4. Generate AC Test Sections

For each acceptance criterion, create a test section:

```html
<div class="test-section" id="test-AC-001">
  <h2>AC-001: Counter animates from 0 to target</h2>
  <div data-test-scenario="ac-001"></div>
</div>
```

### 5. Write Fixture File

```javascript
// Ensure directory exists
const fixtureDir = path.dirname(fixturePath);
await fs.mkdir(fixtureDir, { recursive: true });

// Write processed template
await fs.writeFile(fixturePath, processedTemplate);
```

### 6. Write Spec File (Web Platform Only)

**CRITICAL: For web platform, ALWAYS create the spec file alongside the fixture.**

This step prevents silent failures where the fixture is created but the spec is missing, causing TDD verification to fail.

```javascript
// Derive spec path if not provided
function deriveSpecPath(fixturePath) {
  // src/tests/metric-card.html → tests/metric-card.spec.js
  const basename = path.basename(fixturePath, '.html');
  return `tests/${basename}.spec.js`;
}

// Ensure spec directory exists
const specPath = input.spec_path || deriveSpecPath(input.fixture_path);
const specDir = path.dirname(specPath);
await fs.mkdir(specDir, { recursive: true });

// Process spec template with variables
const specTemplate = await loadTemplate('component.spec.template.js');
const processedSpec = specTemplate
  .replace(/\{\{TICKET_ID\}\}/g, input.ticket_id)
  .replace(/\{\{COMPONENT_NAME\}\}/g, input.component_name)
  .replace(/\{\{COMPONENT_CLASS\}\}/g, input.component_class)
  .replace(/\{\{SPEC_FILENAME\}\}/g, path.basename(specPath))
  .replace(/\{\{FIXTURE_FILENAME\}\}/g, path.basename(input.fixture_path));

// Process acceptance criteria loop
const acTests = input.acceptance_criteria.map(ac =>
  `  test('${ac.id}: ${ac.description}', async ({ page }) => {
    const status = page.locator('#test-status');
    await expect(status).toHaveClass(/success/);
    // TODO: Add specific assertions for ${ac.id}
  });`
).join('\n\n');
processedSpec = processedSpec.replace(/\{\{#ACCEPTANCE_CRITERIA\}\}[\s\S]*?\{\{\/ACCEPTANCE_CRITERIA\}\}/g, acTests);

// Write spec file
await fs.writeFile(path.join(input.project_dir, specPath), processedSpec);
```

## Output Format

```json
{
  "skill": "test-create-fixture",
  "status": "success|failure",
  "fixture_created": "src/tests/metric-card.html",
  "spec_created": "tests/metric-card.spec.js",
  "fixture_template_used": "templates/project/tests/web/component-fixture.template.html",
  "spec_template_used": "templates/project/tests/web/component.spec.template.js",
  "platform": "web",
  "variables_replaced": {
    "TICKET_ID": "TICKET-OXY-003_A.1",
    "COMPONENT_NAME": "MetricCard",
    "COMPONENT_PATH": "/components/impact/MetricCard.js",
    "ACCEPTANCE_CRITERIA": 2
  },
  "test_sections": ["AC-001", "AC-002"],
  "warnings": [],
  "next_action": "validate_fixture"
}
```

**IMPORTANT:** For web platform, both `fixture_created` AND `spec_created` must be present for success. If either file fails to create, return `status: "failure"` with appropriate error message.

## Happy Path Only (CRITICAL)

**Initial fixtures focus on happy path ONLY.** Edge case testing is deferred to later phases.

### What to Include (Happy Path)
- Primary data loading with valid endpoints
- Standard component initialization
- Default configurations
- Expected successful responses

### What to Defer (Edge Cases)
- Missing file/endpoint tests (AC descriptions mentioning "missing", "invalid", "error handling")
- Error recovery scenarios
- Timeout/failure handling
- Malformed input validation

### Handling Edge Case ACs

When an AC describes edge case behavior (missing files, errors, invalid data), do NOT test it directly. Instead:

```javascript
// AC-3: "No runtime errors when data file is missing"
// DEFERRED - mark as deferred, don't request missing file
setOutput('ac-3', JSON.stringify({
  status: 'deferred',
  note: 'Edge case test deferred until happy path validated'
}, null, 2));
```

**Rationale:** Early TDD phases validate that components work correctly with valid inputs. Edge case testing requires additional infrastructure (mock servers, error injection) that may not exist yet.

## Fixture Requirements

The generated fixture MUST include:

1. **Isolated component** - Only the target component, no page context
2. **Real imports** - Import from actual src/ path, not copies
3. **Test sections per AC** - Each acceptance criterion gets a section
4. **data-testid attributes** - For Playwright selection
5. **Status indicator** - Shows init success/failure (#test-status.success/.error)
6. **Playwright hooks** - CRITICAL for test access:

### Required Window Globals (CRITICAL)

```javascript
// Set SYNCHRONOUSLY (before async init) for browser timing consistency
window.__testModule = {
  ComponentClass,        // The class constructor
  initComponentFactory,  // Factory function if available
  ...otherExports        // All named exports from module
};

// Set AFTER async init completes
window.__testInstances = [...];  // Array of initialized instances
window.__getTestInstance = () => instances[0];
window.__getTestInstances = () => instances;
window.__isInitialized = () => initComplete && !error;
window.__getInitError = () => initError;
```

**Why __testModule is CRITICAL:**
- ES6 module loading timing varies by browser (Chromium is slower)
- Tests use `page.waitForFunction(() => window.__testModule)` to wait for module
- If not set synchronously, tests fail with race conditions
- Chromium especially affected (19 failures vs WebKit's 4)

### Null-Return Handling (CRITICAL - Prevents False Positives)

**Problem:** Many components return `null` on failure instead of throwing exceptions. Fixtures that only use try/catch will show "success" even when initialization failed.

**Solution:** Always check for null returns in the initialization IIFE:

```javascript
(async () => {
    try {
        const instance = await createComponent(container);

        // CRITICAL: Check for null return (component failed internally)
        if (!instance) {
            initError = new Error('Component returned null - initialization failed');
            statusEl.textContent = 'Error: Component failed to initialize';
            statusEl.className = 'error';
            window.__isInitialized = () => false;
            window.__getInitError = () => initError;
            return;
        }

        // Success path
        instances.push(instance);
        window.__testInstances = instances;
        statusEl.textContent = 'Component initialized successfully';
        statusEl.className = 'success';
        window.__isInitialized = () => true;
    } catch (error) {
        initError = error;
        console.error('Component initialization error:', error);
        statusEl.textContent = 'Error: ' + error.message;
        statusEl.className = 'error';
        window.__isInitialized = () => false;
        window.__getInitError = () => initError;
    }
})();
```

**Why This Matters for Fallback Tests:**
When testing graceful degradation (e.g., "shows fallback when Mapbox fails"):

```javascript
// In spec file:
test('AC-6: Shows fallback when dependency fails', async ({ page }) => {
    // Block the dependency
    await page.route('**/mapbox-gl.js', route => route.abort());
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for error state (fixture sets .error class on null return)
    await page.waitForSelector('#test-status.error', { timeout: 5000 });

    // Verify fallback UI rendered
    await expect(page.locator('.component-fallback')).toBeVisible();
});
```

Without null-return handling, this test fails because the fixture shows "success" with 0 instances instead of "error".

## Example Generated Fixture

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>MetricCard Test - TICKET-OXY-003_A.1</title>
  <!-- ABSOLUTE URLs - server root is src/ -->
  <link rel="stylesheet" href="/styles/impact/metric-card.css">
</head>
<body>
  <div class="test-container">
    <h1>MetricCard Test</h1>

    <div class="test-section" id="test-AC-001">
      <h2>AC-001: Counter animates from 0 to target</h2>
      <div data-testid="ac-001-container"></div>
    </div>

    <div class="test-section" id="test-AC-002">
      <h2>AC-002: Displays unit label correctly</h2>
      <div data-testid="ac-002-container"></div>
    </div>

    <div id="test-status">Loading...</div>
  </div>

  <script type="module">
    // ABSOLUTE URL - NOT relative! Server root is src/
    import { MetricCard } from '/components/impact/MetricCard.js';
    // ... initialization code
  </script>
</body>
</html>
```

## Token Efficiency

- Template-based generation (no LLM needed for structure)
- ~2-5 second execution
- Returns ready-to-use HTML fixture AND Playwright spec (web platform)
- Self-sufficient for basic TDD scaffolding - no agent fallback needed for standard cases

## Platform Detection

```javascript
// Determine platform from input or project config
function getPlatform(input) {
  if (input.platform) return input.platform;

  // Check fixture path pattern
  if (input.fixture_path.endsWith('.html')) return 'web';
  if (input.fixture_path.includes('widget_test')) return 'flutter';
  if (input.fixture_path.includes('XCTest')) return 'ios';

  // Default to web for unknown
  return 'web';
}

// Only create spec for web platform
const platform = getPlatform(input);
if (platform === 'web') {
  // Create both fixture AND spec
} else {
  // Other platforms: fixture only (platform-specific test frameworks)
}
```
