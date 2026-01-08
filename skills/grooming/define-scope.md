# define-scope

Define implementation scope boundaries for a ticket.

## Purpose

Analyzes ticket requirements and project structure to define precise scope boundaries. Specifies which directories, files, and patterns are in-scope for implementation, preventing scope creep.

## Platforms

All (workflow skill)

## Input Schema

```json
{
  "ticket_id": "TICKET-123",
  "title": "Add dark mode toggle",
  "description": "Implement dark mode in settings...",
  "project_dir": "/path/to/project",
  "ticket_type": "feature",
  "affected_areas": ["settings", "theme"],
  "enrichment_summary": {
    "ui_changes": ["SettingsPage", "ThemeToggle"],
    "api_changes": ["user-preferences"],
    "test_changes": ["settings.spec.ts"]
  }
}
```

- `ticket_id` (required): Ticket identifier
- `title` (required): Ticket title
- `description` (required): Detailed description
- `project_dir` (required): Project root directory
- `ticket_type` (optional): Type from triage
- `affected_areas` (optional): High-level areas affected
- `enrichment_summary` (optional): From agent enrichment

## Scope Definition Rules

### Allowed Directories
- Feature-specific directories
- Test directories for affected code
- Shared utilities if needed

### Forbidden Directories
- Config directories (unless explicitly needed)
- Other feature directories
- Core/framework directories

### File Patterns
- Source files for feature
- Test files for feature
- Styles for feature

## Output Schema

```json
{
  "skill": "define-scope",
  "status": "success",
  "ticket_id": "TICKET-123",
  "scope": {
    "allowed_dirs": [
      "src/features/settings",
      "src/components/theme",
      "src/hooks/useTheme",
      "tests/features/settings"
    ],
    "allowed_patterns": [
      "*.ts",
      "*.tsx",
      "*.css",
      "*.spec.ts"
    ],
    "forbidden_dirs": [
      "src/config",
      "src/core",
      "src/features/auth"
    ],
    "forbidden_patterns": [
      "*.config.*",
      "*.env*",
      "package.json",
      "*.lock"
    ],
    "expected_files": {
      "create": [
        "src/components/theme/ThemeToggle.tsx",
        "src/hooks/useTheme.ts"
      ],
      "modify": [
        "src/features/settings/SettingsPage.tsx",
        "src/styles/variables.css"
      ],
      "delete": []
    }
  },
  "rationale": "Scope limited to theme-related components and settings feature",
  "warnings": [
    "Consider if global CSS variables need updating"
  ],
  "next_action": "proceed_to_implementation"
}
```

## Examples

### Focused Scope
```json
{
  "skill": "define-scope",
  "status": "success",
  "scope": {
    "allowed_dirs": ["src/features/auth"],
    "expected_files": {
      "modify": ["src/features/auth/login.ts"]
    }
  },
  "next_action": "proceed_to_implementation"
}
```
