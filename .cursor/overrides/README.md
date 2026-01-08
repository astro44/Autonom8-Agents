# Cursor Provider Overrides

This directory contains Cursor-specific agent implementations that override canonical shared agents.

## Purpose

Provider overrides allow Cursor to have specialized agent implementations that differ from the shared canonical definitions in `agents/`.

## Lookup Order

When `cursor.sh run <agent-id>` is invoked:

1. **First check**: `.cursor/overrides/<agent-id>.md` (provider-specific)
2. **Fallback**: `agents/**/<agent-id>.md` (canonical shared)

### Example

```bash
# Running regression-test-agent
cursor.sh run regression-test-agent

# Lookup:
# 1. Check: .cursor/overrides/regression-test-agent.md → NOT FOUND
# 2. Use: agents/qa/regression-test-agent.md → FOUND ✅
```

```bash
# Running diff-analyzer-agent
cursor.sh run diff-analyzer-agent

# Lookup:
# 1. Check: .cursor/overrides/diff-analyzer-agent.md → FOUND ✅
# 2. (No fallback needed - override found)
```

## Current Overrides

- `diff-analyzer-agent.md` - Diff analysis and review
- `pr-drafter-agent.md` - Pull request drafting
- `quick-fix-agent.md` - Fast bug fixes

## Adding New Overrides

To create a Cursor-specific agent:

1. Create `.cursor/overrides/your-agent.md`
2. Follow the agent specification format (see `agents.md`)
3. The override will automatically take precedence over any shared agent with the same ID

## Removing Overrides

To use the canonical shared version instead:

1. Delete the override file from `.cursor/overrides/`
2. The wrapper will automatically fall back to `agents/**/<agent-id>.md`
