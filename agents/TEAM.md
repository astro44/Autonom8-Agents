# Autonom8 IT Department Roster

**Version:** 1.0.0
**Last Updated:** 2025-11-06
**Total Agents:** 19 Active

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

**Specializations:**
- **Andrey**: Full-stack development, multi-phase workflow (research → plan → code → review)
- **Scott**: Flutter-first development, vanilla JS/CSS, Material 3, accessibility (WCAG 2.1 AA)

---

## Quality Assurance & Testing

| Role | Name | Agent ID | Provider | Responsibility |
|------|------|----------|----------|----------------|
| QA Lead | Albert | qa-agent | Multi (6 personas) | Test planning, execution, quality assurance |
| Smoke Test Specialist | Puneet | smoke-test-agent | Claude | Fast critical path validation |
| Regression Test Lead | Leo | regression-test-agent | Claude | Comprehensive regression testing |
| Exploratory QA | Piyush | curious-qa-agent | Claude (temp: 0.9) | Creative bug hunting, edge case discovery |

**Testing Strategy:**
- **Albert**: Coordinates test planning and execution across all testing phases
- **Puneet**: Fast smoke tests for critical paths (< 5 min)
- **Leo**: Comprehensive regression test suites
- **Piyush**: Exploratory testing with high creativity, finds unexpected bugs

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

**Security & Data:**
- **Alex**: Shift-left security, vulnerability scanning, SOC2/HIPAA/GDPR compliance
- **Sam**: Data-driven decision making, PM/Dev/QA/DevOps/Ops dashboards

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

## Collaboration Patterns

### Standard Feature Workflow

```
User/Telegram Proposal
    ↓
Arya (PM) - Strategic triage and prioritization
    ↓
Warren (PO) - User stories and acceptance criteria
    ↓
Andrey (Dev) - Implementation
    ↓
Alex (Security) - Security review
    ↓
Albert (QA) - Test planning
    ├─ Puneet (Smoke tests)
    ├─ Leo (Regression tests)
    └─ Piyush (Exploratory testing)
    ↓
Brandon (DevOps) - Deployment
    ↓
Julio (Ops) - Monitoring (7 days)
    ↓
Done / Archive
```

### Incident Response Workflow

```
Alert/Issue Detected
    ↓
Julio (Ops) - Triage and severity assessment
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
