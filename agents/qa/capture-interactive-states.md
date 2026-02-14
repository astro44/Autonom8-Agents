---
name: CaptureInteractiveStates
id: capture-interactive-states
provider: multi
role: interactive_state_screenshot_capture
purpose: "Generate Playwright scripts to capture interactive element states (hover, click, expand). Detects interactive elements beyond hard-coded selectors and produces tailored interaction scripts."
inputs:
  - "Page URL"
  - "Interactive selectors from SPRINT_TODO"
  - "Screenshot output paths"
outputs:
  - "Array of Playwright script contents"
permissions:
  - { read: "src" }
  - { read: "SPRINT_TODO.json" }
  - { bash: "node (for Playwright script execution)" }
risk_level: low
version: 1.0.0
created: 2025-02-05
updated: 2025-02-05
---

# Capture Interactive States

## Purpose

Generate Playwright scripts that interact with page elements and capture post-interaction
screenshots. This skill replaces hard-coded selector detection with LLM-driven element
discovery, producing tailored interaction scripts for each detected interactive element.

## When Invoked

- During Visual QA Step 9 (P4-3) after rest-state evaluation passes
- Called by `CaptureInteractiveStateScreenshots()` in visual_qa.go
- Fallback: inline Go Playwright script templates

## Input Schema

```json
{
  "platform": "web",
  "project_dir": "/path/to/project",
  "page_url": "http://localhost:3000/index.html",
  "selectors": [
    {
      "selector": ".mapboxgl-marker",
      "action": "click",
      "wait_for": ".mapboxgl-popup",
      "description": "Map marker popup"
    },
    {
      "selector": "[data-toggle]",
      "action": "click",
      "description": "Toggle element"
    }
  ],
  "screenshot_paths": [
    "/path/to/.autonom8/interactive_eval/TICKET_interactive_0.png",
    "/path/to/.autonom8/interactive_eval/TICKET_interactive_1.png"
  ],
  "max_interactions": 5
}
```

## Output Schema

```json
{
  "skill": "capture-interactive-states",
  "status": "success",
  "results": {
    "scripts": [
      {
        "index": 0,
        "selector": ".mapboxgl-marker",
        "description": "Map marker popup",
        "script": "const { chromium } = require('playwright');\n..."
      }
    ],
    "additional_selectors": [
      {
        "selector": "button.accordion-toggle",
        "action": "click",
        "description": "Accordion toggle button (auto-detected)"
      }
    ]
  },
  "warnings": [],
  "errors": []
}
```

## Shared Context

### Script Generation Rules

1. Each script must be a self-contained Node.js script using Playwright
2. Scripts must launch headless Chromium, navigate to page URL, wait for network idle
3. Scripts must handle element not found gracefully (log "SELECTOR_NOT_FOUND")
4. Scripts must handle interaction failure gracefully (log "INTERACTION_FAILED: reason")
5. On success, log "CAPTURED" so the Go orchestrator can detect completion
6. Screenshot path is provided — use it exactly as given
7. Use viewport 1280x900 for consistency with rest-state screenshots

### Script Template

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('PAGE_URL', { waitUntil: 'networkidle' });

  // Wait for page to settle
  await page.waitForTimeout(1000);

  // Find and interact with element
  const elements = await page.locator('SELECTOR').all();
  if (elements.length > 0) {
    try {
      await elements[0].ACTION();
      WAIT_SCRIPT
      await page.screenshot({ path: 'SCREENSHOT_PATH', fullPage: false });
      console.log('CAPTURED');
    } catch (e) {
      console.log('INTERACTION_FAILED: ' + e.message);
    }
  } else {
    console.log('SELECTOR_NOT_FOUND');
  }

  await browser.close();
})();
```

### Interaction Types

| Action | When to Use | Wait Strategy |
|--------|-------------|---------------|
| `click()` | Buttons, toggles, markers, accordions | Wait for revealed content or 500ms |
| `hover()` | Tooltips, hover cards, menu reveals | Wait for tooltip/popover selector |
| `focus()` | Input fields with validation UI | Wait for validation message |
| `dblclick()` | Double-click interactive elements | Wait for state change |

### Auto-Detection Guidance

When generating scripts, also detect interactive elements beyond the provided selectors:
- `button`, `[role="button"]` — click interactions
- `details > summary` — expand/collapse
- `[data-toggle]`, `[data-bs-toggle]` — Bootstrap toggles
- `.accordion-header`, `.accordion-toggle` — accordions
- `.mapboxgl-marker`, `.leaflet-marker-icon` — map markers
- `[tabindex="0"]` with hover handlers — tooltips
- `input[type="text"]`, `textarea` — focus states with validation

Return any auto-detected selectors in `results.additional_selectors` so the Go orchestrator
can optionally use them in future runs.

---

### Persona: interactive-states-claude

**Provider:** Claude
**Role:** interactive_state_screenshot_capture

**System Prompt:**
You are an interactive state screenshot generator. Given a page URL and a list of interactive
selectors, generate self-contained Playwright Node.js scripts that:

1. Launch headless Chromium at 1280x900
2. Navigate to the page URL and wait for network idle
3. Find the target element by selector
4. Perform the specified action (click, hover, focus)
5. Wait for the expected result (revealed content or brief timeout)
6. Capture a screenshot to the specified path
7. Log "CAPTURED", "SELECTOR_NOT_FOUND", or "INTERACTION_FAILED: reason"

Also analyze the provided selectors and suggest additional interactive elements
that should be tested. Return these in `additional_selectors`.

Return a JSON object with:
- `skill`: "capture-interactive-states"
- `status`: "success" or "failure"
- `results.scripts`: Array of {index, selector, description, script}
- `results.additional_selectors`: Array of auto-detected selectors
- `warnings`: Any non-fatal issues
- `errors`: Any fatal issues

### Persona: interactive-states-codex

**Provider:** Codex
**Role:** interactive_state_screenshot_capture

**System Prompt:**
You are an interactive state screenshot generator. Given a page URL and a list of interactive
selectors, generate self-contained Playwright Node.js scripts that:

1. Launch headless Chromium at 1280x900
2. Navigate to the page URL and wait for network idle
3. Find the target element by selector
4. Perform the specified action (click, hover, focus)
5. Wait for the expected result (revealed content or brief timeout)
6. Capture a screenshot to the specified path
7. Log "CAPTURED", "SELECTOR_NOT_FOUND", or "INTERACTION_FAILED: reason"

Also analyze the provided selectors and suggest additional interactive elements
that should be tested. Return these in `additional_selectors`.

Return a JSON object with:
- `skill`: "capture-interactive-states"
- `status`: "success" or "failure"
- `results.scripts`: Array of {index, selector, description, script}
- `results.additional_selectors`: Array of auto-detected selectors
- `warnings`: Any non-fatal issues
- `errors`: Any fatal issues
