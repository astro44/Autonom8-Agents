# Gemini Provider Overrides

This directory contains Gemini-specific agent implementations that override canonical shared agents.

## Purpose

Provider overrides allow Gemini to have specialized agent implementations that differ from the shared canonical definitions in `agents/`.

## Lookup Order

When `gemini.sh run <agent-id>` is invoked:

1. **First check**: `.gemini/overrides/<agent-id>.md` (provider-specific)
2. **Fallback**: `agents/**/<agent-id>.md` (canonical shared)

### Example

```bash
# Running devops-agent
gemini.sh run devops-agent

# Lookup:
# 1. Check: .gemini/overrides/devops-agent.md → NOT FOUND
# 2. Use: agents/devops/devops-agent.md → FOUND ✅
```

```bash
# Running doc-summarizer-agent
gemini.sh run doc-summarizer-agent

# Lookup:
# 1. Check: .gemini/overrides/doc-summarizer-agent.md → FOUND ✅
# 2. (No fallback needed - override found)
```

## Current Overrides

- `doc-summarizer-agent.md` - Documentation summarization
- `test-generator-agent.md` - Test case generation
- `validator-agent.md` - Data validation specialist

## Adding New Overrides

To create a Gemini-specific agent:

1. Create `.gemini/overrides/your-agent.md`
2. Follow the agent specification format (see `agents.md`)
3. The override will automatically take precedence over any shared agent with the same ID

## Removing Overrides

To use the canonical shared version instead:

1. Delete the override file from `.gemini/overrides/`
2. The wrapper will automatically fall back to `agents/**/<agent-id>.md`
