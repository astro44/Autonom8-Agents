---
name: qa-backend
description: Backend QA for API/Lambda/gRPC testing. Validates endpoints, response schemas, error handling, and integration tests. Returns JSON with test results.
---

# qa-backend - Backend API Testing

Validates backend services: REST APIs, Lambda functions, gRPC endpoints, and database operations.

## Input Schema

```json
{
  "project_dir": "/path/to/backend",
  "ticket_id": "TICKET-XXX",
  "service_type": "rest|lambda|grpc|graphql",
  "base_url": "http://localhost:3000",
  "test_path": "tests/",
  "checks": ["endpoints", "schemas", "errors", "auth"]
}
```

## Service Types

### REST API Testing

```bash
# Run API tests
cd $project_dir
npm test -- --grep "api"
# or
pytest tests/api/ -v
```

### Lambda Testing

```bash
# Local Lambda test
sam local invoke MyFunction -e events/test-event.json

# Run unit tests
npm test -- --grep "lambda"
```

### gRPC Testing

```bash
# Use grpcurl for endpoint testing
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext -d '{"id": "123"}' localhost:50051 myservice.MyService/GetItem
```

## Instructions

### 1. Endpoint Validation

```bash
# Check endpoint responds
curl -s -o /dev/null -w "%{http_code}" $base_url/api/health
# Expected: 200

# Check endpoint returns valid JSON
curl -s $base_url/api/users | jq .
```

### 2. Schema Validation

```javascript
// Validate response matches schema
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = require('./schemas/user.json');
const validate = ajv.compile(schema);

const response = await fetch('/api/users/1');
const data = await response.json();
const valid = validate(data);
// valid should be true
```

### 3. Error Handling

```bash
# Test 404 handling
curl -s -w "\n%{http_code}" $base_url/api/nonexistent
# Expected: 404 with error body

# Test 400 handling (bad input)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"invalid": true}' \
  $base_url/api/users
# Expected: 400 with validation errors
```

### 4. Authentication

```bash
# Test unauthorized access
curl -s -w "\n%{http_code}" $base_url/api/protected
# Expected: 401

# Test with valid token
curl -s -H "Authorization: Bearer $TOKEN" $base_url/api/protected
# Expected: 200
```

## Output Format

```json
{
  "skill": "qa-backend",
  "status": "pass|fail",
  "service_type": "rest",
  "tests": {
    "total": 25,
    "passed": 23,
    "failed": 2,
    "skipped": 0
  },
  "checks": {
    "endpoints": {
      "passed": true,
      "tested": 8,
      "all_responding": true
    },
    "schemas": {
      "passed": false,
      "violations": [
        {
          "endpoint": "GET /api/users",
          "field": "createdAt",
          "expected": "string (ISO date)",
          "actual": "number (timestamp)"
        }
      ]
    },
    "errors": {
      "passed": true,
      "404_handled": true,
      "400_handled": true,
      "500_handled": true
    },
    "auth": {
      "passed": true,
      "unauthorized_returns_401": true,
      "valid_token_accepted": true
    }
  },
  "errors": [
    {
      "test": "GET /api/users schema",
      "message": "createdAt should be ISO string, got timestamp",
      "severity": "MEDIUM"
    }
  ],
  "next_action": "proceed|fix"
}
```

## Common Checks

| Check | What it Validates | Severity |
|-------|-------------------|----------|
| Endpoints respond | All routes return non-500 | HIGH |
| Schema validation | Response matches contract | MEDIUM |
| Error handling | Proper error responses | MEDIUM |
| Auth enforcement | Protected routes require auth | HIGH |
| Rate limiting | Rate limits enforced | LOW |
| CORS headers | Correct CORS config | MEDIUM |

## Decision Logic

```
Any HIGH severity failure?
    YES → status: "fail", next_action: "fix"

Any MEDIUM severity failure?
    YES → status: "warning", next_action: "fix"

All checks pass?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**REST API test:**
```json
{
  "project_dir": "/projects/api-service",
  "service_type": "rest",
  "base_url": "http://localhost:3000",
  "checks": ["endpoints", "schemas", "errors", "auth"]
}
```

**Lambda test:**
```json
{
  "project_dir": "/projects/lambda-function",
  "service_type": "lambda",
  "checks": ["endpoints", "schemas", "errors"]
}
```

**gRPC test:**
```json
{
  "project_dir": "/projects/grpc-service",
  "service_type": "grpc",
  "base_url": "localhost:50051",
  "checks": ["endpoints", "schemas"]
}
```

## Token Efficiency

- Uses existing test frameworks (jest, pytest, go test)
- Returns structured JSON results
- Provides actionable error details
- ~10-60 second execution depending on test count
