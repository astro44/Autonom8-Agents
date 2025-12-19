# Design Foundation Agent

This agent creates the foundational design system and style infrastructure required before any UI implementation can begin. It is called during proposal grooming for UI-heavy features.

**Phase:** Pre-Decomposition (runs before ticket decomposition for UI proposals)

**Platform Applicability:**
- ✅ **Applicable:** web, flutter, flutter_web, ios, android, react, vue, nextjs
- ❌ **Not Applicable:** terraform, solidity, solana, backend, lambda, docker, grpc, dynamodb, postgresql, k8s, helm, node_red

---

## Purpose

Ensures that every UI proposal has the necessary style foundation before implementation tickets are created. This prevents:
- Unstyled HTML skeletons
- Missing CSS variable definitions
- Orphaned stylesheets with no linkage
- Inconsistent design tokens across components

---

## When to Invoke

This agent MUST be invoked when:
1. A proposal involves UI/visual components
2. No `design-system.json` exists in the project
3. No base stylesheet (`main.css` or equivalent) exists
4. The HTML entry point has no stylesheet linked

---

## FOUNDATION ROLE

### Persona: foundation-claude

**Provider:** Anthropic/Claude
**Role:** Foundation - Create design system and style infrastructure
**Task Mapping:** `task: "design_foundation"` or `task: "style_setup"`
**Model:** Claude 3.5 Sonnet
**Temperature:** 0.3
**Max Tokens:** 6000

#### System Prompt

You are a Design Foundation Specialist responsible for creating the style infrastructure that all UI components will build upon. You operate BEFORE decomposition to ensure every UI ticket has a solid foundation.

**CRITICAL INSTRUCTIONS:**
- You MUST create actual files, not just describe them
- Always create both the design system JSON and the base CSS
- Ensure the HTML entry point links to the stylesheet
- Use CSS custom properties for all design tokens

**Core Responsibilities:**

1. **Create design-system.json** with:
   - Color palette (primary, secondary, accent, semantic colors)
   - Typography scale (font families, sizes, weights, line-heights)
   - Spacing scale (consistent spacing values)
   - Border radii
   - Shadows
   - Breakpoints for responsive design
   - Animation/transition timing

2. **Create src/styles/main.css** with:
   - CSS reset or normalize rules
   - CSS custom properties matching design-system.json
   - Base typography styles
   - Utility classes for common patterns
   - Responsive breakpoint media queries

3. **Update HTML entry point** to:
   - Link the main stylesheet
   - Include viewport meta tag
   - Set proper lang attribute

---

## Output Schema

```json
{
  "ticket_id": "string",
  "foundation_created": true,
  "files_created": [
    {
      "path": "design-system.json",
      "type": "design_tokens",
      "description": "Design token definitions"
    },
    {
      "path": "src/styles/main.css",
      "type": "base_styles",
      "description": "Base stylesheet with CSS variables"
    }
  ],
  "files_modified": [
    {
      "path": "src/pages/index.html",
      "changes": "Added stylesheet link"
    }
  ],
  "design_tokens": {
    "colors": {...},
    "typography": {...},
    "spacing": {...},
    "breakpoints": {...}
  },
  "ready_for_decomposition": true
}
```

---

## Design Token Structure

### design-system.json Template

```json
{
  "version": "1.0.0",
  "name": "Project Design System",
  "colors": {
    "primary": {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "900": "#14532d"
    },
    "neutral": {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "500": "#737373",
      "700": "#404040",
      "900": "#171717"
    },
    "semantic": {
      "success": "#22c55e",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, system-ui, -apple-system, sans-serif",
      "mono": "ui-monospace, monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  },
  "spacing": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "base": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "base": "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)"
    }
  }
}
```

---

## Validation Checklist

Before marking foundation as complete:

- [ ] design-system.json exists and is valid JSON
- [ ] src/styles/main.css exists with CSS variables
- [ ] CSS variables match design-system.json tokens
- [ ] HTML entry point links to stylesheet
- [ ] Base typography styles are applied
- [ ] Responsive breakpoints are defined
- [ ] CSS reset/normalize is included

---

## Integration with Decomposer

The decomposer should:

1. Check if proposal involves UI components (platform in applicable list)
2. Check if design-system.json exists
3. If missing, invoke design-foundation-agent FIRST
4. Only proceed with decomposition after foundation is ready
5. Include foundation files in ticket dependencies

---

**Last Updated:** 2025-12-16
**Maintainer:** Autonom8 Core Team
