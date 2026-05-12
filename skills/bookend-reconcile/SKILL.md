---
name: bookend-reconcile
description: Merges bookend agent reports into revised readiness, complexity, and decomposition plan. Produces the final evidence-backed assessment consumed by sprint-architect-agent.
---

# bookend-reconcile - Agent Report Reconciliation

Merges structured outputs from bookend agents into a single assessment. Revises the initial heuristic scores with evidence-backed data and produces the final DecompositionPlan.

## Input Schema

```json
{
  "reports_dir": "/path/to/reports/bookend",
  "original_readiness": {},
  "original_complexity": {},
  "bookends_dir": "/path/to/go-autonom8"
}
```

## Instructions

### 1. Collect Available Reports

Read all JSON files from reports_dir:
- cartography.json
- dependency-graph.json
- contracts.json
- quality-audit.json
- risk-assessment.json

Not all will exist — only agents that were spawned produce reports.

### 2. Revise Readiness

Starting from original_readiness.score:
- If cartography created artifacts: add their weight to score
- If quality-audit shows coverage data: adjust type_coverage and test_proxy
- Recalculate documentation_ok against threshold

### 3. Revise Complexity

For each dimension with agent evidence, replace heuristic score:
- dependency_depth <- dependency-graph-agent.complexity_contribution
- integration_density <- contract-scanner-agent.complexity_contribution
- historical_churn <- risk-assessment-agent.complexity_contribution
- type_coverage <- quality-audit-agent.complexity_contribution
- test_proxy <- quality-audit-agent.complexity_contribution

Recompute total, reclassify tier.

### 4. Aggregate Risk Factors

Collect all risk_factors from agent reports:
- Deduplicate
- Rank: critical > high > medium > low
- Cap at 10 most significant

### 5. Produce Decomposition Plan

Map revised tier to agent configuration.
Generate architect_guidance from top risk factors.
Generate challenger_questions from shared contracts and circular deps.

## Output Format

```json
{
  "skill": "bookend-reconcile",
  "status": "success",
  "reconciled_readiness": {
    "original_score": 85,
    "revised_score": 78,
    "documentation_ok": true,
    "agents_contributed": ["quality-audit-agent", "cartography-agent"]
  },
  "reconciled_complexity": {
    "original_score": 64,
    "revised_score": 72,
    "original_tier": "complex",
    "revised_tier": "complex",
    "dimension_revisions": []
  },
  "decomposition_plan": {
    "tier": "complex",
    "suggested_agents": 3,
    "requires_cartography": false,
    "risk_summary": "...",
    "architect_guidance": [],
    "challenger_questions": []
  }
}
```

## Decision Logic

```
All agent reports missing?
    → Return original scores unchanged, flag "no_agent_evidence"

Only cartography ran?
    → Revise readiness only, keep complexity unchanged

Multiple agents ran?
    → Full reconciliation with dimension replacement
```

## Token Efficiency

- Reads JSON reports only, no filesystem scanning
- Sub-second execution
- Deterministic merge logic
