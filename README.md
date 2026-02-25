# @nano-step/skill-manager

CLI tool that installs and manages **AI agent skills** into [OpenCode](https://github.com/sst/opencode) projects. Reduces token usage by **80-95%** by isolating MCP tool definitions in a dedicated subagent context.

## Why?

When using many MCP (Model Context Protocol) tools, the tool definitions consume thousands of tokens in your main agent's context window. This tool creates a lightweight routing layer that:

1. **Installs a skill** (`mcp-management`) with routing logic and documentation
2. **Configures a subagent** (`mcp-manager`) using a fast, cheap model
3. **Caches tool metadata** in `.opencode/mcp-tools.json` for instant routing
4. **Returns summarized results** — main agent stays lean

## Installation

```bash
npx @nano-step/skill-manager
```

This will:
- Detect your OpenCode config directory (`.opencode/` or `~/.config/opencode/`)
- Install the `mcp-management` skill with routing logic
- Install the `/mcp-refresh` command
- Add the `mcp-manager` subagent to `oh-my-opencode.json`

## Usage

### Install (first time)

```bash
npx @nano-step/skill-manager
```

### Update (to latest version)

```bash
npx @nano-step/skill-manager --update
```

Creates timestamped backups of customized files before updating.

### Remove

```bash
npx @nano-step/skill-manager --remove
```

Cleanly removes all installed artifacts.

## What Gets Installed

| Artifact | Location | Purpose |
|----------|----------|---------|
| Skill | `{config}/skills/mcp-management/` | Routing logic & documentation |
| Command | `{config}/command/agent-skill-refresh.md` | Re-index MCP tools |
| Agent | `{config}/oh-my-opencode.json` | `mcp-manager` subagent config |
| Version | `{config}/.agent-skill-version.json` | Track installed version |

## After Installation

Run the refresh command in OpenCode to create the initial tool cache:

```
/agent-skill-refresh
```

This analyzes all available MCP tools and creates a semantic index at `.opencode/mcp-tools.json`.

## Config Detection

The tool looks for OpenCode configuration in this order:

1. **Project-level**: `.opencode/` in current directory (preferred)
2. **Global**: `~/.config/opencode/`

## How It Works

```
User request → Main agent (Opus/Sonnet)
  ↓ delegates MCP task
  mcp-manager subagent (Haiku — fast & cheap)
  ↓ reads .opencode/mcp-tools.json cache
  ↓ routes to correct MCP tool category
  ↓ executes tool, summarizes result
  ↓ returns to main agent
Main agent continues with minimal token cost
```

### Tool Categories

| Category | Tools | Example |
|----------|-------|---------|
| browser | chrome-devtools__* | Screenshots, clicks, navigation |
| github | github-*__* | PRs, issues, repos |
| graphql | graphql-tools__* | Schema inspection, queries |
| docs | context7__* | Documentation lookup |
| reasoning | Sequential-Thinking__* | Complex analysis |

## Advanced Features (v4.0.0)

### Direct Passthrough

Skip routing when you know the exact tool name:

```
MetaMCP_chrome-devtools__take_screenshot
```

Any tool name containing `__` executes directly without category lookup.

### Batch Operations

Execute multiple tools in one request:

```
BATCH: [
  {"tool": "screenshot", "params": {}},
  {"tool": "get_title", "params": {}}
]
```

- Maximum 10 tools per batch
- Returns array of results in execution order

### Tool Chaining

Chain tools with output passing:

```
CHAIN: [
  {"tool": "get_element", "params": {"selector": "#btn"}, "output_as": "el"},
  {"tool": "click", "params": {"element": "$el"}}
]
```

- Use `$varname` to reference previous outputs
- Maximum 5 tools per chain

### Automatic Retry

All tool executions automatically retry on failure:

- Up to 3 attempts with delays: 0s → 1s → 2s
- Returns detailed failure report if all attempts fail

### Workflows

Define prerequisite steps that automatically execute before certain tools:

```bash
# Add a workflow from template
/agent-skill-workflow add --template database

# List active workflows
/agent-skill-workflow list

# Disable temporarily
/agent-skill-workflow disable database-safe-query
```

**Built-in templates:**

| Template | Description | Prerequisites |
|----------|-------------|---------------|
| `database` | Safe database queries | list_databases → list_tables → inspect_table |
| `browser` | Safe browser interaction | take_snapshot |
| `github-pr` | PR review workflow | get_pr → get_files → get_status |

**Workflow modes:**
- `enforce`: Auto-run prerequisites (default)
- `warn`: Show warning, allow skip
- `suggest`: Mention only, don't block

## Development

### Build

```bash
npm install
npm run build
```

### Test Locally

```bash
# After building
node bin/cli.js          # Install
node bin/cli.js --update # Update
node bin/cli.js --remove # Remove
```

### Project Structure

```
skill-manager/
├── src/                    # TypeScript source
│   ├── index.ts           # CLI entry point
│   ├── install.ts         # Installation logic
│   ├── update.ts          # Update with backup
│   ├── remove.ts          # Clean removal
│   └── utils.ts           # Shared utilities
├── templates/              # Files to install
│   ├── agent.json         # mcp-manager agent config
│   ├── command-refresh.md # /agent-skill-refresh command
│   └── skill/             # mcp-management skill
├── bin/cli.js             # Executable entry
└── dist/                  # Compiled output
```

## Related Projects

- [nano-brain](https://github.com/nano-step/nano-brain) — Persistent memory for AI agents
- [graphql-inspector-mcp](https://github.com/nano-step/graphql-inspector-mcp) — GraphQL schema inspection MCP server
- [mcp-database-inspector](https://github.com/nano-step/mcp-database-inspector) — Database inspection MCP server

## License

MIT
