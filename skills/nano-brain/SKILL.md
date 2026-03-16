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

## Access Methods: MCP vs CLI

Access nano-brain via **MCP tools** (when the MCP server is configured) or **CLI** (always available).

**Detection:** Try calling `memory_status` MCP tool first. If it fails with "MCP server not found", fall back to CLI.

### MCP Tools (preferred when available)

- **`memory_search`** — recall a specific error string or function name from past sessions.
  Example: `skill_mcp(mcp_name="nano-brain", tool_name="memory_search", arguments={ query: "ECONNREFUSED redis timeout" })`
- **`memory_vsearch`** — explore a fuzzy concept when you do not know the exact wording.
  Example: `memory_vsearch("caching strategy for user sessions")`
- **`memory_query`** — get the best hybrid answer for a complex, multi-part question.
  Example: `memory_query("how did we handle rate limiting in the payment service")`
- **`memory_get`** — pull one known doc by ID or path.
  Example: `memory_get(id="#a1b2c3")`
- **`memory_multi_get`** — fetch a set of known docs by pattern.
  Example: `memory_multi_get(pattern="decisions/2025-*/auth-*.md")`
- **`memory_write`** — log a decision or insight for future recall.
  Example: `memory_write("## Decision: Use Redis Streams over Bull queues\n- Why: retries need ordered replay")`
- **`memory_set`** — store a keyed note you plan to update over time.
  Example: `memory_set(key="payments-rate-limit", content="429s come from gateway, not nginx")`
- **`memory_delete`** — remove a stale keyed note that is no longer accurate.
  Example: `memory_delete(key="legacy-redis-metrics")`
- **`memory_keys`** — list all keyed notes to see what is tracked.
  Example: `memory_keys()`
- **`memory_status`** — verify MCP health or embedding progress before searching.
  Example: `memory_status()`
- **`memory_index_codebase`** — index source files before using code intelligence tools.
  Example: `memory_index_codebase(root="/Users/tamlh/workspaces/self/AI/Tools")`
- **`memory_update`** — refresh all indexes after big changes or repo syncs.
  Example: `memory_update()`
- **`memory_focus`** — inspect dependencies for a specific file you are editing.
  Example: `memory_focus(filePath="/src/api/routes/auth.ts")`
- **`memory_graph_stats`** — check dependency graph size and coverage.
  Example: `memory_graph_stats()`
- **`memory_symbols`** — find where cross-repo infrastructure symbols are defined or used.
  Example: `memory_symbols(type="redis_key", pattern="session:*")`
- **`memory_impact`** — see which repos or services are affected by a symbol.
  Example: `memory_impact(type="mysql_table", pattern="orders")`

### CLI Fallback (always available)

When MCP server is not available, use the CLI via Bash tool:

| Need | CLI Command |
|------|-------------|
| Best quality search (hybrid: BM25 + vector + reranking) | `npx nano-brain query "search terms"` |
| Search with collection filter | `npx nano-brain query "terms" -c codebase` |
| Search with more/fewer results | `npx nano-brain query "terms" -n 20` |
| Show full content of results | `npx nano-brain query "terms" --full` |
| Check health & stats | `npx nano-brain status` |
| Initialize workspace | `npx nano-brain init --root=/path/to/workspace` |
| Generate embeddings | `npx nano-brain embed` |
| Harvest sessions | `npx nano-brain harvest` |
| List collections | `npx nano-brain collection list` |

**CLI limitations vs MCP:**
- CLI only has `query` (unified hybrid search) — no separate `search` (BM25-only) or `vsearch` (vector-only)
- CLI cannot `write` notes — use MCP or manually create files in `~/.nano-brain/memory/`
- CLI cannot `get` specific docs by ID — use `query` with specific terms instead

**Default:** Use `npx nano-brain query "..."` — it combines BM25 + vector + reranking for best results.

## Collection Filtering

Works with both MCP and CLI (`-c` flag):

- `codebase` — source files only
- `sessions` — past AI sessions only
- `memory` — curated notes only
- Omit — search everything (recommended)

## Code Intelligence Tools (MCP)

Use symbol-level analysis powered by Tree-sitter AST parsing. Require codebase indexing.

- **`code_context`** — trace callers, callees, and flows around a symbol.
  Example: `code_context(name="processPayment")`
- **`code_impact`** — evaluate upstream or downstream risk before refactors.
  Example: `code_impact(target="DatabaseClient", direction="upstream")`
- **`code_detect_changes`** — map current git diffs to symbols and flows.
  Example: `code_detect_changes(scope="all")`

**Details and examples:** `references/code-intelligence.md`

## Memory vs Native Tools

Memory excels at **recall and semantics** — past sessions, conceptual search, cross-project knowledge.
Native tools (grep, ast-grep, glob) excel at **precise code patterns** — exact matches, AST structure.
Code intelligence tools excel at **structural relationships** — call graphs, impact analysis, flow detection.

**They are complementary.** Use all three.
