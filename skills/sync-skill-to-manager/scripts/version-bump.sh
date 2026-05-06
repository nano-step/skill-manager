#!/usr/bin/env bash
# Usage: version-bump.sh <skill-json-path> <skill-md-path>

set -euo pipefail

SKILL_JSON="${1:-}"
SKILL_MD="${2:-}"

if [ -z "$SKILL_JSON" ] || [ -z "$SKILL_MD" ]; then
  echo "version-bump: missing arguments" >&2
  echo "usage: version-bump.sh <skill-json-path> <skill-md-path>" >&2
  exit 2
fi

[ -f "$SKILL_JSON" ] || { echo "skill.json not found: $SKILL_JSON" >&2; exit 1; }
[ -f "$SKILL_MD" ] || { echo "SKILL.md not found: $SKILL_MD" >&2; exit 1; }

NEW_VERSION="$(node -e "
const fs = require('fs');
const m = JSON.parse(fs.readFileSync('$SKILL_JSON', 'utf8'));
const cur = m.version || '0.0.0';
const parts = cur.split('.').map(Number);
if (parts.length !== 3 || parts.some(isNaN)) {
  console.error('invalid semver: ' + cur);
  process.exit(1);
}
parts[2] += 1;
m.version = parts.join('.');
fs.writeFileSync('$SKILL_JSON', JSON.stringify(m, null, 4) + '\n');
console.log(m.version);
")"

# Bound the regex to the frontmatter block so a `version:` literal in the body is never rewritten.
node -e "
const fs = require('fs');
let md = fs.readFileSync('$SKILL_MD', 'utf8');
const fmEnd = md.indexOf('\n---', 4);
if (!md.startsWith('---') || fmEnd === -1) {
  console.error('SKILL.md missing frontmatter');
  process.exit(1);
}
const fm = md.slice(0, fmEnd);
const rest = md.slice(fmEnd);
const updated = fm.replace(/^(\s*version:\s*)(\"[^\"]+\"|[^\s\"]+)/m, '\$1\"$NEW_VERSION\"');
fs.writeFileSync('$SKILL_MD', updated + rest);
"

echo "$NEW_VERSION"
