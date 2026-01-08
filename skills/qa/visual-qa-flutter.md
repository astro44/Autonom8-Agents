# visual-qa-flutter

Visual regression testing for Flutter apps using golden_toolkit.

## Purpose

Captures golden (baseline) screenshots of Flutter widgets and screens. Compares against stored goldens to detect visual regressions in layout, theming, and responsive behavior.

## Platforms

Flutter (Dart)

## Input Schema

```json
{
  "project_dir": "/path/to/flutter_app",
  "test_dir": "test/golden",
  "widgets": ["HomeScreen", "ProductCard", "CheckoutButton"],
  "devices": ["phone", "tablet"],
  "themes": ["light", "dark"],
  "update_goldens": false,
  "tolerance": 0.5
}
```

- `project_dir` (required): Root of Flutter project
- `test_dir` (optional): Golden test directory, default "test/golden"
- `widgets` (optional): Specific widgets to test
- `devices` (optional): Device configurations to test
- `themes` (optional): Theme variants to test
- `update_goldens` (optional): Regenerate golden files
- `tolerance` (optional): Pixel tolerance percentage

## Execution Steps

1. **Verify Setup**: Check for golden_toolkit in pubspec.yaml
2. **Build Test Config**: Configure device sizes and themes
3. **Run Golden Tests**: Execute `flutter test --update-goldens` or compare
4. **Parse Output**: Extract pass/fail from test output
5. **Collect Goldens**: Gather generated/compared golden files
6. **Generate Report**: Create comparison report

## Commands

```bash
# Run golden comparison
flutter test test/golden --reporter=json

# Update goldens
flutter test test/golden --update-goldens

# Specific widget
flutter test test/golden/home_screen_test.dart
```

## Output Schema

```json
{
  "skill": "visual-qa-flutter",
  "status": "success|failure|no_goldens",
  "platform_detected": "flutter",
  "results": {
    "total_goldens": 18,
    "passed": 16,
    "failed": 2,
    "updated": 0,
    "comparisons": [
      {
        "widget": "ProductCard",
        "device": "phone",
        "theme": "light",
        "status": "pass",
        "golden": "goldens/product_card_phone_light.png"
      },
      {
        "widget": "CheckoutButton",
        "device": "tablet",
        "theme": "dark",
        "status": "fail",
        "golden": "goldens/checkout_button_tablet_dark.png",
        "actual": "failures/checkout_button_tablet_dark.png"
      }
    ]
  },
  "next_action": "review|proceed|update_goldens"
}
```

## Error Handling

- golden_toolkit not installed: Return setup instructions
- Golden file missing: Return `no_goldens` with generation hint
- Flutter SDK issues: Return with `flutter doctor` suggestion
- Build failures: Return with error details

## Examples

### All Goldens Match
```json
{
  "skill": "visual-qa-flutter",
  "status": "success",
  "results": {
    "total_goldens": 24,
    "passed": 24,
    "failed": 0
  },
  "next_action": "proceed"
}
```
