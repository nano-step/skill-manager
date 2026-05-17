---
name: od-decks
description: This skill should be used when the user asks to create a slide deck, sprint demo, weekly update, pitch presentation, or magazine-style HTML slides. Three production templates available (E-Ink editorial, Swiss International, free-form canvas) with strict palettes, typography, and 10-layout pools.
license: Apache-2.0
version: 1.0.0
---

# Open Design — Decks Skill

Production-quality HTML deck templates extracted from [nexu-io/open-design](https://github.com/nexu-io/open-design). Each template encodes strict design contracts (palette, typography, layout pool) so the agent ships editorial-grade output instead of generic Bootstrap cards.

## Templates available

| Template ID | Style | Best for | Library path |
|---|---|---|---|
| `deck-guizang-editorial` | E-Ink magazine, 10 layouts × 5 palettes (Monocle/Indigo/Forest/Kraft/Dune) | Narrative pitches, founder letters, editorial product launches | `assets/decks/deck-guizang-editorial/` |
| `deck-swiss-international` | Swiss International typographic style | Engineering decks, sprint demos, technical talks | `assets/decks/deck-swiss-international/` |
| `deck-open-slide-canvas` | Free-form canvas slides | Workshops, brainstorms, visual storyboards | `assets/decks/deck-open-slide-canvas/` |

> **Note**: `assets/` is the runtime path after `skill-manager install od-decks` copies it to `{config}/skills/od-decks/assets/`. Resolve it as `{config}/skills/od-decks/assets/` where `{config}` is the active OpenCode config dir.

## Workflow

**Step 1**: Pick a template based on user context (or ask).

**Step 2**: Read the template's `SKILL.md` from `assets/decks/<template-id>/SKILL.md`. It encodes:
- The complete visual contract (palette hex codes, font stacks, layout pool)
- Hard rules (no gradients, no shadows, no lorem ipsum)
- The layout pool — e.g. `deck-guizang-editorial` has L01–L10: Hero Cover, Act Divider, Big Numbers Grid, Quote+Image, Image Grid, Pipeline, Hero Question, Big Quote, Before/After, Mixed Media.

**Step 3**: Read `assets/decks/<template-id>/example.html` and `example.md` to see a working reference.

**Step 4**: Generate a single self-contained HTML file wrapped in `<artifact>` tags. The HTML must:
- Use ONLY the palette hex codes specified in the template — never invent new colors
- Use the specified font stack (e.g. Playfair Display + Inter for guizang)
- Implement keyboard ← → navigation between slides + hash sync
- Cover ALL user content; short briefs = 6–12 slides; long briefs = more
- Draw images as inline CSS/SVG (color blocks + simple line art) — never link external image URLs

**Step 5**: Save the final HTML to the user's working directory with a meaningful name. NEVER write to `assets/decks/` — that folder is read-only reference.

## Hard rules (apply to ALL decks)

- ❌ NEVER use Lorem ipsum, placeholder images, fake data, or `via.placeholder.com`
- ❌ NEVER add gradients, drop-shadow, blur effects, emoji decorations, or rounded-pill circles
- ❌ NEVER invent palette colors — use ONLY the hex codes from the template's SKILL.md
- ❌ NEVER mix two templates' visual signatures in one deck
- ✅ ALWAYS use real content from the user's brief
- ✅ ALWAYS draw images as inline CSS/SVG
- ✅ ALWAYS produce a single-file HTML with no external JS dependencies

## Compose with other skills

- `od-decks` (Swiss layout) + `od-design-systems` (Linear palette) → Linear-flavored engineering deck
- `od-decks` (guizang) + `od-media-prompts` (motion intro) → magazine deck with cinematic opener

## Quick example

```
User: "Make a sprint demo deck for WIN-6884 Tournaments"

Agent flow:
1. Pick template → deck-swiss-international (engineering context)
2. Read assets/decks/deck-swiss-international/SKILL.md
3. Read assets/decks/deck-swiss-international/example.html
4. Generate single-file HTML deck:
   - L01 Hero: "Sprint 80 · Tournaments Ship"
   - L02 Act: "What we built"
   - L03 Big Numbers: WIN-6884 metrics
   - L04 Quote+Image: Tech lead callout
   - L06 Pipeline: API → Leaderboard → Player flow
5. Save as sprint-80-tournaments-demo.html
```

## License & attribution

Templates vendored from [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0). The `deck-guizang-editorial` template was originally created by [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill). Preserve license headers when redistributing.
