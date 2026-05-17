# Pre-PR Test Pyramid for `od-*` Skills

5-tier test harness for the Open Design skill bundle. Run before opening a PR to catch defects that static review misses.

## Run all automated tiers

```bash
bash test-od/run-all.sh
```

Currently: **151 automated checks across 4 tiers, all passing.**

## Tier breakdown

| Tier | What it checks | How long | When to run |
|---|---|---|---|
| **L1 — Static** (`01-static.mjs`) | skill.json schema, frontmatter, line limits (<150), description length, path consistency | <1s | Every change |
| **L2 — Content** (`02-content.mjs`) | JSON parses, DESIGN.md has required sections + hex codes, deck templates have all required files | <2s | Every change to assets |
| **L3 — Asset smoke** (`03-asset-smoke.mjs`) | Random 15 design systems + 10 prompt JSONs sampled deep; deck example.html is parseable | <2s | Every change to assets |
| **L4 — Lifecycle** (`04-lifecycle.sh`) | Full CLI cycle in sandboxed `.opencode/`: list → install → installed → state file → remove → re-install → --force → update | ~5s | Every change to skill structure |
| **L5 — E2E agent** (`05-e2e.md`) | 5 manual test cases with a live agent: discoverability, trigger phrases, multi-skill composition, prompt adaptation, hard-rule enforcement | 5–10 min per TC | Before PR |

## Defects this harness has caught

| Tier | Defect | Status |
|---|---|---|
| L1 | `od-design-systems` description was 301 chars (>200 hard limit) | Fixed |
| L2 | Wrong claimed counts: "151 design systems" → actually 149; "46 image" → actually 45; "103 prompts" → actually 102 | Fixed in README + skill.json + SKILL.md |
| L5 | `deck-swiss-international` SKILL.md says "do not mix palettes" but composition with `od-design-systems` REQUIRES override; instructions contradicted | Fixed by adding "Composition mode (CRITICAL)" section to `od-decks/SKILL.md` |

## Why a pyramid?

| Layer | Cost | Catches |
|---|---|---|
| L1 Static | Free | Schema, paths, line limits — typos, copy-paste mistakes |
| L2 Content | Free | Corrupt JSON, missing sections, count drift |
| L3 Asset Smoke | Free | Thin/empty vendored content, broken hex codes |
| L4 Lifecycle | Free | CLI integration bugs, state file corruption |
| L5 E2E Agent | $ + minutes | Skill discoverability, instruction clarity, composition conflicts |

L1–L4 are free and run in <10s — gate every commit. L5 costs LLM tokens and time — gate the PR.

## L5 manual recipe

```bash
# In a clean shell, install the candidate skills to a project's .opencode/
cd /path/to/some-project-with-.opencode
node /Users/nhonh/Documents/personal/skill-manager/bin/cli.js install od-decks
node /Users/nhonh/Documents/personal/skill-manager/bin/cli.js install od-design-systems
node /Users/nhonh/Documents/personal/skill-manager/bin/cli.js install od-media-prompts

# Start a fresh OpenCode session and run each TC from 05-e2e.md
opencode
> [paste TC-2 prompt]
> [paste TC-3 prompt]
> ...
```

Save outputs to `test-od/results/` and commit them alongside the PR for reviewer reproducibility.

## Adding a new check

L1–L4 are pure scripts. Add assertions following the existing `ok()`/`fail()` pattern.

L5 lives in `05-e2e.md` as a manual runbook. New TCs follow the format: brief description → expected agent flow → failure modes to watch for → pass criteria.

## What this harness does NOT cover

- **Browser visual regression** — we don't render the generated HTML in a headless browser. If you suspect layout drift, add a Playwright snapshot test.
- **LLM cost regression** — we don't measure prompt-token consumption of `skill(name=...)`. Acceptable for now since skills are static markdown.
- **Cross-version compatibility** — we only test against the currently installed `skill-manager`. If you bump version, re-run L4.
