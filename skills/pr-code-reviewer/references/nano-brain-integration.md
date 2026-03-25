# nano-brain Integration

nano-brain provides persistent memory across sessions. The reviewer uses it for historical context about changed files:
- Past review findings and architectural decisions
- Known issues and tech debt in affected modules
- Prior discussions about the same code areas

## Access Method: HTTP API

All nano-brain operations use HTTP API (nano-brain runs as Docker service on port 3100):

| Need | Command |
|------|---------|
| Hybrid search (best quality) | `curl -s localhost:3100/api/query -d '{"query":"search terms"}'` |
| Keyword search (function name, error) | `curl -s localhost:3100/api/search -d '{"query":"exact term"}'` |
| Save review findings | `curl -s localhost:3100/api/write -d '{"content":"...","tags":"review"}'` |

## Phase 1 Memory Queries

For each significantly changed file/module:
- **Hybrid search**: `curl -s localhost:3100/api/query -d '{"query":"<module-name>"}'` (best quality, combines BM25 + vector + reranking)
- **Scoped search**: `curl -s localhost:3100/api/query -d '{"query":"<function-name>","collection":"codebase"}'` for code-specific results

Specific queries:
- Past review findings: `curl -s localhost:3100/api/query -d '{"query":"review <module-name>"}'`
- Architectural decisions: `curl -s localhost:3100/api/query -d '{"query":"<module-name> architecture design decision"}'`
- Known issues: `curl -s localhost:3100/api/query -d '{"query":"<function-name> bug issue regression"}'`

Collect relevant memory hits as `projectMemory` context for subagents.

## Phase 2 Memory Queries (LOGIC changes)

Query nano-brain for known issues:
```bash
curl -s localhost:3100/api/query -d '{"query":"<function-name> bug issue edge case regression"}'
```

## Phase 5.5: Save Review to nano-brain

After generating the report, save key findings for future sessions:

```bash
curl -s localhost:3100/api/write -d '{"content":"## Code Review: PR #<number> - <title>\nDate: <date>\nFiles: <changed_files>\n\n### Key Findings\n<critical_issues_summary>\n<warnings_summary>\n\n### Decisions\n<architectural_decisions_noted>\n\n### Recommendation: <APPROVE|REQUEST_CHANGES|COMMENT>","tags":"review,pr-<number>"}'
```

This ensures future reviews can reference past findings on the same codebase areas.
