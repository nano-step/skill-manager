## Why

The current MCP Manager implementation provides basic tool routing but lacks robustness features needed for production use. Users experience failures without automatic recovery, cannot batch multiple MCP operations efficiently, and miss optimization opportunities when exact tool names are known. These enhancements will improve reliability, reduce latency, and provide better error handling.

## What Changes

- **Batch Operations**: Support executing multiple related MCP tools in a single subagent invocation (e.g., "screenshot + get page title" in one call)
- **Direct Passthrough**: Skip semantic routing when exact tool name is specified, reducing latency for known operations
- **Retry with Reporting**: Implement up to 3 automatic retries on tool failure, with detailed failure report if all attempts fail
- **Tool Chaining**: Support workflows where Tool A's output feeds into Tool B's input within a single invocation
- **Auto-refresh on Cache Miss**: Automatically trigger `/mcp-refresh` when a tool is not found in cache
- **Context Forwarding**: Pass relevant conversation context to mcp-manager for better disambiguation of ambiguous requests

## Capabilities

### New Capabilities

- `batch-operations`: Execute multiple MCP tools in a single subagent call, reducing round-trip overhead
- `retry-mechanism`: Automatic retry logic (up to 3 attempts) with exponential backoff and detailed failure reporting
- `tool-chaining`: Support for sequential tool execution where outputs flow to subsequent tool inputs
- `direct-passthrough`: Bypass semantic routing when exact tool name is provided

### Modified Capabilities

_(No existing specs to modify - this is a greenfield project)_

## Impact

### Files Modified

| File | Changes |
|------|---------|
| `templates/agent.json` | Add batch mode, retry logic, passthrough, and chaining instructions to prompt |
| `templates/skill/SKILL.md` | Document new capabilities, update routing decision tree |
| `templates/command.md` | Add auto-refresh trigger documentation |
| `templates/skill/references/error-handling.md` | Add retry mechanism documentation |
| `templates/skill/references/tool-execution.md` | Add batch and chaining patterns |

### Behavior Changes

1. **Retry Behavior**: Failed tool calls will automatically retry up to 3 times before returning failure report
2. **Routing Behavior**: Explicit tool names bypass category matching entirely
3. **Batch Behavior**: Multiple tools can be requested and executed in sequence within one invocation
4. **Cache Behavior**: Missing tools trigger automatic cache refresh suggestion or execution

### No Breaking Changes

All enhancements are additive. Existing single-tool, semantic-routing workflows continue to work unchanged.
