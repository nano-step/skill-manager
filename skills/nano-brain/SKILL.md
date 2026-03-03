# nano-brain

Persistent memory for AI coding agents. Hybrid search (BM25 + semantic + LLM reranking) across past sessions, codebase, notes, and daily logs.

## Slash Commands

| Command | When |
|---------|------|
| `/nano-brain-init` | First-time workspace setup |
| `/nano-brain-status` | Health check, embedding progress |
| `/nano-brain-reindex` | After branch switch, pull, or major changes |

## When to Use Memory

**Before work:** Recall past decisions, patterns, debugging insights, cross-session context.
**After work:** Save key decisions, architecture choices, non-obvious fixes, domain knowledge.

## Access Methods: MCP vs CLI

nano-brain can be accessed via **MCP tools** (when the MCP server is configured) or **CLI** (always available).

**Detection:** Try calling `memory_status` MCP tool first. If it fails with "MCP server not found", fall back to CLI.

### MCP Tools (preferred when available)

| Need | MCP Tool |
|------|----------|
| Exact keyword (error msg, function name) | `memory_search` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_search")` |
| Conceptual ("how does auth work") | `memory_vsearch` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_vsearch")` |
| Best quality, complex question | `memory_query` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_query")` |
| Retrieve specific doc | `memory_get` / `memory_multi_get` |
| Save insight or decision (append to daily log) | `memory_write` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_write")` |
| Set/update a keyed memory (overwrites previous) | `memory_set` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_set")` |
| Delete a keyed memory | `memory_delete` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_delete")` |
| List all keyed memories | `memory_keys` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_keys")` |
| Check health | `memory_status` via `skill_mcp(mcp_name="nano-brain", tool_name="memory_status")` |
| Rescan source files | `memory_index_codebase` |
| Refresh all indexes | `memory_update` |

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

## Memory vs Native Tools

Memory excels at **recall and semantics** — past sessions, conceptual search, cross-project knowledge.
Native tools (grep, ast-grep, glob) excel at **precise code patterns** — exact matches, AST structure.

**They are complementary.** Use both.
