#!/usr/bin/env bash
# Usage: commit.sh <repo-path> <commit-message> [<file-path>...]

set -euo pipefail

REPO="${1:-}"
MSG="${2:-}"
shift 2 || true
FILES=("$@")

if [ -z "$REPO" ] || [ -z "$MSG" ]; then
  echo "commit: missing arguments" >&2
  echo "usage: commit.sh <repo-path> <commit-message> [<file-path>...]" >&2
  exit 2
fi

[ -d "$REPO/.git" ] || { echo "not a git repo: $REPO" >&2; exit 1; }

cd "$REPO"

if [ "${#FILES[@]}" -gt 0 ]; then
  git add -- "${FILES[@]}"
else
  git add -A
fi

if git diff --cached --quiet; then
  echo "commit: nothing staged in $REPO" >&2
  exit 0
fi

# --no-gpg-sign and bypass any commit.template; never include AI/co-author trailers.
git -c commit.gpgsign=false -c commit.template= commit -m "$MSG"

git rev-parse --short HEAD
