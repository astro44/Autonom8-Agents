---
name: qa-exploratory
description: Exploratory QA to find edge cases and unexpected bugs. Tests boundary conditions, error states, and unusual user flows.
---

# qa-exploratory - Exploratory Testing

Performs exploratory testing to discover edge cases, boundary conditions, and unexpected bugs that structured tests miss.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_id": "TICKET-XXX",
  "url": "http://localhost:8080",
  "focus_areas": ["forms", "navigation", "data_display", "error_states"],
  "time_budget": 60
}
```

## Instructions

### 1. Identify Test Targets

From ticket acceptance_criteria, identify:
- User-facing components
- Data entry points
- State transitions
- External integrations

### 2. Boundary Testing

```javascript
// Test input boundaries
const boundaryTests = {
  // Empty inputs
  emptyString: '',

  // Max length
  longString: 'a'.repeat(10000),

  // Special characters
  specialChars: '<script>alert(1)</script>',
  unicode: '日本語テスト🎉',

  // Numbers
  zero: 0,
  negative: -1,
  maxInt: Number.MAX_SAFE_INTEGER,

  // Dates
  farPast: '1900-01-01',
  farFuture: '2100-12-31'
};
```

### 3. Error State Testing

```javascript
// Force error conditions
const errorTests = [
  'Network offline',
  'API returns 500',
  'Empty data response',
  'Malformed JSON',
  'Timeout after 30s'
];
```

### 4. Unusual Flow Testing

```javascript
// Test unexpected user behaviors
const flowTests = [
  'Double-click submit',
  'Back button during form submission',
  'Rapid navigation between pages',
  'Open in multiple tabs',
  'Refresh during async operation'
];
```

### 5. Visual Edge Cases

```javascript
// Test visual boundaries
const visualTests = [
  'Very long text content',
  'Missing images (404)',
  'Slow image loading',
  'Extreme viewport sizes (320px, 4K)',
  'High contrast mode',
  'Zoom at 200%'
];
```

## Output Format

```json
{
  "skill": "qa-exploratory",
  "status": "pass|issues_found",
  "time_spent": 45,
  "tests_performed": 23,
  "findings": [
    {
      "id": "EXP-001",
      "severity": "MEDIUM",
      "category": "boundary",
      "title": "Form accepts 10000+ character input without validation",
      "description": "Email field accepts extremely long strings, may cause DB issues",
      "steps_to_reproduce": [
        "Navigate to contact form",
        "Paste 10000 characters into email field",
        "Submit form",
        "Observe: form submits successfully"
      ],
      "expected": "Validation error for max length",
      "actual": "Form submitted, possible truncation",
      "screenshot": "screenshots/exp-001-long-email.png"
    }
  ],
  "areas_tested": {
    "forms": {"tests": 8, "issues": 1},
    "navigation": {"tests": 5, "issues": 0},
    "data_display": {"tests": 6, "issues": 2},
    "error_states": {"tests": 4, "issues": 0}
  },
  "suggestions": [
    "Add client-side max length validation",
    "Test with network throttling enabled"
  ],
  "next_action": "proceed|fix|review"
}
```

## Focus Areas

| Area | What to Test |
|------|--------------|
| `forms` | Validation, submission, reset |
| `navigation` | Links, routes, back/forward |
| `data_display` | Empty states, overflow, formatting |
| `error_states` | 404, 500, network errors |
| `accessibility` | Keyboard, screen reader, contrast |
| `performance` | Large datasets, slow connections |
| `concurrency` | Multiple tabs, rapid actions |

## Decision Logic

```
Any HIGH severity findings?
    YES → status: "issues_found", next_action: "fix"

Any MEDIUM severity findings?
    YES → status: "issues_found", next_action: "review"

Only LOW or no findings?
    YES → status: "pass", next_action: "proceed"
```

## Usage Examples

**Full exploratory session:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-003",
  "url": "http://localhost:8080",
  "focus_areas": ["forms", "navigation", "data_display", "error_states"],
  "time_budget": 120
}
```

**Quick boundary check:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_id": "TICKET-OXY-003",
  "url": "http://localhost:8080",
  "focus_areas": ["forms"],
  "time_budget": 30
}
```

## Token Efficiency

- Heuristic-based test selection
- Parallel browser sessions
- ~30-120 second execution
- Returns reproducible steps
