# AGENTS.md - agent-skill-manager

> CLI tool that installs and manages AI agent skills, MCP tool routing, and workflow configurations.
> Reduces token usage by 80-95% by isolating skill definitions in a dedicated subagent context.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npx .` | Run locally (after build) |
| `node bin/cli.js` | Direct execution |
| `node bin/cli.js --update` | Update existing installation |
| `node bin/cli.js --remove` | Remove installation |

## Build & Development

### Build Commands

```bash
# Compile TypeScript
npm run build

# Watch mode (if available)
npx tsc --watch

# Type check only (no emit)
npx tsc --noEmit
```

### Testing Locally

```bash
# Build first
npm run build

# Test install (requires .opencode or ~/.config/opencode)
node bin/cli.js

# Test update
node bin/cli.js --update

# Test remove
node bin/cli.js --remove
```

**Note**: This project has no automated tests. Manual testing against a real OpenCode config is required.

## Project Structure

```
agent-skill-manager/
├── src/                    # TypeScript source
│   ├── index.ts           # CLI entry point (Commander.js)
│   ├── install.ts         # Fresh installation logic
│   ├── update.ts          # Update with backup logic
│   ├── remove.ts          # Clean removal logic
│   └── utils.ts           # Shared utilities & types
├── templates/              # Files to install
│   ├── agent.json         # mcp-manager agent config
│   ├── command.md         # /mcp-refresh command
│   └── skill/             # Skill management system
│       ├── SKILL.md       # Main skill document
│       ├── assets/        # JSON templates
│       └── references/    # Detailed documentation
├── bin/cli.js             # Executable entry point
├── dist/                  # Compiled output (CommonJS)
└── tsconfig.json          # TypeScript config
```

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2020
- **Module**: CommonJS
- **Strict mode**: Enabled
- **Declaration files**: Generated

### Import Order

1. Node.js built-ins (`path`, `os`)
2. External packages (`chalk`, `commander`, `fs-extra`)
3. Internal modules (`./utils`)

```typescript
import path from "path";
import os from "os";
import fs from "fs-extra";
import chalk from "chalk";
import { detectOpenCodePaths, ensureDirExists } from "./utils";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `install.ts`, `utils.ts` |
| Functions | camelCase | `detectOpenCodePaths`, `ensureDirExists` |
| Interfaces | PascalCase | `OpenCodePaths`, `InstallationState` |
| Constants | SCREAMING_SNAKE | `PACKAGE_VERSION`, `AGENT_ID` |
| Variables | camelCase | `configDir`, `skillTargetDir` |

### Function Patterns

**Async/Await**: All file operations use async/await with fs-extra.

```typescript
export async function install(): Promise<void> {
  const paths = await detectOpenCodePaths();
  await ensureDirExists(paths.commandDir);
  // ...
}
```

**Error Handling**: Throw errors with descriptive messages. CLI catches at top level.

```typescript
if (!hasHomeConfig && !hasProjectConfig) {
  throw new Error("OpenCode config not found. Expected ~/.config/opencode or .opencode in project.");
}
```

**Console Output**: Use `chalk` for colored output.

```typescript
console.log(chalk.green("Agent skill manager installed successfully."));
console.log(chalk.yellow("Detected customized files. Backups will be created."));
console.error(chalk.red("Cannot use --update and --remove together."));
```

### Type Definitions

Define interfaces for complex return types:

```typescript
export interface OpenCodePaths {
  configDir: string;
  projectDir: string;
  commandDir: string;
  skillsDir: string;
  agentConfigPath: string;
  versionFilePath: string;
  templateSkillDir: string;
  templateCommandPath: string;
  templateAgentPath: string;
}
```

### JSON File Handling

Use generic helpers with fallback defaults:

```typescript
export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const exists = await fs.pathExists(filePath);
  if (!exists) return fallback;
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data) as T;
}
```

### Path Construction

Always use `path.join()` for cross-platform compatibility:

```typescript
const skillTargetDir = path.join(paths.skillsDir, "mcp-management");
const commandTargetPath = path.join(paths.commandDir, "mcp-refresh.md");
```

## Key Implementation Details

### Config Detection Priority

1. Project-level `.opencode/` (preferred)
2. Global `~/.config/opencode/`

### Installation Artifacts

| Artifact | Target Path |
|----------|-------------|
| Skill | `{config}/skills/mcp-management/` |
| Command | `{config}/command/mcp-refresh.md` |
| Agent | Merged into `{config}/oh-my-opencode.json` |
| Version | `{config}/.mcp-manager-version.json` |

### Update Behavior

- Creates timestamped backups before overwriting
- Detects customized files and warns user
- Skips if already at current version

### Remove Behavior

- Deletes skill directory
- Deletes command file
- Removes agent key from oh-my-opencode.json
- Deletes version tracking file

## MCP Manager Capabilities (v4.0.0)

The mcp-manager subagent supports these advanced features:

### Direct Passthrough
Skip routing when exact tool name is provided (contains `__`):
```
MetaMCP_chrome-devtools__take_screenshot → executes directly
```

### Batch Operations
Execute multiple tools in one request:
```
BATCH: [{"tool": "screenshot"}, {"tool": "get_title"}]
```
- Maximum 10 tools per batch
- Returns array of results

### Tool Chaining
Chain tools with output passing:
```
CHAIN: [
  {"tool": "get_element", "params": {"selector": "#btn"}, "output_as": "el"},
  {"tool": "click", "params": {"element": "$el"}}
]
```
- Use `$varname` for variable substitution
- Maximum 5 tools per chain

### Retry Mechanism
Automatic retry on failure:
- Up to 3 attempts
- Delays: 0s → 1s → 2s
- Returns detailed failure report if all attempts fail

### Workflows (v4.0.0)
Define prerequisite steps that auto-execute before certain tools:
```bash
# Add workflow from template
/mcp-workflow add --template database

# Creates workflow that runs: list_databases → list_tables → inspect_table
# before any database query
```

Built-in templates:
- `database`: Inspect structure before queries
- `browser`: Take snapshot before clicking
- `github-pr`: Review PR before merging

Workflow modes:
- `enforce`: Auto-run prerequisites (default)
- `warn`: Show warning, allow skip
- `suggest`: Mention only

## Dependencies

| Package | Purpose |
|---------|---------|
| `chalk` | Colored terminal output |
| `commander` | CLI argument parsing |
| `fs-extra` | Enhanced file operations |

## Common Tasks

### Adding a New Template File

1. Add file to `templates/`
2. Update `OpenCodePaths` interface in `utils.ts`
3. Update `detectOpenCodePaths()` to include new path
4. Update `install.ts`, `update.ts`, `remove.ts` to handle new file

### Updating Version

1. Update `PACKAGE_VERSION` in `src/utils.ts`
2. Update version in `package-lock.json`
3. Rebuild: `npm run build`

### Debugging

```bash
# Run with Node debugger
node --inspect bin/cli.js

# Check compiled output
cat dist/install.js
```
