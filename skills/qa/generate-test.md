# generate-test

Scaffold test from component or module.

## Purpose

Automatically generate test files for components, functions, or modules. Analyzes source code to create comprehensive test scaffolds with appropriate assertions, mocks, and fixtures based on platform conventions.

## Platforms

All platforms (auto-detected)

## Input Schema

```json
{
  "source_file": "/path/to/component.tsx",
  "project_dir": "/path/to/project",
  "test_type": "unit|integration|e2e|snapshot",
  "output_path": "/path/to/component.spec.tsx",
  "coverage_target": 80,
  "include_mocks": true,
  "include_fixtures": true
}
```

- `source_file` (required): Path to source file to generate tests for
- `project_dir` (required): Project root for context
- `test_type` (optional): Type of tests to generate, default "unit"
- `output_path` (optional): Custom output path, auto-generated if not provided
- `coverage_target` (optional): Target coverage percentage
- `include_mocks` (optional): Generate mock files
- `include_fixtures` (optional): Generate test fixtures

## Test Generation by Platform

### Web (React/Vue/Angular)
```typescript
// Component: Button.tsx → Button.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Flutter
```dart
// Widget: button.dart → button_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/widgets/button.dart';

void main() {
  group('CustomButton', () {
    testWidgets('displays label', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: CustomButton(label: 'Click me'),
      ));
      expect(find.text('Click me'), findsOneWidget);
    });

    testWidgets('triggers onPressed callback', (tester) async {
      var pressed = false;
      await tester.pumpWidget(MaterialApp(
        home: CustomButton(
          label: 'Click',
          onPressed: () => pressed = true,
        ),
      ));
      await tester.tap(find.byType(CustomButton));
      expect(pressed, isTrue);
    });
  });
}
```

### Python
```python
# Module: user_service.py → test_user_service.py
import pytest
from unittest.mock import Mock, patch
from user_service import UserService

class TestUserService:
    @pytest.fixture
    def service(self):
        return UserService(db=Mock())

    def test_create_user_success(self, service):
        result = service.create_user(email="test@example.com")
        assert result.email == "test@example.com"
        service.db.save.assert_called_once()

    def test_create_user_invalid_email(self, service):
        with pytest.raises(ValueError):
            service.create_user(email="invalid")
```

### Golang
```go
// Package: user.go → user_test.go
package user

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid email", "test@example.com", false},
        {"invalid email", "invalid", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := CreateUser(tt.email)
            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

## Execution Steps

1. **Parse Source File**: Analyze exports, functions, props/parameters
2. **Detect Patterns**: Identify testable units (functions, classes, components)
3. **Analyze Dependencies**: Determine what needs mocking
4. **Generate Test Structure**: Create describe/it blocks or test functions
5. **Add Assertions**: Generate assertions based on return types
6. **Create Mocks**: Generate mock files for dependencies
7. **Add Fixtures**: Create sample data fixtures
8. **Write Files**: Output test file(s)

## Output Schema

```json
{
  "skill": "generate-test",
  "status": "success|partial|failure",
  "platform_detected": "web",
  "test_framework": "jest",
  "results": {
    "files_created": [
      {"path": "src/components/Button.spec.tsx", "lines": 45, "tests": 5}
    ],
    "mocks_created": [
      {"path": "src/__mocks__/api.ts", "lines": 20}
    ],
    "fixtures_created": [
      {"path": "src/__fixtures__/buttonProps.ts", "lines": 15}
    ],
    "test_cases_generated": 5,
    "coverage_estimate": 85,
    "patterns_detected": ["component", "props", "callbacks", "async"]
  },
  "warnings": [],
  "next_action": "run|review|enhance"
}
```

### Status Values
- `success`: All tests generated successfully
- `partial`: Some tests generated, others need manual work
- `failure`: Could not generate tests

### Next Action Values
- `run`: Tests ready to execute
- `review`: Tests need human review before running
- `enhance`: Basic scaffold, needs more assertions

## Test Patterns Detected

### Component Patterns
- Props rendering
- Event handlers (onClick, onChange, etc.)
- Conditional rendering
- Loading/error states
- Children rendering

### Function Patterns
- Input validation
- Return value types
- Error throwing
- Async/Promise handling
- Side effects

### Class Patterns
- Constructor initialization
- Method calls
- State mutations
- Inheritance behavior

## Examples

### React Component
```json
{
  "skill": "generate-test",
  "status": "success",
  "platform_detected": "web",
  "test_framework": "jest",
  "results": {
    "files_created": [
      {
        "path": "src/components/Dashboard/ImpactChart.spec.tsx",
        "lines": 87,
        "tests": 8
      }
    ],
    "mocks_created": [
      {"path": "src/__mocks__/chartjs.ts", "lines": 15}
    ],
    "test_cases_generated": 8,
    "patterns_detected": ["component", "props", "async-data", "chart-rendering"]
  },
  "next_action": "run"
}
```

### Python Service
```json
{
  "skill": "generate-test",
  "status": "success",
  "platform_detected": "python",
  "test_framework": "pytest",
  "results": {
    "files_created": [
      {
        "path": "tests/test_user_service.py",
        "lines": 124,
        "tests": 12
      }
    ],
    "fixtures_created": [
      {"path": "tests/fixtures/users.py", "lines": 35}
    ],
    "test_cases_generated": 12,
    "patterns_detected": ["class", "async", "database", "validation"]
  },
  "next_action": "run"
}
```

### E2E Test
```json
{
  "skill": "generate-test",
  "status": "success",
  "platform_detected": "web",
  "test_framework": "playwright",
  "results": {
    "files_created": [
      {
        "path": "tests/e2e/dashboard.spec.ts",
        "lines": 65,
        "tests": 5
      }
    ],
    "fixtures_created": [
      {"path": "tests/e2e/fixtures/auth.ts", "lines": 20}
    ],
    "test_cases_generated": 5,
    "patterns_detected": ["page", "navigation", "form", "api-mock"]
  },
  "next_action": "review"
}
```
