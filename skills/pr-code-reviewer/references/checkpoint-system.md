# Checkpoint System

Reviews are resumable via checkpoints saved at each phase. If the agent crashes mid-review, you can resume from the last completed phase instead of starting over.

## Checkpoint Directory

**For PR Reviews:** `$REVIEW_DIR/.checkpoints/` (inside the temp clone directory)
**For Local Reviews (`--staged`):** `{current_working_directory}/.checkpoints/`

Checkpoints are automatically removed when the clone directory is deleted (Phase 6 cleanup).

## Checkpoint Files

| File | Content | Updated When |
|------|---------|--------------|
| `manifest.json` | Master state tracker | After every phase |
| `phase-0-clone.json` | Clone metadata (clone_dir, branches, head_sha, files_changed) | Phase 0 |
| `phase-1-context.json` | PR metadata, file classifications | Phase 1 |
| `phase-1.5-linear.json` | Linear ticket context, acceptance criteria | Phase 1.5 |
| `phase-2-tracing.json` | Smart tracing results per file | Phase 2 |
| `phase-2.5-summary.json` | PR summary text | Phase 2.5 |
| `phase-3-subagents.json` | Subagent findings (updated after EACH subagent completes) | Phase 3 |
| `phase-4-refined.json` | Deduplicated/filtered findings | Phase 4 |
| `phase-4.5-verification.json` | Verification results (verified/false/unverifiable counts, dropped/downgraded findings) | Phase 4.5 |
| `phase-4.6-confidence.json` | Result confidence score, per-finding confidence, gate action | Phase 4.6 |
| `phase-5-report.md` | Copy of final report | Phase 5 |

## Manifest Schema

```json
{
  "version": "1.0",
  "pr": { "repo": "owner/repo", "number": 123, "url": "..." },
  "clone_dir": "/tmp/pr-review-...",
  "started_at": "ISO-8601",
  "last_updated": "ISO-8601",
  "completed_phase": 2,
  "next_phase": 2.5,
  "phase_status": {
    "0": "complete", "1": "complete", "1.5": "complete",
    "2": "complete", "2.5": "pending", "3": "pending",
    "4": "pending", "4.5": "pending", "4.6": "pending", "5": "pending"
  },
  "subagent_status": {
    "explore": "pending", "oracle": "pending",
    "librarian": "pending", "general": "pending"
  }
}
```

## Phase 3 Special Handling

Phase 3 runs 4 parallel subagents. After **EACH** subagent completes:
1. Update `phase-3-subagents.json` with that subagent's findings and status
2. Update `manifest.json` subagent_status to `"complete"` for that subagent
3. On resume: only run subagents with status != `"complete"`

This allows resuming mid-Phase-3 if only some subagents completed before a crash.
