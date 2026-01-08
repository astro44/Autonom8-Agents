# lint

Run platform-appropriate linter.

## Purpose

Execute the correct linter for the detected platform with project-specific configuration. Captures all warnings and errors, provides fix suggestions, and optionally auto-fixes safe issues.

## Platforms

All platforms (auto-detected)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "scope": "all|staged|changed|path",
  "target_path": "src/",
  "fix": false,
  "strict": false,
  "format": "standard|compact|json"
}
```

- `project_dir` (required): Root directory of target project
- `scope` (optional): What to lint - all, staged files, changed files, or path
- `target_path` (optional): Specific path when scope is "path"
- `fix` (optional): Auto-fix issues where possible
- `strict` (optional): Treat warnings as errors
- `format` (optional): Output format

## Linter Detection & Commands

### Web (TypeScript/JavaScript)
```bash
# ESLint (primary)
npx eslint $path --ext .ts,.tsx,.js,.jsx --format json

# With fix
npx eslint $path --fix

# Prettier check
npx prettier --check $path
```

### Flutter (Dart)
```bash
# Dart analyzer
dart analyze $path

# With fix
dart fix --apply
```

### Python
```bash
# Ruff (fast, modern)
ruff check $path --output-format json

# With fix
ruff check $path --fix

# Flake8 (legacy)
flake8 $path --format json

# MyPy (type checking)
mypy $path --output json
```

### Golang
```bash
# golangci-lint (comprehensive)
golangci-lint run $path --out-format json

# go vet (built-in)
go vet $path

# staticcheck
staticcheck $path
```

### Java
```bash
# Checkstyle
checkstyle -c /config/checkstyle.xml $path

# SpotBugs
spotbugs $path
```

### Terraform
```bash
# tflint
tflint $path --format json

# terraform validate
terraform validate

# tfsec (security)
tfsec $path --format json
```

### Solidity
```bash
# solhint
solhint $path --formatter json

# slither (security)
slither $path --json -
```

## Execution Steps

1. **Detect Platform**: Identify project type
2. **Find Linter Config**: Locate .eslintrc, pyproject.toml, etc.
3. **Determine Scope**: Build file list based on scope parameter
4. **Execute Linter**: Run with appropriate flags
5. **Parse Output**: Structure results by severity
6. **Apply Fixes** (if enabled): Run auto-fix pass
7. **Generate Report**: Return structured lint results

## Output Schema

```json
{
  "skill": "lint",
  "status": "clean|warnings|errors",
  "platform_detected": "web",
  "linter": "eslint",
  "linter_version": "8.56.0",
  "results": {
    "files_checked": 45,
    "errors": 3,
    "warnings": 12,
    "fixed": 0,
    "issues": [
      {
        "file": "src/components/Button.tsx",
        "line": 15,
        "column": 8,
        "severity": "error",
        "rule": "no-unused-vars",
        "message": "'unusedVar' is defined but never used",
        "fixable": true
      },
      {
        "file": "src/utils/helpers.ts",
        "line": 42,
        "column": 1,
        "severity": "warning",
        "rule": "@typescript-eslint/explicit-function-return-type",
        "message": "Missing return type on function",
        "fixable": false
      }
    ],
    "summary_by_rule": {
      "no-unused-vars": 2,
      "explicit-function-return-type": 5,
      "prefer-const": 8
    }
  },
  "config_file": ".eslintrc.js",
  "next_action": "fix|proceed|configure"
}
```

### Status Values
- `clean`: No lint issues
- `warnings`: Only warnings, no errors
- `errors`: Has errors that should be fixed

### Next Action Values
- `proceed`: Clean or acceptable warnings
- `fix`: Errors need fixing
- `configure`: Linter not configured properly

## Common Rules by Platform

### ESLint (Web)
- `no-unused-vars` - Unused variables
- `no-console` - Console statements
- `prefer-const` - Use const where possible
- `@typescript-eslint/no-explicit-any` - Avoid any type

### Ruff/Flake8 (Python)
- `E501` - Line too long
- `F401` - Unused import
- `E302` - Expected 2 blank lines
- `W503` - Line break before binary operator

### golangci-lint (Go)
- `govet` - Suspicious constructs
- `errcheck` - Unchecked errors
- `staticcheck` - Static analysis
- `unused` - Unused code

## Examples

### Clean
```json
{
  "skill": "lint",
  "status": "clean",
  "platform_detected": "web",
  "linter": "eslint",
  "results": {
    "files_checked": 89,
    "errors": 0,
    "warnings": 0,
    "issues": []
  },
  "next_action": "proceed"
}
```

### With Warnings
```json
{
  "skill": "lint",
  "status": "warnings",
  "platform_detected": "python",
  "linter": "ruff",
  "linter_version": "0.1.9",
  "results": {
    "files_checked": 32,
    "errors": 0,
    "warnings": 8,
    "issues": [
      {
        "file": "src/api/routes.py",
        "line": 45,
        "severity": "warning",
        "rule": "E501",
        "message": "Line too long (95 > 88 characters)",
        "fixable": false
      }
    ],
    "summary_by_rule": {
      "E501": 5,
      "W291": 3
    }
  },
  "next_action": "proceed"
}
```

### With Errors (Fixed)
```json
{
  "skill": "lint",
  "status": "clean",
  "platform_detected": "web",
  "linter": "eslint",
  "results": {
    "files_checked": 45,
    "errors": 0,
    "warnings": 0,
    "fixed": 12,
    "issues": [],
    "fixes_applied": [
      {"file": "src/utils.ts", "rule": "prefer-const", "count": 5},
      {"file": "src/api.ts", "rule": "no-unused-vars", "count": 3},
      {"file": "src/types.ts", "rule": "semi", "count": 4}
    ]
  },
  "next_action": "proceed"
}
```
