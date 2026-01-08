# generate-catalog

Regenerate CATALOG.md from files_created metadata.

## Purpose

Automatically generate or update the project's CATALOG.md file by scanning deployed ticket metadata and source files. Creates a comprehensive inventory of all components, modules, and their relationships for project documentation and navigation.

## Platforms

All platforms (platform-agnostic)

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "tickets_dir": "/path/to/tickets",
  "output_path": "src/CATALOG.md",
  "include_tests": false,
  "include_deps": true,
  "format": "markdown|json",
  "group_by": "type|directory|ticket"
}
```

- `project_dir` (required): Root directory of target project
- `tickets_dir` (optional): Directory containing deployed ticket JSON files
- `output_path` (optional): Where to write CATALOG.md, default "src/CATALOG.md"
- `include_tests` (optional): Include test files in catalog
- `include_deps` (optional): Include dependency information
- `format` (optional): Output format
- `group_by` (optional): How to organize catalog entries

## Catalog Sources

### 1. Ticket Metadata (Primary)
Scan deployed ticket JSON files for `files_created` arrays:
```json
{
  "id": "OXY-042",
  "files_created": [
    {"path": "src/components/Dashboard/ImpactChart.tsx", "type": "component"},
    {"path": "src/components/Dashboard/ImpactChart.css", "type": "styles"}
  ]
}
```

### 2. Source Code Analysis (Secondary)
If tickets not available, scan source directories:
- Components (React, Vue, Flutter widgets)
- Services (API clients, business logic)
- Utilities (helpers, formatters)
- Types (interfaces, models)
- Tests (if include_tests enabled)

### 3. Package Manifests
Extract dependency information from:
- `package.json` (Web)
- `pubspec.yaml` (Flutter)
- `requirements.txt` / `pyproject.toml` (Python)
- `go.mod` (Golang)

## Catalog Structure

```markdown
# Project Catalog

> Auto-generated from deployed tickets and source analysis
> Last updated: 2024-01-03T10:30:00Z

## Components

### Dashboard
| File | Type | Ticket | Description |
|------|------|--------|-------------|
| `src/components/Dashboard/ImpactChart.tsx` | Component | OXY-042 | Impact metrics visualization |
| `src/components/Dashboard/ImpactChart.css` | Styles | OXY-042 | Chart styling |
| `src/components/Dashboard/index.ts` | Barrel | OXY-040 | Dashboard exports |

### Common
| File | Type | Ticket | Description |
|------|------|--------|-------------|
| `src/components/common/Button.tsx` | Component | OXY-001 | Reusable button |

## Services
| File | Type | Ticket | Description |
|------|------|--------|-------------|
| `src/services/api.ts` | Service | OXY-010 | API client |

## Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| chart.js | ^4.4.0 | Charts |

## Statistics
- Total Files: 156
- Components: 42
- Services: 12
- Tests: 89
- Tickets Deployed: 23
```

## Execution Steps

1. **Scan Tickets**: Load deployed ticket JSON files
2. **Extract Files**: Collect files_created from each ticket
3. **Scan Source**: Find additional files not in tickets
4. **Analyze Types**: Categorize each file (component, service, etc.)
5. **Extract Descriptions**: Parse JSDoc/docstrings for descriptions
6. **Load Dependencies**: Parse package manifests
7. **Generate Catalog**: Build structured markdown
8. **Write Output**: Save CATALOG.md

## Output Schema

```json
{
  "skill": "generate-catalog",
  "status": "success|partial|failure",
  "results": {
    "catalog_path": "src/CATALOG.md",
    "entries": {
      "components": 42,
      "services": 12,
      "utilities": 8,
      "types": 15,
      "tests": 89
    },
    "tickets_processed": 23,
    "files_cataloged": 156,
    "orphan_files": 5,
    "dependencies": 34,
    "generated_at": "2024-01-03T10:30:00Z"
  },
  "warnings": [
    "5 files not linked to any ticket"
  ],
  "next_action": "commit|review|investigate"
}
```

### Status Values
- `success`: Catalog generated successfully
- `partial`: Some files couldn't be categorized
- `failure`: Could not generate catalog

### Next Action Values
- `commit`: Catalog ready to commit
- `review`: Manual review needed for orphan files
- `investigate`: Missing data or errors

## File Type Detection

### By Extension
```
.tsx, .jsx → component (if in components/)
.ts, .js → service/utility
.css, .scss, .less → styles
.test.ts, .spec.ts → test
.d.ts → types
```

### By Content
```
export default function → component
export class.*Service → service
export interface → types
describe('...') → test
```

### By Directory
```
components/ → component
services/ → service
utils/, helpers/ → utility
types/, models/ → types
__tests__/, tests/ → test
```

## Examples

### Full Catalog
```json
{
  "skill": "generate-catalog",
  "status": "success",
  "results": {
    "catalog_path": "src/CATALOG.md",
    "entries": {
      "components": 42,
      "services": 12,
      "utilities": 8,
      "types": 15,
      "tests": 89
    },
    "tickets_processed": 23,
    "files_cataloged": 166,
    "orphan_files": 0,
    "dependencies": 34,
    "generated_at": "2024-01-03T10:30:00Z"
  },
  "warnings": [],
  "next_action": "commit"
}
```

### With Orphan Files
```json
{
  "skill": "generate-catalog",
  "status": "partial",
  "results": {
    "catalog_path": "src/CATALOG.md",
    "entries": {
      "components": 38,
      "services": 10,
      "utilities": 6,
      "unknown": 5
    },
    "tickets_processed": 20,
    "files_cataloged": 59,
    "orphan_files": 5,
    "orphan_list": [
      "src/legacy/oldComponent.tsx",
      "src/deprecated/helper.ts"
    ]
  },
  "warnings": [
    "5 files not linked to any ticket - may be legacy code"
  ],
  "next_action": "review"
}
```

### No Tickets (Source Scan Only)
```json
{
  "skill": "generate-catalog",
  "status": "success",
  "results": {
    "catalog_path": "src/CATALOG.md",
    "entries": {
      "components": 25,
      "services": 8,
      "utilities": 4,
      "types": 10
    },
    "tickets_processed": 0,
    "files_cataloged": 47,
    "source": "directory_scan",
    "generated_at": "2024-01-03T10:30:00Z"
  },
  "warnings": [
    "No tickets found - catalog generated from source scan only"
  ],
  "next_action": "commit"
}
```
