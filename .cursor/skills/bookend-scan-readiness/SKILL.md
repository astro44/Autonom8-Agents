---
name: bookend-scan-readiness
description: Fast filesystem readiness scan — counts docs, source files, manifests, platform signals. Produces initial ReadinessReport for agent spawning decisions.
---

# bookend-scan-readiness - Documentation Readiness Scan

Fast pre-filter that evaluates project documentation readiness via filesystem analysis. Its output determines which bookend agents to spawn.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "platform": "web|go|flutter|ios|python|rust",
  "bookends_dir": "/path/to/go-autonom8"
}
```

## Instructions

### 1. Load Configuration

Read `sprint_bookends.yaml` from bookends_dir. If missing, use defaults:
- documentation.threshold: 60
- complexity.medium_at: 30
- complexity.complex_at: 55
- complexity.very_complex_at: 80
- complexity.max_agents: 5

### 2. Scan Project

Walk the project directory and count:
- Source files (by extension)
- Documentation files (.md, .rst, .adoc)
- Manifest files (package.json, go.mod, pubspec.yaml, etc.)
- Config files (project.yaml, autonom8.yaml)
- docs/ directory presence

Check for required artifacts from sprint_bookends.yaml:
- README.md
- CATALOG.md
- ARCHITECTURE.md

### 3. Score Readiness

Apply weights from sprint_bookends.yaml (or defaults):
- README: 20
- CATALOG: 20
- ARCHITECTURE: 15
- docs/ directory: 15
- Project config: 10
- Platform manifest: 10
- Doc file count bonus: 10

### 4. Classify Project Type

- Greenfield: no source files, no manifests
- Existing: source files > 0 or manifests > 0
- Unknown: non-source files only (e.g., .env.example)

## Output Format

```json
{
  "skill": "bookend-scan-readiness",
  "status": "success",
  "project_type": "existing",
  "readiness_score": 85,
  "documentation_ok": true,
  "missing_artifacts": ["ARCHITECTURE"],
  "source_file_count": 148,
  "doc_file_count": 44,
  "recommended_action": "continue_to_complexity_scoring",
  "agents_to_spawn": ["dependency-graph-agent", "contract-scanner-agent"]
}
```

## Agent Spawning Logic

Based on readiness score and source file count, recommend which bookend agents to spawn:

| Condition | Agents |
|-----------|--------|
| readiness < threshold | cartography-agent (always) |
| source_files > 20 | dependency-graph-agent |
| source_files > 30 | contract-scanner-agent |
| source_files > 0 | quality-audit-agent (if complexity >= medium) |
| source_files > 50 AND .git exists | risk-assessment-agent |

## Token Efficiency

- Pure filesystem scan, no LLM calls
- 1-3 second execution
- Returns structured JSON for orchestrator consumption
