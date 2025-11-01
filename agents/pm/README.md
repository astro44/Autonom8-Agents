# PM Agent Documentation

## Overview

The PM (Product Manager) Agent is an automated prioritization and planning system that scores, ranks, and schedules backlog items across tenants using RICE or ICE methodology.

## Quick Start

### Run PM for Active Tenant

```bash
bin/pm-run
```

### Run PM for All Tenants

```bash
bin/pm-run --all
```

### Run PM for Specific Tenant

```bash
bin/pm-run --tenant acme-corp
```

## Architecture

### File Locations

**Global Agent Definition:**
```
modules/Autonom8-Agents/.claude/agents/pm/pm-agent.md
```

**Global Policies:**
```
modules/Autonom8-Agents/policies/pm/prioritization.yaml
```

**Global Schemas:**
```
modules/Autonom8-Agents/schemas/pm/ticket-schema.json
modules/Autonom8-Agents/schemas/pm/prioritization-schema.json
```

**Tenant-Specific Override (Optional):**
```
tenants/<tenant>/context/overrides/Autonom8-Agents/.claude/agents/pm/pm-agent.md
```

**Tenant-Specific Policy:**
```
tenants/<tenant>/policies/pm/prioritization.yaml
```

### Resolution Rules

1. Check for tenant override agent → use if exists
2. Fall back to global agent
3. Load tenant policy if exists, else use global policy

## Workflow

### 1. Discovery Phase

Collects work items from:
- `tickets/inbox/*.json` - Raw findings from monitoring
- `tickets/triage/*.json` - Classified items
- `tickets/backlog/*.json` - Existing backlog

Loads configuration from:
- `policies/pm/prioritization.yaml` - Scoring model and weights
- `.env` - Tenant-specific variables

### 2. Scoring Phase

**RICE Model (Recommended):**
```
Score = (Reach × Impact × Confidence) / Effort

Reach:      Number of users/systems affected (1-1000+)
Impact:     Business impact (0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive)
Confidence: Certainty of estimates (0.0-1.0)
Effort:     Person-days required (0.5-100+)
```

**ICE Model:**
```
Score = (Impact + Confidence + Ease) / 3

All dimensions rated 1-10
```

Applies tenant-specific weights from policy file.

### 3. Classification Phase

Routes items based on score and criteria:

| Priority | Score Range | Destination |
|----------|-------------|-------------|
| Incidents | >= 200 or critical severity | `tickets/incidents/` |
| High | >= 75 | `tickets/backlog/high/` |
| Medium | 25-74 | `tickets/backlog/medium/` |
| Low | 5-24 | `tickets/backlog/low/` |
| Deferred | < 5 or blocked | `tickets/deferred/` |

### 4. Planning Phase

Generates daily execution plan considering:
- Team capacity
- SLA requirements
- Change freeze windows
- On-call rotation

### 5. Output Phase

Creates:
- **Daily Plan** → `reports/daily_plan.md`
- **Prioritization Record** → `pm/prioritizations/{date}.json`
- **Updated Backlog** → `tickets/backlog/{priority}/*.json`

## Configuration

### Scoring Model

Edit `policies/pm/prioritization.yaml`:

```yaml
model: RICE  # or ICE

weights:
  reach: 1.0
  impact: 1.2      # Emphasize business impact
  confidence: 1.0
  effort: 1.0
```

### SLA Targets

```yaml
slas:
  incident_hours: 2
  high_priority_hours: 24
  medium_priority_days: 7
  backlog_review_days: 30
```

### Change Freeze Windows

```yaml
calendars:
  change_freeze:
    - "2025-12-20..2026-01-05"  # Holiday freeze
    - "2025-11-28..2025-11-29"  # Thanksgiving
```

### Priority Thresholds

```yaml
thresholds:
  critical: 200
  high: 75
  medium: 25
  low: 5
  deferred: 0
```

## Tenant Customization

### Option 1: Policy Override Only (Recommended)

Create tenant-specific policy:

```bash
mkdir -p tenants/<tenant>/policies/pm
cp modules/Autonom8-Agents/policies/pm/prioritization.yaml \
   tenants/<tenant>/policies/pm/prioritization.yaml

# Edit tenant-specific weights and SLAs
vim tenants/<tenant>/policies/pm/prioritization.yaml
```

### Option 2: Full Agent Override (Advanced)

Create tenant-specific agent:

```bash
mkdir -p tenants/<tenant>/context/overrides/Autonom8-Agents/.claude/agents/pm
cp modules/Autonom8-Agents/.claude/agents/pm/pm-agent.md \
   tenants/<tenant>/context/overrides/Autonom8-Agents/.claude/agents/pm/pm-agent.md

# Customize workflow
vim tenants/<tenant>/context/overrides/Autonom8-Agents/.claude/agents/pm/pm-agent.md
```

## Node-RED Integration

### Import Enhanced Scheduler

```bash
# Import the multi-tenant PM scheduler
curl -s -X POST http://localhost:1880/flow \
  -H "Content-Type: application/json" \
  --data @flows/04-scheduler-enhanced.json
```

### Manual Triggers

In Node-RED UI:
1. Navigate to "04 - Scheduler (Multi-Tenant)" tab
2. Click inject button next to:
   - **PM Rotation Manual** - Run for all tenants
   - **PM Single Tenant** - Run for active tenant only

### Automated Schedule

The enhanced scheduler runs PM agent:
- **Hourly** for all active tenants (round-robin)
- Automatically switches between tenants
- Suspends tenants after processing
- Restores original active tenant when complete

## Command Reference

### pm-run

```bash
bin/pm-run [OPTIONS]

OPTIONS:
  -t, --tenant NAME    Run for specific tenant
  -a, --all           Run for all active tenants
  -m, --mode MODE     Agent mode: maintain|plan|report
  -d, --dry-run       Show what would be done
  -v, --verbose       Verbose output
  -h, --help          Show help
```

### Examples

```bash
# Run PM for active tenant
bin/pm-run

# Run PM for specific tenant
bin/pm-run --tenant acme-corp

# Run PM for all tenants
bin/pm-run --all

# Generate plan only (no scoring)
bin/pm-run --mode plan

# Generate metrics report only
bin/pm-run --mode report

# Dry run to see what would happen
bin/pm-run --all --dry-run

# Verbose output for debugging
bin/pm-run --verbose
```

## Output Files

### Daily Plan

Location: `reports/daily_plan.md`

```markdown
# Daily Plan - 2025-10-31

## Immediate Action Required (SLA < 2h)
- [INC-001] Critical: Production database outage

## Today's Focus (Top 5)
1. [FEAT-123] User authentication (RICE: 145.2)
2. [BUG-456] Payment processing bug (RICE: 98.5)
...
```

### Prioritization Record

Location: `pm/prioritizations/2025-10-31.json`

```json
{
  "date": "2025-10-31",
  "tenant": "acme-corp",
  "model": "RICE",
  "items_processed": 126,
  "items_by_priority": {
    "incidents": 3,
    "high": 12,
    "medium": 34,
    "low": 67,
    "deferred": 10
  }
}
```

## Ticket Schema

Tickets must conform to the schema in `schemas/pm/ticket-schema.json`:

```json
{
  "id": "FEAT-123",
  "title": "Add dark mode",
  "type": "feature",
  "severity": "medium",
  "reach": 1000,
  "impact": 0.5,
  "confidence": 0.8,
  "effort": 5,
  "created_at": "2025-10-31T10:00:00Z"
}
```

## Troubleshooting

### PM Agent Not Found

```bash
# Check global agent exists
ls -la modules/Autonom8-Agents/.claude/agents/pm/pm-agent.md

# Check tenant override exists (if using)
ls -la tenants/<tenant>/context/overrides/Autonom8-Agents/.claude/agents/pm/
```

### Policy Not Found

```bash
# Copy global policy to tenant
mkdir -p tenants/<tenant>/policies/pm
cp modules/Autonom8-Agents/policies/pm/prioritization.yaml \
   tenants/<tenant>/policies/pm/
```

### No Items Processed

```bash
# Check for tickets in inbox/triage
ls -la work/tickets/inbox/*.json
ls -la work/tickets/triage/*.json

# Create test ticket
echo '{
  "id": "TEST-001",
  "title": "Test ticket",
  "type": "feature",
  "reach": 100,
  "impact": 1.0,
  "confidence": 0.8,
  "effort": 2
}' > work/tickets/inbox/test-001.json

# Run PM
bin/pm-run
```

### Change Freeze Blocking All Work

```bash
# Check current freeze status
grep -A5 change_freeze tenants/<tenant>/policies/pm/prioritization.yaml

# Temporarily disable (edit policy)
# OR mark items as exceptions
```

## Performance

**Target Execution Time:**
- < 5 seconds for < 100 items
- < 15 seconds for 100-500 items
- < 60 seconds for 500+ items

**Resource Usage:**
- Memory: < 512MB
- API calls: 1-3 per complex item
- Disk I/O: Minimal

## Best Practices

1. **Start with Global Policy**
   - Use default RICE weights initially
   - Adjust based on tenant feedback

2. **Monitor SLA Breaches**
   - Review `pm/prioritizations/*.json` for SLA violations
   - Adjust thresholds if too many escalations

3. **Tune Weights Iteratively**
   - Track velocity and actual impact
   - Adjust weights quarterly

4. **Use Tenant Overrides Sparingly**
   - Prefer policy overrides over full agent overrides
   - Keep workflows consistent across tenants

5. **Regular Backlog Grooming**
   - Review deferred items monthly
   - Update effort estimates quarterly

## Version History

- **1.0.0** (2025-10-31): Initial release
  - RICE/ICE scoring
  - SLA tracking
  - Change freeze support
  - Multi-tenant isolation
  - Node-RED integration

## Support

- Agent Definition: `modules/Autonom8-Agents/.claude/agents/pm/pm-agent.md`
- Issues: https://github.com/astro44/Autonom8-Agents/issues
- Documentation: https://docs.autonom8.dev/agents/pm-agent
