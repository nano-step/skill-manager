# Time-Range Filters & Pagination

All three search tools (`memory_query`, `memory_search`, `memory_vsearch`) support time-range filtering and cursor-based pagination.

## Time-Range Filters

Four optional parameters narrow results by document timestamps:

| Parameter | Description | Example |
|---|---|---|
| `created_after` | Docs created after this point | `"2026-05-04T00:00:00Z"`, `"30d"` |
| `created_before` | Docs created before this point | `"2026-06-01T00:00:00Z"`, `"7d"` |
| `updated_after` | Docs updated after this point | `"1w"`, `"720h"` |
| `updated_before` | Docs updated before this point | `"2026-04-01T00:00:00Z"` |

Multiple filters combine with AND semantics.

## Accepted Formats

**Preferred for agents: compute the absolute date and pass RFC3339.** You know today's date from system context — do the math yourself for precision.

- **RFC3339 absolute** (preferred): `"2026-05-04T12:00:00Z"` — timezone required
- **Go-style duration**: `"720h"`, `"30m"`, `"1h30m"` — subtracted from now
- **Humanish relative**: `"30d"`, `"1w"`, `"2mo"`, `"1y"` — units: s, m, h, d, w, mo, y

### Caveats

- `1mo` = 30 days exactly, `1y` = 365 days exactly (not calendar-aware)
- For calendar precision ("since start of April"), use RFC3339
- Negative/zero durations are rejected
- Date-only strings rejected — must include time: `"2026-05-04T00:00:00Z"` not `"2026-05-04"`

## Examples

```
# Bug fixes from the last 30 days (preferred — agent computes cutoff)
memory_search(workspace=<hash>, query="bug fix", updated_after="2026-05-06T00:00:00Z")

# Design docs created since May 1
memory_query(workspace=<hash>, query="design", created_after="2026-05-01T00:00:00Z")

# Semantic search, last week only
memory_vsearch(workspace=<hash>, query="rate limiting", updated_after="2026-05-29T00:00:00Z")
```

## Pagination

Search results are paginated via opaque cursors:

```
memory_search(workspace=<hash>, query="bug fix", max_results=5)
  → {results: [...5...], total: 47, next_cursor: "eyJv..."}

memory_search(workspace=<hash>, query="bug fix", max_results=5, cursor="eyJv...")
  → next 5 results
```

**Rules:**
- Pass the SAME `query` and filter values on every page (server validates)
- `next_cursor` is only present when more results exist
- Changing filters mid-pagination returns `"cursor invalidated, restart pagination"`

## include_content

By default, results return `snippet` only (≤500 chars). Options:
- `include_content: true` — includes full chunk text for ALL results (rare, inflates response 5–50×)
- Better pattern: scan snippets first, then `memory_get(path="#<id>")` for the one you need
