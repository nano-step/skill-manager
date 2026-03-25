# Confidence Scoring (Phase 4.6)

Re-review the final findings to score how confident we are in the review's **results** — are the findings correct and complete?

**Always run this phase**, even if no critical/warning findings remain. The confidence score reflects the entire review quality, not just individual findings.

## Per-Finding Confidence

For each surviving finding (post Phase 4.5), assign a confidence level:

| Level | Criteria |
|-------|----------|
| 🟢 High | Verified with concrete file:line evidence AND 2+ agents independently flagged it |
| 🟡 Medium | Verified but single agent, OR 2+ agents agreed but evidence is indirect |
| 🔴 Low | Unverifiable, pattern-based reasoning, no agent consensus |

## Overall Confidence Score (0–100)

Compute from three measurable rates:

```
# Inputs (from Phase 4 + 4.5)
raw_findings        = total findings from all 4 subagents (before dedup)
false_positives     = findings dropped in Phase 4.5 as verified:false
verified            = findings confirmed real in Phase 4.5 (verified:true)
unverifiable        = findings marked unverifiable in Phase 4.5
final_findings      = all findings in the final report (critical + warning + improvement + suggestion)
consensus_findings  = final findings that were flagged by 2+ agents independently
evidence_findings   = final findings that cite concrete file:line proof

# Rates
accuracy_rate   = verified / max(verified + false_positives, 1)        # How often we're right (0.0–1.0)
consensus_rate  = consensus_findings / max(final_findings, 1)          # Agreement level (0.0–1.0)
evidence_rate   = evidence_findings / max(final_findings, 1)           # Proof quality (0.0–1.0)

# Weighted score
overall = round((accuracy_rate * 40) + (consensus_rate * 30) + (evidence_rate * 30))
```

## Special Cases

- If Phase 4.5 was skipped (no critical/warning to verify): `accuracy_rate = 1.0` (no false positives possible)
- If `final_findings == 0` (clean review, no issues found): `overall = 100` (nothing to be wrong about)
- If all subagents returned empty findings: `overall = 100` with note "No issues found by any agent"

## Confidence Thresholds & Gate Behavior

| Score | Label | Gate Action |
|-------|-------|-------------|
| 80–100 | 🟢 High | Proceed normally — findings are reliable |
| 60–79 | 🟡 Medium | Add ⚠️ in report: "Some findings may be inaccurate — verify manually" |
| < 60 | 🔴 Low | Add 🔴 in report: "Low confidence review — significant uncertainty in findings. Manual review recommended." |

## Display Format (included in Phase 5 TL;DR)

```
📊 Result Confidence: 🟢 92/100
   Accuracy: 85% (3 false positives caught and removed)
   Consensus: 100% (all findings had 2+ agent agreement)
   Evidence: 100% (all findings cite file:line proof)
```

For low confidence:
```
📊 Result Confidence: 🔴 45/100
   Accuracy: 50% (4 of 8 findings were false positives)
   Consensus: 30% (most findings from single agent only)
   Evidence: 60% (some findings lack concrete proof)
   ⚠️ Low confidence — manual review recommended for: [list specific uncertain findings]
```

## Checkpoint Schema

Save results to `.checkpoints/phase-4.6-confidence.json`:

```json
{
  "raw_findings": 16,
  "false_positives": 3,
  "verified": 5,
  "unverifiable": 0,
  "final_findings": 6,
  "consensus_findings": 4,
  "evidence_findings": 6,
  "accuracy_rate": 0.625,
  "consensus_rate": 0.667,
  "evidence_rate": 1.0,
  "overall_score": 75,
  "label": "medium",
  "per_finding_confidence": [
    { "file": "src/service.js", "line": 42, "severity": "warning", "confidence": "high" },
    { "file": "src/utils.js", "line": 10, "severity": "improvement", "confidence": "medium" }
  ],
  "gate_action": "Add warning to report"
}
```

Update `manifest.json` (`completed_phase: 4.6`, `next_phase: 5`).
