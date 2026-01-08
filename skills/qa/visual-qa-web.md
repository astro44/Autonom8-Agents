# visual-qa-web

Visual regression testing for web applications using Playwright screenshots.

## Purpose

Captures screenshots of web components/pages and compares against baseline images. Detects visual regressions in layout, colors, typography, and responsive breakpoints.

## Platforms

Web (HTML/CSS/JS)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "base_url": "http://localhost:3000",
  "routes": ["/", "/dashboard", "/settings"],
  "components": ["Button", "Card", "Modal"],
  "breakpoints": [375, 768, 1024, 1440],
  "threshold": 0.1,
  "update_baselines": false,
  "full_page": true
}
```

- `project_dir` (required): Root directory of target project
- `base_url` (required): URL to capture screenshots from
- `routes` (optional): Page routes to capture
- `components` (optional): Component names to capture in isolation
- `breakpoints` (optional): Viewport widths to test
- `threshold` (optional): Pixel diff threshold (0-1), default 0.1
- `update_baselines` (optional): Update baseline images, default false
- `full_page` (optional): Capture full page vs viewport, default true

## Execution Steps

1. **Launch Browser**: Start Playwright with configured viewport
2. **Navigate to Routes**: Visit each route in sequence
3. **Capture Screenshots**: Take screenshots at each breakpoint
4. **Compare Baselines**: Diff against stored baseline images
5. **Calculate Diff**: Compute pixel difference percentage
6. **Flag Regressions**: Mark tests exceeding threshold
7. **Generate Report**: Create visual diff report with overlays

## Output Schema

```json
{
  "skill": "visual-qa-web",
  "status": "success|failure|no_baseline",
  "platform_detected": "web",
  "results": {
    "total_captures": 12,
    "passed": 10,
    "failed": 2,
    "new_baselines": 0,
    "comparisons": [
      {
        "route": "/dashboard",
        "breakpoint": 1024,
        "diff_percentage": 0.02,
        "status": "pass",
        "baseline": "baselines/dashboard-1024.png",
        "actual": "captures/dashboard-1024.png"
      },
      {
        "route": "/settings",
        "breakpoint": 375,
        "diff_percentage": 15.4,
        "status": "fail",
        "baseline": "baselines/settings-375.png",
        "actual": "captures/settings-375.png",
        "diff": "diffs/settings-375-diff.png"
      }
    ]
  },
  "report_path": "visual-qa-report.html",
  "next_action": "review|proceed|update_baselines"
}
```

## Error Handling

- No baselines exist: Return `no_baseline` status with capture paths
- Server not running: Return failure with startup hint
- Route not found (404): Log warning, continue with other routes
- Timeout on page load: Retry once, then mark as failed

## Examples

### All Visuals Match
```json
{
  "skill": "visual-qa-web",
  "status": "success",
  "results": {
    "total_captures": 24,
    "passed": 24,
    "failed": 0,
    "new_baselines": 0
  },
  "next_action": "proceed"
}
```

### Visual Regression Detected
```json
{
  "skill": "visual-qa-web",
  "status": "failure",
  "results": {
    "total_captures": 24,
    "passed": 22,
    "failed": 2,
    "comparisons": [
      {
        "route": "/checkout",
        "breakpoint": 768,
        "diff_percentage": 8.3,
        "status": "fail",
        "diff": "diffs/checkout-768-diff.png"
      }
    ]
  },
  "next_action": "review"
}
```
