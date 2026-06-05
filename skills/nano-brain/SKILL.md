---
name: nano-brain
description: >
  Persistent memory + code intelligence for AI coding agents. Guides effective
  use of nano-brain MCP tools — when to query vs grep, what's worth persisting,
  how to structure lessons and decisions for future retrieval, impact/dependency
  analysis before refactors, and cross-session context retrieval. Use this skill
  whenever you need to: recall past decisions or context from prior sessions,
  save non-obvious debugging insights or architectural decisions, assess
  refactoring risk via impact analysis or call chain tracing, catch up on work
  someone else started, get a session-start briefing on current project state,
  check if an approach was tried before and abandoned, find what functions call
  or depend on a symbol, or decide whether something belongs in memory vs code
  comments. Also triggers on: "have we done this before?", "what did we decide
  about X?", "what breaks if I change Y?", "what calls this function?", "who
  depends on this?", "save this for later", "don't forget this", "get me up to
  speed", "where did we leave off?", "morning briefing", "session start", or
  any cross-session knowledge need. Even if unsure whether relevant memory
  exists, query first — it costs ~200 tokens and often prevents hours of
  redundant rediscovery.
compatibility: OpenCode, Claude Code, any MCP-aware agent
metadata:
  author: nano-step
  version: 5.0.0
  upstream: https://github.com/nano-step/nano-brain
---

# nano-brain — Memory Judgment Guide

This skill teaches you **when and how** to use nano-brain well — the judgment calls that separate useful memory from noise. Tool schemas and connection details live in AGENTS.md and `@references/`.

## The Iron Law

**QUERY BEFORE BELIEVING YOU KNOW.**

If you haven't called `memory_query` before starting work, you're blind to prior context. Even if "sure" something hasn't been done before — verify. Cost: ~200 tokens. Saves: hours of redundant work or contradicting prior decisions.

## Quick Decision Tree

```
WHAT DO YOU NEED?
│
├─ "Have we done X before?" / "What was decided?"
│  └─ memory_query(query="<topic>")
│
├─ "What breaks if I change X?"
│  └─ memory_impact(node="<file>::<Symbol>", max_depth=2)
│
├─ "Who calls this function?" / "What does this call?"
│  └─ memory_graph(node="<file>::<Symbol>", direction="in"|"out")
│
├─ "Trace the full call chain from this entry point"
│  └─ memory_trace(node="<file>::<Symbol>")
│
├─ "Find exact error/function name in past sessions"
│  └─ memory_search(query="<exact string>")
│
├─ "Fuzzy concept — can't remember exact words"
│  └─ memory_vsearch(query="<describe the concept>")
│
├─ "Starting fresh — brief me"
│  └─ memory_wake_up(workspace=<ws>, limit=8)
│
└─ "I need CURRENT source code / type info"
   └─ DON'T use memory. Use grep / LSP / read instead.
```

## Session Discipline (do this every time)

```
START:  memory_wake_up → memory_query("<today's task>")
END:    memory_write(decisions, lessons, gotchas)
```

Most agents fail at END. The heuristic: **if you spent >30min on something, or the fix surprised you, or grep wouldn't find the cause — save it.**

## What's Worth Saving

| Category | Save when... | Example |
|---|---|---|
| **Decisions** | You chose between options and might forget why | "Chose RRF k=60 — k=30 had poor recall on multi-word queries" |
| **Bug fixes** | Debugging took >30min OR root cause was non-obvious | "Race condition: worker used background ctx instead of parent" |
| **Abandoned approaches** | You tried something and it failed — prevents retry | "Redis caching for embeddings: latency worse due to serialization" |
| **Gotchas** | Unexpected behavior that isn't documented anywhere | "pgvector HNSW needs 100+ rows before index activates" |
| **Constraints** | Non-obvious system interactions | "Can't use pgbouncer transaction mode + prepared statements" |

**DON'T save:** file contents (watcher does this), trivial facts in code comments, temporary debug observations, things that'll change next sprint.

### Structuring saved content

```
memory_write(
  workspace=<ws>,
  content="## Decision: [clear title]\n\n**Context:** ...\n**Choice:** ...\n**Why:** [MOST IMPORTANT]\n**Trade-off:** ...\n**Files:** ...",
  tags=["decision", "<area>"],
  source_path="memory://decisions/<slug>"  // enables idempotent upsert
)
```

### Tag conventions

Before tagging, call `memory_tags(workspace)` to check existing conventions.

- **Category** (pick one): `decision`, `lesson`, `bug`, `gotcha`, `abandoned`, `summary`
- **Area** (pick one+): project-specific, e.g. `auth`, `search`, `embed`, `api`, `config`
- Adopt majority conventions from `memory_tags` — don't introduce "authentication" if "auth" already has 20 docs

### Checklist: after memory_write

- [ ] Tags include category AND area
- [ ] Content has clear **Why** (not just "chose X")
- [ ] If reversing prior decision: added `supersedes="#<old-uuid>"`
- [ ] Verifiable: `memory_search(query="<key phrase>")` finds it (BM25 works instantly)

## Updating and Superseding

| Situation | Action |
|---|---|
| Decision reversed | New doc with `supersedes="#<old-uuid>"` |
| Living doc evolves | Same `source_path` → auto-upsert |
| Old info is wrong | Supersede it — don't leave contradictions |
| Supersede chain >3 deep | Consolidate into single "History" doc |

## Code Intelligence

```
memory_impact(node="path/file.go::Symbol", max_depth=2)
```

| Impacted count | Risk | Action |
|---|---|---|
| 0-3 | Low | Proceed |
| 4-10 | Medium | Review each dependent before changing |
| 10+ | High | Incremental approach, consult first |

**Read the impacted nodes, not just count.** 10 trivial callers ≠ 10 critical paths.

**Path format:** `"<relative-or-absolute-path>"` or `"<path>::<SymbolName>"`. Both relative and absolute paths work (resolved server-side). Use `paths="relative"` in output to save tokens.

## Failure Recovery

### Zero results but you know something exists

1. Check workspace: `memory_workspaces_resolve(path="...")` — is hash correct?
2. Check queue: `memory_status()` → if `queue_pending > 0`, embeddings not done yet
3. Try BM25: `memory_search` works instantly (no embedding needed)
4. Broaden query: remove specifics, try alternate terminology
5. Check tags: your filter might be excluding results

### Just saved but can't find it

**Expected.** New docs are BM25-searchable immediately but vector-searchable only after embedding (5-30s delay).
- For instant verification: `memory_get(path="#<id-from-write-response>")`
- For searching just-saved content: use `memory_search` (BM25), not `memory_vsearch`

### Conflicting memories found

Two contradictory decisions in results? Sort by `updated_at` — latest wins. Check if newer doc has `supersedes` field. If neither supersedes the other, flag to user.

## Multi-Agent Coordination

When multiple agents share a workspace:

- **Last-write-wins** for same `source_path` — use unique paths for parallel work
- **Tag consistency:** All agents should call `memory_tags` before tagging to match conventions
- **Pass workspace hash explicitly** in delegation prompts — subagents can't resolve paths
- **Include `load_skills=["nano-brain"]`** so subagents have access
- **Pre-query and include results** in delegation context — saves subagent from re-querying

## Skill Interactions

| Working with... | nano-brain adds... |
|---|---|
| **systematic-debugging** | Before debugging: `memory_search("<error msg>", tags=["bug"])`. After fix: `memory_write` with tag `bug` |
| **deep-design** | After design accepted: `memory_write` key trade-offs with tag `decision` |
| **code-review** | During review: query for "did we decide against this pattern?" |
| **git-commit** | After architectural commits: persist the WHY (commit msg is WHERE, memory is WHY) |
| **feature-analysis** | Before analysis: query for prior analysis/context on this module |

## ESPECIALLY Use When

- You think "I'm sure this hasn't been tried before" — verify that assumption
- Refactoring shared code — always `memory_impact` first
- Working in unfamiliar territory — 5min wake_up saves hours
- Making an architectural decision — check if reversible or if someone tried already
- Picking up someone else's work — query their session context

## References (load on demand)

- `@references/mcp-schemas.md` — full input/output schemas for all 14 MCP tools
- `@references/time-filters.md` — time-range filter formats, pagination, cursor mechanics
- `@references/troubleshooting.md` — connection errors, daemon health, common issues
