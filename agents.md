# Autonom8 Agent Manifest (canonical)

This is the single source of truth for all agent definitions in the Autonom8 suite.

## Agent Lookup Order

When a CLI wrapper (claude.sh, gemini.sh, codex.sh, opencode.sh) looks for an agent:

1. **Provider overrides** (`.provider/overrides/agent-name.md`) - Provider-specific implementations
2. **Shared definitions** (`agents/agent-name.md`) - Canonical agent specs

## Core Agents

All agents listed here are available to all providers unless overridden.

| Agent ID | Location | Description | Status |
|----------|----------|-------------|--------|
| pm-agent | `agents/pm/pm-agent.md` | Product Manager - RICE/ICE scoring and prioritization | ✅ Active |
| bug-miner | `agents/improvement/bug-miner.md` | Mines bugs and issues from logs/tickets/metrics | ✅ Active |
| flow-synthesizer | `agents/improvement/flow-synthesizer.md` | Creates/modifies Node-RED flows | ✅ Active |
| doc-fixer | `agents/improvement/doc-fixer.md` | Updates and corrects documentation | ✅ Active |
| prompt-tuner | `agents/improvement/prompt-tuner.md` | Optimizes prompts for cost/quality/latency | ✅ Active |
| metrics-agent | `agents/improvement/metrics-agent.md` | Tracks metrics, SLOs, and costs | ✅ Active |
| smoke-test-agent | `agents/qa/smoke-test-agent.md` | Fast smoke tests for critical paths | ✅ Active |
| regression-test-agent | `agents/qa/regression-test-agent.md` | Comprehensive regression testing | ✅ Active |
| curious-qa-agent | `agents/qa/curious-qa-agent.md` | Exploratory testing - finds unexpected bugs | ✅ Active |
| devops-agent | `agents/devops/devops-agent.md` | Infrastructure, deployment, monitoring, incident response, RCA | ✅ Active |
| monitor-agent | `agents/core/monitor-agent.md` | Observes systems and pipelines | 📋 Planned |
| analyst-agent | `agents/core/analyst-agent.md` | Triages events and performs root-cause analysis | 📋 Planned |
| reviewer-agent | `agents/core/reviewer-agent.md` | Validates fixes and ensures policy compliance | 📋 Planned |
| fixer-agent | `agents/core/fixer-agent.md` | Applies approved patches and remediations | 📋 Planned |

## Provider-Specific Overrides

### Claude (.claude/overrides/)
- `brutal-critic-agent.md` - Aggressive code critic
- `framework-counter-agent.md` - Framework complexity analyzer
- `miner-executer.md` - Mining and execution specialist

### Gemini (.gemini/overrides/)
- `doc-summarizer-agent.md` - Documentation summarization
- `test-generator-agent.md` - Test case generation
- `validator-agent.md` - Data validation specialist

### Codex (.codex/overrides/)
- `api-builder-agent.md` - API endpoint generation
- `code-generator-agent.md` - Code scaffolding
- `refactor-agent.md` - Code refactoring specialist
- `po-pm-agent.md` - Product Owner/PM - User stories and sprint planning

### OpenCode (.opencode/overrides/)
- `diff-analyzer-agent.md` - Diff analysis and review
- `pr-drafter-agent.md` - Pull request drafting
- `quick-fix-agent.md` - Fast bug fixes

## Usage

Wrappers automatically resolve agents using this priority:
```bash
# Example: claude.sh run pm-agent
# 1. Check: .claude/overrides/pm-agent.md (not found)
# 2. Check: agents/pm/pm-agent.md (found ✅)
# Result: Use canonical definition

# Example: claude.sh run brutal-critic-agent
# 1. Check: .claude/overrides/brutal-critic-agent.md (found ✅)
# Result: Use Claude-specific override
```

## Adding New Agents

**Shared agents** (all providers):
```bash
# Create in canonical location
vim agents/new-agent.md
# Available to all providers immediately
```

**Provider-specific agents**:
```bash
# Create in provider overrides
vim .claude/overrides/special-agent.md
# Only available to Claude wrapper
```

## Manifest Files

Each provider has a manifest symlink that points to this canonical file:
- `.claude/claude.md` → `../agents.md`
- `.gemini/gemini.md` → `../agents.md`
- `.codex/codex.md` → `../agents.md`
- `.opencode/opencode.md` → `../agents.md`

---

**Last Updated:** 2025-10-31
**Maintainer:** Autonom8 Core Team
