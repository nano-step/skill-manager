# MCP Workflow Reference

Define prerequisite steps that automatically execute before certain tool operations.

## Overview

Workflows enforce best practices by requiring prerequisite steps before tool execution. For example, always inspect database structure before running queries, or take a page snapshot before clicking elements.

## Workflow Schema

```json
{
  "workflow-name": {
    "enabled": true,
    "description": "Human-readable description",
    "triggers": {
      "category": "database",
      "tools": ["execute_query", "select_query"],
      "keywords": ["query", "select", "insert"]
    },
    "prerequisites": [
      {
        "step": 1,
        "tool": "list_databases",
        "description": "List available databases",
        "required": true
      },
      {
        "step": 2,
        "tool": "list_tables",
        "description": "List tables in database",
        "required": true
      }
    ],
    "mode": "enforce",
    "created_at": "2026-02-04T..."
  }
}
```

## Trigger Types

Workflows trigger when ANY condition matches (OR logic):

| Trigger | Description | Example |
|---------|-------------|---------|
| `category` | Tool belongs to this category | `"database"` |
| `tools` | Tool name is in this list | `["execute_query", "select_query"]` |
| `keywords` | Task text contains these words | `["query", "select"]` |

## Execution Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `enforce` | Auto-run prerequisites before main action | Critical safety (database, destructive ops) |
| `warn` | Show warning, allow skip | Important but skippable |
| `suggest` | Mention prerequisites, don't block | Nice-to-have patterns |

## Prerequisite Definition

Each prerequisite step has:

| Field | Required | Description |
|-------|----------|-------------|
| `step` | Yes | Execution order (1-based) |
| `tool` | Yes | Tool name to execute |
| `description` | Yes | Why this step is needed |
| `required` | No | Can this step be skipped? (default: true) |
| `params` | No | Default parameters for the tool |

## Session State

Completed prerequisites are tracked in `.opencode/.mcp-session.json`:

```json
{
  "session_id": "abc123",
  "started_at": "2026-02-04T10:00:00Z",
  "completed": {
    "database-safe-query": {
      "list_databases": {
        "at": "2026-02-04T10:05:00Z",
        "result": "Found 3 databases: main, analytics, test"
      },
      "list_tables": {
        "at": "2026-02-04T10:05:30Z",
        "result": "Found 12 tables in main"
      }
    }
  }
}
```

### Session Rules

- Prerequisites only run once per session per workflow
- Session expires after 24 hours (configurable)
- New session clears all completion state
- Result summaries are truncated to 200 chars

## Built-in Templates

### Database Template

```json
{
  "name": "database-safe-query",
  "triggers": {
    "category": "database",
    "keywords": ["query", "select", "insert", "update", "delete"]
  },
  "prerequisites": [
    {"step": 1, "tool": "list_databases", "description": "Know available databases"},
    {"step": 2, "tool": "list_tables", "description": "Know table structure"},
    {"step": 3, "tool": "inspect_table", "description": "Check columns and types"},
    {"step": 4, "tool": "get_indexes", "description": "Check indexes", "required": false}
  ],
  "mode": "enforce"
}
```

### Browser Template

```json
{
  "name": "browser-safe-interaction",
  "triggers": {
    "category": "browser",
    "tools": ["click", "fill", "submit"]
  },
  "prerequisites": [
    {"step": 1, "tool": "take_snapshot", "description": "Capture page state and UIDs"}
  ],
  "mode": "enforce"
}
```

### GitHub PR Template

```json
{
  "name": "github-pr-review",
  "triggers": {
    "tools": ["merge_pull_request", "create_pull_request_review"]
  },
  "prerequisites": [
    {"step": 1, "tool": "get_pull_request", "description": "Get PR details"},
    {"step": 2, "tool": "get_pull_request_files", "description": "List changed files"},
    {"step": 3, "tool": "get_pull_request_status", "description": "Check CI status"}
  ],
  "mode": "warn"
}
```

## Workflow Execution Flow

```
Task: "Query all users with status active"
│
├─ 1. Check for workflow triggers
│     └─ Match: "database-safe-query" (keyword: "query")
│
├─ 2. Check session state
│     └─ Prerequisites not completed
│
├─ 3. Mode is "enforce" → Run prerequisites
│     ├─ Step 1: list_databases → "3 databases found"
│     ├─ Step 2: list_tables → "users, orders, products"
│     └─ Step 3: inspect_table → "id, name, email, status"
│
├─ 4. Update session state
│
└─ 5. Execute main action
      └─ SELECT * FROM users WHERE status = 'active'
```

## Error Handling

### Prerequisite Failure

If a prerequisite fails:
1. Retry mechanism applies (3 attempts)
2. If all retries fail, workflow aborts
3. Error report includes which step failed

```
Workflow 'database-safe-query' failed at step 2 (list_tables):
  Error: Connection refused
  Suggestion: Check database connection settings
```

### Multiple Workflow Matches

If multiple workflows match:
1. First defined workflow is used
2. Warning logged about conflict

```
Multiple workflows matched. Using 'database-safe-query'.
Also matched: 'custom-db-workflow'
```

## Managing Workflows

Use `/mcp-workflow` command:

```bash
# List all workflows
/mcp-workflow list

# Add from template
/mcp-workflow add --template database

# Add custom workflow
/mcp-workflow add my-workflow

# Edit existing
/mcp-workflow edit my-workflow

# Disable temporarily
/mcp-workflow disable my-workflow

# Remove
/mcp-workflow remove my-workflow
```

## Best Practices

1. **Start with templates** - Use built-in templates, customize as needed
2. **Use enforce sparingly** - Only for critical safety workflows
3. **Keep prerequisites minimal** - Each step adds latency
4. **Mark optional steps** - Use `required: false` for nice-to-have steps
5. **Review session state** - Check `.mcp-session.json` if prerequisites seem stuck
