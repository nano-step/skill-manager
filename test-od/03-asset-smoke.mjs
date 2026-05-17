#!/usr/bin/env node
/**
 * L3 — Asset smoke test
 * 1. Each deck example.html must be parseable HTML with at least a <body> and content.
 * 2. Sample DESIGN.md files: every hex color in palette section must be valid 3/4/6/8 hex digit.
 * 3. Random sampling: pick 5 prompt JSONs and verify the `prompt` field is non-trivial.
 */
import fs from "node:fs";
import path from "node:path";

const SKILLS = path.resolve("skills");
let passed = 0, failed = 0;
const fail = (m) => { console.error(`  ✗ ${m}`); failed++; };
const ok = (m) => { console.log(`  ✓ ${m}`); passed++; };

// 3.1 Deck example.html basic HTML sanity
console.log("\n📄 Deck example.html sanity");
const decksRoot = path.join(SKILLS, "od-decks/assets/decks");
for (const deck of fs.readdirSync(decksRoot)) {
  const html = fs.readFileSync(path.join(decksRoot, deck, "example.html"), "utf8");
  if (!/<html/i.test(html) && !/<!DOCTYPE/i.test(html)) fail(`${deck}/example.html missing <html>/<!DOCTYPE>`);
  else ok(`${deck}/example.html has html root`);
  if (!/<body|<main|<section/i.test(html)) fail(`${deck}/example.html has no body/main/section`);
  else ok(`${deck}/example.html has content container`);
  const hexCount = (html.match(/#[0-9a-fA-F]{6}/g) || []).length;
  if (hexCount < 2) fail(`${deck}/example.html has <2 hex colors (${hexCount}) — likely incomplete`);
  else ok(`${deck}/example.html has ${hexCount} hex colors`);
  // Anti-AI-slop: ensure no lorem ipsum sneaked in
  if (/lorem ipsum/i.test(html)) fail(`${deck}/example.html contains "Lorem ipsum" — violates anti-slop rule`);
  else ok(`${deck}/example.html clean of Lorem ipsum`);
}

// 3.2 DESIGN.md hex color validity (sample 15 random systems)
console.log("\n🎨 DESIGN.md hex color sanity (15 random samples)");
const dsRoot = path.join(SKILLS, "od-design-systems/assets/design-systems");
const allDs = fs.readdirSync(dsRoot).filter((d) => {
  const f = path.join(dsRoot, d);
  return fs.statSync(f).isDirectory() && d !== "_schema";
});
const shuffled = allDs.sort(() => Math.random() - 0.5).slice(0, 15);
for (const ds of shuffled) {
  const md = fs.readFileSync(path.join(dsRoot, ds, "DESIGN.md"), "utf8");
  const hexes = md.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  if (hexes.length < 3) { fail(`${ds}: only ${hexes.length} hex colors (need >=3)`); continue; }
  // Validate each hex has correct length
  const invalid = hexes.filter((h) => !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(h));
  if (invalid.length > 0) fail(`${ds}: invalid hex tokens: ${invalid.slice(0, 3).join(", ")}`);
  else ok(`${ds}: ${hexes.length} hex colors, all valid`);
}

// 3.3 Prompt JSON content depth (sample 5 image + 5 video)
console.log("\n🖼️  Prompt JSON content depth (10 random samples)");
const pickRandom = (dir, n) => {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.sort(() => Math.random() - 0.5).slice(0, n).map((f) => path.join(dir, f));
};
const promptSamples = [
  ...pickRandom(path.join(SKILLS, "od-media-prompts/assets/prompt-templates/image"), 5),
  ...pickRandom(path.join(SKILLS, "od-media-prompts/assets/prompt-templates/video"), 5),
];
for (const fp of promptSamples) {
  const json = JSON.parse(fs.readFileSync(fp, "utf8"));
  const promptText = JSON.stringify(json);
  const name = path.basename(fp);
  if (promptText.length < 200) fail(`${name}: too short (${promptText.length} chars total)`);
  else ok(`${name}: ${promptText.length} chars`);
  // Must mention at least one of these style cues to be useful
  const cueKeywords = /cinematic|lighting|composition|camera|aspect|style|color|render|texture|atmosphere|mood|shot|angle|frame|scene/i;
  if (!cueKeywords.test(promptText)) fail(`${name}: no style/lighting/camera keywords — likely thin`);
  else ok(`${name}: has style/camera cues`);
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`L3 ASSET SMOKE: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
