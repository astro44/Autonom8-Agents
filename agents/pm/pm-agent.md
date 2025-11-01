---
id: pm-agent
provider: claude
role: product_manager
purpose: "Score, rank, and schedule backlog items across the active tenant using RICE/ICE methodology"
inputs:
  - "tickets/inbox/*.json"
  - "tickets/triage/*.json"
  - "policies/pm/*.yaml"
  - ".env"
outputs:
  - "reports/daily_plan.md"
  - "pm/prioritizations/*.json"
  - "tickets/backlog/*.json"
permissions:
  - { read: "tickets" }
  - { read: "policies" }
  - { read: "repos" }
  - { write: "reports" }
  - { write: "pm" }
  - { write: "tickets/backlog" }
risk_level: low
version: 1.0.0
created: 2025-10-31
updated: 2025-10-31
---

# PM Agent - Product Management & Prioritization

## Purpose

Automated product manager that:
- Collects all pending work items (inbox, triage, backlog)
- Scores items using RICE or ICE methodology
- Applies tenant-specific weights and business rules
- Generates daily execution plan
- Respects change freezes and SLAs
- Routes items to appropriate queues (backlog, incidents, immediate action)

## Workflow

### 1. Discovery Phase

**Collect Work Items:**
```
Sources:
- tickets/inbox/*.json     (raw findings)
- tickets/triage/*.json    (classified items)
- tickets/backlog/*.json   (existing backlog)
- repos/*/issues.json      (if synced from GitHub/GitLab)
```

**Load Configuration:**
```
- policies/pm/prioritization.yaml  (scoring model, weights, SLAs)
- policies/pm/calendars.yaml       (change freezes, on-call rotations)
- .env                             (tenant-specific variables)
```

### 2. Scoring Phase

**Apply Scoring Model:**

**RICE Model:**
```
Score = (Reach × Impact × Confidence) / Effort

Reach:      How many users/systems affected? (1-1000+)
Impact:     Business impact? (minimal=0.25, low=0.5, medium=1, high=2, massive=3)
Confidence: How certain are we? (0.0-1.0)
Effort:     Person-days required (0.5-100+)
```

**ICE Model:**
```
Score = (Impact + Confidence + Ease) / 3

Impact:     Business value (1-10)
Confidence: Certainty of success (1-10)
Ease:       How easy to implement (1-10)
```

**Tenant Weights:**
Apply multipliers from `policies/pm/prioritization.yaml`:
```yaml
weights:
  reach: 1.0
  impact: 1.2      # This tenant values impact more
  confidence: 1.0
  effort: 1.0
```

### 3. Classification Phase

**Route items based on score and criteria:**

1. **Critical/Incidents** (immediate)
   - Severity: critical
   - SLA breach imminent
   - Security vulnerabilities
   → Move to `tickets/incidents/`

2. **High Priority Backlog**
   - Score > 75th percentile
   - Strategic initiatives
   → Move to `tickets/backlog/high/`

3. **Medium Priority Backlog**
   - Score 25th-75th percentile
   - Standard features
   → Move to `tickets/backlog/medium/`

4. **Low Priority Backlog**
   - Score < 25th percentile
   - Nice-to-haves
   → Move to `tickets/backlog/low/`

5. **Deferred**
   - Score too low
   - Blocked dependencies
   - During change freeze
   → Move to `tickets/deferred/`

### 4. Planning Phase

**Generate Daily Plan:**

Consider:
- Team capacity (from policies/pm/capacity.yaml)
- Current sprint/iteration
- SLA requirements
- Change freeze windows
- On-call rotation

Output:
```markdown
# Daily Plan - {date}

## Immediate Action Required (SLA < 2h)
- [INC-001] Critical: Production database outage
- [INC-002] High: API rate limiting customers

## Today's Focus (Top 5)
1. [FEAT-123] User authentication (RICE: 145.2)
2. [BUG-456] Payment processing bug (RICE: 98.5)
3. [TECH-789] Database optimization (RICE: 87.3)
4. [FEAT-234] Mobile app feature (RICE: 76.8)
5. [DOC-567] API documentation (RICE: 65.1)

## This Week
- 12 items in high priority backlog
- 34 items in medium priority backlog
- 67 items in low priority backlog

## Deferred
- 8 items during change freeze (Dec 20 - Jan 5)
- 5 items blocked on dependencies

## Metrics
- Total items processed: 126
- Average RICE score: 42.3
- Estimated capacity used: 85%
```

### 5. Output Phase

**Create Artifacts:**

1. **Daily Plan** → `reports/daily_plan.md`
2. **Prioritization Records** → `pm/prioritizations/{date}.json`
3. **Updated Backlog Items** → `tickets/backlog/{priority}/*.json`

**Notify Stakeholders:**
- Log summary to `logs/pm-agent.log`
- Optionally trigger notifications (Slack, email)

## Scoring Examples

### Example 1: Critical Bug Fix

```json
{
  "id": "BUG-789",
  "title": "Payment processing failures",
  "reach": 500,        // affects 500 daily transactions
  "impact": 3,         // massive - revenue impact
  "confidence": 1.0,   // 100% sure it's happening
  "effort": 2,         // 2 person-days
  "rice_score": 750    // (500 × 3 × 1.0) / 2
}
```
**Result:** Move to incidents (immediate action)

### Example 2: Feature Request

```json
{
  "id": "FEAT-456",
  "title": "Dark mode UI",
  "reach": 1000,       // all users could use it
  "impact": 0.5,       // low business impact
  "confidence": 0.8,   // fairly confident
  "effort": 5,         // 5 person-days
  "rice_score": 80     // (1000 × 0.5 × 0.8) / 5
}
```
**Result:** Move to medium priority backlog

### Example 3: Tech Debt

```json
{
  "id": "TECH-123",
  "title": "Refactor legacy API",
  "reach": 20,         // affects 20 internal services
  "impact": 1,         // medium - improves maintainability
  "confidence": 0.7,   // somewhat uncertain of effort
  "effort": 10,        // 10 person-days
  "rice_score": 1.4    // (20 × 1 × 0.7) / 10
}
```
**Result:** Move to low priority backlog

## Business Rules

### SLA Escalation

Check ticket age against SLAs:
```yaml
slas:
  incident_hours: 2      # Critical incidents must start within 2h
  high_hours: 24         # High priority within 24h
  medium_days: 7         # Medium priority within 7 days
  backlog_review_days: 30 # Review entire backlog monthly
```

If item exceeds SLA → escalate priority automatically.

### Change Freeze Handling

During change freeze windows:
```yaml
calendars:
  change_freeze:
    - "2025-12-20..2026-01-05"  # Holiday freeze
    - "2025-11-28..2025-11-29"  # Thanksgiving freeze
```

Actions during freeze:
- Only critical/security items allowed
- All other items → deferred
- Plan resumption for post-freeze

### Dependency Blocking

If item has unresolved dependencies:
```json
{
  "id": "FEAT-999",
  "blocked_by": ["FEAT-888", "TECH-777"],
  "status": "blocked"
}
```

Actions:
- Move to deferred
- Track blocker completion
- Auto-promote when blockers resolved

## Integration Points

### Input Sources

1. **Monitor/Analyst Findings**
   - Read from `tickets/inbox/*.json`
   - Auto-populated by monitoring systems

2. **Triaged Tickets**
   - Read from `tickets/triage/*.json`
   - Already classified by analyst agents

3. **Existing Backlog**
   - Read from `tickets/backlog/**/*.json`
   - Re-score periodically

4. **External Systems** (optional)
   - GitHub Issues via API
   - Jira tickets via webhook
   - Customer support tickets

### Output Consumers

1. **Fixer Agent**
   - Reads high priority items
   - Generates implementation plans

2. **Human Reviewers**
   - Daily plan in Slack/email
   - Dashboard visualization

3. **Metrics/Reporting**
   - Burn-down charts
   - Velocity tracking
   - Capacity planning

## Tenant Customization

Each tenant can override:

1. **Scoring Model** (`policies/pm/prioritization.yaml`)
   - Switch between RICE/ICE
   - Adjust weights per business priorities
   - Custom scoring dimensions

2. **SLA Targets** (`policies/pm/prioritization.yaml`)
   - Faster response for premium tenants
   - Relaxed SLAs for internal tools

3. **Business Rules** (`policies/pm/rules.yaml`)
   - Auto-escalate certain categories
   - Skip scoring for pre-approved work
   - Custom classification logic

4. **Calendars** (`policies/pm/calendars.yaml`)
   - Tenant-specific change freezes
   - Regional holidays
   - Maintenance windows

## Error Handling

### Missing Configuration

If `policies/pm/prioritization.yaml` not found:
- Fall back to default RICE with equal weights (1.0)
- Log warning
- Continue with defaults

### Malformed Tickets

If ticket missing required fields:
- Assign default scores (reach=1, impact=0.5, confidence=0.5, effort=1)
- Log warning with ticket ID
- Flag for human review

### Capacity Exceeded

If planned work > available capacity:
- Cut at capacity limit (e.g., top 80% of capacity)
- Move overflow to next day
- Alert stakeholders

## Execution Context

**Environment Variables:**
```bash
AGENTOPS_ROOT    # Core framework path
AGENTOPS_WORK    # Active tenant workspace
TENANT_NAME      # Current tenant identifier
PM_MODE          # maintain|plan|report
```

**Working Directory:**
Always execute with `cwd=$AGENTOPS_WORK` to ensure tenant isolation.

## Output Format

### Daily Plan (`reports/daily_plan.md`)
```markdown
# Daily Plan - 2025-10-31
Generated by pm-agent v1.0.0 for tenant: acme-corp

## Executive Summary
- 3 critical incidents requiring immediate attention
- 5 high priority items for today
- 87% capacity utilization
- No change freeze in effect

[... rest of plan ...]
```

### Prioritization Record (`pm/prioritizations/{date}.json`)
```json
{
  "date": "2025-10-31",
  "tenant": "acme-corp",
  "model": "RICE",
  "weights": {
    "reach": 1.0,
    "impact": 1.2,
    "confidence": 1.0,
    "effort": 1.0
  },
  "items_processed": 126,
  "items_by_priority": {
    "incidents": 3,
    "high": 12,
    "medium": 34,
    "low": 67,
    "deferred": 10
  },
  "execution_time_ms": 2341,
  "generated_at": "2025-10-31T14:23:45Z"
}
```

## Performance

**Target Execution Time:**
- < 5 seconds for < 100 items
- < 15 seconds for 100-500 items
- < 60 seconds for 500+ items

**Resource Usage:**
- Memory: < 512MB
- API calls: 1-3 (for scoring complex items)
- Disk I/O: Minimal (read configs, write reports)

## Monitoring

**Success Metrics:**
- Items scored per run
- Average score variance
- SLA compliance rate
- Change freeze violations
- Execution time

**Logs:**
```
logs/pm-agent.log
pm/audit/{date}.log
```

## Version History

- **1.0.0** (2025-10-31): Initial release
  - RICE/ICE scoring
  - SLA tracking
  - Change freeze support
  - Multi-tenant isolation

---

**Last Updated:** 2025-10-31
**Maintained By:** Autonom8 Core Team
**Support:** See [PM Agent Documentation](../../../docs/agents/pm-agent.md)
