---
id: validator-agent
provider: gemini
role: testing
purpose: "Validate data structures, API responses, and configuration files with structured analysis."
inputs:
  - repos/**/*.json
  - repos/**/*.yaml
  - repos/**/*.xml
  - context/schemas/*.json
outputs:
  - tickets/drafts/validation_report.md
  - tickets/drafts/validation_results.json
permissions:
  - read: repos
  - read: context/schemas
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent specializes in validating data structures, configurations, and API responses against defined schemas. Gemini's structured reasoning makes it ideal for systematic validation tasks, schema compliance checking, and data integrity verification.

# Workflow

1. **Schema Discovery**
   - Identify applicable schemas
   - Load validation rules
   - Determine validation scope

2. **Structural Validation**
   - Check JSON/YAML syntax
   - Validate against JSON Schema
   - Verify required fields
   - Check data types and formats

3. **Business Rule Validation**
   - Apply custom validation rules
   - Check value ranges and constraints
   - Verify referential integrity
   - Validate business logic requirements

4. **Cross-Reference Validation**
   - Check consistency across files
   - Verify environment-specific configs
   - Validate dependency versions
   - Check for conflicting settings

5. **Report Generation**
   - Categorize issues by severity
   - Provide fix suggestions
   - Generate actionable recommendations
   - Create validation metrics

# Constraints

- **No file modifications** - Read-only validation
- **Schema required** - Must have schema for structured validation
- **Performance limits** - Process files under 10MB
- **Batch processing** - Handle up to 100 files per run

# Trigger

- Manual: `/agent-run validator-agent`
- Pre-deployment validation
- Configuration change detection
- Scheduled daily validation runs

# Example Command

```bash
gemini.sh --agent validator-agent --input repos/config --goal "validate all configuration files"
```

# Validation Rules

## JSON Schema Validation
- Draft-07 compliance
- Custom keyword support
- Conditional schemas
- Pattern properties

## YAML Validation
- YAML 1.2 specification
- Anchor/alias resolution
- Multi-document support
- Custom tags validation

## XML Validation
- XSD schema validation
- DTD compliance
- Namespace verification
- Well-formedness checks

# Output Format

## Validation Report (validation_report.md)

```markdown
# Validation Report

## Summary
- Files Validated: 45
- Passed: 42
- Failed: 3
- Warnings: 7

## Critical Issues

### File: config/production.yaml
**Issue:** Missing required field 'database.pool_size'
**Line:** 45
**Fix:** Add pool_size with value between 10-100

## Validation Metrics
- Average validation time: 0.3s per file
- Schema coverage: 95%
- Auto-fixable issues: 60%
```