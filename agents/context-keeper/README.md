# Context Keeper Agent Module

This module contains the definitions and logic for the **Context Keeper** and **Context Refresher** agents, which are responsible for maintaining technical documentation state across projects.

## Agent Definitions

- `context-keeper-agent.md`: Primary definition file containing all personas and prompts.

## Roles & Personas

### 1. Context Keeper (Incremental Maintenance)
Optimized for fast, frequent updates triggered by developer activity.

- **Maintainer (`context-keeper-claude`)**: Primary role for analyzing code diffs and patching `CONTEXT.md`.
- **Archivist (`context-keeper-codex`)**: Specialized for initial legacy codebase scanning.
- **Updater (`context-keeper-gemini`)**: Alternative role for continuous synchronization.
- **Auditor (`context-keeper-opencode`)**: Reviewer role for validating context changes.

### 2. Context Refresher (Deep Audit)
Optimized for periodic, deep-scan "truth" resets to fix documentation drift.

- **Refresher (`context-refresher-*`)**: Scans the *entire* file tree (not just diffs) to rebuild `CONTEXT.md` from scratch.

## Standard Template

The agents enforce a standard structure for project context using `templates/CONTEXT_TEMPLATE.md`.

**Location:** `modules/Autonom8-Agents/templates/CONTEXT_TEMPLATE.md`

**Structure:**
1.  **System Architecture**: High-level patterns, components, and tech stack.
2.  **Data Models**: Key entities and database schema summary.
3.  **API & Interfaces**: Endpoints, conventions, and contracts.
4.  **Coding Standards**: Error handling, logging, and testing patterns.
5.  **Current State**: Technical debt and hard constraints.

**How it's Used:**
- **Initialization**: When the `Archivist` runs on a new project, it uses this template as the target schema to fill.
- **Refresher**: When the `Refresher` rebuilds context, it aligns the output to match this structure strictly.
- **Maintenance**: The `Maintainer` respects these headers when injecting updates, ensuring the file doesn't devolve into unstructured notes.

## Directory Structure

```
context-keeper/
├── context-keeper-agent.md    # The source of truth for all prompts
├── context-keeper-agent.sh    # (Coming Soon) CLI wrapper script
└── README.md                  # This file
```

## Usage

These agents are typically invoked by the Autonom8 Orchestrator (Go worker) in two scenarios:

1.  **Post-Merge Trigger**:
    ```bash
    # Orchestrator detects a PR merge -> calls Keeper
    ./bin/context-keeper-claude.sh --role maintainer --task update_context ...
    ```

2.  **Scheduled Audit (Weekly)**:
    ```bash
    # Cron job triggers a deep refresh
    ./bin/context-refresher-claude.sh --role refresher --task refresh_context ...
    ```

## Integration

The output of these agents is typically a JSON object containing the updated markdown content for `CONTEXT.md`. The orchestrator is responsible for writing this content to the actual file system.

