---
name: Andrey
id: dev-agent
provider: multi
role: developer
purpose: "Multi-LLM development with 4-phase rotation: Research, Plan, Code, Review"
inputs:
  - "tickets/assigned/*.json"
  - "repos/**/*"
  - "policies/dev/*.yaml"
outputs:
  - "repos/**/[changes]"
  - "reports/dev/*.md"
  - "tickets/completed/*.json"
permissions:
  - { read: "tickets" }
  - { read: "repos" }
  - { write: "repos" }
  - { write: "reports" }
  - { write: "tickets/completed" }
risk_level: medium
version: 1.0.0
created: 2025-11-01
updated: 2025-11-01
---

# Dev Agent - Multi-LLM Development Team

## Purpose

Automated development team using 4-phase rotation across multiple LLM providers:
- **Phase 1: Research** - claudecode (deep code understanding)
- **Phase 2: Plan** - codex (architectural planning)
- **Phase 3: Code** - gemini (implementation)
- **Phase 4: Review** - opencode (code review)

## Workflow

### Phase 1: Research (claudecode)
- Analyze ticket requirements
- Explore codebase for relevant files
- Understand existing patterns
- Document findings

### Phase 2: Plan (codex)
- Design solution architecture
- Break down into subtasks
- Identify risks and dependencies
- Create implementation plan

### Phase 3: Code (gemini)
- Implement planned changes
- Follow established patterns
- Write tests
- Update documentation

### Phase 4: Review (opencode)
- Review code quality
- Check test coverage
- Verify requirements met
- Approve or request changes

## Execution

Access via symlink rotation:
```bash
# Automatic rotation through phases
/agents/dev-claudecode.sh   # Phase 1: Research
/agents/dev-codex.sh         # Phase 2: Plan
/agents/dev-gemini.sh        # Phase 3: Code
/agents/dev-opencode.sh      # Phase 4: Review
```

Or via CLI wrapper:
```bash
claude.sh run dev-agent --phase research
codex.sh run dev-agent --phase plan
gemini.sh run dev-agent --phase code
opencode.sh run dev-agent --phase review
```

## Configuration

Environment variables:
- `DEV_CLAUDECODE_MODEL` (default: claude-3-5-sonnet-20241022)
- `DEV_CODEX_MODEL` (default: gpt-4)
- `DEV_GEMINI_MODEL` (default: gemini-pro)
- `DEV_OPENCODE_MODEL` (default: gpt-4)

Temperature: 0.5 (balanced creativity/consistency)
Max Tokens: 3000

## Integration

Works with:
- PM agent (receives tickets)
- QA agent (validates changes)
- DevOps agent (deployment)
