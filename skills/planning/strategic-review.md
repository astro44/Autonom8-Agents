# strategic-review

Quick strategic assessment of proposals for business value and priority.

## Purpose

Performs initial strategic review of incoming proposals. Evaluates business value, technical feasibility, and strategic alignment. Returns priority rating and go/no-go recommendation.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "proposal_id": "PROP-123",
  "title": "Add dark mode support",
  "description": "Implement system-wide dark mode toggle...",
  "business_context": "User feedback indicates 40% want dark mode",
  "technical_context": "React app with Tailwind CSS",
  "constraints": ["Q1 deadline", "No breaking changes"],
  "evaluation_criteria": ["user_value", "revenue_impact", "technical_risk"]
}
```

- `proposal_id` (required): Proposal identifier
- `title` (required): Proposal title
- `description` (required): Detailed description
- `business_context` (optional): Business justification
- `technical_context` (optional): Technical environment
- `constraints` (optional): Time/resource constraints
- `evaluation_criteria` (optional): Criteria to evaluate

## Evaluation Dimensions

### Business Value
- User impact (reach, frequency)
- Revenue potential
- Competitive advantage
- Strategic alignment

### Technical Assessment
- Implementation complexity
- Risk factors
- Dependencies
- Maintenance burden

### Resource Requirements
- Estimated effort
- Required skills
- Timeline feasibility

## Output Schema

```json
{
  "skill": "strategic-review",
  "status": "success",
  "proposal_id": "PROP-123",
  "assessment": "approved|needs_revision|rejected|deferred",
  "priority": "P0|P1|P2|P3",
  "scores": {
    "business_value": 8,
    "technical_feasibility": 7,
    "strategic_alignment": 9,
    "overall": 8
  },
  "estimated_effort": "2-3 weeks",
  "reasoning": "High user demand with moderate implementation complexity...",
  "recommendations": [
    "Start with settings page toggle",
    "Use CSS variables for theming",
    "Test on all supported browsers"
  ],
  "risks": [
    {
      "risk": "Color contrast accessibility",
      "mitigation": "Use WCAG 2.1 AA compliant palette"
    }
  ],
  "next_action": "proceed_to_grooming|revise|archive"
}
```

## Priority Definitions

- **P0**: Critical - Do immediately
- **P1**: High - Do this sprint
- **P2**: Medium - Plan for next sprint
- **P3**: Low - Backlog

## Examples

### Approved
```json
{
  "skill": "strategic-review",
  "status": "success",
  "assessment": "approved",
  "priority": "P1",
  "scores": {"overall": 8},
  "reasoning": "Strong user demand, moderate effort, aligns with UX improvement goals",
  "next_action": "proceed_to_grooming"
}
```

### Needs Revision
```json
{
  "skill": "strategic-review",
  "status": "success",
  "assessment": "needs_revision",
  "priority": "P2",
  "reasoning": "Scope too broad, suggest splitting into phases",
  "recommendations": ["Define MVP scope", "Create phase 2 proposal"],
  "next_action": "revise"
}
```
