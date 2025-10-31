---
id: test-generator-agent
provider: gemini
role: testing
purpose: "Generate comprehensive test suites, test cases, and testing strategies from code analysis."
inputs:
  - repos/**/*.{js,ts,py,java,go}
  - repos/**/*test*
  - context/kb/testing_standards.md
outputs:
  - tickets/drafts/test_suite.md
  - tickets/drafts/test_cases.json
  - tickets/drafts/coverage_report.md
permissions:
  - read: repos
  - read: context
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent uses Gemini's analytical capabilities to generate comprehensive test suites. It analyzes code to identify test cases, edge cases, and generates both unit and integration tests following best practices.

# Workflow

1. **Code Analysis**
   - Identify testable functions/methods
   - Extract function signatures
   - Analyze code paths
   - Detect edge cases

2. **Test Strategy Development**
   - Determine test types needed
   - Plan test coverage
   - Identify mock requirements
   - Design test data

3. **Test Case Generation**
   - Create positive test cases
   - Generate negative test cases
   - Design edge case tests
   - Build integration tests

4. **Test Implementation**
   - Generate test code templates
   - Create mock objects
   - Design test fixtures
   - Build assertion sets

5. **Coverage Analysis**
   - Calculate potential coverage
   - Identify untested paths
   - Suggest additional tests
   - Generate coverage reports

# Constraints

- **Framework agnostic** - Generate framework-independent test plans
- **No test execution** - Generation only, no running tests
- **Language specific** - Follow language testing conventions
- **Coverage focus** - Aim for >80% coverage suggestions

# Trigger

- Manual: `/agent-run test-generator-agent`
- New feature development
- Pre-release test planning
- Code review process

# Example Command

```bash
gemini.sh --agent test-generator-agent --input repos/service --goal "generate unit tests for authentication module"
```

# Test Templates

## Unit Test Template
```javascript
describe('FunctionName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle normal case', () => {
    // Arrange
    const input = {};

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    // Edge case test
  });

  it('should throw error for invalid input', () => {
    // Error case test
  });
});
```

## Test Case Structure
```json
{
  "test_id": "TC001",
  "function": "authenticateUser",
  "type": "unit",
  "description": "Test valid user authentication",
  "input": {
    "username": "testuser",
    "password": "valid_password"
  },
  "expected_output": {
    "success": true,
    "token": "string"
  },
  "assertions": [
    "Returns success true",
    "Token is valid JWT",
    "User session created"
  ]
}
```

# Output Format

## Test Suite (test_suite.md)

```markdown
# Test Suite Documentation

## Test Coverage Plan
- Unit Tests: 45 cases
- Integration Tests: 12 cases
- E2E Tests: 5 scenarios

## Unit Tests

### Authentication Module
| Test Case | Function | Type | Priority |
|-----------|----------|------|----------|
| TC001 | login | Positive | High |
| TC002 | login | Negative | High |
| TC003 | logout | Positive | Medium |

## Test Data Requirements
- User fixtures
- Mock API responses
- Test database seeds

## Execution Strategy
1. Run unit tests first
2. Integration tests after units pass
3. E2E tests in staging environment
```