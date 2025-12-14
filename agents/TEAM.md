# Autonom8 IT Department Roster

**Version:** 1.3.0
**Last Updated:** 2025-12-14
**Total Agents:** 32 Active

---

## Leadership & Strategy

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| Product Manager | Arya | pm-agent | Multi (codex, gemini, claude) | Strategic roadmap, RICE/ICE prioritization, what to build |
| Product Owner | Warren | po-agent | Multi (codex, claude, gemini) | User stories, sprint planning, acceptance criteria, how to build |

**Collaboration Pattern:**
```
User Proposal → Arya (PM) → Warren (PO) → Development Team
```

---

## Development Team

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| Senior Developer | Andrey | dev-agent | Multi (claudecode, codex, gemini, opencode) | Feature implementation, code reviews, technical execution |
| UI/UX Engineer | Scott | ui-agent | Multi (flutter-claude, vanilla-codex, design-gemini, native-claude) | Frontend development, Flutter apps, responsive design |
| Solana Blockchain Developer | Raj | solana-rust-agent | Claude | Solana dApps, Rust/Anchor, on-chain programs, Wormhole integration |
| EVM Blockchain Developer | Marcus | evm-solidity-agent | Claude | EVM smart contracts, Solidity, Hardhat/Foundry, CCIP/Wormhole integration |

**Specializations:**
- **Andrey**: Full-stack development, multi-phase workflow (research → plan → code → review)
- **Scott**: Flutter-first development, vanilla JS/CSS, Material 3, accessibility (WCAG 2.1 AA)
- **Raj**: Solana blockchain apps, Anchor framework, PDAs, cross-chain via Wormhole
- **Marcus**: EVM smart contracts, OpenZeppelin patterns, gas optimization, cross-chain via CCIP/Wormhole

---

## Quality Assurance & Testing

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| QA Lead | Albert | qa-agent | Multi (6 personas) | Test planning, execution, quality assurance |
| Smoke Test Specialist | Puneet | smoke-test-agent | Claude | Fast critical path validation |
| Regression Test Lead | Leo | regression-test-agent | Claude | Comprehensive regression testing |
| Exploratory QA | Piyush | curious-qa-agent | Claude (temp: 0.9) | Creative bug hunting, edge case discovery |
| Integration QA Lead | Nina | integration-qa-agent | Multi | Browser testing, 404 detection, console error capture |
| Visual QA Lead | Vera | visual-qa-agent | Multi | Tech-agnostic visual QA principles and coordination |
| Visual QA Web | Maya | visual-qa-web-agent | Multi | Playwright DOM validation, CSS class consistency |
| Visual QA Flutter | Priti | visual-qa-flutter-agent | Multi | Flutter golden_toolkit snapshot testing |
| Visual QA iOS | Kira | visual-qa-ios-agent | Multi | iOS swift-snapshot-testing |
| Backend QA Engineer | Felix | backend-qa-agent | Multi | Lambda, Docker, gRPC unit/integration testing |
| Data QA Engineer | Daria | data-qa-agent | Multi | Schema validation, migration testing, rollback verification |
| Solana QA Engineer | Priya | solana-rust-qa-agent | Claude | Anchor testing, Wormhole integration testing |
| EVM QA Engineer | Viktor | evm-solidity-qa-agent | Claude | Foundry/Hardhat testing, CCIP/Wormhole integration |

**Testing Strategy:**
- **Albert**: Coordinates test planning and execution across all testing phases
- **Puneet**: Fast smoke tests for critical paths (< 5 min)
- **Leo**: Comprehensive regression test suites
- **Piyush**: Exploratory testing with high creativity, finds unexpected bugs
- **Nina**: Browser integration tests - catches 404s, console errors, broken links
- **Vera**: Visual QA coordination - tech-agnostic principles for all platforms
- **Maya**: Web visual testing with Playwright - CSS class validation, DOM consistency
- **Priti**: Flutter visual testing with golden_toolkit - widget key validation
- **Kira**: iOS visual testing with swift-snapshot-testing - outlet bindings
- **Felix**: Backend testing - Lambda handlers, Docker services, gRPC endpoints
- **Daria**: Data pipeline testing - schema validation, migration verification
- **Priya**: Solana on-chain testing with Anchor framework, cross-chain Wormhole validation
- **Viktor**: EVM smart contract testing with Foundry, fuzz testing, CCIP/Wormhole cross-chain validation

---

## Operations & Infrastructure

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| Operations Engineer | Julio | ops-agent | Multi (gemini-monitor, codex-triage, claude-hotfix) | Production monitoring, incident response, performance tracking |
| DevOps Engineer | Brandon | devops-agent | Multi (codex-planner, terraform-gen, gemini-deployer) | Infrastructure as Code, CI/CD, deployment orchestration |

**Operational Focus:**
- **Julio**: 24/7 monitoring, incident triage (P0-P3), automated hotfixes, SLO compliance
- **Brandon**: Terraform generation, cost optimization, blue/green deployments, K8s orchestration

---

## Specialized Roles

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| Security Engineer | Alex | security-agent | Multi (codex-code, claude-arch, gemini-compliance) | Security reviews, OWASP Top 10, compliance validation |
| Data Engineer | Sam | data-agent | Multi (codex-etl, gemini-sql, claude-dashboards) | Analytics, ETL pipelines, dashboards, metrics reporting |
| AI/ML Engineer | Ananya | ml-dev-agent | Multi (claude-ml-research, codex-training, gemini-optimization, opencode-deployment) | ML model development, training pipelines, MLOps, deployment |
| AI/ML QA Engineer | Vikram | ml-qa-agent | Multi (claude-validation, codex-testing, gemini-benchmarking, opencode-monitoring) | Model validation, data quality testing, performance benchmarking, ML system monitoring |

**Security, Data & ML:**
- **Alex**: Shift-left security, vulnerability scanning, SOC2/HIPAA/GDPR compliance
- **Sam**: Data-driven decision making, PM/Dev/QA/DevOps/Ops dashboards
- **Ananya**: PyTorch/TensorFlow, model training, hyperparameter tuning, model optimization, model serving
- **Vikram**: Model performance validation, bias/fairness testing, data drift detection, A/B testing

---

## Improvement & Automation Team

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| Bug Mining Specialist | Alvaro | bug-miner | Multi | Mines bugs from logs, tickets, metrics |
| Workflow Automation Lead | Jimbo | flow-synthesizer | Multi | Creates and modifies Node-RED flows |
| Documentation Specialist | Alfonso | doc-fixer | Multi | Updates and corrects documentation |
| Prompt Optimization Engineer | Sophia | prompt-tuner | Multi | Optimizes prompts for cost/quality/latency |
| Metrics & Analytics Lead | David | metrics-agent | Multi | Tracks metrics, SLOs, and costs |

**Continuous Improvement:**
- Focus on automation, observability, and optimization
- Cross-functional support for all teams
- Data-driven insights for process improvements

---

## Core Agents & Enforcement

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| Catalog Manager | Cleo | catalog-agent | Multi | Generates CATALOG.md with dependency tracking and validation status |
| Decomposition Challenger | Drake | decomposition-challenger-agent | Multi | Challenges non-decomposed tickets, identifies cross-ticket dependencies |
| Normalizer | Norm | normalizer-agent | Multi | Standardizes ticket formats, validates schema compliance |
| Context Keeper | Cortex | context-keeper-agent | Multi | Maintains conversation context, manages agent memory |

**Enforcement Pipeline:**
- **Cleo**: Tracks all created artifacts with identifiers, companions, and validation status
- **Drake**: Ensures tickets are properly decomposed before sprint execution
- **Norm**: Enforces consistent ticket structure across all agents
- **Cortex**: Preserves context across agent handoffs and long-running tasks

**Artifact Validation (go-autonom8/validation/):**
- **15 Platform Validators**: web, flutter, ios, android, terraform, backend, data, solidity, solana, ai
- **Paired Artifact Detection**: JS/CSS, Dart/Theme, Swift/Storyboard, Kotlin/Layout
- **Visual Consistency Checking**: Dimension variance detection across UI elements
- **Workflow Triggers**: Pre/post validation at each sprint phase

---

## Collaboration Patterns

### Standard Feature Workflow (Sprint-Based)

```
Sprint Backlog (Groomed Tickets)
    ↓
Sprint Planning - Warren (PO)
    ├─ Selects tickets from sprint_pre/ backlog
    ├─ Estimates story points with Andrey (Dev)
    └─ Commits to sprint goals
    ↓
Decomposition Check - Drake (Decomposition Challenger)
    ├─ Validates ticket is properly decomposed
    ├─ Identifies cross-ticket dependencies
    └─ Blocks oversized tickets
    ↓
Sprint Execution (2-week sprint)
    ↓
Ticket Assignment - Warren (PO)
    ├─ Moves ticket from sprint_pre/ → sprint_latest/assigned/
    └─ Notifies Andrey (Dev)
    ↓
Development - Andrey (Dev)
    ├─ Moves to sprint_latest/in_progress/
    ├─ Implements feature
    ├─ Self-review and unit tests
    └─ Moves to sprint_latest/code_review/
    ↓
Artifact Validation - Enforcement Pipeline [AUTOMATIC]
    ├─ Validates paired artifacts (JS/CSS, etc.)
    ├─ Detects stub files and incomplete code
    └─ Extracts identifiers for catalog tracking
    ↓
Security Review - Alex (Security)
    ├─ OWASP Top 10 validation
    ├─ Dependency scanning
    └─ Approves or requests changes
    ↓
QA Testing - Albert (QA) coordinates
    ├─ Moves to sprint_latest/testing/
    ├─ Puneet (Smoke tests) - Critical path validation
    ├─ Leo (Regression tests) - Full test suite
    └─ Piyush (Exploratory) - Edge case discovery
    ↓
Integration QA - Nina (Integration QA) [UI PLATFORMS]
    ├─ Browser testing with Playwright
    ├─ 404 detection, console error capture
    └─ Broken link validation
    ↓
Visual QA - Vera coordinates [UI PLATFORMS]
    ├─ Maya (Web) - CSS class consistency
    ├─ Priti (Flutter) - Widget key validation
    └─ Kira (iOS) - Outlet bindings
    ↓
Visual Consistency Check - Enforcement Pipeline [AUTOMATIC]
    ├─ Validates element dimension consistency
    ├─ Reports variance > 5% as warnings
    └─ Creates bug tickets for severe issues (> 25%)
    ↓
Deployment - Brandon (DevOps)
    ├─ Moves to sprint_latest/deployment/
    ├─ Staging deployment and validation
    ├─ Production deployment (blue/green)
    └─ Moves to sprint_post/
    ↓
Catalog Update - Cleo (Catalog Agent) [AUTOMATIC]
    ├─ Records files_created with identifiers
    ├─ Tracks companion file relationships
    ├─ Updates CATALOG.md with validation status
    └─ Generates dependency graph
    ↓
Post-Deployment Monitoring - Julio (Ops)
    ├─ 7-day observation period
    ├─ SLO compliance tracking
    └─ Moves to sprint_deployed/ when stable
    ↓
Sprint Review - Warren (PO)
    ├─ Demo to stakeholders
    ├─ Acceptance criteria validation
    └─ Archive ticket
```

**Key Differences from Hotfix Flow:**
- Starts from groomed backlog (sprint_pre/), not raw proposals
- Includes sprint planning and estimation
- Follows ticket state machine through sprint_latest/ subdirectories
- Includes code review step before QA
- Has formal sprint review and demo

### Hotfix/Urgent Workflow (Bypasses Sprint)

```
User/Telegram Urgent Proposal (P0/P1)
    ↓
Arya (PM) - Emergency triage and priority validation
    ↓
Warren (PO) - Fast-track user story (< 1 hour)
    ├─ Skips sprint planning
    └─ Creates ticket in tickets/inbox/
    ↓
Andrey (Dev) - Immediate implementation
    ├─ No backlog grooming
    └─ Direct to production branch
    ↓
Alex (Security) - Expedited security review (parallel)
    ↓
Albert (QA) - Fast-track testing
    ├─ Puneet (Smoke tests only) - Critical path
    └─ Skips full regression (risk accepted)
    ↓
Brandon (DevOps) - Emergency deployment
    ├─ Direct to production (no staging)
    └─ Rollback plan ready
    ↓
Julio (Ops) - Intensive monitoring (24 hours)
    ├─ SLO tracking
    └─ Incident report
    ↓
Retrospective - Arya (PM) + Warren (PO)
    └─ Create follow-up ticket for proper implementation
```

**Hotfix Characteristics:**
- Starts from raw proposal (inbox/), not groomed backlog
- No sprint planning or estimation
- Minimal testing (smoke tests only)
- Direct to production deployment
- Creates technical debt that needs follow-up

### Incident Response Workflow

```
Alert/Issue Detected (Production)
    ↓
Julio (Ops) - Triage and severity assessment
    ├─ P0: Critical (< 15 min response)
    ├─ P1: High (< 1 hour response)
    ├─ P2: Medium (< 4 hours response)
    └─ P3: Low (next business day)
    ↓
Decision Tree:
├─ P0/P1 + LOW complexity → Julio (Hotfix)
├─ P0/P1 + MED/HIGH → Escalate to Andrey (Dev)
├─ Security issue → Escalate to Alex (Security)
└─ Infrastructure issue → Escalate to Brandon (DevOps)
    ↓
Root Cause Analysis (Julio + responsible agent)
    ↓
Post-mortem report → Sam (Data) for metrics
    ↓
Prevention Ticket → Warren (PO) for sprint backlog
```

### Infrastructure Change Workflow

```
Infrastructure Request
    ↓
Arya (PM) - Business justification and approval
    ↓
Brandon (DevOps) - Terraform/IaC planning
    ↓
Alex (Security) - Security and compliance review
    ↓
Brandon (DevOps) - Deployment to staging
    ↓
Julio (Ops) - Validation and production rollout
    ↓
Sam (Data) - Cost and performance monitoring
```

### UI/UX Development Workflow

```
Design Request
    ↓
Arya (PM) - Feature prioritization
    ↓
Warren (PO) - User story and mockups
    ↓
Scott (UI) - Multi-LLM implementation
    ├─ ui-flutter (Claude) - Flutter implementation
    ├─ ui-vanilla (Codex) - Vanilla JS/CSS
    ├─ ui-design (Gemini) - Performance validation
    └─ ui-native (Claude) - Native features
    ↓
Albert (QA) - UI/UX testing
    ↓
Brandon (DevOps) - Frontend deployment
```

---

## Team Communication Channels

### Agent-to-Agent Messages
- **Location:** `tenants/{tenant}/context/agent-messages/`
- **Format:** JSON with timestamp, from, to, type, priority, context
- **Types:** help_request, escalation, handoff, status_update, acknowledgment

### System Messages
- **Location:** `context/system-messages/`
- **Purpose:** Infrastructure alerts affecting all tenants
- **Types:** downtime, maintenance, security_alerts

---

## Key Principles

1. **Multi-LLM Strategy**: Each agent uses multiple LLM providers for different workflow phases
2. **Autonomous Execution**: Permission bypass enables hands-free operations
3. **State Management**: Ticket state machine tracks work across agent boundaries
4. **Multi-Tenant Isolation**: Each tenant has isolated tickets, context, and queues
5. **Observability**: All agent actions logged, metrics tracked, dashboards generated
6. **Security-First**: Security reviews integrated into development workflow
7. **Data-Driven**: Analytics and metrics inform all decisions
8. **Enforcement Pipeline**: Automatic validation at each workflow phase (artifact pairing, stub detection, visual consistency)
9. **Dependency Tracking**: All artifacts tracked with identifiers, companions, and validation status
10. **Platform-Specific Validation**: 15 validators covering web, mobile, blockchain, backend, data, and AI platforms

---

## Onboarding New Agents

To add a new agent to the team:

1. **Create agent definition:** `modules/Autonom8-Agents/agents/{category}/{agent-id}.md`
2. **Update manifest:** Add to `modules/Autonom8-Agents/agents.md`
3. **Update team roster:** Add to this TEAM.md file
4. **Update RACI matrix:** Define responsibilities in `RACI.yaml`
5. **Create CLI wrapper:** Add to `bin/{agent-name}.sh` if needed
6. **Test integration:** Verify handoffs with existing agents

---

**For detailed role definitions, see individual agent files in `agents/` directory.**
