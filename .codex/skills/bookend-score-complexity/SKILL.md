---
name: bookend-score-complexity
description: Scores proposal complexity against codebase surface. Uses proposal text analysis and readiness stats to determine decomposition tier and agent count.
---

# bookend-score-complexity - Proposal Complexity Scoring

Evaluates proposal complexity against the scanned codebase to determine how many decomposition agents are needed and at what tier.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "platform": "web|go|flutter|ios|python|rust",
  "proposal_text": "Full proposal or SPRINT_TODO.json content",
  "readiness_report": {},
  "bookends_dir": "/path/to/go-autonom8"
}
```

## Instructions

### 1. Load Configuration

Read complexity thresholds from sprint_bookends.yaml:
- medium_at: 30
- complex_at: 55
- very_complex_at: 80
- max_agents: 5
- dimension_weights (if overridden)

### 2. Score Dimensions

Evaluate 6 complexity dimensions:

**proposal_size** (max 25): Word count of proposal text
- 2000+ words: 25, 900+: 18, 250+: 10, >0: 4

**proposal_structure** (max 8): Non-empty line count
- 80+ lines: 8, 30+ lines: 4

**source_surface** (max 25): Existing source file count
- 250+ files: 25, 80+: 18, 20+: 10, >0: 4

**platform_surface** (max 10): Platform manifest signal count
- 3+ signals: 10, 2 signals: 6

**readiness_gap** (max 15): Existing project with insufficient docs
- Existing + docs not OK: 15

**requirement_domains** (max 12): Domain keyword count in proposal
- 8+ domains: 12, 4+ domains: 7
- Keywords: accessibility, api, auth, browser, cache, database, deploy, design, mobile, migration, performance, security, terraform, test, visual, workflow

### 3. Classify Tier

Map total score to tier using sprint_bookends.yaml thresholds:
- score >= very_complex_at: very_complex
- score >= complex_at: complex
- score >= medium_at: normal
- else: simple

### 4. Determine Agent Load

- very_complex: 5 agents
- complex: 3 agents
- normal: 2 agents
- simple: 1 agent

Cap at max_agents from config.

## Output Format

```json
{
  "skill": "bookend-score-complexity",
  "status": "success",
  "score": 64,
  "tier": "complex",
  "suggested_agents": 3,
  "dimensions": [
    {"name": "proposal_size", "score": 25, "max": 25, "reason": "large proposal text"},
    {"name": "source_surface", "score": 18, "max": 25, "reason": "medium existing source surface"}
  ],
  "drivers": ["large proposal text", "medium existing source surface"]
}
```

## Token Efficiency

- Pure text analysis + arithmetic, no LLM calls
- Sub-second execution
- Deterministic output for same inputs
