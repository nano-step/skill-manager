# RRI-T Memory Protocol

## Purpose

This protocol defines how RRI-T testing sessions persist state to nano-brain for cross-session continuity. Every phase saves its outputs, enabling resume from any point and cross-feature learning.

## Save Format

### Tag Convention

```
rri-t/{feature-slug}/{phase}
```

Examples:
- `rri-t/checkout-flow/assess`
- `rri-t/user-registration/discover`
- `rri-t/inventory-sync/execute`

### Content Structure

```markdown
## RRI-T {Phase} Complete: {Feature}

- **Phase:** {0-5}
- **Date:** {ISO-8601}
- **Status:** COMPLETE / PARTIAL / BLOCKED
- **Tier:** Full / Standard / Minimal
- **Risk Score:** {1-9}

### Key Outputs
{phase-specific data}

### Decisions Made
{rationale for key decisions}

### Next Phase
{what the next phase needs from this phase}

### Risks Identified
{new or updated risks}
```

---

## Phase-Specific Outputs

### Phase 0: ASSESS

Save after completing testability gate and risk assessment.

```markdown
### Key Outputs
- Testability: {count}/5 prerequisites, {count}/5 testability criteria
- Risk Score: {P} x {I} = {score} ({level})
- Category: {CODE}
- Tier: {Full/Standard/Minimal}
- Decision: {PROCEED/CONCERNS/BLOCK}

### Decisions Made
- Selected {tier} tier because {rationale}
- Primary risk category is {CODE} because {rationale}

### Next Phase
- Personas to assign: {count}
- Dimensions to cover: {count}
- Blockers to address: {list or "none"}

### Risks Identified
- R-001: {description} (Score: {score})
- R-002: {description} (Score: {score})
```

### Phase 1: PREPARE

Save after defining scope and assignments.

```markdown
### Key Outputs
- Personas: {list of assigned personas}
- Dimensions: {list of selected dimensions}
- Coverage targets: P0={pct}%, P1={pct}%, Overall={pct}%

### Decisions Made
- Excluded {persona/dimension} because {rationale}
- Prioritized {dimension} because {rationale}

### Next Phase
- Interview {count} personas
- Focus on {key areas}
```

### Phase 2: DISCOVER

Save after completing persona interviews.

```markdown
### Key Outputs
- Questions generated: {count}
- Test ideas: {count}
- Key concerns: {list}

### Decisions Made
- Prioritized {concern} because {rationale}
- Deprioritized {area} because {rationale}

### Next Phase
- Create {count} test cases
- Focus stress axes: {list}

### Risks Identified
- R-003: {new risk from interviews}
```

### Phase 3: STRUCTURE

Save after creating test cases and traceability.

```markdown
### Key Outputs
- Test cases: {count} (P0: {n}, P1: {n}, P2: {n}, P3: {n})
- Traceability: {count} requirements mapped
- Coverage gaps: {count}
- Stress axes selected: {list}

### Decisions Made
- Prioritized {test case} because {rationale}
- Deferred {test case} because {rationale}

### Next Phase
- Execute {count} test cases
- Focus on {priority areas}
```

### Phase 4: EXECUTE

Save after executing tests and calculating quality score.

```markdown
### Key Outputs
- Results: PASS={n}, FAIL={n}, PAINFUL={n}, MISSING={n}
- Quality Score: {score} (Grade: {grade})
- Bugs found: {count}
- Evidence captured: {count} screenshots, {count} logs

### Decisions Made
- Marked {test} as PAINFUL because {rationale}
- Skipped {test} because {rationale}

### Next Phase
- Analyze {count} results
- Address {count} failures
- Fill coverage dashboard

### Risks Identified
- R-004: {new risk from execution}
```

### Phase 5: ANALYZE

Save after completing analysis and gate decision.

```markdown
### Key Outputs
- Gate Decision: {PASS/CONCERNS/FAIL/WAIVED}
- Coverage: P0={pct}%, P1={pct}%, Overall={pct}%
- Dimensions passing: {count}/7
- Waivers: {count}

### Decisions Made
- Gate decision is {decision} because {rationale}
- Waived {item} because {rationale}

### Lessons Learned
- {lesson 1}
- {lesson 2}

### Reusable Patterns
- {pattern for future features}
```

---

## Resume Protocol

When resuming an interrupted session:

1. **Query memory:**
   ```
   memory_query("rri-t {feature-name}")
   ```

2. **Find latest completed phase:**
   Look for most recent phase with Status: COMPLETE

3. **Load outputs as context:**
   Read Key Outputs and Next Phase sections

4. **Continue from next phase:**
   Start the phase indicated in Next Phase

---

## Cross-Feature Learning

Save reusable patterns for future features:

### Tag Convention

```
rri-t/patterns/{category}
```

Examples:
- `rri-t/patterns/auth-testing`
- `rri-t/patterns/offline-sync`
- `rri-t/patterns/vietnamese-locale`

### Content Structure

```markdown
## RRI-T Pattern: {Pattern Name}

- **Category:** {category}
- **Discovered:** {date}
- **Source Feature:** {feature-name}

### Pattern
{description of reusable approach}

### When to Apply
{conditions when this pattern is useful}

### Example
{concrete example from source feature}
```

---

## Example: Phase 0 ASSESS Memory Save

```
memory_write("## RRI-T ASSESS Complete: checkout-flow

- **Phase:** 0
- **Date:** 2025-03-08T10:30:00Z
- **Status:** COMPLETE
- **Tier:** Full
- **Risk Score:** 6

### Key Outputs
- Testability: 5/5 prerequisites, 4/5 testability criteria
- Risk Score: 2 x 3 = 6 (HIGH)
- Category: DATA
- Tier: Full
- Decision: PROCEED

### Decisions Made
- Selected Full tier because risk score 6 requires comprehensive coverage
- Primary risk category is DATA because checkout involves payment transactions

### Next Phase
- Personas to assign: 5 (all)
- Dimensions to cover: 7 (all)
- Blockers to address: none

### Risks Identified
- R-001: Payment state inconsistent on network failure (Score: 6)
- R-002: Cart not cleared after successful checkout (Score: 4)
")
```
