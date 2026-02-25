---
name: graphql-inspector
description: >-
  GraphQL schema inspection and query execution skill. Guides AI agents through
  progressive schema discovery — scan first, drill down second, execute last.
  Enforces read-only by default with token-efficient workflows.
compatibility: "OpenCode with graphql-tools MCP server"
metadata:
  author: kokorolx
  version: "1.0.0"
---

# GraphQL Inspector Skill

**Version**: 1.0.0 | **MCP Server**: `graphql-tools` | **Default Mode**: Read-Only

## Overview

This skill teaches AI agents the optimal workflow for exploring and querying GraphQL APIs via the `graphql-tools` MCP server. The core principle is **progressive disclosure** — start cheap, drill down only when needed.

## When to Use This Skill

| Trigger | Action |
|---------|--------|
| "What queries/mutations are available?" | `filter_queries` / `filter_mutations` with `detailed=false` |
| "How do I call X query?" | `get_field_details` for args + return type |
| "What fields does Type Y have?" | `get_type_details` |
| "Run this query" | `execute_query` (read-only) |
| "What does the schema look like?" | `filter_queries` + `filter_mutations` + `filter_types` (NOT `get_graphql_schema`) |

## Golden Rule: Progressive Disclosure

**NEVER start with `get_graphql_schema`.** It dumps the entire schema and wastes tokens.

Follow this flow instead:

```
Step 1: SCAN (cheap, small payload)
  filter_queries(detailed=false)    → list query names + descriptions
  filter_mutations(detailed=false)  → list mutation names + descriptions

Step 2: DRILL DOWN (only for fields you need)
  get_field_details(field_name="targetField", operation_type="query")
  → get arguments, return type, deprecation info

Step 3: UNDERSTAND TYPES (only if return/input types are complex)
  get_type_details(type_name="ComplexType")
  → get fields, enums, interfaces
  filter_types(kind="INPUT_OBJECT", search="CreateInput")
  → find input types for mutations

Step 4: EXECUTE (only after understanding the schema)
  execute_query(query="query { ... }")
  → run read-only query with known structure
```

## Available Tools

### Inspection Tools (always available, all read-only)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `filter_queries` | List available queries | **First step** — scan what's available |
| `filter_mutations` | List available mutations | **First step** — scan what's available |
| `filter_types` | List types by kind/search | Find INPUT_OBJECT types for mutation args |
| `get_field_details` | Deep dive into one field | **Second step** — get args + return type |
| `get_type_details` | Deep dive into one type | Understand complex return/input types |
| `get_graphql_schema` | Full schema dump (SDL) | **Last resort only** — very large payload |

### Execution Tools

| Tool | Purpose | Availability |
|------|---------|-------------|
| `execute_query` | Run read-only GraphQL query | Always available |
| `execute_mutation` | Run GraphQL mutation | Only when `ALLOW_MUTATIONS=true` |

## Workflow Examples

### Example 1: "What can I query?"

```
1. filter_queries(detailed=false)
   → Returns: [{ name: "getUser", description: "Fetch user by ID" }, ...]

2. Found interesting query "getUser", need args:
   get_field_details(field_name="getUser", operation_type="query")
   → Returns: args=[{name: "id", type: "ID!"}], return_type="User"

3. Need to know User fields:
   get_type_details(type_name="User")
   → Returns: fields=[{name: "id"}, {name: "email"}, {name: "name"}, ...]

4. Now execute with confidence:
   execute_query(query="query { getUser(id: \"123\") { id name email } }")
```

### Example 2: "Find queries related to orders"

```
1. filter_queries(search="order", detailed=false)
   → Returns matching queries with names + descriptions

2. If need more detail on a specific one:
   get_field_details(field_name="getOrderById", operation_type="query")
```

### Example 3: "What input does createUser mutation need?"

```
1. get_field_details(field_name="createUser", operation_type="mutation")
   → Returns: args=[{name: "input", type: "CreateUserInput!"}]

2. filter_types(kind="INPUT_OBJECT", search="CreateUserInput")
   → Returns input type with all fields and their types
```

### Example 4: "Show me all enum types"

```
1. filter_types(kind="ENUM", detailed=true)
   → Returns all enums with their values
```

## Common Parameters

All tools accept these optional auth parameters:

| Parameter | Description |
|-----------|-------------|
| `endpoint` | GraphQL endpoint URL (default from server config) |
| `username` | Basic auth username |
| `password` | Basic auth password |
| `bearer_token` | Bearer token for auth |

## Anti-Patterns (DO NOT)

| Bad Practice | Why | Do Instead |
|-------------|-----|------------|
| Start with `get_graphql_schema` | Dumps entire schema, wastes tokens | `filter_queries(detailed=false)` |
| Use `detailed=true` on first call | Returns args/types for ALL fields | `detailed=false` first, then `get_field_details` for specific fields |
| Execute query without understanding schema | Likely wrong field names or args | Scan → drill down → execute |
| Call `execute_mutation` without checking availability | Will error if mutations disabled | Check if tool is listed first |
| Guess field names in queries | Will get GraphQL errors | Always inspect schema first |

## Safety Model

The server enforces 3 layers of protection:

1. **Tool Listing**: `execute_mutation` is hidden when `ALLOW_MUTATIONS` is not set
2. **Execution Guard**: `execute_mutation` rejects at runtime even if called directly
3. **AST Validation**: GraphQL documents are parsed — operation type verified at AST level

**Default is read-only.** Mutations require explicit `ALLOW_MUTATIONS=true` env var on the server.

## Token Efficiency Tips

- `filter_queries(detailed=false)` returns ~50 bytes per field vs ~500 bytes with `detailed=true`
- Use `search` parameter to narrow results before drilling down
- `get_field_details` for ONE field is cheaper than `filter_queries(detailed=true)` for ALL fields
- Cache awareness: repeated calls to same endpoint use 5-minute server cache

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unknown tool: execute_mutation" | Mutations disabled (default). Set `ALLOW_MUTATIONS=true` on server |
| "Mutations are not allowed in read-only mode" | Query sent to `execute_query` contains a mutation. Use `execute_mutation` instead |
| "Subscriptions are not supported" | Subscriptions are intentionally blocked |
| Empty results from filter | Check endpoint is correct and accessible |
| Auth errors | Verify credentials — try `get_graphql_schema` with auth params first |
