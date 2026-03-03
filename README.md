# @nano-step/skill-manager

Multi-skill registry CLI for [OpenCode](https://github.com/sst/opencode). Install, manage, and update AI agent skills from a built-in catalog.

## Quick Start

```bash
# List available skills
npx @nano-step/skill-manager list

# Install a skill
npx @nano-step/skill-manager install skill-management

# Install all skills
npx @nano-step/skill-manager install --all
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | Show available skills from the catalog |
| `install <name>` | Install a specific skill |
| `install --all` | Install all available skills |
| `remove <name>` | Remove an installed skill |
| `update [name]` | Update one or all installed skills |
| `installed` | Show currently installed skills |

## Available Skills (15 public + 5 private)

### Public Skills (bundled in npm)

| Skill | Description |
|-------|-------------|
| `blog-workflow` | Generate SEO-optimized blog posts for dev.to, Medium, LinkedIn, Hashnode |
| `comprehensive-feature-builder` | Systematic 5-phase workflow for researching, designing, implementing, and testing features |
| `graphql-inspector` | GraphQL schema inspection with progressive discovery workflow |
| `idea-workflow` | Analyze source code and produce monetization strategy with execution blueprint |
| `mermaid-validator` | Validate Mermaid diagram syntax — enforces rules that prevent parse errors |
| `nano-brain` | Persistent memory for AI agents — hybrid search across sessions, codebase, and notes |
| `pdf` | PDF manipulation toolkit — extract, create, merge, split, OCR, fill forms, watermark |
| `reddit-workflow` | Draft Reddit posts optimized for subreddit rules, tone, and spam filters |
| `rtk` | Token optimizer — wraps CLI commands with rtk to reduce token consumption by 60-90% |
| `rtk-setup` | One-time RTK setup + ongoing enforcement across sessions and subagents |
| `security-workflow` | OWASP Top 10 security audit with CVE scanning and prioritized hardening plan |
| `skill-creator` | Create and validate AI agent skills with progressive disclosure and marketplace packaging |
| `skill-management` | AI skill routing — isolates tool definitions in subagent context to save 80-95% tokens |
| `team-workflow` | Simulate an autonomous software team — architecture, execution plan, QA strategy |
| `ui-ux-pro-max` | UI/UX design intelligence with searchable database of styles, palettes, fonts, and guidelines |

### Private Skills (requires `login`)

| Skill | Description |
|-------|-------------|
| `e2e-test-generator` | E2E test generation from PRD using Playwright MCP |
| `feature-analysis` | Deep code analysis with execution tracing and gap analysis |
| `pr-code-reviewer` | Comprehensive PR code review with 4 parallel subagents |
| `rri-t-testing` | RRI-T QA methodology — 5-phase testing with 7 dimensions and release gates |
| `database-inspector` | Database schema inspection for MySQL and PostgreSQL with progressive discovery |
## What Gets Installed

When you install a skill, the manager:

1. Copies skill files (SKILL.md, references, assets) to `{config}/skills/{name}/`
2. Copies command files to `{config}/command/` (if the skill has commands)
3. Merges agent config into `{config}/oh-my-opencode.json` (if the skill defines an agent)
4. Tracks installation state in `{config}/.skill-manager.json`

Config directory is detected automatically: `.opencode/` (project-level, preferred) or `~/.config/opencode/` (global).

## Migrating from v4

v5.0.0 replaces the flag-based CLI with subcommands:

| v4 (old) | v5 (new) |
|----------|----------|
| `npx @nano-step/skill-manager` | `npx @nano-step/skill-manager install skill-management` |
| `npx @nano-step/skill-manager --update` | `npx @nano-step/skill-manager update` |
| `npx @nano-step/skill-manager --remove` | `npx @nano-step/skill-manager remove skill-management` |

Existing v4 installations are automatically migrated on first run.

## Development

```bash
npm install
npm run build

# Test locally
node bin/cli.js list
node bin/cli.js install skill-management
node bin/cli.js installed
node bin/cli.js remove skill-management
```

### Project Structure

```
skill-manager/
├── src/
│   ├── index.ts          # CLI entry (commander subcommands)
│   ├── registry.ts       # Scan skills/ dirs, load manifests
│   ├── installer.ts      # Install/remove/update logic
│   ├── state.ts          # Read/write .skill-manager.json
│   ├── config.ts         # Merge agents/commands into oh-my-opencode.json
│   └── utils.ts          # Path detection, file ops, shared types
├── skills/
│   ├── skill-management/
│   │   ├── skill.json    # Skill manifest
│   │   ├── SKILL.md      # Skill instructions
│   │   ├── skill-refresh.md
│   │   ├── references/   # Detailed documentation
│   │   └── assets/       # Templates and schemas
│   └── graphql-inspector/
│       ├── skill.json
│       └── SKILL.md
├── bin/cli.js
└── package.json
```

### Adding a New Skill

1. Create `skills/<name>/` directory
2. Add `skill.json` manifest:
   ```json
   {
     "name": "<name>",
     "version": "1.0.0",
     "description": "...",
     "compatibility": "OpenCode with ...",
     "agent": null,
     "commands": [],
     "tags": ["..."]
   }
   ```
3. Add `SKILL.md` with skill instructions
4. Build and test: `npm run build && node bin/cli.js list`

## Related Projects

- [nano-brain](https://github.com/nano-step/nano-brain) — Persistent memory for AI agents
- [graphql-inspector-mcp](https://github.com/nano-step/graphql-inspector-mcp) — GraphQL schema inspection MCP server
- [mcp-database-inspector](https://github.com/nano-step/mcp-database-inspector) — Database inspection MCP server

## License

MIT
