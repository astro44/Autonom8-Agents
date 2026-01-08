# run-tests

Execute platform-appropriate test command.

## Purpose

Universal test runner that detects project platform and executes the correct test command with proper configuration. Captures output, parses results, and returns structured pass/fail summary.

## Platforms

All platforms (auto-detected)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "test_type": "unit|integration|e2e|all",
  "filter": "pattern or test name",
  "coverage": false,
  "watch": false,
  "verbose": false,
  "timeout": 300
}
```

- `project_dir` (required): Root directory of target project
- `test_type` (optional): Type of tests to run, default "all"
- `filter` (optional): Filter pattern for specific tests
- `coverage` (optional): Generate coverage report
- `watch` (optional): Run in watch mode (for local dev)
- `verbose` (optional): Verbose output
- `timeout` (optional): Max execution time in seconds

## Platform Detection & Commands

### Web (package.json)
```bash
# Unit/Integration
npm test -- --coverage=$coverage --testPathPattern="$filter"

# E2E (Playwright)
npx playwright test $filter

# E2E (Cypress)
npx cypress run --spec "$filter"
```

### Flutter (pubspec.yaml)
```bash
# Unit
flutter test $filter --coverage

# Integration
flutter test integration_test/ $filter

# Golden (Visual)
flutter test --update-goldens
```

### Python (requirements.txt / pyproject.toml)
```bash
# pytest
pytest $filter -v --cov=$coverage

# unittest
python -m unittest discover $filter
```

### Golang (go.mod)
```bash
# Standard
go test ./... -v -cover

# With race detection
go test ./... -race -v
```

### Java (pom.xml / build.gradle)
```bash
# Maven
mvn test -Dtest=$filter

# Gradle
./gradlew test --tests "$filter"
```

### Terraform (*.tf)
```bash
# Validate
terraform validate

# Plan (dry-run test)
terraform plan -detailed-exitcode
```

### iOS (*.xcodeproj)
```bash
xcodebuild test -scheme $scheme -destination 'platform=iOS Simulator'
```

### Android (app/build.gradle)
```bash
./gradlew testDebugUnitTest
./gradlew connectedAndroidTest
```

## Execution Steps

1. **Detect Platform**: Scan project_dir for platform indicators
2. **Identify Test Framework**: Detect which test runner is configured
3. **Build Command**: Construct appropriate test command
4. **Execute Tests**: Run with timeout and capture output
5. **Parse Results**: Extract pass/fail counts from output
6. **Generate Summary**: Structure results for consumption
7. **Return Results**: Include timing, coverage, failures

## Output Schema

```json
{
  "skill": "run-tests",
  "status": "success|failure|partial",
  "platform_detected": "web",
  "test_framework": "jest",
  "results": {
    "total": 42,
    "passed": 40,
    "failed": 2,
    "skipped": 0,
    "duration_ms": 12500,
    "coverage": {
      "lines": 85.2,
      "branches": 78.4,
      "functions": 90.1
    },
    "failures": [
      {
        "test": "Button.spec.ts > should handle click",
        "error": "Expected true to be false",
        "file": "src/components/Button.spec.ts",
        "line": 24
      }
    ]
  },
  "command_executed": "npm test -- --coverage",
  "next_action": "fix|proceed|investigate"
}
```

### Status Values
- `success`: All tests passed
- `failure`: One or more tests failed
- `partial`: Some tests couldn't run (missing deps, config error)

### Next Action Values
- `proceed`: All tests pass, continue pipeline
- `fix`: Failures found, create bug tickets
- `investigate`: Unexpected error, needs manual review

## Error Handling

- Test framework not found: Return failure with setup instructions
- Timeout exceeded: Kill process, return partial results
- Missing dependencies: Return failure with install command
- Config error: Return failure with config guidance

## Examples

### All Tests Pass
```json
{
  "skill": "run-tests",
  "status": "success",
  "platform_detected": "web",
  "test_framework": "jest",
  "results": {
    "total": 156,
    "passed": 156,
    "failed": 0,
    "skipped": 3,
    "duration_ms": 8420,
    "coverage": {
      "lines": 87.5,
      "branches": 82.1,
      "functions": 91.3
    },
    "failures": []
  },
  "command_executed": "npm test -- --coverage --ci",
  "next_action": "proceed"
}
```

### Tests Failed
```json
{
  "skill": "run-tests",
  "status": "failure",
  "platform_detected": "python",
  "test_framework": "pytest",
  "results": {
    "total": 84,
    "passed": 81,
    "failed": 3,
    "skipped": 0,
    "duration_ms": 4200,
    "failures": [
      {
        "test": "test_api.py::test_user_create",
        "error": "AssertionError: 201 != 400",
        "file": "tests/test_api.py",
        "line": 45
      },
      {
        "test": "test_api.py::test_user_update",
        "error": "KeyError: 'email'",
        "file": "tests/test_api.py",
        "line": 67
      }
    ]
  },
  "command_executed": "pytest -v --tb=short",
  "next_action": "fix"
}
```

### E2E Tests
```json
{
  "skill": "run-tests",
  "status": "success",
  "platform_detected": "web",
  "test_framework": "playwright",
  "results": {
    "total": 24,
    "passed": 24,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 45000,
    "browsers_tested": ["chromium", "firefox", "webkit"],
    "failures": []
  },
  "command_executed": "npx playwright test --reporter=json",
  "next_action": "proceed"
}
```
