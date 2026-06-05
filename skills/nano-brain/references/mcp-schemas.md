# MCP Tool Schemas

Full input/output schemas for all nano-brain MCP tools. Load this file when you need exact parameter names, types, or response shapes.

Connect: streamable HTTP at `/mcp` on the daemon. Container agents use `http://host.docker.internal:3100/mcp`.

Every tool takes a `workspace` string (SHA-256 hash returned by `memory_workspaces_resolve`).

## memory_query — hybrid search (DEFAULT)

```
required: workspace, query
optional: max_results (int, default 10, capped 100)
          include_content (bool, default false)
          cursor (string) — pagination token from previous response
          chunk_type ("raw" | "symbol") — filter by chunk type
          created_after, created_before, updated_after, updated_before (string) — time filters
returns:  {results: [{id, title, snippet, score, tags, collection, source_path, workspace_hash, document_id, created_at, updated_at}], total, query_ms, next_cursor?}
```

Each result includes a `snippet` (≤500 chars). Full `content` is OMITTED by default — pass `include_content: true` or call `memory_get` for one full document.

## memory_search — BM25 keyword

```
required: workspace, query
optional: max_results (capped 100), tags (array — AND filter)
          include_content (bool, default false), cursor (string)
          created_after, created_before, updated_after, updated_before (string)
returns:  same shape as memory_query
```

Tags filter is conjunctive (chunk must have ALL listed tags).

## memory_vsearch — vector semantic

```
required: workspace, query
optional: max_results (capped 100), include_content (bool), cursor (string)
          chunk_type ("raw" | "symbol")
          created_after, created_before, updated_after, updated_before (string)
returns:  same shape as memory_query
```

Slower than BM25 (embedding round-trip). Best for "concept similar to…" queries where exact words don't match.

## memory_write — persist a document

```
required: workspace (must be registered), content (max 5MB)
optional: title, tags (array), collection (default "memory"), source_path,
          metadata (object), supersedes (#<uuid> or source_path of doc to replace)
returns:  {id, hash, collection, workspace_hash, chunk_count, warning?}
```

Tags convention: `decision`, `lesson`, `summary`, `bug`, `gotcha`, plus area tag (`auth`, `search`, etc.).
Same `source_path` upserts (replaces) the existing doc.

## memory_wake_up — session briefing

```
required: workspace
optional: limit (default 10, capped 50)
returns:  {summary, recent_memories: [{id, title, snippet, tags, date}],
           active_collections: [{name, document_count, last_updated}],
           stats: {total_documents, total_chunks, last_activity}}
```

## memory_status — daemon health

```
required: (none)
returns:  {pg_status, migration_version, embedding_queue_depth, active_provider,
           workspace_count, queue_depth, queue_capacity, queue_status, queue_pending,
           harvester_status: {...}}
```

Check `queue_pending` if search returns nothing — chunks may still be embedding.

## memory_get — fetch one document

```
required: workspace, path
optional: start_line (1-indexed inclusive), end_line (1-indexed inclusive)
path:     source_path (e.g. memory://foo) OR #<uuid>
returns:  {id, title, content, source_path, collection, tags, workspace_hash,
           supersedes_id?, created_at, updated_at}
```

Use `start_line`/`end_line` for huge docs to avoid loading megabytes.

## memory_graph — 1-hop symbol neighbors

```
required: workspace, node ("internal/x.go" OR "internal/x.go::F" OR absolute path)
optional: direction ("out" | "in" | "both", default "out")
          edge_type ("calls" | "imports" | "contains" | empty for all)
          paths ("absolute" | "relative") — relative strips workspace prefix
returns:  {node, direction, edges: [{source, target, edge_type}]}
```

Requires prior indexing to populate the graph.

## memory_impact — reverse impact BFS

```
required: workspace, node
optional: edge_type, max_depth (1-3, default 1)
          paths ("absolute" | "relative")
returns:  {node, impacted: [{node, depth, edge_type}]}
```

`impacted` = set of nodes that would break if `node` changes.

## memory_trace — forward call chain

```
required: workspace, node
optional: max_depth (1-10, default 5)
          paths ("absolute" | "relative")
returns:  {entry, chain: [{node, depth, via}]}
```

Walks outgoing edges with cycle detection.

## memory_symbols — symbol search

```
required: workspace
optional: query (substring filter), kind ("function" | "method" | "type" | "interface" | "struct" | "const" | "var")
          limit (default 50, capped 200)
returns:  {symbols: [{name, kind, language, signature, source_path}], count}
```

## memory_tags — tag inventory

```
required: workspace
returns:  array of tag/collection summaries
```

## memory_update — force re-embed

```
required: workspace (must be registered)
returns:  count of chunks re-queued
```

Rare — only after switching embedding model or fixing corrupt embeddings.

## memory_workspaces_resolve — resolve path to hash

```
required: path (absolute filesystem path to project root)
returns:  {workspace_hash, registered (bool)}
```

Read-only. Does not register the workspace — use `POST /api/v1/init` for that.
