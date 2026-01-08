# arch-review

Review code changes for architectural compliance and design patterns.

## Purpose

Validates that implementation follows established architectural patterns, respects module boundaries, and maintains separation of concerns. Catches architectural drift before it becomes technical debt.

## Platforms

All platforms

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "files": ["src/features/auth/api.ts"],
  "architecture": "clean|layered|hexagonal|mvc",
  "check_boundaries": true,
  "check_dependencies": true,
  "allowed_patterns": ["repository", "service", "controller"]
}
```

- `project_dir` (required): Root directory of project
- `files` (optional): Files to review
- `architecture` (optional): Expected architecture style
- `check_boundaries` (optional): Validate layer boundaries
- `check_dependencies` (optional): Check dependency direction
- `allowed_patterns` (optional): Valid design patterns

## Review Checks

### Layer Boundaries
- UI should not import from data layer
- Domain should not depend on infrastructure
- Services should not call controllers

### Dependency Direction
- Dependencies point inward (clean architecture)
- No circular dependencies
- Proper abstraction at boundaries

### Design Patterns
- Repository pattern for data access
- Service pattern for business logic
- Factory pattern for object creation

### Module Cohesion
- Related code grouped together
- Single responsibility per module
- Clear public API per module

## Output Schema

```json
{
  "skill": "arch-review",
  "status": "compliant|violations|review_needed",
  "architecture_detected": "layered",
  "summary": {
    "files_reviewed": 12,
    "violations": 3,
    "warnings": 5
  },
  "violations": [
    {
      "file": "src/ui/UserProfile.tsx",
      "line": 15,
      "type": "boundary_violation",
      "message": "UI component directly imports data layer",
      "import": "import { userRepository } from '../data/repositories'",
      "suggestion": "Import from service layer: import { userService } from '../services'"
    },
    {
      "file": "src/services/AuthService.ts",
      "line": 8,
      "type": "circular_dependency",
      "message": "Circular dependency detected",
      "cycle": ["AuthService", "UserService", "AuthService"]
    }
  ],
  "dependency_graph": {
    "modules": ["ui", "services", "data", "domain"],
    "edges": [
      {"from": "ui", "to": "services"},
      {"from": "services", "to": "domain"},
      {"from": "data", "to": "domain"}
    ]
  },
  "next_action": "fix|approve|discuss"
}
```

## Error Handling

- Architecture not detected: Ask for configuration
- Complex codebase: Review in sections
- Mixed patterns: Report with recommendations

## Examples

### Compliant
```json
{
  "skill": "arch-review",
  "status": "compliant",
  "summary": {
    "files_reviewed": 15,
    "violations": 0,
    "warnings": 2
  },
  "next_action": "approve"
}
```
