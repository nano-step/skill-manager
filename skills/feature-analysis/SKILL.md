---
name: feature-analysis
description: "Deep code analysis of any feature or service before writing docs, diagrams, or making changes. Enforces read-everything-first discipline. Traces exact execution paths, data transformations, guard clauses, bugs, and gaps between existing docs and actual code. Produces a validated Mermaid diagram and structured analysis output. Language and framework agnostic."
compatibility: "OpenCode"
metadata:
  version: "2.0.0"
tools:
  required:
    - Read (every file in the feature)
    - Bash (find all files, run mermaid validator)
  uses:
    - mermaid-validator skill (validate any diagram produced)
triggers:
  - "analyze [feature]"
  - "how does X work"
  - "trace the flow of"
  - "understand X"
  - "what does X do"
  - "deep dive into"
  - "working on X - understand it first"
  - "update docs/brain for"
---

# Feature Analysis Skill

A disciplined protocol for deeply analyzing any feature in any codebase before producing docs, diagrams, or making changes. Framework-agnostic. Language-agnostic.

---

## The Core Rule

**READ EVERYTHING. PRODUCE NOTHING. THEN SYNTHESIZE.**

Do not write a single diagram node, doc line, or description until every file in the feature has been read. Every time you produce output before reading all files, you will miss something.

---

## Phase 1: Discovery — Find Every File

Before reading anything, map the full file set.

```bash
# Find all source files for the feature
find <feature-dir> -type f | sort

# Check imports to catch shared utilities, decorators, helpers
grep -r "import\|require" <feature-dir> | grep -v node_modules | sort -u
```

**Read in dependency order (bottom-up — foundations first):**

1. **Entry point / bootstrap** — port, env vars, startup config
2. **Schema / model files** — DB schema, columns, nullable, indexes, types
3. **Utility / helper files** — every function, every transformation, every constant
4. **Decorator / middleware files** — wrapping logic, side effects, return value handling
5. **Infrastructure services** — cache, lock, queue, external connections
6. **Core business logic** — the main service/handler files
7. **External / fetch services** — HTTP calls, filters applied, error handling
8. **Entry controllers / routers / handlers** — HTTP method, route, params, return
9. **Wiring files** — module/DI config, middleware registration

**Do not skip any file. Do not skim.**

---

## Phase 2: Per-File Checklist

For each file, answer these questions before moving to the next.

### Entry point / bootstrap
- [ ] What port or address? (default? env override?)
- [ ] Any global middleware, pipes, interceptors, or lifecycle hooks?

### Schema / model files
- [ ] Table/collection name
- [ ] Every field: type, nullable, default, constraints, indexes
- [ ] Relations / references to other entities

### Utility / helper files
- [ ] Every exported function — what does it do, step by step?
- [ ] For transformations: what inputs? what outputs? what edge cases handled?
- [ ] Where is this function called? (grep for usages)
- [ ] How many times is it called within a single method? (once per batch? once per item?)

### Decorator / middleware files
- [ ] What does it wrap?
- [ ] What side effects before / after the original method?
- [ ] **Does it `return` the result of the original method?** (missing `return` = silent discard bug)
- [ ] Does it use try/finally? What runs in finally?
- [ ] What happens on the early-exit path?

### Core business logic files
- [ ] Every method: signature, return type
- [ ] For each method: trace every line — no summarizing
- [ ] Accumulator variables — where initialized, where incremented, where returned
- [ ] Loop structure: sequential or parallel?
- [ ] Every external call: what service/module, what args, what returned
- [ ] Guard clauses: every early return / continue / throw
- [ ] Every branch in conditionals

### External / fetch service files
- [ ] Exact URLs or endpoints (hardcoded or env?)
- [ ] Filters applied to response data (which calls filter, which don't?)
- [ ] Error handling on external calls

### Entry controllers / routers / handlers
- [ ] HTTP method (GET vs POST — don't assume)
- [ ] Route path
- [ ] What core method is called?
- [ ] What is returned?

### Wiring / module files
- [ ] What is imported / registered?
- [ ] What is exported / exposed?

---

## Phase 3: Execution Trace

After reading all files, produce a numbered step-by-step trace of the full execution path. This is not prose — it is a precise trace.

**Format:**
```
1. [HTTP METHOD] /route → HandlerName.methodName()
2. HandlerName.methodName() → ServiceName.methodName()
3. @DecoratorName: step A (e.g. acquire lock, check cache)
4.   → if condition X: early return [what is returned / not returned]
5. ServiceName.methodName():
6.   step 1: call externalService.fetchAll() → parallel([fetchA(), fetchB()])
7.     fetchA(): GET https://... → returns all items (no filter)
8.     fetchB(): GET https://... → filter(x => x.field !== null) → returns filtered
9.   step 2: parallel([processItems(a, 'typeA'), processItems(b, 'typeB')])
10. processItems(items, type):
11.   init: totalUpdated = 0, totalInserted = 0
12.   for loop (sequential): i = 0 to items.length, step batchSize
13.     batch = items.slice(i, i + batchSize)
14.     { updated, inserted } = await processBatch(batch)
15.     totalUpdated += updated; totalInserted += inserted
16.   return { total: items.length, updated: totalUpdated, inserted: totalInserted }
17. processBatch(batch):
18.   guard: if batch.length === 0 → return { updated: 0, inserted: 0 }
19.   step 1: names = batch.map(item => transform(item.field))   ← called ONCE per batch
20.   step 2: existing = repo.find(WHERE field IN names)
21.   step 3: map = existing.reduce(...)
22.   step 4: for each item in batch:
23.     value = transform(item.field)   ← called AGAIN per item
24.     ...decision tree...
25.   repo.save(itemsToSave)
26.   return { updated, inserted }
27. @DecoratorName finally: releaseLock()
28. BUG: decorator does not return result → caller receives undefined
```

**Key things to call out in the trace:**
- When a utility function is called more than once (note the count and context)
- Every accumulator variable (where init, where increment, where return)
- Every guard clause / early exit
- Sequential vs parallel (for loop vs Promise.all / asyncio.gather / goroutines)
- Any discarded return values

---

## Phase 4: Data Transformations Audit

For every utility/transformation function used:

| Function | What it does (step by step) | Called where | Called how many times |
|----------|----------------------------|--------------|----------------------|
| `transformFn(x)` | 1. step A 2. step B 3. step C | methodName | TWICE: once in step N (batch), once per item in loop |

---

## Phase 5: Gap Analysis — Docs vs Code

Compare existing docs/brain files against what the code actually does:

| Claim in docs | What code actually does | Verdict |
|---------------|------------------------|---------|
| "POST /endpoint" | `@Get()` in controller | ❌ Wrong |
| "Port 3000" | `process.env.PORT \|\| 4001` in entrypoint | ❌ Wrong |
| "function converts X" | Also does Y (undocumented) | ⚠️ Incomplete |
| "returns JSON result" | Decorator discards return value | ❌ Bug |

---

## Phase 6: Produce Outputs

Only now, after phases 1–5 are complete, produce:

### 6a. Structured Analysis Document

```markdown
## Feature Analysis: [Feature Name]
Repo: [repo] | Date: [date]

### Files Read
- `path/to/controller.ts` — entry point, GET /endpoint, calls ServiceA.run()
- `path/to/service.ts` — core logic, orchestrates fetch + batch loop
- [... every file ...]

### Execution Trace
[numbered trace from Phase 3]

### Data Transformations
[table from Phase 4]

### Guard Clauses & Edge Cases
- processBatch: empty batch guard → returns {0,0} immediately
- fetchItems: filters items where field === null
- LockManager: if lock not acquired → returns void immediately (no error thrown)

### Bugs / Issues Found
- path/to/decorator.ts line N: `await originalMethod.apply(this, args)` missing `return`
  → result is discarded, caller always receives undefined
- [any others]

### Gaps: Docs vs Code
[table from Phase 5]

### Files to Update
- [ ] `.agents/_repos/[repo].md` — update port, endpoint method, transformation description
- [ ] `.agents/_domains/[domain].md` — if architecture changed
```

### 6b. Mermaid Diagram

Write the diagram. Then **immediately run the validator before doing anything else.**

If you have the mermaid-validator skill:
```bash
node /path/to/project/scripts/validate-mermaid.mjs [file.md]
```

Otherwise validate manually — common syntax errors:
- Labels with `()` must be wrapped in `"double quotes"`: `A["method()"]`
- No `\n` in node labels — use `<br/>` or shorten
- No HTML entities (`&amp;`, `&gt;`) in labels — use literal characters
- `end` is a reserved word in Mermaid — use `END` or `done` as node IDs

If errors → fix → re-run. Do not proceed until clean.

**Diagram must include:**
- Every step from the execution trace
- Data transformation nodes (show what the function does, not just its name)
- Guard clauses as decision nodes
- Parallel vs sequential clearly distinguished
- Bugs annotated inline (e.g. "BUG: result discarded")

### 6c. Doc / Brain File Updates

Update relevant docs with:
- Corrected facts (port, endpoint method, etc.)
- The validated Mermaid diagram
- Data transformation table
- Known bugs section

---

## Anti-Patterns (What This Skill Prevents)

| Anti-pattern | What gets missed | Rule violated |
|---|---|---|
| Drew diagram before reading utility files | Transformation called twice — not shown | READ EVERYTHING FIRST |
| Trusted existing docs for endpoint method | GET vs POST wrong in docs | GAP ANALYSIS required |
| Summarized service method instead of tracing | Guard clause (empty batch) missed | TRACE NOT SUMMARIZE |
| Trusted existing docs for port/config | Wrong values | Verify entry point |
| Read decorator without checking return | Silent result discard bug | RETURN VALUE AUDIT |
| Merged H1/H2 paths into shared loop node | Sequential vs parallel distinction lost | TRACE LOOP STRUCTURE |
| Assumed filter applies to all fetches | One fetch had no filter — skipped items | READ EVERY FETCH FILE |

---

## Quick Reference Checklist

Before producing any output, verify:

- [ ] Entry point read — port/address confirmed
- [ ] All schema/model files read — every field noted
- [ ] All utility files read — every transformation step documented
- [ ] All decorator/middleware files read — return value audited
- [ ] All core service files read — every method traced line by line
- [ ] All fetch/external services read — filters noted (which have filters, which don't)
- [ ] All controller/router/handler files read — HTTP method confirmed (not assumed)
- [ ] All wiring/module files read — dependency graph understood
- [ ] Utility functions: call count per method noted
- [ ] All guard clauses documented
- [ ] Accumulator variables traced (init → increment → return)
- [ ] Loop structure confirmed (sequential vs parallel)
- [ ] Existing docs compared against code (gap analysis done)
- [ ] Mermaid diagram validated before saving
