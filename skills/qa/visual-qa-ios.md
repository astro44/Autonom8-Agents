# visual-qa-ios

Visual regression testing for iOS apps using swift-snapshot-testing.

## Purpose

Captures snapshot images of iOS views and view controllers. Compares against reference snapshots to detect visual regressions in UIKit/SwiftUI components.

## Platforms

iOS (Swift/UIKit/SwiftUI)

## Input Schema

```json
{
  "project_dir": "/path/to/ios_app",
  "scheme": "MyApp",
  "test_target": "MyAppTests",
  "views": ["HomeViewController", "ProfileView"],
  "devices": ["iPhone 14", "iPad Pro 11"],
  "record": false,
  "precision": 0.99
}
```

- `project_dir` (required): Root of iOS project
- `scheme` (required): Xcode scheme to test
- `test_target` (optional): Test target name
- `views` (optional): Specific views to test
- `devices` (optional): Simulator devices to test
- `record` (optional): Record new reference snapshots
- `precision` (optional): Match precision (0-1)

## Execution Steps

1. **Verify Setup**: Check for SnapshotTesting in Package.swift
2. **Build Test Target**: `xcodebuild build-for-testing`
3. **Run Snapshot Tests**: Execute on specified simulators
4. **Parse Results**: Extract pass/fail from xcresult
5. **Collect Snapshots**: Gather reference and failure images
6. **Generate Report**: Create visual comparison report

## Commands

```bash
# Run snapshot tests
xcodebuild test \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 14' \
  -only-testing:MyAppTests/SnapshotTests

# Record new snapshots
RECORD_SNAPSHOTS=1 xcodebuild test ...
```

## Output Schema

```json
{
  "skill": "visual-qa-ios",
  "status": "success|failure|no_reference",
  "platform_detected": "ios",
  "results": {
    "total_snapshots": 12,
    "passed": 10,
    "failed": 2,
    "recorded": 0,
    "comparisons": [
      {
        "view": "HomeViewController",
        "device": "iPhone 14",
        "status": "pass",
        "reference": "__Snapshots__/HomeViewController/iPhone14.png"
      },
      {
        "view": "ProfileView",
        "device": "iPad Pro 11",
        "status": "fail",
        "reference": "__Snapshots__/ProfileView/iPadPro11.png",
        "failure": "failures/ProfileView_iPadPro11.png"
      }
    ]
  },
  "xcresult_path": "build/results.xcresult",
  "next_action": "review|proceed|record"
}
```

## Error Handling

- SnapshotTesting not installed: Return SPM install instructions
- Simulator not available: List available simulators
- Build failure: Return with xcodebuild error
- No reference snapshots: Return `no_reference` with record hint

## Examples

### All Snapshots Match
```json
{
  "skill": "visual-qa-ios",
  "status": "success",
  "results": {
    "total_snapshots": 18,
    "passed": 18,
    "failed": 0
  },
  "next_action": "proceed"
}
```
