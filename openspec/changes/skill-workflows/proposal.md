## Why

Users need to enforce structured tool usage patterns to prevent errors and ensure best practices. For example, before running database queries, agents should inspect table structure to avoid invalid column references. Currently, there's no way to define these prerequisite workflows - agents must remember to do them manually, leading to inconsistent behavior and errors.

## What Changes

- **Workflow Definitions**: Add a `workflows` section to the tool cache schema that defines prerequisite steps for tool categories
- **New Command**: `/mcp-workflow` command for creating, listing, editing, and removing workflow rules
- **Workflow Execution**: mcp-manager detects when a task matches a workflow trigger and executes prerequisites automatically
- **Session State**: Track completed prerequisites within a session to avoid redundant execution
- **Built-in Templates**: Provide pre-defined workflow templates for common patterns (database, browser, github)

## Capabilities

### New Capabilities

- `workflow-definition`: Schema for defining workflow rules with triggers, prerequisites, and execution modes
- `workflow-command`: `/mcp-workflow` slash command for CRUD operations on workflow rules
- `workflow-execution`: Logic in mcp-manager to detect triggers and execute prerequisite chains
- `session-state`: Track completed prerequisites within a session to enable smart skipping

### Modified Capabilities

_(No existing specs to modify)_

## Impact

### Files Created

| File | Purpose |
|------|---------|
| `templates/command-workflow.md` | New `/mcp-workflow` command definition |
| `templates/skill/references/workflows.md` | Detailed workflow documentation |
| `templates/skill/assets/workflow-templates.json` | Built-in workflow templates |

### Files Modified

| File | Changes |
|------|---------|
| `templates/agent.json` | Add workflow detection and execution logic to prompt |
| `templates/skill/SKILL.md` | Document workflow feature, add to routing decision tree |
| `templates/command.md` | Reference the new workflow command |

### Cache Schema Changes

Extend `.opencode/mcp-tools.json` from v3.0.0 to v4.0.0:
- Add `workflows` object for workflow definitions
- Add `session_file` path reference for state tracking

### Behavior Changes

1. **Workflow Triggering**: When a task matches workflow triggers (category, tools, or keywords), prerequisites execute first
2. **Session Awareness**: Prerequisites only run once per session unless explicitly requested
3. **Mode Control**: Workflows can enforce, warn, or suggest prerequisites

### No Breaking Changes

All changes are additive. Existing tool routing continues to work. Workflows are opt-in.
