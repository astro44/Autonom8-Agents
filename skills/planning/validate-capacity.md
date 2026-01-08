# validate-capacity

Validate sprint capacity against selected tickets.

## Purpose

Checks if selected tickets fit within sprint capacity constraints. Calculates total effort, identifies over-allocation, and suggests adjustments to meet capacity limits.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "sprint_id": "SPRINT-2024-01",
  "capacity_hours": 80,
  "buffer_percent": 20,
  "tickets": [
    {"id": "TICKET-1", "estimated_hours": 16, "priority": "P0"},
    {"id": "TICKET-2", "estimated_hours": 24, "priority": "P1"},
    {"id": "TICKET-3", "estimated_hours": 32, "priority": "P1"},
    {"id": "TICKET-4", "estimated_hours": 20, "priority": "P2"}
  ],
  "team_size": 2,
  "velocity_history": [65, 72, 68]
}
```

- `sprint_id` (required): Sprint identifier
- `capacity_hours` (required): Total available hours
- `buffer_percent` (optional): Buffer for unknowns, default 20%
- `tickets` (required): Tickets with estimates
- `team_size` (optional): Number of team members
- `velocity_history` (optional): Past sprint velocities

## Capacity Calculation

```
Available Capacity = capacity_hours × (1 - buffer_percent/100)
Total Estimated = sum(ticket.estimated_hours)
Utilization = Total Estimated / Available Capacity × 100%
```

## Output Schema

```json
{
  "skill": "validate-capacity",
  "status": "within_capacity|over_capacity|under_capacity",
  "sprint_id": "SPRINT-2024-01",
  "capacity": {
    "total_hours": 80,
    "buffer_hours": 16,
    "available_hours": 64,
    "estimated_hours": 92,
    "utilization_percent": 143.75
  },
  "assessment": "over_capacity",
  "over_by_hours": 28,
  "recommendations": [
    {
      "action": "defer",
      "ticket_id": "TICKET-4",
      "reason": "Lowest priority (P2)",
      "saves_hours": 20
    },
    {
      "action": "split",
      "ticket_id": "TICKET-3",
      "reason": "Can be phased",
      "saves_hours": 16
    }
  ],
  "if_adjusted": {
    "remaining_tickets": ["TICKET-1", "TICKET-2", "TICKET-3-phase1"],
    "estimated_hours": 56,
    "utilization_percent": 87.5
  },
  "velocity_comparison": {
    "avg_velocity": 68.3,
    "current_estimate": 92,
    "risk_level": "high"
  },
  "next_action": "proceed|adjust|replan"
}
```

## Status Values

- `within_capacity`: Utilization 70-100%
- `over_capacity`: Utilization > 100%
- `under_capacity`: Utilization < 70%

## Examples

### Within Capacity
```json
{
  "skill": "validate-capacity",
  "status": "within_capacity",
  "capacity": {
    "available_hours": 64,
    "estimated_hours": 56,
    "utilization_percent": 87.5
  },
  "next_action": "proceed"
}
```

### Over Capacity
```json
{
  "skill": "validate-capacity",
  "status": "over_capacity",
  "capacity": {
    "available_hours": 64,
    "estimated_hours": 92,
    "utilization_percent": 143.75
  },
  "over_by_hours": 28,
  "recommendations": [
    {"action": "defer", "ticket_id": "TICKET-4", "saves_hours": 20}
  ],
  "next_action": "adjust"
}
```
