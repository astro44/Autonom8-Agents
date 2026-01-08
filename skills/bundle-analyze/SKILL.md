---
name: bundle-analyze
description: JavaScript bundle analysis. Checks bundle sizes, tree-shaking effectiveness, duplicate dependencies, and chunk splitting.
---

# bundle-analyze - Bundle Size Analysis

Analyzes JavaScript bundles for size issues, duplicate dependencies, and optimization opportunities.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "build_dir": "dist/",
  "budgets": {
    "total": "500KB",
    "main": "200KB",
    "vendor": "300KB"
  },
  "checks": ["size", "duplicates", "tree_shaking"]
}
```

## Instructions

### 1. Measure Bundle Sizes

```bash
# Get file sizes
du -h dist/*.js

# Get gzipped sizes
gzip -c dist/main.js | wc -c
```

### 2. Analyze with source-map-explorer

```bash
# Generate bundle analysis
npx source-map-explorer dist/main.js --json > bundle-analysis.json
```

### 3. Check for Duplicates

```bash
# Find duplicate packages
npx depcheck --json | jq '.missing, .dependencies'

# Check bundle for duplicates
npx webpack-bundle-analyzer dist/stats.json --mode static
```

### 4. Verify Tree Shaking

```javascript
// Check if unused exports are removed
// Look for side-effect-free imports that should be eliminated
```

## Output Format

```json
{
  "skill": "bundle-analyze",
  "status": "pass|warning|fail",
  "bundles": {
    "total": {
      "raw": "423KB",
      "gzip": "142KB",
      "budget": "500KB",
      "passed": true
    },
    "main": {
      "raw": "156KB",
      "gzip": "52KB",
      "budget": "200KB",
      "passed": true
    },
    "vendor": {
      "raw": "267KB",
      "gzip": "90KB",
      "budget": "300KB",
      "passed": true
    }
  },
  "duplicates": [
    {
      "package": "lodash",
      "versions": ["4.17.21", "4.17.19"],
      "size_impact": "24KB",
      "suggestion": "Dedupe to single version"
    }
  ],
  "large_modules": [
    {
      "module": "moment",
      "size": "67KB",
      "suggestion": "Replace with date-fns or dayjs"
    }
  ],
  "tree_shaking": {
    "effective": true,
    "unused_exports": []
  },
  "suggestions": [
    "Consider lazy loading for route /dashboard",
    "Replace moment.js with lighter alternative"
  ],
  "errors": [],
  "next_action": "proceed|optimize"
}
```

## Budget Thresholds

| Bundle Type | Warning | Fail |
|-------------|---------|------|
| Total | >400KB | >600KB |
| Main | >150KB | >250KB |
| Vendor | >250KB | >400KB |
| Per-route chunk | >100KB | >200KB |

## Checks Performed

| Check | What it Validates |
|-------|-------------------|
| `size` | Bundle sizes within budget |
| `duplicates` | No duplicate package versions |
| `tree_shaking` | Unused code eliminated |
| `chunks` | Proper code splitting |
| `sourcemaps` | Source maps generated |

## Decision Logic

```
Any bundle exceeds fail threshold?
    YES → status: "fail", next_action: "optimize"

Any bundle exceeds warning threshold?
    YES → status: "warning", suggestions populated

Duplicate packages found?
    YES → Add to suggestions

All within budget?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**Full bundle analysis:**
```json
{
  "project_dir": "/projects/react-app",
  "build_dir": "build/",
  "budgets": {
    "total": "500KB",
    "main": "200KB",
    "vendor": "300KB"
  },
  "checks": ["size", "duplicates", "tree_shaking"]
}
```

**Quick size check:**
```json
{
  "project_dir": "/projects/react-app",
  "build_dir": "dist/",
  "budgets": {
    "total": "500KB"
  },
  "checks": ["size"]
}
```

**Duplicate detection:**
```json
{
  "project_dir": "/projects/react-app",
  "build_dir": "dist/",
  "checks": ["duplicates"]
}
```

## Token Efficiency

- Uses existing build output
- JSON-based analysis
- ~5-15 second execution
- Returns actionable suggestions
