---
name: security-scan
description: Security vulnerability scanning. Detects OWASP Top 10 issues, hardcoded secrets, XSS, SQL injection, and insecure dependencies. Returns JSON with findings.
---

# security-scan - Security Vulnerability Scanner

Scans codebase for security vulnerabilities using pattern matching and static analysis. Detects OWASP Top 10 issues, hardcoded credentials, and insecure coding patterns.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "scope": "changed|all|ticket",
  "ticket_id": "TICKET-XXX",
  "checks": ["secrets", "owasp", "dependencies"]
}
```

## Instructions

### 1. Secrets Detection

Scan for hardcoded credentials and API keys:

```bash
# Common secret patterns
grep -rn "password\s*=" --include="*.js" --include="*.ts" --include="*.py"
grep -rn "api_key\s*=" --include="*.js" --include="*.ts"
grep -rn "AWS_SECRET" --include="*"
grep -rn "PRIVATE_KEY" --include="*"

# Base64 encoded secrets (entropy check)
grep -rn "eyJ" --include="*.js"  # JWT tokens

# .env files in version control
git ls-files | grep -E "\.env$|\.env\."
```

### 2. OWASP Top 10 Checks

| Vulnerability | Pattern | Example |
|---------------|---------|---------|
| SQL Injection | `query("SELECT * FROM " + var)` | Use parameterized queries |
| XSS | `innerHTML = userInput` | Use textContent or sanitize |
| Command Injection | `exec(userInput)` | Validate/escape input |
| Path Traversal | `readFile(userPath)` | Normalize and validate paths |
| Insecure Deserialization | `JSON.parse(untrusted)` | Validate schema first |

```bash
# SQL Injection
grep -rn "query.*\+.*\$" --include="*.js"
grep -rn "execute.*%s" --include="*.py"

# XSS
grep -rn "innerHTML\s*=" --include="*.js" --include="*.jsx"
grep -rn "document\.write" --include="*.js"

# Command Injection
grep -rn "exec\s*(" --include="*.js"
grep -rn "subprocess\..*shell=True" --include="*.py"

# Path Traversal
grep -rn "\.\./" --include="*.js" --include="*.py"
```

### 3. Dependency Scanning

```bash
# Check for known vulnerable packages
npm audit --json 2>/dev/null
pip-audit --format json 2>/dev/null
```

### 4. Severity Classification

| Severity | Examples | CVSS Range |
|----------|----------|------------|
| CRITICAL | RCE, SQL Injection, hardcoded AWS keys | 9.0-10.0 |
| HIGH | XSS, CSRF, auth bypass | 7.0-8.9 |
| MEDIUM | Info disclosure, weak crypto | 4.0-6.9 |
| LOW | Verbose errors, missing headers | 0.1-3.9 |

## Output Format

```json
{
  "skill": "security-scan",
  "status": "pass|fail|warning",
  "scan_id": "SEC-20260107-001",
  "timestamp": "2026-01-07T12:00:00Z",
  "files_scanned": 42,
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3
  },
  "vulnerabilities": [
    {
      "id": "V-001",
      "severity": "HIGH",
      "category": "XSS",
      "cwe_id": "CWE-79",
      "title": "innerHTML with user input",
      "description": "User-controlled data assigned to innerHTML without sanitization",
      "location": {
        "file": "src/components/UserComment.js",
        "line": 42,
        "code_snippet": "element.innerHTML = comment.body"
      },
      "remediation": "Use textContent for plain text or sanitize with DOMPurify",
      "references": ["https://owasp.org/www-community/attacks/xss/"]
    }
  ],
  "secrets_found": [
    {
      "type": "api_key",
      "file": "src/config.js",
      "line": 15,
      "pattern": "API_KEY = 'sk-...'",
      "remediation": "Move to environment variable"
    }
  ],
  "dependency_vulnerabilities": [
    {
      "package": "lodash",
      "version": "4.17.19",
      "vulnerability": "Prototype Pollution",
      "severity": "HIGH",
      "fix_version": "4.17.21"
    }
  ],
  "errors": [],
  "warnings": [],
  "next_action": "proceed|fix|review"
}
```

## Decision Logic

```
Any CRITICAL vulnerabilities?
    YES → status: "fail", next_action: "fix"

Any HIGH vulnerabilities?
    YES → status: "fail", next_action: "fix"

Any MEDIUM vulnerabilities?
    YES → status: "warning", next_action: "review"

Only LOW or no issues?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**Full security scan:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "all",
  "checks": ["secrets", "owasp", "dependencies"]
}
```

**Scan changed files only:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "scope": "changed",
  "checks": ["secrets", "owasp"]
}
```

**Quick secrets check:**
```json
{
  "project_dir": "/projects/api-service",
  "scope": "all",
  "checks": ["secrets"]
}
```

**Ticket-specific scan:**
```json
{
  "project_dir": "/projects/api-service",
  "scope": "ticket",
  "ticket_id": "TICKET-API-001",
  "checks": ["owasp", "secrets"]
}
```

## CWE Reference

| Category | CWE | Description |
|----------|-----|-------------|
| SQL Injection | CWE-89 | Improper neutralization of SQL |
| XSS | CWE-79 | Improper neutralization of input |
| Command Injection | CWE-78 | OS command injection |
| Path Traversal | CWE-22 | Improper path limitation |
| Hardcoded Credentials | CWE-798 | Use of hardcoded credentials |
| Weak Crypto | CWE-327 | Use of broken crypto algorithm |

## Token Efficiency

- Pattern-based detection (no LLM inference)
- Parallel file scanning
- ~10-60 second execution
- Returns actionable fix suggestions
