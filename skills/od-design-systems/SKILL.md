---
name: od-design-systems
description: This skill should be used when the user wants UI built in a specific brand style ("make it look like Linear/Stripe/Notion/Tesla/Apple/etc."), when picking a visual direction for landing pages/dashboards/mobile UI/web prototypes, or when a project needs a complete design language (palette, typography, components, layout) without freestyle decisions.
license: Apache-2.0
version: 1.0.0
---

# Open Design — Design Systems Library

151 brand-grade design systems vendored from [nexu-io/open-design](https://github.com/nexu-io/open-design). Each is a complete `DESIGN.md` with palette hex codes, font stacks, component stylings, layout principles, depth/elevation rules, do's/don'ts, responsive behavior, and an agent prompt guide.

## Library location

After install, content lives at: `{config}/skills/od-design-systems/assets/design-systems/`

Each subdirectory contains one `DESIGN.md` file. The `_schema/` folder contains the canonical schema, `defaults.css`, and `tokens.schema.ts` reference.

## Workflow

**Step 1**: Pick a design system based on user intent. See `references/CATALOG.md` for the full list grouped by use case (AI/LLM, Developer Tools, Productivity, Fintech, E-commerce, Media, Automotive, Editorial, Aesthetic modes, Gaming, Enterprise).

Common mappings:
- "Make it look like Linear" → `linear-app/`
- "Stripe-style payment page" → `stripe/`
- "Notion-flavored dashboard" → `notion/`
- "Apple HIG" → `apple/`
- "Tesla luxury landing" → `tesla/`
- "Editorial magazine vibe" → `warm-editorial/` or `editorial/`
- "Brutalist / minimal" → `brutalism/` or `minimal/`

**Step 2**: Read the target `DESIGN.md` (~300–370 lines). It defines 9 sections:

1. Visual Theme & Atmosphere
2. Color Palette & Roles (hex codes for bg/fg/accent/muted/border/surface/semantic)
3. Typography Rules (font stack, weights, scale, line-height, letter-spacing)
4. Component Stylings (buttons/cards/inputs/links)
5. Layout Principles (grid, max-width, gutters, hero/section spacing)
6. Depth & Elevation (shadow levels, anti-patterns)
7. Do's and Don'ts
8. Responsive Behavior (desktop/tablet/phone breakpoints)
9. Agent Prompt Guide

**Step 3**: Apply the system strictly when generating UI. Use ONLY the palette hex codes, font stacks, and component patterns defined. Do NOT freestyle.

## Hard rules

- ❌ NEVER mix two design systems in one artifact — pick ONE and apply it strictly
- ❌ NEVER invent palette colors not in the DESIGN.md hex list
- ❌ NEVER swap fonts unless the DESIGN.md explicitly allows fallbacks
- ✅ ALWAYS read the full DESIGN.md before generating — don't skim
- ✅ ALWAYS apply the "Agent Prompt Guide" section at the bottom of each DESIGN.md
- ✅ Cite the design system used in the artifact comment header

## Compose with other skills

- `od-design-systems` (Linear) + `od-decks` (Swiss layout) → Linear-flavored engineering deck
- `od-design-systems` (Stripe) + native frontend work → Stripe-style pricing page
- `od-design-systems` (Tesla) + hero landing → luxury automotive feel

## Quick example

```
User: "Build a landing page for our tournaments feature in Linear's style"

Agent flow:
1. List ${ASSETS}/design-systems/ — confirm linear-app exists
2. Read ${ASSETS}/design-systems/linear-app/DESIGN.md (full ~370 lines)
3. Note tokens: dark bg #08090A, accent #5E6AD2, Inter 510, sharp 6px radius
4. Build hero + features + CTA following Linear's component rules
5. Output single self-contained HTML in <artifact> tags
```

Where `${ASSETS}` resolves to `{config}/skills/od-design-systems/assets/`.

## See also

- `references/CATALOG.md` — full curated catalog of all 151 systems grouped by use case
- `assets/design-systems/_schema/AGENTS.md` — schema spec for authoring new DESIGN.md files

## License & attribution

Vendored from [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0). Individual design systems credit their original brand inspirations. Preserve license headers when redistributing.
