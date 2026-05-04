# Verification Protocol (Phase 4.5)

The orchestrator verifies each finding with severity `critical` or `warning` by reading the actual code at the cited evidence locations in `$REVIEW_DIR`. This catches false positives that survived subagent self-verification.

## Verification Steps

For each critical/warning finding:

1. **Parse the evidence field** — extract file:line references cited by the subagent
2. **Read the cited files** from `$REVIEW_DIR` at the referenced line numbers
3. **Verify the claim** based on finding category (see rules below)
4. **Mark verification status**:
   - `verified: true` — evidence checks out, issue is real → **KEEP** in report
   - `verified: false` — evidence is wrong (e.g., try-catch DOES exist) → **DROP** from report
   - `verified: "unverifiable"` — can't confirm within timeout → **DOWNGRADE** to `suggestion`

## Category-Specific Verification Rules

| Category | Verification Method | FALSE if... |
|----------|---------------------|-------------|
| **Error handling claims** | Read the controller/route handler that calls this code path | A try-catch exists at the HTTP boundary |
| **Null safety claims** | Read the data source (SQL query, API contract) | The source guarantees non-null (PK, NOT NULL, JOIN constraint). Also verify basic language semantics first (e.g., `Array.isArray(null)` → `false`, `Boolean(undefined)` → `false`) |
| **Logic error claims** | Trace the cited execution path | No realistic input triggers the bug |
| **Framework pattern claims** | Check if the specific usage context makes the pattern safe | The usage context makes the pattern safe |
| **Redundant/unnecessary code claims** | Find ALL callers of the function (grep/LSP) | The function is called from multiple paths with different inputs — the "redundant" code may be necessary for another path (FALSE or DOWNGRADE to improvement) |

## Timeout Policy

30 seconds per finding. If verification takes longer, mark as `unverifiable` and move on.

## Checkpoint Schema

Save results to `.checkpoints/phase-4.5-verification.json`:

```json
{
  "findings_checked": 5,
  "verified_true": 3,
  "verified_false": 1,
  "unverifiable": 1,
  "dropped_findings": [
    { 
      "original": { "file": "...", "line": 42, "message": "..." }, 
      "reason": "try-catch exists at controller.js:28" 
    }
  ],
  "downgraded_findings": [
    { 
      "original": { "file": "...", "line": 99, "message": "..." }, 
      "new_severity": "suggestion" 
    }
  ]
}
```

Update `manifest.json` (`completed_phase: 4.5`, `next_phase: 4.6`).
