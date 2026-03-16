---
name: deep-design
description: "MANDATORY for any non-trivial feature planning. Multi-agent pipeline: Metis (scope/risk) + Oracle (architecture) in parallel → synthesis → OpenSpec proposal → Momus review. MUST USE when: user describes a feature that touches multiple services or modules, user wants to plan/design/architect before coding, user says 'plan this', 'design this', 'think this through', 'spec this out', 'deep design', 'let me get this right', 'before we start coding', 'rethink how X works', 'migrate from X to Y', 'add multi-tenancy/billing/auth/permissions/real-time/encryption/caching', user describes any system that needs architectural decisions, user mentions wanting a proposal or spec, user wants to avoid mistakes on a complex feature. Also triggers on: 'plan out the migration', 'design a system for', 'I want to add [complex feature]... need to think through', 'this is a big change', 'let me get the design reviewed', 'before anyone writes code'. When in doubt about whether to use this skill, USE IT — it's better to over-plan than to start coding a complex feature without a reviewed design."
compatibility: "OpenCode"
metadata:
  version: "1.0.0"
---

# Deep Design Pipeline

## Overview

A 5-phase orchestration pipeline that turns a user's feature idea into a reviewed, implementation-ready OpenSpec proposal. The pipeline ensures nothing gets missed — hidden complexity is surfaced, architecture is validated, and the final proposal is stress-tested by an expert reviewer before a single line of code is written.

**Pipeline at a glance:**

```
User describes feature
        │
        ▼
┌───────────────────────────────┐
│  Phase 1: PARALLEL ANALYSIS   │
│                               │
│  ┌─────────┐   ┌──────────┐  │
│  │  Metis  │   │  Oracle  │  │
│  │ (scope, │   │ (arch,   │  │
│  │  risks, │   │  design, │  │
│  │ phases) │   │  MVA)    │  │
│  └────┬────┘   └────┬─────┘  │
│       └──────┬───────┘        │
└──────────────┼────────────────┘
               ▼
┌──────────────────────────────┐
│  Phase 2: SYNTHESIS          │
│  Merge insights, resolve     │
│  conflicts, produce refined  │
│  design brief                │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  Phase 3: OPENSPEC PROPOSAL  │
│  proposal.md, design.md,     │
│  specs/, tasks.md            │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  Phase 4: MOMUS REVIEW       │
│  Expert critique of the      │
│  proposal — gaps, risks,     │
│  missing scenarios           │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  Phase 5: DELIVER            │
│  Present proposal + review   │
│  to user for approval        │
└──────────────────────────────┘
```

**Cost note:** This pipeline fires three expensive agents (Metis, Oracle, Momus — all claude-opus-4-6-thinking). It is designed for non-trivial features where getting the design right matters more than speed. Every feature gets the full treatment.

---

## Input

The user provides a feature description. This can range from a single sentence ("add real-time collaboration") to a detailed brief. The skill works with whatever level of detail is given — Metis and Oracle will independently identify what's missing.

If the user's description is too vague to act on (e.g., "make it better"), ask ONE clarifying question before starting the pipeline. Otherwise, start immediately.

## Phase 1: Parallel Analysis (Metis + Oracle)

Fire both agents simultaneously using `run_in_background=true`. They analyze the same feature description independently — this diversity of perspective is the point.

### Metis Prompt

```
task(
  subagent_type="metis",
  run_in_background=true,
  load_skills=["nano-brain"],
  description="Deep design: Metis scope/risk analysis for [feature]",
  prompt="""
CONTEXT: The user wants to build: [paste user's feature description verbatim].
The codebase is at [project root]. Use nano-brain memory_query to check for
past decisions or context related to this feature area. If the codebase is not
accessible at the given path, work with the described tech stack — do not stall
on codebase discovery.

ROLE: You are a pre-planning consultant. Your job is to find what the user
hasn't thought of yet — the hidden complexities, the scope risks, the things
that will blow up at 2am if nobody plans for them.

ANALYZE AND RETURN:

1. HIDDEN COMPLEXITIES
   - What non-obvious technical challenges does this feature involve?
   - What edge cases will bite during implementation?
   - What existing systems will this interact with unexpectedly?

2. SCOPE RISKS
   - Where is scope likely to creep?
   - What looks simple but is actually hard?
   - What dependencies exist that could block progress?

3. PHASING ADVICE
   - What's the natural decomposition into phases?
   - What should be built first to de-risk the rest?
   - What can be deferred to a v2 without compromising v1?

4. MISSING REQUIREMENTS
   - What has the user not mentioned that they'll definitely need?
   - What error handling, edge cases, or failure modes are unaddressed?

5. QUESTIONS FOR THE USER
   - What critical decisions need user input before design can proceed?
   - List max 3-5 questions, ranked by impact.

FORMAT: Use clear headers and bullet points. Be specific to THIS feature
in THIS codebase — no generic advice.
"""
)
```

### Oracle Prompt

```
task(
  subagent_type="oracle",
  run_in_background=true,
  load_skills=["nano-brain"],
  description="Deep design: Oracle architecture validation for [feature]",
  prompt="""
CONTEXT: The user wants to build: [paste user's feature description verbatim].
The codebase is at [project root]. Use nano-brain memory_query and code_context
to understand existing architecture before making recommendations. If the
codebase is not accessible at the given path, work with the described tech
stack — do not stall on codebase discovery.

ROLE: You are a senior architect validating the design of this feature.
Your job is to ensure the architecture is sound, identify the minimum viable
approach, and answer the hard design questions before code is written.

ANALYZE AND RETURN:

1. ARCHITECTURE VALIDATION
   - Does this feature fit cleanly into the existing architecture?
   - What architectural patterns should it follow (based on what exists)?
   - Where are the integration points with existing systems?
   - Are there architectural anti-patterns to avoid?

2. DESIGN QUESTIONS & ANSWERS
   - What are the key design decisions for this feature?
   - For each decision, recommend an approach with reasoning.
   - Note where multiple valid approaches exist and which you'd pick.

3. MINIMUM VIABLE APPROACH (MVA)
   - What is the smallest version of this feature that delivers value?
   - What can be cut from v1 without losing the core value proposition?
   - What technical shortcuts are acceptable vs. which create tech debt?

4. SECURITY & PERFORMANCE CONSIDERATIONS
   - Any security implications? (auth, data exposure, injection risks)
   - Any performance concerns? (N+1 queries, memory, concurrency)
   - Any data integrity risks?

5. TECHNOLOGY RECOMMENDATIONS
   - Should this use existing libraries/tools or introduce new ones?
   - Are there proven patterns in the codebase to reuse?

FORMAT: Use clear headers and bullet points. Be specific to THIS feature
in THIS codebase. Recommend concrete approaches, not abstract principles.
"""
)
```

**After firing both:** Continue to Phase 2 when both complete. Do NOT proceed until you have both results — end your response and wait for the `<system-reminder>` notifications if needed.

## Phase 2: Synthesis

This phase is performed by you (the orchestrator), not a subagent. You have both Metis and Oracle results. Your job is to merge them into a single coherent design brief.

### How to Synthesize

1. **Identify agreements** — Where Metis and Oracle align, that's high-confidence. Note these as settled decisions.

2. **Resolve conflicts** — Where they disagree, use these heuristics:
   - **Architecture/technology choices** → Prefer Oracle (it's the architect)
   - **Scope risks and hidden complexity** → Prefer Metis (it's the risk analyst)
   - **Timeline/phasing** → Prefer Metis's caution over Oracle's optimism
   - **Security concerns** → Prefer whichever is MORE conservative
   - **If genuinely unclear** → Flag as open question for the user
   - **Document every conflict resolution** in a table (Topic / Metis Said / Oracle Said / Resolution) so the user can override your judgment

3. **Merge phasing + MVA** — Combine Metis's phasing advice with Oracle's MVA recommendation into a single implementation roadmap.

4. **Consolidate questions** — Deduplicate questions from both agents. If Metis and Oracle both flagged the same uncertainty, that's a critical question.

5. **Produce a Design Brief** — Write a structured summary (not a file yet — this feeds Phase 3):

```markdown
## Design Brief: [Feature Name]

### Settled Decisions
- [Decision 1]: [Approach] (agreed by both Metis and Oracle)
- [Decision 2]: ...

### Architecture Approach
[Oracle's recommended architecture, validated against Metis's complexity analysis]

### Implementation Phases
- **Phase 1 (MVP):** [What to build first — Oracle's MVA + Metis's de-risking order]
- **Phase 2:** [What comes next]
- **Phase 3 (if applicable):** [Deferred items]

### Key Risks & Mitigations
- [Risk from Metis] → [Mitigation from Oracle or your judgment]
- ...

### Open Questions for User
1. [Most impactful question]
2. ...

### Security & Performance Notes
[From Oracle's analysis]
```

**Present the Design Brief to the user.** Ask them to answer the open questions and confirm the approach before proceeding to Phase 3. Do NOT proceed to OpenSpec without user confirmation.

If the user has answers/feedback, incorporate them into the brief before moving on.

## Phase 3: OpenSpec Proposal

With the user-approved Design Brief in hand, create a formal OpenSpec change. Use the existing OpenSpec workflow — do not reinvent it.

### Steps

1. **Create the change:**
   ```bash
   openspec new change "<feature-name-kebab-case>"
   ```

2. **Get artifact status and instructions:**
   ```bash
   openspec status --change "<name>" --json
   ```

3. **Create artifacts in dependency order.** For each artifact:
   ```bash
   openspec instructions <artifact-id> --change "<name>" --json
   ```
   Use the template from instructions, but fill it with content from the Design Brief.

4. **Key artifact mapping from Design Brief:**

   | Design Brief Section | OpenSpec Artifact |
   |---------------------|-------------------|
   | Settled Decisions + Architecture Approach | `design.md` |
   | Implementation Phases | `tasks.md` (with checkboxes) |
   | The "why" + scope | `proposal.md` |
   | Security/Performance + Requirements | `specs/<capability>/spec.md` |
   | Key Risks & Mitigations | `design.md` (Risks section) |

5. **Validate the proposal:**
   ```bash
   openspec validate "<name>" --strict --no-interactive
   ```
   Fix any validation errors before proceeding.

### Writing Guidelines

- **proposal.md**: Focus on WHY this feature exists and WHAT changes. Pull from the user's original description + Metis's scope analysis.
- **design.md**: Capture Oracle's architecture recommendations, the settled decisions, and risk mitigations. This is the technical "how."
- **tasks.md**: Break implementation phases into concrete checkboxed tasks. Use Metis's phasing advice for ordering. Each task should be independently completable.
- **specs/**: Write formal requirements with scenarios (WHEN/THEN format). Cover the happy path, error cases, and edge cases that Metis identified.

After all artifacts are created and validated, proceed to Phase 4.

## Phase 4: Momus Review

Fire Momus to stress-test the proposal. Momus is an expert reviewer — it will find gaps, ambiguities, and missing scenarios that slipped through.

### Momus Prompt

```
task(
  subagent_type="momus",
  load_skills=["nano-brain"],
  description="Deep design: Momus review of [feature] proposal",
  prompt="""
CONTEXT: We've completed a multi-agent planning pipeline for a new feature.
The OpenSpec proposal is at: openspec/changes/<name>/

ARTIFACTS TO REVIEW:
- proposal.md: [paste path]
- design.md: [paste path]
- tasks.md: [paste path]
- specs/: [paste path(s)]

Read ALL artifacts before reviewing.

ROLE: You are an expert reviewer evaluating this proposal for implementation
readiness. Your job is to find what's missing, what's ambiguous, and what
will cause problems during implementation.

REVIEW CRITERIA:

1. COMPLETENESS
   - Are all requirements covered by specs with scenarios?
   - Are error cases and edge cases addressed?
   - Are there implicit assumptions that should be explicit?
   - Is anything mentioned in the proposal but missing from tasks?

2. CLARITY
   - Can a developer pick up tasks.md and start working without asking questions?
   - Are design decisions in design.md clear and well-reasoned?
   - Are spec scenarios specific enough to be testable?

3. VERIFIABILITY
   - Can each requirement be verified (tested/checked)?
   - Are acceptance criteria clear for each task?
   - Are there measurable success criteria?

4. RISKS & GAPS
   - What failure modes are unaddressed?
   - What happens if a dependency is unavailable?
   - Are there race conditions, data consistency issues, or security gaps?
   - Is the task ordering correct? Are there hidden dependencies between tasks?

5. SCOPE ASSESSMENT
   - Is the scope appropriate for the stated goals?
   - Is anything over-engineered for v1?
   - Is anything under-specified that will cause scope creep?

OUTPUT FORMAT:

## Review Summary
[1-2 sentence overall assessment: ready / needs work / major concerns]

## Critical Issues (must fix before implementation)
- [Issue]: [Why it matters] → [Suggested fix]

## Recommendations (should fix)
- [Issue]: [Why it matters] → [Suggested fix]

## Minor Notes (nice to have)
- [Observation]

## Verdict
[APPROVED / APPROVED WITH CONDITIONS / NEEDS REVISION]
[If needs revision, list the specific items that must be addressed]
"""
)
```

**After Momus completes:**

- If **APPROVED**: Proceed to Phase 5.
- If **APPROVED WITH CONDITIONS**: Apply the fixes to the OpenSpec artifacts, then proceed to Phase 5. No need to re-run Momus unless the fixes are substantial.
- If **NEEDS REVISION**: Apply the critical fixes, re-validate with `openspec validate`, and present the updated proposal to the user. Ask if they want to re-run Momus or proceed.

## Phase 5: Deliver to User

Present the final result to the user. This is the handoff — they decide what happens next.

### What to Present

```markdown
## Deep Design Complete: [Feature Name]

### Pipeline Summary
- ✅ Metis: Identified [N] hidden complexities, [N] scope risks
- ✅ Oracle: Validated architecture, recommended [approach]
- ✅ Synthesis: Resolved [N] conflicts, produced design brief
- ✅ OpenSpec: Created proposal at `openspec/changes/<name>/`
- ✅ Momus: [APPROVED / APPROVED WITH CONDITIONS]

### Proposal Location
`openspec/changes/<name>/`
- `proposal.md` — Why and what
- `design.md` — Architecture and decisions
- `tasks.md` — Implementation checklist ([N] tasks across [N] phases)
- `specs/` — Formal requirements with scenarios

### Momus Review Highlights
[Top 2-3 findings from Momus, if any]

### Next Steps
- **To implement:** `/opsx-apply <name>` or ask me to start implementation
- **To modify:** Edit any artifact directly or ask me to adjust
- **To explore further:** `/opsx-explore <name>` to think through specific aspects
```

---

## Guardrails

- **Never skip a phase.** Every feature gets the full pipeline.
- **Never proceed past Phase 2 without user confirmation.** The Design Brief is a checkpoint.
- **Never auto-implement.** This skill produces a reviewed proposal — implementation is a separate decision.
- **Always validate OpenSpec artifacts** before running Momus. Don't waste an expensive review on invalid specs.
- **Always use `load_skills=["nano-brain"]`** when firing Metis, Oracle, and Momus so they can access project memory and code intelligence.
- **Always collect all background results** before synthesizing. Never synthesize with partial data.
