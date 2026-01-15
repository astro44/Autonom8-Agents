---
name: qa-integration-check
description: Verify cross-file integrations. Checks CSS class references, imports/exports, component usage, and asset paths. Returns JSON with validation results.
---

# qa-integration-check - Cross-File Integration Validation

Verify cross-file integrations: imports, exports, CSS class references, component usage.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "files_created": [
    {"path": "src/components/Foo.js", "type": "component"},
    {"path": "src/styles/foo.css", "type": "stylesheet"}
  ],
  "scope": "ticket|project"
}
```

## Integration Checks

### 1. CSS Class References

Verify all CSS classes used in JS/HTML exist in stylesheets:

```
For each file in files_created where type == "component":
    Extract class names from className="..." or class="..."
    └── For each class:
        └── Search *.css files for .classname {
            FOUND → Valid
            NOT_FOUND → Error: "orphan_class"
```

### 2. Import/Export Validation

Verify imports resolve to actual exports:

```
For each import in JS files:
    └── import { Foo } from './Bar'
        └── Check if Bar.js exports Foo
            YES → Valid
            NO  → Error: "broken_import"
```

### 3. Component Usage

Verify component references match actual components:

```
For each <ComponentName> in JSX:
    └── Check if ComponentName is imported
        YES → Valid
        NO  → Error: "undefined_component"
```

### 4. Asset References

Verify image/font/asset paths exist:

```
For each src="..." or url(...):
    └── Resolve path relative to project
        EXISTS → Valid
        NOT_EXISTS → Error: "missing_asset"
```

### 5. DOM Preservation (RCA: Jan 13, 2026)

Verify JavaScript initialization preserves static HTML content:

```
For each HTML file with data-* attributes:
    └── Extract all [data-*] selectors
    └── Find JS files that querySelector these selectors
    └── Check for destructive patterns BEFORE the query:
        - container.innerHTML = (destroys content)
        - this.element.innerHTML = (destroys content)
        FOUND → Error: "content_destroyed"
        NOT_FOUND → Valid
```

### 6. Container Dimensions

Verify map/chart containers have explicit height:

```
For each [data-map-container], [data-chart-container], .mapbox-container:
    └── Check CSS for explicit height (px, em, rem, vh)
        FOUND → Valid
        NOT_FOUND (only height: 100%) → Error: "missing_dimension"
```

### 7. DOM Snapshot Comparison (Browser Test)

Compare element count before/after initialization:

```
Before init:
    count = document.querySelectorAll('[data-*]').length

After init:
    newCount = document.querySelectorAll('[data-*]').length

newCount >= count?
    YES → Valid (preservation)
    NO  → Error: "elements_destroyed"
```

## Output Format

```json
{
  "skill": "qa-integration-check",
  "status": "pass|fail",
  "checks": {
    "css_classes": {
      "passed": true,
      "total": 15,
      "orphans": []
    },
    "imports": {
      "passed": true,
      "total": 8,
      "broken": []
    },
    "components": {
      "passed": true,
      "total": 5,
      "undefined": []
    },
    "assets": {
      "passed": false,
      "total": 3,
      "missing": [
        {"path": "src/assets/logo.png", "referenced_in": "src/components/Header.js"}
      ]
    },
    "dom_preservation": {
      "passed": true,
      "data_attributes_found": 12,
      "violations": []
    },
    "container_dimensions": {
      "passed": true,
      "containers_checked": 3,
      "missing_height": []
    },
    "dom_snapshot": {
      "passed": true,
      "before_count": 24,
      "after_count": 26,
      "elements_destroyed": 0
    }
  },
  "summary": {
    "total_checks": 31,
    "passed": 30,
    "failed": 1
  },
  "errors": [
    {
      "type": "missing_asset",
      "file": "src/components/Header.js",
      "line": 12,
      "message": "Asset not found: src/assets/logo.png"
    }
  ],
  "warnings": [],
  "next_action": "proceed|fix"
}
```

## Error Severity

| Error Type | Severity | Blocks Deploy? |
|------------|----------|----------------|
| broken_import | CRITICAL | YES |
| undefined_component | CRITICAL | YES |
| content_destroyed | CRITICAL | YES |
| elements_destroyed | CRITICAL | YES |
| orphan_class | HIGH | YES |
| missing_asset | HIGH | YES |
| missing_dimension | HIGH | YES |
| unused_export | LOW | NO |
| unused_class | LOW | NO |

## Usage Examples

**Check ticket files only:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-001",
  "files_created": [
    {"path": "src/components/ImpactDashboard.js", "type": "component"},
    {"path": "src/styles/impact-dashboard.css", "type": "stylesheet"}
  ],
  "scope": "ticket"
}
```

**Full project scan:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-001",
  "scope": "project"
}
```

**React component with assets:**
```json
{
  "project_dir": "/projects/react-app",
  "ticket_id": "TICKET-APP-005",
  "files_created": [
    {"path": "src/components/Hero.jsx", "type": "component"},
    {"path": "src/styles/Hero.module.css", "type": "stylesheet"},
    {"path": "src/assets/hero-bg.webp", "type": "asset"}
  ],
  "scope": "ticket"
}
```

## Decision Logic

```
Any CRITICAL/HIGH errors?
    YES → status: "fail", next_action: "fix"
    NO  → status: "pass", next_action: "proceed"
```

## Token Efficiency

- Uses regex pattern matching, not full AST parsing
- Parallel file processing for speed
- Returns structured issues with file:line references
- ~5-15 second execution
