# Autonom8-Agents Directory Structure

This document provides a visual overview of all agent definitions in the Autonom8-Agents module.

## Tree View

```
.
├── .claude
│   ├── overrides
│   │   ├── brutal-critic-agent.md
│   │   ├── framework-counter-agent.md
│   │   └── miner-executer.md
│   └── claude.md -> ../agents.md
├── .codex
│   ├── overrides
│   │   ├── api-builder-agent.md
│   │   ├── code-generator-agent.md
│   │   ├── po-pm-agent.md
│   │   └── refactor-agent.md
│   └── codex.md -> ../agents.md
├── .gemini
│   ├── overrides
│   │   ├── doc-summarizer-agent.md
│   │   ├── test-generator-agent.md
│   │   └── validator-agent.md
│   └── gemini.md -> ../agents.md
├── .opencode
│   ├── overrides
│   │   ├── diff-analyzer-agent.md
│   │   ├── pr-drafter-agent.md
│   │   └── quick-fix-agent.md
│   └── opencode.md -> ../agents.md
├── agents
│   ├── devops
│   │   └── devops-agent.md
│   ├── improvement
│   │   ├── bug-miner.md
│   │   ├── doc-fixer.md
│   │   ├── flow-synthesizer.md
│   │   ├── metrics-agent.md
│   │   └── prompt-tuner.md
│   ├── pm
│   │   ├── pm-agent.md
│   │   └── README.md
│   └── qa
│       ├── curious-qa-agent.md
│       ├── regression-test-agent.md
│       └── smoke-test-agent.md
├── policies
│   └── pm
│       └── prioritization.yaml
├── schemas
│   └── pm
│       ├── prioritization-schema.json
│       └── ticket-schema.json
├── .gitignore
├── agent-index.json
├── agents.md
├── manifest.yaml
└── README.md

18 directories, 36 files
```

## Summary

### Canonical Agents (Shared Across All Providers)

**Total: 10 agents**

#### DevOps (1 agent)
- `agents/devops/devops-agent.md` - Infrastructure, deployment, monitoring, incident response, RCA

#### Improvement (5 agents)
- `agents/improvement/bug-miner.md` - Detects and classifies bugs from logs and evals
- `agents/improvement/doc-fixer.md` - Updates and corrects documentation
- `agents/improvement/flow-synthesizer.md` - Creates/modifies Node-RED flows
- `agents/improvement/metrics-agent.md` - Tracks metrics, SLOs, and costs
- `agents/improvement/prompt-tuner.md` - Optimizes prompts for cost/quality/latency

#### PM (1 agent)
- `agents/pm/pm-agent.md` - Product Manager with RICE/ICE scoring and prioritization

#### QA (3 agents)
- `agents/qa/curious-qa-agent.md` - Exploratory testing - finds unexpected bugs
- `agents/qa/regression-test-agent.md` - Comprehensive regression testing
- `agents/qa/smoke-test-agent.md` - Fast smoke tests for critical paths

### Provider-Specific Overrides

**Total: 13 agents**

#### Claude (.claude/overrides/) - 3 agents
- `brutal-critic-agent.md` - Aggressive code critic
- `framework-counter-agent.md` - Framework complexity analyzer
- `miner-executer.md` - Mining and execution specialist

#### Gemini (.gemini/overrides/) - 3 agents
- `doc-summarizer-agent.md` - Documentation summarization
- `test-generator-agent.md` - Test case generation
- `validator-agent.md` - Data validation specialist

#### Codex (.codex/overrides/) - 4 agents
- `api-builder-agent.md` - API endpoint generation
- `code-generator-agent.md` - Code scaffolding
- `po-pm-agent.md` - Product Owner/PM - User stories and sprint planning
- `refactor-agent.md` - Code refactoring specialist

#### OpenCode (.opencode/overrides/) - 3 agents
- `diff-analyzer-agent.md` - Diff analysis and review
- `pr-drafter-agent.md` - Pull request drafting
- `quick-fix-agent.md` - Fast bug fixes

### Provider Manifests (Symlinks)

Each provider has a manifest that symlinks to the canonical `agents.md`:

- `.claude/claude.md` → `../agents.md`
- `.gemini/gemini.md` → `../agents.md`
- `.codex/codex.md` → `../agents.md`
- `.opencode/opencode.md` → `../agents.md`

## Agent Lookup Order

When a CLI wrapper (e.g., `claude.sh`, `gemini.sh`, `codex.sh`, `opencode.sh`) runs an agent:

1. **Check provider overrides first**: `.{provider}/overrides/{agent-name}.md`
2. **Fallback to canonical**: `agents/{category}/{agent-name}.md`

### Examples

**Example 1: Shared agent**
```bash
claude.sh run devops-agent
```
1. Check: `.claude/overrides/devops-agent.md` ❌ Not found
2. Fallback: `agents/devops/devops-agent.md` ✅ Found!
→ Uses canonical shared definition

**Example 2: Provider-specific override**
```bash
codex.sh run po-pm-agent
```
1. Check: `.codex/overrides/po-pm-agent.md` ✅ Found!
→ Uses Codex-specific override

**Example 3: Another shared agent**
```bash
gemini.sh run smoke-test-agent
```
1. Check: `.gemini/overrides/smoke-test-agent.md` ❌ Not found
2. Fallback: `agents/qa/smoke-test-agent.md` ✅ Found!
→ Uses canonical shared definition

## Statistics

| Category | Count |
|----------|-------|
| **Canonical Agents (Shared)** | 10 |
| **Provider Overrides** | 13 |
| **Total Agent Definitions** | 23 |
| **Provider Manifests** | 4 |
| **Total Directories** | 18 |
| **Total Files** | 36 |

## Benefits of This Structure

✅ **Single source of truth** - `agents.md` is the canonical manifest
✅ **No duplication** - Shared agents defined once, used everywhere
✅ **Provider flexibility** - Overrides allow provider-specific customizations
✅ **Easy discovery** - All agents listed in one place
✅ **Automatic propagation** - Updates to `agents/` affect all providers
✅ **Clean organization** - Agents grouped by category (devops, improvement, pm, qa)

## Last Updated

**Date:** 2025-10-31
**Git Commit:** 31c710c
**Repository:** github.com:astro44/Autonom8-Agents.git
