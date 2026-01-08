---
name: qa-performance
description: Performance validation for web apps. Checks Core Web Vitals (LCP, FID, CLS), bundle sizes, resource counts, and lighthouse scores. Returns JSON with metrics.
---

# qa-performance - Web Performance Validation

Validates performance metrics against budgets. Catches performance regressions before deployment.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "url": "http://localhost:8080",
  "budgets": {
    "lcp_ms": 2500,
    "fid_ms": 100,
    "cls": 0.1,
    "bundle_size_kb": 500,
    "total_requests": 50,
    "lighthouse_performance": 90
  }
}
```

## Metrics Checked

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5s - 4s | >4s |
| **FID** (First Input Delay) | ≤100ms | 100ms - 300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1 - 0.25 | >0.25 |

### Bundle Size

```bash
# Check JS bundle size
du -sh dist/js/*.js

# Check CSS bundle size
du -sh dist/css/*.css

# Check total dist size
du -sh dist/
```

### Resource Counts

```javascript
// Count resources by type
const resources = performance.getEntriesByType('resource');
const counts = {
  scripts: resources.filter(r => r.initiatorType === 'script').length,
  stylesheets: resources.filter(r => r.initiatorType === 'link').length,
  images: resources.filter(r => r.initiatorType === 'img').length,
  fonts: resources.filter(r => r.initiatorType === 'css' && r.name.includes('font')).length
};
```

### Lighthouse Score

```bash
npx lighthouse $url --output=json --only-categories=performance
```

## Instructions

### 1. Measure Core Web Vitals

```javascript
// Using web-vitals library or Performance API
const { getLCP, getFID, getCLS } = require('web-vitals');

getLCP(metric => results.lcp = metric.value);
getFID(metric => results.fid = metric.value);
getCLS(metric => results.cls = metric.value);
```

### 2. Check Bundle Sizes

```bash
# Find all JS bundles
find dist -name "*.js" -exec du -k {} \; | awk '{sum += $1} END {print sum}'

# Check individual bundles
ls -la dist/js/*.js
```

### 3. Count Resources

```bash
# Count images
find src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" \) | wc -l

# Check for unoptimized images
find src -type f -name "*.png" -size +100k
```

### 4. Run Lighthouse

```bash
npx lighthouse http://localhost:8080 \
  --output=json \
  --output-path=./lighthouse-report.json \
  --only-categories=performance \
  --chrome-flags="--headless"
```

## Output Format

```json
{
  "skill": "qa-performance",
  "status": "pass|fail|warning",
  "metrics": {
    "core_web_vitals": {
      "lcp_ms": 1800,
      "lcp_status": "good",
      "fid_ms": 45,
      "fid_status": "good",
      "cls": 0.05,
      "cls_status": "good"
    },
    "bundle_size": {
      "js_kb": 320,
      "css_kb": 45,
      "total_kb": 365,
      "budget_kb": 500,
      "within_budget": true
    },
    "resources": {
      "total_requests": 28,
      "scripts": 8,
      "stylesheets": 3,
      "images": 12,
      "fonts": 2,
      "other": 3
    },
    "lighthouse": {
      "performance": 94,
      "budget": 90,
      "passed": true
    }
  },
  "violations": [
    {
      "metric": "images",
      "message": "3 images over 100KB found",
      "files": ["hero-bg.png", "team-photo.jpg", "map.png"],
      "recommendation": "Compress or convert to WebP"
    }
  ],
  "next_action": "proceed|fix|optimize"
}
```

## Budget Thresholds

| Metric | Default Budget | Severity if Exceeded |
|--------|---------------|---------------------|
| LCP | 2500ms | HIGH |
| FID | 100ms | HIGH |
| CLS | 0.1 | MEDIUM |
| Bundle Size | 500KB | MEDIUM |
| Total Requests | 50 | LOW |
| Lighthouse Perf | 90 | MEDIUM |

## Decision Logic

```
Any HIGH severity violation?
    YES → status: "fail", next_action: "fix"

Any MEDIUM severity violation?
    YES → status: "warning", next_action: "optimize"

All metrics within budget?
    YES → status: "pass", next_action: "proceed"
```

## Common Violations

| Issue | Detection | Fix |
|-------|-----------|-----|
| Large images | `find -size +100k` | Compress/WebP |
| Unminified JS | Bundle >500KB | Enable minification |
| Too many requests | >50 resources | Bundle/lazy load |
| Render-blocking CSS | LCP >2.5s | Critical CSS/async |
| Layout shifts | CLS >0.1 | Reserve space for images |

## Usage Examples

**Basic performance check:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "url": "http://localhost:8080"
}
```

**Strict budgets:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "url": "http://localhost:8080",
  "budgets": {
    "lcp_ms": 1500,
    "bundle_size_kb": 300,
    "lighthouse_performance": 95
  }
}
```

## Token Efficiency

- Runs automated tools (lighthouse, du, find)
- Returns structured metrics JSON
- Provides actionable violation details
- ~30 second execution time
