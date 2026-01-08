---
name: qa-visual-ios
description: Visual QA for iOS apps using swift-snapshot-testing. Validates UIKit/SwiftUI views render correctly across devices and traits.
---

# qa-visual-ios - iOS Visual QA

Visual regression testing for iOS applications using swift-snapshot-testing.

## Input Schema

```json
{
  "project_dir": "/path/to/ios_project",
  "ticket_id": "TICKET-XXX",
  "test_target": "MyAppTests",
  "devices": ["iPhone14", "iPadPro"],
  "traits": ["light", "dark", "accessibility"],
  "record_mode": false
}
```

## Prerequisites

```swift
// Package.swift or SPM
dependencies: [
  .package(url: "https://github.com/pointfreeco/swift-snapshot-testing", from: "1.12.0")
]
```

## Instructions

### 1. Run Snapshot Tests

```bash
cd $project_dir
xcodebuild test \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 14' \
  -only-testing:MyAppTests/SnapshotTests
```

### 2. Test Structure

```swift
// MyViewSnapshotTests.swift
import XCTest
import SnapshotTesting
@testable import MyApp

class MyViewSnapshotTests: XCTestCase {

  func testMyView_iPhone14() {
    let view = MyView()
    assertSnapshot(matching: view, as: .image(on: .iPhone14))
  }

  func testMyView_darkMode() {
    let view = MyView()
    assertSnapshot(matching: view, as: .image(on: .iPhone14, traits: .init(userInterfaceStyle: .dark)))
  }

  func testMyView_accessibility() {
    let view = MyView()
    assertSnapshot(matching: view, as: .image(on: .iPhone14, traits: .init(preferredContentSizeCategory: .accessibilityLarge)))
  }
}
```

### 3. SwiftUI Testing

```swift
func testSwiftUIView() {
  let view = ContentView()
  let hostingController = UIHostingController(rootView: view)
  hostingController.view.frame = UIScreen.main.bounds

  assertSnapshot(matching: hostingController, as: .image(on: .iPhone14))
}
```

### 4. Multi-Device Testing

```swift
func testMyView_allDevices() {
  let view = MyView()

  assertSnapshot(matching: view, as: .image(on: .iPhoneSe))
  assertSnapshot(matching: view, as: .image(on: .iPhone14))
  assertSnapshot(matching: view, as: .image(on: .iPhone14ProMax))
  assertSnapshot(matching: view, as: .image(on: .iPadPro12_9))
}
```

## Output Format

```json
{
  "skill": "qa-visual-ios",
  "status": "pass|fail",
  "tests": {
    "total": 12,
    "passed": 10,
    "failed": 2
  },
  "failures": [
    {
      "test": "testMyView_darkMode",
      "expected": "__Snapshots__/MyViewTests/testMyView_darkMode.png",
      "actual": "__Snapshots__/MyViewTests/testMyView_darkMode.actual.png",
      "diff_percent": 3.1,
      "category": "color_diff"
    }
  ],
  "devices_tested": ["iPhoneSe", "iPhone14", "iPadPro12_9"],
  "traits_tested": ["light", "dark", "accessibilityLarge"],
  "next_action": "proceed|fix|record"
}
```

## Failure Categories

| Category | Description | Common Cause |
|----------|-------------|--------------|
| `layout_diff` | View frame/bounds changed | Auto Layout changes |
| `color_diff` | Colors don't match | Theme/asset changes |
| `text_diff` | Text rendering different | Font/localization |
| `missing_subview` | Subview not rendered | Visibility logic bug |
| `safe_area` | Safe area insets wrong | Device-specific issue |

## Decision Logic

```
Any test failed?
    YES → Check diff_percent
        > 5% → status: "fail", next_action: "fix"
        1-5% → status: "warning", manual review
        < 1% → likely rendering variance, pass

Record mode requested?
    YES → Update reference snapshots
```

## Usage Examples

**Basic snapshot test:**
```json
{
  "project_dir": "/projects/MyiOSApp",
  "ticket_id": "TICKET-IOS-001"
}
```

**Record new baselines:**
```json
{
  "project_dir": "/projects/MyiOSApp",
  "ticket_id": "TICKET-IOS-001",
  "record_mode": true
}
```

## Token Efficiency

- Uses xcodebuild test runner
- Binary image comparison
- Returns structured results
- ~30-60 second execution
