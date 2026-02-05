# /mcp-workflow

Manage workflow rules that define prerequisite steps before tool execution.

## Purpose

Create, list, edit, and remove workflow definitions that automatically execute prerequisite steps when certain tools are triggered. For example, always inspect database structure before running queries.

## Subcommands

### List Workflows

```
/mcp-workflow list
```

Display all defined workflows with their status, triggers, and prerequisite count.

**Output format:**
```
Workflows (3 defined):

✓ database-safe-query [enforce]
  Triggers: category=database, keywords=[query, select]
  Prerequisites: 4 steps
  
✓ browser-safe-interaction [enforce]
  Triggers: category=browser
  Prerequisites: 1 step

○ github-pr-review [disabled]
  Triggers: tools=[merge_pull_request]
  Prerequisites: 3 steps
```

### Add Workflow (Interactive)

```
/mcp-workflow add <name>
```

Create a new workflow interactively. The agent will prompt for:

1. **Description**: What does this workflow do?
2. **Triggers**: 
   - Category (optional): Which tool category triggers this?
   - Tools (optional): Which specific tools trigger this?
   - Keywords (optional): Which words in the task trigger this?
3. **Prerequisites**: For each step:
   - Tool name
   - Description (why this step is needed)
   - Required? (yes/no)
4. **Mode**: enforce, warn, or suggest

**Example session:**
```
> /mcp-workflow add api-safety

Description: Check API schema before making requests
Trigger category (or skip): api
Trigger tools (comma-separated, or skip): execute_request, post_request
Trigger keywords (comma-separated, or skip): api call, request

Prerequisite 1:
  Tool: get_schema
  Description: Fetch API schema
  Required? yes
  
Add another prerequisite? yes

Prerequisite 2:
  Tool: list_endpoints
  Description: List available endpoints
  Required? no

Add another prerequisite? no

Mode (enforce/warn/suggest): warn

✓ Workflow 'api-safety' created with 2 prerequisites
```

### Add from Template

```
/mcp-workflow add --template <template-name>
```

Create a workflow from a built-in template. Available templates:

| Template | Description | Prerequisites |
|----------|-------------|---------------|
| `database` | Safe database queries | list_databases → list_tables → inspect_table → get_indexes |
| `browser` | Safe browser interaction | take_snapshot |
| `github-pr` | PR review workflow | get_pull_request → get_files → get_status |
| `graphql` | Schema-aware GraphQL | get_schema → filter_types |

**Example:**
```
> /mcp-workflow add --template database

✓ Created workflow 'database-safe-query' from template
  Mode: enforce
  Prerequisites: 4 steps
```

To list available templates:
```
/mcp-workflow add --template
```

### Edit Workflow

```
/mcp-workflow edit <name>
```

Modify an existing workflow. Shows current values and allows changing any field.

### Remove Workflow

```
/mcp-workflow remove <name>
```

Delete a workflow after confirmation.

```
> /mcp-workflow remove api-safety

Remove workflow 'api-safety'? This cannot be undone. (yes/no): yes

✓ Workflow 'api-safety' removed
```

### Enable/Disable Workflow

```
/mcp-workflow enable <name>
/mcp-workflow disable <name>
```

Toggle a workflow's enabled status without removing it.

```
> /mcp-workflow disable database-safe-query

✓ Workflow 'database-safe-query' disabled
  (Prerequisites will not run until re-enabled)
```

## Workflow Modes

| Mode | Behavior |
|------|----------|
| `enforce` | Prerequisites run automatically before main action |
| `warn` | Warning shown, user can skip prerequisites |
| `suggest` | Prerequisites mentioned but don't block execution |

## Storage

Workflows are stored in `.opencode/mcp-tools.json` under the `workflows` key. They persist across sessions and are preserved when running `/mcp-refresh`.

## Session State

Completed prerequisites are tracked in `.opencode/.mcp-session.json`. Within a session, prerequisites only run once per workflow (unless the session expires after 24 hours).

## Examples

### Create a custom workflow for file operations
```
/mcp-workflow add file-safety
```
Then define triggers for file tools and prerequisites like "list directory" before "delete file".

### Use database template and customize
```
/mcp-workflow add --template database
/mcp-workflow edit database-safe-query
```
Modify the default database workflow to fit your needs.

### Temporarily disable a workflow
```
/mcp-workflow disable browser-safe-interaction
# ... do some quick browser tasks without snapshots ...
/mcp-workflow enable browser-safe-interaction
```
