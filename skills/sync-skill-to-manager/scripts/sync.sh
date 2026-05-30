#!/usr/bin/env bash
# Usage: sync.sh <skill-name> [--dry-run] [--no-push] [--force] [--source <path>] [--classify public|private] [--remove-leak]
#
# This script syncs a local skill into skill-manager (and private-skills if applicable),
# commits, and pushes. It does NOT publish to npm — that is handled by the
# nano-step/shared-workflows@v1 auto-publish workflow on skill-manager's master branch.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_MANAGER_REPO="/Users/tamlh/workspaces/self/AI/Tools/skill-manager"
PRIVATE_SKILLS_REPO="/Users/tamlh/workspaces/self/AI/Tools/private-skills"
PRIVATE_CATALOG="$SKILL_MANAGER_REPO/private-catalog.json"

SKILL_NAME=""
DRY_RUN=0
NO_PUSH=0
FORCE=0
SOURCE_OVERRIDE=""
CLASSIFY_OVERRIDE=""
REMOVE_LEAK=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --no-push) NO_PUSH=1 ;;
    --no-publish)
      echo "⚠️  --no-publish is deprecated (v2.0.0): npm publish is handled by the auto-publish workflow now. Ignoring." >&2
      ;;
    --force) FORCE=1 ;;
    --source) SOURCE_OVERRIDE="$2"; shift ;;
    --classify) CLASSIFY_OVERRIDE="$2"; shift ;;
    --remove-leak) REMOVE_LEAK=1 ;;
    -h|--help)
      head -4 "$0" | tail -3 | sed 's/^# //'
      exit 0
      ;;
    --*) echo "unknown flag: $1" >&2; exit 2 ;;
    *) SKILL_NAME="$1" ;;
  esac
  shift
done

if [ -z "$SKILL_NAME" ]; then
  echo "usage: sync.sh <skill-name> [flags]" >&2
  exit 2
fi

PRE_OUT="$("$SCRIPT_DIR/preflight.sh" "$SKILL_NAME" 2>&1 || true)"
echo "$PRE_OUT"
echo "$PRE_OUT" | grep -q "^PREFLIGHT_OK$" || {
  echo "$PRE_OUT" | grep -q "^AMBIGUOUS_SOURCE" && {
    if [ -z "$SOURCE_OVERRIDE" ]; then
      echo "→ pass --source <path> to disambiguate" >&2
      exit 1
    fi
  }
  [ $FORCE -eq 0 ] && exit 1
}

if [ -n "$SOURCE_OVERRIDE" ]; then
  SOURCE_DIR="$SOURCE_OVERRIDE"
else
  SOURCE_DIR="$(echo "$PRE_OUT" | grep '^SOURCE_DIR=' | cut -d= -f2-)"
fi
[ -d "$SOURCE_DIR" ] || { echo "source dir invalid: $SOURCE_DIR" >&2; exit 1; }

SOURCE_VERSION="$(node -p "require('$SOURCE_DIR/skill.json').version")"
SOURCE_DESC="$(node -p "require('$SOURCE_DIR/skill.json').description")"

CLASSIFICATION=""
if [ -n "$CLASSIFY_OVERRIDE" ]; then
  CLASSIFICATION="$CLASSIFY_OVERRIDE"
else
  IN_PRIVATE_CATALOG="$(node -e "
    const c = JSON.parse(require('fs').readFileSync('$PRIVATE_CATALOG', 'utf8'));
    console.log(c.find(s => s.name === '$SKILL_NAME') ? '1' : '0');
  ")"
  if [ "$IN_PRIVATE_CATALOG" = "1" ]; then
    CLASSIFICATION="private"
  elif [ -d "$SKILL_MANAGER_REPO/skills/$SKILL_NAME" ]; then
    CLASSIFICATION="public"
  else
    echo "BRAND_NEW_SKILL"
    echo "→ pass --classify public  OR  --classify private" >&2
    exit 1
  fi
fi

if [ "$CLASSIFICATION" = "private" ] && [ -d "$SKILL_MANAGER_REPO/skills/$SKILL_NAME" ]; then
  if [ $REMOVE_LEAK -eq 0 ]; then
    echo "PRIVACY_LEAK_DETECTED at $SKILL_MANAGER_REPO/skills/$SKILL_NAME"
    echo "→ pass --remove-leak to remove (recommended) OR --classify public to keep it" >&2
    exit 1
  fi
fi

if [ "$CLASSIFICATION" = "public" ]; then
  TARGET_DIR="$SKILL_MANAGER_REPO/skills/$SKILL_NAME"
else
  TARGET_DIR="$PRIVATE_SKILLS_REPO/skills/$SKILL_NAME"
fi

if [ -f "$TARGET_DIR/skill.json" ]; then
  REMOTE_VERSION="$(node -p "require('$TARGET_DIR/skill.json').version")"
elif [ "$CLASSIFICATION" = "private" ]; then
  REMOTE_VERSION="$(node -e "
    const c = JSON.parse(require('fs').readFileSync('$PRIVATE_CATALOG', 'utf8'));
    const e = c.find(s => s.name === '$SKILL_NAME');
    console.log(e ? e.version : '0.0.0');
  ")"
else
  REMOTE_VERSION="0.0.0"
fi

# Compares X.Y.Z semver tuples lexicographically by component (numeric).
# Returns 'gt', 'eq', or 'lt' for $1 vs $2.
semver_cmp() {
  node -e "
    const [a, b] = ['$1', '$2'].map(s => s.split('.').map(Number));
    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) { console.log('gt'); process.exit(0); }
      if (a[i] < b[i]) { console.log('lt'); process.exit(0); }
    }
    console.log('eq');
  "
}

CMP="$(semver_cmp "$SOURCE_VERSION" "$REMOTE_VERSION")"
VERSION_ACTION=""
case "$CMP" in
  gt) VERSION_ACTION="use-as-is" ;;
  eq) VERSION_ACTION="bump-patch" ;;
  lt)
    echo "❌ source v$SOURCE_VERSION is BEHIND remote v$REMOTE_VERSION" >&2
    echo "→ pull latest or set source version manually" >&2
    exit 1
    ;;
esac

CURRENT_MANAGER_VERSION="$(node -p "require('$SKILL_MANAGER_REPO/package.json').version")"

cat <<EOF

📦 sync plan for '$SKILL_NAME'
  Classification: $CLASSIFICATION
  Source:    $SOURCE_DIR  (v$SOURCE_VERSION)
  Target:    $TARGET_DIR  (currently v$REMOTE_VERSION)
  Version:   $VERSION_ACTION
  Manager:   v$CURRENT_MANAGER_VERSION (will be auto-bumped by CI after push)
  Push:      $([ $NO_PUSH -eq 1 ] && echo no || echo yes)
  Publish:   handled by nano-step/shared-workflows@v1 on master push
EOF

if [ $DRY_RUN -eq 1 ]; then
  echo
  echo "(dry-run — no changes made)"
  exit 0
fi

if [ "$VERSION_ACTION" = "bump-patch" ]; then
  NEW_SOURCE_VERSION="$("$SCRIPT_DIR/version-bump.sh" "$SOURCE_DIR/skill.json" "$SOURCE_DIR/SKILL.md")"
  echo "↑ auto-bumped $SKILL_NAME v$SOURCE_VERSION → v$NEW_SOURCE_VERSION"
  SOURCE_VERSION="$NEW_SOURCE_VERSION"
fi

mkdir -p "$(dirname "$TARGET_DIR")"

# A merge-style copy would let stale source files survive — wholesale replacement is intentional.
# Forgetting any of these excludes (especially node_modules) would balloon the npm tarball.
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
(
  cd "$SOURCE_DIR" && \
  find . -type d \( -name '.git' -o -name 'node_modules' -o -name '.checkpoints' -o -name '.bun' \) -prune -o \
    \( -type f -o -type l \) ! -name '.DS_Store' -print0 \
  | tar --null --files-from=- -cf - \
  | tar -xf - -C "$TARGET_DIR"
)

echo "✓ copied $SOURCE_DIR → $TARGET_DIR"

if [ "$CLASSIFICATION" = "private" ] && [ $REMOVE_LEAK -eq 1 ] && [ -d "$SKILL_MANAGER_REPO/skills/$SKILL_NAME" ]; then
  rm -rf "$SKILL_MANAGER_REPO/skills/$SKILL_NAME"
  echo "✓ removed leaked copy at $SKILL_MANAGER_REPO/skills/$SKILL_NAME"
fi

if [ "$CLASSIFICATION" = "private" ]; then
  node -e "
    const fs = require('fs');
    const path = '$PRIVATE_CATALOG';
    const c = JSON.parse(fs.readFileSync(path, 'utf8'));
    const idx = c.findIndex(s => s.name === '$SKILL_NAME');
    const entry = { name: '$SKILL_NAME', version: '$SOURCE_VERSION', description: $(node -p "JSON.stringify(require('$SOURCE_DIR/skill.json').description)") };
    if (idx >= 0) c[idx] = entry;
    else c.push(entry);
    c.sort((a, b) => a.name.localeCompare(b.name));
    fs.writeFileSync(path, JSON.stringify(c, null, 2) + '\n');
  "
  echo "✓ updated private-catalog.json entry for $SKILL_NAME"
fi

(cd "$SKILL_MANAGER_REPO" && npm run build) || {
  echo "❌ npm run build failed — not committing" >&2
  exit 1
}
echo "✓ built skill-manager (smoke test passed)"

case "$VERSION_ACTION" in
  use-as-is) SKILL_COMMIT_VERB="sync" ;;
  bump-patch) SKILL_COMMIT_VERB="sync" ;;
esac

SM_COMMIT_MSG=""
if [ "$CLASSIFICATION" = "public" ]; then
  if [ "$REMOTE_VERSION" = "0.0.0" ]; then
    SM_COMMIT_MSG="feat($SKILL_NAME): add v$SOURCE_VERSION"
  else
    SM_COMMIT_MSG="feat($SKILL_NAME): $SKILL_COMMIT_VERB v$REMOTE_VERSION → v$SOURCE_VERSION"
  fi
else
  if [ "$REMOTE_VERSION" = "0.0.0" ]; then
    SM_COMMIT_MSG="feat($SKILL_NAME): add to private catalog v$SOURCE_VERSION"
  else
    SM_COMMIT_MSG="chore($SKILL_NAME): bump catalog to v$SOURCE_VERSION"
  fi
  if [ $REMOVE_LEAK -eq 1 ]; then
    SM_COMMIT_MSG="$SM_COMMIT_MSG

fix: remove leaked private skill $SKILL_NAME from public bundle"
  fi
fi

SM_SHA="$("$SCRIPT_DIR/commit.sh" "$SKILL_MANAGER_REPO" "$SM_COMMIT_MSG")"
echo "✓ committed in skill-manager: $SM_SHA"

PS_SHA=""
if [ "$CLASSIFICATION" = "private" ]; then
  if [ "$REMOTE_VERSION" = "0.0.0" ]; then
    PS_MSG="feat($SKILL_NAME): add v$SOURCE_VERSION"
  else
    PS_MSG="feat($SKILL_NAME): $SKILL_COMMIT_VERB v$REMOTE_VERSION → v$SOURCE_VERSION"
  fi
  PS_SHA="$("$SCRIPT_DIR/commit.sh" "$PRIVATE_SKILLS_REPO" "$PS_MSG")"
  echo "✓ committed in private-skills: $PS_SHA"
fi

if [ $NO_PUSH -eq 1 ]; then
  echo "⏭  --no-push: skipping push (auto-publish will NOT fire until you push manually)"
  exit 0
fi

git -C "$SKILL_MANAGER_REPO" push
echo "✓ pushed skill-manager → auto-publish workflow triggered"

if [ "$CLASSIFICATION" = "private" ]; then
  git -C "$PRIVATE_SKILLS_REPO" push
  echo "✓ pushed private-skills"
fi

cat <<EOF

✅ sync complete for '$SKILL_NAME'
  Classification: $CLASSIFICATION
  Source version: v$SOURCE_VERSION
  Commit (sm):    $SM_SHA
  Commit (ps):    ${PS_SHA:-n/a}

  Auto-publish:   triggered on push to master
    Watch:        https://github.com/nano-step/skill-manager/actions
    Once green:   npx @nano-step/skill-manager update $SKILL_NAME
EOF
