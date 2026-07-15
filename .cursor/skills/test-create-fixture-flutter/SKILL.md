---
name: test-create-fixture-flutter
description: Create Flutter widget_test fixtures for UI components. Uses golden_toolkit for snapshot testing with multi-device and theme support.
---

# test-create-fixture-flutter - Flutter Widget Test Fixture Creator

Creates Flutter widget_test fixtures for UI components. Used by dev agents during TDD to create isolated test files before implementation.

**Platform:** Flutter (Dart)
**Test Framework:** flutter_test + golden_toolkit

## Input Schema

```json
{
  "project_dir": "/path/to/flutter_project",
  "ticket_id": "TICKET-XXX_A.1",
  "component_path": "lib/widgets/impact/metric_card.dart",
  "fixture_path": "test/widgets/metric_card_test.dart",
  "component_name": "MetricCard",
  "widget_class": "MetricCard",
  "acceptance_criteria": [
    {"id": "AC-001", "description": "Counter animates from 0 to target"},
    {"id": "AC-002", "description": "Displays unit label correctly"}
  ],
  "devices": ["phone", "tablet"],
  "themes": ["light", "dark"]
}
```

## Prerequisites

Ensure `pubspec.yaml` includes:

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  golden_toolkit: ^0.15.0
```

## Instructions

### 1. Locate Templates

```bash
# Fixture template location (in order of priority):
# 1. Project-specific: {project_dir}/templates/tests/widget_test.template.dart
# 2. Harness: {project_dir}/harness/templates/widget_test.template.dart
# 3. Global: templates/project/tests/flutter/widget_test.template.dart
```

### 2. Process Template Variables

Replace mustache-style variables in templates:

| Variable | Source | Example |
|----------|--------|---------|
| `{{TICKET_ID}}` | input.ticket_id | TICKET-OXY-003_A.1 |
| `{{COMPONENT_NAME}}` | input.component_name | MetricCard |
| `{{WIDGET_CLASS}}` | input.widget_class | MetricCard |
| `{{COMPONENT_IMPORT}}` | Derived from component_path | package:app/widgets/impact/metric_card.dart |
| `{{#ACCEPTANCE_CRITERIA}}` | Loop over ACs | Creates test sections |
| `{{AC_ID}}` | Each AC ID | AC-001 |
| `{{AC_DESCRIPTION}}` | Each AC description | Counter animates... |
| `{{#DEVICES}}` | Loop over devices | Device.phone, Device.tabletLandscape |
| `{{#THEMES}}` | Loop over themes | ThemeData.light(), ThemeData.dark() |

### 3. Calculate Import Path

```dart
// Convert file path to package import
// lib/widgets/impact/metric_card.dart → package:app_name/widgets/impact/metric_card.dart

String toPackageImport(String filePath, String packageName) {
  if (filePath.startsWith('lib/')) {
    return 'package:$packageName/${filePath.substring(4)}';
  }
  return filePath;
}
```

### 4. Generate AC Test Sections

For each acceptance criterion, create a test group:

```dart
group('AC-001: Counter animates from 0 to target', () {
  testWidgets('renders correctly on phone', (tester) async {
    // Test implementation
  });

  testGoldens('visual regression', (tester) async {
    // Golden test implementation
  });
});
```

### 5. Write Fixture File

```dart
// Ensure directory exists
final fixtureDir = path.dirname(fixturePath);
await Directory(fixtureDir).create(recursive: true);

// Write processed template
await File(fixturePath).writeAsString(processedTemplate);
```

## Null-Return Handling (CRITICAL - Prevents False Positives)

**Problem:** Many Flutter widgets can fail silently during build. Tests that only catch exceptions will show "success" even when the widget failed to render.

**Solution:** Always verify widget state after pumping:

```dart
testWidgets('widget initializes correctly', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: MetricCard(value: 42, label: 'Users'),
      ),
    ),
  );

  // CRITICAL: Verify widget actually rendered (not just that no exception thrown)
  final finder = find.byType(MetricCard);
  expect(finder, findsOneWidget, reason: 'MetricCard should render');

  // Verify internal state if widget exposes it
  final state = tester.state<MetricCardState>(finder);
  expect(state.isInitialized, isTrue, reason: 'Widget should be initialized');

  // For async initialization, pump and verify
  await tester.pumpAndSettle();
  expect(find.text('42'), findsOneWidget, reason: 'Value should display');
});
```

**Why This Matters for Fallback Tests:**

```dart
testWidgets('AC-6: Shows fallback when data loading fails', (tester) async {
  // Mock failed data source
  final mockDataSource = MockDataSource();
  when(mockDataSource.fetch()).thenThrow(Exception('Network error'));

  await tester.pumpWidget(
    MaterialApp(
      home: MetricCard(dataSource: mockDataSource),
    ),
  );
  await tester.pumpAndSettle();

  // Verify fallback UI rendered (not silent failure)
  expect(find.byType(MetricCardFallback), findsOneWidget);
  expect(find.text('Unable to load data'), findsOneWidget);
});
```

## Output Format

```json
{
  "skill": "test-create-fixture-flutter",
  "status": "success|failure",
  "fixture_created": "test/widgets/metric_card_test.dart",
  "template_used": "templates/project/tests/flutter/widget_test.template.dart",
  "platform": "flutter",
  "variables_replaced": {
    "TICKET_ID": "TICKET-OXY-003_A.1",
    "COMPONENT_NAME": "MetricCard",
    "COMPONENT_IMPORT": "package:oxygen_app/widgets/impact/metric_card.dart",
    "ACCEPTANCE_CRITERIA": 2,
    "DEVICES": 2,
    "THEMES": 2
  },
  "test_groups": ["AC-001", "AC-002"],
  "warnings": [],
  "next_action": "run_tests"
}
```

## Happy Path Only (CRITICAL)

**Initial fixtures focus on happy path ONLY.** Edge case testing is deferred to later phases.

### What to Include (Happy Path)
- Widget renders with valid props
- Standard state transitions
- Default theme rendering
- Expected device sizes

### What to Defer (Edge Cases)
- Error state handling (AC descriptions mentioning "error", "failed", "missing")
- Network failure scenarios
- Null/invalid data handling
- Accessibility edge cases

### Handling Edge Case ACs

When an AC describes edge case behavior, mark as deferred:

```dart
group('AC-3: Shows error state when network fails', () {
  // DEFERRED - Edge case test deferred until happy path validated
  test('deferred', () {
    // Edge case - will be implemented in augment phase
    expect(true, isTrue, reason: 'Deferred: Edge case test');
  });
});
```

## Example Generated Fixture

```dart
// test/widgets/metric_card_test.dart
// Generated for: TICKET-OXY-003_A.1
// Component: MetricCard

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:oxygen_app/widgets/impact/metric_card.dart';

void main() {
  group('MetricCard - TICKET-OXY-003_A.1', () {

    // Test helpers
    Widget buildTestWidget({
      required int value,
      required String label,
      ThemeData? theme,
    }) {
      return MaterialApp(
        theme: theme ?? ThemeData.light(),
        home: Scaffold(
          body: Center(
            child: MetricCard(value: value, label: label),
          ),
        ),
      );
    }

    group('AC-001: Counter animates from 0 to target', () {
      testWidgets('renders initial state', (tester) async {
        await tester.pumpWidget(buildTestWidget(value: 100, label: 'Users'));

        // Verify widget rendered
        expect(find.byType(MetricCard), findsOneWidget);
      });

      testWidgets('animates to target value', (tester) async {
        await tester.pumpWidget(buildTestWidget(value: 100, label: 'Users'));

        // Pump through animation
        await tester.pumpAndSettle();

        // Verify final value displayed
        expect(find.text('100'), findsOneWidget);
      });

      testGoldens('visual regression - phone', (tester) async {
        await tester.pumpWidgetBuilder(
          buildTestWidget(value: 100, label: 'Users'),
          surfaceSize: Device.phone.size,
        );
        await screenMatchesGolden(tester, 'metric_card_ac001_phone');
      });
    });

    group('AC-002: Displays unit label correctly', () {
      testWidgets('shows label text', (tester) async {
        await tester.pumpWidget(buildTestWidget(value: 42, label: 'Active Users'));

        expect(find.text('Active Users'), findsOneWidget);
      });

      testGoldens('visual regression - with label', (tester) async {
        final builder = DeviceBuilder()
          ..overrideDevicesForAllScenarios(devices: [
            Device.phone,
            Device.tabletLandscape,
          ])
          ..addScenario(
            widget: buildTestWidget(value: 42, label: 'Active Users'),
            name: 'with_label',
          );

        await tester.pumpDeviceBuilder(builder);
        await screenMatchesGolden(tester, 'metric_card_ac002');
      });
    });

    // Theme testing
    group('Theme Support', () {
      testGoldens('light theme', (tester) async {
        await tester.pumpWidgetBuilder(
          buildTestWidget(value: 100, label: 'Users', theme: ThemeData.light()),
          surfaceSize: Device.phone.size,
        );
        await screenMatchesGolden(tester, 'metric_card_light');
      });

      testGoldens('dark theme', (tester) async {
        await tester.pumpWidgetBuilder(
          buildTestWidget(value: 100, label: 'Users', theme: ThemeData.dark()),
          surfaceSize: Device.phone.size,
        );
        await screenMatchesGolden(tester, 'metric_card_dark');
      });
    });
  });
}
```

## Token Efficiency

- Template-based generation (no LLM needed for structure)
- ~2-5 second execution
- Returns ready-to-use Dart test file
- Includes golden test scaffolding for visual regression
