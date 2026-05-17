#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0

echo "════════════════════════════════════════════════"
echo "  od-* skills — pre-PR test pyramid"
echo "════════════════════════════════════════════════"
echo ""

for level in 01-static 02-content 03-asset-smoke 04-lifecycle; do
  echo "▶ Running L$level..."
  if [[ "$level" == *.sh ]] || [[ -f "test-od/$level.sh" ]]; then
    bash "test-od/$level.sh" || { FAIL=$((FAIL+1)); echo "  ✗ L$level FAILED"; continue; }
  else
    node "test-od/$level.mjs" || { FAIL=$((FAIL+1)); echo "  ✗ L$level FAILED"; continue; }
  fi
  PASS=$((PASS+1))
  echo "  ✓ L$level passed"
  echo ""
done

echo "════════════════════════════════════════════════"
echo "  AUTOMATED LEVELS:  $PASS passed, $FAIL failed"
echo "════════════════════════════════════════════════"
echo ""
echo "📋 Next step (manual): L5 — open test-od/05-e2e.md and run the 5 TCs"
echo "    in a real OpenCode session with all 3 od-* skills installed."
echo ""
[ "$FAIL" -gt 0 ] && exit 1 || exit 0
