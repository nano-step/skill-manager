---
name: pr-code-reviewer
description: "Review pull requests and staged changes for bugs, security issues, and code quality. Use this skill whenever the user mentions: review PR, code review, check this PR, review my changes, /review, PR #123, look at this diff, is this safe to merge, or provides a GitHub PR URL. Also triggers on: 'what do you think of these changes', 'review --staged', 'check my code before merge'."
compatibility: "OpenCode with nano-brain"
metadata:
  author: Sisyphus
  version: "3.3.0"
  severity-levels: ["critical", "warning", "improvement", "suggestion"]
---

# PR Code Reviewer

**Version**: 3.3.0 | **Architecture**: 4 Parallel Subagents + Verification Pipeline + Confidence Scoring | **Memory**: nano-brain

## Overview

Comprehensive PR reviewer: gathers full context, applies smart tracing by change type, runs four specialized subagents in parallel, iteratively refines findings, and produces a **short, actionable report** — only what matters. Also suggests code improvements when opportunities exist.

### Why Every Phase Runs

Each phase catches a different class of issue. A 1-line deletion can hide a critical logic bug that only cross-repo tracing (Phase 2) would reveal. A "trivial" style change can mask a hidden logic change that only subagent consensus (Phase 3-4) would catch. The only exception: Phase 0 (clone) is skipped for `--staged` local reviews.

## Report Philosophy

**People don't read long reports.** Every section must earn its place.

- **Critical + Warning = expanded** — full detail with file, line, impact, fix
- **Improvements = brief** — one-liner with code suggestion, only when there's a clear win
- **Suggestions = count only** — mentioned as a number, details in collapsible section or skipped
- **Praise = one line max** — or skip entirely if nothing stands out
- **No filler sections** — omit Traced Dependencies, Memory Context, Test Coverage unless they contain actionable findings
- **TL;DR at the top** — verdict + issue counts in 3 lines, reader decides whether to scroll

**Filtering rule**: If a finding wouldn't make a senior engineer stop and think, drop it.

## Token Efficiency — Read Files On-Demand

**Do NOT load all reference files upfront.** Read each file only when the relevant phase runs:

| Phase | Read at start of phase |
|-------|------------------------|
| Phase -2 | `references/setup-wizard.md` (only if no config) |
| Phase 1 | `{workspace_root}/AGENTS.md` + `.agents/_repos/{repo}.md` + `.agents/_domains/{domain}.md` |
| Phase 1 | `references/nano-brain-integration.md` |
| Phase 2 | Domain checklist for changed file types (one file only) |
| Phase 3 | `references/subagent-prompts.md` + stack framework rules (from config) |
| Phase 4 | `references/confidence-scoring.md` |
| Phase 4.5 | `references/verification-protocol.md` |
| Phase 5 | `references/report-template.md` |
| Phase 5.5 | `references/nano-brain-integration.md` (save section only) |

Framework rules: load ONLY the files matching `stack` in `.opencode/code-reviewer.json`. Never load all framework rules.

---

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

Reviews are resumable via checkpoints saved at each phase. If the agent crashes mid-review, resume from the last completed phase.

**Full details**: [checkpoint-system.md](references/checkpoint-system.md) — manifest schema, checkpoint files, Phase 3 special handling.

## Workflow

**Full checklist**: [review-checklist.md](checklists/review-checklist.md) — use this to track every step.

### Phase -2: Setup Check (First Run Detection)

Before anything else, check if `.opencode/code-reviewer.json` exists.

**If it exists**: read `stack` field → load only the matching framework rule files (listed in setup-wizard.md mapping table). Continue to Phase -1.

**If it doesn't exist** (or user ran `/review --setup`):
1. Read `references/setup-wizard.md` for the full wizard flow
2. Ask the 5 setup questions interactively
3. Write `.opencode/code-reviewer.json` with `stack` field filled in
4. Show confirmation with which framework rule files will be used
5. If called as `/review --setup` (not a real review), stop here. Otherwise continue.

**Stack → framework rules mapping** (also in setup-wizard.md):
- `frontend: nuxt/vue` → `framework-rules/vue-nuxt.md`
- `frontend: nextjs` → `framework-rules/nextjs.md`
- `frontend: react` → `framework-rules/react.md`
- `backend: express` → `framework-rules/express.md`
- `backend: nestjs` → `framework-rules/nestjs.md`
- `orm: typeorm` → `framework-rules/typeorm.md`
- `orm: prisma` → `framework-rules/prisma.md`
- `language: typescript*` → `framework-rules/typescript.md`

Store the resolved `$FRAMEWORK_RULES` content (concatenated) for Phase 3. If multiple match, concatenate them.

### Phase -1: Resume Detection (Check Before Starting)

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

### Phase 0: Repository Preparation (PR Reviews Only)

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

3. **Clone the repo** (minimal shallow clone — only latest commit):
   ```bash
   git clone --depth=1 --branch="${head_branch}" \
     "https://github.com/${owner}/${repo}.git" "$REVIEW_DIR"
   ```
   If the branch doesn't exist on remote (force-pushed/deleted), fall back to:
   ```bash
   git clone --depth=1 "https://github.com/${owner}/${repo}.git" "$REVIEW_DIR"
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

Store `$REVIEW_DIR` path — every file read, grep, and subagent prompt references this path, not the original workspace repo.

**Checkpoint:** Save clone metadata to `.checkpoints/phase-0-clone.json` (clone_dir, branches, head_sha, files_changed) and create `manifest.json` with `completed_phase: 0`, `next_phase: 1`, `phase_status: {"0": "complete", ...}`.

### Phase 1: Context Gathering

**Step 0 — Load agent knowledge base (MANDATORY if configured):**

Read `agents` config from `.opencode/code-reviewer.json`. If `has_agents_md: true`:

1. **Read `{workspace_root}/AGENTS.md`** — keyword→domain→repo mapping table. Use this to identify which domain the PR's repo belongs to.

2. **Read `{workspace_root}/.agents/_repos/{repo-name}.md`** (if `has_repos_dir: true`) — repo-specific context: framework, port, key files, known issues, cross-repo relationships. `repo-name` comes from the PR's `owner/repo` (e.g., PR from `tradeit-backend` → read `.agents/_repos/tradeit-backend.md`).

3. **Read `{workspace_root}/.agents/_domains/{domain}.md`** (if `has_domains_dir: true`) — domain context for the repo's domain. Domain identified from AGENTS.md mapping (e.g., `tradeit-backend` → `trading-core` domain → read `.agents/_domains/trading-core.md`).

4. **For cross-repo tracing (Phase 2)**: if the PR touches API contracts or shared data, also read:
   - `.agents/_indexes/by-database.md` — which repo owns which DB table
   - `.agents/_indexes/by-data-source.md` — which repo consumes which external API

Do NOT read all repo/domain files — only the ones relevant to the PR being reviewed. Store combined result as `$AGENTS_CONTEXT`.

If `agents` config is missing or files not found: continue without it, no error.

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

   **DELETION classification**: Any PR that removes user-facing behavior, error messages, validation logic, UI elements, or API responses is classified as DELETION, not STYLE or REFACTOR. Deletions feel safe but can hide regressions — they require the same depth as LOGIC changes plus a Premise Check.
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

**Ambiguity Detection:**
If acceptance criteria are vague or open to multiple interpretations (e.g., "fix it", "make it correct", "improve this", "need to fix to make it correct"):
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

**Cross-Repo API Tracing** (for multi-repo workspaces):
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

**Domain-Specific Checklists**: Based on the file types in the PR, read the relevant checklist for domain-specific review criteria:
- Vue/Nuxt frontend files → [frontend-vue-nuxt.md](checklists/frontend-vue-nuxt.md)
- Express/Node backend → [backend-express.md](checklists/backend-express.md)
- Database migrations/queries → [database.md](checklists/database.md)
- CI/CD configs → [ci-cd.md](checklists/ci-cd.md)
- Consumer search patterns → [consumer-search-matrix.md](checklists/consumer-search-matrix.md)

**Checkpoint:** Save results to `.checkpoints/phase-2-tracing.json` (tracing results per file, callers/callees, test coverage, data flow, premise check answers, cross-repo tracing) and update `manifest.json` (`completed_phase: 2`, `next_phase: 2.5`).

### Phase 2.5: PR Summary Generation (REQUIRED)

Before launching subagents, generate a GitHub Copilot-style PR summary. Reviewers need this context.

1. **What This PR Does** (1-3 sentences): Start with action verb, mention feature/bug, include business impact
2. **Key Changes** by category: Feature, Bugfix, Refactor, Performance, Security, Docs, Tests, Config, Dependencies
3. **File-by-File Summary**: What changed, why it matters, key modifications with line numbers
4. **Ticket Reference**: If Linear ticket found, include ticket ID, title, and status

**Full guidelines + pseudocode**: [report-template.md](references/report-template.md#pr-summary-generation-guidelines)

**Checkpoint:** Save results to `.checkpoints/phase-2.5-summary.json` (PR summary text, key changes, file summaries) and update `manifest.json` (`completed_phase: 2.5`, `next_phase: 3`).

### Phase 3: Parallel Subagent Execution

Launch all 4 subagents simultaneously with `run_in_background: true`. Each agent catches issues the others miss — the quality agent finds duplication the security agent ignores, the librarian catches framework anti-patterns the integration agent overlooks. Include PR Summary, nano-brain memory, Premise Check results (if DELETION), cross-repo tracing results, `$REVIEW_DIR` path, and `$FRAMEWORK_RULES` (from Phase -2) in each prompt.

Read `references/subagent-prompts.md` now for the full prompt templates.

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
3. **Severity Filter** (keeps reports short):
   - `critical` + `warning` → **KEEP with full detail**
   - `improvement` → **KEEP as one-liner** with optional code suggestion
   - `suggestion` → **COUNT only** — report total number, omit individual details unless < 3 total
   - Drop anything a linter/formatter would catch (let tools handle those)
   - Drop style nits that don't affect readability or correctness
4. **Gap Analysis**: Did any subagent fail? Untested code paths? Unreviewed files?
5. **Second Pass** (if gaps found): Targeted follow-up on identified gaps only

**Checkpoint:** Save results to `.checkpoints/phase-4-refined.json` (deduplicated findings with consensus scores, filtered by severity, gap analysis results) and update `manifest.json` (`completed_phase: 4`, `next_phase: 4.5`).

### Phase 4.5: Orchestrator Verification Spot-Check (Critical + Warning Only)

Verify each critical/warning finding by reading the actual code at cited evidence locations. This catches false positives that survived subagent self-verification.

If no critical/warning findings exist after Phase 4, skip to Phase 4.6.

**Full protocol**: [verification-protocol.md](references/verification-protocol.md) — category-specific verification rules, timeout policy, checkpoint schema.

**Checkpoint:** Save to `.checkpoints/phase-4.5-verification.json`. Update manifest (`completed_phase: 4.5`, `next_phase: 4.6`).

### Phase 4.6: Result Confidence Assessment

Score how confident we are in the review's findings — are they correct and complete? Computed from accuracy rate (40%), consensus rate (30%), and evidence rate (30%).

| Score | Label | Gate Action |
|-------|-------|-------------|
| 80–100 | 🟢 High | Proceed normally |
| 60–79 | 🟡 Medium | Add warning: "Some findings may be inaccurate" |
| < 60 | 🔴 Low | Add warning: "Low confidence — manual review recommended" |

**Full scoring details**: [confidence-scoring.md](references/confidence-scoring.md) — formula, per-finding confidence levels, special cases, checkpoint schema.

**Checkpoint:** Save to `.checkpoints/phase-4.6-confidence.json`. Update manifest (`completed_phase: 4.6`, `next_phase: 5`).

### Phase 5: Report Generation
Save to `.opencode/reviews/{type}_{identifier}_{date}.md`. Create directory if needed.

**Report structure** (compact — omit empty sections):
1. **TL;DR** — verdict (APPROVE/REQUEST CHANGES/COMMENT) + issue counts + Result Confidence score from Phase 4.6
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

### Phase 6: Cleanup (PR Reviews Only)

Always ask before deleting the temp folder — the user may want to inspect files, run tests, or review multiple PRs.

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

### User Notification

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
| [setup-wizard.md](references/setup-wizard.md) | Stack setup wizard — questions, mapping, config schema | Phase -2 (first run) |
| [subagent-prompts.md](references/subagent-prompts.md) | Full prompt templates for all 4 subagents | Phase 3 execution |
| [report-template.md](references/report-template.md) | Report format, PR summary guidelines, pseudocode | Phase 2.5 + Phase 5 |
| [nano-brain-integration.md](references/nano-brain-integration.md) | Tool reference, query patterns, save patterns | Phase 1, 2, 5.5 |
| [config.json](assets/config.json) | Full workspace + output + trace + stack config | Setup |
| [security-patterns.md](references/security-patterns.md) | OWASP patterns, auth checks | Phase 3 (Security agent) |
| [quality-patterns.md](references/quality-patterns.md) | Code quality anti-patterns | Phase 3 (Quality agent) |
| [performance-patterns.md](references/performance-patterns.md) | N+1, caching, allocation patterns | Phase 3 (Integration agent) |
| [framework-rules/](references/framework-rules/) | vue-nuxt, express, nestjs, typeorm, typescript, nextjs, react, prisma | Phase -2 (load only stack-matching files) |
| [checkpoint-system.md](references/checkpoint-system.md) | Manifest schema, checkpoint files, resume logic | Phase -1 (resume detection) |
| [verification-protocol.md](references/verification-protocol.md) | Category-specific verification rules | Phase 4.5 |
| [confidence-scoring.md](references/confidence-scoring.md) | Confidence formula, thresholds, display format | Phase 4.6 |
| [checklists/database.md](checklists/database.md) | MySQL/Redis patterns, transactions, migrations | Phase 2 (DB file changes) |
