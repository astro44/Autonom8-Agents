---
name: a11y-check
description: Accessibility audit using axe-core. Checks WCAG 2.1 compliance, keyboard navigation, ARIA attributes, and color contrast.
---

# a11y-check - Accessibility Audit

Runs accessibility checks using axe-core engine. Validates WCAG 2.1 AA compliance, keyboard navigation, ARIA usage, and color contrast.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "url": "http://localhost:8080",
  "pages": ["/", "/about", "/contact"],
  "standard": "WCAG21AA",
  "checks": ["aria", "color", "keyboard", "structure"]
}
```

## Instructions

### 1. Run axe-core Analysis

```javascript
const { AxePuppeteer } = require('@axe-core/puppeteer');

const results = await new AxePuppeteer(page)
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .analyze();
```

### 2. Check Categories

**ARIA:**
- Valid ARIA roles
- Required ARIA attributes
- ARIA label references
- Role-specific attributes

**Color Contrast:**
- Text contrast ratio ≥ 4.5:1 (normal)
- Text contrast ratio ≥ 3:1 (large)
- UI component contrast ≥ 3:1

**Keyboard:**
- All interactive elements focusable
- Visible focus indicators
- Logical tab order
- No keyboard traps

**Structure:**
- Heading hierarchy (h1 → h2 → h3)
- Landmark regions
- Skip links
- Page title

### 3. Severity Classification

| Impact | Description | WCAG Level |
|--------|-------------|------------|
| critical | Blocks users entirely | A |
| serious | Major barriers | A/AA |
| moderate | Difficult to use | AA |
| minor | Annoyances | AAA |

## Output Format

```json
{
  "skill": "a11y-check",
  "status": "pass|fail|warning",
  "standard": "WCAG21AA",
  "pages_tested": 3,
  "summary": {
    "critical": 0,
    "serious": 2,
    "moderate": 5,
    "minor": 8
  },
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must have sufficient color contrast",
      "wcag": ["1.4.3"],
      "nodes": [
        {
          "target": ".footer-link",
          "html": "<a class=\"footer-link\">Privacy</a>",
          "failureSummary": "Element has insufficient color contrast of 2.5:1 (foreground: #888, background: #333). Expected ratio of 4.5:1"
        }
      ],
      "fix": "Change text color to #bbb or darker background"
    }
  ],
  "passes": 45,
  "incomplete": 3,
  "errors": [],
  "next_action": "proceed|fix"
}
```

## WCAG Criteria Checked

| Criterion | Description | Level |
|-----------|-------------|-------|
| 1.1.1 | Non-text content has alt text | A |
| 1.3.1 | Info and relationships | A |
| 1.4.3 | Color contrast (4.5:1) | AA |
| 2.1.1 | Keyboard accessible | A |
| 2.4.1 | Bypass blocks (skip links) | A |
| 2.4.4 | Link purpose | A |
| 4.1.1 | Parsing (valid HTML) | A |
| 4.1.2 | Name, role, value | A |

## Decision Logic

```
Any critical violations?
    YES → status: "fail", next_action: "fix"

Any serious violations?
    YES → status: "fail", next_action: "fix"

Only moderate/minor violations?
    YES → status: "warning", next_action: "proceed"

No violations?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**Full accessibility audit:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "url": "http://localhost:8080",
  "pages": ["/", "/impact", "/about"],
  "standard": "WCAG21AA",
  "checks": ["aria", "color", "keyboard", "structure"]
}
```

**Quick color contrast check:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "url": "http://localhost:8080",
  "pages": ["/"],
  "standard": "WCAG21AA",
  "checks": ["color"]
}
```

**Keyboard navigation only:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "url": "http://localhost:8080",
  "pages": ["/"],
  "checks": ["keyboard"]
}
```

## Token Efficiency

- Uses axe-core engine
- Parallel page analysis
- ~10-30 second execution
- Returns actionable fixes
