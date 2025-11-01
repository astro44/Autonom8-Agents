# Codex Provider Overrides

This directory contains Codex-specific agent implementations that override canonical shared agents.

## Purpose

Provider overrides allow Codex to have specialized agent implementations that differ from the shared canonical definitions in `agents/`.

## Lookup Order

When `codex.sh run <agent-id>` is invoked:

1. **First check**: `.codex/overrides/<agent-id>.md` (provider-specific)
2. **Fallback**: `agents/**/<agent-id>.md` (canonical shared)

### Example

```bash
# Running smoke-test-agent
codex.sh run smoke-test-agent

# Lookup:
# 1. Check: .codex/overrides/smoke-test-agent.md → NOT FOUND
# 2. Use: agents/qa/smoke-test-agent.md → FOUND ✅
```

```bash
# Running po-pm-agent
codex.sh run po-pm-agent

# Lookup:
# 1. Check: .codex/overrides/po-pm-agent.md → FOUND ✅
# 2. (No fallback needed - override found)
```

## Current Overrides

- `api-builder-agent.md` - API endpoint generation
- `code-generator-agent.md` - Code scaffolding
- `po-pm-agent.md` - Product Owner/PM - User stories and sprint planning
- `refactor-agent.md` - Code refactoring specialist

## Adding New Overrides

To create a Codex-specific agent:

1. Create `.codex/overrides/your-agent.md`
2. Follow the agent specification format (see `agents.md`)
3. The override will automatically take precedence over any shared agent with the same ID

## Removing Overrides

To use the canonical shared version instead:

1. Delete the override file from `.codex/overrides/`
2. The wrapper will automatically fall back to `agents/**/<agent-id>.md`
