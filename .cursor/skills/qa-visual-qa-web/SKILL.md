---
name: qa-visual-qa-web
description: Visual QA for HTML/CSS/JS web apps. Validates layout, animations, styling, i18n keys, data display, and interactive elements using Playwright.
context_injection:
  priority: 2
  when:
    - platform == "web"
---

# qa-visual-qa-web - Web Visual QA

Validates that web code looks and animates correctly per acceptance criteria. Runs after integration-qa passes.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "test_path": "tests/integration/visual-qa.spec.js",
  "categories": ["layout", "animation", "styling", "i18n", "data_display"]
}
```

## Issue Categories

| Category | Description | Example |
|----------|-------------|---------|
| `layout` | Wrong dimensions, positioning, spacing | Nav `position: static` instead of fixed |
| `styling` | CSS not applied (colors, fonts) | Button missing background color |
| `animation` | Keyframes missing or not running | Water particles not animating |
| `visibility` | Elements incorrectly hidden | `display: none` wrongly applied |
| `i18n_key_leak` | Raw translation keys visible | `impact.section_subtitle` shown |
| `i18n_broken` | Language switching doesn't work | Clicking 'PT' doesn't change content |
| `data_display` | NaN/undefined/null displayed | "NaN Olympic pools" |
| `interactive` | Buttons don't respond to clicks | Skip button does nothing |
| `empty_component` | Data containers with no content | `[data-chart]` shows only spinner |
| `placeholder_image` | Stub images (tiny dimensions) | Image 39 bytes, naturalWidth < 10 |
| `map_not_rendered` | Map container without SVG/canvas | `[data-map]` has no `<svg>` |
| `scaffolding_only` | UI structure without meaningful content | Section with heading only |
| `silent_spec_violation` | Code violates spec but no error | CSS `@import` after rules |

## Instructions

### 1. Run Playwright Visual Tests

```bash
cd $project_dir
npx playwright test $test_path --project=chromium --reporter=json
```

### 2. For Each Failure, Investigate Root Cause

**Layout issues:**
```bash
# Check computed styles
grep -r "position:" src/styles/
grep -r "height:" src/styles/
```

**Animation issues:**
```bash
# Check if keyframes exist
grep -r "@keyframes" src/styles/
# Check if animation CSS is imported
grep -r "@import.*animation" src/styles/main.css
```

**i18n issues:**
```bash
# Check locale files
grep -r "section_subtitle" locales/
# Check i18n initialization
grep -r "setLocale\|i18n.init" src/js/
```

**Data display issues:**
```bash
# Check data binding
grep -r "parseFloat\|parseInt\|Number(" src/js/
# Check for fallbacks
grep -r "|| 0\|?? 0" src/js/
```

### 3. Silent Spec Violations to Check

| Violation | Detection |
|-----------|-----------|
| CSS `@import` after rules | `@import` appears after any CSS rule - silently ignored |
| JS `textContent =` on parent | Destroys all child elements |
| CSS custom property missing fallback | `var(--undefined)` renders empty |

### 4. Scaffolding Detection

Check for meaningless UI:
- `[data-*]` containers empty after page load
- Images with `naturalWidth < 10`
- Sections with heading only, no content
- Loading spinners visible after 5+ seconds

## Output Format

```json
{
  "skill": "qa-visual-qa-web",
  "status": "pass|fail",
  "tests": {
    "total": 23,
    "passed": 18,
    "failed": 5
  },
  "issues": [
    {
      "ticket_id": "BUG-VIS-001",
      "title": "Hero section height not 100vh",
      "test_name": "hero should have 100vh height",
      "category": "layout",
      "description": "Hero height = 179px instead of 100vh",
      "fix_location": "src/styles/components/hero.css",
      "auto_fixable": true
    }
  ],
  "next_action": "proceed|fix"
}
```

## Decision Logic

| Result | Status | Next Action |
|--------|--------|-------------|
| All tests pass | pass | proceed |
| Only LOW/MEDIUM issues | pass | proceed (with warnings) |
| Any HIGH issues | fail | fix |
| Scaffolding detected | fail | fix (BLOCK_AND_DECOMPOSE) |

## Example Issues

**Layout - Nav not fixed:**
```json
{
  "category": "layout",
  "title": "Navigation not fixed at top",
  "fix_location": "src/styles/components/nav.css",
  "fix_suggestion": "Add: position: fixed; top: 0; width: 100%;"
}
```

**i18n Key Leak:**
```json
{
  "category": "i18n_key_leak",
  "title": "Raw i18n key visible in impact section",
  "description": "'impact.section_subtitle' visible instead of translated text",
  "fix_location": "locales/en.json or src/js/i18n.js"
}
```

**Silent Spec Violation:**
```json
{
  "category": "silent_spec_violation",
  "title": "CSS @import after rules (styles not loading)",
  "description": "@import at line 290 after CSS rules - silently ignored",
  "fix_location": "src/styles/main.css",
  "fix_suggestion": "Move all @import to top of file"
}
```

<!-- CONTEXT_INJECTION_START -->
## VISUAL QA REQUIREMENTS (Web Platform)

When implementing web UI components, follow these rules to pass visual QA:

### Data Attributes for Testing
- Add `data-testid="component-name"` to all major components
- Add `data-testid` to interactive elements (buttons, links, inputs)
- Use semantic naming: `data-testid="hero-section"`, `data-testid="nav-menu"`

### CSS Best Practices
- Place ALL `@import` statements at TOP of CSS files (after `@import` rules are silently ignored)
- Use CSS custom properties with fallbacks: `var(--color-primary, #007bff)`
- Avoid `textContent =` on elements with children (destroys child nodes)

### Layout Requirements
- Fixed navigation: `position: fixed; top: 0; width: 100%;`
- Full-height sections: Use `min-height: 100vh` not `height: 100vh`
- Responsive images: Include `max-width: 100%; height: auto;`

### Animation Checklist
- Define `@keyframes` in CSS before using `animation` property
- Ensure animation CSS file is imported in correct order
- Test animations work in Playwright headless mode

### i18n/Localization
- Never display raw translation keys (e.g., `impact.section_subtitle`)
- Initialize i18n before DOM content renders
- Provide fallback strings for missing translations

### Avoid Scaffolding Issues
- Never commit empty `[data-*]` containers
- Real content must be present (not just loading spinners)
- Images must have actual content (not placeholder bytes)
<!-- CONTEXT_INJECTION_END -->
