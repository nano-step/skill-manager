---
name: od-media-prompts
description: This skill should be used when the user wants to generate posters, illustrations, infographics, cinematic videos, motion graphics, product reveals, kinetic typography, or any text-to-image/video output. Provides 102 battle-tested prompt templates with thumbnail provenance to adapt rather than write from scratch.
license: Apache-2.0
version: 1.0.0
---

# Open Design — Media Prompts Library

102 production-grade prompts for image and video generation, vendored from [nexu-io/open-design](https://github.com/nexu-io/open-design). Each is a JSON spec with title, description, prompt body, model hints, and example outputs — battle-tested with thumbnails in the upstream Open Design app.

## Library location

After install, content lives at: `{config}/skills/od-media-prompts/assets/prompt-templates/`

```
prompt-templates/
├── image/   # 45 JSON files — gpt-image-2 / Imagen / fal.ai prompts
└── video/   # 57 JSON files — Seedance 2.0 / HyperFrames / Sora prompts
```

## Workflow

**Step 1**: Browse the library by name (filenames are descriptive):

```bash
ls {config}/skills/od-media-prompts/assets/prompt-templates/image/
ls {config}/skills/od-media-prompts/assets/prompt-templates/video/
```

For curated picks by category, see `references/INDEX.md`.

**Step 2**: Read the JSON for the closest match. Each contains:
- `title` — human-readable name
- `description` — what it generates
- `prompt` — the prompt body (use as-is or adapt)
- `model` / `aspect_ratio` / other hints — recommended generation params
- `tags` / `category` — classification

**Step 3**: Adapt to the user's specific need:
- Replace subject/content placeholders with the user's brief
- Keep the style descriptors, lighting, composition, and camera language intact
- Combine multiple templates' style cues if the brief is complex

**Step 4**: Output the adapted prompt with the recommended model params. Do NOT generate the actual image/video — that's the API's job. This skill outputs prompt strings only.

## Hard rules

- ✅ ALWAYS read the JSON before adapting — preserve the structural language
- ✅ ALWAYS swap subject/content while keeping style/lighting/camera descriptors
- ❌ NEVER claim outputs will look "exactly like the reference" — these are starting points
- ❌ NEVER use these prompts for adult/violent/harmful content (stylized martial arts in some templates is OK; gore is not)

## Compose with other skills

- `od-media-prompts` (image) + `od-design-systems` (brand palette) → on-brand hero illustration
- `od-media-prompts` (video) + `od-decks` (guizang) → cinematic motion intro for a magazine deck
- `od-media-prompts` (HyperFrames) + `od-design-systems` (Tesla) → luxury product reveal video

## Quick example

```
User: "Generate a Seedance prompt for a 15s cinematic product reveal of a new slot game"

Agent flow:
1. ls assets/prompt-templates/video/ → find character-intro-motion-graphics-sequence
2. Read JSON to learn structure (camera moves, lighting, pacing)
3. Adapt: replace character with slot game machine
4. Keep cinematic descriptors (depth of field, lens flare, slow-motion cuts)
5. Output Seedance-ready prompt with aspect ratio + duration hints
```

## See also

- `references/INDEX.md` — curated picks by category (cinematic, character motion, FPV, game illustrations, infographics)

## License & attribution

Vendored from [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0). Individual prompts credit their original authors in the JSON. Preserve license headers when redistributing.
