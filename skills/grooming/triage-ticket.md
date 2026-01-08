# triage-ticket

Classify ticket type and determine which agents should enrich it.

## Purpose

Analyzes ticket content to determine its type (feature, bug, tech-debt, etc.) and identifies which specialized agents should be involved in enrichment. Routes tickets to appropriate enrichment pipeline.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "ticket_id": "TICKET-123",
  "title": "Add user profile settings page",
  "description": "Users need ability to update profile...",
  "user_story": "As a user, I want to edit my profile...",
  "labels": ["frontend", "user-requested"],
  "attachments": ["mockup.png"]
}
```

- `ticket_id` (required): Ticket identifier
- `title` (required): Ticket title
- `description` (required): Detailed description
- `user_story` (optional): User story if available
- `labels` (optional): Existing labels
- `attachments` (optional): Attached files

## Ticket Types

| Type | Description | Primary Agents |
|------|-------------|----------------|
| feature | New functionality | dev, ui, qa |
| bug | Defect fix | dev, qa |
| tech-debt | Code improvement | dev |
| docs | Documentation | docs |
| infra | Infrastructure | devops |
| security | Security fix | security, dev |
| data | Data/analytics | data, dev |

## Agent Selection Rules

- **UI mentioned/mockup attached**: Add `ui-agent`
- **API/backend focus**: Add `dev-agent`
- **Database changes**: Add `data-agent`
- **Security concern**: Add `security-agent`
- **Deployment/infra**: Add `devops-agent`
- **All features**: Add `qa-agent`

## Output Schema

```json
{
  "skill": "triage-ticket",
  "status": "success",
  "ticket_id": "TICKET-123",
  "classification": {
    "type": "feature",
    "confidence": 0.92,
    "subtypes": ["ui", "api"]
  },
  "enrichment_pipeline": {
    "agents": ["ui-agent", "dev-agent", "qa-agent"],
    "order": ["ui-agent", "dev-agent", "qa-agent"],
    "parallel_safe": ["ui-agent", "dev-agent"]
  },
  "suggested_labels": ["feature", "frontend", "backend"],
  "estimated_complexity": "medium",
  "dependencies_detected": ["TICKET-100"],
  "next_action": "enrich"
}
```

## Examples

### Feature Ticket
```json
{
  "skill": "triage-ticket",
  "status": "success",
  "classification": {"type": "feature", "confidence": 0.95},
  "enrichment_pipeline": {
    "agents": ["ui-agent", "dev-agent", "qa-agent"],
    "order": ["ui-agent", "dev-agent", "qa-agent"]
  },
  "next_action": "enrich"
}
```

### Bug Ticket
```json
{
  "skill": "triage-ticket",
  "status": "success",
  "classification": {"type": "bug", "confidence": 0.88},
  "enrichment_pipeline": {
    "agents": ["dev-agent", "qa-agent"]
  },
  "next_action": "enrich"
}
```
