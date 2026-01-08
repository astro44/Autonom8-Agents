# route-ticket

Route tickets from inbox to appropriate processing queue.

## Purpose

Quick initial routing of tickets from inbox to triage queue. Performs basic validation and determines if ticket is ready for triage or needs more information.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "ticket_id": "TICKET-123",
  "title": "Add export feature",
  "description": "Need to export data...",
  "source": "jira|github|email|manual",
  "submitter": "user@example.com",
  "metadata": {}
}
```

- `ticket_id` (required): Ticket identifier
- `title` (required): Ticket title
- `description` (optional): Description
- `source` (optional): Ticket source
- `submitter` (optional): Who submitted
- `metadata` (optional): Additional metadata

## Routing Rules

### Ready for Triage
- Has title (min 10 chars)
- Has description (min 50 chars)
- Not duplicate of existing ticket

### Needs Information
- Missing description
- Title too vague
- Incomplete reproduction steps (for bugs)

### Auto-Close
- Spam detected
- Duplicate (exact match)
- Out of scope

## Output Schema

```json
{
  "skill": "route-ticket",
  "status": "success",
  "ticket_id": "TICKET-123",
  "routing": {
    "destination": "triage|needs_info|auto_close",
    "reason": "Ticket meets triage requirements",
    "confidence": 0.95
  },
  "validation": {
    "has_title": true,
    "has_description": true,
    "description_quality": "good",
    "duplicate_check": "no_match"
  },
  "enrichments_added": {
    "source_normalized": "jira",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "next_action": "proceed_to_triage|request_info|close"
}
```

## Examples

### Route to Triage
```json
{
  "skill": "route-ticket",
  "status": "success",
  "routing": {
    "destination": "triage",
    "reason": "Complete ticket, ready for triage"
  },
  "next_action": "proceed_to_triage"
}
```

### Needs Information
```json
{
  "skill": "route-ticket",
  "status": "success",
  "routing": {
    "destination": "needs_info",
    "reason": "Description too brief"
  },
  "next_action": "request_info"
}
```
