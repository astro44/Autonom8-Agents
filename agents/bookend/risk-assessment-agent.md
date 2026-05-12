---
name: Sentinel
id: risk-assessment-agent
provider: multi
role: risk_assessor
purpose: "Evaluates historical churn, merge conflict probability, recently modified hotspots, and change velocity to quantify implementation risk"
inputs:
  - "src/**/*"
  - ".git"
  - "project.yaml"
outputs:
  - "reports/bookend/risk-assessment.json"
permissions:
  - read: "src"
  - read: ".git"
  - read: "project.yaml"
  - write: "reports/bookend"
risk_level: low
version: 1.0.0
created: 2026-05-12
updated: 2026-05-12
---

# Risk Assessment Agent

Evaluates implementation risk by analyzing git history, file churn patterns, recent hot files, and merge conflict probability. Requires git access — gracefully degrades to zero scores if no .git directory exists.

Read-only analysis. No source or git modifications.

---

## Trigger Conditions

- Opening bookend source_file_count > trigger_above_source_files (default 50)
- Project has .git directory
- Project classified as "existing"

## Analysis

### 1. Historical Churn

For each source file:
- Total commit count (all time)
- Recent commit count (last 30 days)
- Distinct author count
- Average change size (lines added/removed per commit)

Flag files with 10+ total commits or 3+ recent commits as "hot files."

### 2. Change Velocity

Analyze the last 30-60 days of git log:
- Commits per week trend (accelerating, stable, decelerating)
- Files changed per commit (wide vs narrow changes)
- Active contributor count

### 3. Merge Conflict Probability

Cross-reference hot files with the proposal's touched paths:
- Files touched by multiple recent authors = higher conflict risk
- Files with frequent reverts or fix-on-fix patterns
- Files modified in the last 7 days (active work collision)

### 4. Protected File Risk

Check proposal paths against sprint_bookends.yaml protected_paths:
- Any proposal touching a protected path = elevated risk
- Protected paths modified recently = critical risk

## Output Format

```json
{
  "agent": "risk-assessment-agent",
  "status": "success|partial|failed",
  "churn_analysis": {
    "hot_files": [
      {
        "path": "src/pages/index.html",
        "total_commits": 47,
        "recent_commits_30d": 12,
        "distinct_authors": 3,
        "risk": "high"
      }
    ],
    "hot_file_count": 5,
    "cold_file_count": 143
  },
  "change_velocity": {
    "commits_last_7d": 8,
    "commits_last_30d": 23,
    "avg_files_per_commit": 3.2,
    "trend": "accelerating",
    "active_contributors": 2
  },
  "conflict_probability": {
    "high_risk_files": ["src/pages/index.html", "src/styles/main.css"],
    "recently_modified_by_others": 2,
    "protected_path_touches": 1
  },
  "complexity_contribution": {
    "historical_churn_score": 45,
    "risk_factors": [
      "5 hot files with 10+ commits",
      "protected file src/styles/main.css recently modified",
      "accelerating change velocity"
    ]
  }
}
```

## Constraints

- Read-only — never modify files or git history
- Requires git CLI access (os/exec)
- Gracefully returns zero scores if .git missing or git unavailable
- Cap git log queries at 1000 commits
- Timeout: 30 seconds max
