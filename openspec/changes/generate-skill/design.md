## Context

The MCP Manager currently provides tool routing, workflows, and execution features. Users can define workflows for prerequisite steps, but creating custom skills requires manual work. Context7 has demonstrated that library maintainers can define "rules" (best practices) that appear as recommendations to coding agents.

**Current state:**
- Skills are manually written following SKILL.md format
- No way to auto-generate skills from tool metadata
- No rules system for per-category best practices
- No integration with external rule sources like Context7

**Inspiration from Context7:**
- `context7.json` allows library owners to define `rules` array
- Rules are "best practices or important guidelines that coding agents should follow"
- Example: `["Use Upstash Redis as a database", "Use single region set up"]`

## Goals / Non-Goals

**Goals:**
- Enable auto-generation of skills from MCP tool categories
- Provide a rules system for per-category best practices
- Integrate with Context7 to fetch library-specific rules
- Maintain the existing skill format for compatibility
- Support both interactive and non-interactive generation

**Non-Goals:**
- Replacing hand-written skills (generated skills are a starting point)
- Automatic rule enforcement (rules are recommendations, not blockers)
- Creating a full Context7 clone (we integrate, not replicate)
- Modifying the CLI installer code (only template content changes)
- Supporting non-MCP tool sources

## Decisions

### Decision 1: Rules Storage Location

**Choice**: Store rules in `.opencode/mcp-tools.json` under a `rules` key.

**Rationale**:
- Single source of truth for MCP-related configuration
- Already versioned and managed by mcp-manager
- Consistent with workflow storage pattern

**Alternatives considered**:
- Separate `rules.json` file: Rejected (fragmentation)
- In skill directory: Rejected (rules apply to categories, not skills)

### Decision 2: Rule Format

**Choice**: Simple string array per category, matching Context7's format.

```json
{
  "rules": {
    "database": [
      "Always inspect table structure before queries",
      "Use parameterized queries to prevent SQL injection"
    ],
    "browser": [
      "Take snapshot before clicking elements"
    ]
  }
}
```

**Rationale**:
- Compatible with Context7's format for easy import
- Simple to understand and edit
- Sufficient for recommendation display

**Alternatives considered**:
- Structured rule objects with severity: Rejected (over-engineering)
- Markdown rules: Rejected (harder to parse and display)

### Decision 3: Skill Generation Output

**Choice**: Generate a complete skill directory with SKILL.md and references.

```
.opencode/skills/{category}/
  SKILL.md           # Main skill document
  references/
    patterns.md      # Common usage patterns
    errors.md        # Error handling
  assets/
    examples.json    # Example invocations
```

**Rationale**:
- Matches existing skill structure
- Provides comprehensive documentation
- Easy to customize after generation

**Alternatives considered**:
- Single SKILL.md only: Rejected (insufficient for complex categories)
- Inline in mcp-tools.json: Rejected (skills should be separate)

### Decision 4: Context7 Integration Approach

**Choice**: Optional fetch via `--fetch-rules` flag, user confirms before adding.

**Rationale**:
- Respects user control over what rules are added
- Doesn't require Context7 API key for basic usage
- Graceful degradation if Context7 unavailable

**Alternatives considered**:
- Auto-fetch always: Rejected (privacy concerns, API limits)
- No Context7 integration: Rejected (valuable rule source)

### Decision 5: Rule Display During Routing

**Choice**: Display rules as "Recommendations" section in routing response.

```
Routing to 'database' category...

Recommendations:
- Always inspect table structure before queries
- Use parameterized queries to prevent SQL injection

Executing: query tool...
```

**Rationale**:
- Non-blocking (rules are suggestions, not requirements)
- Visible to main agent for context
- Consistent with Context7's approach

**Alternatives considered**:
- Enforce rules as prerequisites: Rejected (too restrictive)
- Silent rules (only in skill docs): Rejected (not visible enough)

### Decision 6: Template Engine Approach

**Choice**: Use string templates with placeholders, processed by the agent.

**Rationale**:
- No runtime dependencies needed
- Agent can customize output intelligently
- Consistent with prompt-based implementation

**Alternatives considered**:
- Handlebars/Mustache: Rejected (adds dependency)
- Code-based generation: Rejected (complexity)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Generated skills may be low quality | Provide good templates; encourage customization |
| Context7 API may be unavailable | Graceful fallback; rules are optional |
| Rules may conflict with workflows | Document interaction; rules are recommendations |
| Too many rules may clutter output | Limit display to 3-5 most relevant |
| Users may over-rely on generation | Document that generated skills are starting points |

## Open Questions

1. **Should rules have priorities/weights?**
   - Leaning toward: No, keep simple like Context7

2. **Should we support rule inheritance (global → category)?**
   - Leaning toward: Yes, with global rules applying to all categories

3. **Should generated skills be editable via command?**
   - Leaning toward: No, use standard file editing

4. **Should we track which rules came from Context7?**
   - Leaning toward: Yes, for attribution and updates

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    /mcp-skill-generate                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Category   │───▶│   Template   │───▶│    Skill     │  │
│  │   Selector   │    │    Engine    │    │   Writer     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  mcp-tools   │    │   Context7   │    │   .opencode/ │  │
│  │    .json     │    │     API      │    │   skills/    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Data Flow:
1. User invokes /mcp-skill-generate --category X
2. Category Selector reads mcp-tools.json for tool metadata
3. Template Engine generates SKILL.md content
4. (Optional) Context7 API fetches library rules
5. Skill Writer creates directory structure
6. Rules stored in mcp-tools.json under "rules" key
```

## Implementation Phases

### Phase 1: Core Generation (v5.0.0-alpha)
- `/mcp-skill-generate --category X` command
- Basic SKILL.md generation from tool metadata
- Rules storage in mcp-tools.json

### Phase 2: Rules System (v5.0.0-beta)
- `--add-rule` and `--remove-rule` subcommands
- Rules display during routing
- Global rules support

### Phase 3: Context7 Integration (v5.0.0)
- `--fetch-rules` flag for Context7 lookup
- Rule attribution tracking
- Interactive mode with wizard
