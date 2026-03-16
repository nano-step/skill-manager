# PR Code Reviewer - Research & Design Decisions

## Why This Architecture?

| Decision | Research Source | Rationale |
|----------|-----------------|-----------|
| Orchestrator < 3000 tokens | AI tool comparison | Most tools bloat context with full file reads |
| Path-based categorization | Google CODEOWNERS | Proven at scale, no code parsing needed |
| Parallel subagents | Meta's review speed research | P75 review time correlates with satisfaction |
| Devil's Advocate verification | Senior reviewer practices | Reduces false positives significantly |
| Cross-repo awareness | Microservices research | Breaking changes are #1 cause of outages |
| Historical context check | Google Critique | "Why was this written?" prevents bad flags |

## What We Learned from PR #3108 and PR #3088

The `rootState.currency` bug taught us:

1. **State migrations are invisible**: Pinia stores don't appear in Vuex's rootState
2. **Reverts compound problems**: Double-revert brought back broken state
3. **AI misses cross-store dependencies**: Need explicit migration checklist
4. **Pattern matching isn't enough**: Must trace actual execution paths

### PR #3088 Post-Mortem (v5.1 trigger)

The v5.0 skill had the RIGHT instructions but WRONG enforcement:
- Instructions said "search for rootState.{storeName}" 
- But subagent only reviewed PR files, not entire codebase
- `store/inventory.js` (NOT in PR) still used `rootState.currency`
- Bug was missed because consumer search was ADVISORY, not MANDATORY

**Root Cause**: Subagents only read assigned files. Consumer search requires searching ENTIRE codebase.

**Fix (v5.1)**: 
- Phase 1.5: Detect breaking change signals from file paths
- Mandatory consumer search with EXACT grep commands
- Required output format for verification
- Orchestrator verification that search was performed

## Comparison: Our Approach vs Industry

| Aspect | Google | Meta | AI Tools | Our v5.1 |
|--------|--------|------|----------|----------|
| Token efficiency | N/A | N/A | Poor | ✅ Excellent |
| Cross-repo | Glean indexing | Monorepo | Limited | ✅ Manual check |
| Speed | Hours | Minutes | Seconds | Minutes |
| False positives | Low | Low | High | Medium (Devil's Advocate) |
| Context awareness | Deep | Deep | Shallow | Medium (repo rules) |
| Breaking changes | Manual | Automated | Limited | ✅ Mandatory search |

## Future Enhancements (v6.0 Candidates)

1. **Automated contract testing**: Integrate Pact-style consumer checks
2. **Review metrics**: Track time-to-review, false positive rate
3. **Stacked diff support**: Review incremental changes like Meta
4. **Git blame integration**: Automatic historical context lookup
5. **Cross-repo dependency graph**: Visualize service dependencies

## Full Research

See `.opencode/research/code-review-research-synthesis.md` for complete analysis.
