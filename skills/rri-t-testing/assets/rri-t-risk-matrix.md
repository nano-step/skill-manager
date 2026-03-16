# RRI-T Risk Matrix

**Feature:** {feature-name}
**Owner:** {owner}
**Date:** {YYYY-MM-DD}
**Build:** {build-id}

## Risk Register

| ID | Risk Description | Category | Probability | Impact | Score | Mitigation | Status |
|----|------------------|----------|-------------|--------|-------|------------|--------|
| R-001 | API rate limiting not tested under load | PERF | 2 | 3 | 6 | Add load test for 100 concurrent users | OPEN |
| R-002 | User session not invalidated on role change | SEC | 2 | 3 | 6 | Test role revocation mid-session | OPEN |
| R-003 | Offline sync may duplicate items on reconnect | DATA | 3 | 2 | 6 | Test offline queue with 50+ pending changes | OPEN |
| R-004 | | | | | | | |
| R-005 | | | | | | | |
| R-006 | | | | | | | |
| R-007 | | | | | | | |
| R-008 | | | | | | | |
| R-009 | | | | | | | |
| R-010 | | | | | | | |

## Scoring Guide

### Probability

| Score | Definition |
|-------|------------|
| 1 | Unlikely - well-tested area, minor change |
| 2 | Possible - moderate complexity, some unknowns |
| 3 | Likely - new area, high complexity, many dependencies |

### Impact

| Score | Definition |
|-------|------------|
| 1 | Low - cosmetic, workaround exists |
| 2 | Medium - feature degraded, user friction |
| 3 | High - data loss, security breach, revenue impact |

### Risk Score = Probability x Impact

| Score | Level | Action |
|-------|-------|--------|
| 1-2 | LOW | Monitor, test if time permits |
| 3-5 | MEDIUM | Test with standard coverage |
| 6-8 | HIGH | Requires mitigation before release |
| 9 | CRITICAL | Blocks release if unmitigated |

## Category Definitions

| Code | Category | Description |
|------|----------|-------------|
| TECH | Technical | Architecture fragility, integration issues, technical debt |
| SEC | Security | Authentication, authorization, data exposure, vulnerabilities |
| PERF | Performance | Response time, throughput, scalability, resource usage |
| DATA | Data | Integrity, corruption, loss, migration, consistency |
| BUS | Business | Logic errors, calculation mistakes, workflow issues |
| OPS | Operational | Deployment, monitoring, recovery, configuration |

## Threshold Rules

- Score >= 6: Requires documented mitigation plan
- Score = 9: Blocks release until mitigated and verified
- SEC category: Always requires security dimension testing
- DATA category: Always requires data integrity dimension testing

## Risk Summary

| Metric | Value |
|--------|-------|
| Total Risks | {count} |
| High (>= 6) | {count} |
| Critical (= 9) | {count} |
| Mitigated | {count} |
| Open | {count} |

## Risk by Category

| Category | Count | Highest Score |
|----------|-------|---------------|
| TECH | | |
| SEC | | |
| PERF | | |
| DATA | | |
| BUS | | |
| OPS | | |
