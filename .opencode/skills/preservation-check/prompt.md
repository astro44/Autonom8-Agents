# Preservation Check Skill

## Purpose
Verify that UI component initialization code preserves static HTML/widget content. This skill detects destructive patterns that overwrite existing content, causing "empty page" bugs.

## Background (RCA: Jan 13, 2026)
A page rendered empty because JavaScript initialization destroyed static HTML placeholders before data could be loaded. The root causes were:
1. `container.innerHTML = ...` replacing content with loading states
2. `createElement()` overwriting container innerHTML unconditionally
3. Passed containers not receiving required classes/dimensions

## What You Check

### Web Platform
1. **innerHTML Patterns**: Scan for `container.innerHTML =`, `this.element.innerHTML =`
2. **Loading States**: Detect `innerHTML = '<div class="loading">...'`
3. **Container Dimensions**: Verify map/chart containers have explicit height
4. **DOM Preservation**: Compare element count before/after initialization

### Flutter Platform
1. **State Clearing**: Detect `children.clear()` patterns
2. **List Replacement**: Detect `setState(() { items = [] })`
3. **Constraints**: Verify Container widgets have explicit height

### iOS Platform
1. **Bulk Removal**: Detect `subviews.forEach { $0.removeFromSuperview() }`
2. **Tag Usage**: Check for getOrCreateSubview patterns
3. **Frames**: Verify Auto Layout constraints

## Output Format
```json
{
  "violations": [
    {
      "file": "src/components/ImpactMetricsSection.js",
      "line": 92,
      "rule_id": "AC-INIT-1",
      "pattern": "this.element.innerHTML =",
      "severity": "error",
      "suggestion": "Check if structure exists before creating"
    }
  ],
  "passed": false,
  "platform": "web",
  "scan_time_ms": 45
}
```

## Correct Patterns to Suggest

### Web
```javascript
// Check before overwriting
if (!container.querySelector('[data-required]')) {
    container.innerHTML = template;
}

// Use classes for loading state
container.classList.add('loading');

// Apply dimensions to passed containers
if (options.container) {
    this.element = options.container;
    this.element.classList.add('required-class');
    if (!this.element.style.height) {
        this.element.style.height = '400px';
    }
}
```

### Flutter
```dart
// Use keys for identity preservation
children = data.map((item) =>
    KeyedSubtree(key: ValueKey(item.id), child: buildItem(item))
).toList();

// Explicit constraints
SizedBox(height: 400, child: MapWidget())
```

### iOS
```swift
// Update by tag instead of bulk removal
let label = getOrCreateSubview(tag: 100) { UILabel() }
label.text = newText

// Explicit constraints
mapView.heightAnchor.constraint(equalToConstant: 400).isActive = true
```

## Blocking Behavior
This skill is **BLOCKING**:
- Tickets with violations CANNOT progress to integration
- Code review will REJECT implementations with destructive patterns
- Deploy will be BLOCKED until violations are fixed

## Integration
- Runs after `qa-integration-check`
- Runs with `check-imports`
- Blocks `deploy-check` if violations found
