# review-readiness

Final readiness check before ticket moves to sprint.

## Purpose

Performs final quality gate check on a fully-enriched ticket. Validates all required fields are complete, estimates are reasonable, and ticket is ready for sprint planning.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "ticket_id": "TICKET-123",
  "title": "Add dark mode toggle",
  "enrichment": {
    "user_stories": [...],
    "acceptance_criteria": [...],
    "technical_approach": "...",
    "estimated_hours": 16,
    "scope": {...}
  },
  "triage": {
    "type": "feature",
    "agents_completed": ["ui-agent", "dev-agent", "qa-agent"]
  },
  "checklist": [
    "user_stories",
    "acceptance_criteria",
    "estimate",
    "scope",
    "dependencies"
  ]
}
```

- `ticket_id` (required): Ticket identifier
- `title` (required): Ticket title
- `enrichment` (required): Enrichment data from agents
- `triage` (optional): Triage classification
- `checklist` (optional): Custom checklist items

## Readiness Criteria

### Required Fields
- [ ] User stories defined
- [ ] Acceptance criteria testable
- [ ] Effort estimated
- [ ] Scope boundaries defined
- [ ] Dependencies identified

### Quality Checks
- [ ] No blocking dependencies
- [ ] Estimate within sprint capacity
- [ ] Technical approach validated
- [ ] No open questions

## Output Schema

```json
{
  "skill": "review-readiness",
  "status": "success",
  "ticket_id": "TICKET-123",
  "readiness": {
    "ready": true,
    "score": 95,
    "grade": "A"
  },
  "checklist_results": {
    "user_stories": {"status": "pass", "note": "3 stories, well-formed"},
    "acceptance_criteria": {"status": "pass", "note": "8 criteria, all testable"},
    "estimate": {"status": "pass", "note": "16 hours, reasonable"},
    "scope": {"status": "pass", "note": "Well-defined boundaries"},
    "dependencies": {"status": "pass", "note": "No blockers"}
  },
  "warnings": [
    "Estimate at upper bound for single sprint"
  ],
  "blockers": [],
  "recommendation": "Ready for sprint planning",
  "next_action": "move_to_proposed|address_blockers|return_to_enrichment"
}
```

## Readiness Grades

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Fully ready, no concerns |
| B | 75-89 | Ready with minor notes |
| C | 60-74 | Ready with reservations |
| D | 40-59 | Not ready, needs work |
| F | 0-39 | Blocked, major issues |

## Examples

### Ready
```json
{
  "skill": "review-readiness",
  "status": "success",
  "readiness": {
    "ready": true,
    "score": 92,
    "grade": "A"
  },
  "next_action": "move_to_proposed"
}
```

### Not Ready
```json
{
  "skill": "review-readiness",
  "status": "success",
  "readiness": {
    "ready": false,
    "score": 55,
    "grade": "D"
  },
  "blockers": ["Missing acceptance criteria", "No estimate"],
  "next_action": "return_to_enrichment"
}
```
