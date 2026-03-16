---
name: pr-code-reviewer
description: "Comprehensive code review with 4 parallel subagents, smart tracing, iterative refinement, workspace-aware configuration, and GitHub Copilot-style PR summaries."
compatibility: "OpenCode with nano-brain"
metadata:
  author: Sisyphus
  version: "3.1.0"
  severity-levels: ["critical", "warning", "improvement", "suggestion"]
---

# PR Code Reviewer

**Version**: 3.1.0 | **Architecture**: 4 Parallel Subagents + Verification Pipeline | **Memory**: nano-brain

## Overview

Comprehensive PR reviewer: gathers full context, applies smart tracing by change type, runs four specialized subagents in parallel, iteratively refines findings, and produces a **short, actionable report** — only what matters. Also suggests code improvements when opportunities exist.

### NO PHASE SKIPPING (ABSOLUTE RULE)

**Every phase MUST be executed for every review, regardless of PR size.** A 1-line deletion can hide a critical logic bug. A "trivial" change can break cross-repo contracts. The phases exist because each one catches different classes of issues.

- **1-line change?** → Run all phases.
- **Deletion-only PR?** → Run all phases. Deletions are MORE dangerous, not less.
- **"Obviously safe"?** → Run all phases. Your confidence is the risk.
- **Only STYLE changes?** → Run all phases. Verify no hidden logic changes.

**The ONLY exception**: Phase 0 (clone) is skipped for `--staged` local reviews. Every other phase runs unconditionally.

## Report Philosophy

**People don't read long reports.** Every section must earn its place.

- **Critical + Warning = expanded** — full detail with file, line, impact, fix
- **Improvements = brief** — one-liner with code suggestion, only when there's a clear win
- **Suggestions = count only** — mentioned as a number, details in collapsible section or skipped
- **Praise = one line max** — or skip entirely if nothing stands out
- **No filler sections** — omit Traced Dependencies, Memory Context, Test Coverage unless they contain actionable findings
- **TL;DR at the top** — verdict + issue counts in 3 lines, reader decides whether to scroll

**Filtering rule**: If a finding wouldn't make a senior engineer stop and think, drop it.

## Prerequisites

### GitHub MCP Server (Required for PR Reviews)

```bash
npx create-code-reviewer   # Auto-detects git remote, configures everything
```

**Manual setup**: Add GitHub MCP to `opencode.json` — see [GitHub MCP Server](https://github.com/github/github-mcp-server). Needs `repo` scope token from https://github.com/settings/tokens.

**After setup**: Restart OpenCode. Verify with `/review PR#1`.

### Available GitHub MCP Tools

| Tool | Purpose |
|------|---------|
| `get_pull_request` | PR metadata (title, author, base) |
| `get_pull_request_files` | Changed files with diff |
| `get_pull_request_reviews` | Existing reviews |
| `get_pull_request_status` | CI/check status |
| `get_file_contents` | File content at ref |

### Local Reviews (No MCP Required)

For `--staged` or local reviews, uses git commands directly (`git diff --staged`, `git diff`, `git log`).

### nano-brain (Recommended)

Persistent memory for historical context — past reviews, architectural decisions, known issues.

**Full tool reference + query patterns**: [nano-brain-integration.md](references/nano-brain-integration.md)

### Linear MCP (Optional — Enriches Review Context)

When a Linear ticket is linked to the PR (via branch name or PR description), the reviewer fetches ticket context automatically.

**Available Linear MCP Tools:**

| Tool | Purpose |
|------|---------|
| `linear_get_issue` | Ticket title, description, acceptance criteria, status, priority, labels |
| `linear_list_comments` | Discussion thread on the ticket |
| `linear_get_attachment` | Attached specs, screenshots, designs |
| `linear_extract_images` | Extract images embedded in ticket description/comments |

**Ticket ID extraction** (checked in order):
1. PR branch name pattern: `feature/DEV-1234-...` or `fix/DEV-1234-...` → extracts `DEV-1234`
2. PR description: looks for `Linear: DEV-1234`, `Ticket: DEV-1234`, or Linear URL `linear.app/.../DEV-1234`
3. PR title: looks for `[DEV-1234]` or `DEV-1234:` prefix

If no ticket ID found → skip Linear context silently (no error, no warning).

## Configuration

Check for config at `.opencode/code-reviewer.json`. **Full example**: [config.json](assets/config.json)

## Checkpoint System

Reviews are resumable via checkpoints saved at each phase. If the agent crashes mid-review, you can resume from the last completed phase instead of starting over.

### Checkpoint Directory

**For PR Reviews:** `$REVIEW_DIR/.checkpoints/` (inside the temp clone directory)
**For Local Reviews (`--staged`):** `{current_working_directory}/.checkpoints/`

Checkpoints are automatically removed when the clone directory is deleted (Phase 6 cleanup).

### Checkpoint Files

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
| `phase-5-report.md` | Copy of final report | Phase 5 |

### Manifest Schema

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
    "4": "pending", "4.5": "pending", "5": "pending"
  },
  "subagent_status": {
    "explore": "pending", "oracle": "pending",
    "librarian": "pending", "general": "pending"
  }
}
```

### Phase 3 Special Handling

Phase 3 runs 4 parallel subagents. After **EACH** subagent completes:
1. Update `phase-3-subagents.json` with that subagent's findings and status
2. Update `manifest.json` subagent_status to `"complete"` for that subagent
3. On resume: only run subagents with status != `"complete"`

This allows resuming mid-Phase-3 if only some subagents completed before a crash.

## Workflow (CRITICAL — Follow Exactly, NEVER Skip Phases)

**Full checklist**: [review-checklist.md](checklists/review-checklist.md) — use this to track every step.

**ABSOLUTE RULE: Execute every phase in order. No phase may be skipped, shortened, or "optimized away" based on PR size, change type, or perceived simplicity. A 1-line deletion PR gets the same phase coverage as a 500-line feature PR.**

### Phase -1: Resume Detection (MANDATORY — Check Before Starting)

Before starting a new review, check for existing checkpoints to resume interrupted reviews.

**Steps:**

1. **Look for existing checkpoint**:
   ```bash
   find /tmp -maxdepth 1 -type d -name "pr-review-${repo}-${pr_number}-*" 2>/dev/null
   ```
   For local reviews: check for `.checkpoints/manifest.json` in current directory.

2. **If checkpoint found**, read `manifest.json`:
   ```bash
   cat "$REVIEW_DIR/.checkpoints/manifest.json"
   ```

3. **Validate checkpoint is still valid**:
   - Check `pr.number` matches current PR
   - For PR reviews: verify `head_sha` in manifest matches current PR head SHA (PR not updated since checkpoint)
   - If SHA mismatch → checkpoint is stale, delete old directory and start fresh

4. **Ask user to resume**:
   ```
   📂 Found checkpoint from previous review:
      Phase: {completed_phase} → {next_phase}
      Started: {started_at}
      Last updated: {last_updated}
   
   Resume from phase {next_phase}? (y/n)
   ```

5. **If user says yes**:
   - Load `manifest.json`
   - Load all completed phase files (phase-0-clone.json, phase-1-context.json, etc.)
   - Jump to `next_phase` in the workflow
   - For Phase 3: check `subagent_status` and only run incomplete subagents

6. **If user says no or checkpoint invalid**:
   - Delete old checkpoint directory: `rm -rf "$REVIEW_DIR"`
   - Start fresh from Phase 0

**For Local Reviews:** Checkpoint directory is `.checkpoints/` in current working directory. No SHA validation needed (working directory changes are expected).

### Phase 0: Repository Preparation (MANDATORY for PR Reviews)

**Why**: Your local repo may be on any branch, have uncommitted changes, or not exist at all. Cloning to a temp folder ensures:
- You always read the **actual PR branch code**, not whatever is checked out locally
- You can review **multiple PRs simultaneously** without branch conflicts
- Your working directory is **never disturbed**

**Steps:**

1. **Extract repo info** from PR URL or `gh pr view`:
   - `owner/repo` (e.g., `zengamingx/tradeit-backend`)
   - `pr_number` (e.g., `1159`)
   - `head_branch` (e.g., `feature/dev-4650-callback-url-for-payment-method`)

2. **Create unique temp directory**:
   ```bash
   REVIEW_DIR="/tmp/pr-review-${repo}-${pr_number}-$(date +%s)"
   mkdir -p "$REVIEW_DIR"
   ```
   Format: `/tmp/pr-review-{repo}-{pr_number}-{unix_timestamp}`

3. **Clone the repo** (shallow clone for speed):
   ```bash
   git clone --depth=50 --branch="${head_branch}" \
     "https://github.com/${owner}/${repo}.git" "$REVIEW_DIR"
   ```
   If the branch doesn't exist on remote (force-pushed/deleted), fall back to:
   ```bash
   git clone --depth=50 "https://github.com/${owner}/${repo}.git" "$REVIEW_DIR"
   cd "$REVIEW_DIR" && gh pr checkout ${pr_number}
   ```

4. **Verify clone succeeded**:
   ```bash
   cd "$REVIEW_DIR" && git log --oneline -1
   ```
   If this fails → STOP review, report error to user.

5. **Record the temp path** — ALL subsequent phases use `$REVIEW_DIR` for file reads, grep, LSP, etc.

6. **Print confirmation**:
   ```
   📂 Cloned to: /tmp/pr-review-tradeit-backend-1159-1741502400
   🌿 Branch: feature/dev-4650-callback-url-for-payment-method
   📝 Ready for review
   ```

**For Local Reviews (`--staged`):** Skip Phase 0 — use current working directory.

**CRITICAL**: Store `$REVIEW_DIR` path. Every file read, grep, and subagent prompt MUST reference this path, not the original workspace repo.

**Checkpoint:** Save clone metadata to `.checkpoints/phase-0-clone.json` (clone_dir, branches, head_sha, files_changed) and create `manifest.json` with `completed_phase: 0`, `next_phase: 1`, `phase_status: {"0": "complete", ...}`.

### Phase 1: Context Gathering

**For PR Reviews (GitHub MCP):**
1. `get_pull_request` → title, description, author, base branch
2. `get_pull_request_files` → changed files with diff stats
3. Read full file context from `$REVIEW_DIR` (NOT from GitHub API — local reads are faster and give full file)

**For Local Reviews (git):**
1. `git diff --staged` or `git diff` → changed files
2. `git log --oneline -5` → recent commit context

**Then for all reviews:**
3. Classify each file's change type:
   - **LOGIC**: Conditionals, business rules, state → DEEP TRACE
   - **DELETION**: Removing existing behavior/features → DEEP TRACE + PREMISE CHECK (see Phase 2)
   - **STYLE**: Formatting, naming, comments → SHALLOW TRACE
   - **REFACTOR**: Structure changes, no logic change → MEDIUM TRACE
   - **NEW**: New files → FULL REVIEW

   **DELETION classification rules**: Any PR that removes user-facing behavior, error messages, validation logic, UI elements, or API responses MUST be classified as DELETION, not STYLE or REFACTOR. Deletions feel safe but can hide regressions — they require the same depth as LOGIC changes plus a Premise Check.
4. Gather full context per changed file from `$REVIEW_DIR`: callers/callees, tests, types, usage sites
5. **Query nano-brain** for project memory on each changed module — [query patterns](references/nano-brain-integration.md#phase-1-memory-queries)
6. **Fetch Linear ticket context** (if ticket ID found) — see Phase 1.5

**Checkpoint:** Save results to `.checkpoints/phase-1-context.json` (PR metadata, file classifications, nano-brain context) and update `manifest.json` (`completed_phase: 1`, `next_phase: 1.5`).

### Phase 1.5: Linear Ticket Context (Optional)

If a Linear ticket ID was extracted from the branch name, PR description, or PR title:

1. **Fetch ticket**: `linear_get_issue(id)` → title, description (contains acceptance criteria), status, priority, labels, assignee
2. **Fetch comments**: `linear_list_comments(issueId)` → discussion thread, clarifications, edge cases mentioned
3. **Extract acceptance criteria** from ticket description — look for:
   - Sections titled "Acceptance Criteria", "AC", "Requirements", "Definition of Done"
   - Checkbox lists (`- [ ]` items)
   - Numbered requirements
4. **Extract images** if ticket description contains embedded images: `linear_extract_images(description)`

**What to do with ticket context:**
- Pass to ALL subagents as `## LINEAR TICKET CONTEXT` section
- Use acceptance criteria to verify PR completeness in Phase 4
- Flag in report if PR appears to miss acceptance criteria items
- Include ticket title + status in report header

**Ambiguity Detection (MANDATORY):**
If acceptance criteria are vague or open to multiple interpretations (e.g., "fix it", "make it correct", "improve this", "need to fix to make it correct"), you MUST:
1. Flag it as a **warning** in the report: *"Acceptance criteria are ambiguous — PR may not match intended fix."*
2. Identify the multiple interpretations (e.g., "remove the feature" vs "fix the condition")
3. Evaluate which interpretation the PR implements
4. Note in the report whether the PR's interpretation seems correct or if clarification is needed

**If Linear is unavailable or ticket not found:** Continue review without ticket context. Do NOT fail the review.

**Checkpoint:** Save results to `.checkpoints/phase-1.5-linear.json` (ticket details, acceptance criteria, comments, images) and update `manifest.json` (`completed_phase: 1.5`, `next_phase: 2`).

### Phase 2: Smart Tracing (Based on Change Type)

**LOGIC changes:**
1. Find ALL callers (LSP find_references) and callees
2. Find ALL tests covering this code path
3. Find ALL types/interfaces affected
4. Trace data flow: input source → output destination
5. Query nano-brain for known issues — [query patterns](references/nano-brain-integration.md#phase-2-memory-queries-logic-changes)

**DELETION changes (all LOGIC steps above, PLUS):**
6. **Premise Check** — answer these questions before proceeding:
   - Why was this code added originally? What problem did it solve?
   - Is the underlying problem solved by this PR, or is a symptom being hidden?
   - Would fixing the logic be more correct than removing it?
   - Does removing this break any user-facing behavior that was intentional?
   - Are there related components (backend config, i18n keys, API responses) that depend on this code existing?
7. Document the Premise Check answers — they feed into the report (Phase 5)

**Cross-Repo API Tracing (MANDATORY for multi-repo workspaces):**
For any changed code that **consumes data from an API** (fetches, reads responses, uses values from backend):
1. Identify the API endpoint being called (e.g., `/api/v2/inventory/my/data`)
2. Find the backend repo that serves this endpoint (use workspace AGENTS.md domain mappings)
3. Read the backend handler to understand:
   - What the API actually returns and under what conditions
   - Any config values that affect the response (e.g., cache TTLs, feature flags)
   - Whether the frontend's assumptions about the data match the backend's behavior
4. For any **hardcoded values** in the frontend that correspond to backend config (e.g., hardcoded `6 * 60 * 1000` vs backend's `steamCInvCacheTTLMinutes`), flag as a **warning**: values are out of sync.

**This applies even for deletions.** If the deleted code consumed API data, trace into the backend to understand whether the deletion is correct or whether the code should be fixed instead.

**STYLE changes:** Check convention consistency, verify no hidden logic changes.

**REFACTOR changes:** Verify behavior preservation, check all usages still work.

**Checkpoint:** Save results to `.checkpoints/phase-2-tracing.json` (tracing results per file, callers/callees, test coverage, data flow, premise check answers, cross-repo tracing) and update `manifest.json` (`completed_phase: 2`, `next_phase: 2.5`).

### Phase 2.5: PR Summary Generation (REQUIRED)

Before launching subagents, generate a GitHub Copilot-style PR summary. Reviewers need this context.

1. **What This PR Does** (1-3 sentences): Start with action verb, mention feature/bug, include business impact
2. **Key Changes** by category: Feature, Bugfix, Refactor, Performance, Security, Docs, Tests, Config, Dependencies
3. **File-by-File Summary**: What changed, why it matters, key modifications with line numbers
4. **Ticket Reference**: If Linear ticket found, include ticket ID, title, and status

**Full guidelines + pseudocode**: [report-template.md](references/report-template.md#pr-summary-generation-guidelines)

**Checkpoint:** Save results to `.checkpoints/phase-2.5-summary.json` (PR summary text, key changes, file summaries) and update `manifest.json` (`completed_phase: 2.5`, `next_phase: 3`).

### Phase 3: Parallel Subagent Execution (NEVER SKIP)

**ALL 4 subagents MUST run for EVERY review. No exceptions. No "this PR is too small." No "this is just a deletion." The phases exist because each subagent catches different classes of issues that you, the orchestrator, will miss.**

Launch ALL 4 subagents simultaneously with `run_in_background: true`. Include PR Summary, nano-brain memory, Premise Check results (if DELETION), cross-repo tracing results, and **`$REVIEW_DIR` path** in each prompt so subagents read from the correct clone.

| # | Agent | Type | Focus |
|---|-------|------|-------|
| 1 | Code Quality | `explore` | Style, naming, error handling, type safety, duplication, complexity, **code improvements** |
| 2 | Security & Logic | `oracle` | OWASP Top 10, logic correctness, edge cases, race conditions, auth, **logic improvements**, **cross-repo data flow**, **deletion premise validation** |
| 3 | Docs & Best Practices | `librarian` | API docs, framework best practices, anti-patterns, **idiomatic improvements** |
| 4 | Tests & Integration | `general` | Test coverage, edge cases, contract integrity, performance, **perf improvements** |

**Full prompt templates**: [subagent-prompts.md](references/subagent-prompts.md)

Each subagent returns JSON: `{findings: [{file, line, severity, category, message, suggestion, code_suggestion?, evidence, confidence, trace_path?}]}`

Severity values: `critical` (blocks merge), `warning` (should fix), `improvement` (code can be better), `suggestion` (nice-to-have)

New fields (v3.1): `evidence` (REQUIRED for critical/warning — concrete proof with file:line references), `confidence` (high/medium/low), `trace_path` (optional array of file:line strings showing verification trace)

**Checkpoint:** After **EACH** subagent completes, update `.checkpoints/phase-3-subagents.json` with that subagent's findings and update `manifest.json` subagent_status to `"complete"` for that subagent. After ALL subagents complete, update `manifest.json` (`completed_phase: 3`, `next_phase: 4`). On resume, only run subagents with status != `"complete"`.

### Phase 4: Iterative Refinement & Filtering

1. **Merge & Deduplicate**: Combine all subagent findings, remove duplicates (same issue from multiple agents)
2. **Consensus Scoring** (NEW — reduces false positives):
   - For each deduplicated finding, count how many subagents independently flagged it (match by file + line + category)
   - `consensus_count >= 2` → boost confidence to `high` (multiple agents agree)
   - `consensus_count == 1` + non-empty `evidence` with file:line references → keep original severity and confidence
   - `consensus_count == 1` + empty/missing `evidence` + severity `critical` or `warning` → **AUTO-DOWNGRADE to `suggestion`**
3. **Severity Filter** (CRITICAL — this makes reports short):
   - `critical` + `warning` → **KEEP with full detail**
   - `improvement` → **KEEP as one-liner** with optional code suggestion
   - `suggestion` → **COUNT only** — report total number, omit individual details unless < 3 total
   - Drop anything a linter/formatter would catch (let tools handle those)
   - Drop style nits that don't affect readability or correctness
4. **Gap Analysis**: Did any subagent fail? Untested code paths? Unreviewed files?
5. **Second Pass** (if gaps found): Targeted follow-up on identified gaps only

**Checkpoint:** Save results to `.checkpoints/phase-4-refined.json` (deduplicated findings with consensus scores, filtered by severity, gap analysis results) and update `manifest.json` (`completed_phase: 4`, `next_phase: 4.5`).

### Phase 4.5: Orchestrator Verification Spot-Check (Critical + Warning Only)

The orchestrator MUST verify each finding with severity `critical` or `warning` by reading the actual code at the cited evidence locations in `$REVIEW_DIR`. This catches false positives that survived subagent self-verification.

**If no critical/warning findings exist after Phase 4:** Skip Phase 4.5 (mark as complete immediately, proceed to Phase 5).

**For each critical/warning finding:**

1. **Parse the evidence field** — extract file:line references cited by the subagent
2. **Read the cited files** from `$REVIEW_DIR` at the referenced line numbers
3. **Verify the claim** based on finding category:
   - **Error handling claims**: Read the controller/route handler that calls this code path. If a try-catch exists at the HTTP boundary → finding is FALSE
   - **Null safety claims**: Read the data source (SQL query, API contract). If the source guarantees non-null (PK, NOT NULL, JOIN constraint) → finding is FALSE
   - **Logic error claims**: Trace the cited execution path. If no realistic input triggers the bug → finding is FALSE
   - **Framework pattern claims**: Check if the specific usage context makes the pattern safe → finding is FALSE
4. **Mark verification status**:
   - `verified: true` — evidence checks out, issue is real → **KEEP** in report
   - `verified: false` — evidence is wrong (e.g., try-catch DOES exist) → **DROP** from report
   - `verified: "unverifiable"` — can't confirm within timeout → **DOWNGRADE** to `suggestion`

**Timeout**: 30 seconds per finding. If verification takes longer, mark as `unverifiable` and move on.

**Checkpoint:** Save results to `.checkpoints/phase-4.5-verification.json`:
```json
{
  "findings_checked": 5,
  "verified_true": 3,
  "verified_false": 1,
  "unverifiable": 1,
  "dropped_findings": [{ "original": { "file": "...", "line": 42, "message": "..." }, "reason": "try-catch exists at controller.js:28" }],
  "downgraded_findings": [{ "original": { "file": "...", "line": 99, "message": "..." }, "new_severity": "suggestion" }]
}
```
Update `manifest.json` (`completed_phase: 4.5`, `next_phase: 5`).

### Phase 5: Report Generation
Save to `.opencode/reviews/{type}_{identifier}_{date}.md`. Create directory if needed.

**Report structure** (compact — omit empty sections):
1. **TL;DR** — verdict (APPROVE/REQUEST CHANGES/COMMENT) + issue counts in 3 lines
2. **PR Overview** — what this PR does (1-3 sentences) + key changes by category
3. **Ticket Alignment** — acceptance criteria coverage check (only if Linear ticket found). Flag ambiguous criteria.
4. **Premise Check** — only for DELETION changes: why the code existed, whether removal is correct vs fixing the logic, cross-repo implications
5. **Critical Issues** — full detail: file, line, issue, impact, fix
6. **Warnings** — full detail: file, line, issue, fix
7. **Code Improvements** — one-liner each with optional code suggestion
8. **Suggestions** — count + brief list (or omit if none)
9. **File Summary** — table only (file, change type, one-line summary)

**Omit unless actionable**: Traced Dependencies, Memory Context, Test Coverage, Praise, Change Classification. Include only if they contain findings the developer must act on.

**Full template**: [report-template.md](references/report-template.md)

**Checkpoint:** Save final report to `.checkpoints/phase-5-report.md` (copy of the report saved to `.opencode/reviews/`) and update `manifest.json` (`completed_phase: 5`, `next_phase: 5.5`).

### Phase 5.5: Save Review to nano-brain

Save key findings for future sessions. Includes PR number, title, date, files, critical issues, warnings, decisions, recommendation.

**Full save patterns**: [nano-brain-integration.md](references/nano-brain-integration.md#phase-55-save-review-to-nano-brain)

**Checkpoint:** Update `manifest.json` (`completed_phase: 5.5`, `next_phase: 6`).

### Phase 6: Cleanup (MANDATORY for PR Reviews)

**NEVER delete the temp folder without asking the user.** The user may want to inspect files, run tests, or review multiple PRs.

1. **Show the temp folder path and size**:
   ```bash
   du -sh "$REVIEW_DIR"
   ```

2. **Ask the user**:
   ```
   🧹 Cleanup: Review temp folder exists at:
      📂 /tmp/pr-review-tradeit-backend-1159-1741502400 (45M)

   Want me to remove it? (yes/no)
   ```

3. **Only if user confirms**: `rm -rf "$REVIEW_DIR"` (this also removes `.checkpoints/` since it's inside the clone directory)

4. **If user declines**: Remind them to clean up later:
   ```
   ℹ️ Temp folder kept. Remove manually when done:
      rm -rf /tmp/pr-review-tradeit-backend-1159-1741502400
   ```

**If reviewing multiple PRs**: Each PR has its own temp folder. Ask about each one individually at the end.

**Note:** Checkpoints are automatically removed when the clone directory is deleted. For local reviews (`--staged`), checkpoints remain in `.checkpoints/` until manually deleted.

### User Notification (CRITICAL)

After review completes, ALWAYS inform the user:

```
✅ Review complete!

📄 Report saved to: .opencode/reviews/PR_123_2026-02-04.md

Summary:
  • Critical: {count}
  • Warnings: {count}
  • Suggestions: {count}

🧹 Temp clone: /tmp/pr-review-{repo}-{pr}-{ts} — want me to remove it?
```

## Usage Examples

```
/review PR#123
/review https://github.com/owner/repo/pull/123
/review --staged
```

## Reference Documentation

| Document | Content | When to Read |
|----------|---------|--------------|
| [subagent-prompts.md](references/subagent-prompts.md) | Full prompt templates for all 4 subagents | Phase 3 execution |
| [report-template.md](references/report-template.md) | Report format, PR summary guidelines, pseudocode | Phase 2.5 + Phase 5 |
| [nano-brain-integration.md](references/nano-brain-integration.md) | Tool reference, query patterns, save patterns | Phase 1, 2, 5.5 |
| [config.json](assets/config.json) | Full workspace + output + trace config | Setup |
