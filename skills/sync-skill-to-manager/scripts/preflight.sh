#!/usr/bin/env bash
# Usage: preflight.sh <skill-name>
#
# npm publish is no longer this skill's concern (handled by the auto-publish
# workflow on master), so we no longer check `npm whoami`.

set -euo pipefail

SKILL_NAME="${1:-}"

if [ -z "$SKILL_NAME" ]; then
  echo "preflight: missing skill name" >&2
  exit 2
fi

if [ "${2:-}" = "--no-publish" ]; then
  echo "⚠️  --no-publish is deprecated (v2.0.0): preflight no longer cares about npm publish. Ignoring." >&2
fi

SKILL_MANAGER_REPO="/Users/tamlh/workspaces/self/AI/Tools/skill-manager"
PRIVATE_SKILLS_REPO="/Users/tamlh/workspaces/self/AI/Tools/private-skills"

fail() {
  echo "❌ preflight failed: $1" >&2
  exit 1
}

[ -d "$SKILL_MANAGER_REPO" ] || fail "skill-manager repo not found at $SKILL_MANAGER_REPO"
[ -d "$PRIVATE_SKILLS_REPO" ] || fail "private-skills repo not found at $PRIVATE_SKILLS_REPO"
[ -f "$SKILL_MANAGER_REPO/private-catalog.json" ] || fail "private-catalog.json not found"

SOURCE_DIR=""
PROJECT_PATH="${PWD}/.opencode/skills/$SKILL_NAME"
GLOBAL_PATH="$HOME/.config/opencode/skills/$SKILL_NAME"

if [ -d "$PROJECT_PATH" ] && [ -d "$GLOBAL_PATH" ]; then
  echo "AMBIGUOUS_SOURCE"
  echo "  project: $PROJECT_PATH"
  echo "  global:  $GLOBAL_PATH"
  exit 3
elif [ -d "$PROJECT_PATH" ]; then
  SOURCE_DIR="$PROJECT_PATH"
elif [ -d "$GLOBAL_PATH" ]; then
  SOURCE_DIR="$GLOBAL_PATH"
else
  fail "skill '$SKILL_NAME' not found in $PROJECT_PATH or $GLOBAL_PATH"
fi

[ -f "$SOURCE_DIR/SKILL.md" ] || fail "missing SKILL.md in $SOURCE_DIR"
head -1 "$SOURCE_DIR/SKILL.md" | grep -q '^---$' || fail "SKILL.md does not start with YAML frontmatter (---)"

[ -f "$SOURCE_DIR/skill.json" ] || fail "missing skill.json in $SOURCE_DIR"
node -e "
const m = JSON.parse(require('fs').readFileSync('$SOURCE_DIR/skill.json', 'utf8'));
if (!m.name || !m.version || !m.description) {
  console.error('skill.json missing required fields: name, version, description');
  process.exit(1);
}
if (m.name !== '$SKILL_NAME') {
  console.error('skill.json name mismatch: expected $SKILL_NAME, got ' + m.name);
  process.exit(1);
}
" || fail "skill.json validation failed (see above)"

if ! command -v gh >/dev/null 2>&1; then
  fail "gh CLI not installed"
fi
GH_USER="$(gh auth status 2>&1 | grep -oE 'account [a-zA-Z0-9_-]+' | head -1 | awk '{print $2}')"
if [ "$GH_USER" != "kokorolx" ]; then
  fail "expected gh active account 'kokorolx', got '${GH_USER:-none}'. Run: gh auth switch -u kokorolx"
fi

LEAK_PATTERNS='gho_[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{40,}'
LEAKS="$(grep -rEn "$LEAK_PATTERNS" "$SOURCE_DIR" 2>/dev/null || true)"
if [ -n "$LEAKS" ]; then
  echo "❌ preflight failed: token-like pattern detected in source skill files:" >&2
  echo "$LEAKS" >&2
  echo "Refusing to sync. Remove the secret first." >&2
  exit 1
fi

SM_DIRTY="$(git -C "$SKILL_MANAGER_REPO" status --porcelain)"
if [ -n "$SM_DIRTY" ]; then
  # Allow only changes within paths we'll touch
  ALLOWED_PATHS="^(skills/$SKILL_NAME/|private-catalog\\.json|package\\.json|package-lock\\.json|README\\.md|dist/)"
  UNRELATED="$(echo "$SM_DIRTY" | awk '{print $2}' | grep -v -E "$ALLOWED_PATHS" || true)"
  if [ -n "$UNRELATED" ]; then
    echo "❌ preflight failed: skill-manager has unrelated uncommitted changes:" >&2
    echo "$SM_DIRTY" >&2
    echo "Commit, stash, or pass --force." >&2
    exit 1
  fi
fi

# Both repos checked here regardless of public/private — classification happens in the orchestrator.
PS_DIRTY="$(git -C "$PRIVATE_SKILLS_REPO" status --porcelain)"
if [ -n "$PS_DIRTY" ]; then
  ALLOWED_PATHS="^(skills/$SKILL_NAME/|README\\.md)"
  UNRELATED="$(echo "$PS_DIRTY" | awk '{print $2}' | grep -v -E "$ALLOWED_PATHS" || true)"
  if [ -n "$UNRELATED" ]; then
    echo "❌ preflight failed: private-skills has unrelated uncommitted changes:" >&2
    echo "$PS_DIRTY" >&2
    echo "Commit, stash, or pass --force." >&2
    exit 1
  fi
fi

echo "PREFLIGHT_OK"
echo "SOURCE_DIR=$SOURCE_DIR"
echo "GH_USER=$GH_USER"
