# RRI-T Traceability Matrix

**Feature:** {feature-name}
**Date:** {YYYY-MM-DD}
**Scope:** {scope-description}
**Phase:** {current-phase}

## Coverage Summary

| Priority | Total Reqs | Covered | Percentage | Status |
|----------|------------|---------|------------|--------|
| P0 | {count} | {count} | {pct}% | PASS / CONCERNS / FAIL |
| P1 | {count} | {count} | {pct}% | PASS / CONCERNS / FAIL |
| P2 | {count} | {count} | {pct}% | PASS / CONCERNS / FAIL |
| P3 | {count} | {count} | {pct}% | PASS / CONCERNS / FAIL |
| **Total** | {count} | {count} | {pct}% | {status} |

### Status Thresholds

| Status | P0 | P1 | Overall |
|--------|----|----|---------|
| PASS | 100% | >= 90% | >= 80% |
| CONCERNS | 100% | 80-89% | 70-79% |
| FAIL | < 100% | < 80% | < 70% |

---

## Detailed Traceability

### P0 Requirements (Critical)

| Req ID | Requirement | Test Cases | Coverage | Result |
|--------|-------------|------------|----------|--------|
| REQ-001 | User can login with valid credentials | TC-001, TC-002 | FULL | PASS |
| REQ-002 | Data persists after session timeout | TC-003 | FULL | PASS |
| REQ-003 | Payment transactions are atomic | TC-004, TC-005, TC-006 | FULL | FAIL |
| REQ-004 | | | | |
| REQ-005 | | | | |

### P1 Requirements (Major)

| Req ID | Requirement | Test Cases | Coverage | Result |
|--------|-------------|------------|----------|--------|
| REQ-101 | Search supports Vietnamese diacritics | TC-101 | FULL | PASS |
| REQ-102 | Offline changes sync within 60s | TC-102, TC-103 | PARTIAL | CONCERNS |
| REQ-103 | Role changes take effect immediately | | NONE | MISSING |
| REQ-104 | | | | |
| REQ-105 | | | | |

### P2 Requirements (Minor)

| Req ID | Requirement | Test Cases | Coverage | Result |
|--------|-------------|------------|----------|--------|
| REQ-201 | | | | |
| REQ-202 | | | | |
| REQ-203 | | | | |

### P3 Requirements (Trivial)

| Req ID | Requirement | Test Cases | Coverage | Result |
|--------|-------------|------------|----------|--------|
| REQ-301 | | | | |
| REQ-302 | | | | |

---

## Coverage Legend

| Coverage | Definition |
|----------|------------|
| FULL | All acceptance criteria have test cases |
| PARTIAL | Some acceptance criteria have test cases |
| NONE | No test cases mapped to requirement |

---

## Gap Prioritization

| Gap # | Requirement | Priority | Risk | Recommendation |
|-------|-------------|----------|------|----------------|
| GAP-1 | REQ-103: Role changes take effect immediately | P1 | HIGH | Add TC for role revocation mid-session |
| GAP-2 | REQ-102: Offline sync (partial coverage) | P1 | MEDIUM | Add TC for 50+ pending changes |
| GAP-3 | | | | |
| GAP-4 | | | | |
| GAP-5 | | | | |

### Gap Severity

| Severity | Definition |
|----------|------------|
| CRITICAL | P0 requirement with NONE or PARTIAL coverage |
| HIGH | P1 requirement with NONE coverage |
| MEDIUM | P1 requirement with PARTIAL coverage |
| LOW | P2/P3 requirement with NONE or PARTIAL coverage |

---

## Summary

- **Total Requirements:** {count}
- **Fully Covered:** {count} ({pct}%)
- **Partially Covered:** {count} ({pct}%)
- **Not Covered:** {count} ({pct}%)
- **Critical Gaps:** {count}
- **High Gaps:** {count}
