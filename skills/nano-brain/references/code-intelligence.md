---
name: nano-brain code intelligence
description: Use MCP code_context, code_impact, and code_detect_changes for symbol-level analysis, impact checks, and diff mapping.
---

# Code Intelligence (nano-brain)

## Overview

Run code intelligence when symbol relationships, impact analysis, or diff-to-symbol mapping is needed. Ensure indexing is done with `memory_index_codebase` before using these tools.

## code_context — 360-degree symbol view

Return callers, callees, cluster membership, execution flows, and infrastructure connections for any function/class/method.

```
skill_mcp(mcp_name="nano-brain", tool_name="code_context", arguments={"name": "handleRequest"})
skill_mcp(mcp_name="nano-brain", tool_name="code_context", arguments={"name": "helper", "file_path": "/src/utils.ts"})
```

Use `file_path` to disambiguate when multiple symbols share the same name.

## code_impact — dependency analysis

Traverse the symbol graph to find affected symbols and flows. Return a risk level (LOW/MEDIUM/HIGH/CRITICAL).

```
skill_mcp(mcp_name="nano-brain", tool_name="code_impact", arguments={"target": "DatabaseClient", "direction": "upstream"})
skill_mcp(mcp_name="nano-brain", tool_name="code_impact", arguments={"target": "processOrder", "direction": "downstream", "max_depth": 3})
```

- `upstream` = "who calls this?" (callers, consumers)
- `downstream` = "what does this call?" (callees, dependencies)

## code_detect_changes — git diff to symbol mapping

Map current git changes to affected symbols and execution flows.

```
skill_mcp(mcp_name="nano-brain", tool_name="code_detect_changes", arguments={"scope": "staged"})
skill_mcp(mcp_name="nano-brain", tool_name="code_detect_changes", arguments={"scope": "all"})
```

Scopes: `unstaged`, `staged`, `all` (default).

## When to Use Code Intelligence vs Memory vs Native Tools

| Question | Tool |
|----------|------|
| "What calls function X?" | `code_context` |
| "What breaks if I change X?" | `code_impact` |
| "What did I change and what's affected?" | `code_detect_changes` |
| "Have we done this before?" | `memory_query` |
| "Find exact string in code" | grep / ast-grep |
| "How does auth work conceptually?" | `memory_vsearch` |

Code intelligence requires indexing. Run `memory_index_codebase` first if the workspace has not been indexed.
