# Troubleshooting

Common issues and their fixes when working with nano-brain MCP tools.

## Connection Issues

| Symptom | Cause | Fix |
|---|---|---|
| MCP tools fail with connection error | Daemon not running on host | Operator action — out of scope for agents. Surface error to user. |
| MCP URL wrong in container | Default assumes localhost | Set `NANO_BRAIN_MCP_URL=http://host.docker.internal:3100/mcp` |
| MCP URL wrong on bare-metal | Container URL used on host | Set `NANO_BRAIN_MCP_URL=http://localhost:3100/mcp` |
| MCP tools missing from tool list | MCP server not connecting | Check project's `opencode.json` → `mcp.nano-brain.url` is a resolved URL, not an `{env:...}` placeholder |

## Workspace Issues

| Symptom | Cause | Fix |
|---|---|---|
| `workspace_not_found` (404) | Hash not in DB | Call `memory_workspaces_resolve` first; if `registered: false`, run `POST /api/v1/init {root_path: ...}` |
| `workspace_required` (400) | Empty workspace field | Always pass `workspace` arg — resolve once per session, cache the hash |
| `workspace="all"` rejected | Write-path safety guard | Always target a specific workspace hash |

## Search Issues

| Symptom | Cause | Fix |
|---|---|---|
| `memory_search` returns 0 results | Embedding queue still processing | Check `memory_status` → `queue_pending`; BM25 lands immediately, vector search needs embedding first |
| Vector search misses obvious matches | Document not yet embedded | Wait for queue to drain, or use `memory_search` (BM25) which works immediately |
| Results seem stale | Watcher hasn't re-indexed | Trigger via `POST /api/v1/reindex` with workspace hash |

## Connection Details

The daemon is expected to be already running on the host. Agents connect via the registered MCP server.

| Environment | MCP URL |
|---|---|
| Container (default) | `http://host.docker.internal:3100/mcp` |
| Bare-metal / host | `http://localhost:3100/mcp` |

Override with `NANO_BRAIN_MCP_URL` environment variable.

For HTTP API access (scripts, tests, dashboards): same host/port, no `/mcp` suffix.
