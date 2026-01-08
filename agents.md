# Autonom8 Agent Manifest (canonical)

This is the single source of truth for all agent definitions in the Autonom8 suite.

## Agent Lookup Order

When a CLI wrapper (claude.sh, gemini.sh, codex.sh, opencode.sh, cursor.sh) looks for an agent:

1. **Provider overrides** (`.provider/overrides/agent-name.md`) - Provider-specific implementations
2. **Shared definitions** (`agents/agent-name.md`) - Canonical agent specs

## Core Agents

All agents listed here are available to all providers unless overridden.

| Agent ID | Location | Description | Status |
|----------|----------|-------------|--------|
| pm-agent | `agents/pm/pm-agent.md` | Product Manager - RICE/ICE scoring and prioritization | ✅ Active |
| po-agent | `agents/po/po-agent.md` | Product Owner - User stories, acceptance criteria, sprint planning | ✅ Active |
| security-agent | `agents/security/security-agent.md` | Security reviews, vulnerability scanning, compliance validation | ✅ Active |
| data-agent | `agents/data/data-agent.md` | Analytics, ETL pipelines, dashboards, metrics reporting | ✅ Active |
| ui-agent | `agents/ui/ui-agent.md` | UI/UX design and implementation - Flutter, React, responsive design | ✅ Active |
| design-strategist-agent | `agents/ux/design-strategist-agent.md` | Proactive UX architecture at inception - shapes design BEFORE implementation (UI platforms only) | ✅ Active |
| bug-miner | `agents/improvement/bug-miner.md` | Mines bugs and issues from logs/tickets/metrics | ✅ Active |
| flow-synthesizer | `agents/improvement/flow-synthesizer.md` | Creates/modifies Node-RED flows | ✅ Active |
| doc-fixer | `agents/improvement/doc-fixer.md` | Updates and corrects documentation | ✅ Active |
| prompt-tuner | `agents/improvement/prompt-tuner.md` | Optimizes prompts for cost/quality/latency | ✅ Active |
| metrics-agent | `agents/improvement/metrics-agent.md` | Tracks metrics, SLOs, and costs | ✅ Active |
| smoke-test-agent | `agents/qa/smoke-test-agent.md` | Fast smoke tests for critical paths | ✅ Active |
| regression-test-agent | `agents/qa/regression-test-agent.md` | Comprehensive regression testing | ✅ Active |
| curious-qa-agent | `agents/qa/curious-qa-agent.md` | Exploratory testing - finds unexpected bugs | ✅ Active |
| integration-qa-agent | `agents/qa/integration-qa-agent.md` | Browser integration testing - catches 404s, console errors | ✅ Active |
| visual-qa-agent | `agents/qa/visual-qa-agent.md` | Visual QA base agent - tech-agnostic principles | ✅ Active |
| visual-qa-web-agent | `agents/qa/visual-qa-web-agent.md` | Visual QA for HTML/CSS/JS - Playwright, DOM validation | ✅ Active |
| visual-qa-flutter-agent | `agents/qa/visual-qa-flutter-agent.md` | Visual QA for Flutter - golden_toolkit snapshot testing | ✅ Active |
| visual-qa-ios-agent | `agents/qa/visual-qa-ios-agent.md` | Visual QA for iOS - swift-snapshot-testing | ✅ Active |
| backend-qa-agent | `agents/qa/backend-qa-agent.md` | Backend QA for Lambda, Docker, gRPC - unit/integration testing | ✅ Active |
| data-qa-agent | `agents/qa/data-qa-agent.md` | Data QA for migrations, DynamoDB - schema/rollback validation | ✅ Active |
| performance-qa-agent | `agents/qa/performance-qa-agent.md` | Performance QA - Core Web Vitals, bundle size budgets, resource counting | ✅ Active |
| ui-test-gen-agent | `agents/qa/ui-test-gen-agent.md` | UI test scaffolding - generates Playwright specs and fixtures for UI components | ✅ Active |
| devops-agent | `agents/devops/devops-agent.md` | Infrastructure, deployment, monitoring, incident response, RCA | ✅ Active |
| decomposition-challenger-agent | `agents/core/decomposition-challenger-agent.md` | Challenges non-decomposed tickets, identifies cross-ticket dependencies | ✅ Active |
| catalog-agent | `agents/core/catalog-agent.md` | Generates src/CATALOG.md from deployed ticket files_created metadata | ✅ Active |
| sprint-architect-agent | `agents/core/sprint-architect-agent.md` | Creates SPRINT_TODO.json master plan with CSS registry, file ownership, execution order | ✅ Active |
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

### Cursor (.cursor/overrides/)
- `diff-analyzer-agent.md` - Diff analysis and review
- `pr-drafter-agent.md` - Pull request drafting
- `quick-fix-agent.md` - Fast bug fixes

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
- `.cursor/cursor.md` → `../agents.md`
- `.opencode/opencode.md` → `../agents.md`

---

**Last Updated:** 2025-12-18
**Maintainer:** Autonom8 Core Team
