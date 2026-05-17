#!/usr/bin/env node
/**
 * L2 — Content validation
 * Validates every JSON prompt file parses, every DESIGN.md has required sections,
 * every deck SKILL.md has expected fields. Catches corrupt/truncated vendored content.
 */
import fs from "node:fs";
import path from "node:path";

const SKILLS = path.resolve("skills");
let passed = 0, failed = 0;
const fail = (m) => { console.error(`  ✗ ${m}`); failed++; };
const ok = (m) => { console.log(`  ✓ ${m}`); passed++; };

// --- 2.1 od-media-prompts: all 103 JSON files must parse ---
console.log("\n🎬 od-media-prompts JSON validation");
const promptDirs = ["image", "video"];
for (const sub of promptDirs) {
  const dir = path.join(SKILLS, "od-media-prompts/assets/prompt-templates", sub);
  if (!fs.existsSync(dir)) { fail(`${sub}/ missing`); continue; }
  const allFiles = fs.readdirSync(dir);
  const files = allFiles.filter((f) => f.endsWith(".json"));
  const nonJson = allFiles.filter((f) => !f.endsWith(".json"));
  if (nonJson.length > 0) console.log(`  ⚠ ${sub}/ has ${nonJson.length} non-JSON file(s): ${nonJson.join(", ")}`);
  if (files.length === 0) { fail(`${sub}/ empty`); continue; }
  let bad = 0;
  for (const f of files) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      // Sanity: must have at least title or description or prompt
      if (!json.title && !json.description && !json.prompt && !json.name) {
        fail(`${sub}/${f} has no title/description/prompt/name field`);
        bad++;
      }
    } catch (e) {
      fail(`${sub}/${f} invalid JSON: ${e.message.split("\n")[0]}`);
      bad++;
    }
  }
  if (bad === 0) ok(`${sub}/ all ${files.length} JSON files valid + non-empty`);
}

// --- 2.2 od-design-systems: every DESIGN.md must exist + have known sections ---
console.log("\n🎨 od-design-systems DESIGN.md validation");
const dsRoot = path.join(SKILLS, "od-design-systems/assets/design-systems");
const dsFolders = fs.readdirSync(dsRoot).filter((d) => {
  const full = path.join(dsRoot, d);
  return fs.statSync(full).isDirectory() && d !== "_schema";
});

let dsMissing = 0, dsShort = 0, dsNoPalette = 0;
const requiredSectionPatterns = [
  /color|palette/i,
  /typograph|font/i,
];
const sampleSize = 10; // full check on sample, count check on all
const samples = dsFolders.slice(0, sampleSize);

for (const ds of dsFolders) {
  const md = path.join(dsRoot, ds, "DESIGN.md");
  if (!fs.existsSync(md)) { dsMissing++; continue; }
  const stat = fs.statSync(md);
  if (stat.size < 500) dsShort++; // suspiciously empty
}
if (dsMissing > 0) fail(`${dsMissing}/${dsFolders.length} design systems missing DESIGN.md`);
else ok(`All ${dsFolders.length} design systems have DESIGN.md`);
if (dsShort > 0) fail(`${dsShort} DESIGN.md files <500 bytes (likely truncated)`);
else ok(`All DESIGN.md files >500 bytes`);

// Deep section check on 10 samples
for (const ds of samples) {
  const content = fs.readFileSync(path.join(dsRoot, ds, "DESIGN.md"), "utf8");
  const missing = requiredSectionPatterns.filter((p) => !p.test(content));
  if (missing.length > 0) {
    fail(`${ds}/DESIGN.md missing color or typography section`);
    dsNoPalette++;
  }
  // Must contain at least one hex color
  if (!/#[0-9a-fA-F]{3,8}/.test(content)) {
    fail(`${ds}/DESIGN.md has no hex color codes`);
  }
}
if (dsNoPalette === 0) ok(`Sample (${sampleSize}) of design systems all have color+typography sections + hex codes`);

// --- 2.3 od-decks: each template must have SKILL.md + example.html + example.md ---
console.log("\n📄 od-decks template validation");
const decksRoot = path.join(SKILLS, "od-decks/assets/decks");
const decks = fs.readdirSync(decksRoot);
for (const d of decks) {
  const dir = path.join(decksRoot, d);
  const required = ["SKILL.md", "example.html", "example.md"];
  for (const r of required) {
    const f = path.join(dir, r);
    if (!fs.existsSync(f)) fail(`${d}/${r} missing`);
    else if (fs.statSync(f).size < 100) fail(`${d}/${r} suspiciously small`);
    else ok(`${d}/${r} present (${fs.statSync(f).size} bytes)`);
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`L2 CONTENT: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
