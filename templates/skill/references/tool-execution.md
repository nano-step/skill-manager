# MCP Tool Execution Reference
# Scope: cache usage, routing, parameter mapping, orchestration.
# Do not include category catalogs, result summarization, or error templates here.

## Cache Access and Reading
Cache location: .opencode/mcp-tools.json
Purpose: fast tool routing without reloading full MCP schemas.

How to read the cache:
1. Check if file exists at project root `.opencode/mcp-tools.json`.
2. Parse JSON into a structured object.
3. Validate minimal fields: version, refreshed_at, tool_count, categories.
4. If missing or malformed, fall back to dynamic discovery.

Cache staleness heuristic:
- If refreshed_at is older than 24 hours, prefer refresh for long sessions.
- For short sessions, use cache but mention staleness when routing is ambiguous.

## Cache Schema (TypeScript Interface)
```ts
interface McpToolCache {
  version: string;
  refreshed_at: string; // ISO string
  mcp_servers: string[];
  tool_count: number;
  categories: {
    [name: string]: {
      description: string;
      keywords: string[];
      tools: Array<{
        id: string;          // tool id or fully qualified name
        description: string; // short summary
        prefix?: string;     // optional server prefix
      }>;
    };
  };
  uncategorized: Array<{
    id: string;
    description: string;
  }>;
}
```

## Routing Algorithm (4 Steps)
Step 1: Parse intent
- Extract verbs, objects, constraints, and explicit tool hints.
- Normalize to lowercase tokens.

Step 2: Match category
- Match extracted tokens against category keywords.
- Prefer explicit prefix matches (e.g., MetaMCP_chrome-devtools__).
- If multiple categories match, choose the one with highest keyword hits.

Step 3: Select tool
- Scan matched category tools for semantic match.
- Prefer exact tool-name hints from user text.
- If multiple tools plausible, choose most specific or ask for clarification.

Step 4: Execute
- Load tool schema (from cache or tool registry).
- Map parameters from intent to schema fields.
- Execute tool and return summarized output.

## Parameter Mapping Patterns
Mapping strategy:
- Match explicit parameter names in user text (uid, pageId, owner, repo).
- Convert common user phrases into schema fields.
- Use defaults only when tool schema allows optional params.

Common patterns:
- page selection
  - "use page 2" -> { pageId: 2 }
  - "open new tab" -> new_page { url: ... }
- element targeting
  - "click uid btn-1" -> click { uid: "btn-1" }
  - "drag a to b" -> drag { from_uid: "a", to_uid: "b" }
- navigation
  - "go to https://x" -> navigate_page { type: "url", url: "https://x" }
  - "reload hard" -> navigate_page { type: "reload", ignoreCache: true }
- network/console
  - "show last xhr" -> list_network_requests { resourceTypes: ["xhr"] }
  - "console errors" -> list_console_messages { types: ["error"] }
- GitHub
  - "PR 123 in owner/repo" -> get_pull_request { owner, repo, pull_number: 123 }
  - "issues labeled bug" -> list_issues { labels: ["bug"], state: "open" }
- GraphQL
  - "list mutations" -> filter_mutations { search?: "" }
  - "type User details" -> get_type_details { type_name: "User" }
- Docs
  - "docs for react useState" -> resolve-library-id then query-docs
- Reasoning
  - "analyze step by step" -> sequentialthinking with incrementing thoughtNumber

## Multi-Tool Orchestration
Use when a task requires sequential dependencies or cross-category steps.

Example 1: Browser + Console
1. take_snapshot -> get uid for button
2. click -> trigger action
3. list_console_messages -> capture errors

Example 2: Docs resolution chain
1. resolve-library-id -> get libraryId
2. query-docs -> retrieve examples

Example 3: GraphQL discovery + detail
1. filter_queries -> list query fields
2. get_field_details -> inspect specific query

Example 4: GitHub PR inspection
1. get_pull_request -> summary
2. get_pull_request_files -> file list
3. get_pull_request_status -> checks

## Cache vs Dynamic Discovery
Prefer cache when:
- Tool cache exists and is fresh.
- Task maps to known categories.
- The agent must be fast and token-efficient.

Prefer dynamic discovery when:
- Cache missing or malformed.
- Tools are new or recently updated.
- Task uses an uncategorized or unknown prefix.

Hybrid approach:
- Use cache for category match.
- Validate against runtime tool registry when exact tool names are needed.

## Execution Guardrails
- Ensure tool parameters match required schema types.
- Avoid passing undefined fields.
- For optional params, include only when explicitly set or needed.
- If user input is ambiguous, request clarification rather than guessing.

## Orchestration Output Format (Internal)
- Selected category
- Selected tool name
- Input parameters
- Dependent steps (if any)
- Execution order

Example internal routing trace:
```
intent: ["screenshot", "login page"]
category: browser
tool: MetaMCP_chrome-devtools__take_screenshot
params: { fullPage: true }
```

## When to Use the Cache
- For repeated routing in a session.
- For large tool inventories where scanning the registry is expensive.
- For well-known categories and stable tool names.

## When to Avoid Cache
- During tool upgrades or when discrepancies are reported.
- When a tool id from cache fails execution.
- When the user references a new MCP server prefix.

## Execution Prerequisites
- Ensure selected tool exists in cache or registry.
- Confirm required parameters are present.
- Confirm required page context for browser tools.
- Validate file paths for uploads or outputs when required.

## Execution Patterns
Simple single-call execution:
1. Select tool
2. Map params
3. Execute
4. Return summarized output

Dependent execution:
1. Execute prerequisite tool
2. Extract identifiers
3. Execute dependent tool
4. Summarize combined result

Conditional execution:
1. Try preferred tool
2. If mismatch, choose fallback tool
3. Execute fallback and report reason

## Parameter Mapping Examples
Browser example:
```
User: "Click the submit button"
Steps: take_snapshot -> find uid -> click { uid }
```

GitHub example:
```
User: "List open PRs for owner/repo"
Tool: list_pull_requests { owner, repo, state: "open" }
```

GraphQL example:
```
User: "Show mutations containing auth"
Tool: filter_mutations { search: "auth" }
```

Docs example:
```
User: "Docs for Next.js app router"
Tool 1: resolve-library-id { libraryName: "next.js", query: "app router" }
Tool 2: query-docs { libraryId, query: "app router" }
```

Reasoning example:
```
User: "Break down this decision"
Tool: sequentialthinking { thought: "...", thoughtNumber: 1, totalThoughts: 4, nextThoughtNeeded: true }
```

## Parameter Validation Checklist
- [ ] Required params present
- [ ] Types match schema (number, string, boolean, arrays)
- [ ] Optional params omitted unless specified
- [ ] Enumerations validated (resourceTypes, state, sort)

## Orchestration Batching Guidance
- Chain tools only when outputs are required for the next step.
- Avoid parallel execution when steps depend on a prior result.
- Provide a short plan when multiple steps are needed.

## Dynamic Discovery Trigger Conditions
- Cache not available
- Tool id in cache but missing in registry
- User mentions an unrecognized prefix
- Tool description seems outdated

## Cache Refresh Recommendation Text
Recommended message:
```
Cache appears stale or missing. Run /mcp-refresh to rebuild tool metadata.
```

## Execution Output Metadata (Internal)
- timestamp
- tool id
- duration (if available)
- success/failure flag
- raw result size

## Execution Guardrails (Supplement)
 - Do not invent parameters not supported by schema.
 - Do not auto-retry on non-idempotent actions.
 - For write actions, confirm target path when ambiguous.

## Batch Execution

Execute multiple tools in a single request for efficiency.

### Batch Syntax
```
BATCH: [
  {"tool": "tool_name", "params": {...}},
  {"tool": "tool_name2", "params": {...}}
]
```

### Batch Execution Flow
1. Parse BATCH JSON array
2. Validate all tool names exist
3. Execute tools sequentially (order preserved)
4. Collect results into array
5. Return combined results

### Batch Result Format
```json
[
  {"tool": "screenshot", "status": "success", "result": {...}},
  {"tool": "get_title", "status": "success", "result": "Page Title"}
]
```

### Batch Limits
- Maximum 10 tools per batch
- Each tool has independent retry budget
- Partial failures don't abort batch

## Tool Chaining

Execute tools in sequence with output passing between them.

### Chain Syntax
```
CHAIN: [
  {"tool": "get_element", "params": {"selector": "#btn"}, "output_as": "element"},
  {"tool": "click", "params": {"target": "$element"}}
]
```

### Variable Binding
- `output_as`: Store tool output in named variable
- `$varname`: Reference stored variable in params
- `$varname.field`: Access nested field in stored output

### Chain Execution Flow
1. Parse CHAIN JSON array
2. Execute first tool
3. Store output in variable (if output_as specified)
4. Substitute $variables in next tool's params
5. Execute next tool
6. Repeat until chain complete or failure

### Chain Failure Handling
```json
{
  "completed": [{"tool": "A", "result": {...}}],
  "failed": {"tool": "B", "error": "element not found"},
  "skipped": ["C", "D"]
}
```

### Chain Limits
- Maximum 5 tools per chain
- Chain aborts on first failure
- Partial results preserved

## Direct Passthrough

Skip routing for known tool names.

### Detection Pattern
Tool name contains `__` (double underscore) → passthrough mode

### Passthrough Examples
```
MetaMCP_chrome-devtools__take_screenshot → execute directly
MetaMCP_github__get_pull_request {"owner": "x", "repo": "y"} → execute with params
```

### Passthrough Benefits
- No cache lookup overhead
- No category matching
- Fastest execution path

 ## Quick Checklist
 - [ ] Cache loaded or fallback chosen.
 - [ ] Intent tokens extracted.
 - [ ] Category matched by keywords or prefix.
 - [ ] Tool selected with minimal ambiguity.
 - [ ] Parameters mapped to schema.
 - [ ] Execute and return result summary.
