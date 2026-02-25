## Why

Users want to create custom skills for their MCP tools but the process is manual and error-prone. Currently, to create a skill you must:
1. Understand the SKILL.md format and frontmatter schema
2. Manually write documentation for each tool category
3. Create reference files for complex patterns
4. Define rules and best practices from scratch

This is time-consuming and requires deep knowledge of the skill format. Meanwhile, Context7 has proven that library maintainers can define "rules" (best practices/guidelines) that coding agents should follow. We should enable similar functionality: **auto-generate skills from MCP tool definitions with user-defined rules**.

## What Changes

- **Skill Generator**: New `/mcp-skill-generate` command that creates a skill from MCP tool categories
- **Rules System**: Allow users to define rules (best practices) per tool category that appear as recommendations
- **Template Engine**: Generate SKILL.md, reference files, and assets from tool metadata
- **Context7 Integration**: Optionally fetch library rules from Context7 for known libraries
- **Interactive Mode**: Wizard-style skill creation with prompts for customization

## Capabilities

### New Capabilities

- `skill-generator`: Command that generates a complete skill directory from MCP tool categories
- `rules-system`: Define and store rules per tool category that guide agent behavior
- `template-engine`: Generate skill files from templates using tool metadata
- `context7-rules`: Fetch and incorporate rules from Context7 for known libraries

### Modified Capabilities

- `workflow-definition`: Extend to support rule-based workflow suggestions

## Impact

### Files Created

| File | Purpose |
|------|---------|
| `templates/command-skill-generate.md` | New `/mcp-skill-generate` command definition |
| `templates/skill/assets/skill-template.md` | Template for generated SKILL.md files |
| `templates/skill/assets/rules-schema.json` | JSON schema for rules definitions |
| `templates/skill/references/skill-generation.md` | Documentation for skill generation |

### Files Modified

| File | Changes |
|------|---------|
| `templates/agent.json` | Add skill generation and rules awareness to prompt |
| `templates/skill/SKILL.md` | Document skill generation feature |
| `AGENTS.md` | Update with v5.0.0 capabilities |
| `README.md` | Add skill generation section |

### Cache Schema Changes

Extend `.opencode/mcp-tools.json` from v4.0.0 to v5.0.0:
- Add `rules` object for per-category rules
- Add `generated_skills` array tracking generated skill metadata
- Add `context7_rules` for fetched library rules

### Behavior Changes

1. **Skill Generation**: `/mcp-skill-generate` creates a complete skill directory
2. **Rules Injection**: Rules appear as recommendations when routing to a category
3. **Context7 Lookup**: Optionally fetch rules from Context7 for known libraries
4. **Workflow Suggestions**: Rules can suggest workflows for common patterns

### No Breaking Changes

All changes are additive. Existing skills and workflows continue to work unchanged.

## User Stories

### Story 1: Generate Skill from MCP Tools
```
User: /mcp-skill-generate --category database
Agent: Creating skill for 'database' category...
       - Found 12 tools: query, insert, update, delete, ...
       - Generated SKILL.md with tool documentation
       - Created references/database-patterns.md
       - Added to .opencode/skills/database/
       
       Skill 'database' created! Add rules with:
       /mcp-skill-generate --add-rule database "Always use parameterized queries"
```

### Story 2: Add Rules to Category
```
User: /mcp-skill-generate --add-rule database "Always inspect table structure before queries"
Agent: Added rule to 'database' category.
       
       Active rules for 'database':
       1. Always inspect table structure before queries
       2. Use parameterized queries to prevent SQL injection
       
       These rules will appear as recommendations when routing database tasks.
```

### Story 3: Fetch Context7 Rules
```
User: /mcp-skill-generate --fetch-rules mongodb
Agent: Fetching rules from Context7 for 'mongodb'...
       
       Found 3 rules from Context7:
       1. Use connection pooling for production
       2. Always handle connection errors
       3. Use indexes for frequently queried fields
       
       Add these rules to your 'database' category? [y/n]
```

### Story 4: Interactive Skill Creation
```
User: /mcp-skill-generate --interactive
Agent: Welcome to Skill Generator!
       
       Step 1: Select category to generate skill for:
       1. database (12 tools)
       2. browser (8 tools)
       3. github (15 tools)
       > 1
       
       Step 2: Add custom rules (enter blank to skip):
       Rule 1: Always use transactions for multi-step operations
       Rule 2: 
       
       Step 3: Fetch rules from Context7? [y/n]: y
       Fetching... Found 2 additional rules.
       
       Generating skill... Done!
       Created: .opencode/skills/database/
```

## Success Criteria

1. Users can generate a complete skill from any MCP tool category in <30 seconds
2. Generated skills follow the same format as hand-written skills
3. Rules appear as recommendations during tool routing
4. Context7 integration works for libraries in their database
5. Interactive mode guides users through the entire process
