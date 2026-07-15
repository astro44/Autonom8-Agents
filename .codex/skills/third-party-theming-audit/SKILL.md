---
name: third-party-theming-audit
description: Proactive audit for third-party component theming conflicts. Detects libraries that inject default styles and mandates explicit override patterns before implementation.
version: 1.0.0
phase: design
platforms:
  applicable: [web, flutter, flutter_web, ios, android, react_native, maui, wpf]
  not_applicable: [terraform, solidity, solana, lambda, docker, grpc, dynamodb, postgresql, k8s, helm, node_red, go, python, java, rust]
triggers:
  - design_strategy
  - ticket_grooming
  - pre_implementation
---

# Third-Party Theming Audit

## Purpose

**Proactive prevention** of third-party component styling conflicts. This skill runs during the design/planning phase to:

1. Detect third-party libraries in ticket requirements or dependencies
2. Flag known theming conflict patterns for those libraries
3. Mandate explicit override patterns in implementation guidance
4. Prevent issues like "white text on white background" from reaching QA

## Core Problem

Third-party components (maps, charts, editors, etc.) inject their own default styles which conflict with project design tokens:

```
Project Theme: Dark mode (--color-text-primary: #ffffff)
Third-Party:   Mapbox popup default (background: white, color: inherit)
Result:        White text on white background (invisible)
```

## Platform Applicability

| Platform | Applicable | Override Mechanism |
|----------|------------|-------------------|
| Web (HTML/CSS/JS) | ✅ | CSS specificity, `!important`, custom classes |
| Flutter | ✅ | `Theme.of(context).copyWith()`, widget wrapping |
| iOS (SwiftUI/UIKit) | ✅ | `UIAppearance` proxies, view modifiers, subclassing |
| Android (Compose/XML) | ✅ | `MaterialTheme`, style inheritance, `themes.xml` |
| React Native | ✅ | `defaultProps` override, styled-components, theme providers |
| MAUI/WPF (C#) | ✅ | Resource dictionaries, style inheritance, control templates |
| Backend (Go/Python/Java/Rust) | ❌ | N/A - no UI styling |
| Infrastructure (Terraform/K8s) | ❌ | N/A - no UI styling |
| Blockchain (Solidity/Solana) | ❌ | N/A - smart contracts don't have styling |

## Known Third-Party Libraries Registry

### Web Platform

| Library | Component | Default Conflict | Override Pattern |
|---------|-----------|------------------|------------------|
| **Mapbox GL JS** | `.mapboxgl-popup-content` | White background | `background-color: var(--color-bg-primary) !important` |
| **Mapbox GL JS** | `.mapboxgl-popup-tip` | White arrow | `border-*-color: var(--color-bg-primary) !important` |
| **Mapbox GL JS** | `.mapboxgl-ctrl` | Light controls | Override control button backgrounds |
| **Leaflet** | `.leaflet-popup-content-wrapper` | White background | Custom CSS with higher specificity |
| **Leaflet** | `.leaflet-popup-tip` | White arrow | Border color override |
| **Google Maps** | `.gm-style-iw` | White info window | CSS injection or custom InfoWindow |
| **Chart.js** | Canvas tooltips | Light theme | `options.plugins.tooltip.backgroundColor` |
| **D3.js** | SVG elements | No default fill | Explicit fill from design tokens |
| **TinyMCE** | `.tox-*` | Light skin | Custom skin or `skin: false` + CSS |
| **Quill** | `.ql-*` | Light theme | Custom theme CSS |
| **CodeMirror** | `.cm-*` | Light theme | Theme extension |
| **Monaco Editor** | `.monaco-*` | VS Code light | `theme: 'vs-dark'` or custom |
| **DataTables** | `.dataTables_*` | Light styling | Custom CSS or theme option |
| **Select2** | `.select2-*` | Light dropdown | Theme CSS override |
| **Flatpickr** | `.flatpickr-*` | Light calendar | Theme option or CSS |
| **Swiper** | `.swiper-*` | Minimal default | Pagination/nav color overrides |
| **Plyr** | `.plyr--*` | Blue accent | CSS custom properties |

### Flutter Platform

| Library | Component | Default Conflict | Override Pattern |
|---------|-----------|------------------|------------------|
| **google_maps_flutter** | Info windows | Native styling | Custom `InfoWindow` widget |
| **flutter_map** | Markers/popups | Default colors | `MarkerLayerOptions` theming |
| **fl_chart** | Chart elements | Blue default | `FlSpot`, `BarChartGroupData` colors |
| **syncfusion_flutter_charts** | All charts | Light theme | `SfChartTheme` wrapper |
| **flutter_quill** | Editor | Light background | `QuillStyles` customization |
| **webview_flutter** | Web content | Page default | Inject CSS via JavaScript |
| **flutter_html** | Rendered HTML | Browser defaults | `Style` map configuration |
| **table_calendar** | Calendar | Blue accent | `CalendarStyle` theming |
| **dropdown_search** | Dropdown | Light popup | `popupProps` decoration |

### iOS Platform (SwiftUI/UIKit)

| Library | Component | Default Conflict | Override Pattern |
|---------|-----------|------------------|------------------|
| **MapKit** | `MKAnnotationView` | System styling | Custom annotation view subclass |
| **MapKit** | `MKMarkerAnnotationView` | Red pin default | `markerTintColor`, `glyphTintColor` |
| **Charts (danielgindi)** | All charts | Light theme | `ChartColorTemplates` customization |
| **FSCalendar** | Calendar | Blue selection | Appearance properties |
| **IQKeyboardManager** | Toolbar | Gray default | `toolbarTintColor` configuration |
| **SnapKit** | N/A | No styling | N/A |
| **Kingfisher** | Placeholder | Gray default | Custom placeholder view |
| **MarkdownKit** | Rendered MD | System font/colors | Custom `MarkdownStyle` |

### Android Platform (Compose/XML)

| Library | Component | Default Conflict | Override Pattern |
|---------|-----------|------------------|------------------|
| **Google Maps SDK** | Info windows | White default | Custom `InfoWindowAdapter` |
| **MPAndroidChart** | All charts | Light theme | `setColor()`, theme attributes |
| **Material Calendar** | Calendar | Material default | Theme overlay in XML |
| **Glide** | Placeholder | Gray default | Custom placeholder drawable |
| **ExoPlayer** | Controls | Dark default | Custom `StyledPlayerControlView` |
| **PhotoView** | Background | Black default | `setBackgroundColor()` |

### React Native Platform

| Library | Component | Default Conflict | Override Pattern |
|---------|-----------|------------------|------------------|
| **react-native-maps** | `Callout` | White background | Custom callout component |
| **react-native-charts-wrapper** | Charts | Default colors | Props for color arrays |
| **react-native-calendars** | Calendar | Blue theme | `theme` prop object |
| **react-native-modal** | Modal | White background | `style` prop override |
| **react-native-picker** | Picker | Native styling | Custom item renderer |

### C# Platform (MAUI/WPF)

| Library | Component | Default Conflict | Override Pattern |
|---------|-----------|------------------|------------------|
| **Mapsui** | Map controls | Light theme | Custom `Style` objects |
| **LiveCharts2** | Charts | Light theme | `Series.Fill`, `Series.Stroke` |
| **Syncfusion.Maui.Charts** | Charts | Light theme | Theme resource dictionary |
| **CommunityToolkit.Maui** | Popups | System default | `Style` property override |

## Input Schema

```json
{
  "ticket": {
    "id": "TICKET-XXX",
    "title": "string",
    "description": "string",
    "acceptance_criteria": ["string"],
    "dependencies": ["string"]
  },
  "project": {
    "platform": "web|flutter|ios|android|react_native|maui",
    "package_json": {},
    "pubspec_yaml": {},
    "podfile": {},
    "build_gradle": {}
  },
  "design_system": {
    "exists": true,
    "theme_mode": "light|dark|system",
    "tokens_file": "path"
  }
}
```

## Output Schema

```json
{
  "audit_result": {
    "platform": "web",
    "third_party_components_detected": [
      {
        "library": "mapbox-gl",
        "version": "^2.15.0",
        "components_used": [".mapboxgl-popup", ".mapboxgl-marker"],
        "conflict_risk": "HIGH",
        "conflict_description": "Popup injects white background, conflicts with dark theme tokens"
      }
    ],
    "binding_decisions": [
      {
        "decision": "REQUIRE_OVERRIDE",
        "target": "src/styles/components/third-party-overrides.css",
        "library": "mapbox-gl",
        "required_overrides": [
          {
            "selector": ".mapboxgl-popup-content",
            "properties": {
              "background-color": "var(--color-bg-primary) !important",
              "color": "var(--color-text-primary) !important"
            }
          },
          {
            "selector": ".mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip",
            "properties": {
              "border-top-color": "var(--color-bg-primary) !important"
            }
          }
        ],
        "enforcement": "BLOCK",
        "reason": "Mapbox popup defaults will cause invisible text in dark mode"
      }
    ],
    "implementation_guidance": {
      "create_files": [
        {
          "path": "src/styles/components/third-party-overrides.css",
          "purpose": "Centralized third-party component theme overrides",
          "must_import_in": "src/styles/main.css"
        }
      ],
      "patterns_to_follow": [
        "All third-party overrides use design tokens, never hardcoded colors",
        "Use !important only for third-party overrides (documented exception)",
        "Group overrides by library with clear comments",
        "Test both light and dark themes if system theme supported"
      ],
      "verification_required": [
        "Visual QA must verify third-party components in both theme modes",
        "Use qa-visual-interaction skill to test popups/modals/tooltips"
      ]
    },
    "qa_handoff": {
      "reactive_skill": "qa-visual-interaction",
      "test_scenarios": [
        {
          "component": "Map popup",
          "action": "Click map marker",
          "verify": "Popup text readable against popup background"
        }
      ]
    }
  }
}
```

## Detection Algorithm

### Step 1: Scan for Third-Party Libraries

**Web:**
```javascript
// Check package.json dependencies
const webLibraries = ['mapbox-gl', 'leaflet', 'chart.js', 'd3', 'tinymce', 'quill', ...];
const detected = Object.keys(packageJson.dependencies || {})
  .filter(dep => webLibraries.includes(dep));
```

**Flutter:**
```yaml
# Check pubspec.yaml dependencies
flutter_libraries:
  - google_maps_flutter
  - flutter_map
  - fl_chart
  - syncfusion_flutter_charts
```

**iOS:**
```ruby
# Check Podfile or Package.swift
ios_libraries:
  - Charts
  - FSCalendar
  - MapKit (system)
```

### Step 2: Match Against Conflict Registry

For each detected library, lookup in the platform-specific registry above.

### Step 3: Assess Theme Conflict Risk

```
IF project.design_system.theme_mode == "dark" AND library.default_theme == "light"
  THEN conflict_risk = "HIGH"

IF project.design_system.theme_mode == "system"
  THEN conflict_risk = "HIGH" (must work in both modes)

IF project.design_system.theme_mode == "light" AND library.default_theme == "light"
  THEN conflict_risk = "LOW" (but still recommend explicit overrides)
```

### Step 4: Generate Binding Decisions

For HIGH risk conflicts, generate REQUIRE_OVERRIDE binding decisions that BLOCK implementation if not addressed.

## Integration with Design Strategist

This skill is invoked by `design-strategist-agent` during the grooming phase:

```
1. Ticket enters grooming
         ↓
2. Design Strategist reads ticket
         ↓
3. IF ticket mentions UI components (maps, charts, editors, etc.)
   THEN invoke third-party-theming-audit skill
         ↓
4. Skill returns binding_decisions and implementation_guidance
         ↓
5. Design Strategist includes in ticket.ux_strategy.third_party_overrides
         ↓
6. Implementation agent receives explicit override requirements
         ↓
7. Code review validates overrides are present
         ↓
8. QA uses qa-visual-interaction to verify rendering
```

## Platform-Specific Override Templates

### Web: third-party-overrides.css

```css
/**
 * Third-Party Component Theme Overrides
 *
 * IMPORTANT: These overrides use !important to ensure project design tokens
 * take precedence over third-party library defaults. This is the documented
 * exception to the "avoid !important" rule.
 *
 * Pattern: Override third-party → Use design tokens → Test both themes
 */

/* ===========================================
 * MAPBOX GL JS
 * =========================================== */

.mapboxgl-popup-content {
  background-color: var(--color-bg-primary) !important;
  color: var(--color-text-primary) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-md) !important;
  font-family: var(--font-family-sans) !important;
}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
  border-top-color: var(--color-bg-primary) !important;
}

.mapboxgl-popup-close-button {
  color: var(--color-text-primary) !important;
}

.mapboxgl-popup-close-button:hover {
  background-color: var(--color-bg-muted) !important;
}

/* ===========================================
 * CHART.JS (if using HTML tooltips)
 * =========================================== */

.chartjs-tooltip {
  background-color: var(--color-bg-primary) !important;
  color: var(--color-text-primary) !important;
  border-radius: var(--radius-md) !important;
}
```

### Flutter: third_party_theming.dart

```dart
/// Third-Party Component Theme Overrides
///
/// Wrap third-party widgets that don't respect MaterialTheme.

import 'package:flutter/material.dart';

/// Wrapper for google_maps_flutter info windows
class ThemedInfoWindow extends StatelessWidget {
  final Widget child;

  const ThemedInfoWindow({required this.child, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(12),
      child: DefaultTextStyle(
        style: theme.textTheme.bodyMedium!,
        child: child,
      ),
    );
  }
}

/// Extension to apply theme to fl_chart
extension FlChartTheming on BuildContext {
  Color get chartPrimaryColor => Theme.of(this).colorScheme.primary;
  Color get chartBackgroundColor => Theme.of(this).colorScheme.surface;
  Color get chartTextColor => Theme.of(this).colorScheme.onSurface;
}
```

### iOS: ThirdPartyTheming.swift

```swift
/// Third-Party Component Theme Overrides
import SwiftUI
import MapKit

/// Themed annotation view for MapKit
class ThemedAnnotationView: MKMarkerAnnotationView {
    override func prepareForDisplay() {
        super.prepareForDisplay()
        markerTintColor = UIColor(AppColors.primary)
        glyphTintColor = UIColor(AppColors.textInverse)
    }
}

/// View modifier for third-party content
struct ThirdPartyContentModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme

    func body(content: Content) -> some View {
        content
            .background(Color(AppColors.surface))
            .foregroundColor(Color(AppColors.textPrimary))
    }
}

extension View {
    func themedThirdPartyContent() -> some View {
        modifier(ThirdPartyContentModifier())
    }
}
```

### Android: ThirdPartyTheming.kt

```kotlin
/**
 * Third-Party Component Theme Overrides
 */
package com.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.google.android.gms.maps.model.BitmapDescriptorFactory

/**
 * Themed info window adapter for Google Maps
 */
@Composable
fun themedInfoWindowColors() = InfoWindowColors(
    backgroundColor = MaterialTheme.colorScheme.surface,
    textColor = MaterialTheme.colorScheme.onSurface,
    borderColor = MaterialTheme.colorScheme.outline
)

/**
 * Chart colors that respect current theme
 */
@Composable
fun themedChartColors() = listOf(
    MaterialTheme.colorScheme.primary,
    MaterialTheme.colorScheme.secondary,
    MaterialTheme.colorScheme.tertiary
)
```

## Verification Handoff

After implementation, the reactive skill `qa-visual-interaction` should verify:

```json
{
  "qa_checklist": [
    {
      "test": "Third-party popup visibility",
      "action": "Click element that triggers popup",
      "expected": "Text clearly visible against background",
      "skill": "qa-visual-interaction"
    },
    {
      "test": "Theme mode compatibility",
      "action": "Toggle between light/dark mode",
      "expected": "Third-party components adapt correctly",
      "skill": "qa-visual-interaction"
    },
    {
      "test": "Design token usage",
      "action": "Inspect computed styles",
      "expected": "No hardcoded colors, all use CSS variables",
      "skill": "css-audit"
    }
  ]
}
```

## Usage

```bash
# Invoked by design-strategist-agent during grooming
/third-party-theming-audit --ticket TICKET-XXX --platform web

# Or manually during planning
/third-party-theming-audit --package-json ./package.json --theme dark
```

## Maintenance

When adding new third-party libraries to the registry:

1. Add to appropriate platform section in this SKILL.md
2. Include: library name, conflicting components, default theme, override pattern
3. Add template code to platform-specific override templates
4. Update qa-visual-interaction with test scenarios for the library

---

**Last Updated:** 2026-01-27
**Maintainer:** Autonom8 QA Team
