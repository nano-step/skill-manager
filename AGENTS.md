# AGENTS.md - @nano-step/skill-manager

> Multi-skill registry CLI for OpenCode. Install, manage, and update AI agent skills from a built-in catalog.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `node bin/cli.js list` | Show available skills |
| `node bin/cli.js install <name>` | Install a skill |
| `node bin/cli.js install <name> --force` | Force reinstall even if same version |
| `node bin/cli.js install --all` | Install all skills |
| `node bin/cli.js install --all --force` | Force reinstall all skills |
| `node bin/cli.js remove <name>` | Remove a skill |
| `node bin/cli.js update [name]` | Update skill(s) |
| `node bin/cli.js update [name] --force` | Force update even if same version |
| `node bin/cli.js installed` | Show installed skills |

## Build & Development

### Build Commands

```bash
# Compile TypeScript
npm run build

# Watch mode
npx tsc --watch

# Type check only (no emit)
npx tsc --noEmit
```

### Testing Locally

```bash
# Build first
npm run build

# Test all commands
node bin/cli.js list
node bin/cli.js install skill-management
node bin/cli.js installed
node bin/cli.js update
node bin/cli.js remove skill-management
```

**Note**: This project has no automated tests. Manual testing against a real OpenCode config is required.

## Project Structure

```
skill-manager/
├── src/
│   ├── index.ts          # CLI entry (commander subcommands)
│   ├── registry.ts       # Scan skills/ dirs, load/validate manifests
│   ├── installer.ts      # Install/remove/update logic (per-skill)
│   ├── state.ts          # Read/write .skill-manager.json, v4 migration
│   ├── config.ts         # Merge agents/commands into oh-my-opencode.json
│   └── utils.ts          # Path detection, file ops, shared types
├── skills/               # Built-in skill catalog
│   ├── skill-management/
│   │   ├── skill.json    # Skill manifest
│   │   ├── SKILL.md
│   │   ├── skill-refresh.md
│   │   ├── references/
│   │   └── assets/
│   └── graphql-inspector/
│       ├── skill.json
│       └── SKILL.md
├── bin/cli.js            # Executable entry point
├── dist/                 # Compiled output (CommonJS)
└── tsconfig.json
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
3. Internal modules (`./utils`, `./registry`)

```typescript
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { OpenCodePaths, SkillManifest, MANAGER_VERSION } from "./utils";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `installer.ts`, `registry.ts` |
| Functions | camelCase | `detectOpenCodePaths`, `loadCatalog` |
| Interfaces | PascalCase | `OpenCodePaths`, `SkillManifest`, `ManagerState` |
| Constants | SCREAMING_SNAKE | `MANAGER_VERSION` |
| Variables | camelCase | `configDir`, `packageSkillsDir` |

### Function Patterns

**Async/Await**: All file operations use async/await with fs-extra.

```typescript
export async function installSkill(name: string, paths: OpenCodePaths): Promise<void> {
  const manifest = await getSkillManifest(paths.packageSkillsDir, name);
  // ...
}
```

**Error Handling**: Use `console.error` + `process.exit(1)` for user-facing errors. Throw for programming errors.

```typescript
if (!manifest) {
  console.error(chalk.red(`Skill "${name}" not found in catalog.`));
  process.exit(1);
}
```

**Console Output**: Use `chalk` for colored output. `console.log` for normal output, `console.error` for errors/warnings.

### Key Interfaces

```typescript
export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  compatibility?: string;
  agent?: { id: string; config: Record<string, unknown> } | null;
  commands?: string[];
  tags?: string[];
}

export interface ManagerState {
  version: number;
  managerVersion: string;
  skills: Record<string, InstalledSkillInfo>;
}

export interface OpenCodePaths {
  configDir: string;
  commandDir: string;
  skillsDir: string;
  agentConfigPath: string;
  stateFilePath: string;
  packageSkillsDir: string;
}
```

## Key Implementation Details

### Config Detection Priority

1. Project-level `.opencode/` (preferred)
2. Global `~/.config/opencode/`

### Installation Artifacts (per skill)

| Artifact | Target Path |
|----------|-------------|
| Skill files | `{config}/skills/{name}/` |
| Commands | `{config}/command/{cmd}` (from manifest `commands` array) |
| Agent config | Merged into `{config}/oh-my-opencode.json` under `agents` key |
| State | `{config}/.skill-manager.json` (shared across all skills) |

### Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `registry.ts` | Scan `skills/*/skill.json`, validate manifests, return catalog |
| `state.ts` | Read/write `.skill-manager.json`, v4→v5 migration |
| `config.ts` | Merge/remove agent configs in `oh-my-opencode.json`, copy/remove commands |
| `installer.ts` | Orchestrate install/remove/update using registry + state + config |
| `index.ts` | CLI entry, commander subcommands, legacy flag detection |
| `utils.ts` | Path detection, file helpers, shared types/interfaces |

## Dependencies

| Package | Purpose |
|---------|---------|
| `chalk` | Colored terminal output |
| `commander` | CLI argument parsing |
| `fs-extra` | Enhanced file operations |

## Common Tasks

### Adding a New Skill

1. Create `skills/<name>/` directory
2. Add `skill.json` manifest with required fields (`name`, `version`, `description`)
3. Add `SKILL.md` with skill instructions
4. Optionally add `agent` config and `commands` to manifest
5. Build and test: `npm run build && node bin/cli.js list`

### Updating Version

1. Update `MANAGER_VERSION` in `src/utils.ts`
2. Update `version` in `package.json`
3. Rebuild: `npm run build`

### Debugging

```bash
# Run with Node debugger
node --inspect bin/cli.js list

# Check compiled output
ls dist/
```

## File Writing Rules (MANDATORY)

**NEVER write an entire file at once.** Always use chunk-by-chunk editing:

1. **Use the Edit tool** (find-and-replace) for all file modifications — insert, update, or delete content in targeted chunks
2. **Only use the Write tool** for brand-new files that don't exist yet, AND only if the file is small (< 50 lines)
3. **For new large files (50+ lines):** Write a skeleton first (headers/structure only), then use Edit to fill in each section chunk by chunk
4. **Why:** Writing entire files at once causes truncation, context window overflow, and silent data loss on large files

**Anti-patterns (NEVER do these):**
- `Write` tool to overwrite an existing file with full content
- `Write` tool to create a file with 100+ lines in one shot
- Regenerating an entire file to change a few lines

## Development Workflow

### OpenSpec-First (MANDATORY)

**Every feature, fix, or refactor MUST go through OpenSpec before implementation.**

1. **Propose** → `openspec new change "<name>"` → create proposal.md, design.md, specs, tasks.md
2. **Validate** → `openspec validate "<name>" --strict --no-interactive`
3. **Implement** → `/opsx-apply` or work through tasks.md
4. **Archive** → `openspec archive "<name>"` after merge

**No exceptions.** Do not skip straight to coding. The proposal captures *why*, the spec captures *what*, the design captures *how*, and tasks capture *the plan*. This applies to:
- New features (even small ones)
- Bug fixes that change behavior
- Refactors that touch multiple files

**Only skip OpenSpec for:** typo fixes, dependency bumps, or single-line config changes.
