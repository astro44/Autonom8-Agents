---
name: test-create-fixture-ios
description: Create iOS XCTest fixtures for UI components. Uses swift-snapshot-testing for visual validation across devices and traits.
---

# test-create-fixture-ios - iOS XCTest Fixture Creator

Creates iOS XCTest fixtures for UI components. Used by dev agents during TDD to create isolated test files before implementation.

**Platform:** iOS (Swift)
**Test Framework:** XCTest + swift-snapshot-testing

## Input Schema

```json
{
  "project_dir": "/path/to/ios_project",
  "ticket_id": "TICKET-XXX_A.1",
  "component_path": "Sources/Views/Impact/MetricCardView.swift",
  "fixture_path": "Tests/Views/MetricCardViewTests.swift",
  "component_name": "MetricCardView",
  "view_class": "MetricCardView",
  "view_type": "UIKit|SwiftUI",
  "acceptance_criteria": [
    {"id": "AC-001", "description": "Counter animates from 0 to target"},
    {"id": "AC-002", "description": "Displays unit label correctly"}
  ],
  "devices": ["iPhoneSe", "iPhone14", "iPadPro12_9"],
  "traits": ["light", "dark", "accessibilityLarge"]
}
```

## Prerequisites

Ensure Package.swift or SPM includes:

```swift
dependencies: [
  .package(url: "https://github.com/pointfreeco/swift-snapshot-testing", from: "1.12.0")
]
```

## Instructions

### 1. Locate Templates

```bash
# Fixture template location (in order of priority):
# 1. Project-specific: {project_dir}/Templates/Tests/XCTestCase.template.swift
# 2. Harness: {project_dir}/Harness/Templates/XCTestCase.template.swift
# 3. Global: templates/project/tests/ios/XCTestCase.template.swift
```

### 2. Process Template Variables

Replace mustache-style variables in templates:

| Variable | Source | Example |
|----------|--------|---------|
| `{{TICKET_ID}}` | input.ticket_id | TICKET-OXY-003_A.1 |
| `{{COMPONENT_NAME}}` | input.component_name | MetricCardView |
| `{{VIEW_CLASS}}` | input.view_class | MetricCardView |
| `{{VIEW_TYPE}}` | input.view_type | UIKit or SwiftUI |
| `{{MODULE_IMPORT}}` | Derived from project | @testable import MyApp |
| `{{#ACCEPTANCE_CRITERIA}}` | Loop over ACs | Creates test methods |
| `{{AC_ID}}` | Each AC ID (sanitized) | AC_001 |
| `{{AC_DESCRIPTION}}` | Each AC description | Counter animates... |
| `{{#DEVICES}}` | Loop over devices | .iPhoneSe, .iPhone14 |
| `{{#TRAITS}}` | Loop over traits | .light, .dark |

### 3. Determine View Type

```swift
// UIKit views use UIViewController/UIView directly
// SwiftUI views require UIHostingController wrapper

enum ViewType {
  case uiKit    // Use assertSnapshot(matching: view, as: .image)
  case swiftUI  // Use UIHostingController wrapper
}

func determineViewType(from componentPath: String) -> ViewType {
  // Check file contents for SwiftUI markers
  if content.contains("import SwiftUI") || content.contains(": View {") {
    return .swiftUI
  }
  return .uiKit
}
```

### 4. Generate AC Test Methods

For each acceptance criterion, create a test method:

```swift
// MARK: - AC-001: Counter animates from 0 to target

func test_AC001_rendersCorrectly_iPhone14() {
  let view = MetricCardView(value: 100, label: "Users")
  assertSnapshot(matching: view, as: .image(on: .iPhone14))
}

func test_AC001_rendersCorrectly_darkMode() {
  let view = MetricCardView(value: 100, label: "Users")
  assertSnapshot(
    matching: view,
    as: .image(on: .iPhone14, traits: .init(userInterfaceStyle: .dark))
  )
}
```

### 5. Write Fixture File

```swift
// Ensure directory exists
let fixtureDir = URL(fileURLWithPath: fixturePath).deletingLastPathComponent()
try FileManager.default.createDirectory(at: fixtureDir, withIntermediateDirectories: true)

// Write processed template
try processedTemplate.write(toFile: fixturePath, atomically: true, encoding: .utf8)
```

## Null-Return Handling (CRITICAL - Prevents False Positives)

**Problem:** iOS views can fail to initialize or render. Tests that only catch exceptions will show "success" even when the view failed.

**Solution:** Always verify view state after initialization:

```swift
func test_viewInitializesCorrectly() {
  let view = MetricCardView(value: 42, label: "Users")

  // CRITICAL: Verify view actually initialized (not just that no exception thrown)
  XCTAssertNotNil(view, "View should initialize")

  // For UIKit views, verify subviews exist
  XCTAssertFalse(view.subviews.isEmpty, "View should have subviews")

  // Verify internal state if view exposes it
  XCTAssertTrue(view.isConfigured, "View should be configured")
  XCTAssertEqual(view.displayedValue, 42, "Value should be set")
}

// For SwiftUI views
func test_swiftUIViewInitializesCorrectly() {
  let view = MetricCard(value: 42, label: "Users")
  let hostingController = UIHostingController(rootView: view)

  // Force layout
  hostingController.view.layoutIfNeeded()

  // CRITICAL: Verify view hierarchy exists
  XCTAssertNotNil(hostingController.view, "Hosting controller should have view")
  XCTAssertGreaterThan(
    hostingController.view.subviews.count, 0,
    "SwiftUI view should render subviews"
  )
}
```

**Why This Matters for Fallback Tests:**

```swift
func test_AC006_showsFallbackWhenDataFails() {
  // Configure mock to fail
  let mockService = MockDataService()
  mockService.shouldFail = true

  let view = MetricCardView(dataService: mockService)

  // Trigger data load
  view.loadData()

  // Wait for async completion
  let expectation = XCTestExpectation(description: "Fallback shown")
  DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
    // Verify fallback UI rendered (not silent failure)
    XCTAssertTrue(view.isShowingFallback, "Should show fallback state")
    XCTAssertNotNil(view.fallbackView, "Fallback view should exist")
    expectation.fulfill()
  }
  wait(for: [expectation], timeout: 1.0)
}
```

## Output Format

```json
{
  "skill": "test-create-fixture-ios",
  "status": "success|failure",
  "fixture_created": "Tests/Views/MetricCardViewTests.swift",
  "template_used": "templates/project/tests/ios/XCTestCase.template.swift",
  "platform": "ios",
  "view_type": "UIKit|SwiftUI",
  "variables_replaced": {
    "TICKET_ID": "TICKET-OXY-003_A.1",
    "COMPONENT_NAME": "MetricCardView",
    "MODULE_IMPORT": "@testable import OxygenApp",
    "ACCEPTANCE_CRITERIA": 2,
    "DEVICES": 3,
    "TRAITS": 3
  },
  "test_methods": ["test_AC001_rendersCorrectly", "test_AC002_displaysLabel"],
  "warnings": [],
  "next_action": "run_tests"
}
```

## Happy Path Only (CRITICAL)

**Initial fixtures focus on happy path ONLY.** Edge case testing is deferred to later phases.

### What to Include (Happy Path)
- View renders with valid data
- Standard trait variations (light/dark)
- Expected device sizes
- Basic interaction states

### What to Defer (Edge Cases)
- Error state handling
- Network failure scenarios
- Nil/invalid data handling
- VoiceOver/accessibility edge cases

### Handling Edge Case ACs

When an AC describes edge case behavior, mark as deferred:

```swift
// MARK: - AC-003: Shows error state when network fails
// DEFERRED - Edge case test deferred until happy path validated

func test_AC003_deferred() {
  // Edge case - will be implemented in augment phase
  XCTAssert(true, "Deferred: Edge case test for error state")
}
```

## Example Generated Fixture

```swift
// Tests/Views/MetricCardViewTests.swift
// Generated for: TICKET-OXY-003_A.1
// Component: MetricCardView

import XCTest
import SnapshotTesting
@testable import OxygenApp

final class MetricCardViewTests: XCTestCase {

  // MARK: - Test Helpers

  private func makeView(
    value: Int = 100,
    label: String = "Users"
  ) -> MetricCardView {
    return MetricCardView(value: value, label: label)
  }

  private func makeSwiftUIView(
    value: Int = 100,
    label: String = "Users"
  ) -> UIViewController {
    let view = MetricCard(value: value, label: label)
    let hostingController = UIHostingController(rootView: view)
    hostingController.view.frame = UIScreen.main.bounds
    return hostingController
  }

  // MARK: - Initialization Tests

  func test_viewInitializes() {
    let view = makeView()
    XCTAssertNotNil(view, "View should initialize")
  }

  // MARK: - AC-001: Counter animates from 0 to target

  func test_AC001_rendersCorrectly_iPhone14() {
    let view = makeView(value: 100, label: "Users")
    assertSnapshot(matching: view, as: .image(on: .iPhone14))
  }

  func test_AC001_rendersCorrectly_iPhoneSe() {
    let view = makeView(value: 100, label: "Users")
    assertSnapshot(matching: view, as: .image(on: .iPhoneSe))
  }

  func test_AC001_rendersCorrectly_iPadPro() {
    let view = makeView(value: 100, label: "Users")
    assertSnapshot(matching: view, as: .image(on: .iPadPro12_9))
  }

  // MARK: - AC-002: Displays unit label correctly

  func test_AC002_displaysLabel_lightMode() {
    let view = makeView(value: 42, label: "Active Users")
    assertSnapshot(matching: view, as: .image(on: .iPhone14))
  }

  func test_AC002_displaysLabel_darkMode() {
    let view = makeView(value: 42, label: "Active Users")
    assertSnapshot(
      matching: view,
      as: .image(on: .iPhone14, traits: .init(userInterfaceStyle: .dark))
    )
  }

  func test_AC002_displaysLabel_accessibility() {
    let view = makeView(value: 42, label: "Active Users")
    assertSnapshot(
      matching: view,
      as: .image(
        on: .iPhone14,
        traits: .init(preferredContentSizeCategory: .accessibilityLarge)
      )
    )
  }

  // MARK: - Multi-Device Snapshots

  func test_allDevices() {
    let view = makeView()

    assertSnapshot(matching: view, as: .image(on: .iPhoneSe), named: "iPhoneSe")
    assertSnapshot(matching: view, as: .image(on: .iPhone14), named: "iPhone14")
    assertSnapshot(matching: view, as: .image(on: .iPhone14ProMax), named: "iPhone14ProMax")
    assertSnapshot(matching: view, as: .image(on: .iPadPro12_9), named: "iPadPro")
  }

  // MARK: - Theme Snapshots

  func test_lightTheme() {
    let view = makeView()
    assertSnapshot(
      matching: view,
      as: .image(on: .iPhone14, traits: .init(userInterfaceStyle: .light)),
      named: "light"
    )
  }

  func test_darkTheme() {
    let view = makeView()
    assertSnapshot(
      matching: view,
      as: .image(on: .iPhone14, traits: .init(userInterfaceStyle: .dark)),
      named: "dark"
    )
  }
}
```

## SwiftUI Variant

For SwiftUI views, the fixture uses `UIHostingController`:

```swift
// For SwiftUI components
func test_swiftUIView_iPhone14() {
  let view = MetricCard(value: 100, label: "Users")
  let hostingController = UIHostingController(rootView: view)
  hostingController.view.frame = CGRect(x: 0, y: 0, width: 390, height: 844)

  assertSnapshot(matching: hostingController, as: .image(on: .iPhone14))
}
```

## Token Efficiency

- Template-based generation (no LLM needed for structure)
- ~2-5 second execution
- Returns ready-to-use Swift test file
- Includes snapshot test scaffolding for visual regression
- Supports both UIKit and SwiftUI view types
