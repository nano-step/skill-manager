# RRI-T Testability Gate

**Feature:** {feature-name}
**Date:** {YYYY-MM-DD}
**Assessor:** {agent/person}
**Build:** {build-id}
**Environment:** {dev/staging/prod}

## Prerequisites Validation

| # | Prerequisite | Status | Notes |
|---|--------------|--------|-------|
| PRE-1 | Environment accessible | PASS / FAIL | |
| PRE-2 | Test data available | PASS / FAIL | |
| PRE-3 | Feature deployed | PASS / FAIL | |
| PRE-4 | Acceptance criteria exist | PASS / FAIL | |
| PRE-5 | No blockers from dev | PASS / FAIL | |

**Prerequisites Result:** {count}/5 PASS

---

## Testability Assessment

| # | Testability Criteria | Status | Notes |
|---|---------------------|--------|-------|
| TEST-1 | Semantic locators present (data-testid, aria-label) | PASS / PARTIAL / FAIL | |
| TEST-2 | API endpoints documented | PASS / PARTIAL / FAIL | |
| TEST-3 | Auth flows accessible | PASS / PARTIAL / FAIL | |
| TEST-4 | Error states reproducible | PASS / PARTIAL / FAIL | |
| TEST-5 | Performance baselines available | PASS / PARTIAL / FAIL | |

**Testability Result:** {count}/5 PASS

---

## Risk Assessment

### Probability (1-3)

| Score | Definition |
|-------|------------|
| 1 | Unlikely - well-tested area, minor change |
| 2 | Possible - moderate complexity, some unknowns |
| 3 | Likely - new area, high complexity, many dependencies |

**Probability Score:** {1-3}
**Rationale:** {why this score}

### Impact (1-3)

| Score | Definition |
|-------|------------|
| 1 | Low - cosmetic, workaround exists |
| 2 | Medium - feature degraded, user friction |
| 3 | High - data loss, security breach, revenue impact |

**Impact Score:** {1-3}
**Rationale:** {why this score}

### Risk Score Calculation

**Risk Score = Probability x Impact = {P} x {I} = {score}**

| Score Range | Risk Level | Tier |
|-------------|------------|------|
| 1-2 | LOW | Minimal |
| 3-5 | MEDIUM | Standard |
| 6-8 | HIGH | Full |
| 9 | CRITICAL | Full + blocks release if untested |

---

## Category Classification

| Category | Code | Applies |
|----------|------|---------|
| Technical (architecture/integration) | TECH | Y / N |
| Security (vulnerabilities) | SEC | Y / N |
| Performance (scalability) | PERF | Y / N |
| Data (integrity/corruption) | DATA | Y / N |
| Business (logic errors) | BUS | Y / N |
| Operational (deployment) | OPS | Y / N |

**Primary Category:** {CODE}
**Secondary Categories:** {CODE, CODE}

---

## Tier Selection

Based on Risk Score: {score}

| Selected | Tier | Personas | Dimensions | Stress Axes |
|----------|------|----------|------------|-------------|
| [ ] | Full | 5 | 7 | 8 |
| [ ] | Standard | 3 | 4 | 4 |
| [ ] | Minimal | 1 | 2 | 2 |

**Selected Tier:** {tier}

---

## Decision

| Decision | Criteria |
|----------|----------|
| PROCEED | All prerequisites PASS, testability >= 3/5 PASS |
| CONCERNS | 1-2 prerequisites FAIL or testability 2/5 PASS |
| BLOCK | >= 3 prerequisites FAIL or testability < 2/5 PASS |

**Decision:** PROCEED / CONCERNS / BLOCK

### Action Items (if CONCERNS or BLOCK)

| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Summary

- **Feature:** {feature-name}
- **Risk Score:** {score} ({level})
- **Category:** {CODE}
- **Tier:** {tier}
- **Decision:** {decision}
- **Next Phase:** {PREPARE / address blockers}
