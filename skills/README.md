# Agent Skills - Canonical Source

This is the **canonical location** for all skills used by LLM providers.

## How Skills Are Synced

Skills are synced to provider directories via `bin/sync-skills.sh`:

```bash
# From Autonom8-core directory
bin/sync-skills.sh
```

This copies skills to:
- `.claude/skills/` - Claude Code
- `.codex/skills/` - OpenAI Codex
- `.cursor/skills/` - Cursor (nightly)

## Adding or Modifying Skills

1. **Create/Edit here** in `modules/Autonom8-Agents/skills/`
2. **Run sync**: `bin/sync-skills.sh`
3. **Commit submodule**:
   ```bash
   cd modules/Autonom8-Agents
   git add skills/
   git commit -m "feat: add/update skill-name"
   git push
   ```
4. **Update parent**:
   ```bash
   cd ../..
   git add modules/Autonom8-Agents
   git commit -m "chore: update Autonom8-Agents submodule"
   git push
   ```

## Skill Format

Skills use the **Agent Skills standard**:

```
skill-name/
└── SKILL.md
```

SKILL.md requires YAML frontmatter:

```yaml
---
name: skill-name
description: Brief description (max 500 chars)
---

# skill-name - Full Title

## Input Schema
...

## Instructions
...

## Output Format
...
```

## Available Skills (26)

| Category | Skills |
|----------|--------|
| **QA** | qa-visual-qa-web, qa-visual-interaction, qa-smoke-test, qa-performance, qa-visual-flutter, qa-visual-ios, qa-backend, qa-data, qa-exploratory, qa-integration-check, qa-run-tests, qa-browser-check |
| **Proactive** | third-party-theming-audit (design phase - detects third-party styling conflicts before implementation) |
| **Review** | review-code-review, review-validate-ticket |
| **Validation** | validate-ticket, lint, check-imports, deploy-check |
| **Generation** | generate-catalog, catalog-update, test-gen-ui |
| **Analysis** | security-scan, a11y-check, bundle-analyze, css-audit |

## Documentation

- Full changelog: `go-autonom8/WED_SKILLS_CHANGELOG.md`
- Skills system docs: `go-autonom8/README.md` → Skills System section
