# Sub-Agent Orchestration Framework
## Multi-Provider Support for Complex Workflows

This framework enables main agents (PM, PO, Dev, QA, DevOps) to delegate complex multi-component tasks to specialized sub-agents with isolated context windows.

---

## Architecture Overview

```
Main Agent (e.g., Dev Agent)
   │
   ├─→ Backend Sub-Agent (AWS Lambda + API Gateway)
   │     ├─ Context: backend/, infra/, tests/integration/
   │     ├─ Task: Implement auth endpoints
   │     └─ Returns: {files_changed, tests_created, deployment_config}
   │
   ├─→ Frontend Sub-Agent (Flutter/React)
   │     ├─ Context: frontend/, components/, state/
   │     ├─ Task: Implement auth UI + biometric
   │     └─ Returns: {components_created, integration_points}
   │
   ├─→ Integration Test Sub-Agent
   │     ├─ Context: Full stack codebase
   │     ├─ Task: Create e2e tests
   │     └─ Returns: {test_coverage, scenarios_validated}
   │
   └─→ Documentation Sub-Agent
         ├─ Context: API specs, user flows
         ├─ Task: Update docs
         └─ Returns: {docs_updated, examples_added}
```

---

## Provider-Specific Implementation

### 1. Claude Code (Native Sub-Agents via Task Tool)

Claude Code has first-class sub-agent support. Sub-agents have their own isolated context and can use all tools.

**How Main Agent Delegates (Claude Only):**

```markdown
## When to Delegate to Sub-Agents

Delegate when a task requires:
- Deep codebase exploration in isolated scope
- Parallel work on multiple components
- Specialized expertise (backend, frontend, infra, docs)
- Recursive analysis (dependency trees, impact analysis)

## Delegation Pattern (Claude Code)

**DO NOT write code directly.** Instead, delegate to specialized sub-agents:

**Example: Full-Stack Auth Implementation**

Step 1: Delegate to Backend Sub-Agent
```
I need to implement authentication. Let me delegate backend work to a specialized sub-agent.

[Use Task tool to spawn Backend Sub-Agent]
- subagent_type: "general-purpose"
- Task: "Implement AWS Lambda auth endpoints with API Gateway"
- Context scope: backend/, infrastructure/sam-template.yaml
- Expected output: Lambda code, API Gateway config, tests
```

Step 2: Delegate to Frontend Sub-Agent (in parallel)
```
[Use Task tool to spawn Frontend Sub-Agent]
- subagent_type: "general-purpose"  
- Task: "Implement auth UI with biometric support"
- Context scope: frontend/src/auth/, frontend/src/components/
- Expected output: Auth components, state management, API integration
```

Step 3: Delegate to Integration Test Sub-Agent
```
[Use Task tool to spawn Integration Sub-Agent]
- subagent_type: "general-purpose"
- Task: "Create end-to-end auth flow tests"
- Context scope: tests/e2e/, backend/auth/, frontend/auth/
- Expected output: E2E test suite validating full flow
```

Step 4: Coordinate Results
```
After all sub-agents complete:
1. Review all changes for consistency
2. Validate integration points match
3. Run integration tests
4. Report final status
```

### 2. Codex/Gemini/OpenCode (Simulated Sub-Agents via Parallel CLI Calls)

These providers don't have native sub-agents, so we simulate via separate CLI calls with scoped instructions.

**How Main Agent Delegates (Codex/Gemini/OpenCode):**

```markdown
## When to Delegate to Sub-Agents

Delegate when a task requires:
- Parallel work on multiple components
- Specialized context for each component
- Isolated reasoning per task

## Delegation Pattern (Codex/Gemini/OpenCode)

**Signal Intent:** Output a JSON delegation plan

```json
{
  "delegation_required": true,
  "main_task": "Implement user authentication",
  "sub_tasks": [
    {
      "sub_agent_id": "backend-lambda",
      "agent_type": "dev",
      "scope": {
        "files": ["backend/**/*.ts", "infrastructure/sam-template.yaml"],
        "focus": "AWS Lambda + API Gateway auth endpoints"
      },
      "task": "Create Lambda functions for: register, login, refresh-token, logout. Configure API Gateway routes. Add integration tests.",
      "expected_output": {
        "files_created": ["list of new files"],
        "files_modified": ["list of modified files"],
        "tests_created": ["list of test files"],
        "deployment_config": "SAM template updates"
      }
    },
    {
      "sub_agent_id": "frontend-auth-ui",
      "agent_type": "dev",
      "scope": {
        "files": ["frontend/src/auth/**/*", "frontend/src/components/**/*"],
        "focus": "React/Flutter auth UI with biometric"
      },
      "task": "Create auth components: LoginScreen, RegisterScreen, BiometricPrompt. Integrate with backend API. Add form validation and error handling.",
      "expected_output": {
        "components_created": ["list of components"],
        "state_management": "auth state and reducers",
        "api_integration": "API client methods"
      }
    },
    {
      "sub_agent_id": "integration-tests",
      "agent_type": "qa",
      "scope": {
        "files": ["tests/e2e/**/*", "backend/auth/**/*", "frontend/auth/**/*"],
        "focus": "End-to-end auth flow validation"
      },
      "task": "Create E2E tests for: registration flow, login flow, biometric authentication, token refresh, logout. Validate frontend → API Gateway → Lambda integration.",
      "expected_output": {
        "test_suites": ["list of test files"],
        "scenarios_covered": ["list of test scenarios"],
        "mocks_created": ["mocks for external services"]
      }
    }
  ],
  "coordination": {
    "execution": "parallel",
    "integration_points": [
      "API contract between frontend and backend",
      "Lambda function names and API Gateway routes must match",
      "Token format and expiration handling"
    ],
    "validation": [
      "Run backend integration tests",
      "Run frontend unit tests",
      "Run E2E tests to validate full stack"
    ]
  }
}
```

**What Happens Next:**
The orchestration wrapper (`bin/sub-agent-orchestrator.sh`) reads this JSON and:
1. Spawns 3 parallel CLI calls (backend, frontend, integration-tests)
2. Each gets isolated context via file filtering
3. Waits for all to complete
4. Aggregates results
5. Returns to main agent for final coordination

