---
name: check-imports
description: Import/export validation post-implementation. Checks that all imports resolve to actual exports, catches broken references and circular dependencies.
---

# check-imports - Import/Export Validation

Validates import/export consistency after implementation. Catches broken imports, missing exports, and circular dependencies before code review.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "scope": "changed|all",
  "ticket_id": "TICKET-XXX"
}
```

## Instructions

### 1. Get Files to Check

```bash
cd $project_dir

# If scope=changed, get modified files
git diff --name-only HEAD~1 | grep -E '\.(js|jsx|ts|tsx|mjs)$'

# If scope=all, get all source files
find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx"
```

### 2. Extract Imports

For each file, extract import statements:

```javascript
// Named imports
import { Foo, Bar } from './module'

// Default imports
import Baz from './module'

// Namespace imports
import * as Utils from './utils'

// Dynamic imports
const Module = await import('./module')
```

### 3. Validate Each Import

```
For each import statement:
    1. Resolve import path relative to current file
    2. Check if target file exists
    3. If named import, check if export exists in target
    4. If default import, check for default export
```

### 4. Check for Circular Dependencies

```
Build dependency graph:
    A imports B
    B imports C
    C imports A  → CIRCULAR!

Report cycles that include changed files
```

## Output Format

```json
{
  "skill": "check-imports",
  "status": "success|errors",
  "files_checked": 8,
  "imports_validated": 42,
  "issues": [
    {
      "type": "broken_import",
      "file": "src/components/Dashboard.js",
      "line": 5,
      "import": "{ MetricCard }",
      "from": "./MetricCard",
      "error": "File not found: src/components/MetricCard.js",
      "suggestion": "Check if file was created or path is correct"
    },
    {
      "type": "missing_export",
      "file": "src/utils/helpers.js",
      "line": 2,
      "import": "{ formatDate }",
      "from": "./date-utils",
      "error": "formatDate is not exported from ./date-utils",
      "suggestion": "Add 'export' to formatDate function or check spelling"
    },
    {
      "type": "circular_dependency",
      "cycle": ["A.js", "B.js", "C.js", "A.js"],
      "severity": "warning",
      "suggestion": "Extract shared code to separate module"
    }
  ],
  "errors": [],
  "warnings": [],
  "next_action": "proceed|fix"
}
```

## Issue Types

| Type | Severity | Blocking | Description |
|------|----------|----------|-------------|
| `broken_import` | HIGH | YES | Import path doesn't exist |
| `missing_export` | HIGH | YES | Named export not found |
| `missing_default` | HIGH | YES | No default export |
| `circular_dependency` | MEDIUM | NO | Circular import detected |
| `unused_export` | LOW | NO | Export never imported |

## Decision Logic

```
Any broken_import or missing_export?
    YES → status: "errors", next_action: "fix"

Only circular_dependency warnings?
    YES → status: "success", add warnings

No issues?
    YES → status: "success", next_action: "proceed"
```

## Usage Examples

**Check changed files:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "changed"
}
```

**Check all files:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "all"
}
```

**Check ticket-specific files:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "changed",
  "ticket_id": "TICKET-OXY-003"
}
```

## Common Fixes

| Error | Fix |
|-------|-----|
| File not found | Check path spelling, ensure file was created |
| Named export missing | Add `export` keyword or check function name |
| Default export missing | Add `export default` or use named import |
| Circular dependency | Extract shared code to third module |

## Platform Support

| Platform | Import Syntax | Resolution |
|----------|---------------|------------|
| JavaScript (ESM) | import/export | Relative paths |
| TypeScript | import/export | tsconfig paths |
| Node.js (CJS) | require/module.exports | node_modules |

## Token Efficiency

- AST-free regex parsing for speed
- Only validates changed files
- ~3-10 second execution
- Returns actionable fix suggestions
