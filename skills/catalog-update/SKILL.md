---
name: catalog-update
description: Update CATALOG.md incrementally from a deployed ticket. Appends new files_created entries without regenerating entire catalog.
---

# catalog-update - Incremental Catalog Update

Updates CATALOG.md with files from a single deployed ticket. Faster than full regeneration when processing tickets one at a time.

## Input Schema

```json
{
  "project_dir": "/path/to/project",
  "ticket_path": "/path/to/deployed/ticket.json",
  "catalog_path": "src/CATALOG.md"
}
```

## Instructions

### 1. Load Deployed Ticket

```bash
# Read ticket JSON
cat "$ticket_path" | jq '.files_created'
```

### 2. Extract files_created

```json
{
  "files_created": [
    {
      "path": "src/components/MetricCard.js",
      "type": "component",
      "intended_use": "Import { MetricCard } from './MetricCard.js'"
    }
  ]
}
```

### 3. Read Existing Catalog

```bash
# Load current catalog
cat "$project_dir/$catalog_path"
```

### 4. Append New Entries

For each file in files_created:
- Determine category (Components, Styles, Utils, Data)
- Check if already in catalog (skip duplicates)
- Append to appropriate section

### 5. Update Changelog

```markdown
## Changelog

- **2026-01-07**: Added MetricCard component via TICKET-OXY-003-A.3
```

## Output Format

```json
{
  "skill": "catalog-update",
  "status": "success|skipped|failure",
  "ticket_id": "TICKET-OXY-003-A.3",
  "files_added": 2,
  "files_skipped": 1,
  "categories_updated": ["Components", "Styles"],
  "catalog_path": "src/CATALOG.md",
  "changes": [
    {
      "action": "added",
      "file": "src/components/impact/MetricCard.js",
      "category": "Components"
    },
    {
      "action": "skipped",
      "file": "src/data/metrics.json",
      "reason": "already_exists"
    }
  ],
  "errors": [],
  "next_action": "proceed"
}
```

## Decision Logic

```
Ticket has files_created?
    NO  → status: "skipped", reason: "no files_created"

CATALOG.md exists?
    NO  → Create new catalog with ticket files
    YES → Append to existing catalog

All files already in catalog?
    YES → status: "skipped", reason: "all_duplicates"
    NO  → status: "success", files_added: N
```

## Usage Examples

**Update after single ticket deployment:**
```json
{
  "project_dir": "/projects/oxygen_site",
  "ticket_path": "/projects/oxygen_site/tickets/sprint_current/deployed/TICKET-OXY-003-A.3.json",
  "catalog_path": "src/CATALOG.md"
}
```

**Custom catalog location:**
```json
{
  "project_dir": "/projects/api-service",
  "ticket_path": "/projects/api-service/tickets/deployed/TICKET-API-001.json",
  "catalog_path": "docs/CATALOG.md"
}
```

## Difference from generate-catalog

| Aspect | catalog-update | generate-catalog |
|--------|----------------|------------------|
| Scope | Single ticket | All deployed tickets |
| Speed | Fast (~1-2s) | Slower (~5-10s) |
| Use case | Post-deployment hook | Full rebuild |
| Duplicates | Skips existing | Overwrites all |

## Token Efficiency

- Single ticket processing
- Incremental append
- ~1-2 second execution
- Minimal file I/O
