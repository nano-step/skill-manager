---
name: nano-brain
description: Provide persistent memory and code intelligence for AI coding agents; use for hybrid search, cross-session recall, symbol analysis, and impact checks.
compatibility: OpenCode
metadata:
  author: nano-step
  version: 2.1.0
---

# nano-brain

Provide persistent memory for AI coding agents. Run hybrid search (BM25 + semantic + LLM reranking) across past sessions, codebase, notes, and daily logs.

## Slash Commands

| Command | When |
|---------|------|
| `/nano-brain-init` | Run first-time workspace setup |
| `/nano-brain-status` | Check health, embedding progress |
| `/nano-brain-reindex` | Run after branch switch, pull, or major changes |

## When to Use Memory

**Before work:** Recall past decisions, patterns, debugging insights, cross-session context.
**After work:** Save key decisions, architecture choices, non-obvious fixes, domain knowledge.

## Commands

Use the nano-brain CLI for all memory and code intelligence operations.

- **`npx nano-brain search "..."`** — recall a specific error string or function name from past sessions.
  Example: `npx nano-brain search "ECONNREFUSED redis timeout"`
  Compact mode: `npx nano-brain search "..." --compact` — returns 1-line summaries, ~70% fewer tokens
- **`npx nano-brain vsearch "..."`** — explore a fuzzy concept when you do not know the exact wording.
  Example: `npx nano-brain vsearch "caching strategy for user sessions"`
  Compact mode: `npx nano-brain vsearch "..." --compact`
- **`npx nano-brain query "..."`** — get the best hybrid answer for a complex, multi-part question.
  Example: `npx nano-brain query "how did we handle rate limiting in the payment service"`
  Compact mode: `npx nano-brain query "..." --compact`
- **`npx nano-brain write "..." --tags=...`** — log a decision or insight for future recall.
  Example: `npx nano-brain write "## Decision: Use Redis Streams over Bull queues\n- Why: retries need ordered replay" --tags=decision`
- **`npx nano-brain status`** — verify health or embedding progress before searching.
  Example: `npx nano-brain status`
- **`npx nano-brain reindex`** — refresh all indexes after big changes or repo syncs. **ALWAYS use `workdir` parameter** — `--root` flag is silently ignored and reindexes CWD instead.
  ✅ Correct: `bash(command="npx nano-brain reindex", workdir="/path/to/workspace")`
  ❌ Wrong: `npx nano-brain reindex --root=/path/to/workspace`
- **`npx nano-brain focus <filepath>`** — inspect dependencies for a specific file you are editing.
  Example: `npx nano-brain focus /src/api/routes/auth.ts`
- **`npx nano-brain graph-stats`** — check dependency graph size and coverage.
  Example: `npx nano-brain graph-stats`
- **`npx nano-brain symbols --type=... --pattern=...`** — find where cross-repo infrastructure symbols are defined or used.
  Example: `npx nano-brain symbols --type=redis_key --pattern="session:*"`
- **`npx nano-brain impact --type=... --pattern=...`** — see which repos or services are affected by a symbol.
  Example: `npx nano-brain impact --type=mysql_table --pattern=orders`
- **`npx nano-brain tags`** — list all tags to see what is tracked.
  Example: `npx nano-brain tags`

## Token-Saving: Compact Search Flow (CCR)

For large result sets, use **compact mode** to save ~70% tokens. Compact returns 1-line summaries per result; expand the ones you need.

**CLI flow:**
```bash
npx nano-brain query "auth middleware" --compact
```

**When to use compact:**
- Triage/scanning many results before reading details
- Context window is tight and you need to be selective
- Searching broad topics where most results won't be relevant

**When to use verbose (default):**
- You need full content from all results
- Small result sets (< 5 results)
- Precise queries where every result matters

## Collection Filtering

Works with CLI (`-c` flag):

- `codebase` — source files only
- `sessions` — past AI sessions only
- `memory` — curated notes only
- Omit — search everything (recommended)

## Code Intelligence Tools (CLI)

Use symbol-level analysis powered by Tree-sitter AST parsing. Require codebase indexing.

- **`npx nano-brain context <name>`** — trace callers, callees, and flows around a symbol.
  Example: `npx nano-brain context processPayment`
- **`npx nano-brain code-impact <name> --direction=...`** — evaluate upstream or downstream risk before refactors.
  Example: `npx nano-brain code-impact DatabaseClient --direction=upstream`
- **`npx nano-brain detect-changes --scope=...`** — map current git diffs to symbols and flows.
  Example: `npx nano-brain detect-changes --scope=all`

**Details and examples:** `references/code-intelligence.md`

## Memory vs Native Tools

| Use case | Tool |
|----------|------|
| Recall past decisions or context | `npx nano-brain query "..."` |
| Find exact strings or patterns in code | grep / ast-grep |
| Trace callers/callees or impact | `npx nano-brain context <name>` / `npx nano-brain code-impact <name> --direction=...` |

Memory excels at **recall and semantics** — past sessions, conceptual search, cross-project knowledge.
Native tools (grep, ast-grep, glob) excel at **precise code patterns** — exact matches, AST structure.
Code intelligence tools excel at **structural relationships** — call graphs, impact analysis, flow detection.

**They are complementary.** Use all three.
