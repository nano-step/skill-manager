## Context

The MCP Manager is a subagent that isolates MCP tool definitions from the main agent's context window. Currently it supports single-tool execution with semantic routing based on cached tool categories. The implementation lives entirely in template files (`agent.json`, `SKILL.md`, `command.md`) that get installed into OpenCode projects.

**Current limitations:**
- Single tool per invocation (multiple tools = multiple round trips)
- No automatic retry on failure
- Semantic routing even when exact tool name is known
- No support for tool output → tool input chaining

## Goals / Non-Goals

**Goals:**
- Reduce latency by batching multiple tool calls in one subagent invocation
- Improve reliability with automatic retry (up to 3 attempts)
- Skip unnecessary routing when exact tool name is provided
- Enable tool chaining for multi-step workflows
- Maintain backward compatibility with existing single-tool workflows

**Non-Goals:**
- Changing the underlying model (Haiku stays)
- Adding new MCP servers or tools
- Modifying the CLI installer code (only template content changes)
- Implementing result caching (future enhancement)
- Adding tool popularity tracking (future enhancement)

## Decisions

### Decision 1: Prompt-based Implementation

**Choice**: Implement all enhancements via prompt instructions in `agent.json`, not code.

**Rationale**: The mcp-manager is a prompt-driven subagent. Adding code would require:
- Runtime dependencies in user projects
- More complex installation/update logic
- Potential version conflicts

**Alternatives considered**:
- Code-based retry logic: Rejected (adds runtime complexity)
- Separate batch agent: Rejected (unnecessary fragmentation)

### Decision 2: Batch Syntax

**Choice**: Use JSON array syntax for batch operations in the task prompt.

```
BATCH: [
  {"tool": "screenshot", "params": {}},
  {"tool": "get_title", "params": {}}
]
```

**Rationale**: 
- Unambiguous parsing by Haiku model
- Supports arbitrary tool combinations
- Easy to extend with chaining metadata

**Alternatives considered**:
- Natural language batching ("do X and Y"): Rejected (ambiguous parsing)
- Comma-separated tool names: Rejected (no param support)

### Decision 3: Retry Strategy

**Choice**: Up to 3 retries with simple backoff (immediate, 1s, 2s).

**Rationale**:
- 3 attempts balances reliability vs latency
- Simple backoff avoids complexity
- Haiku's low cost makes retries affordable

**Alternatives considered**:
- Exponential backoff: Rejected (overkill for tool calls)
- Configurable retry count: Rejected (adds complexity, 3 is reasonable default)

### Decision 4: Direct Passthrough Detection

**Choice**: Detect exact tool names via pattern matching (contains `__` or matches known tool format).

**Rationale**:
- MCP tools follow naming conventions (e.g., `MetaMCP_chrome__screenshot`)
- Pattern matching is reliable and fast
- No cache lookup needed for passthrough

**Alternatives considered**:
- Keyword prefix ("DIRECT:"): Rejected (extra syntax burden on caller)
- Cache lookup for validation: Rejected (defeats latency benefit)

### Decision 5: Tool Chaining Syntax

**Choice**: Use `chain` array with explicit output→input mapping.

```
CHAIN: [
  {"tool": "get_element", "params": {"selector": "#btn"}, "output_as": "element"},
  {"tool": "click", "params": {"element": "$element"}}
]
```

**Rationale**:
- Explicit variable binding (`$element`) is unambiguous
- Supports complex multi-step workflows
- Haiku can parse and execute sequentially

**Alternatives considered**:
- Implicit chaining (auto-pass previous output): Rejected (too magical, error-prone)
- Pipe syntax: Rejected (unfamiliar to LLM)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Haiku may misparse batch/chain syntax | Provide clear examples in prompt; use strict JSON format |
| Retry delays add latency | Cap at 3 retries; use short backoff (0s, 1s, 2s) |
| Passthrough pattern may false-positive | Use conservative pattern (`__` separator is MCP-specific) |
| Prompt length increases | Keep additions concise; Haiku context is sufficient |
| Chaining failures mid-sequence | Report which step failed; include partial results |

## Open Questions

1. **Should batch results be returned as array or merged object?** 
   - Leaning toward: Array (preserves order, clearer structure)

2. **Should failed chain steps abort or continue?**
   - Leaning toward: Abort and report (partial execution is confusing)

3. **Should auto-refresh be automatic or suggested?**
   - Leaning toward: Suggest first, auto-refresh if user confirms pattern
