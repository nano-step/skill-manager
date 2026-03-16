<!-- OPENCODE-MEMORY:START -->
<!-- Managed block - do not edit manually. Updated by: npx nano-brain init -->

## Memory System (nano-brain)

This project uses **nano-brain** for persistent context across sessions.

### Quick Reference

nano-brain supports two access methods. Try MCP first; if unavailable, use CLI.

| I want to... | MCP Tool | CLI Fallback |
|--------------|----------|--------------|
| Recall past work on a topic | `memory_query("topic")` | `npx nano-brain query "topic"` |
| Find exact error/function name | `memory_search("exact term")` | `npx nano-brain query "exact term"` |
| Explore a concept semantically | `memory_vsearch("concept")` | `npx nano-brain query "concept"` |
| Save a decision for future sessions | `memory_write("decision context")` | Create file in `~/.nano-brain/memory/` |
| Check index health | `memory_status` | `npx nano-brain status` |

### Session Workflow

**End of session:** Save key decisions, patterns discovered, and debugging insights.
```
# MCP (if available):
memory_write("## Summary\n- Decision: ...\n- Why: ...\n- Files: ...")

# CLI fallback: create a markdown file
# File: ~/.nano-brain/memory/YYYY-MM-DD-summary.md
```

### Code Intelligence Tools

nano-brain also provides symbol-level code analysis (requires `memory_index_codebase` first):

| I want to... | MCP Tool |
|--------------|----------|
| Understand a symbol's callers/callees/flows | `code_context(name="functionName")` |
| Assess risk of changing a symbol | `code_impact(target="className", direction="upstream")` |
| Map my git changes to affected symbols | `code_detect_changes(scope="all")` |

Use `file_path` parameter to disambiguate when multiple symbols share the same name.

### When to Search Memory vs Codebase vs Code Intelligence

- **"Have we done this before?"** → `memory_query` or `npx nano-brain query` (searches past sessions)
- **"Where is this in the code?"** → grep / ast-grep (searches current files)
- **"How does this concept work here?"** → Both (memory for past context + grep for current code)
- **"What calls this function?"** → `code_context` (symbol graph relationships)
- **"What breaks if I change X?"** → `code_impact` (dependency + flow analysis)
- **"What did my changes affect?"** → `code_detect_changes` (git diff to symbol mapping)

<!-- OPENCODE-MEMORY:END -->
