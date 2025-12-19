# Autonom8 Test Templates

Generic test templates that apply to all web projects. These are framework-level tests, not project-specific.

## Structure

```
test-templates/
├── integration/
│   └── visual-qa.spec.js    # Visual QA tests (Playwright)
└── README.md
```

## Usage

Projects should symlink to these templates rather than copying them:

```bash
# From project root
cd tests/integration
ln -s ../../../../../../modules/Autonom8-Agents/templates/test-templates/integration/visual-qa.spec.js visual-qa.spec.js
```

## What These Tests Cover

### visual-qa.spec.js

Universal web quality checks:

| Test Category | What It Detects |
|--------------|-----------------|
| Animation Detection | Missing CSS animations, parallax layers |
| Visual Element Validation | Hero styling, CTA buttons, statistics |
| prefers-reduced-motion | Accessibility compliance |
| JavaScript Initialization | Module loading, component init |
| Data Quality & i18n | Raw translation keys, NaN values |
| Navigation Completeness | Dead nav links, orphan sections |
| Interactive Components | Empty containers, broken maps |
| Asset Validation | Placeholder images, broken media |

## When to Create Project-Specific Tests

Only create tests in the project's `tests/` folder when:
- Testing project-specific acceptance criteria from tickets
- Testing custom components unique to that project
- Testing specific business logic

## Updates

Framework tests are maintained in Autonom8-Agents. Updates automatically apply to all projects via symlinks.
