# Subagent Prompt Templates

Launch ALL 4 subagents simultaneously with `run_in_background: true`.

**IMPORTANT**: Include the PR Summary in each subagent's context so they understand the overall change.

**IMPORTANT**: If project memory results were gathered in Phase 1, include them as a `## NANO-BRAIN MEMORY` section in each subagent's prompt.

**IMPORTANT**: Include `$REVIEW_DIR` (the temp clone path from Phase 0) in each subagent's prompt. All file reads, grep searches, and LSP operations MUST target this path — NOT the original workspace repo. This ensures subagents see the actual PR branch code.

**IMPORTANT**: If Phase 2 produced cross-repo tracing results or a Premise Check (for DELETION changes), include them as `## CROSS-REPO TRACING` and `## PREMISE CHECK` sections in each subagent's prompt.

```
## REVIEW DIRECTORY
All file reads and searches MUST use this path (temp clone of PR branch):
  ${REVIEW_DIR}
Do NOT read from the original workspace repo — it may be on a different branch.
```

## Filtering Rules (Include in ALL subagent prompts)

Every subagent MUST apply these rules before returning findings:

```
## FILTERING RULES (MANDATORY)
- ONLY report findings that would make a senior engineer stop and think
- SKIP anything a linter/formatter would catch (let tools handle those)
- SKIP style nits that don't affect readability or correctness
- SKIP obvious comments like "add JSDoc to this function" unless it's a public API
- For each finding, ask: "Would I block a PR for this?" If no → downgrade or drop
- Severity guide:
  - critical: Blocks merge. Security hole, data loss, crash, logic bug
  - warning: Should fix before merge. Edge case, missing validation, race condition
  - improvement: Code works but can be better. Cleaner, faster, more idiomatic
  - suggestion: Nice-to-have. Won't block, won't even flag strongly

## EVIDENCE REQUIREMENT (MANDATORY for critical/warning)
- Every finding with severity `critical` or `warning` MUST include an `evidence` field
- Evidence MUST cite specific file paths and line numbers you actually read
- Findings with severity `critical` or `warning` that lack evidence will be AUTO-DOWNGRADED to `suggestion` by the orchestrator
- `improvement` and `suggestion` findings do NOT require evidence (field can be empty)

## VERIFICATION PROTOCOL (MANDATORY for critical/warning)

Before reporting any finding with severity `critical` or `warning`, complete these 4 steps:

### Step 1: IDENTIFY
What looks wrong? State the specific concern.

### Step 2: TRACE
Read the surrounding context beyond the changed file. For each concern type:
- **Error handling**: Trace the throw/error path UP to the HTTP boundary (controller/route handler). Check for try-catch at EVERY layer between the throw and the controller.
- **Null safety**: Trace the data DOWN to its source (SQL query, API contract, constructor). Check if the source guarantees non-null (e.g., DB primary key, NOT NULL column, JOIN constraint).
- **Framework patterns**: Check if the specific usage context makes the pattern safe (e.g., Pinia singleton backing a composable, client-only component, intentionally non-reactive value).
- **Logic errors**: Construct a CONCRETE triggering scenario with specific input values that would cause the bug.

### Step 3: VERIFY
Can you PROVE this is a real problem? You need ONE of:
- A concrete execution path that reaches the bug (with specific inputs)
- A missing handler at the HTTP boundary (cite the controller file:line where the catch SHOULD be but ISN'T)
- A data source that can actually produce the problematic value (cite the query/API that returns nullable data)

If you cannot construct concrete proof after tracing → DROP the finding silently.

### Step 4: DECIDE
- **Verified** → Report with `evidence` field containing your proof (file:line references)
- **Unverifiable** (too many layers, external system) → Report as `suggestion` with `evidence: "unverified: {reason}"`
- **Disproven** (e.g., try-catch exists at boundary, data source is non-null) → DROP silently. Do NOT report.

## EVIDENCE EXAMPLES

GOOD evidence (concrete, traceable):
- "Throw at `openSearchService.js:870` propagates through `insightService.js:939` (no catch) → `metaService.js:158` (no catch) → controller `meta.js:28` has NO try-catch. Error reaches HTTP boundary unhandled."
- "`.id` comes from `fetchItemMetaImages` SQL query at `metaRepo.js:332` using LEFT JOIN — `imiu.item_id` can be NULL when no image row exists."
- "AbortController is non-reactive by design — backed by Pinia singleton store at `useTradeSimilarItemsStore.js:3`, composable creates one closure per component lifecycle."

BAD evidence (will be auto-downgraded by orchestrator):
- "This could throw an error" (no trace to boundary)
- "This might be null" (no trace to data source)
- "This violates best practices" (no concrete impact)
- "Missing error handling" (didn't check if caller handles it)
```

## Subagent 1: EXPLORE — Code Quality & Patterns

```javascript
delegate_task({
  subagent_type: "explore",
  load_skills: [],
  run_in_background: true,
  prompt: `
    ## REVIEW DIRECTORY
    All file reads and searches MUST use this path (temp clone of PR branch):
      ${REVIEW_DIR}
    Do NOT read from the original workspace repo — it may be on a different branch.
    
    ## PR SUMMARY
    ${prSummary}
    
    ## CHANGED FILES
    ${changedFilesWithDiff}
    
    ## TRACED DEPENDENCIES
    ${tracedDependencies}
    
    ## NANO-BRAIN MEMORY (past sessions, reviews, decisions)
    ${projectMemory || "No nano-brain memory available for this workspace"}
    
    ## LINEAR TICKET CONTEXT (from linked Linear ticket)
    ${linearTicketContext || "No Linear ticket linked to this PR"}
    
    ## CROSS-REPO TRACING (from Phase 2 — backend data flow analysis)
    ${crossRepoTracing || "No cross-repo tracing performed"}
    
    ## PREMISE CHECK (for DELETION changes — why the code existed)
    ${premiseCheck || "Not a DELETION change — no premise check needed"}
    
    ${FILTERING_RULES}
    
    ## TASK
    Analyze code quality, patterns, and improvement opportunities
    
    ## CHECK
    1. Error handling patterns — missing catches, swallowed errors, generic catches
    2. Type safety — any casts, missing null checks, unsafe assertions
    3. Code duplication — repeated logic that should be extracted
    4. Complexity — deep nesting, long functions, god objects
    5. **Code improvements** — cleaner alternatives, better abstractions, simpler logic
    6. **Dead code from deletions** — if code was removed, check if related code (exports, i18n keys, config) is now orphaned
    
    DO NOT report: naming nits, formatting, import order, missing comments on obvious code
    
    ## RETURN FORMAT
    JSON: {findings: [{file, line, severity, category, message, suggestion, code_suggestion?, evidence, confidence, trace_path?}]}
    severity: "critical" | "warning" | "improvement" | "suggestion"
    evidence: REQUIRED for critical/warning — concrete proof with file:line references. Empty string for improvement/suggestion.
    confidence: "high" (traced 2+ layers, concrete proof) | "medium" (traced 1 layer) | "low" (pattern-based, no trace)
    trace_path: Optional array of "file:line" strings showing the verification trace (e.g., ["service.js:870", "controller.js:28"])
  `
});
```

## Subagent 2: ORACLE — Security & Logic

```javascript
delegate_task({
  subagent_type: "oracle",
  load_skills: [],
  run_in_background: true,
  prompt: `
    ## REVIEW DIRECTORY
    All file reads and searches MUST use this path (temp clone of PR branch):
      ${REVIEW_DIR}
    Do NOT read from the original workspace repo — it may be on a different branch.
    
    ## PR SUMMARY
    ${prSummary}
    
    ## CHANGED FILES
    ${changedFilesWithDiff}
    
    ## TRACED DEPENDENCIES
    ${tracedDependencies}
    
    ## NANO-BRAIN MEMORY (past sessions, reviews, decisions)
    ${projectMemory || "No nano-brain memory available for this workspace"}
    
    ## LINEAR TICKET CONTEXT (from linked Linear ticket)
    ${linearTicketContext || "No Linear ticket linked to this PR"}
    
    ## CROSS-REPO TRACING (from Phase 2 — backend data flow analysis)
    ${crossRepoTracing || "No cross-repo tracing performed"}
    
    ## PREMISE CHECK (for DELETION changes — why the code existed)
    ${premiseCheck || "Not a DELETION change — no premise check needed"}
    
    ${FILTERING_RULES}
    
    ## TASK
    Deep security, logic analysis, and logic improvement opportunities
    
    ## CHECK
    1. OWASP Top 10 vulnerabilities
    2. Logic correctness (especially for LOGIC-type changes)
    3. Edge cases and boundary conditions
    4. Race conditions and state management
    5. Input validation gaps
    6. Authentication/authorization holes
    7. **Logic improvements** — simpler conditionals, better error paths, clearer state machines
    8. **Ticket alignment** — do the code changes match the acceptance criteria from the Linear ticket?
    9. **Cross-repo data consistency** — if the code consumes API data, do frontend assumptions match backend behavior? Are there hardcoded values that should come from backend config?
    10. **Deletion premise validation** — if code was deleted: Was the code there for a valid reason? Is removal the right fix, or should the logic be corrected instead? Does the deletion hide a problem rather than solve it?
    
    CRITICAL: For any if-else or conditional changes, trace ALL code paths affected.
    CRITICAL: For DELETION changes, you MUST evaluate whether removal is correct or whether the code should be FIXED instead. Challenge the PR's premise — don't assume deletion is the right approach.
    CRITICAL: For any data consumed from an API, verify the frontend's interpretation matches the backend's actual behavior. Flag hardcoded values that correspond to backend config.
    
    DO NOT report: theoretical vulnerabilities with no realistic attack vector in this context
    
    ## RETURN FORMAT
    JSON: {findings: [{file, line, severity, category, message, suggestion, code_suggestion?, evidence, confidence, trace_path?}]}
    severity: "critical" | "warning" | "improvement" | "suggestion"
    evidence: REQUIRED for critical/warning — concrete proof with file:line references. Empty string for improvement/suggestion.
    confidence: "high" (traced 2+ layers, concrete proof) | "medium" (traced 1 layer) | "low" (pattern-based, no trace)
    trace_path: Optional array of "file:line" strings showing the verification trace (e.g., ["service.js:870", "controller.js:28"])
  `
});
```

## Subagent 3: LIBRARIAN — Documentation & Best Practices

```javascript
delegate_task({
  subagent_type: "librarian",
  load_skills: [],
  run_in_background: true,
  prompt: `
    ## REVIEW DIRECTORY
    All file reads and searches MUST use this path (temp clone of PR branch):
      ${REVIEW_DIR}
    Do NOT read from the original workspace repo — it may be on a different branch.
    
    ## PR SUMMARY
    ${prSummary}
    
    ## CHANGED FILES
    ${changedFilesWithDiff}
    
    ## NANO-BRAIN MEMORY (past sessions, reviews, decisions)
    ${projectMemory || "No nano-brain memory available for this workspace"}
    
    ## LINEAR TICKET CONTEXT (from linked Linear ticket)
    ${linearTicketContext || "No Linear ticket linked to this PR"}
    
    ## CROSS-REPO TRACING (from Phase 2 — backend data flow analysis)
    ${crossRepoTracing || "No cross-repo tracing performed"}
    
    ## PREMISE CHECK (for DELETION changes — why the code existed)
    ${premiseCheck || "Not a DELETION change — no premise check needed"}
    
    ${FILTERING_RULES}
    
    ## TASK
    Best practices review and idiomatic improvement opportunities
    
    ## CHECK
    1. Framework anti-patterns (Next.js, React, Express, etc.)
    2. Library misuse — using APIs incorrectly or suboptimally
    3. **Idiomatic improvements** — more idiomatic usage of language/framework features
    4. Missing docs ONLY on public APIs or complex algorithms
    5. **Orphaned resources** — if code was deleted, check for orphaned i18n keys, unused imports, dead CSS classes, abandoned config entries
    
    DO NOT report: missing JSDoc on internal functions, obvious code, or private helpers
    
    ## RETURN FORMAT
    JSON: {findings: [{file, line, severity, category, message, suggestion, code_suggestion?, evidence, confidence, trace_path?}]}
    severity: "critical" | "warning" | "improvement" | "suggestion"
    evidence: REQUIRED for critical/warning — concrete proof with file:line references. Empty string for improvement/suggestion.
    confidence: "high" (traced 2+ layers, concrete proof) | "medium" (traced 1 layer) | "low" (pattern-based, no trace)
    trace_path: Optional array of "file:line" strings showing the verification trace (e.g., ["service.js:870", "controller.js:28"])
  `
});
```

## Subagent 4: GENERAL — Tests & Integration

```javascript
delegate_task({
  subagent_type: "general",
  load_skills: [],
  run_in_background: true,
  prompt: `
    ## REVIEW DIRECTORY
    All file reads and searches MUST use this path (temp clone of PR branch):
      ${REVIEW_DIR}
    Do NOT read from the original workspace repo — it may be on a different branch.
    
    ## PR SUMMARY
    ${prSummary}
    
    ## CHANGED FILES
    ${changedFilesWithDiff}
    
    ## TRACED TEST FILES
    ${tracedTestFiles}
    
    ## NANO-BRAIN MEMORY (past sessions, reviews, decisions)
    ${projectMemory || "No nano-brain memory available for this workspace"}
    
    ## LINEAR TICKET CONTEXT (from linked Linear ticket)
    ${linearTicketContext || "No Linear ticket linked to this PR"}
    
    ## CROSS-REPO TRACING (from Phase 2 — backend data flow analysis)
    ${crossRepoTracing || "No cross-repo tracing performed"}
    
    ## PREMISE CHECK (for DELETION changes — why the code existed)
    ${premiseCheck || "Not a DELETION change — no premise check needed"}
    
    ${FILTERING_RULES}
    
    ## TASK
    Test coverage, integration analysis, and performance improvement opportunities
    
    ## CHECK
    1. Untested critical code paths (logic branches, error handlers)
    2. Edge cases not covered by tests
    3. Broken contracts — do changes break existing integrations?
    4. **Performance improvements** — unnecessary allocations, N+1 queries, missing caching
    5. Historical regressions — have similar changes caused issues before?
    6. **Acceptance criteria coverage** — are all acceptance criteria from the ticket addressed by code + tests?
    7. **Cross-repo contract integrity** — if frontend code was changed/deleted, does it break assumptions the backend relies on? Does the backend expect the frontend to display certain data?
    
    DO NOT report: missing tests for trivial getters/setters, style-only changes, or config files
    
    ## RETURN FORMAT
    JSON: {findings: [{file, line, severity, category, message, suggestion, code_suggestion?, evidence, confidence, trace_path?}]}
    severity: "critical" | "warning" | "improvement" | "suggestion"
    evidence: REQUIRED for critical/warning — concrete proof with file:line references. Empty string for improvement/suggestion.
    confidence: "high" (traced 2+ layers, concrete proof) | "medium" (traced 1 layer) | "low" (pattern-based, no trace)
    trace_path: Optional array of "file:line" strings showing the verification trace (e.g., ["service.js:870", "controller.js:28"])
  `
});
```
