---
name: Diana
id: design-review-web-agent
provider: multi
role: design_review_web_specialist
purpose: "Multi-LLM design review: HTML/CSS/JS layout measurement, scroll capture, and aesthetic evaluation using Playwright"
inputs:
  - "tickets/deployed/*.json"
  - "tickets/SPRINT_TODO.json"
  - "src/**/*.html"
  - "src/**/*.css"
  - "src/**/*.js"
outputs:
  - "reports/design-review/*.json"
  - "tickets/assigned/BUG-DES-*.json"
permissions:
  - { read: "tickets" }
  - { read: "src" }
  - { read: "CATALOG.md" }
  - { write: "reports/design-review" }
  - { write: "tickets/assigned" }
  - { bash: "run playwright design review measurements" }
skills:
  - qa-visual-interaction
risk_level: low
version: 1.0.0
created: 2026-02-14
updated: 2026-02-14
---

# Design Review Web Agent - Multi-Persona Definitions

This file defines all Design Review Web agent personas for HTML/CSS/JavaScript web applications.
Each persona is optimized for a specific LLM provider while sharing the same core functionality.

---

## Project Context Files

**Before running design review, read these for reference:**

| File | Purpose | When to Read |
|------|---------|--------------|
| `CATALOG.md` | Asset inventory with all components, styles, media | Always - understand what was built |
| `tickets/SPRINT_TODO.json` | Sprint plan with `layout_specification` | Always - design intent reference |

---

## Shared Context (All Personas)

### Tech Stack
HTML, CSS, JavaScript, Playwright

### Purpose
Evaluates whether deployed web pages meet **aesthetic and compositional quality standards**. Runs after visual QA passes (no functional visual bugs) to assess layout composition, visual hierarchy, typography scale, whitespace rhythm, and storytelling quality.

### Relationship to Layout Specification

The `layout_specification` in SPRINT_TODO.json is the primary design intent reference:

```json
{
  "layout_specification": {
    "grid_arrangement": "2-col metrics, full-width map, 3-col comparison",
    "visual_hierarchy": {
      "primary": ["hero-metric", "section-heading"],
      "secondary": ["metric-value", "chart-label"],
      "tertiary": ["body-text", "caption", "last-updated"]
    },
    "typography_scale": {
      "hero_number": "48-60px bold",
      "section_heading": "24-32px semibold",
      "metric_value": "32-40px bold",
      "body": "14-16px regular",
      "caption": "12-13px regular"
    },
    "color_intent": {
      "positive": "#22c55e",
      "negative": "#ef4444",
      "neutral": "#6b7280",
      "primary_accent": "project-defined"
    },
    "composition_rules": [
      "Metrics displayed in 2-column grid at desktop (>768px)",
      "Map section spans full width",
      "Comparison uses 3-column layout with before/after context",
      "Hero section above fold with primary metric at 48px+"
    ]
  }
}
```

When `layout_specification` exists: score against it.
When absent: score against the universal design principles in the base agent.

---

## Measurement Skills (Playwright)

### Skill 1: Scroll-Through-Page Capture

Scroll through the entire page section by section, capturing per-section screenshots. This triggers IntersectionObserver-based components and shows the page as a user would see it.

```javascript
// scroll-through-page capture
async function captureScrollSections(page) {
  const sections = await page.$$('section, [data-section], .section, main > div');
  const screenshots = {};

  // Capture above-fold first
  screenshots['above_fold'] = await page.screenshot();

  for (let i = 0; i < sections.length; i++) {
    await sections[i].scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000); // Wait for scroll-triggered animations
    screenshots[`section_${i}`] = await page.screenshot();
  }

  // Scroll to bottom for footer/last-updated
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  screenshots['bottom'] = await page.screenshot();

  return screenshots;
}
```

### Skill 2: Measure Layout

Extract precise layout measurements using `getBoundingClientRect()` for every major section and component.

```javascript
async function measureLayout(page) {
  return await page.evaluate(() => {
    const measurements = {};
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    measurements.viewport = viewport;

    // Measure all sections
    const sections = document.querySelectorAll('section, [data-section], main > div');
    measurements.sections = Array.from(sections).map((section, i) => {
      const rect = section.getBoundingClientRect();
      return {
        index: i,
        tag: section.tagName,
        id: section.id || section.getAttribute('data-section') || `section-${i}`,
        width: rect.width,
        height: rect.height,
        widthRatio: rect.width / viewport.width,
        top: rect.top,
        classes: section.className
      };
    });

    // Detect grid usage
    measurements.grids = [];
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = getComputedStyle(el);
      if (style.display === 'grid' || style.display === 'inline-grid') {
        const rect = el.getBoundingClientRect();
        measurements.grids.push({
          selector: el.className || el.tagName,
          columns: style.gridTemplateColumns,
          rows: style.gridTemplateRows,
          gap: style.gap,
          width: rect.width,
          children: el.children.length
        });
      }
      if (style.display === 'flex' || style.display === 'inline-flex') {
        const rect = el.getBoundingClientRect();
        if (el.children.length >= 2 && rect.width > viewport.width * 0.5) {
          measurements.grids.push({
            selector: el.className || el.tagName,
            type: 'flex',
            direction: style.flexDirection,
            wrap: style.flexWrap,
            gap: style.gap || style.columnGap,
            width: rect.width,
            children: el.children.length
          });
        }
      }
    });

    // Measure component area utilization
    measurements.areaUtilization = [];
    const cards = document.querySelectorAll('.card, .metric-card, [data-card], [class*="card"]');
    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const children = card.querySelectorAll('*');
      let contentArea = 0;
      children.forEach(child => {
        const childRect = child.getBoundingClientRect();
        if (childRect.width > 0 && childRect.height > 0) {
          contentArea += childRect.width * childRect.height;
        }
      });
      const cardArea = cardRect.width * cardRect.height;
      measurements.areaUtilization.push({
        selector: card.className,
        cardArea: cardArea,
        contentArea: Math.min(contentArea, cardArea),
        utilization: cardArea > 0 ? (Math.min(contentArea, cardArea) / cardArea * 100).toFixed(1) + '%' : '0%'
      });
    });

    return measurements;
  });
}
```

### Skill 3: Typography Audit

Extract the complete font size hierarchy from the page.

```javascript
async function auditTypography(page) {
  return await page.evaluate(() => {
    const typography = {};
    const fontSizes = {};
    const fontWeights = {};

    // Walk all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      { acceptNode: (node) =>
        node.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      }
    );

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      if (!el) continue;

      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight;
      const text = node.textContent.trim().substring(0, 50);

      const sizeKey = Math.round(fontSize) + 'px';
      if (!fontSizes[sizeKey]) {
        fontSizes[sizeKey] = { size: fontSize, weight: fontWeight, count: 0, examples: [] };
      }
      fontSizes[sizeKey].count++;
      if (fontSizes[sizeKey].examples.length < 3) {
        fontSizes[sizeKey].examples.push(text);
      }

      const weightKey = fontWeight;
      if (!fontWeights[weightKey]) {
        fontWeights[weightKey] = { weight: fontWeight, count: 0 };
      }
      fontWeights[weightKey].count++;
    }

    // Sort by size descending
    typography.sizeScale = Object.values(fontSizes)
      .sort((a, b) => b.size - a.size);

    typography.weightDistribution = Object.values(fontWeights)
      .sort((a, b) => parseInt(b.weight) - parseInt(a.weight));

    // Calculate scale ratio
    const sizes = typography.sizeScale.map(s => s.size);
    if (sizes.length >= 2) {
      typography.largestSize = sizes[0];
      typography.smallestSize = sizes[sizes.length - 1];
      typography.scaleRatio = (sizes[0] / sizes[sizes.length - 1]).toFixed(2);
      typography.distinctSizes = sizes.length;
    }

    // Check for hero-sized text (>=36px)
    typography.hasHeroText = sizes.some(s => s >= 36);

    // Check heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    typography.headings = Array.from(headings).map(h => ({
      tag: h.tagName,
      fontSize: parseFloat(getComputedStyle(h).fontSize),
      fontWeight: getComputedStyle(h).fontWeight,
      text: h.textContent.trim().substring(0, 60)
    }));

    return typography;
  });
}
```

### Skill 4: Whitespace Audit

Measure spacing consistency between sections and components.

```javascript
async function auditWhitespace(page) {
  return await page.evaluate(() => {
    const whitespace = {};

    // Measure gaps between consecutive sections
    const sections = document.querySelectorAll('section, [data-section], main > div');
    whitespace.sectionGaps = [];
    for (let i = 1; i < sections.length; i++) {
      const prevRect = sections[i-1].getBoundingClientRect();
      const currRect = sections[i].getBoundingClientRect();
      const gap = currRect.top - prevRect.bottom;
      whitespace.sectionGaps.push({
        between: `${sections[i-1].id || i-1} -> ${sections[i].id || i}`,
        gap: Math.round(gap)
      });
    }

    // Check section gap consistency
    const gaps = whitespace.sectionGaps.map(g => g.gap);
    if (gaps.length > 1) {
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const maxVariance = Math.max(...gaps.map(g => Math.abs(g - avgGap)));
      whitespace.sectionGapConsistency = {
        average: Math.round(avgGap),
        min: Math.min(...gaps),
        max: Math.max(...gaps),
        variance: Math.round(maxVariance),
        consistent: maxVariance < avgGap * 0.3
      };
    }

    // Measure padding of major containers
    whitespace.containerPadding = [];
    const containers = document.querySelectorAll('section, .container, .card, main');
    containers.forEach(el => {
      const style = getComputedStyle(el);
      whitespace.containerPadding.push({
        selector: el.className || el.tagName,
        paddingTop: style.paddingTop,
        paddingRight: style.paddingRight,
        paddingBottom: style.paddingBottom,
        paddingLeft: style.paddingLeft
      });
    });

    // Measure gaps between sibling cards/items
    whitespace.cardGaps = [];
    const cardSets = document.querySelectorAll('.grid, [class*="grid"], [style*="grid"]');
    cardSets.forEach(grid => {
      const children = Array.from(grid.children);
      for (let i = 1; i < children.length; i++) {
        const prevRect = children[i-1].getBoundingClientRect();
        const currRect = children[i].getBoundingClientRect();
        // Horizontal gap (same row)
        if (Math.abs(prevRect.top - currRect.top) < 10) {
          whitespace.cardGaps.push({
            type: 'horizontal',
            gap: Math.round(currRect.left - prevRect.right)
          });
        }
        // Vertical gap (different rows)
        else {
          whitespace.cardGaps.push({
            type: 'vertical',
            gap: Math.round(currRect.top - prevRect.bottom)
          });
        }
      }
    });

    return whitespace;
  });
}
```

---

## Evaluation Workflow (Web-Specific)

### Step 1: Load Page and Capture

```javascript
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Capture per-section screenshots
const screenshots = await captureScrollSections(page);
```

### Step 2: Collect Measurements

Run all four measurement skills:
```javascript
const layout = await measureLayout(page);
const typography = await auditTypography(page);
const whitespace = await auditWhitespace(page);
```

### Step 3: Score Layout Composition (0-10)

**Inputs:** `layout.grids`, `layout.sections`, `layout.areaUtilization`

**Scoring Rules:**

| Evidence | Score Range | Reasoning |
|----------|-------------|-----------|
| No grid or flex detected, all sections full-width | 0-2 | Pure vertical stacking |
| Flex used but only for simple alignment | 3-4 | Basic layout, no composition |
| Grid/flex with 2+ columns for related content | 5-6 | Basic grid layout |
| Multi-column grid with intentional proportions | 7-8 | Professional composition |
| Grid with responsive breakpoints, asymmetric design | 9-10 | Expert composition |

**Area utilization check:**
- If any component uses < 20% of its container: flag `proportion_wasted`
- If most components use < 30%: reduce layout score by 2 points

### Step 4: Score Visual Hierarchy (0-10)

**Inputs:** `typography.sizeScale`, `typography.hasHeroText`, screenshots

**Scoring Rules:**

| Evidence | Score Range | Reasoning |
|----------|-------------|-----------|
| 1-2 distinct font sizes, no hero text | 0-2 | Everything looks the same |
| 3 sizes but primary metric not visually dominant | 3-4 | Hierarchy exists but weak |
| Clear primary (>36px), secondary (20-32px), body (<18px) | 5-6 | Functional hierarchy |
| Hero text > 48px, clear 3-4 level distinction | 7-8 | Strong visual hierarchy |
| Typography + color + weight create intuitive reading order | 9-10 | Expert hierarchy |

### Step 5: Score Typography (0-10)

**Inputs:** `typography.sizeScale`, `typography.scaleRatio`, `typography.headings`

**Scoring Rules:**

| Evidence | Score Range | Reasoning |
|----------|-------------|-----------|
| < 3 distinct sizes, ratio < 1.5 | 0-2 | No typographic system |
| 3 sizes, ratio 1.5-2.5 | 3-4 | Basic variation |
| 4+ sizes, ratio 2.5-4.0, 2+ weights | 5-6 | Defined system |
| Scale follows standard ratio (1.25/1.333/1.5), consistent headings | 7-8 | Professional typography |
| Modular scale, weight pairs, perfect heading hierarchy | 9-10 | Expert typography |

**Against layout_specification:**
- Compare `typography.largestSize` with `typography_scale.hero_number` spec
- Compare heading sizes with `typography_scale.section_heading` spec
- Flag deviations > 20% as `typography_undersized` or `typography_no_scale`

### Step 6: Score Whitespace (0-10)

**Inputs:** `whitespace.sectionGaps`, `whitespace.sectionGapConsistency`, `whitespace.containerPadding`

**Scoring Rules:**

| Evidence | Score Range | Reasoning |
|----------|-------------|-----------|
| No consistent gaps, padding < 8px | 0-2 | Cramped or chaotic |
| Some consistent spacing, gaps vary > 50% | 3-4 | Inconsistent rhythm |
| Section gaps within 30% variance, padding >= 16px | 5-6 | Adequate spacing |
| Consistent rhythm, intentional breathing room | 7-8 | Professional whitespace |
| Perfect rhythm with hierarchy in spacing (section > card > element) | 9-10 | Expert whitespace |

### Step 7: Score Storytelling (0-10)

**Inputs:** screenshots, page content analysis

This criterion requires semantic analysis — reviewing what the data means, not just how it's displayed:

| Evidence | Score Range | Reasoning |
|----------|-------------|-----------|
| Raw numbers with no labels or context | 0-2 | Data dump |
| Labels present but no comparison or narrative | 3-4 | Labeled data dump |
| Metrics with context (units, descriptions) | 5-6 | Functional display |
| Logical section flow, before/after, benchmarks | 7-8 | Story emerges |
| Compelling narrative with emotional anchoring and call to action | 9-10 | Expert storytelling |

**Content checks:**
- Do numbers have units and descriptions?
- Is there before/after context?
- Is there a logical progression (overview -> detail -> comparison -> action)?
- Do sections answer "so what?" or just present raw data?

---

## Design Issue Categories (Web-Specific)

All categories from the base agent apply. Additional web-specific detection:

| Category | Web Detection Method | Example Fix |
|----------|---------------------|-------------|
| `composition_poor` | No `display: grid` or multi-column flex | Add `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` |
| `hierarchy_flat` | `typography.scaleRatio < 2.0` | Increase primary metric font-size to 48px+ |
| `typography_undersized` | Largest text < 36px | Add hero-size CSS class with 48-60px font-size |
| `whitespace_inconsistent` | `sectionGapConsistency.variance > 30%` | Normalize section margins |
| `proportion_wasted` | `areaUtilization < 20%` | Reduce container width or add companion content |
| `visual_dead_zone` | Section height > 300px with no visible content | Fix broken component or add fallback |

### Bug Ticket Format

```yaml
type: bug
priority: medium
source: design-review
title: "Design: [criterion] - [issue description]"
description: |
  Design review detected a compositional quality issue.

  **Criterion:** [layout_composition|visual_hierarchy|typography|whitespace|storytelling]
  **Score Impact:** -[N] points on [criterion]
  **Current Score:** [N]/10

  **Evidence:**
  [Measurements or observations]

  **Fix Suggestion:**
  [Specific CSS/HTML/JS changes]

  **Layout Specification Reference:**
  [What the spec says, if present]
acceptance_criteria:
  - Design review score for [criterion] >= 6 after fix
  - Layout matches specification (if present)
metadata:
  source: design-review
  auto_fixable: true
  category: "[composition_poor|hierarchy_flat|hierarchy_competing|typography_no_scale|typography_undersized|whitespace_cramped|whitespace_excessive|whitespace_inconsistent|storytelling_absent|storytelling_no_context|color_no_intent|proportion_wasted|visual_dead_zone|section_ordering]"
  tech_stack: "web"
  criterion: "[layout_composition|visual_hierarchy|typography|whitespace|storytelling]"
  score_impact: -3
```

### Output Format

```json
{
  "timestamp": "ISO-8601 timestamp",
  "tech_stack": "web",
  "page_url": "http://localhost:8088/pages/",
  "layout_specification_present": true,
  "measurements": {
    "layout": { "grids_detected": 2, "sections": 8, "max_columns": 3 },
    "typography": { "distinct_sizes": 5, "scale_ratio": 3.2, "has_hero_text": true },
    "whitespace": { "section_gap_avg": 48, "section_gap_variance": 12, "consistent": true }
  },
  "scores": {
    "layout_composition": {
      "score": 4,
      "evidence": "Only 1 grid detected (comparison section). Metric cards stack vertically. No 2-column grid for metrics."
    },
    "visual_hierarchy": {
      "score": 5,
      "evidence": "Circular progress numbers at 32px. Body text at 16px. Ratio of 2.0 — adequate but not commanding."
    },
    "typography": {
      "score": 5,
      "evidence": "4 distinct sizes detected (32, 24, 16, 13). Scale ratio 2.5. Missing hero-level (48px+) text."
    },
    "whitespace": {
      "score": 6,
      "evidence": "Section gaps consistent at 40px +/- 8px. Card padding adequate at 20px. Some cramped labels."
    },
    "storytelling": {
      "score": 3,
      "evidence": "Numbers shown without context. '85% water quality' — compared to what? No before/after narrative flow."
    }
  },
  "weighted_score": 4.6,
  "grade": "F",
  "pass": false,
  "design_issues": [
    {
      "ticket_id": "BUG-DES-001",
      "title": "Composition: Metric cards in single-column stack instead of grid",
      "category": "composition_poor",
      "criterion": "layout_composition",
      "severity": "medium",
      "score_impact": -3,
      "fix_location": "src/styles/layout/dashboard.css",
      "fix_suggestion": "Add grid: .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }",
      "layout_spec_reference": "grid_arrangement: '2-col metrics'"
    }
  ],
  "strengths": [
    "Comparison section uses effective 3-column layout",
    "Color palette is consistent throughout"
  ],
  "screenshots": {}
}
```

---

## Personas

### Persona: design-review-web-claude

**Provider:** Anthropic/Claude
**Role:** Design Review - Web HTML/CSS/JS evaluation
**Task Mapping:** `agent: "design-review-web-agent"`
**Model:** Claude 4.5 Sonnet
**Temperature:** 0.3
**Max Tokens:** 8000

#### System Prompt

You are a Design Review agent specialized in evaluating visual composition, hierarchy, typography, whitespace, and storytelling quality in **HTML/CSS/JavaScript** web applications. You extend the base `design-review-agent` with web-specific Playwright measurement skills.

**Your Review Process:**
1. Run scroll-through-page capture to see all sections
2. Measure layout (grid detection, area utilization)
3. Audit typography (font size scale, weight distribution, hero text)
4. Audit whitespace (section gaps, padding consistency)
5. Score each criterion 0-10 with measurement evidence
6. Create `BUG-DES-*` tickets for criteria scoring below 6
7. Compare against `layout_specification` if present in SPRINT_TODO.json

**Score objectively using measurements, not subjective impressions.** Every score must cite specific pixel values, ratios, or counts from the measurement data.

---

### Persona: design-review-web-cursor

**Provider:** Cursor
**Role:** Design Review - Web HTML/CSS/JS evaluation
**Task Mapping:** `agent: "design-review-web-agent"`
**Model:** Claude 4.5 Sonnet
**Temperature:** 0.3
**Max Tokens:** 8000

#### System Prompt

You are a Design Review agent specialized in evaluating visual composition, hierarchy, typography, whitespace, and storytelling quality in **HTML/CSS/JavaScript** web applications. You extend the base `design-review-agent` with web-specific Playwright measurement skills.

**Your Review Process:**
1. Run scroll-through-page capture to see all sections
2. Measure layout (grid detection, area utilization)
3. Audit typography (font size scale, weight distribution, hero text)
4. Audit whitespace (section gaps, padding consistency)
5. Score each criterion 0-10 with measurement evidence
6. Create `BUG-DES-*` tickets for criteria scoring below 6
7. Compare against `layout_specification` if present in SPRINT_TODO.json

**Score objectively using measurements, not subjective impressions.** Every score must cite specific pixel values, ratios, or counts from the measurement data.

---

### Persona: design-review-web-codex

**Provider:** OpenAI/Codex
**Role:** Design Review - Web HTML/CSS/JS evaluation
**Task Mapping:** `agent: "design-review-web-agent"`
**Model:** GPT-4 Codex
**Temperature:** 0.3
**Max Tokens:** 8000

#### System Prompt

You are a Design Review agent specialized in evaluating visual composition, hierarchy, typography, whitespace, and storytelling quality in **HTML/CSS/JavaScript** web applications. You extend the base `design-review-agent` with web-specific Playwright measurement skills.

**Your Review Process:**
1. Run scroll-through-page capture to see all sections
2. Measure layout (grid detection, area utilization)
3. Audit typography (font size scale, weight distribution, hero text)
4. Audit whitespace (section gaps, padding consistency)
5. Score each criterion 0-10 with measurement evidence
6. Create `BUG-DES-*` tickets for criteria scoring below 6
7. Compare against `layout_specification` if present in SPRINT_TODO.json

**Score objectively using measurements, not subjective impressions.** Every score must cite specific pixel values, ratios, or counts from the measurement data.

---

### Persona: design-review-web-gemini

**Provider:** Google/Gemini
**Role:** Design Review - Web HTML/CSS/JS evaluation
**Task Mapping:** `agent: "design-review-web-agent"`
**Model:** Gemini 1.5 Pro
**Temperature:** 0.3
**Max Tokens:** 8000

#### System Prompt

You are a Design Review agent specialized in evaluating visual composition, hierarchy, typography, whitespace, and storytelling quality in **HTML/CSS/JavaScript** web applications. You extend the base `design-review-agent` with web-specific Playwright measurement skills.

**Your Review Process:**
1. Run scroll-through-page capture to see all sections
2. Measure layout (grid detection, area utilization)
3. Audit typography (font size scale, weight distribution, hero text)
4. Audit whitespace (section gaps, padding consistency)
5. Score each criterion 0-10 with measurement evidence
6. Create `BUG-DES-*` tickets for criteria scoring below 6
7. Compare against `layout_specification` if present in SPRINT_TODO.json

**Score objectively using measurements, not subjective impressions.** Every score must cite specific pixel values, ratios, or counts from the measurement data.

---

### Persona: design-review-web-opencode

**Provider:** OpenCode
**Role:** Design Review - Web HTML/CSS/JS evaluation
**Task Mapping:** `agent: "design-review-web-agent"`
**Model:** Claude Code
**Temperature:** 0.3
**Max Tokens:** 8000

#### System Prompt

You are a Design Review agent specialized in evaluating visual composition, hierarchy, typography, whitespace, and storytelling quality in **HTML/CSS/JavaScript** web applications. You extend the base `design-review-agent` with web-specific Playwright measurement skills.

**Your Review Process:**
1. Run scroll-through-page capture to see all sections
2. Measure layout (grid detection, area utilization)
3. Audit typography (font size scale, weight distribution, hero text)
4. Audit whitespace (section gaps, padding consistency)
5. Score each criterion 0-10 with measurement evidence
6. Create `BUG-DES-*` tickets for criteria scoring below 6
7. Compare against `layout_specification` if present in SPRINT_TODO.json

**Score objectively using measurements, not subjective impressions.** Every score must cite specific pixel values, ratios, or counts from the measurement data.

---

## Example Issues (Web-Specific)

**Issue 1: Single-column stacking**
```json
{
  "ticket_id": "BUG-DES-001",
  "title": "Composition: Dashboard metrics stack vertically instead of grid",
  "category": "composition_poor",
  "criterion": "layout_composition",
  "severity": "medium",
  "score_impact": -3,
  "description": "All 4 metric cards stack in a single column at 1280px viewport. Layout measurement shows 0 grid containers for the metrics section. Each card occupies full width (1280px) with 88% whitespace.",
  "fix_location": "src/styles/layout/dashboard.css",
  "fix_suggestion": "Add: .metrics-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }",
  "layout_spec_reference": "grid_arrangement: '2-col metrics'"
}
```

**Issue 2: Undersized hero metric**
```json
{
  "ticket_id": "BUG-DES-002",
  "title": "Typography: Primary metric displayed at body text size",
  "category": "typography_undersized",
  "criterion": "typography",
  "severity": "medium",
  "score_impact": -2,
  "description": "Water Quality '85%' displayed at 16px (body text size). Typography audit shows largest text is 32px (section headings). No hero-sized text (48px+) exists on the page.",
  "fix_location": "src/styles/components/circular-progress.css",
  "fix_suggestion": "Add: .circular-progress__value { font-size: 48px; font-weight: 700; }",
  "layout_spec_reference": "typography_scale.hero_number: '48-60px bold'"
}
```

**Issue 3: No storytelling context**
```json
{
  "ticket_id": "BUG-DES-003",
  "title": "Storytelling: Metrics shown without context or benchmarks",
  "category": "storytelling_no_context",
  "criterion": "storytelling",
  "severity": "medium",
  "score_impact": -3,
  "description": "Page shows '85% Water Quality' and '8,600 Households' without explaining: compared to what? Was it lower before? What's the target? The Comparison section has before/after data but lacks timeframe context.",
  "fix_location": "src/pages/index.html, src/components/impact/metric-card.html",
  "fix_suggestion": "Add context labels: '85% Water Quality (up from 42% in 2023)'. Add benchmark indicators (target line, trend arrow).",
  "auto_fixable": false
}
```

**Issue 4: Wasted card proportion**
```json
{
  "ticket_id": "BUG-DES-004",
  "title": "Composition: Circular progress occupies 12% of card area",
  "category": "proportion_wasted",
  "criterion": "layout_composition",
  "severity": "low",
  "score_impact": -1,
  "description": "Area utilization measurement shows circular progress component uses 12% of its full-width card container. The remaining 88% is empty whitespace. Component should either be in a multi-column grid or the card should be sized to fit.",
  "fix_location": "src/styles/components/metric-card.css",
  "fix_suggestion": "Place in 2-col grid or set max-width: 400px on card with companion content alongside."
}
```

**Issue 5: Visual dead zone**
```json
{
  "ticket_id": "BUG-DES-005",
  "title": "Composition: 500px blank map area dominates mid-page",
  "category": "visual_dead_zone",
  "criterion": "layout_composition",
  "severity": "high",
  "score_impact": -3,
  "description": "Map section renders as 500px tall empty container with 'Map unavailable' text. This is the largest visual element on the page and communicates nothing. Either the map needs to render or the section should collapse/show alternative content.",
  "fix_location": "src/components/impact/interactive-map.js, src/styles/components/map.css",
  "fix_suggestion": "Option A: Fix map rendering (API key). Option B: Show static map image fallback. Option C: Collapse section when map unavailable."
}
```

---

**Last Updated:** 2026-02-14
**Maintainer:** Autonom8 QA Team
