---
name: rri-t-testing
description: RRI-T QA methodology skill. Execute 5-phase testing: PREPARE, DISCOVER, STRUCTURE, EXECUTE, ANALYZE. Use before release, creating test cases, QA review, or when asked to 'test this feature', 'create test cases for', 'run QA on', 'check coverage for', 'find edge cases in', or 'does this feature work correctly'. Covers 7 dimensions and 5 personas with Vietnamese-specific locale testing built in.
---

# RRI-T Testing Skill

Execute comprehensive QA testing using Reverse Requirements Interview - Testing methodology.

## When to Use

- Testing any feature before release
- Creating test cases for new features
- Performing thorough QA review
- Running stress tests and edge case analysis

## Input

| Param | Req | Description |
|-------|-----|-------------|
| feature | Yes | Feature name in kebab-case |
| phase | No | `prepare`, `discover`, `structure`, `execute`, `analyze` |
| dimensions | No | `ui-ux,api,performance,security,data,infra,edge-cases` |

## 5 Phases

1. **PREPARE** — Read specs, setup output dir
2. **DISCOVER** — Interview 5 personas for test scenarios
3. **STRUCTURE** — Format as Q-A-R-P-T test cases
4. **EXECUTE** — Run tests, capture screenshots
5. **ANALYZE** — Calculate coverage, apply release gates

## Output

```
/ai/test-case/rri-t/{feature-name}/
├── 01-prepare.md
├── 02-discover.md
├── 03-structure.md
├── 04-execute.md
├── 05-analyze.md
└── summary.md
```

## Templates

Use templates bundled in `assets/` directory of this skill:
- `rri-t-persona-interview.md` — Persona interviews
- `rri-t-test-case.md` — Q-A-R-P-T format
- `rri-t-coverage-dashboard.md` — 7-dimension tracking
- `rri-t-stress-matrix.md` — 8-axis stress testing

## Extended Assets

Detailed reference assets for specific dimensions and contexts:
- `rri-t-vietnamese-testing.md` — 13 Vietnamese-specific test cases (locale, input, formatting)
- `rri-t-performance-budget.md` — Performance budgets & load test scenarios for D3
- `rri-t-security-checklist.md` — 8-area security checklist for D4
- `rri-t-dimension-checklists.md` — D5 Data Integrity & D6 Infrastructure checklists
- `rri-t-prompt-templates.md` — Ready-to-use Claude Code prompt templates
- `rri-t-persona-dimension-map.md` — Persona × Dimension coverage map & gap detection

## 7 Dimensions

UI/UX | API | Performance | Security | Data Integrity | Infrastructure | Edge Cases

## 5 Personas

End User | Business Analyst | QA Destroyer | DevOps Tester | Security Auditor

## Release Gates

| GO | NO-GO |
|----|-------|
| All 7 dims >= 70% | Any dim < 50% |
| 5/7 >= 85% | >2 P0 FAILs |
| Zero P0 FAIL | Critical MISSING |

## Guardrails

1. Test all 7 dimensions
2. Use all 5 personas
3. Document everything
4. PAINFUL is valid (not failure)
5. Follow release gates
6. Test Vietnamese locale
