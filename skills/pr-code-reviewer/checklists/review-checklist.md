# PR Review Checklist

Use this checklist for every PR review. Check off each item as you complete it.

## Setup Check (Phase -2)

- [ ] Check if `.opencode/code-reviewer.json` exists
- [ ] If exists: read `stack` field → resolve framework rule files → store as `$FRAMEWORK_RULES`
- [ ] If exists: read `agents` field → validate workspace_root, AGENTS.md, .agents/ dirs exist
- [ ] If missing (or `/review --setup`): read `references/setup-wizard.md`, run wizard, write config
- [ ] Confirm which framework rule files will be loaded (only stack-matching files)
- [ ] Confirm agents knowledge base paths (workspace_root + which dirs found)

## Resume Detection (Phase -1)

- [ ] Look for existing checkpoint: `find /tmp -maxdepth 1 -type d -name "pr-review-${repo}-${pr_number}-*"`
- [ ] If found: read `manifest.json` from `.checkpoints/`
- [ ] Validate checkpoint: check PR number and head SHA match
- [ ] Ask user: "Resume from phase {next_phase}? (y/n)"
- [ ] If yes: load manifest + phase files, jump to `next_phase`
- [ ] If no or invalid: delete old directory, start fresh from Phase 0

## Pre-Review (Phase 0)

- [ ] Extract repo info: `owner/repo`, `pr_number`, `head_branch`
- [ ] Create unique temp dir: `/tmp/pr-review-{repo}-{pr}-{timestamp}`
- [ ] Clone repo to temp dir (shallow clone with `--depth=1`)
- [ ] Verify correct branch is checked out (`git log --oneline -1`)
- [ ] Record `$REVIEW_DIR` path for all subsequent phases
- [ ] Print confirmation with path and branch name
- [ ] Save checkpoint: `.checkpoints/phase-0-clone.json`
- [ ] Update manifest: `completed_phase: 0`, `next_phase: 1`

## Context Gathering (Phase 1)

- [ ] Read `{workspace_root}/AGENTS.md` → identify PR repo's domain
- [ ] Read `.agents/_repos/{repo-name}.md` → repo-specific context
- [ ] Read `.agents/_domains/{domain}.md` → domain context
- [ ] Store combined as `$AGENTS_CONTEXT`
- [ ] Get PR metadata: title, description, author, base branch
- [ ] Get changed files with diff
- [ ] Read full file context from `$REVIEW_DIR` (not workspace repo)
- [ ] Classify each file: LOGIC / DELETION / STYLE / REFACTOR / NEW
- [ ] Query nano-brain for past context on changed modules
- [ ] Save checkpoint: `.checkpoints/phase-1-context.json`
- [ ] Update manifest: `completed_phase: 1`, `next_phase: 1.5`

## Linear Ticket Context (Phase 1.5)

- [ ] Extract ticket ID from branch name, PR description, or PR title
- [ ] If found: `linear_get_issue(id)` → fetch ticket details
- [ ] If found: `linear_list_comments(issueId)` → fetch discussion
- [ ] Extract acceptance criteria from ticket description
- [ ] If images in description: `linear_extract_images(description)`
- [ ] If not found: skip silently, continue without ticket context
- [ ] Save checkpoint: `.checkpoints/phase-1.5-linear.json`
- [ ] Update manifest: `completed_phase: 1.5`, `next_phase: 2`

## Smart Tracing (Phase 2)

- [ ] LOGIC changes: trace callers, callees, tests, types, data flow
- [ ] STYLE changes: verify no hidden logic changes
- [ ] REFACTOR changes: verify behavior preservation
- [ ] Query nano-brain for known issues on changed functions
- [ ] Save checkpoint: `.checkpoints/phase-2-tracing.json`
- [ ] Update manifest: `completed_phase: 2`, `next_phase: 2.5`

## PR Summary (Phase 2.5)

- [ ] Write "What This PR Does" (1-3 sentences)
- [ ] Categorize key changes (Feature/Bugfix/Refactor/etc.)
- [ ] File-by-file summary with line numbers
- [ ] Save checkpoint: `.checkpoints/phase-2.5-summary.json`
- [ ] Update manifest: `completed_phase: 2.5`, `next_phase: 3`

## Subagent Execution (Phase 3)

- [ ] Include `$REVIEW_DIR` path in ALL subagent prompts
- [ ] Launch Code Quality agent (explore)
- [ ] After Code Quality completes: update `.checkpoints/phase-3-subagents.json` + manifest subagent_status
- [ ] Launch Security & Logic agent (oracle)
- [ ] After Security & Logic completes: update `.checkpoints/phase-3-subagents.json` + manifest subagent_status
- [ ] Launch Docs & Best Practices agent (librarian)
- [ ] After Docs & Best Practices completes: update `.checkpoints/phase-3-subagents.json` + manifest subagent_status
- [ ] Launch Tests & Integration agent (general/quick)
- [ ] After Tests & Integration completes: update `.checkpoints/phase-3-subagents.json` + manifest subagent_status
- [ ] Collect ALL results (especially Oracle — never skip)
- [ ] Update manifest: `completed_phase: 3`, `next_phase: 4`

## Refinement (Phase 4)

- [ ] Merge and deduplicate findings across agents
- [ ] Consensus scoring: 2+ agents flagged same issue → boost confidence to high
- [ ] Auto-downgrade: single agent + no evidence + critical/warning → suggestion
- [ ] Apply severity filter (critical/warning keep, suggestion count-only)
- [ ] Gap analysis — any subagent fail? Unreviewed files?
- [ ] Second pass on gaps if needed
- [ ] Save checkpoint: `.checkpoints/phase-4-refined.json`
- [ ] Update manifest: `completed_phase: 4`, `next_phase: 4.5`

## Verification Spot-Check (Phase 4.5)

- [ ] Read `references/verification-protocol.md`
- [ ] For each critical/warning finding: read cited code at evidence file:line in `$REVIEW_DIR`
- [ ] Mark each: `verified:true` (keep) | `verified:false` (drop) | `verified:unverifiable` (downgrade to suggestion)
- [ ] If no critical/warning findings: skip to Phase 4.6
- [ ] Save checkpoint: `.checkpoints/phase-4.5-verification.json`
- [ ] Update manifest: `completed_phase: 4.5`, `next_phase: 4.6`

## Confidence Scoring (Phase 4.6)

- [ ] Read `references/confidence-scoring.md`
- [ ] Compute accuracy_rate, consensus_rate, evidence_rate
- [ ] Compute overall score (0–100)
- [ ] Apply gate: < 60 → add 🔴 warning, 60–79 → add ⚠️ warning, 80+ → proceed normally
- [ ] Save checkpoint: `.checkpoints/phase-4.6-confidence.json`
- [ ] Update manifest: `completed_phase: 4.6`, `next_phase: 5`

## Report (Phase 5)

- [ ] Save to `.opencode/reviews/{type}_{identifier}_{date}.md`
- [ ] TL;DR with verdict and counts
- [ ] Critical issues with full detail
- [ ] Warnings with full detail
- [ ] Improvements as one-liners
- [ ] File summary table
- [ ] Save checkpoint: `.checkpoints/phase-5-report.md`
- [ ] Update manifest: `completed_phase: 5`, `next_phase: 5.5`

## Save to Memory (Phase 5.5)

- [ ] Write key findings to nano-brain with tags: review, {repo}
- [ ] Verify searchable (`curl -s localhost:3100/api/search -d '{"query":"PR {number}"}'`)
- [ ] Update manifest: `completed_phase: 5.5`, `next_phase: 6`

## Cleanup (Phase 6)

- [ ] Show temp folder path and size to user
- [ ] **ASK user** before removing (NEVER auto-delete)
- [ ] If user confirms → `rm -rf "$REVIEW_DIR"` (also removes `.checkpoints/`)
- [ ] If user declines → remind them to clean up later
- [ ] For multiple PRs: ask about each temp folder individually
- [ ] Note: Checkpoints auto-removed with clone dir (PR reviews) or remain in `.checkpoints/` (local reviews)

## Final Notification

- [ ] Report path shown to user
- [ ] Issue counts (critical/warning/suggestion) displayed
- [ ] Temp folder cleanup status communicated
