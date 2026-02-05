## Context

MCP Manager v3.0.0 provides tool routing with batch operations, chaining, retry, and passthrough. However, there's no mechanism to enforce best practices or prerequisite steps before certain tool executions. Users must manually remember to inspect database structure before querying, or take snapshots before clicking elements.

This feature adds "workflows" - user-defined rules that automatically execute prerequisite steps when certain tools are triggered.

## Goals / Non-Goals

**Goals:**
- Define workflow rules that specify prerequisites for tool categories
- Provide a command interface for managing workflows
- Automatically detect and execute workflows in mcp-manager
- Track session state to avoid redundant prerequisite execution
- Ship built-in templates for common patterns

**Non-Goals:**
- Complex conditional logic (if/else in workflows)
- Cross-session state persistence
- Workflow versioning or history
- Approval workflows (human-in-the-loop)

## Decisions

### Decision 1: Storage Location

**Choice**: Extend existing `.opencode/mcp-tools.json` cache file with a `workflows` section.

**Rationale**:
- Single source of truth for MCP configuration
- mcp-manager already reads this file
- `/mcp-refresh` can preserve custom workflows during regeneration

**Alternatives considered**:
- Separate `.opencode/mcp-workflows.json`: Rejected (fragmentation)
- In skill files: Rejected (not user-editable)

### Decision 2: Workflow Schema

**Choice**: JSON schema with triggers, prerequisites array, and mode.

```json
{
  "workflows": {
    "workflow-name": {
      "enabled": true,
      "description": "Human-readable description",
      "triggers": {
        "category": "database",
        "tools": ["execute_query", "select_query"],
        "keywords": ["query", "select", "insert"]
      },
      "prerequisites": [
        {"step": 1, "tool": "list_databases", "description": "...", "required": true},
        {"step": 2, "tool": "list_tables", "description": "...", "required": true}
      ],
      "mode": "enforce"
    }
  }
}
```

**Rationale**:
- Clear structure for triggers (multiple match types)
- Ordered prerequisites with step numbers
- Mode controls enforcement level
- Required flag allows optional steps

### Decision 3: Trigger Matching

**Choice**: Match on ANY of: category, specific tools, or keywords in task.

**Rationale**:
- Category matching catches broad tool groups
- Tool matching catches specific operations
- Keyword matching catches natural language requests
- OR logic (any match triggers) is more intuitive than AND

### Decision 4: Execution Modes

**Choice**: Three modes - `enforce`, `warn`, `suggest`.

| Mode | Behavior |
|------|----------|
| `enforce` | Auto-run prerequisites, block main action until done |
| `warn` | Show warning, allow user to skip |
| `suggest` | Mention prerequisites, don't block |

**Rationale**:
- Different use cases need different strictness
- Enforce for critical workflows (database safety)
- Suggest for nice-to-have patterns

### Decision 5: Session State

**Choice**: Store in `.opencode/.mcp-session.json`, cleared on new session.

```json
{
  "session_id": "uuid",
  "started_at": "ISO timestamp",
  "completed": {
    "workflow-name": {
      "step-1": {"at": "...", "result": "summary"},
      "step-2": {"at": "...", "result": "summary"}
    }
  }
}
```

**Rationale**:
- File-based survives agent restarts within session
- Session-scoped avoids stale state
- Stores result summaries for context

### Decision 6: Command Interface

**Choice**: `/mcp-workflow` with subcommands.

```
/mcp-workflow list                    # List all workflows
/mcp-workflow add <name>              # Interactive creation
/mcp-workflow add --template <name>   # From built-in template
/mcp-workflow edit <name>             # Modify existing
/mcp-workflow remove <name>           # Delete
/mcp-workflow enable <name>           # Enable disabled workflow
/mcp-workflow disable <name>          # Disable without removing
```

**Rationale**:
- Familiar CRUD pattern
- Templates accelerate common setups
- Enable/disable allows temporary suspension

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Workflow loops (A triggers B triggers A) | Detect cycles during workflow creation |
| Performance overhead from prerequisite checks | Cache trigger patterns, fast matching |
| User confusion about why extra steps run | Clear logging: "Running prerequisite: list_tables (database-safe-query workflow)" |
| Stale session state | Auto-clear on session timeout (configurable) |
| Conflicting workflows | First match wins; warn if multiple match |

## Open Questions

1. **Should workflows support parameters?** (e.g., "inspect_table for the table mentioned in task")
   - Leaning: Yes, with simple `$task_param` substitution

2. **Should prerequisites run in parallel or sequential?**
   - Leaning: Sequential (step order matters for dependencies)

3. **How to handle prerequisite failures?**
   - Leaning: Abort workflow, report which step failed, suggest fix
