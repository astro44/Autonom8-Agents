# Claude Provider Overrides

This directory contains Claude-specific agent implementations that override canonical shared agents.

## Purpose

Provider overrides allow Claude to have specialized agent implementations that differ from the shared canonical definitions in `agents/`.

## Lookup Order

When `claude.sh run <agent-id>` is invoked:

1. **First check**: `.claude/overrides/<agent-id>.md` (provider-specific)
2. **Fallback**: `agents/**/<agent-id>.md` (canonical shared)

### Example

```bash
# Running pm-agent
claude.sh run pm-agent

# Lookup:
# 1. Check: .claude/overrides/pm-agent.md → NOT FOUND
# 2. Use: agents/pm/pm-agent.md → FOUND ✅
```

```bash
# Running brutal-critic-agent
claude.sh run brutal-critic-agent

# Lookup:
# 1. Check: .claude/overrides/brutal-critic-agent.md → FOUND ✅
# 2. (No fallback needed - override found)
```

## Current Overrides

- `brutal-critic-agent.md` - Aggressive code critic
- `framework-counter-agent.md` - Framework complexity analyzer
- `miner-executer.md` - Mining and execution specialist

## Adding New Overrides

To create a Claude-specific agent:

1. Create `.claude/overrides/your-agent.md`
2. Follow the agent specification format (see `agents.md`)
3. The override will automatically take precedence over any shared agent with the same ID

## Removing Overrides

To use the canonical shared version instead:

1. Delete the override file from `.claude/overrides/`
2. The wrapper will automatically fall back to `agents/**/<agent-id>.md`
