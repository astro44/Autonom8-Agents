---
name: css-audit
description: CSS quality audit. Checks for unused selectors, specificity issues, duplicate rules, and design token compliance.
---

# css-audit - CSS Quality Audit

Audits CSS for unused selectors, specificity issues, duplicate declarations, and design token compliance.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "css_dir": "src/styles/",
  "html_dir": "src/",
  "checks": ["unused", "specificity", "duplicates", "tokens"],
  "design_tokens": "src/styles/tokens.css"
}
```

## Instructions

### 1. Find Unused Selectors

```bash
# Extract all CSS selectors
grep -rh "^[.#a-zA-Z]" src/styles/*.css | cut -d'{' -f1

# Check if used in HTML/JS
for selector in $selectors; do
    grep -rq "$selector" src/ || echo "UNUSED: $selector"
done
```

### 2. Check Specificity Issues

```javascript
// Flag high specificity selectors
// Ideal: 0,1,0 (single class)
// Warning: 0,2,0+ (multiple classes)
// Error: 1,0,0+ (ID selectors in component CSS)

const highSpecificity = selectors.filter(s =>
  s.match(/#/) || s.split('.').length > 3
);
```

### 3. Find Duplicate Rules

```bash
# Find duplicate property declarations
grep -rn "color:" src/styles/*.css | sort | uniq -d
grep -rn "font-size:" src/styles/*.css | sort | uniq -d
```

### 4. Design Token Compliance

```css
/* Check hardcoded values vs tokens */
/* BAD: color: #3498db; */
/* GOOD: color: var(--color-primary); */

grep -rn "#[0-9a-fA-F]\{3,6\}" src/styles/*.css
grep -rn "px" src/styles/*.css | grep -v "var(--"
```

## Output Format

```json
{
  "skill": "css-audit",
  "status": "pass|warning|fail",
  "files_audited": 12,
  "selectors_total": 156,
  "checks": {
    "unused": {
      "passed": false,
      "count": 8,
      "selectors": [
        {
          "selector": ".legacy-header",
          "file": "src/styles/header.css",
          "line": 45
        }
      ]
    },
    "specificity": {
      "passed": true,
      "high_specificity": []
    },
    "duplicates": {
      "passed": false,
      "count": 3,
      "duplicates": [
        {
          "property": "color: #333",
          "locations": [
            "src/styles/base.css:12",
            "src/styles/components.css:89"
          ],
          "suggestion": "Extract to var(--color-text)"
        }
      ]
    },
    "tokens": {
      "passed": false,
      "violations": [
        {
          "file": "src/styles/card.css",
          "line": 23,
          "value": "#3498db",
          "suggestion": "Use var(--color-primary)"
        }
      ]
    }
  },
  "summary": {
    "unused_selectors": 8,
    "high_specificity": 0,
    "duplicate_rules": 3,
    "hardcoded_values": 5
  },
  "suggestions": [
    "Remove 8 unused selectors to reduce bundle size",
    "Extract repeated color #333 to design token"
  ],
  "errors": [],
  "next_action": "proceed|cleanup"
}
```

## Checks Performed

| Check | What it Validates | Severity |
|-------|-------------------|----------|
| `unused` | Selectors not referenced in HTML/JS | LOW |
| `specificity` | Selectors below threshold | MEDIUM |
| `duplicates` | No repeated property values | LOW |
| `tokens` | Design token compliance | MEDIUM |
| `important` | Avoid !important | MEDIUM |
| `vendor_prefix` | Autoprefixer handles prefixes | LOW |

## Decision Logic

```
Any specificity violations?
    YES → status: "warning"

Token compliance below 80%?
    YES → status: "warning"

More than 20% unused selectors?
    YES → status: "warning"

All checks pass?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**Full CSS audit:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "css_dir": "src/styles/",
  "html_dir": "src/",
  "checks": ["unused", "specificity", "duplicates", "tokens"],
  "design_tokens": "src/styles/variables.css"
}
```

**Quick unused selector check:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "css_dir": "src/styles/",
  "html_dir": "src/",
  "checks": ["unused"]
}
```

**Token compliance only:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "css_dir": "src/styles/",
  "checks": ["tokens"],
  "design_tokens": "src/styles/tokens.css"
}
```

## Token Efficiency

- Pattern-based analysis
- No AST parsing required
- ~5-15 second execution
- Returns cleanup suggestions
