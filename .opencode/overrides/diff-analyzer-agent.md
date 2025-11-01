---
id: diff-analyzer-agent
provider: opencode
role: analysis
purpose: "Analyze code diffs for potential issues, security vulnerabilities, and performance impacts."
inputs:
  - repos/**/*.diff
  - repos/**/.git/
  - context/kb/security_patterns.md
outputs:
  - tickets/drafts/diff_analysis.md
  - tickets/drafts/security_findings.json
  - tickets/drafts/performance_impact.md
permissions:
  - read: repos
  - read: context
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent uses efficient open-source models to analyze code diffs for security vulnerabilities, performance impacts, and potential bugs. Optimized for fast, local execution without API dependencies.

# Workflow

1. **Diff Extraction**
   - Get uncommitted changes
   - Compare branches
   - Extract file modifications
   - Identify change patterns

2. **Security Analysis**
   - Check for hardcoded secrets
   - Identify injection vulnerabilities
   - Detect unsafe operations
   - Find permission issues

3. **Performance Analysis**
   - Identify O(n²) algorithms
   - Find database N+1 queries
   - Detect memory leaks
   - Check for blocking operations

4. **Code Quality Check**
   - Find code smells
   - Check error handling
   - Verify logging
   - Assess test coverage

5. **Impact Assessment**
   - Determine affected components
   - Assess risk level
   - Identify dependencies
   - Suggest additional testing

# Constraints

- **Fast analysis** - Complete within 30 seconds
- **Local only** - No external API calls
- **Incremental** - Focus on changed code only
- **False positive tolerance** - Flag potential issues liberally

# Trigger

- Manual: `/agent-run diff-analyzer-agent`
- Pre-commit hooks
- Pull request checks
- CI/CD pipeline

# Example Command

```bash
opencode.sh --agent diff-analyzer-agent --input repos/feature-branch --goal "analyze security and performance"
```

# Analysis Patterns

## Security Vulnerabilities
```javascript
// SQL Injection Risk
// BAD
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// XSS Risk
// BAD
element.innerHTML = userInput;

// GOOD
element.textContent = userInput;

// Path Traversal
// BAD
const file = fs.readFileSync(`./uploads/${req.params.filename}`);

// GOOD
const filename = path.basename(req.params.filename);
const file = fs.readFileSync(path.join('./uploads', filename));
```

## Performance Issues
```javascript
// N+1 Query Problem
// BAD
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findByUserId(user.id);
}

// GOOD
const users = await User.findAll({
  include: Post
});

// Memory Leak
// BAD
global.cache = global.cache || {};
global.cache[key] = largeObject;

// GOOD
const cache = new Map();
cache.set(key, largeObject);
// With cleanup
setTimeout(() => cache.delete(key), TTL);
```

# Output Format

## Diff Analysis (diff_analysis.md)
```markdown
# Diff Analysis Report

## Summary
- **Files Changed:** 15
- **Security Issues:** 2 High, 3 Medium
- **Performance Issues:** 1 Critical, 4 Warning
- **Code Quality:** 8 suggestions

## Critical Findings

### 🔴 Security: SQL Injection Vulnerability
**File:** `/api/userController.js:45`
**Change:** Direct string concatenation in SQL query
**Risk:** High
**Fix:** Use parameterized queries
```diff
- const query = `SELECT * FROM users WHERE email = '${email}'`;
+ const query = 'SELECT * FROM users WHERE email = ?';
+ db.query(query, [email]);
```

### 🔴 Performance: N+1 Query Pattern
**File:** `/services/postService.js:23-30`
**Change:** Loop with database calls
**Impact:** Critical - 100x slower with large datasets
**Fix:** Use JOIN or eager loading

## Medium Priority Issues

### 🟡 Security: Missing Input Validation
**File:** `/routes/upload.js:12`
**Issue:** File upload without type validation

### 🟡 Performance: Synchronous File Operations
**File:** `/utils/logger.js:45`
**Issue:** Using fs.writeFileSync in request handler

## Code Quality Suggestions

1. Add error handling for async operations
2. Extract magic numbers to constants
3. Add JSDoc comments for new functions
4. Consider extracting complex logic to service layer

## Testing Recommendations

Based on changes:
- Add security tests for input validation
- Add performance tests for database queries
- Test error scenarios
- Add integration tests for new endpoints
```

## Security Findings (security_findings.json)
```json
{
  "scan_date": "2024-01-15T10:30:00Z",
  "total_issues": 5,
  "critical": 2,
  "high": 3,
  "findings": [
    {
      "id": "SEC-001",
      "type": "SQL_INJECTION",
      "severity": "CRITICAL",
      "file": "api/userController.js",
      "line": 45,
      "description": "Direct string concatenation in SQL query",
      "recommendation": "Use parameterized queries",
      "cwe": "CWE-89",
      "owasp": "A03:2021"
    }
  ]
}
```