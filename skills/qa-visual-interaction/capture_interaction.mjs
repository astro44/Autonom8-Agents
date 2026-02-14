#!/usr/bin/env node
/**
 * capture_interaction.mjs - Visual Interaction Verification Script
 *
 * Captures screenshots of interactive elements (popups, modals, tooltips)
 * by automating browser clicks and waiting for reactions.
 *
 * Usage:
 *   node capture_interaction.mjs <url> <click_selector> [screenshot_path]
 *
 * Example:
 *   node capture_interaction.mjs "http://localhost:8080/pages/index.html" ".mapboxgl-marker" "/tmp/popup.png"
 *
 * Prerequisites:
 *   npm install playwright --save-dev
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';

const config = {
  url: process.argv[2] || 'http://localhost:8080/pages/index.html',
  clickSelector: process.argv[3] || '.mapboxgl-marker',
  screenshotPath: process.argv[4] || '/tmp/interaction_capture.png',
  scrollToSelector: process.argv[5] || null, // Optional: scroll to different element first
  waitBeforeClick: parseInt(process.argv[6]) || 4000,
  waitAfterClick: parseInt(process.argv[7]) || 2000,
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
    height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
  }
};

// Common popup/modal selectors to check
const POPUP_SELECTORS = [
  '.mapboxgl-popup',
  '.mapboxgl-popup-content',
  '.modal',
  '.modal-content',
  '[role="dialog"]',
  '.popup',
  '.tooltip',
  '.dropdown-menu.show',
  '[data-popup]',
  '[data-modal]'
];

async function captureInteraction() {
  console.log('=== Visual Interaction Verification ===');
  console.log(`URL: ${config.url}`);
  console.log(`Click Selector: ${config.clickSelector}`);
  console.log(`Screenshot Path: ${config.screenshotPath}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: config.viewport });

  try {
    // Navigate to page
    console.log('Navigating to page...');
    await page.goto(config.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(config.waitBeforeClick);

    // Scroll element into view
    const scrollTarget = config.scrollToSelector || config.clickSelector;
    console.log(`Scrolling to: ${scrollTarget}`);
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        return true;
      }
      return false;
    }, scrollTarget);
    await page.waitForTimeout(1000);

    // Screenshot BEFORE interaction
    const beforePath = config.screenshotPath.replace('.png', '_before.png');
    await page.screenshot({ path: beforePath });
    console.log(`Before screenshot: ${beforePath}`);

    // Find and click target element
    const target = page.locator(config.clickSelector).first();
    const count = await target.count();
    console.log(`Found ${count} element(s) matching selector`);

    if (count === 0) {
      console.error(`ERROR: No elements found for selector: ${config.clickSelector}`);
      console.log('');
      console.log('Suggestions:');
      console.log('  - Check if the selector is correct');
      console.log('  - Increase waitBeforeClick if element loads dynamically');
      console.log('  - Use browser DevTools to verify element exists');

      // Save debug screenshot
      await page.screenshot({ path: config.screenshotPath.replace('.png', '_debug.png'), fullPage: true });
      console.log(`Debug screenshot saved (check element visibility)`);

      await browser.close();
      process.exit(1);
    }

    // Click the element
    console.log('Clicking element...');
    await target.click();
    await page.waitForTimeout(config.waitAfterClick);

    // Screenshot AFTER interaction
    await page.screenshot({ path: config.screenshotPath });
    console.log(`After screenshot: ${config.screenshotPath}`);

    // Try to find and capture popup/modal specifically
    let popupFound = false;
    for (const popupSelector of POPUP_SELECTORS) {
      const popup = page.locator(popupSelector);
      if (await popup.count() > 0) {
        try {
          const box = await popup.first().boundingBox();
          if (box && box.width > 0 && box.height > 0) {
            console.log(`Popup found: ${popupSelector}`);
            console.log(`  Bounding box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);

            const elementPath = config.screenshotPath.replace('.png', '_element.png');
            await popup.first().screenshot({ path: elementPath });
            console.log(`  Element screenshot: ${elementPath}`);

            popupFound = true;
            break;
          }
        } catch (e) {
          // Element might not be visible, continue checking others
        }
      }
    }

    if (!popupFound) {
      console.log('No popup/modal detected after click');
      console.log('  (This may be expected if the interaction produces a different result)');
    }

    // Output summary
    console.log('');
    console.log('=== Summary ===');
    console.log(JSON.stringify({
      success: true,
      url: config.url,
      selector: config.clickSelector,
      elementsFound: count,
      popupDetected: popupFound,
      screenshots: {
        before: beforePath,
        after: config.screenshotPath,
        element: popupFound ? config.screenshotPath.replace('.png', '_element.png') : null
      }
    }, null, 2));

  } catch (error) {
    console.error('ERROR:', error.message);

    // Save error state screenshot
    try {
      await page.screenshot({ path: config.screenshotPath.replace('.png', '_error.png'), fullPage: true });
      console.log('Error state screenshot saved');
    } catch (e) {
      // Ignore screenshot errors
    }

    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureInteraction();
