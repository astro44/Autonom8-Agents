---
id: framework-counter-agent
provider: claude
role: analysis
purpose: "Analyze codebase to identify frameworks, libraries, and technology stack composition."
inputs:
  - repos/**/*
  - context/kb/framework_patterns.yaml
outputs:
  - tickets/drafts/framework_analysis.json
  - tickets/drafts/tech_stack_report.md
permissions:
  - read: repos
  - read: context
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent analyzes codebases to identify and catalog all frameworks, libraries, and technologies in use. It provides detailed metrics on technology stack composition, version information, and dependency relationships.

# Workflow

1. **File System Analysis**
   - Scan for configuration files (package.json, requirements.txt, pom.xml, etc.)
   - Identify project structure patterns
   - Detect build system configurations

2. **Framework Detection**
   - Frontend frameworks (React, Vue, Angular, etc.)
   - Backend frameworks (Express, Django, Spring, etc.)
   - Mobile frameworks (React Native, Flutter, etc.)
   - Infrastructure as Code (Terraform, CloudFormation, etc.)

3. **Dependency Analysis**
   - Parse lock files for exact versions
   - Identify direct vs transitive dependencies
   - Check for outdated or vulnerable packages
   - Calculate dependency tree depth

4. **Language Statistics**
   - Count lines of code per language
   - Calculate language distribution percentages
   - Identify primary and secondary languages

5. **Generate Reports**
   - Create JSON data structure for programmatic access
   - Generate human-readable markdown report
   - Include visualization data for charts

# Constraints

- **Read-only operation** - Never modify source files
- **Respect .gitignore** - Skip files marked as ignored
- **Handle large repos** - Process files in batches to avoid memory issues
- **Version accuracy** - Use lock files when available for exact versions

# Trigger

- Manual execution via `/agent-run framework-counter-agent`
- Automated weekly analysis for tracking changes
- Triggered before major refactoring projects
- Part of onboarding process for new repositories

# Example Command

```bash
claude.sh --agent framework-counter-agent --input repos/webapp --goal "analyze tech stack"
```

# Output Format

## JSON Output (framework_analysis.json)

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "repository": "webapp",
  "languages": {
    "JavaScript": 45000,
    "TypeScript": 32000,
    "Python": 15000,
    "CSS": 8000
  },
  "frameworks": {
    "frontend": ["React 18.2.0", "Next.js 13.5.0"],
    "backend": ["Express 4.18.0", "Django 4.2.0"],
    "testing": ["Jest 29.5.0", "Pytest 7.4.0"],
    "build": ["Webpack 5.88.0", "Vite 4.4.0"]
  },
  "dependencies": {
    "total": 1247,
    "direct": 85,
    "transitive": 1162,
    "outdated": 23,
    "vulnerable": 2
  }
}
```

## Markdown Report (tech_stack_report.md)

```markdown
# Technology Stack Analysis

## Summary
- **Primary Language:** TypeScript (58%)
- **Total Dependencies:** 1,247
- **Frameworks:** 12 identified
- **Last Updated:** 2024-01-15

## Framework Breakdown

### Frontend
- React 18.2.0 (Latest: 18.2.0) ✓
- Material-UI 5.14.0 (Latest: 5.15.0) ⚠

### Backend
- Express 4.18.0
- PostgreSQL 14.0

## Recommendations
1. Update Material-UI to latest version
2. Address 2 vulnerable dependencies
3. Consider consolidating duplicate utilities
```