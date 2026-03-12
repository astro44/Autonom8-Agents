# Autonom8-Agents

**The Cortex** - library of multi-provider AI agent definitions with provider-specific overrides, skills, and schemas.

## Overview

This repository contains agent definitions optimized for different AI providers. Each agent is a specialized personality designed for specific tasks like code review, documentation, testing, and analysis.

## Agent Library

### 16 Agents Across 5 Providers

#### Claude Agents (Deep Analysis)
- **brutal-critic-agent** - Aggressive code review and security analysis
- **framework-counter-agent** - Technology stack analysis
- **miner-executer** - Data extraction and pattern mining

#### Gemini Agents (Structured Analysis)
- **validator-agent** - Schema validation and data structure checking
- **doc-summarizer-agent** - Documentation generation
- **test-generator-agent** - Test suite and case generation

#### Codex/GPT Agents (Code Generation)
- **code-generator-agent** - Feature implementation from specifications
- **refactor-agent** - Code quality improvement
- **api-builder-agent** - Complete API design and implementation
- **po-pm-agent** - Product Owner/PM - User stories and sprint planning

#### Cursor Agents (Fast Local Processing)
- **pr-drafter-agent** - PR descriptions and commit messages
- **diff-analyzer-agent** - Security and performance diff analysis
- **quick-fix-agent** - Automated linting and style fixes

#### OpenCode Agents (Fast Local Processing)
- **pr-drafter-agent** - PR descriptions and commit messages
- **diff-analyzer-agent** - Security and performance diff analysis
- **quick-fix-agent** - Automated linting and style fixes

## Structure

```
.claude/overrides/   # Claude-specific overrides
.codex/overrides/    # Codex/GPT-specific overrides
.cursor/overrides/   # Cursor-specific overrides
.gemini/overrides/   # Gemini-specific overrides
.opencode/overrides/ # Open-source model overrides
agent-index.json     # Generated agent index
```

## Usage

This repository is designed to be used as a git submodule in Autonom8-Core:

```bash
# In Autonom8-Core
git submodule add git@github.com:astro44/Autonom8-Agents.git agents

# Run an agent
agent-run --agent brutal-critic-agent --goal "review code"
```

## Agent Format

All agents follow the Markdown schema with YAML frontmatter:

```markdown
---
id: example-agent
provider: claude
role: code_review
purpose: "Brief description"
inputs: [...]
outputs: [...]
permissions: [...]
risk: medium
version: 1.0
---

# Overview
# Workflow
# Constraints
# Trigger
```

## Contributing

### Adding a New Agent

1. Create a directory under `agents/<category>/` (e.g., `agents/qa/my-agent.md`).
2. Add YAML frontmatter with required fields:

```yaml
---
name: Agent Name
id: my-agent
provider: multi
role: role_type
purpose: "Short description"
inputs: [...]
outputs: [...]
permissions: [...]
risk_level: low | medium | high
version: 1.0.0
---
```

3. Define one or more `## Persona:` blocks with role, workflow, constraints, and output schema.
4. Add provider-specific overrides in `.<provider>/overrides/<agent-id>.md` if needed.
5. Update `manifest.yaml` to register the agent.
6. Run the CI lint workflow to validate: `.github/workflows/lint-agents.yml`.

### Adding a Skill

Place skills in `skills/<skill-name>/SKILL.md` following the Agent Skills Standard format with input/output schemas.

## License

MIT License. See [LICENSE](LICENSE) for details.
