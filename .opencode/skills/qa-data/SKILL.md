---
name: qa-data
description: Data QA for database migrations and schema validation. Checks SQL syntax, UP/DOWN sections, model-schema consistency, and rollback safety.
---

# qa-data - Database Migration & Schema QA

Validates database migrations, schema changes, and model consistency. Ensures migrations are safe, reversible, and correctly implemented.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "platform": "postgresql|mysql|dynamodb",
  "migrations_dir": "migrations/",
  "models_dir": "models/",
  "checks": ["syntax", "rollback", "schema", "foreign_keys"]
}
```

## Instructions

### 1. Detect Migration Files

```bash
# SQL migrations
find $project_dir -path "*/migrations/*.sql" -o -path "*/db/migrations/*.sql"

# DynamoDB (Terraform)
find $project_dir -name "*.tf" | xargs grep -l "aws_dynamodb_table"
```

### 2. Validate SQL Migrations

**Syntax Check:**
```bash
# PostgreSQL
psql -h localhost -U test -d testdb -f migration.sql --set ON_ERROR_STOP=1

# MySQL
mysql -u test -p testdb < migration.sql
```

**UP Section Check:**
```sql
-- Must contain: CREATE, ALTER, INSERT, UPDATE
-- Look for: -- +migrate Up or -- UP
grep -E "^\s*--\s*(\+migrate\s+)?Up" migration.sql
```

**DOWN Section Check:**
```sql
-- Must contain: DROP, ALTER, DELETE, TRUNCATE
-- Look for: -- +migrate Down or -- DOWN
grep -E "^\s*--\s*(\+migrate\s+)?Down" migration.sql
```

### 3. Rollback Safety

Test that DOWN reverses UP:

```bash
# 1. Apply UP
psql -f migration.sql  # UP section

# 2. Verify changes
psql -c "\d tablename"  # Should exist

# 3. Apply DOWN
psql -f migration_down.sql  # DOWN section

# 4. Verify rollback
psql -c "\d tablename"  # Should fail/not exist
```

### 4. Model-Schema Consistency

**Go Models:**
```go
// Check struct tags match columns
type User struct {
    ID    string `db:"id"`        // → column: id
    Email string `db:"email"`     // → column: email
}
```

**Validation:**
```bash
# Extract struct tags
grep -rn 'db:"' models/*.go

# Compare with migration columns
grep -E "CREATE TABLE|ADD COLUMN" migrations/*.sql
```

### 5. Foreign Key Validation

```sql
-- Check FK references exist
-- FK: orders.user_id → users.id
-- Verify: users table exists before orders migration
```

## Output Format

```json
{
  "skill": "qa-data",
  "status": "pass|fail",
  "platform": "postgresql",
  "migrations_checked": 5,
  "summary": {
    "passed": 4,
    "failed": 1,
    "warnings": 2
  },
  "checks": {
    "syntax": {
      "passed": true,
      "errors": []
    },
    "rollback": {
      "passed": false,
      "missing_down": ["003_add_orders.sql"]
    },
    "schema": {
      "passed": true,
      "mismatches": []
    },
    "foreign_keys": {
      "passed": true,
      "invalid": []
    }
  },
  "issues": [
    {
      "type": "rollback_safety",
      "severity": "HIGH",
      "file": "migrations/003_add_orders.sql",
      "message": "Missing DOWN section - rollback not possible",
      "fix": "Add -- +migrate Down section with DROP TABLE orders"
    }
  ],
  "errors": [],
  "warnings": ["Migration 002 uses deprecated syntax"],
  "next_action": "proceed|fix"
}
```

## Issue Categories

| Category | Severity | Description |
|----------|----------|-------------|
| `migration_syntax` | HIGH | SQL syntax error |
| `rollback_safety` | HIGH | Missing DOWN section |
| `schema_consistency` | MEDIUM | Model doesn't match table |
| `foreign_key` | HIGH | FK references missing table |
| `index_coverage` | LOW | Missing recommended index |
| `data_integrity` | CRITICAL | Data loss risk |
| `idempotency` | MEDIUM | Missing IF NOT EXISTS |

## Decision Logic

```
Any CRITICAL issues (data_integrity)?
    YES → status: "fail", next_action: "fix"

Any HIGH issues (syntax, rollback, FK)?
    YES → status: "fail", next_action: "fix"

Only MEDIUM/LOW issues?
    YES → status: "pass", warnings populated

No issues?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**Validate all migrations:**
```json
{
  "project_dir": "/projects/api-service",
  "platform": "postgresql",
  "migrations_dir": "db/migrations/",
  "checks": ["syntax", "rollback", "schema", "foreign_keys"]
}
```

**Quick syntax check:**
```json
{
  "project_dir": "/projects/api-service",
  "platform": "mysql",
  "migrations_dir": "migrations/",
  "checks": ["syntax"]
}
```

**DynamoDB validation:**
```json
{
  "project_dir": "/projects/serverless-app",
  "platform": "dynamodb",
  "migrations_dir": "terraform/",
  "models_dir": "models/",
  "checks": ["syntax", "schema"]
}
```

**Full validation with models:**
```json
{
  "project_dir": "/projects/go-api",
  "platform": "postgresql",
  "migrations_dir": "db/migrations/",
  "models_dir": "internal/models/",
  "checks": ["syntax", "rollback", "schema", "foreign_keys"]
}
```

## Platform-Specific Checks

### PostgreSQL
- Transaction wrapping
- IF NOT EXISTS guards
- Index CONCURRENTLY option
- Constraint names

### MySQL
- ENGINE specification
- Character set
- Auto-increment handling
- Foreign key actions

### DynamoDB
- hash_key required
- billing_mode set
- GSI projections
- PITR enabled

## Token Efficiency

- SQL parsing without execution
- Pattern-based validation
- ~5-15 second execution
- Returns actionable fix locations
