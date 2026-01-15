---
name: test-augment-fixture
description: Augment test fixture with edge cases, accessibility tests, responsive breakpoints. QA skill that ensures comprehensive test coverage.
---

# test-augment-fixture - Test Fixture Augmenter

Augments an existing test fixture with edge cases, accessibility tests, responsive breakpoints, and error states. Used by QA agents to ensure comprehensive test coverage beyond basic "happy path" tests.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "fixture_path": "src/tests/metric-card.html",
  "component_path": "src/components/impact/MetricCard.js",
  "acceptance_criteria": [
    {"id": "AC-001", "description": "Counter animates from 0 to target"}
  ],
  "augmentations": {
    "edge_cases": true,
    "accessibility": true,
    "responsive": true,
    "error_states": true,
    "animation_states": true
  }
}
```

## Instructions

### 1. Read Existing Fixture

```javascript
const fixtureContent = await fs.readFile(fixturePath, 'utf8');
const $ = cheerio.load(fixtureContent);
```

### 2. Add Edge Case Sections

```html
<!-- Empty State -->
<div class="test-section" id="test-edge-empty">
  <h2>Edge: Empty Data</h2>
  <div data-test-scenario="empty-state" data-testid="edge-empty">
    <!-- Initialize component with empty/null data -->
  </div>
</div>

<!-- Large Values -->
<div class="test-section" id="test-edge-large">
  <h2>Edge: Large Values</h2>
  <div data-test-scenario="large-values" data-testid="edge-large">
    <!-- Initialize with 999,999,999 -->
  </div>
</div>

<!-- Special Characters -->
<div class="test-section" id="test-edge-special">
  <h2>Edge: Special Characters</h2>
  <div data-test-scenario="special-chars" data-testid="edge-special">
    <!-- Initialize with "Liters <script>" -->
  </div>
</div>
```

### 3. Add Accessibility Sections

```html
<!-- Keyboard Navigation -->
<div class="test-section" id="test-a11y-keyboard">
  <h2>A11y: Keyboard Navigation</h2>
  <div data-test-scenario="keyboard-nav" data-testid="a11y-keyboard">
    <p>Tab through: focus should move to interactive elements</p>
  </div>
</div>

<!-- Screen Reader -->
<div class="test-section" id="test-a11y-aria">
  <h2>A11y: Screen Reader</h2>
  <div data-test-scenario="aria" data-testid="a11y-aria">
    <p>Check: aria-label, aria-live, role attributes</p>
  </div>
</div>

<!-- Color Contrast -->
<div class="test-section" id="test-a11y-contrast">
  <h2>A11y: Color Contrast</h2>
  <div data-test-scenario="contrast" data-testid="a11y-contrast">
    <p>Verify 4.5:1 contrast ratio for text</p>
  </div>
</div>
```

### 4. Add Responsive Breakpoints

```html
<style>
  /* Responsive test containers */
  [data-viewport-test] {
    border: 2px dashed #ccc;
    margin: 10px 0;
    overflow: auto;
  }
  [data-viewport-test="320"] { width: 320px; }
  [data-viewport-test="768"] { width: 768px; }
  [data-viewport-test="1024"] { width: 1024px; }
  [data-viewport-test="1920"] { width: 1920px; }
</style>

<div class="test-section" id="test-responsive">
  <h2>Responsive: Viewport Tests</h2>

  <div data-viewport-test="320" data-testid="viewport-320">
    <p>Mobile (320px)</p>
    <div id="component-320"></div>
  </div>

  <div data-viewport-test="768" data-testid="viewport-768">
    <p>Tablet (768px)</p>
    <div id="component-768"></div>
  </div>

  <div data-viewport-test="1024" data-testid="viewport-1024">
    <p>Desktop (1024px)</p>
    <div id="component-1024"></div>
  </div>

  <div data-viewport-test="1920" data-testid="viewport-1920">
    <p>Large (1920px)</p>
    <div id="component-1920"></div>
  </div>
</div>
```

### 5. Add Error State Sections

```html
<!-- Network Error -->
<div class="test-section" id="test-error-network">
  <h2>Error: Network Failure</h2>
  <div data-test-scenario="network-error" data-testid="error-network">
    <!-- Initialize with fetch that fails -->
  </div>
</div>

<!-- Invalid Data -->
<div class="test-section" id="test-error-invalid">
  <h2>Error: Invalid Data</h2>
  <div data-test-scenario="invalid-data" data-testid="error-invalid">
    <!-- Initialize with malformed data -->
  </div>
</div>
```

### 6. Add Animation State Sections

```html
<!-- Reduced Motion -->
<div class="test-section" id="test-animation-reduced">
  <h2>Animation: prefers-reduced-motion</h2>
  <style>
    @media (prefers-reduced-motion: reduce) {
      [data-testid="animation-reduced"] * {
        animation: none !important;
        transition: none !important;
      }
    }
  </style>
  <div data-test-scenario="reduced-motion" data-testid="animation-reduced">
    <!-- Animations should be disabled -->
  </div>
</div>

<!-- Animation States -->
<div class="test-section" id="test-animation-states">
  <h2>Animation: State Progression</h2>
  <div data-test-scenario="animation-states" data-testid="animation-states">
    <button data-testid="trigger-animation">Trigger Animation</button>
    <div data-testid="animation-target"></div>
  </div>
</div>
```

### 7. Add Test Data Scripts

```javascript
// Inject test data for each scenario
const testData = {
  'edge-empty': { value: null, unit: '' },
  'edge-large': { value: 999999999, unit: 'liters' },
  'edge-special': { value: 100, unit: '<script>alert("xss")</script>' },
  'error-network': { fetch: 'fail' },
  'error-invalid': { value: 'not-a-number' }
};

// Export for Playwright access
window.__testScenarios = testData;
```

### 8. Write Augmented Fixture

```javascript
await fs.writeFile(fixturePath, $.html());
```

## Output Format

```json
{
  "skill": "test-augment-fixture",
  "status": "success|partial|failure",
  "fixture_augmented": "src/tests/metric-card.html",
  "sections_added": {
    "edge_cases": ["empty-state", "large-values", "special-chars"],
    "accessibility": ["keyboard-nav", "aria", "contrast"],
    "responsive": ["320", "768", "1024", "1920"],
    "error_states": ["network-error", "invalid-data"],
    "animation_states": ["reduced-motion", "animation-states"]
  },
  "data_testids_added": 14,
  "test_scenarios": 12,
  "warnings": [
    "Component has no error handling - error states may crash"
  ],
  "suggestions": [
    {
      "type": "component",
      "message": "Add try/catch around data processing for graceful error handling"
    }
  ],
  "next_action": "run_tests"
}
```

## Augmentation Categories

| Category | What It Tests | Failure Impact |
|----------|---------------|----------------|
| Edge Cases | Boundary conditions | Data corruption, crashes |
| Accessibility | WCAG compliance | Users excluded |
| Responsive | Different viewports | Broken layouts |
| Error States | Graceful degradation | User confusion |
| Animation | Motion preferences | Accessibility, performance |

## data-testid Naming Convention

```
data-testid="edge-{case}"         # Edge case scenarios
data-testid="a11y-{check}"        # Accessibility checks
data-testid="viewport-{size}"     # Responsive breakpoints
data-testid="error-{type}"        # Error state scenarios
data-testid="animation-{state}"   # Animation scenarios
```

## Token Efficiency

- Template-based augmentation (minimal LLM reasoning)
- ~5-10 second execution
- Returns comprehensive test fixture ready for Playwright
