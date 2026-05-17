# Media Prompts — Curated Index

Quick reference for picking a template from `assets/prompt-templates/`. For full list, run `ls assets/prompt-templates/{image,video}/`.

## Image prompts (46 total)

| Category | Notable templates |
|---|---|
| **Game illustrations** | `anime-martial-arts-battle-illustration` · `game-screenshot-three-kingdoms-*` (3 variants: Guanyu, Lyubu, Zhaoyun) · `game-screenshot-anime-fighting-game-captain-ryuuga-vs-kaze-renshin` · `game-ui-ancient-china-open-world-mmo-hud` |
| **Infographics / Diagrams** | `3d-stone-staircase-evolution-infographic` · `illustrated-city-food-map` · `illustration-crayon-kid-drawing-rework` |
| **UI mockups** | `e-commerce-live-stream-ui-mockup` |

## Video prompts (57 total)

| Category | Notable templates |
|---|---|
| **Cinematic narrative** | `cinematic-birthday-celebration-sequence` · `cinematic-dragon-interaction-flight` · `cinematic-east-asian-woman-hand-dance` |
| **Character / Motion** | `3d-animated-boy-building-lego` · `animation-transfer-and-camera-tracking-prompt` · `beat-synced-outfit-transformation-dance` · `character-intro-motion-graphics-sequence` |
| **FPV / Drone** | `ancient-indian-kingdom-fpv-video` |
| **Themed sequences** | `ancient-guardian-dragon-rescue` · `a-decade-of-refinement-glow-up` |

## Picking heuristics

| User wants | Try template |
|---|---|
| Cinematic product reveal | `character-intro-motion-graphics-sequence` (video) |
| Editorial illustration | `illustrated-city-food-map` (image) |
| Game splash screen | `game-screenshot-three-kingdoms-*` (image) |
| Brand sting / intro | `a-decade-of-refinement-glow-up` (video) |
| Data viz / infographic | `3d-stone-staircase-evolution-infographic` (image) |
| Drone aerial / FPV | `ancient-indian-kingdom-fpv-video` (video) |
| Dance / motion | `beat-synced-outfit-transformation-dance` (video) |
| Animal / creature | `cinematic-dragon-interaction-flight` (video) |

## Full filenames

To get the complete list at runtime:

```bash
ls {config}/skills/od-media-prompts/assets/prompt-templates/image/ | sed 's/.json$//'
ls {config}/skills/od-media-prompts/assets/prompt-templates/video/ | sed 's/.json$//'
```
