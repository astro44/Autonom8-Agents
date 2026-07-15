---
name: design-taste-web
description: Generation-time design taste for web UI work. Anti-cliche bans, layout and motion hard rules, and client-intent dials. Advisory only - shapes drafts; declared measured contracts remain the sole gate authority.
---

# design-taste-web — Generation-Time Design Taste (Web)

<!--
Adapted from taste-skill v2 (https://github.com/Leonxlnx/taste-skill, MIT
License, Copyright Leonxlnx). Framework-specific prescriptions (Tailwind
class names, GSAP/Next.js idioms) removed; rules restated framework-neutral.
AUTHORITY NOTE (T5): this skill is generation-side guidance ONLY. It must
never gate, score, or block. The declared rendered-surface contract in the
tenant project.yaml is the only taste authority. Prompts propose; contracts
dispose.
-->

Loaded for: `dev_design`, `dev_implement` on UI/web platforms.
Purpose: raise first-draft visual quality so fewer closeout repairs are
needed. Read the brief, set the dials, then execute within the hard rules.

## 1. Read the dials (from tenant project.yaml, defaults if absent)

```yaml
design.taste_dials:
  design_variance: 5    # 1 = strict/symmetric/centered … 10 = experimental/asymmetric
  motion_intensity: 4   # 1 = static, hover-only … 10 = cinematic, scroll-driven
  visual_density: 5     # 1 = gallery-sparse … 10 = dashboard-dense
```

State a one-line design direction before writing any code (audience + tone +
one distinctive move). Every layout/motion choice should be explainable from
the brief and the dials.

## 2. Banned clichés (zero tolerance unless the brief demands it)

- Three (or more) equal feature cards in a row with identical dimensions and
  structure. Vary size, content weight, or layout role.
- Centered hero as a default when `design_variance > 4`. Centered is a
  choice for manifesto-style briefs, not a reflex.
- Eyebrow micro-labels above every section heading. Maximum one per three
  sections.
- A single default sans-serif for a brand brief that asks for character.
  Choose type with intent; pair a display face with a workhorse body face.
- The beige + brass + oxblood "premium" palette as a default. Derive palette
  from the brand, not from habit.
- Em-dashes in interface copy. Rewrite the sentence.
- Emoji in code, comments, or interface copy.
- Placeholder-shaped content: lorem ipsum, "Feature 1/2/3", repeated
  identical metric values, images that are obviously stock-generic.

## 3. Layout hard rules

- The hero must fit the initial viewport. Headline wraps to at most 2 lines
  at desktop; supporting text at most ~20 words.
- Navigation fits on one line at desktop; total header height ≤ 80px.
- No two consecutive sections share the same layout family (same grid shape,
  same image/text arrangement). Maximum two image+text zigzags in a row.
- Grids have exactly as many cells as there are real content items. Never
  pad a grid with empty or filler cells.
- Section vertical rhythm is deliberate and consistent; avoid both cramped
  (< 48px between major sections) and cavernous gaps.
- Density follows `visual_density`: sparse briefs get generous whitespace and
  large type; dense briefs get tight, aligned, information-rich modules —
  but empty regions are never "design", they are absence.

## 4. Typography and color

- Establish a modular type scale (e.g. 1.2–1.333 ratio) and use only steps
  from it. Body text 16–18px equivalent; KPI/hero numbers visibly dominant
  (≥ 1.8× body).
- Line length 45–75 characters for prose; headings tighter.
- Text contrast meets WCAG AA (4.5:1 normal, 3:1 large) — the deterministic
  contract measures this; design for margin, not the minimum.
- One accent color doing real work beats four decorating. Derive neutrals
  from a single hue temperature; avoid pure #000/#FFF pairings on large
  surfaces.

## 5. Motion discipline

- Every animation must be justifiable in one sentence as hierarchy,
  storytelling, feedback, or state. If the sentence is "it looks alive",
  cut it.
- Scale with `motion_intensity`; at ≤ 3 use only micro-feedback (hover,
  focus, pressed).
- Maximum one marquee/auto-scroller per page.
- Respect `prefers-reduced-motion` whenever intensity > 3.
- Animations must settle: no infinite attention-seeking loops on content
  surfaces; entrance animations complete within ~700ms.
- Never drive per-frame visual state from scroll event listeners; use
  IntersectionObserver or CSS-native scroll effects.

## 6. Pre-flight self-check (advisory)

Before returning, verify: no banned cliché present; hero fits viewport with
≤ 2 headline lines; no repeated layout family; grids fully populated; type
scale consistent; contrast margins comfortable; every animation justified;
copy free of em-dashes, emoji, and placeholder text.

This checklist is self-discipline, not proof. The worker's rendered-surface
contract will measure the page; design so the measurements are comfortable,
not barely passing.
