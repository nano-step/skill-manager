# nano-brain Integration

nano-brain provides persistent memory across sessions. The reviewer uses it for historical context about changed files:
- Past review findings and architectural decisions
- Known issues and tech debt in affected modules
- Prior discussions about the same code areas

## Access Method: CLI

All nano-brain operations use the CLI via Bash tool:

| Need | CLI Command |
|------|-------------|
| Hybrid search (best quality) | `npx nano-brain query "search terms"` |
| Keyword search (function name, error) | `npx nano-brain query "exact term" -c codebase` |
| Save review findings | `npx nano-brain write "content" --tags=review` |

## Setup

Run `/nano-brain-init` in the workspace, or `npx nano-brain init --root=/path/to/workspace`.

## Phase 1 Memory Queries

For each significantly changed file/module:
- **Hybrid search**: `npx nano-brain query "<module-name>"` (best quality, combines BM25 + vector + reranking)
- **Scoped search**: `npx nano-brain query "<function-name>" -c codebase` for code-specific results

Specific queries:
- Past review findings: `npx nano-brain query "review <module-name>"`
- Architectural decisions: `npx nano-brain query "<module-name> architecture design decision"`
- Known issues: `npx nano-brain query "<function-name> bug issue regression"`

Collect relevant memory hits as `projectMemory` context for subagents.

## Phase 2 Memory Queries (LOGIC changes)

Query nano-brain for known issues:
```bash
npx nano-brain query "<function-name> bug issue edge case regression"
```

## Phase 5.5: Save Review to nano-brain

After generating the report, save key findings for future sessions:

```bash
npx nano-brain write "## Code Review: PR #<number> - <title>
Date: <date>
Files: <changed_files>

### Key Findings
<critical_issues_summary>
<warnings_summary>

### Decisions
<architectural_decisions_noted>

### Recommendation: <APPROVE|REQUEST_CHANGES|COMMENT>" --tags=review,pr-<number>
```

This ensures future reviews can reference past findings on the same codebase areas.
