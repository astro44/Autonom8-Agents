---
name: lint
description: Code linting during review. Runs ESLint/Prettier/platform-specific linters on changed files. Returns warnings and errors with fix suggestions.
---

# lint - Code Linting Skill

Runs appropriate linters on changed files during code review. Supports multiple platforms and linter configurations.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "scope": "changed|all|ticket",
  "fix": false,
  "ticket_id": "TICKET-XXX"
}
```

## Instructions

### 1. Detect Linter Configuration

```bash
cd $project_dir

# Check for linter configs
[[ -f ".eslintrc.js" || -f ".eslintrc.json" || -f "eslint.config.js" ]] && LINTER="eslint"
[[ -f ".prettierrc" || -f "prettier.config.js" ]] && HAS_PRETTIER=true
[[ -f "pyproject.toml" ]] && grep -q "ruff" pyproject.toml && LINTER="ruff"
[[ -f ".golangci.yml" ]] && LINTER="golangci-lint"
[[ -f "analysis_options.yaml" ]] && LINTER="dart_analyze"
```

### 2. Get Changed Files (if scope=changed)

```bash
# Get files changed by current ticket
git diff --name-only HEAD~1 | grep -E '\.(js|jsx|ts|tsx|py|go|dart)$'
```

### 3. Run Linter

**JavaScript/TypeScript:**
```bash
npx eslint --format json $FILES
# Or with fix
npx eslint --fix --format json $FILES
```

**Python:**
```bash
ruff check --output-format json $FILES
# Or
python -m flake8 --format json $FILES
```

**Go:**
```bash
golangci-lint run --out-format json $FILES
```

**Dart/Flutter:**
```bash
dart analyze --format json $FILES
```

### 4. Parse Results

Map linter output to standard format:

| Linter | Error Key | Warning Key |
|--------|-----------|-------------|
| ESLint | severity: 2 | severity: 1 |
| Ruff | severity: error | severity: warning |
| golangci-lint | Severity: error | Severity: warning |

## Output Format

```json
{
  "skill": "lint",
  "status": "clean|warnings|errors",
  "linter": "eslint",
  "files_checked": 5,
  "summary": {
    "errors": 0,
    "warnings": 3,
    "fixed": 0
  },
  "issues": [
    {
      "file": "src/components/Foo.js",
      "line": 42,
      "column": 10,
      "severity": "warning",
      "rule": "no-unused-vars",
      "message": "'bar' is defined but never used",
      "fix": "Remove unused variable or use it"
    }
  ],
  "errors": [],
  "warnings": ["3 warnings found"],
  "next_action": "proceed|fix"
}
```

## Decision Logic

```
Any errors (severity: error)?
    YES → status: "errors", next_action: "fix"

Any warnings?
    YES → status: "warnings", next_action: "proceed"

No issues?
    YES → status: "clean", next_action: "proceed"
```

## Severity Mapping

| Status | Blocking | Description |
|--------|----------|-------------|
| `clean` | NO | No lint issues |
| `warnings` | NO | Style/preference issues |
| `errors` | YES | Potential bugs, security issues |

## Usage Examples

**Lint changed files (default):**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "changed",
  "fix": false
}
```

**Lint and auto-fix:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "changed",
  "fix": true
}
```

**Lint all files:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "all",
  "fix": false
}
```

**Lint specific ticket files:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "ticket",
  "ticket_id": "TICKET-OXY-001",
  "fix": false
}
```

## Platform Support

| Platform | Linter | Config File |
|----------|--------|-------------|
| JavaScript | ESLint | .eslintrc.* |
| TypeScript | ESLint + TS | .eslintrc.* |
| Python | Ruff/Flake8 | pyproject.toml |
| Go | golangci-lint | .golangci.yml |
| Dart/Flutter | dart analyze | analysis_options.yaml |
| CSS | Stylelint | .stylelintrc |

## Token Efficiency

- Uses native linter JSON output
- Filters to changed files only
- ~5-30 second execution
- Returns structured issues
