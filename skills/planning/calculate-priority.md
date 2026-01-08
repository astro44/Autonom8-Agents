# calculate-priority

Calculate RICE/ICE priority scores for tickets.

## Purpose

Computes standardized priority scores using RICE (Reach, Impact, Confidence, Effort) or ICE (Impact, Confidence, Ease) frameworks. Returns numerical scores for sprint planning prioritization.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "ticket_id": "TICKET-123",
  "title": "Improve checkout flow",
  "method": "rice|ice",
  "factors": {
    "reach": 5000,
    "impact": "high",
    "confidence": 80,
    "effort": "2 weeks"
  },
  "custom_weights": {
    "reach": 1.0,
    "impact": 2.0,
    "confidence": 1.0,
    "effort": 1.5
  }
}
```

- `ticket_id` (required): Ticket identifier
- `title` (required): Ticket title
- `method` (optional): Scoring method, default "rice"
- `factors` (required): Scoring factors
- `custom_weights` (optional): Custom factor weights

## RICE Calculation

```
RICE Score = (Reach × Impact × Confidence) / Effort

- Reach: Number of users affected per quarter
- Impact: 0.25 (minimal) to 3 (massive)
- Confidence: 0-100%
- Effort: Person-weeks
```

## ICE Calculation

```
ICE Score = Impact × Confidence × Ease

- Impact: 1-10 scale
- Confidence: 1-10 scale
- Ease: 1-10 scale (inverse of effort)
```

## Impact Mapping

| Level | RICE Multiplier | ICE Score |
|-------|-----------------|-----------|
| Massive | 3.0 | 10 |
| High | 2.0 | 8 |
| Medium | 1.0 | 5 |
| Low | 0.5 | 3 |
| Minimal | 0.25 | 1 |

## Output Schema

```json
{
  "skill": "calculate-priority",
  "status": "success",
  "ticket_id": "TICKET-123",
  "method": "rice",
  "inputs": {
    "reach": 5000,
    "impact": 2.0,
    "confidence": 0.8,
    "effort": 2
  },
  "score": 4000,
  "breakdown": {
    "numerator": 8000,
    "denominator": 2,
    "formula": "(5000 × 2.0 × 0.8) / 2"
  },
  "priority": "P1",
  "rank_recommendation": "Top 10%",
  "comparable_tickets": [
    {"id": "TICKET-100", "score": 3800},
    {"id": "TICKET-105", "score": 4200}
  ]
}
```

## Priority Mapping

| Score Range | Priority |
|-------------|----------|
| > 5000 | P0 |
| 2000-5000 | P1 |
| 500-2000 | P2 |
| < 500 | P3 |

## Examples

### High Priority
```json
{
  "skill": "calculate-priority",
  "status": "success",
  "ticket_id": "TICKET-123",
  "method": "rice",
  "score": 4000,
  "priority": "P1",
  "rank_recommendation": "Top 10%"
}
```

### Low Priority
```json
{
  "skill": "calculate-priority",
  "status": "success",
  "ticket_id": "TICKET-456",
  "method": "ice",
  "score": 120,
  "priority": "P3",
  "rank_recommendation": "Bottom 25%"
}
```
