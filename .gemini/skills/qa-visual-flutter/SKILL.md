---
name: qa-visual-flutter
description: Visual QA for Flutter apps using golden_toolkit snapshot testing. Validates widgets render correctly across devices and themes.
---

# qa-visual-flutter - Flutter Visual QA

Visual regression testing for Flutter applications using golden_toolkit snapshot comparisons.

## Input Schema

```json
{
  "project_dir": "/path/to/flutter_project",
  "ticket_id": "TICKET-XXX",
  "test_path": "test/golden/",
  "devices": ["phone", "tablet"],
  "themes": ["light", "dark"],
  "update_goldens": false
}
```

## Prerequisites

```yaml
# pubspec.yaml
dev_dependencies:
  golden_toolkit: ^0.15.0
  flutter_test:
    sdk: flutter
```

## Instructions

### 1. Run Golden Tests

```bash
cd $project_dir
flutter test --update-goldens  # First run to generate baselines
flutter test test/golden/       # Subsequent runs to compare
```

### 2. Test Structure

```dart
// test/golden/widget_test.dart
import 'package:golden_toolkit/golden_toolkit.dart';

void main() {
  testGoldens('MyWidget renders correctly', (tester) async {
    final builder = DeviceBuilder()
      ..overrideDevicesForAllScenarios(devices: [
        Device.phone,
        Device.iphone11,
        Device.tabletLandscape,
      ])
      ..addScenario(
        widget: MyWidget(),
        name: 'default state',
      )
      ..addScenario(
        widget: MyWidget(loading: true),
        name: 'loading state',
      );

    await tester.pumpDeviceBuilder(builder);
    await screenMatchesGolden(tester, 'my_widget');
  });
}
```

### 3. Multi-Theme Testing

```dart
testGoldens('Widget supports themes', (tester) async {
  await tester.pumpWidgetBuilder(
    MyWidget(),
    surfaceSize: Device.phone.size,
    wrapper: (child) => MaterialApp(
      theme: ThemeData.light(),
      home: child,
    ),
  );
  await screenMatchesGolden(tester, 'widget_light');

  await tester.pumpWidgetBuilder(
    MyWidget(),
    wrapper: (child) => MaterialApp(
      theme: ThemeData.dark(),
      home: child,
    ),
  );
  await screenMatchesGolden(tester, 'widget_dark');
});
```

## Output Format

```json
{
  "skill": "qa-visual-flutter",
  "status": "pass|fail",
  "tests": {
    "total": 15,
    "passed": 13,
    "failed": 2
  },
  "failures": [
    {
      "test": "my_widget_phone",
      "expected": "test/golden/goldens/my_widget_phone.png",
      "actual": "test/failures/my_widget_phone.png",
      "diff_percent": 2.3,
      "category": "layout_shift"
    }
  ],
  "devices_tested": ["phone", "iphone11", "tablet"],
  "themes_tested": ["light", "dark"],
  "next_action": "proceed|fix|update_goldens"
}
```

## Failure Categories

| Category | Description | Common Cause |
|----------|-------------|--------------|
| `layout_shift` | Widget dimensions changed | Padding/margin changes |
| `color_diff` | Colors don't match | Theme changes |
| `text_diff` | Text rendering different | Font changes |
| `missing_element` | Element not rendered | Conditional logic bug |
| `new_element` | Unexpected element | Unintended addition |

## Decision Logic

```
Diff percent > 5%?
    YES → status: "fail", next_action: "fix"

Diff percent 1-5%?
    YES → status: "warning", review manually

Diff percent < 1%?
    YES → status: "pass" (likely anti-aliasing)
```

## Usage Examples

**Basic golden test:**
```json
{
  "project_dir": "/projects/my_flutter_app",
  "ticket_id": "TICKET-APP-001"
}
```

**Update baselines after intentional changes:**
```json
{
  "project_dir": "/projects/my_flutter_app",
  "ticket_id": "TICKET-APP-001",
  "update_goldens": true
}
```

## Token Efficiency

- Uses flutter test runner
- Binary image comparison (fast)
- Returns structured diff results
- ~10-30 second execution
