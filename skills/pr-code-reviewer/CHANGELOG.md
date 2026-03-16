# PR Code Reviewer Changelog

## v3.1.0 (2026-03-16) - Verification Pipeline (False Positive Reduction)

**FIX**: ~50% of critical/warning findings were false positives because subagents inspected code locally without verifying the full execution context. This release adds a 3-layer verification pipeline that reduces false positives to ~10%.

### Added
- **VERIFICATION PROTOCOL** in all 4 subagent prompts — mandatory 4-step process (IDENTIFY → TRACE → VERIFY → DECIDE) before reporting any critical/warning finding
- **Evidence field** (`evidence`, `confidence`, `trace_path`) in finding schema — subagents must cite concrete file:line proof for critical/warning findings
- **Evidence examples** (good vs bad) in filtering rules — teaches subagents what constitutes valid evidence
- **Consensus scoring** in Phase 4 — tracks how many subagents independently flagged the same issue; single-agent findings without evidence are auto-downgraded
- **Phase 4.5: Orchestrator Verification Spot-Check** — orchestrator reads actual code at cited evidence locations to verify critical/warning findings (30s timeout per finding)
- **`phase-4.5-verification.json` checkpoint** — tracks verification results for resumability
- **Verification metadata in report TL;DR** — shows how many findings were dropped as false positives

### Changed
- Phase 4 now includes consensus scoring step after deduplication
- Phase 4 checkpoint `next_phase` updated from `5` to `4.5`
- Manifest schema includes Phase 4.5 in `phase_status`
- Finding schema in SKILL.md Phase 3 updated to include new fields
- All 4 subagent return format sections updated with `evidence`, `confidence`, `trace_path`

### How It Works
1. **Layer 1 (Subagent self-verification)**: Subagents trace error handling to HTTP boundary, null safety to data source, framework patterns to usage context — before reporting
2. **Layer 2 (Orchestrator spot-check)**: Orchestrator reads cited files and verifies evidence claims for critical/warning findings
3. **Layer 3 (Consensus scoring)**: Multi-agent agreement boosts confidence; single-agent findings without evidence are downgraded

## v2.7.0 (2026-03-09) - Clone to Temp Folder

**FIX**: Reviews now clone the PR branch into a unique temp folder instead of checking out locally. Prevents branch conflicts and enables simultaneous multi-PR reviews.

### Added
- **Phase 0: Repository Preparation (Clone to Temp)** — MANDATORY pre-review step
  - Creates unique temp dir: `/tmp/pr-review-{repo}-{pr}-{unix_timestamp}`
  - Shallow clones repo with `--depth=50 --branch={head_branch}`
  - Falls back to `gh pr checkout` if branch not found on remote
  - Verifies clone succeeded before proceeding
  - Records `$REVIEW_DIR` path for all subsequent phases
- **Phase 6: Cleanup** — asks user before removing temp folder (NEVER auto-deletes)
  - Shows folder path and size
  - Requires explicit user confirmation to delete
  - Handles multiple PR temp folders individually
- **Review Checklist** (`checklists/review-checklist.md`) — step-by-step checklist covering all phases
- All 4 subagent prompts now include `## REVIEW DIRECTORY` section pointing to temp clone

### Why (replaces v7.1.0 checkout approach)
- `gh pr checkout` on the local repo **disturbs your working directory** — uncommitted changes, stashes, branch switches
- Cloning to `/tmp` means your workspace is **never touched**
- Unique timestamp in folder name enables **parallel reviews** of multiple PRs
- User controls cleanup — temp folder persists until explicitly removed

### Changed
- Phase 1 now reads full file context from `$REVIEW_DIR` instead of GitHub API
- Subagent prompts explicitly instruct agents to read from `$REVIEW_DIR`, not workspace repo
- User notification now includes temp folder path and cleanup prompt

---

## v7.1.0 (2026-03-05) - Branch Alignment Before Review (SUPERSEDED by v2.7.0)

**FIX**: Reviews now always run against the correct PR branch, not whatever branch happens to be checked out locally.

### Added
- **Phase 0: Repository Preparation (Branch Alignment)** — MANDATORY pre-review step
  - Extracts repo info from PR URL / `github_get_pull_request`
  - Clones repo if not present locally
  - Saves current branch and stashes uncommitted changes
  - Checks out the PR's head branch via `gh pr checkout`
  - Verifies checkout succeeded before proceeding
  - Optionally updates consumer repos to their default branch for cross-repo search
- **Phase 6: Repository Cleanup** — restores original branch and unstashes changes after review
- **🚫 Read-Only Rule** — explicit absolute prohibition on any GitHub write actions (push, comment, merge, review, etc.)
- Subagent prompts now explicitly note that all file reads happen against the checked-out PR branch

### Why
Local repos may be on any branch (feature branch, old release, etc.). Previous versions read files from whatever was checked out, which could produce:
- False positives (flagging code that doesn't exist in the PR)
- Missed bugs (not seeing code that IS in the PR)
- Wrong context for cross-repo consumer search

This version ensures the reviewer always sees the actual PR code.

---

## v7.0.0 (2026-02-24) - Unified Architecture

MAJOR: Merged project-level v6.1 (cross-repo consumer search, better-context structural analysis) with global v2.6 (4 parallel subagents, nano-brain memory, iterative refinement) into a single unified skill.

### Added
- 5 parallel subagents (was inline review in v6.1, was 4 subagents in v2.6)
  - Code Quality (explore)
  - Security and Logic (oracle)
  - Docs and Best Practices (librarian)
  - Tests and Integration (quick)
  - Cross-Repo Consumer Search (explore, conditional)
- nano-brain integration for persistent memory across review sessions
- PR Summary generation (GitHub Copilot-style)
- Iterative refinement with dedup, severity filtering, and gap analysis
- Configuration file support (.opencode/code-reviewer.json)
- Smart tracing by change type (LOGIC/STYLE/REFACTOR/NEW)

### Enhanced
- Subagent prompts now include better-context structural data (centrality, dependents)
- Subagent prompts now include breaking change signals from Phase 2
- Report template includes both Structural Analysis and Cross-Repo Consumer Search sections
- Framework checklists and rules passed to relevant subagents

### Preserved from v6.1
- better-context structural analysis (Phase 1.5)
- MANDATORY cross-repo consumer search (now as 5th subagent)
- Breaking change signal detection (Phase 2)
- All checklists: consumer-search-matrix, backend-express, frontend-vue-nuxt, database, ci-cd
- All framework rules: express, nestjs, typeorm, typescript, vue-nuxt
- Severity reference with cross-repo icon

### Preserved from v2.6
- Parallel subagent architecture
- nano-brain integration (query + save)
- Compact report philosophy
- Iterative refinement and filtering
- Config file support

### Architecture
- Project-level skill (takes priority over global)
- SKILL.md is concise, references external files for details
- 13 reference/checklist files for domain-specific knowledge

---

## v6.1.1 (2026-02-12) - Centralized Manifests

**FIX**: Moved better-context manifests to centralized location to avoid polluting individual repos.

### Changed
- Manifests now stored at `.better-context/{repo}.json` at workspace root
- No `.better-context/` folders in individual repos
- No gitignore changes needed in repos
- Updated scan command to use `--out` for centralized output

---

## v6.1.0 (2026-02-12) - better-context Integration

**ENHANCEMENT**: Integrated better-context for structural analysis using PageRank centrality and dependency graphs.

### Added
- **better-context Integration** (Phase 1.5)
  - `uvx better-context scan` - Index codebase and detect cycles
  - `uvx better-context stats` - PageRank centrality ranking
  - `uvx better-context focus <file>` - Ego-centric context for changed files
  - `uvx better-context deps <file>` - Dependencies and dependents

- **Structural Analysis Output**
  - Changed files impact table with centrality scores
  - High-centrality file flags (> 0.05 = critical)
  - Dependency cycle warnings
  - Suggested reading order for understanding changes

- **Centrality-Based Review Priority**
  - Files with centrality > 0.08 → CRITICAL (core infrastructure)
  - Files with centrality 0.05-0.08 → HIGH (shared utilities)
  - Files with > 10 dependents → WIDE IMPACT flag

- **Configuration Files**
  - `.ctx.json` - better-context configuration
  - `.ctxignore` - Patterns to exclude from analysis

### Enhanced
- Report template now includes Structural Analysis section
- High-impact files flagged based on PageRank score
- Dependency cycle detection integrated into review workflow

### Why better-context?
- **PageRank Centrality**: Mathematically identifies critical files (not guesswork)
- **Focus Mode**: Shows exactly what depends on a changed file
- **Cycle Detection**: Found 2 circular dependency cycles in tradeit-backend
- **Token Optimization**: Efficient context selection for AI review

### Complementary to Our AGENTS.md
- better-context provides **structural intelligence** (what depends on what)
- Our AGENTS.md provides **domain intelligence** (business logic, cross-repo relationships)
- Together: Complete picture for thorough PR reviews

---

## v6.0.0 (2026-02-11) - Cross-Repo Consumer Search

**MAJOR**: Mandatory cross-repo consumer search for ALL breaking changes

### Added
- **Consumer Search Matrix** (`checklists/consumer-search-matrix.md`)
  - Comprehensive matrix of what changes require cross-repo search
  - Search patterns for each change type (API fields, Redis keys, DB columns, etc.)
  - Critical fields list that should never be removed without migration
  
- **Domain-Specific Checklists**
  - `checklists/backend-express.md` - Express/Node patterns, error handling, timeouts
  - `checklists/frontend-vue-nuxt.md` - Vue 3/Nuxt 3 patterns, reactivity, state management
  - `checklists/database.md` - MySQL/Redis patterns, transactions, migrations
  - `checklists/ci-cd.md` - Docker, CircleCI, deployment safety

- **Breaking Change Signal Detection**
  - Conditional/ternary removed → CRITICAL (PR #1101 imgURL issue)
  - Default case logic changed → WARNING (PR #1101 insightService issue)
  - Middleware removed → Search httpContext consumers
  - External URL pattern changed → Search all frontend consumers

- **Timeout/Hang Detection**
  - AI/LLM calls without timeout → CRITICAL
  - External HTTP calls without timeout → CRITICAL
  - Database queries in loops without limit → WARNING

### Enhanced
- SKILL.md now requires Consumer Search Output section in all reviews
- Backend signal detection includes service logic changes
- Cross-repo search scope expanded to tradeit, tradeit-admin, tradeit-extension

### Post-mortem
PR #1101 review revealed two critical issues that would have been caught with proper consumer search:
1. `imgURL` conditional removed in inventoryService.js → 30+ frontend components affected
2. `insightService.js` default case changed → AI content generation broken for category slugs

Both issues were NOT in the PR diff but affected by the changes. This version makes cross-repo consumer search MANDATORY.

---

## v5.1.0 (2026-02-11) - CRITICAL FIX

**CRITICAL FIX**: Mandatory consumer search for Pinia store migrations

### Added
- Phase 1.5 - Breaking Change Signal Detection
- Automatic detection of Pinia stores from file paths
- MANDATORY consumer search with exact grep commands
- Required output format for consumer search results
- Orchestrator verification that consumer search was performed
- Re-run mechanism for incomplete reviews

### Enhanced
- state-mgmt subagent prompt with step-by-step consumer search

### Fixed
- Subagents now search ENTIRE codebase, not just PR files

### Post-mortem
PR #3088 review missed `rootState.currency` bug in `store/inventory.js` because:
1. The file was NOT in the PR (not assigned to subagent)
2. Consumer search instructions were advisory, not mandatory
3. No verification that search was actually performed

---

## v5.0.0 (2026-02-11)

### Added
- Vuex/Pinia migration checklist (from PR #3108 analysis)
- Cross-repo impact analysis with database ownership check
- Devil's Advocate verification protocol
- OWASP 2025-aligned security checklist
- Historical context check before flagging issues
- Research synthesis documentation

### Enhanced
- state-mgmt category with migration patterns
- security category with OWASP Top 10 (2025)
- cross-repo category with consumer search patterns

---

## v4.0.0 (2026-02-10)

### Redesigned
- Token-efficient orchestrator (< 3000 tokens)

### Added
- Path-based file categorization
- Subagent file-based output
- Checklist tracking

### Removed
- Django, Next.js, React framework rules

---

## v3.0.0

- Initial parallel subagent architecture
