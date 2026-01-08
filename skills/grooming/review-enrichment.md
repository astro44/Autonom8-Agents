# review-enrichment

Review PO enrichment work for completeness and quality.

## Purpose

Reviews the Product Owner's enrichment of a proposal. Validates that user stories, acceptance criteria, and technical requirements are complete and well-defined before proceeding to implementation.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "proposal_id": "PROP-123",
  "title": "Add export feature",
  "po_enrichment": {
    "user_stories": [
      "As a user, I want to export my data as CSV..."
    ],
    "acceptance_criteria": [
      "Export button visible on dashboard",
      "CSV includes all visible columns"
    ],
    "technical_notes": "Use existing report generator",
    "out_of_scope": ["PDF export", "Scheduled exports"]
  },
  "pm_requirements": {
    "priority": "P1",
    "deadline": "2024-02-01"
  }
}
```

- `proposal_id` (required): Proposal identifier
- `title` (required): Proposal title
- `po_enrichment` (required): PO's enrichment data
- `pm_requirements` (optional): PM's original requirements

## Review Criteria

### User Stories
- Follows "As a... I want... So that..." format
- Clear actor identification
- Specific, measurable outcome

### Acceptance Criteria
- Testable conditions
- Complete coverage of user stories
- Edge cases considered

### Technical Notes
- Feasibility addressed
- Dependencies identified
- Risks noted

## Output Schema

```json
{
  "skill": "review-enrichment",
  "status": "success",
  "proposal_id": "PROP-123",
  "review": {
    "overall": "approved|needs_work|rejected",
    "completeness_score": 85,
    "quality_score": 90
  },
  "user_stories_review": {
    "count": 3,
    "well_formed": 2,
    "issues": [
      {
        "story_index": 2,
        "issue": "Missing 'so that' clause",
        "suggestion": "Add business value: 'so that I can share with stakeholders'"
      }
    ]
  },
  "acceptance_criteria_review": {
    "count": 5,
    "testable": 4,
    "issues": [
      {
        "criterion_index": 3,
        "issue": "Not testable",
        "original": "Export should be fast",
        "suggestion": "Export completes within 5 seconds for up to 1000 rows"
      }
    ]
  },
  "missing_elements": [
    "Error handling for large exports",
    "File size limits"
  ],
  "next_action": "approve|revise|discuss"
}
```

## Examples

### Approved
```json
{
  "skill": "review-enrichment",
  "status": "success",
  "review": {
    "overall": "approved",
    "completeness_score": 95,
    "quality_score": 92
  },
  "next_action": "approve"
}
```

### Needs Work
```json
{
  "skill": "review-enrichment",
  "status": "success",
  "review": {
    "overall": "needs_work",
    "completeness_score": 65,
    "quality_score": 70
  },
  "missing_elements": ["Edge cases", "Error scenarios"],
  "next_action": "revise"
}
```
