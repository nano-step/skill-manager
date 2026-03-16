# RRI-T Quality Scorecard

**Feature:** {feature-name}
**Date:** {YYYY-MM-DD}
**Assessor:** {agent/person}

## Score Calculation

### Starting Score: 100

---

## Violations

### Critical Violations (-10 each)

| ID | Violation | Description | Present | Penalty |
|----|-----------|-------------|---------|---------|
| CRIT-1 | Hard waits | Using sleep/wait instead of proper assertions | Y / N | -10 |
| CRIT-2 | Missing assertions | Test has no verification of expected outcome | Y / N | -10 |
| CRIT-3 | CSS selectors | Using fragile CSS selectors instead of semantic locators | Y / N | -10 |
| CRIT-4 | Conditional flow | Using if/else in test logic (non-deterministic) | Y / N | -10 |

**Critical Subtotal:** -{count} x 10 = -{total}

### High Violations (-5 each)

| ID | Violation | Description | Present | Penalty |
|----|-----------|-------------|---------|---------|
| HIGH-1 | No isolation | Tests share state or depend on execution order | Y / N | -5 |
| HIGH-2 | Duplicate setup | Same setup code repeated across tests | Y / N | -5 |
| HIGH-3 | Flaky test | Test fails intermittently without code changes | Y / N | -5 |
| HIGH-4 | Missing error coverage | No tests for error/edge cases | Y / N | -5 |

**High Subtotal:** -{count} x 5 = -{total}

### Medium Violations (-2 each)

| ID | Violation | Description | Present | Penalty |
|----|-----------|-------------|---------|---------|
| MED-1 | Vague names | Test names do not describe what is being tested | Y / N | -2 |
| MED-2 | File > 300 lines | Test file exceeds 300 lines | Y / N | -2 |
| MED-3 | Test > 90s | Individual test takes longer than 90 seconds | Y / N | -2 |
| MED-4 | No test ID | Test cases lack unique identifiers | Y / N | -2 |

**Medium Subtotal:** -{count} x 2 = -{total}

### Low Violations (-1 each)

| ID | Violation | Description | Present | Penalty |
|----|-----------|-------------|---------|---------|
| LOW-1 | Style inconsistency | Inconsistent naming, formatting, or structure | Y / N | -1 |
| LOW-2 | Missing comment | Complex logic without explanatory comment | Y / N | -1 |

**Low Subtotal:** -{count} x 1 = -{total}

---

## Violation Tracking

| ID | Description | Severity | Penalty | File/Line |
|----|-------------|----------|---------|-----------|
| V-001 | | CRIT / HIGH / MED / LOW | | |
| V-002 | | | | |
| V-003 | | | | |
| V-004 | | | | |
| V-005 | | | | |

**Total Penalties:** -{total}

---

## Bonuses (+5 each, max +30)

| ID | Criteria | Description | Present | Points |
|----|----------|-------------|---------|--------|
| BON-1 | Semantic locators | Uses data-testid, aria-label, role selectors | Y / N | +5 |
| BON-2 | Data factories | Uses factories/fixtures for test data | Y / N | +5 |
| BON-3 | Network-first | Mocks/intercepts network for determinism | Y / N | +5 |
| BON-4 | Isolation | Each test is fully independent | Y / N | +5 |
| BON-5 | Test IDs | All test cases have unique TC-XXX identifiers | Y / N | +5 |
| BON-6 | BDD style | Uses Given/When/Then or similar structure | Y / N | +5 |

**Total Bonuses:** +{total} (capped at +30)

---

## Final Score Calculation

| Component | Value |
|-----------|-------|
| Starting Score | 100 |
| Critical Penalties | -{total} |
| High Penalties | -{total} |
| Medium Penalties | -{total} |
| Low Penalties | -{total} |
| Bonuses | +{total} |
| **Final Score** | **{score}** |

---

## Grade

| Grade | Score Range | Description |
|-------|-------------|-------------|
| A+ | 90-100+ | Excellent - production ready |
| A | 80-89 | Good - minor improvements suggested |
| B | 70-79 | Acceptable - improvements needed |
| C | 60-69 | Below standard - significant issues |
| F | < 60 | Failing - major rework required |

**Final Grade:** {grade}

---

## Recommendations

| Priority | Recommendation |
|----------|----------------|
| 1 | |
| 2 | |
| 3 | |
