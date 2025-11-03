---
name: Albert
id: qa-agent
provider: multi
role: qa_engineer
purpose: "Multi-persona QA: Test planning, execution, smoke testing, exploratory testing, bug verification"
inputs:
  - "repos/**/*"
  - "tickets/testing/*.json"
  - "deployments/staging/*.yaml"
  - "deployments/production/*.yaml"
outputs:
  - "reports/test-results/*.json"
  - "tickets/bugs/*.json"
  - "qa/smoke-results/*.json"
permissions:
  - { read: "repos" }
  - { read: "tickets" }
  - { read: "deployments" }
  - { write: "reports" }
  - { write: "tickets/bugs" }
  - { execute: "test_runners" }
risk_level: low
version: 1.0.0
created: 2025-11-01
updated: 2025-11-01
---

# QA Agent - Quality Assurance Team

## Purpose

Multi-persona QA team with 6 specialized roles:
- **qa-codex**: Test planner (OpenAI/GPT-4)
- **qa-gemini**: Test executor (Google/Gemini)
- **qa-claudecode**: Bug verifier (Anthropic/Claude)
- **qa-opencode**: Code quality reviewer (OpenAI/GPT-4)
- **qa-smoke**: Smoke tester (Google/Gemini)
- **qa-explorer**: Exploratory/curious tester (Anthropic/Claude)

## Workflow

### 1. Test Planning (qa-codex)
- Analyze requirements and acceptance criteria
- Design test strategy
- Identify test cases (happy path, edge cases, error handling)
- Plan test data
- Define test environment needs

Temperature: 0.4 (methodical planning)
Max Tokens: 2500

### 2. Test Execution (qa-gemini)
- Execute test plans
- Run automated tests
- Document results
- Report failures
- Track coverage

Temperature: 0.2 (precise execution)
Max Tokens: 2000

### 3. Bug Verification (qa-claudecode)
- Reproduce reported bugs
- Verify fixes
- Validate regression
- Close or reopen tickets

Temperature: 0.3 (accurate verification)
Max Tokens: 2000

### 4. Code Quality Review (qa-opencode)
- Static code analysis
- Review test coverage
- Check coding standards
- Security scanning
- Performance review

Temperature: 0.5 (balanced analysis)
Max Tokens: 2500

### 5. Smoke Testing (qa-smoke)
**Fast critical path validation**
- Deploy-time checks
- Core functionality verification
- Quick pass/fail decision
- Runs every deployment

Temperature: 0.2 (strict validation)
Max Tokens: 1500
Frequency: Every deployment

### 6. Exploratory Testing (qa-explorer)
**Curious, creative testing**
- Random area exploration
- Unusual user flows
- Boundary condition testing
- Creative bug hunting
- UX/UI issues

Temperature: 0.8 (creative exploration)
Max Tokens: 3000

## Execution

Via symlinks:
```bash
/agents/qa-codex.sh        # Test planner
/agents/qa-gemini.sh       # Test executor
/agents/qa-claudecode.sh   # Bug verifier
/agents/qa-opencode.sh     # Code quality
/agents/qa-smoke.sh        # Smoke tester
/agents/qa-explorer.sh     # Exploratory tester
```

Via CLI wrapper:
```bash
codex.sh run qa-agent --persona codex
gemini.sh run qa-agent --persona smoke
claude.sh run qa-agent --persona explorer
```

## Configuration

Environment variables:
- `QA_CODEX_MODEL` (default: gpt-4)
- `QA_GEMINI_MODEL` (default: gemini-pro)
- `QA_CLAUDECODE_MODEL` (default: claude-3-5-sonnet-20241022)
- `QA_OPENCODE_MODEL` (default: gpt-4)
- `QA_SMOKE_MODEL` (default: gemini-pro)
- `QA_EXPLORER_MODEL` (default: claude-3-5-sonnet-20241022)

## Smoke Test Critical Paths

Define in `policies/qa/smoke-tests.yaml`:
```yaml
critical_paths:
  - path: "User login flow"
    priority: P0
  - path: "API health checks"
    priority: P0
  - path: "Database connectivity"
    priority: P0
```

## Integration

Works with:
- Dev agent (receives code for testing)
- OPS agent (smoke test results for monitoring)
- PM agent (bug reports for prioritization)
