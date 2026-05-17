#!/usr/bin/env bash
set -euo pipefail
export CI=true GIT_TERMINAL_PROMPT=0 GIT_EDITOR=: EDITOR=: GIT_PAGER=cat PAGER=cat

SM_ROOT="/Users/nhonh/Documents/personal/skill-manager"
CLI="$SM_ROOT/bin/cli.js"
SANDBOX="$(mktemp -d)"
mkdir -p "$SANDBOX/.opencode"
cd "$SANDBOX"

PASS=0; FAIL=0
ok()   { echo "  ✓ $*"; PASS=$((PASS+1)); }
ko()   { echo "  ✗ $*"; FAIL=$((FAIL+1)); }

echo "📁 Sandbox: $SANDBOX"
echo "🛠  CLI: $CLI"
echo ""

# 4.1 catalog listing
echo "🧪 4.1 list shows all 3 od-* skills"
LIST_OUTPUT=$(node "$CLI" list 2>&1)
for s in od-decks od-design-systems od-media-prompts; do
  if echo "$LIST_OUTPUT" | grep -q "$s "; then ok "$s in catalog"; else ko "$s missing from catalog"; fi
done

# 4.2 install
echo ""
echo "🧪 4.2 install each od-* into sandbox"
for s in od-decks od-design-systems od-media-prompts; do
  if node "$CLI" install "$s" 2>&1 | grep -q "Installed $s"; then ok "$s installed"; else ko "$s install failed"; fi
done

# 4.3 disk layout
echo ""
echo "🧪 4.3 verify on-disk structure"
for s in od-decks od-design-systems od-media-prompts; do
  d="$SANDBOX/.opencode/skills/$s"
  [ -d "$d" ] && ok "$s dir exists" || ko "$s dir missing"
  [ -f "$d/SKILL.md" ] && ok "$s SKILL.md exists" || ko "$s SKILL.md missing"
  [ -f "$d/skill.json" ] && ok "$s skill.json exists" || ko "$s skill.json missing"
  [ -d "$d/assets" ] && ok "$s assets/ exists" || ko "$s assets/ missing"
done

# 4.4 expected vendored content counts
echo ""
echo "🧪 4.4 content count matches expected"
DECKS=$(ls "$SANDBOX/.opencode/skills/od-decks/assets/decks" | wc -l | tr -d ' ')
DS=$(find "$SANDBOX/.opencode/skills/od-design-systems/assets/design-systems" -maxdepth 1 -mindepth 1 -type d ! -name _schema | wc -l | tr -d ' ')
IMG=$(ls "$SANDBOX/.opencode/skills/od-media-prompts/assets/prompt-templates/image/"*.json 2>/dev/null | wc -l | tr -d ' ')
VID=$(ls "$SANDBOX/.opencode/skills/od-media-prompts/assets/prompt-templates/video/"*.json 2>/dev/null | wc -l | tr -d ' ')
[ "$DECKS" = "3" ] && ok "decks count = 3" || ko "decks = $DECKS (expected 3)"
[ "$DS" = "149" ] && ok "design systems = 149" || ko "design systems = $DS (expected 149)"
[ "$IMG" = "45" ] && ok "image prompts = 45" || ko "image = $IMG (expected 45)"
[ "$VID" = "57" ] && ok "video prompts = 57" || ko "video = $VID (expected 57)"

# 4.5 installed command
echo ""
echo "🧪 4.5 installed command lists them"
INSTALLED=$(node "$CLI" installed 2>&1)
for s in od-decks od-design-systems od-media-prompts; do
  if echo "$INSTALLED" | grep -q "$s "; then ok "$s in installed"; else ko "$s not in installed"; fi
done

# 4.6 state file
echo ""
echo "🧪 4.6 state file (.skill-manager.json) reflects installs"
STATE_FILE="$SANDBOX/.opencode/.skill-manager.json"
if [ -f "$STATE_FILE" ]; then
  ok "state file exists"
  for s in od-decks od-design-systems od-media-prompts; do
    if grep -q "\"$s\"" "$STATE_FILE"; then ok "$s tracked in state"; else ko "$s not in state"; fi
  done
else
  ko "state file missing at $STATE_FILE"
fi

# 4.7 remove
echo ""
echo "🧪 4.7 remove od-decks + verify cleanup"
node "$CLI" remove od-decks > /dev/null 2>&1 && ok "remove command exit 0" || ko "remove exit non-zero"
[ ! -d "$SANDBOX/.opencode/skills/od-decks" ] && ok "od-decks dir removed" || ko "od-decks dir still present"
if grep -q '"od-decks"' "$STATE_FILE" 2>/dev/null; then ko "od-decks still in state"; else ok "od-decks removed from state"; fi

# 4.8 re-install
echo ""
echo "🧪 4.8 re-install od-decks after remove"
node "$CLI" install od-decks > /dev/null 2>&1 && ok "re-install succeeded" || ko "re-install failed"
[ -d "$SANDBOX/.opencode/skills/od-decks" ] && ok "od-decks dir recreated" || ko "od-decks dir not recreated"

# 4.9 force reinstall
echo ""
echo "🧪 4.9 install --force overwrites cleanly"
node "$CLI" install od-decks --force > /dev/null 2>&1 && ok "--force exit 0" || ko "--force failed"
[ -d "$SANDBOX/.opencode/skills/od-decks" ] && ok "od-decks still present after --force" || ko "od-decks removed by --force"

# 4.10 update
echo ""
echo "🧪 4.10 update command runs without error"
node "$CLI" update > /dev/null 2>&1 && ok "update exit 0" || ko "update failed"

rm -rf "$SANDBOX"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "L4 LIFECYCLE: $PASS passed, $FAIL failed"
[ "$FAIL" -gt 0 ] && exit 1 || exit 0
