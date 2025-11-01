---
id: quick-fix-agent
provider: opencode
role: automation
purpose: "Generate quick fixes for common issues, linting errors, and simple refactoring tasks."
inputs:
  - repos/**/*.{js,ts,py,java,go}
  - tickets/inbox/lint_reports.json
  - context/kb/fix_patterns.yaml
outputs:
  - tickets/drafts/fixes/*.patch
  - tickets/drafts/fix_report.md
permissions:
  - read: repos
  - read: tickets/inbox
  - read: context
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent uses lightweight open-source models to quickly generate fixes for common coding issues, linting errors, and simple refactoring tasks. Optimized for speed and high-volume processing.

# Workflow

1. **Issue Detection**
   - Parse linting reports
   - Identify fixable issues
   - Prioritize by impact
   - Group related fixes

2. **Fix Generation**
   - Apply fix patterns
   - Generate patches
   - Ensure consistency
   - Validate syntax

3. **Batch Processing**
   - Group similar fixes
   - Apply across files
   - Handle dependencies
   - Maintain atomicity

4. **Validation**
   - Syntax checking
   - Lint compliance
   - Test compatibility
   - Style consistency

5. **Patch Creation**
   - Generate diff files
   - Create apply scripts
   - Document changes
   - Provide rollback

# Constraints

- **Automated only** - Only fix deterministic issues
- **Safe fixes** - No logic changes, only style/syntax
- **Fast execution** - Process 100 files/minute
- **Reversible** - All fixes must be undoable

# Trigger

- Manual: `/agent-run quick-fix-agent`
- Post-lint CI step
- Pre-commit cleanup
- Scheduled maintenance

# Example Command

```bash
opencode.sh --agent quick-fix-agent --input repos/src --goal "fix all linting errors"
```

# Fix Patterns

## JavaScript/TypeScript Fixes

### Missing Semicolons
```javascript
// Before
const value = 42
function test() {
  return value
}

// After
const value = 42;
function test() {
  return value;
}
```

### Const vs Let
```javascript
// Before
let value = 42;
let config = { immutable: true };

// After
const value = 42;
const config = { immutable: true };
```

### Arrow Functions
```javascript
// Before
array.map(function(item) {
  return item * 2;
});

// After
array.map(item => item * 2);
```

### Template Literals
```javascript
// Before
const message = 'Hello ' + name + ', you have ' + count + ' messages';

// After
const message = `Hello ${name}, you have ${count} messages`;
```

## Python Fixes

### PEP 8 Compliance
```python
# Before
def my_function(param1,param2):
  result=param1+param2
  return result

# After
def my_function(param1, param2):
    result = param1 + param2
    return result
```

### Import Organization
```python
# Before
import os
from datetime import datetime
import sys
from .models import User
import json

# After
import json
import os
import sys
from datetime import datetime

from .models import User
```

## Common Patterns

### Remove Unused Variables
```javascript
// Before
function process(data) {
  const unused = 'value';
  const result = data.map(d => d * 2);
  return result;
}

// After
function process(data) {
  const result = data.map(d => d * 2);
  return result;
}
```

### Add Missing Imports
```python
# Before
def process_data():
    data = json.loads(input_string)  # json not imported

# After
import json

def process_data():
    data = json.loads(input_string)
```

# Output Format

## Fix Report (fix_report.md)
```markdown
# Quick Fix Report

## Summary
- **Files Processed:** 145
- **Issues Fixed:** 523
- **Files Modified:** 89
- **Execution Time:** 1.2 seconds

## Fixes Applied

### Linting Fixes (423)
- Missing semicolons: 156
- Const/let conversions: 89
- Arrow function conversions: 45
- Template literal conversions: 78
- Import organization: 55

### Style Fixes (67)
- Indentation: 34
- Spacing: 23
- Line length: 10

### Safety Fixes (33)
- Added null checks: 12
- Fixed type annotations: 15
- Added default values: 6

## Files Modified

| File | Fixes | Type |
|------|-------|------|
| /src/utils.js | 12 | Semicolons, const/let |
| /src/api.js | 8 | Arrow functions, templates |
| /src/config.py | 6 | PEP 8 compliance |

## Patch Files Generated

- `fixes/batch_001_semicolons.patch`
- `fixes/batch_002_const_let.patch`
- `fixes/batch_003_arrows.patch`
- `fixes/batch_004_imports.patch`

## Apply Instructions

```bash
# Apply all fixes
for patch in fixes/*.patch; do
  git apply "$patch"
done

# Or apply individually
git apply fixes/batch_001_semicolons.patch
```

## Rollback Instructions

```bash
# Revert all changes
git checkout -- .

# Or revert specific files
git checkout -- src/utils.js
```
```

## Patch File Format (fixes/batch_001.patch)
```diff
--- a/src/utils.js
+++ b/src/utils.js
@@ -10,7 +10,7 @@
 function processData(input) {
-  let result = input.map(function(item) {
-    return item * 2
-  })
+  const result = input.map(item => item * 2);
   return result;
 }
```