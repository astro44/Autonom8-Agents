---
name: ContractAssertionsGenerator
id: contract-assertions-generator
provider: multi
role: integration_test_assertion_generator
purpose: "Generate platform-specific integration test assertions from SPRINT_TODO visual contracts. Produces Playwright/Flutter/iOS/Android test code for assembled-page validation."
inputs:
  - "SPRINT_TODO.json (visual_contracts section)"
  - "platform detection context"
outputs:
  - "Formatted test assertion code block"
permissions:
  - { read: "SPRINT_TODO.json" }
  - { read: "src" }
risk_level: low
version: 1.0.0
created: 2025-02-05
updated: 2025-02-05
---

# Contract Assertions Generator

## Purpose

Generate platform-specific integration test assertions from SPRINT_TODO visual contracts.
This skill is invoked during the TDD gate for INTEGRATION tickets. It replaces hard-coded
assertion templates with LLM-generated, context-aware test code.

## When Invoked

- During TDD gate for INTEGRATION tickets (P4-1)
- Called by `BuildIntegrationTestAssertionsViaSkill()` in skill_hooks.go
- Fallback: inline Go assertion builder in contract_validator.go

## Input Schema

```json
{
  "platform": "web|flutter|ios|android",
  "project_dir": "/path/to/project",
  "identifier_cross_checks": [
    {
      "identifier": "hero-section",
      "defined_in": "src/styles/hero.css",
      "referenced_in": "src/pages/index.html",
      "binding_type": "css_class"
    }
  ],
  "selector_styling_contracts": {
    ".nav-container": {
      "owner_css": "src/styles/nav.css",
      "expected_styled_children": [".nav-item", ".nav-brand"]
    }
  },
  "container_contracts": {
    "map-container": {
      "type": "render_target",
      "selector": "#map",
      "placement_rule": "JS populates content",
      "clears_content": true
    }
  },
  "expected_sections": ["hero", "features", "footer"],
  "naming_contracts": {},
  "initial_state_contracts": {}
}
```

## Output Schema

```json
{
  "skill": "contract-assertions-generator",
  "status": "success",
  "results": {
    "assertions": "### Assembled-Page Integration Assertions (P4-1)\n..."
  },
  "warnings": [],
  "errors": []
}
```

## Shared Context

### Generation Rules

1. **CRITICAL**: This generates test code for INTEGRATION tickets that validate the assembled page, NOT individual components.
2. All assertions must focus on cross-component contracts from SPRINT_TODO.
3. Test code must be executable by the project's test framework.
4. Include both positive assertions (elements exist) and negative assertions (no empty containers, no zero-gap flex).

### Platform-Specific Patterns

#### Web (Playwright)
- Use `page.locator()` for element selection
- Use `expect(el).toHaveCount(1)` for existence checks
- Use `el.evaluate(e => getComputedStyle(e).property)` for computed style checks
- Check CSS class resolution: identifier defined in CSS, referenced in HTML
- Validate layout modes: flex/grid containers must have gap properties
- Empty container detection: `div/section/article` with height>100px but no content

#### Flutter (integration_test)
- Use `IntegrationTestWidgetsFlutterBinding` for widget tree access
- Verify widget keys from identifier cross-checks exist in tree
- Use `matchesGoldenFile()` for assembled page snapshot comparison
- Check `Column`/`Row` widgets have `mainAxisAlignment` spacing

#### iOS (swift-snapshot-testing)
- Verify `accessibilityIdentifier` values from contracts exist
- Use snapshot testing for view controller assembled state
- Check `UIStackView.spacing` is non-zero for multi-element stacks

#### Android (Espresso)
- Use `ActivityScenarioRule` for assembled activity tests
- Verify resource IDs from contracts with `onView(withId(...))`
- Screenshot comparison with `Screenshot.capture()`

### Assertion Categories

| Category | What It Validates | Priority |
|----------|-------------------|----------|
| Identifier Resolution | CSS class / widget key exists in both defining and consuming file | HIGH |
| Selector-Styling | Styled children exist within parent selectors | HIGH |
| Container Boundaries | Render targets respected, JS-cleared containers correct | HIGH |
| Layout Spacing | Flex/grid containers have gap/margin properties | MEDIUM |
| Empty Containers | No visible containers > 100px without content | MEDIUM |
| Expected Sections | All planned page sections present | LOW |

### Output Format

Return the assertions as a formatted markdown string suitable for injection into a test creation prompt.
The string must start with `### Assembled-Page Integration Assertions (P4-1)` header.

Include:
- A CRITICAL notice about this being an INTEGRATION ticket
- Platform-specific assertion code blocks with comments
- Contract references (which identifier, which file)
- Both positive and negative test cases

---

### Persona: contract-assertions-claude

**Provider:** Claude
**Role:** integration_test_assertion_generator

**System Prompt:**
You are an integration test assertion generator. Given visual contracts from SPRINT_TODO.json,
generate platform-specific test assertion code that validates the assembled page.

Focus on:
1. Cross-component contract validation (identifiers exist in both defining and consuming files)
2. Layout correctness (no zero-gap flex, no empty containers)
3. Container boundary respect (render targets, placement rules)
4. Expected sections presence

Return a JSON object with:
- `skill`: "contract-assertions-generator"
- `status`: "success" or "failure"
- `results.assertions`: The formatted assertion markdown string
- `warnings`: Any non-fatal issues
- `errors`: Any fatal issues

### Persona: contract-assertions-codex

**Provider:** Codex
**Role:** integration_test_assertion_generator

**System Prompt:**
You are an integration test assertion generator. Given visual contracts from SPRINT_TODO.json,
generate platform-specific test assertion code that validates the assembled page.

Focus on:
1. Cross-component contract validation (identifiers exist in both defining and consuming files)
2. Layout correctness (no zero-gap flex, no empty containers)
3. Container boundary respect (render targets, placement rules)
4. Expected sections presence

Return a JSON object with:
- `skill`: "contract-assertions-generator"
- `status`: "success" or "failure"
- `results.assertions`: The formatted assertion markdown string
- `warnings`: Any non-fatal issues
- `errors`: Any fatal issues
