#!/usr/bin/env node
/**
 * L1 — Static validation
 * Verifies skill.json schema, SKILL.md frontmatter, line limits, path consistency.
 * Exit 0 = pass, exit 1 = fail.
 */
import fs from "node:fs";
import path from "node:path";

const SKILLS_DIR = path.resolve("skills");
const TARGET_SKILLS = ["od-decks", "od-design-systems", "od-media-prompts"];

let failed = 0;
let passed = 0;

function ok(msg) { console.log(`  ✓ ${msg}`); passed++; }
function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const yaml = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) yaml[kv[1]] = kv[2].replace(/^['"]|['"]$/g, "");
  }
  return { yaml, body: m[2] };
}

for (const name of TARGET_SKILLS) {
  console.log(`\n📦 ${name}`);
  const dir = path.join(SKILLS_DIR, name);

  // 1. Folder exists
  if (!fs.existsSync(dir)) { fail("folder missing"); continue; }
  ok("folder exists");

  // 2. skill.json exists + valid JSON + required fields
  const manifestPath = path.join(dir, "skill.json");
  if (!fs.existsSync(manifestPath)) { fail("skill.json missing"); continue; }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    ok("skill.json valid JSON");
  } catch (e) { fail(`skill.json parse error: ${e.message}`); continue; }

  // 3. Required manifest fields
  for (const field of ["name", "version", "description", "compatibility", "tags"]) {
    if (!(field in manifest)) fail(`manifest missing field: ${field}`);
    else ok(`manifest.${field} present`);
  }
  if (manifest.name !== name) fail(`manifest.name "${manifest.name}" !== folder "${name}"`);
  else ok("manifest.name matches folder");

  // 4. description length
  if (manifest.description.length > 280) {
    fail(`manifest.description too long (${manifest.description.length} chars, soft limit 280)`);
  } else ok(`manifest.description length ${manifest.description.length} chars (under 280)`);

  // 5. SKILL.md exists + frontmatter valid
  const skillMdPath = path.join(dir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) { fail("SKILL.md missing"); continue; }
  const md = fs.readFileSync(skillMdPath, "utf8");
  const fm = parseFrontmatter(md);
  if (!fm) { fail("SKILL.md frontmatter unparseable"); continue; }
  ok("SKILL.md frontmatter parseable");

  // 6. Frontmatter required fields
  for (const field of ["name", "description", "license", "version"]) {
    if (!(field in fm.yaml)) fail(`SKILL.md frontmatter missing: ${field}`);
    else ok(`frontmatter.${field} = "${fm.yaml[field].slice(0, 50)}${fm.yaml[field].length > 50 ? "…" : ""}"`);
  }
  if (fm.yaml.name !== name) fail(`frontmatter.name mismatch: ${fm.yaml.name}`);

  // 7. SKILL.md body line count (target <150 per skill-creator)
  const totalLines = md.split("\n").length;
  if (totalLines > 150) {
    fail(`SKILL.md is ${totalLines} lines (skill-creator says <150)`);
  } else ok(`SKILL.md ${totalLines} lines (under 150)`);

  // 8. assets/ folder exists
  const assetsDir = path.join(dir, "assets");
  if (!fs.existsSync(assetsDir)) fail("assets/ folder missing");
  else ok("assets/ folder exists");

  // 9. references/ check
  const refDir = path.join(dir, "references");
  if (fs.existsSync(refDir)) {
    for (const f of fs.readdirSync(refDir)) {
      const lines = fs.readFileSync(path.join(refDir, f), "utf8").split("\n").length;
      if (lines > 150) fail(`references/${f} is ${lines} lines (target <150)`);
      else ok(`references/${f} ${lines} lines (under 150)`);
    }
  }

  // 10. Path references in SKILL.md must be relative (assets/...) not absolute (~/.config/...)
  if (/~\/\.config\/opencode\/open-design-library/.test(md)) {
    fail("SKILL.md still has absolute ~/.config/... path references");
  } else ok("SKILL.md paths are relative (no leaked ~/.config/...)");
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`L1 STATIC: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
