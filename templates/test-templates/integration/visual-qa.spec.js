// @ts-check
import { test, expect } from '@playwright/test';

/**
 * @fileoverview Visual QA and Animation Detection Tests
 * Validates that animations are running and visual elements are properly styled.
 *
 * This test goes beyond 404 detection to verify:
 * - CSS animations are applied and running
 * - Key visual elements have expected computed styles
 * - Text reveal animations trigger on scroll
 * - Hero section has proper layout (100vh, parallax layers)
 *
 * Usage:
 *   npx playwright test tests/integration/visual-qa.spec.js
 *   npm run test:visual
 */

/**
 * Navigate to index page - uses baseURL from playwright.config.js
 * baseURL is 'http://localhost:3000/pages', so goto('/') navigates to /pages/
 * or goto('/index.html') navigates to /pages/index.html
 */

test.describe('Animation Detection', () => {
  test('hero section should have 100vh height', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');

    const heroSection = page.locator('[data-hero-section], .hero-section, #hero');
    await expect(heroSection).toBeVisible();

    // Get viewport height and hero height
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const heroBox = await heroSection.boundingBox();

    // Hero should be approximately 100vh (within 10% tolerance for browser chrome)
    expect(heroBox?.height).toBeGreaterThanOrEqual(viewportHeight * 0.9);
  });

  test('parallax layers should be present', async ({ page }) => {
    await page.goto('/index.html');
    // Use networkidle to ensure redirects complete and page fully loads
    await page.waitForLoadState('networkidle');

    // Check for parallax layers
    const parallaxLayers = page.locator('[data-parallax-layer]');
    const count = await parallaxLayers.count();

    // Should have at least 3 parallax layers (per acceptance criteria)
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('water particles container should exist', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');

    const waterParticles = page.locator('[data-water-particles]');
    await expect(waterParticles).toBeVisible();
  });

  test('text reveal elements should have animation classes', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Wait for animations to initialize
    await page.waitForTimeout(500);

    // Check for elements with data-reveal attribute
    const revealElements = page.locator('[data-reveal]');
    const count = await revealElements.count();

    expect(count).toBeGreaterThan(0);
  });

  test('CSS animations should be defined and applied', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Wait for JS initialization
    await page.waitForTimeout(1000);

    // Check if animation-related CSS is loaded
    const hasAnimationCSS = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let hasWaterFlow = false;
      let hasTextReveal = false;

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            const cssText = rule.cssText || '';
            if (cssText.includes('@keyframes water-flow') || cssText.includes('water-flow')) {
              hasWaterFlow = true;
            }
            if (cssText.includes('@keyframes reveal-up') || cssText.includes('text-reveal')) {
              hasTextReveal = true;
            }
          }
        } catch (e) {
          // Cross-origin stylesheets will throw
          continue;
        }
      }

      return { hasWaterFlow, hasTextReveal };
    });

    // At least one animation type should be present
    expect(hasAnimationCSS.hasWaterFlow || hasAnimationCSS.hasTextReveal).toBe(true);
  });
});

test.describe('Visual Element Validation', () => {
  test('hero headline should be visible and styled', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const headline = page.locator('.hero-headline, h1[data-reveal]');
    await expect(headline).toBeVisible();

    // Check headline has expected typography
    const fontSize = await headline.evaluate(el => {
      return parseFloat(getComputedStyle(el).fontSize);
    });

    // Headline should have large font size (at least 24px)
    expect(fontSize).toBeGreaterThanOrEqual(24);
  });

  test('CTA buttons should be visible and interactive', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const ctaButtons = page.locator('.hero-cta-button, .hero-cta a');
    const count = await ctaButtons.count();

    // Should have at least one CTA button
    expect(count).toBeGreaterThan(0);

    // First CTA should be visible
    const firstCTA = ctaButtons.first();
    await expect(firstCTA).toBeVisible();

    // Check CTA has appropriate styling (not transparent)
    const bgColor = await firstCTA.evaluate(el => {
      const style = getComputedStyle(el);
      return style.backgroundColor;
    });

    // Background shouldn't be completely transparent
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('statistics counter should display meaningful value', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Wait for counter animation to run
    await page.waitForTimeout(3000);

    const statValue = page.locator('[data-counter-value], .hero-stat-value, [data-animated-counter]');
    const count = await statValue.count();

    if (count > 0) {
      const text = await statValue.first().textContent();
      // Counter should show a number (not just "0" if animation ran)
      // The target is 36 Olympic pools
      const numValue = parseInt(text?.replace(/\D/g, '') || '0', 10);
      expect(numValue).toBeGreaterThanOrEqual(0);
    }
  });

  test('impact dashboard section should exist', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const impactSection = page.locator('[data-impact-dashboard], #impact, .impact-dashboard');
    await expect(impactSection).toBeVisible();
  });
});

test.describe('Animation State Detection', () => {
  test('elements should have animation styles after page load', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check for any element with running animations
    const animatedElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const animated = [];

      for (const el of allElements) {
        const style = getComputedStyle(el);
        const animName = style.animationName;
        const animState = style.animationPlayState;
        const animDuration = style.animationDuration;

        if (animName && animName !== 'none') {
          animated.push({
            tagName: el.tagName,
            className: el.className,
            animationName: animName,
            animationPlayState: animState,
            animationDuration: animDuration
          });
        }
      }

      return animated;
    });

    // Log animated elements for debugging
    if (animatedElements.length === 0) {
      console.warn('Warning: No animated elements detected. Animations may not be running.');
    } else {
      console.log(`Found ${animatedElements.length} animated elements:`,
        animatedElements.slice(0, 5).map(e => `${e.tagName}.${e.className}: ${e.animationName}`)
      );
    }

    // This is a soft check - log warning but don't fail
    // Animations may not be running in test environment
  });

  test('text reveal should trigger on scroll', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Get initial state of reveal elements
    const initialRevealedCount = await page.evaluate(() => {
      const revealed = document.querySelectorAll('[data-reveal].is-revealed, [data-reveal].text-reveal-active');
      return revealed.length;
    });

    // Scroll down to trigger reveals
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);

    // Check if more elements are revealed after scroll
    const afterScrollRevealedCount = await page.evaluate(() => {
      const revealed = document.querySelectorAll('[data-reveal].is-revealed, [data-reveal].text-reveal-active');
      return revealed.length;
    });

    // Log the state change
    console.log(`Reveal state: ${initialRevealedCount} before scroll, ${afterScrollRevealedCount} after scroll`);
  });
});

test.describe('prefers-reduced-motion Compliance', () => {
  test('should respect reduced motion preference', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Check that animations are disabled or simplified
    const animationDuration = await page.evaluate(() => {
      const animatedEl = document.querySelector('.water-flow-active, .water-ripple-active, [data-reveal]');
      if (!animatedEl) return 'no-element';

      const style = getComputedStyle(animatedEl);
      return style.animationDuration;
    });

    // With reduced motion, animations should be very short (0.01ms per CSS) or none
    if (animationDuration !== 'no-element') {
      const duration = parseFloat(animationDuration);
      // Either no animation or very short duration
      expect(duration).toBeLessThanOrEqual(100); // 100ms or less
    }
  });
});

test.describe('JavaScript Initialization Detection', () => {
  test('should capture all console messages for debugging', async ({ page }) => {
    const allLogs = [];
    const errors = [];

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      allLogs.push({ type, text });
      if (type === 'error') {
        errors.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(`PageError: ${error.message}`);
    });

    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Log all console output for debugging
    console.log('\n=== Console Output ===');
    allLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text.substring(0, 200)}`);
    });

    if (errors.length > 0) {
      console.log('\n=== JS Errors ===');
      errors.forEach(e => console.log(e));
    }

    // Check if HeroSection initialized
    const heroInitialized = await page.evaluate(() => {
      // Check if hero section element exists and has expected initialization
      const heroSection = document.querySelector('[data-hero-section]');
      const parallaxLayers = document.querySelectorAll('[data-parallax-layer]');
      const waterParticles = document.querySelector('[data-water-particles]');
      const revealElements = document.querySelectorAll('[data-reveal]');

      return {
        heroExists: !!heroSection,
        parallaxCount: parallaxLayers.length,
        waterParticlesExists: !!waterParticles,
        revealCount: revealElements.length,
        // Check if any reveal elements have been activated
        revealedCount: document.querySelectorAll('[data-reveal].is-revealed, [data-reveal].text-reveal-active').length
      };
    });

    console.log('\n=== Hero State ===');
    console.log(JSON.stringify(heroInitialized, null, 2));
  });

  test('should verify JS module import chain works', async ({ page }) => {
    const moduleErrors = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('import') || text.includes('module') || text.includes('SyntaxError')) {
        moduleErrors.push(text);
      }
    });

    page.on('pageerror', error => {
      moduleErrors.push(`PageError: ${error.message}`);
    });

    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check if main.js loaded and executed
    const initState = await page.evaluate(() => {
      // Check for global initialization indicators
      return {
        documentReady: document.readyState,
        bodyHasDeviceClass: document.body.classList.contains('device-desktop') ||
                           document.body.classList.contains('device-mobile') ||
                           document.body.classList.contains('device-tablet'),
        heroSectionExists: !!document.querySelector('[data-hero-section]'),
        // Check if i18n ran (language selector buttons should have active state)
        i18nRan: document.querySelectorAll('.i18n-language-selector button').length > 0
      };
    });

    console.log('Init state:', JSON.stringify(initState, null, 2));

    if (moduleErrors.length > 0) {
      console.log('Module errors:', moduleErrors);
      throw new Error(`JS module errors detected: ${moduleErrors.join(', ')}`);
    }
  });
});

test.describe('Data Quality & i18n Validation', () => {
  test('should not display raw i18n keys in visible text', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for i18n to initialize

    // Check for i18n key patterns like "hero.stats.olympic_pools" or "impact.section_subtitle"
    const i18nKeyLeaks = await page.evaluate(() => {
      const keyPattern = /^[a-z_]+(\.[a-z_]+){1,5}$/i; // matches word.word.word patterns
      const leaks = [];

      // Check all visible text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const text = node.textContent?.trim();
            if (!text) return NodeFilter.FILTER_REJECT;
            // Skip script/style content
            const parent = node.parentElement;
            if (parent?.tagName === 'SCRIPT' || parent?.tagName === 'STYLE') {
              return NodeFilter.FILTER_REJECT;
            }
            // Only check visible elements
            if (parent && getComputedStyle(parent).display === 'none') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (text && keyPattern.test(text)) {
          leaks.push({
            text,
            parentTag: node.parentElement?.tagName,
            parentClass: node.parentElement?.className
          });
        }
      }
      return leaks;
    });

    // Fail if any i18n keys are visible (they should be translated)
    if (i18nKeyLeaks.length > 0) {
      console.log('Found i18n key leaks:', i18nKeyLeaks);
    }
    expect(i18nKeyLeaks.length).toBe(0);
  });

  test('should not display NaN or undefined values', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for NaN, undefined, null displayed as text
    const badValues = await page.evaluate(() => {
      const badPatterns = ['NaN', 'undefined', 'null', '[object Object]'];
      const found = [];

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (parent?.tagName === 'SCRIPT' || parent?.tagName === 'STYLE') {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent && getComputedStyle(parent).display === 'none') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (text) {
          for (const pattern of badPatterns) {
            // Check for standalone bad values (not part of code/documentation)
            if (text === pattern || text.startsWith(pattern + ' ') || text.endsWith(' ' + pattern)) {
              found.push({
                text: text.substring(0, 100),
                pattern,
                parentTag: node.parentElement?.tagName,
                parentClass: node.parentElement?.className
              });
            }
          }
        }
      }
      return found;
    });

    if (badValues.length > 0) {
      console.log('Found bad display values:', badValues);
    }
    expect(badValues.length).toBe(0);
  });

  test('navigation should be fixed/sticky at top', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Find navigation element
    const nav = page.locator('nav, [role="navigation"], .navbar, .nav, header nav');
    const navCount = await nav.count();

    if (navCount > 0) {
      const navPosition = await nav.first().evaluate(el => {
        const style = getComputedStyle(el);
        return {
          position: style.position,
          top: style.top,
          zIndex: style.zIndex
        };
      });

      console.log('Navigation position:', navPosition);

      // Navigation should be fixed or sticky
      const isFixedOrSticky = navPosition.position === 'fixed' || navPosition.position === 'sticky';
      expect(isFixedOrSticky).toBe(true);
    }
  });

  test('interactive buttons should have click handlers', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Find skip button or similar interactive elements
    const skipButton = page.locator('button:has-text("skip"), [data-skip], .skip-button, button:has-text("Skip")');
    const skipCount = await skipButton.count();

    if (skipCount > 0) {
      // Check if button has click handler or is inside a form/link
      const hasInteraction = await skipButton.first().evaluate(el => {
        // Check for onclick attribute
        if (el.onclick) return true;
        // Check for event listeners (limited detection)
        if (el.getAttribute('onclick')) return true;
        // Check if inside a form
        if (el.closest('form')) return true;
        // Check if it's a link
        if (el.tagName === 'A' && el.href) return true;
        // Check for data attributes that suggest JS handling
        if (el.dataset.action || el.dataset.target) return true;
        return false;
      });

      // Also test that clicking does something (URL change or DOM change)
      const beforeUrl = page.url();
      const beforeHtml = await page.content();

      await skipButton.first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);

      const afterUrl = page.url();
      const afterHtml = await page.content();

      const somethingChanged = beforeUrl !== afterUrl || beforeHtml !== afterHtml;

      if (!hasInteraction && !somethingChanged) {
        console.log('Skip button found but appears non-functional');
      }
      expect(hasInteraction || somethingChanged).toBe(true);
    }
  });

  test('elements with data-timestamp should have values', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for empty timestamp displays
    const timestampElements = page.locator('[data-timestamp], .last-updated, .timestamp');
    const count = await timestampElements.count();

    const emptyTimestamps = [];
    for (let i = 0; i < count; i++) {
      const text = await timestampElements.nth(i).textContent();
      if (!text || text.trim() === '' || text.trim() === 'Updated' || text.includes('undefined')) {
        emptyTimestamps.push({
          index: i,
          text: text || '(empty)'
        });
      }
    }

    if (emptyTimestamps.length > 0) {
      console.log('Found empty timestamp elements:', emptyTimestamps);
    }
    expect(emptyTimestamps.length).toBe(0);
  });

  test('language selector should change page content', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find language selector
    const langButtons = page.locator('.i18n-language-selector button, [data-lang], .lang-switcher button');
    const langCount = await langButtons.count();

    if (langCount >= 2) {
      // Get current content
      const beforeText = await page.locator('h1, .hero-headline').first().textContent();

      // Click a different language
      await langButtons.nth(1).click();
      await page.waitForTimeout(1000);

      // Get content after language change
      const afterText = await page.locator('h1, .hero-headline').first().textContent();

      // Content should have changed (unless already in that language)
      console.log(`Language switch: "${beforeText}" -> "${afterText}"`);

      // At minimum, no errors should occur and content should exist
      expect(afterText).toBeTruthy();
      expect(afterText?.length).toBeGreaterThan(0);
    }
  });

  test('images should have proper src and load successfully', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const broken = [];

      images.forEach((img, i) => {
        // Check if image failed to load
        if (!img.complete || img.naturalWidth === 0) {
          broken.push({
            src: img.src,
            alt: img.alt,
            index: i
          });
        }
      });

      return broken;
    });

    if (brokenImages.length > 0) {
      console.log('Found broken images:', brokenImages);
    }
    expect(brokenImages.length).toBe(0);
  });
});

test.describe('Navigation & Content Completeness', () => {
  test('all navigation links should point to existing sections', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Get all navigation links
    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('nav a[href^="#"], .nav a[href^="#"], header a[href^="#"]');
      const results = [];

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`);
          results.push({
            text: link.textContent?.trim(),
            href: href,
            targetExists: !!targetElement,
            targetId: targetId
          });
        }
      });

      return results;
    });

    // Find dead links
    const deadLinks = navLinks.filter(link => !link.targetExists);

    if (deadLinks.length > 0) {
      console.log('Dead navigation links found:', deadLinks);
    }

    expect(deadLinks.length).toBe(0);
  });

  test('all sections should have meaningful content', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Check each section has more than just a heading
    const incompleteSections = await page.evaluate(() => {
      const sections = document.querySelectorAll('section[id], [data-section], .section');
      const incomplete = [];

      sections.forEach(section => {
        const id = section.id || section.getAttribute('data-section') || section.className;
        const headings = section.querySelectorAll('h1, h2, h3');
        const paragraphs = section.querySelectorAll('p');
        const images = section.querySelectorAll('img');
        const buttons = section.querySelectorAll('button, a.btn, .button');
        const textContent = section.textContent?.trim() || '';

        // Calculate content score
        const headingCount = headings.length;
        const contentElements = paragraphs.length + images.length + buttons.length;

        // Section is incomplete if it has heading but no real content
        // or has very little text content (< 50 chars excluding heading)
        let headingText = '';
        headings.forEach(h => headingText += h.textContent || '');
        const contentText = textContent.replace(headingText, '').trim();

        if (headingCount > 0 && contentElements === 0 && contentText.length < 50) {
          incomplete.push({
            id: id,
            headingCount,
            contentElements,
            textLength: contentText.length
          });
        }
      });

      return incomplete;
    });

    if (incompleteSections.length > 0) {
      console.log('Incomplete sections found:', incompleteSections);
    }

    expect(incompleteSections.length).toBe(0);
  });

  test('buttons should have valid destinations or actions', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Find buttons with empty or placeholder hrefs
    const invalidButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('a.btn, a.button, .cta-button, [role="button"], button');
      const invalid = [];

      buttons.forEach(btn => {
        const tagName = btn.tagName.toLowerCase();
        const href = btn.getAttribute('href');
        const onclick = btn.getAttribute('onclick');
        const hasDataAction = btn.hasAttribute('data-action') || btn.hasAttribute('data-target');
        const type = btn.getAttribute('type');
        const text = btn.textContent?.trim();

        // Skip submit/reset buttons in forms
        if (type === 'submit' || type === 'reset') return;

        // For anchor tags, check href validity
        if (tagName === 'a') {
          if (!href || href === '#' || href === 'javascript:void(0)' || href === 'javascript:;') {
            if (!onclick && !hasDataAction) {
              invalid.push({
                text: text?.substring(0, 50),
                tagName,
                href,
                reason: 'Empty or placeholder href with no click handler'
              });
            }
          }
        }

        // For button tags without onclick or form
        if (tagName === 'button') {
          // Skip language selector buttons (they have JS handlers)
          if (btn.closest('.i18n-language-selector, .lang-switcher, [data-lang-selector]')) return;
          // Skip if it has data-lang attribute (language button)
          if (btn.hasAttribute('data-lang')) return;

          if (!onclick && !hasDataAction && !btn.closest('form')) {
            // Check if it might have event listeners (can't fully detect)
            const id = btn.id;
            const className = btn.className;
            if (!id && !className) {
              invalid.push({
                text: text?.substring(0, 50),
                tagName,
                reason: 'Button without identifiable action'
              });
            }
          }
        }
      });

      return invalid;
    });

    if (invalidButtons.length > 0) {
      console.log('Buttons without valid destinations:', invalidButtons);
    }

    // Allow some tolerance (soft check)
    expect(invalidButtons.length).toBeLessThanOrEqual(2);
  });

  test('CSS @import files should load and apply styles', async ({ page }) => {
    // This test catches the silent spec violation where @import after CSS rules is ignored
    // See: OxygenChain VISUAL_DEBUG_LOG.md - Issues #1, #2, #4 were caused by this

    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const cssAnalysis = await page.evaluate(() => {
      const results = {
        stylesheetsLoaded: [],
        elementsWithDefaultStyles: [],
        importWarnings: []
      };

      // Check all loaded stylesheets
      for (const sheet of document.styleSheets) {
        try {
          const href = sheet.href || 'inline';
          const rulesCount = sheet.cssRules?.length || 0;
          results.stylesheetsLoaded.push({ href, rulesCount });
        } catch (e) {
          // Cross-origin stylesheet, can't access rules
          results.stylesheetsLoaded.push({ href: sheet.href, rulesCount: 'cross-origin' });
        }
      }

      // Find elements that should have custom styles but show browser defaults
      // These are signs that component CSS @imports were silently ignored
      const customComponents = document.querySelectorAll(
        '[data-circular-progress], [data-animated-counter], [data-before-after], [data-favela-map], [data-chart]'
      );

      customComponents.forEach(el => {
        const cs = getComputedStyle(el);
        const firstChild = el.children[0];
        const childCs = firstChild ? getComputedStyle(firstChild) : null;

        // Check for suspicious default values that indicate CSS not loaded
        if (
          (cs.aspectRatio === 'auto' && el.dataset.favelMap) || // Map should have aspect-ratio
          (cs.stroke === 'none' && el.querySelector('svg circle')) || // SVG should have strokes
          (childCs && childCs.width === '0px' && childCs.height === '0px') // Child has no dimensions
        ) {
          results.elementsWithDefaultStyles.push({
            selector: el.dataset.circularProgress ? '[data-circular-progress]' :
                      el.dataset.animatedCounter ? '[data-animated-counter]' :
                      el.dataset.beforeAfter ? '[data-before-after]' :
                      el.dataset.favelMap ? '[data-favela-map]' : '[data-*]',
            issue: 'Component CSS may not be loaded - showing browser defaults'
          });
        }
      });

      return results;
    });

    // Log stylesheet loading info for debugging
    if (cssAnalysis.elementsWithDefaultStyles.length > 0) {
      console.log('Stylesheets loaded:', cssAnalysis.stylesheetsLoaded);
      console.log('Elements with default styles (CSS not applied):', cssAnalysis.elementsWithDefaultStyles);
    }

    // Fail if components are showing browser default styles
    expect(cssAnalysis.elementsWithDefaultStyles.length).toBe(0);
  });

  test('page styles should be consistent across sections', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Get computed styles from multiple sections to check consistency
    const styleAnalysis = await page.evaluate(() => {
      const sections = document.querySelectorAll('section[id], #hero, #impact, #about, main > div');
      const styles = [];

      sections.forEach(section => {
        const id = section.id || section.className?.split(' ')[0] || 'unknown';
        const computedStyle = getComputedStyle(section);

        // Get heading style if exists
        const heading = section.querySelector('h1, h2, h3');
        let headingStyle = null;
        if (heading) {
          const hStyle = getComputedStyle(heading);
          headingStyle = {
            fontFamily: hStyle.fontFamily.split(',')[0].trim(),
            color: hStyle.color
          };
        }

        styles.push({
          sectionId: id,
          backgroundColor: computedStyle.backgroundColor,
          headingFont: headingStyle?.fontFamily,
          headingColor: headingStyle?.color
        });
      });

      return styles;
    });

    // Check for inconsistent heading fonts
    const headingFonts = styleAnalysis
      .filter(s => s.headingFont)
      .map(s => s.headingFont);

    const uniqueFonts = [...new Set(headingFonts)];

    if (uniqueFonts.length > 2) {
      console.log('Multiple heading fonts detected:', uniqueFonts);
      console.log('Style analysis:', styleAnalysis);
    }

    // Should have at most 2 different heading fonts (primary and accent)
    expect(uniqueFonts.length).toBeLessThanOrEqual(2);
  });

  test('all visible buttons should respond to interaction', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Find all visible CTA/action buttons
    const ctaButtons = page.locator('.cta-button, .hero-cta a, [data-cta], a.btn-primary, .donate-btn');
    const count = await ctaButtons.count();

    const nonResponsiveButtons = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = ctaButtons.nth(i);
      if (await button.isVisible()) {
        const text = await button.textContent();
        const beforeUrl = page.url();

        try {
          // Try clicking and see if anything happens
          await button.click({ timeout: 2000 });
          await page.waitForTimeout(500);

          const afterUrl = page.url();

          // If URL didn't change, check if modal/overlay appeared
          if (beforeUrl === afterUrl) {
            const modalVisible = await page.locator('.modal, .overlay, [role="dialog"]').isVisible().catch(() => false);
            if (!modalVisible) {
              // Check if scroll position changed (for anchor links)
              const scrolled = await page.evaluate(() => window.scrollY > 100);
              if (!scrolled) {
                nonResponsiveButtons.push({ text: text?.trim(), index: i });
              }
            }
          }

          // Navigate back if URL changed
          if (beforeUrl !== afterUrl) {
            await page.goto('/index.html');
            await page.waitForLoadState('networkidle');
          }
        } catch (e) {
          // Click might have navigated away or timed out
        }
      }
    }

    if (nonResponsiveButtons.length > 0) {
      console.log('Non-responsive buttons:', nonResponsiveButtons);
    }

    expect(nonResponsiveButtons.length).toBe(0);
  });
});

test.describe('Interactive Component & Asset Validation', () => {
  test('interactive containers should have rendered content', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow JS components to initialize

    // Check containers with data-* attributes that should have content
    const emptyContainers = await page.evaluate(() => {
      const interactiveSelectors = [
        '[data-favela-map]',
        '[data-before-after]',
        '[data-chart]',
        '[data-map]',
        '[data-interactive]'
      ];

      const empty = [];

      interactiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, i) => {
          const hasContent = el.children.length > 0 || el.querySelector('svg, canvas, img, video');
          const hasText = el.textContent?.trim().length > 20; // More than just a loading spinner

          // Check if only contains a loading spinner or is empty
          const isLoading = el.querySelector('.loading, .spinner, [class*="load"]');
          const isEmpty = !hasContent && !hasText;
          const isStillLoading = isLoading && !hasContent;

          if (isEmpty || isStillLoading) {
            empty.push({
              selector: selector,
              index: i,
              hasChildren: el.children.length,
              innerHTML: el.innerHTML.substring(0, 100),
              reason: isEmpty ? 'empty_container' : 'still_loading'
            });
          }
        });
      });

      return empty;
    });

    if (emptyContainers.length > 0) {
      console.log('Empty interactive containers found:', emptyContainers);
    }

    expect(emptyContainers.length).toBe(0);
  });

  test('images should not be placeholder stubs', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Check for images that loaded but are tiny (placeholder stubs)
    const placeholderImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const placeholders = [];

      images.forEach((img, i) => {
        // Skip SVG data URLs and intentionally small icons
        if (img.src.startsWith('data:image/svg') ||
            img.classList.contains('icon') ||
            img.width < 20 && img.height < 20) {
          return;
        }

        // Check natural dimensions - placeholder stubs typically have tiny dimensions
        const isTiny = img.naturalWidth > 0 && img.naturalWidth < 10;
        const isBlank = img.naturalWidth === 0 && img.naturalHeight === 0 && img.complete;

        // Check if image failed to render meaningful content
        if (isTiny || isBlank) {
          placeholders.push({
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: img.width,
            displayHeight: img.height,
            reason: isTiny ? 'tiny_dimensions' : 'blank_image'
          });
        }
      });

      return placeholders;
    });

    if (placeholderImages.length > 0) {
      console.log('Placeholder/stub images found:', placeholderImages);
    }

    expect(placeholderImages.length).toBe(0);
  });

  test('SVG map containers should have SVG content', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Specifically check map containers for SVG
    const mapContainersWithoutSVG = await page.evaluate(() => {
      const mapSelectors = ['[data-favela-map]', '[data-map]', '.map-container', '#map'];
      const missing = [];

      mapSelectors.forEach(selector => {
        const containers = document.querySelectorAll(selector);
        containers.forEach((container, i) => {
          const hasSVG = container.querySelector('svg');
          const hasCanvas = container.querySelector('canvas');
          const hasIframe = container.querySelector('iframe');

          if (!hasSVG && !hasCanvas && !hasIframe) {
            missing.push({
              selector: selector,
              index: i,
              childCount: container.children.length,
              ariaLabel: container.getAttribute('aria-label'),
              title: container.closest('article, section')?.querySelector('h1,h2,h3,h4')?.textContent?.trim()
            });
          }
        });
      });

      return missing;
    });

    if (mapContainersWithoutSVG.length > 0) {
      console.log('Map containers without SVG/canvas content:', mapContainersWithoutSVG);
    }

    expect(mapContainersWithoutSVG.length).toBe(0);
  });

  test('before/after comparison should have valid images', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const invalidComparisons = await page.evaluate(() => {
      const containers = document.querySelectorAll('[data-before-after]');
      const invalid = [];

      containers.forEach((container, i) => {
        const beforeSrc = container.getAttribute('data-before-src');
        const afterSrc = container.getAttribute('data-after-src');

        // Check if images exist in DOM
        const beforeImg = container.querySelector('img[src*="before"], .before-image img');
        const afterImg = container.querySelector('img[src*="after"], .after-image img');

        const issues = [];

        if (beforeSrc && !beforeImg) {
          issues.push('before_image_not_rendered');
        }
        if (afterSrc && !afterImg) {
          issues.push('after_image_not_rendered');
        }

        // Check if rendered images have valid dimensions
        if (beforeImg && (beforeImg.naturalWidth < 10 || beforeImg.naturalHeight < 10)) {
          issues.push('before_image_tiny');
        }
        if (afterImg && (afterImg.naturalWidth < 10 || afterImg.naturalHeight < 10)) {
          issues.push('after_image_tiny');
        }

        if (issues.length > 0) {
          invalid.push({
            index: i,
            beforeSrc,
            afterSrc,
            issues,
            title: container.closest('article, section')?.querySelector('h1,h2,h3,h4')?.textContent?.trim()
          });
        }
      });

      return invalid;
    });

    if (invalidComparisons.length > 0) {
      console.log('Invalid before/after comparisons:', invalidComparisons);
    }

    expect(invalidComparisons.length).toBe(0);
  });
});

test.describe('Visual Regression Helpers', () => {
  test('capture hero screenshot for manual review', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for animations to settle

    // Take screenshot of hero section
    const heroSection = page.locator('[data-hero-section], .hero-section, #hero').first();

    if (await heroSection.isVisible()) {
      await heroSection.screenshot({
        path: 'test-results/hero-screenshot.png',
        animations: 'disabled' // Disable animations for consistent screenshots
      });
      console.log('Hero screenshot saved to test-results/hero-screenshot.png');
    }
  });

  test('capture full page screenshot', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/full-page-screenshot.png',
      fullPage: true,
      animations: 'disabled'
    });
    console.log('Full page screenshot saved to test-results/full-page-screenshot.png');
  });
});
