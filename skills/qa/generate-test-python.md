# generate-test-python

Generate pytest test scaffolding for Python modules.

## Purpose

Analyzes Python source files and generates comprehensive pytest test scaffolds. Creates test files with fixtures, parametrized tests, and mock setups based on function signatures and docstrings.

## Platforms

Python (pytest)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "source_files": ["src/api.py", "src/utils.py"],
  "test_dir": "tests",
  "coverage_target": 80,
  "include_mocks": true,
  "include_fixtures": true,
  "doctest_style": false
}
```

- `project_dir` (required): Root of Python project
- `source_files` (required): Files to generate tests for
- `test_dir` (optional): Output directory for tests
- `coverage_target` (optional): Target coverage percentage
- `include_mocks` (optional): Generate mock setups
- `include_fixtures` (optional): Generate pytest fixtures
- `doctest_style` (optional): Include doctest examples

## Execution Steps

1. **Parse Source**: AST parse source files
2. **Extract Functions**: Get function signatures, types, docstrings
3. **Identify Dependencies**: Find imports and external calls
4. **Generate Fixtures**: Create fixtures for common setup
5. **Generate Test Cases**: Create test functions with assertions
6. **Add Parametrization**: Generate parametrized test variants
7. **Write Test Files**: Output to test directory

## Output Schema

```json
{
  "skill": "generate-test-python",
  "status": "success|partial",
  "files_generated": [
    {
      "source": "src/api.py",
      "test_file": "tests/test_api.py",
      "functions_covered": 8,
      "test_cases": 24,
      "fixtures": ["client", "mock_db"]
    }
  ],
  "summary": {
    "total_functions": 15,
    "functions_covered": 12,
    "test_cases_generated": 36,
    "estimated_coverage": 75
  },
  "next_action": "review|run_tests"
}
```

## Generated Test Structure

```python
# tests/test_api.py
import pytest
from unittest.mock import Mock, patch
from src.api import create_user, get_user, delete_user

@pytest.fixture
def mock_db():
    """Mock database connection."""
    with patch('src.api.db') as mock:
        mock.query.return_value = []
        yield mock

@pytest.fixture
def sample_user():
    """Sample user data for testing."""
    return {"id": 1, "name": "Test User", "email": "test@example.com"}

class TestCreateUser:
    def test_create_user_success(self, mock_db, sample_user):
        """Test successful user creation."""
        result = create_user(sample_user)
        assert result["id"] is not None
        mock_db.insert.assert_called_once()

    def test_create_user_invalid_email(self, mock_db):
        """Test user creation with invalid email."""
        with pytest.raises(ValueError):
            create_user({"name": "Test", "email": "invalid"})

    @pytest.mark.parametrize("field", ["name", "email"])
    def test_create_user_missing_field(self, mock_db, field):
        """Test user creation with missing required field."""
        data = {"name": "Test", "email": "test@example.com"}
        del data[field]
        with pytest.raises(KeyError):
            create_user(data)
```

## Error Handling

- Syntax error in source: Return with parse error location
- No functions found: Return empty with warning
- Import errors: Return with dependency hints
- Complex types: Generate placeholder assertions

## Examples

### Full Generation
```json
{
  "skill": "generate-test-python",
  "status": "success",
  "files_generated": [
    {
      "source": "src/services/user_service.py",
      "test_file": "tests/test_user_service.py",
      "functions_covered": 6,
      "test_cases": 18
    }
  ],
  "summary": {
    "total_functions": 6,
    "functions_covered": 6,
    "test_cases_generated": 18,
    "estimated_coverage": 85
  },
  "next_action": "run_tests"
}
```
