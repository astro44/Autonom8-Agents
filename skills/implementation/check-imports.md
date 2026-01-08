# check-imports

Validate import/export consistency.

## Purpose

Analyzes import statements across the codebase to detect issues: unused imports, missing exports, circular dependencies, and incorrect paths. Ensures clean module boundaries and optimal bundle size.

## Platforms

Web, Python, Golang (TypeScript/JavaScript, Python, Go)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "scope": "all|changed|directory",
  "target_path": "src/components",
  "check_circular": true,
  "check_unused": true,
  "check_missing": true,
  "auto_fix": false
}
```

- `project_dir` (required): Root directory of target project
- `scope` (optional): What to check - all files, changed files, or specific directory
- `target_path` (optional): Specific path when scope is "directory"
- `check_circular` (optional): Detect circular dependencies
- `check_unused` (optional): Find unused imports
- `check_missing` (optional): Find missing exports
- `auto_fix` (optional): Automatically fix issues where safe

## Checks by Platform

### Web (TypeScript/JavaScript)
- Unused imports (imported but never used)
- Missing exports (imported but not exported from source)
- Circular dependencies (A→B→C→A)
- Default vs named import mismatches
- Path alias resolution (@/components vs ../components)
- Barrel file consistency (index.ts exports)
- Side-effect imports verification

### Python
- Unused imports (imported but not referenced)
- Circular imports (detected via AST)
- Relative vs absolute import consistency
- `__init__.py` completeness
- Star import usage (`from x import *`)
- Import order (stdlib → third-party → local)

### Golang
- Unused imports (compiler catches, but pre-check)
- Circular package dependencies
- Internal package access violations
- Vendor vs module imports
- Import grouping conventions

## Execution Steps

1. **Scan Files**: Find all source files in scope
2. **Parse Imports**: Extract import statements from each file
3. **Build Dependency Graph**: Map all import relationships
4. **Check Circular**: Run cycle detection on graph
5. **Check Unused**: Cross-reference imports with usage
6. **Check Missing**: Verify exports exist at targets
7. **Generate Report**: Compile issues with fix suggestions
8. **Auto-Fix** (if enabled): Apply safe fixes

## Output Schema

```json
{
  "skill": "check-imports",
  "status": "clean|issues|critical",
  "platform_detected": "web",
  "results": {
    "files_scanned": 124,
    "imports_analyzed": 892,
    "issues": {
      "unused": [
        {
          "file": "src/components/Button.tsx",
          "line": 3,
          "import": "useState",
          "from": "react",
          "fix": "Remove unused import"
        }
      ],
      "missing": [
        {
          "file": "src/pages/Dashboard.tsx",
          "line": 5,
          "import": "ImpactChart",
          "from": "./components",
          "fix": "Add export to src/components/index.ts"
        }
      ],
      "circular": [
        {
          "cycle": ["src/api/client.ts", "src/api/auth.ts", "src/api/client.ts"],
          "fix": "Extract shared types to separate module"
        }
      ]
    },
    "summary": {
      "unused_count": 5,
      "missing_count": 1,
      "circular_count": 1,
      "total_issues": 7
    }
  },
  "auto_fixed": [],
  "next_action": "fix|proceed|review"
}
```

### Status Values
- `clean`: No import issues found
- `issues`: Non-critical issues found
- `critical`: Circular dependencies or missing exports block build

### Next Action Values
- `proceed`: No issues, continue
- `fix`: Issues need resolution
- `review`: Complex issues need manual review

## Auto-Fix Capabilities

### Safe to Auto-Fix
- Remove unused imports
- Sort imports by convention
- Convert relative to absolute (or vice versa)
- Add missing barrel exports

### Requires Manual Review
- Circular dependencies
- Side-effect import removal
- Star import expansion

## Examples

### Clean Codebase
```json
{
  "skill": "check-imports",
  "status": "clean",
  "platform_detected": "web",
  "results": {
    "files_scanned": 156,
    "imports_analyzed": 1024,
    "issues": {
      "unused": [],
      "missing": [],
      "circular": []
    },
    "summary": {
      "unused_count": 0,
      "missing_count": 0,
      "circular_count": 0,
      "total_issues": 0
    }
  },
  "next_action": "proceed"
}
```

### Issues Found
```json
{
  "skill": "check-imports",
  "status": "issues",
  "platform_detected": "web",
  "results": {
    "files_scanned": 89,
    "imports_analyzed": 534,
    "issues": {
      "unused": [
        {
          "file": "src/utils/helpers.ts",
          "line": 1,
          "import": "lodash",
          "from": "lodash",
          "fix": "Remove: import lodash from 'lodash'"
        },
        {
          "file": "src/components/Card.tsx",
          "line": 2,
          "import": "useEffect",
          "from": "react",
          "fix": "Remove useEffect from import"
        }
      ],
      "missing": [],
      "circular": []
    },
    "summary": {
      "unused_count": 2,
      "missing_count": 0,
      "circular_count": 0,
      "total_issues": 2
    }
  },
  "next_action": "fix"
}
```

### Critical: Circular Dependency
```json
{
  "skill": "check-imports",
  "status": "critical",
  "platform_detected": "python",
  "results": {
    "files_scanned": 45,
    "imports_analyzed": 156,
    "issues": {
      "unused": [],
      "missing": [],
      "circular": [
        {
          "cycle": [
            "src/services/user.py",
            "src/services/auth.py",
            "src/services/user.py"
          ],
          "severity": "critical",
          "fix": "Move shared types to src/services/types.py"
        }
      ]
    },
    "summary": {
      "circular_count": 1,
      "total_issues": 1
    }
  },
  "next_action": "fix"
}
```
