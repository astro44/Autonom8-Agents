# normalize-schema

Normalize and validate data schemas for consistency.

## Purpose

Analyzes and normalizes data schemas (JSON Schema, OpenAPI, database schemas) to ensure consistency, completeness, and adherence to project conventions. Identifies schema drift and suggests corrections.

## Platforms

All (data structures exist across all platforms)

## Input Schema

```json
{
  "schema_type": "json_schema|openapi|database|proto",
  "schema_content": "...",
  "schema_path": "/path/to/schema.json",
  "project_conventions": {
    "naming": "camelCase|snake_case|PascalCase",
    "required_fields": ["id", "created_at", "updated_at"],
    "forbidden_types": ["any"]
  },
  "reference_schemas": ["/path/to/reference.json"]
}
```

- `schema_type` (required): Type of schema being normalized
- `schema_content` (required if no path): Raw schema content
- `schema_path` (required if no content): Path to schema file
- `project_conventions` (optional): Project-specific rules
- `reference_schemas` (optional): Schemas to check compatibility against

## Normalization Rules

### Naming Conventions
- Field names follow project standard (camelCase, snake_case, etc.)
- Type names are PascalCase
- Enum values are UPPER_SNAKE_CASE

### Required Metadata
- All objects have `id` field
- Timestamps use ISO 8601 format
- Nullable fields explicitly marked

### Type Safety
- No `any` or `object` without properties
- Arrays have explicit item types
- Enums preferred over free-form strings

## Output Schema

```json
{
  "skill": "normalize-schema",
  "status": "success",
  "schema_type": "json_schema",
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [
      "Field 'userName' should be 'user_name' per project convention"
    ]
  },
  "normalization": {
    "applied": true,
    "changes": [
      {
        "path": "$.properties.userName",
        "change": "renamed",
        "from": "userName",
        "to": "user_name"
      },
      {
        "path": "$.properties.status",
        "change": "type_refined",
        "from": "string",
        "to": "enum['active', 'inactive', 'pending']"
      }
    ]
  },
  "normalized_schema": "...",
  "compatibility": {
    "breaking_changes": false,
    "backward_compatible": true,
    "notes": ["Added optional field 'metadata'"]
  },
  "recommendations": [
    "Add description to 'status' field",
    "Consider adding 'updated_at' timestamp"
  ],
  "next_action": "apply_changes|review_breaking|manual_review"
}
```

## Schema Type Specifics

### JSON Schema
- Validates against JSON Schema Draft-07
- Ensures `$id` and `$schema` present
- Validates `$ref` references

### OpenAPI
- Validates against OpenAPI 3.0/3.1
- Checks path parameter consistency
- Validates response schemas

### Database (SQL)
- Normalizes table/column naming
- Checks index coverage
- Validates foreign key relationships

### Protocol Buffers
- Checks field numbering
- Validates package naming
- Ensures backward compatibility

## Examples

### Valid Schema
```json
{
  "skill": "normalize-schema",
  "status": "success",
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": []
  },
  "normalization": {
    "applied": false,
    "changes": []
  },
  "next_action": "proceed"
}
```

### Schema with Issues
```json
{
  "skill": "normalize-schema",
  "status": "success",
  "validation": {
    "valid": false,
    "errors": [
      "Missing required field 'id' in User schema"
    ]
  },
  "normalization": {
    "applied": true,
    "changes": [
      {"path": "$.User", "change": "added_field", "field": "id", "type": "string"}
    ]
  },
  "next_action": "review_changes"
}
```
