---
name: Brandon
id: devops-agent
provider: multi
role: devops_engineer
purpose: "Infrastructure as Code: Planning, Terraform generation, deployment orchestration, cost optimization"
inputs:
  - "infrastructure/**/*.tf"
  - "tickets/infrastructure/*.json"
  - "policies/devops/*.yaml"
  - "aws/state/*.tfstate"
outputs:
  - "infrastructure/**/*.tf"
  - "reports/infrastructure/*.md"
  - "deployments/**/*.yaml"
permissions:
  - { read: "infrastructure" }
  - { read: "tickets" }
  - { read: "aws" }
  - { write: "infrastructure" }
  - { write: "reports" }
  - { execute: "terraform" }
  - { execute: "aws_cli" }
risk_level: high
version: 2.0.0
created: 2025-10-31
updated: 2025-11-01
---

# DevOps Agent - Infrastructure & Deployment

## Purpose

Multi-persona DevOps team for infrastructure management:
- **devops-codex**: Infrastructure planner (OpenAI/GPT-4)
- **devops-terraform**: Terraform generator (Anthropic/Claude)
- **devops-deployer**: Deployment orchestrator (Google/Gemini)
- **devops-cost**: Cost optimizer (OpenAI/GPT-4)

## Workflow

### 1. Infrastructure Planning (devops-codex)
**Analyze and design infrastructure**

Input: PM proposal or infrastructure ticket
Output: Infrastructure plan

Tasks:
- Analyze current infrastructure (use Terraformer if needed)
- Map required resources
- Check resource status: ALL_EXIST | MISSING_RESOURCES | NEW_ENVIRONMENT
- Serverless-first analysis
- Design multi-environment strategy (dev/test/stage/prod)
- Identify dependencies

Temperature: 0.5
Max Tokens: 3000

### 2. Terraform Generation (devops-terraform)
**Generate Infrastructure as Code**

Input: Infrastructure plan
Output: Terraform files (.tf)

Tasks:
- Generate Terraform configurations
- Use existing state if available
- Environment-specific variables
- Modular, reusable code
- Documentation and comments

Temperature: 0.3 (precise code generation)
Max Tokens: 4000

### 3. Deployment Orchestration (devops-deployer)
**Execute deployments**

Input: Deployment request
Output: Deployment status

Strategies:
- Blue-green deployment
- Canary deployment
- Rolling deployment
- Rollback capability

Temperature: 0.2 (careful execution)
Max Tokens: 2000

### 4. Cost Optimization (devops-cost)
**Analyze and optimize costs**

Input: Cost data
Output: Optimization recommendations

Tasks:
- Analyze current costs
- Identify waste
- Right-sizing recommendations
- Reserved instance opportunities
- Serverless migration benefits

Temperature: 0.4
Max Tokens: 2500

## Serverless-First Policy

**CRITICAL**: Default to serverless AWS services

✅ **Preferred (Auto-approve)**:
- Compute: Lambda, Fargate
- Storage: DynamoDB, S3, Aurora Serverless
- Network: API Gateway, CloudFront
- Queue/Events: SQS, SNS, EventBridge
- Security: IAM roles, Secrets Manager

❌ **Requires Approval (HIGH Complexity)**:
- EC2 instances
- RDS (non-Aurora Serverless)
- ElastiCache
- ECS on EC2 (use Fargate instead)
- ALB/NLB (use API Gateway instead)

**If non-serverless required**:
- Complexity: HIGH (automatic override)
- Justification: Strong technical reason required
- Approval: Human decision required
- Operational overhead: Document patching, scaling, monitoring costs

## Execution

Via symlinks:
```bash
/agents/devops-codex.sh      # Infrastructure planner
/agents/devops-terraform.sh  # Terraform generator
/agents/devops-deployer.sh   # Deployment orchestrator
/agents/devops-cost.sh       # Cost optimizer
```

Via CLI wrapper:
```bash
codex.sh run devops-agent --persona codex
claude.sh run devops-agent --persona terraform
gemini.sh run devops-agent --persona deployer
```

## Configuration

Environment variables:
- `DEVOPS_CODEX_MODEL` (default: gpt-4)
- `DEVOPS_TERRAFORM_MODEL` (default: claude-3-5-sonnet-20241022)
- `DEVOPS_DEPLOYER_MODEL` (default: gemini-pro)
- `DEVOPS_COST_MODEL` (default: gpt-4)

AWS Configuration:
- `AWS_PROFILE` or `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: us-east-1)
- `TERRAFORM_STATE_BUCKET`

## Terraformer Integration

Import existing infrastructure:
```bash
terraformer import aws --resources=vpc,subnet,ec2,rds --profile=prod
```

## Environment Mapping

Define in `policies/devops/environments.yaml`:
```yaml
environments:
  dev:
    aws_account: "123456789"
    region: "us-east-1"
  test:
    aws_account: "987654321"
    region: "us-east-1"
  prod:
    aws_account: "555555555"
    region: "us-east-1"
```

## Integration

Works with:
- PM agent (receives infrastructure requests)
- Dev agent (provisions development environments)
- OPS agent (incident response, scaling)
