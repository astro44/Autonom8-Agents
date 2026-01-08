# validate-tests

Pre-flight check before test execution.

## Purpose

Validates test environment, dependencies, and configuration before running tests. Catches common issues early (missing dependencies, stale configs, port conflicts) to avoid wasted CI time and confusing failures.

## Platforms

Web, Flutter, Python, Golang, Java, iOS, Android

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "test_type": "unit|integration|e2e|all",
  "check_deps": true,
  "check_ports": true,
  "check_env": true,
  "check_fixtures": true
}
```

- `project_dir` (required): Root directory of target project
- `test_type` (optional): Type of tests to validate for, default "all"
- `check_deps` (optional): Verify test dependencies installed
- `check_ports` (optional): Check required ports available (e2e)
- `check_env` (optional): Verify environment variables set
- `check_fixtures` (optional): Validate test fixtures exist

## Validation Checks

### Universal Checks
1. **Test files exist**: At least one test file matches expected pattern
2. **Config valid**: Test config file parses without errors
3. **Dependencies installed**: Test framework packages present

### Web-Specific
- `node_modules/` exists and not stale
- `jest.config.js` or `vitest.config.ts` valid
- Playwright browsers installed (e2e)
- `package-lock.json` matches `package.json`

### Flutter-Specific
- `flutter pub get` has been run
- `test/` directory exists
- Golden files present for visual tests
- Integration test device available

### Python-Specific
- Virtual environment activated or exists
- `pytest` or `unittest` installed
- `conftest.py` valid if present
- Test database accessible (integration)

### Golang-Specific
- `go mod tidy` is clean
- Test files have `_test.go` suffix
- Race detector compatible

### E2E-Specific (All Platforms)
- Required ports available (3000, 8080, etc.)
- Test server can start
- Browser automation working
- Network access to test URLs

## Execution Steps

1. **Detect Platform**: Identify project type
2. **Load Config**: Parse test configuration
3. **Check Dependencies**: Verify packages installed
4. **Validate Structure**: Confirm test files exist
5. **Check Environment**: Verify env vars and ports
6. **Validate Fixtures**: Ensure test data present
7. **Report Issues**: Return structured validation result

## Output Schema

```json
{
  "skill": "validate-tests",
  "status": "ready|blocked|warning",
  "platform_detected": "web",
  "test_framework": "jest",
  "results": {
    "checks_passed": 8,
    "checks_failed": 0,
    "checks_warned": 1,
    "details": {
      "dependencies": {"status": "pass", "message": "All 12 test deps installed"},
      "config": {"status": "pass", "message": "jest.config.js valid"},
      "test_files": {"status": "pass", "message": "Found 45 test files"},
      "ports": {"status": "pass", "message": "Port 3000 available"},
      "env_vars": {"status": "warn", "message": "API_KEY not set, some tests may skip"},
      "fixtures": {"status": "pass", "message": "All fixtures present"}
    },
    "test_file_count": 45,
    "estimated_duration_sec": 120
  },
  "blockers": [],
  "warnings": ["API_KEY environment variable not set"],
  "next_action": "run|fix|configure"
}
```

### Status Values
- `ready`: All checks pass, safe to run tests
- `blocked`: Critical issues prevent test execution
- `warning`: Tests can run but may have issues

### Next Action Values
- `run`: Proceed with test execution
- `fix`: Blockers must be resolved first
- `configure`: Configuration needed before tests

## Common Blockers

### Dependencies
```json
{
  "blocker": "missing_dependency",
  "message": "jest not installed",
  "fix_command": "npm install --save-dev jest"
}
```

### Port Conflict
```json
{
  "blocker": "port_in_use",
  "message": "Port 3000 already in use by process 1234",
  "fix_command": "kill -9 1234 OR use PORT=3001"
}
```

### Missing Config
```json
{
  "blocker": "missing_config",
  "message": "playwright.config.ts not found",
  "fix_command": "npx playwright init"
}
```

### Stale Dependencies
```json
{
  "blocker": "stale_lockfile",
  "message": "package-lock.json out of sync with package.json",
  "fix_command": "npm install"
}
```

## Examples

### Ready to Run
```json
{
  "skill": "validate-tests",
  "status": "ready",
  "platform_detected": "web",
  "test_framework": "playwright",
  "results": {
    "checks_passed": 10,
    "checks_failed": 0,
    "checks_warned": 0,
    "details": {
      "dependencies": {"status": "pass"},
      "config": {"status": "pass"},
      "test_files": {"status": "pass", "count": 24},
      "browsers": {"status": "pass", "installed": ["chromium", "firefox"]},
      "ports": {"status": "pass"}
    },
    "estimated_duration_sec": 180
  },
  "blockers": [],
  "warnings": [],
  "next_action": "run"
}
```

### Blocked
```json
{
  "skill": "validate-tests",
  "status": "blocked",
  "platform_detected": "web",
  "test_framework": "jest",
  "results": {
    "checks_passed": 6,
    "checks_failed": 2,
    "checks_warned": 0
  },
  "blockers": [
    {
      "check": "dependencies",
      "message": "node_modules missing or incomplete",
      "fix_command": "npm ci"
    },
    {
      "check": "config",
      "message": "jest.config.js has syntax error on line 12",
      "fix_command": "Review jest.config.js"
    }
  ],
  "warnings": [],
  "next_action": "fix"
}
```

### Warning State
```json
{
  "skill": "validate-tests",
  "status": "warning",
  "platform_detected": "python",
  "test_framework": "pytest",
  "results": {
    "checks_passed": 7,
    "checks_failed": 0,
    "checks_warned": 2
  },
  "blockers": [],
  "warnings": [
    "DATABASE_URL not set - integration tests will be skipped",
    "Coverage threshold (80%) may not be met - current estimate 75%"
  ],
  "next_action": "run"
}
```
