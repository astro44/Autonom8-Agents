---
name: qa-visual-interaction
description: Visual verification for interactive elements (popups, modals, tooltips). Clicks elements and captures screenshots for analysis. Bypasses MCP browser tool limitations with cross-origin CSS.
---

# qa-visual-interaction - Interactive Element Visual Verification

Verifies visual elements that require user interaction (clicks, hovers) by automating browser actions and capturing screenshots. Essential for debugging "it looks wrong" reports that static screenshots miss.

## When to Use

- Verifying popups, modals, tooltips that appear on click/hover
- Testing interactive map markers (Mapbox, Leaflet, Google Maps)
- Debugging CSS issues in dynamically rendered content
- Capturing state after user actions (dropdowns, accordions, tabs)
- Bypassing MCP browser tool cross-origin CSS limitations

## Prerequisites

### One-Time Setup
```bash
# Install Playwright as project dependency
npm install playwright --save-dev

# Install Chromium browser (downloads ~250MB)
npx playwright install chromium
```

### Verify Installation
```bash
# Should show Chromium path
npx playwright --version
ls ~/Library/Caches/ms-playwright/chromium-*/
```

## Input Schema

```json
{
  "url": "http://localhost:8080/pages/index.html",
  "click_selector": ".mapboxgl-marker",
  "scroll_to": ".favela-map-container",
  "popup_selector": ".mapboxgl-popup",
  "screenshot_path": "/tmp/visual_check.png",
  "wait_after_click_ms": 2000,
  "viewport": { "width": 1920, "height": 1080 }
}
```

## Instructions

### Step 1: Create Interaction Script

Save as `capture_interaction.mjs` in project root:

```javascript
import { chromium } from 'playwright';

const config = {
  url: process.argv[2] || 'http://localhost:8080/pages/index.html',
  clickSelector: process.argv[3] || '.mapboxgl-marker',
  screenshotPath: process.argv[4] || '/tmp/interaction_capture.png'
};

async function captureInteraction() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log(`Navigating to ${config.url}...`);
  await page.goto(config.url);
  await page.waitForTimeout(4000); // Wait for dynamic content

  // Scroll target into view
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: 'center' });
  }, config.clickSelector);
  await page.waitForTimeout(1000);

  // Screenshot before interaction
  await page.screenshot({
    path: config.screenshotPath.replace('.png', '_before.png')
  });
  console.log('Before screenshot saved');

  // Click the element
  const target = page.locator(config.clickSelector).first();
  const count = await target.count();
  console.log(`Found ${count} matching element(s)`);

  if (count > 0) {
    await target.click();
    console.log('Element clicked, waiting for reaction...');
    await page.waitForTimeout(2000);

    // Screenshot after interaction
    await page.screenshot({ path: config.screenshotPath });
    console.log(`After screenshot saved: ${config.screenshotPath}`);

    // Try to capture popup/modal specifically
    const popup = page.locator('.mapboxgl-popup, .modal, [role="dialog"], .popup, .tooltip');
    if (await popup.count() > 0) {
      const box = await popup.boundingBox();
      console.log('Popup bounding box:', JSON.stringify(box));
      await popup.screenshot({
        path: config.screenshotPath.replace('.png', '_element.png')
      });
      console.log('Element-only screenshot saved');
    }
  } else {
    console.error(`No elements found for selector: ${config.clickSelector}`);
  }

  await browser.close();
}

captureInteraction().catch(console.error);
```

### Step 2: Run the Script

```bash
# Basic usage
node capture_interaction.mjs

# Custom URL and selector
node capture_interaction.mjs "http://localhost:8080/pages/index.html" ".mapboxgl-marker" "/tmp/map_popup.png"

# For hover interactions (modify script)
# await target.hover(); instead of await target.click();
```

### Step 3: Analyze Screenshots

```bash
# View screenshots (macOS)
open /tmp/interaction_capture.png
open /tmp/interaction_capture_element.png

# Or use Read tool in Claude Code
# Read /tmp/interaction_capture_element.png
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Cannot find package 'playwright'` | Not installed in project | `npm install playwright --save-dev` |
| `Executable doesn't exist` | Browser not downloaded | `npx playwright install chromium` |
| `Element not found` | Selector wrong or timing | Increase waitForTimeout, verify selector |
| `Cross-origin CSS error` | MCP tool limitation | Use this skill instead (bypasses issue) |
| `Empty screenshot` | Page not loaded | Increase initial wait time |
| `Wrong element clicked` | Multiple matches | Use `.first()` or more specific selector |

## Example: Map Popup Verification

**Problem:** User reported "white text on white background" in map popup

**Investigation:**

```bash
# 1. Create script
cat << 'SCRIPT' > verify_map_popup.mjs
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

await page.goto('http://localhost:8080/pages/index.html');
await page.waitForTimeout(4000);

// Scroll to map
await page.evaluate(() => {
  document.querySelector('.favela-map-container')?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(1500);

// Click marker to trigger popup
await page.locator('.mapboxgl-marker').first().click();
await page.waitForTimeout(2000);

// Capture popup
const popup = page.locator('.mapboxgl-popup');
if (await popup.count() > 0) {
  await popup.screenshot({ path: '/tmp/popup_issue.png' });
  console.log('Popup captured - check /tmp/popup_issue.png');
}

await browser.close();
SCRIPT

# 2. Run
node verify_map_popup.mjs

# 3. View result
open /tmp/popup_issue.png
```

**Finding:** Screenshot clearly shows white text on white background - confirms the bug!

## Output Format

```json
{
  "success": true,
  "screenshots": {
    "before": "/tmp/interaction_capture_before.png",
    "after": "/tmp/interaction_capture.png",
    "element": "/tmp/interaction_capture_element.png"
  },
  "element_found": true,
  "popup_bounding_box": { "x": 750, "y": 723, "width": 240, "height": 103 },
  "analysis": "Popup visible with styling issue - white text (#ffffff) on white background"
}
```

## Integration with Visual QA Pipeline

This skill complements `qa-visual-qa-web` by handling:
- Interactive elements that require clicks/hovers
- Third-party components with cross-origin CSS (Mapbox, Google Maps)
- Dynamic content that appears after user actions

**Pipeline order:**
1. `qa-browser-check` - Basic 404s and console errors
2. `qa-integration-check` - Cross-file references
3. `qa-visual-qa-web` - Static visual validation
4. `qa-visual-interaction` - Interactive element validation

## Troubleshooting

### Playwright Not Found After npm Install

```bash
# Check if installed locally
ls node_modules/playwright

# If not, install globally (less preferred)
npm install -g playwright
npx playwright install chromium
```

### Script Runs But No Screenshots

```bash
# Add debug logging
DEBUG=pw:api node capture_interaction.mjs

# Check if page actually loaded
await page.screenshot({ path: '/tmp/debug.png', fullPage: true });
```

### Element Clicks But Nothing Happens

```javascript
// Try force click
await target.click({ force: true });

// Or dispatch click event directly
await page.evaluate((sel) => {
  document.querySelector(sel)?.click();
}, config.clickSelector);
```
