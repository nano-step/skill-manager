# Agent Skill Tool Categories Reference (Semantic)
# Scope: semantic category mapping and example tool lists
# Do not include routing algorithm, execution, results, or errors here.

## Categorization System (Semantic Only)

This skill uses **semantic categorization**:

1. **Tool discovery** - `/skill-refresh` enumerates all tools available to the agent
2. **Semantic analysis** - the AI reads each tool's **name + description**
3. **Dynamic grouping** - tools are grouped into categories based on what they do

Categories are **AI-generated at refresh time** and are not predefined. The same
tool set may yield different category labels if the tool descriptions change.

## How Semantic Categorization Works

Semantic categorization is a meaning-based process rather than a pattern match.
The AI looks at each tool's:

- Action verbs (e.g., "click", "list", "introspect", "fetch")
- Domain nouns (e.g., "page", "repository", "schema", "documentation")
- Operation scope (e.g., UI interaction vs. metadata discovery)
- Input/output shape described in the tool description

The result is a set of categories that represent **intent clusters**, such as
"Browser Automation", "GitHub Operations", or "GraphQL Introspection". These
categories are **labels**, not fixed contracts, and can evolve with the tool set.

## Categories Are Generated, Not Predefined

- Categories are **not hard-coded**
- Category names are **derived from the tools** at refresh time
- Custom tool servers are handled automatically
- The system works with any tool configuration (MetaMCP, standalone, or custom)

## Cache File (v2.0.0) - How to Read It

The `/skill-refresh` command writes a cache file using the v2.0.0 schema. This
file is the **source of truth** for the current categorization state.

### Schema Overview

```json
{
  "categories": {
    "browser-automation": {
      "name": "Browser Automation",
      "description": "Web page interaction, screenshots, DOM manipulation",
      "keywords": ["screenshot", "click", "navigate", "page"],
      "tools": ["tool_id_1", "tool_id_2"]
    }
  },
  "tools": {
    "tool_id_1": {
      "category": "browser-automation",
      "description": "Tool description"
    }
  }
}
```

### Reading Tips

- **categories**: a map of generated category IDs to human-friendly metadata
- **categories.<id>.tools**: the list of tool IDs grouped into that category
- **tools**: a map of tool IDs to their assigned category and descriptions
- **tools.<id>.category**: the category ID that tool currently belongs to

Use the cache to understand the **current routing shape**. Do not assume the
same category IDs will exist across different environments or refresh runs.

## Example Categories That Might Be Generated

These are illustrative only. Actual categories depend on the installed tools.

- Browser Automation
- GitHub Operations
- GraphQL Introspection
- Documentation Lookup

## Browser Automation Category (Example)

Category name: Browser Automation
Keywords: screenshot, click, navigate, page, browser, dom, element, fill, hover,
drag, upload, dialog, network, console, performance, emulation
Description: Interact with live pages, DOM elements, and browser instrumentation.

Example tools that might appear in this category:
- take_screenshot
  - Capture a page or element screenshot (png/jpeg/webp).
- take_snapshot
  - Capture a text snapshot of the a11y tree with uids.
- click
  - Click a page element by uid (optional double click).
- fill
  - Fill a single input, textarea, or select element.
- fill_form
  - Fill multiple form fields in one call.
- press_key
  - Press a key or key combination (e.g., Enter, Control+Shift+R).
- hover
  - Hover over a page element by uid.
- drag
  - Drag one element and drop onto another element.
- upload_file
  - Upload a local file using a file input element.
- handle_dialog
  - Accept or dismiss a browser dialog, with optional prompt text.
- wait_for
  - Wait for specific text to appear on the page.
- navigate_page
  - Navigate to URL, back, forward, or reload.
- new_page
  - Open a new page and optionally navigate to URL.
- close_page
  - Close an existing page by ID.
- list_pages
  - List all open pages with IDs.
- select_page
  - Select an active page for future tool calls.
- resize_page
  - Resize the viewport to a specific width and height.
- emulate
  - Emulate network, CPU, and geolocation conditions.
- evaluate_script
  - Run a JavaScript function in the page context.
- list_network_requests
  - List recent network requests for the page.
- get_network_request
  - Get a single network request by request id.
- list_console_messages
  - List recent console messages on the page.
- get_console_message
  - Get a single console message by message id.
- performance_start_trace
  - Start a performance trace recording.
- performance_stop_trace
  - Stop an active performance trace recording.
- performance_analyze_insight
  - Analyze a specific performance insight set.

Notes:
- Browser category often contains the largest tool set.
- Tools require a page context; select or create a page first.
- Prefer take_snapshot for element discovery before click/hover/drag.

## Memory & Knowledge Category (Example)

Category name: Memory & Knowledge
Keywords: memory, search, recall, context, session, codebase, knowledge, symbol, impact, dependency, graph, focus
Description: Persistent memory, hybrid search, code intelligence, and cross-repo symbol analysis via nano-brain.

Example tools that might appear in this category:
- memory_search
  - BM25 full-text keyword search across indexed documents.
- memory_vsearch
  - Semantic vector search using embeddings.
- memory_query
  - Full hybrid search with query expansion, RRF fusion, and LLM reranking.
- memory_get
  - Retrieve a document by path or docid.
- memory_multi_get
  - Batch retrieve documents by glob pattern or comma-separated list.
- memory_write
  - Write content to daily log with workspace context.
- memory_set
  - Set/update a keyed memory (overwrites previous value).
- memory_delete
  - Delete a keyed memory.
- memory_keys
  - List all keyed memories.
- memory_status
  - Show index health, collection info, and model status.
- memory_index_codebase
  - Index codebase files in the current workspace.
- memory_update
  - Trigger immediate reindex of all collections.
- memory_focus
  - Get dependency graph context for a specific file.
- memory_graph_stats
  - Get statistics about the file dependency graph.
- memory_symbols
  - Query cross-repo symbols (Redis keys, PubSub channels, MySQL tables, API endpoints, HTTP calls, Bull queues).
- memory_impact
  - Analyze cross-repo impact of a symbol (writers vs readers, publishers vs subscribers).
- code_context
  - 360-degree view of a code symbol — callers, callees, cluster, flows, infrastructure connections.
- code_impact
  - Analyze impact of changing a symbol — upstream/downstream dependencies, affected flows, risk level.
- code_detect_changes
  - Detect changed symbols and affected flows from git diff.

Notes:
- Memory tools require nano-brain MCP server to be configured.
- Code intelligence tools require prior indexing via memory_index_codebase.
- Use memory_query for best quality results (combines BM25 + vector + reranking).
- Use memory_search for exact keyword matches, memory_vsearch for conceptual search.

## GitHub Operations Category (Example)

Category name: GitHub Operations
Keywords: pr, pull request, issue, repo, repository, commit, branch, review,
code search
Description: Query and manage GitHub metadata, issues, PRs, and repository content.

Example tools that might appear in this category:
- search_repositories
  - Search repositories by query string.
- search_users
  - Search GitHub users.
- search_code
  - Search code across repositories.
- get_file_contents
  - Fetch file or directory contents from a repo.
- list_issues
  - List issues with filters (state, labels, sort).
- get_issue
  - Get details for a specific issue.
- search_issues
  - Search issues and PRs across repositories.
- list_commits
  - List commits for a branch or SHA.
- create_branch
  - Create a new branch from a base branch.
- get_pull_request
  - Get details for a specific pull request.
- list_pull_requests
  - List pull requests with filters (state, base, head).
- get_pull_request_files
  - Get the files changed in a pull request.
- get_pull_request_status
  - Get the combined status checks for a PR.
- get_pull_request_reviews
  - Get reviews and review states for a PR.


## GraphQL Introspection Category (Example)

Category name: GraphQL Introspection
Keywords: graphql, schema, query, mutation, type, field, introspection
Description: Introspect GraphQL schemas and discover query/mutation shapes.

Example tools that might appear in this category:
- get_graphql_schema
  - Fetch full schema introspection.
- filter_queries
  - Filter and list available queries.
- filter_mutations
  - Filter and list available mutations.
- filter_types
  - Filter and list types by kind.
- get_type_details
  - Get fields and metadata for a type.
- get_field_details
  - Get details for a specific query or mutation field.


## Documentation Lookup Category (Example)

Category name: Documentation Lookup
Keywords: docs, documentation, reference, api, usage, example, how to
Description: Resolve library identifiers and query documentation.

Example tools that might appear in this category:
- resolve_library_id
  - Resolve a library or package name to a library ID.
- query_docs
  - Query documentation for a given library ID.


## Category Boundary Examples
Use these to avoid misclassification:
- "take a screenshot" -> Browser Automation
- "recall past decisions" -> Memory & Knowledge
- "list pull requests" -> GitHub Operations
- "list graphql queries" -> GraphQL Introspection
- "find docs for lodash" -> Documentation Lookup
- "what calls this function" -> Memory & Knowledge
- "search past sessions" -> Memory & Knowledge

## Common Intent Phrases by Category
Browser intents:
- "click", "hover", "fill form", "upload file", "take snapshot"
Memory intents:
- "recall", "remember", "past session", "what did we do", "search memory", "save decision", "code context", "impact analysis", "what calls", "dependency graph"
GitHub intents:
- "get PR", "list issues", "search repo", "read file"
GraphQL intents:
- "introspect schema", "list types", "get field details"
Docs intents:
- "find docs", "usage example", "API reference"

## Tool Naming Conventions (Observed Patterns)
- Tool names tend to be verb-first (get_, list_, search_, filter_, take_).
- UI interaction tools often use imperative verbs (click, hover, drag).
- Metadata tools tend to be resource-based (get_issue, list_commits).


## Category Ownership Notes (Semantic Only)
- Browser Automation: runtime web UI interaction and diagnostics.
- Memory & Knowledge: persistent cross-session memory, hybrid search, code intelligence, and cross-repo symbol analysis.
- GitHub Operations: repository metadata and collaboration artifacts.
- GraphQL Introspection: schema discovery and field metadata only.
- Documentation Lookup: documentation discovery and lookup.
