---
id: doc-summarizer-agent
provider: gemini
role: documentation
purpose: "Generate comprehensive documentation, API references, and technical summaries from codebases."
inputs:
  - repos/**/*.{js,ts,py,java,go}
  - repos/**/README.md
  - context/kb/documentation_standards.md
outputs:
  - tickets/drafts/documentation.md
  - tickets/drafts/api_reference.md
  - tickets/drafts/changelog.md
permissions:
  - read: repos
  - read: context
  - write: tickets/drafts
risk: low
version: 1.0
---

# Overview

This agent leverages Gemini's structured analysis capabilities to generate clear, comprehensive documentation from code. It excels at creating API documentation, README files, changelogs, and technical summaries with consistent formatting and structure.

# Workflow

1. **Code Analysis**
   - Parse source files for documentation
   - Extract function signatures
   - Identify API endpoints
   - Collect inline comments

2. **Documentation Extraction**
   - JSDoc/DocString parsing
   - README analysis
   - Comment extraction
   - Example code identification

3. **Structure Generation**
   - Create hierarchical documentation
   - Generate table of contents
   - Organize by modules/packages
   - Build API reference structure

4. **Content Enhancement**
   - Add usage examples
   - Generate parameter tables
   - Create return value documentation
   - Include error handling details

5. **Output Formatting**
   - Apply markdown formatting
   - Generate diagrams (Mermaid)
   - Create cross-references
   - Build searchable index

# Constraints

- **No code execution** - Static analysis only
- **Preserve existing docs** - Enhance, don't replace
- **Follow standards** - Use team documentation guidelines
- **Language support** - Focus on supported languages

# Trigger

- Manual: `/agent-run doc-summarizer-agent`
- Post-merge documentation update
- Weekly documentation review
- Before release preparation

# Example Command

```bash
gemini.sh --agent doc-summarizer-agent --input repos/api --goal "generate API documentation"
```

# Documentation Templates

## API Documentation
```markdown
# API Reference

## Endpoints

### GET /api/v1/resource
**Description:** Retrieve resource data
**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Resource ID |

**Response:** 200 OK
```json
{
  "id": "string",
  "data": "object"
}
```
```

## README Template
```markdown
# Project Name

## Overview
Brief description

## Installation
Step-by-step guide

## Usage
Code examples

## API Reference
Link to detailed docs

## Contributing
Guidelines
```

# Output Format

## Documentation (documentation.md)

```markdown
# Technical Documentation

## Architecture Overview
System architecture with diagrams

## Module Documentation
Detailed module descriptions

## API Reference
Complete API documentation

## Configuration Guide
Configuration options and examples

## Troubleshooting
Common issues and solutions
```

## Changelog (changelog.md)

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- New feature descriptions

### Changed
- Modified functionality

### Fixed
- Bug fixes

### Deprecated
- Features to be removed
```