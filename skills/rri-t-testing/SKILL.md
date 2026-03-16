---
name: rri-t-testing
description: RRI-T v2 - Rapid Risk-Informed Testing with BMAD-enhanced risk scoring, traceability, quality gates, and nano-brain memory persistence
---

# RRI-T v2.0 Testing Skill

Rapid Risk-Informed Testing methodology for AI agents. Guides systematic QA testing through 6 phases with risk scoring, traceability, quality gates, and cross-session memory persistence.

## When to Use

- Testing a new feature before release
- Validating a bug fix with regression coverage
- Assessing release readiness with quality gates
- Building test cases from requirements with traceability
- Resuming interrupted testing sessions via nano-brain

## Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `feature` | Yes | Feature name or PR reference |
| `tier` | No | Testing depth: `full` (default), `standard`, `minimal` |
| `acceptance_criteria` | No | List of acceptance criteria or link to spec |
| `environment` | No | Target environment (dev/staging/prod) |

## Workflow Phases

### Phase 0: ASSESS

Run testability gate, score risk, classify category, select tier, make go/no-go decision.

**Steps:**
1. Load `assets/rri-t-testability-gate.md` template
2. Validate prerequisites (environment, test data, deployment, acceptance criteria)
3. Assess testability (locators, API docs, auth flows, error states, baselines)
4. Score risk: Probability (1-3) x Impact (1-3) = Score (1-9)
5. Classify category: TECH / SEC / PERF / DATA / BUS / OPS
6. Select tier based on score
7. Decision: PROCEED / CONCERNS / BLOCK

**Output:** `00-assess.md`, `risk-matrix.md`

**MEMORY SAVE:** `rri-t/{feature}/assess` - Save risk register, tier, decision

---

### Phase 1: PREPARE

Define test scope, assign personas, select dimensions based on tier.

**Steps:**
1. Define test scope based on tier selection
2. Assign personas (5 for Full, 3 for Standard, 1 for Minimal)
3. Select dimensions (7 for Full, 4 for Standard, 2 for Minimal)
4. Set coverage targets per tier
5. Create output directory structure

**Output:** `01-prepare.md`

**MEMORY SAVE:** `rri-t/{feature}/prepare` - Save scope, persona assignments, dimension targets

---

### Phase 2: DISCOVER

Run persona interviews, map to dimensions, consolidate findings.

**Steps:**
1. Load `assets/rri-t-persona-interview.md` template
2. Run persona interviews using risk-tagged questions
3. Map questions to dimensions (D1-D7)
4. Consolidate findings into risk register update
5. Generate raw test ideas

**Output:** `02-discover.md`

**MEMORY SAVE:** `rri-t/{feature}/discover` - Save interview findings, test ideas, updated risks

---

### Phase 3: STRUCTURE

Create test cases, select stress axes, build traceability matrix.

**Steps:**
1. Load `assets/rri-t-test-case.md` template
2. Create test cases with Q-A-R-P-T format + risk category + traceability
3. Load `assets/rri-t-stress-matrix.md` and select relevant stress axes
4. Build traceability matrix using `assets/rri-t-traceability-matrix.md`
5. Identify coverage gaps

**Output:** `03-structure.md`, `traceability.md`

**MEMORY SAVE:** `rri-t/{feature}/structure` - Save test cases, traceability, gaps

---

### Phase 4: EXECUTE

Execute test cases via Playwright MCP, capture evidence, record results.

**Steps:**
1. Execute test cases using Playwright MCP browser automation
2. Capture evidence (screenshots, console logs, network requests)
3. Record results: PASS / FAIL / PAINFUL / MISSING
4. Calculate quality score using `assets/rri-t-quality-scorecard.md`
5. Log bugs found

**Output:** `04-execute.md`, `quality-scorecard.md`

**MEMORY SAVE:** `rri-t/{feature}/execute` - Save results, bugs, quality score

---

### Phase 5: ANALYZE

Fill coverage dashboard, apply gate rules, generate final report.

**Steps:**
1. Load `assets/rri-t-coverage-dashboard.md` template
2. Fill coverage dashboard with results
3. Complete traceability matrix with test results
4. Apply gate decision rules (PASS/CONCERNS/FAIL/WAIVED)
5. Generate final report
6. Extract reusable patterns for knowledge base

**Output:** `05-analyze.md`, `coverage-dashboard.md`

**MEMORY SAVE:** `rri-t/{feature}/analyze` - Save gate decision, report, lessons learned, reusable patterns

---

## Output Directory Structure

```
rri-t-{feature}/
  00-assess.md              # Phase 0: Testability gate + risk assessment
  01-prepare.md             # Phase 1: Scope, personas, dimensions
  02-discover.md            # Phase 2: Interview findings, test ideas
  03-structure.md           # Phase 3: Test cases, stress selections
  04-execute.md             # Phase 4: Execution log, evidence
  05-analyze.md             # Phase 5: Final analysis, recommendations
  risk-matrix.md            # Risk register with PxI scoring
  traceability.md           # Requirement-to-test mapping
  quality-scorecard.md      # 0-100 quality scoring
  coverage-dashboard.md     # Coverage metrics, gate decision
  evidence/                 # Screenshots, logs
```

## Templates

| Template | Purpose |
|----------|---------|
| `rri-t-testability-gate.md` | Phase 0 readiness checklist |
| `rri-t-risk-matrix.md` | PxI risk scoring template |
| `rri-t-traceability-matrix.md` | Requirement-to-test mapping |
| `rri-t-quality-scorecard.md` | 0-100 quality scoring |
| `rri-t-memory-protocol.md` | nano-brain save/resume protocol |
| `rri-t-test-case.md` | Q-A-R-P-T test case format |
| `rri-t-persona-interview.md` | 5-persona interview template |
| `rri-t-coverage-dashboard.md` | Coverage metrics dashboard |
| `rri-t-stress-matrix.md` | 8-axis stress testing scenarios |

## 7 Dimensions

| ID | Dimension | Target Coverage |
|----|-----------|-----------------|
| D1 | UI/UX | >= 85% |
| D2 | API | >= 85% |
| D3 | Performance | >= 70% |
| D4 | Security | >= 85% |
| D5 | Data Integrity | >= 85% |
| D6 | Infrastructure | >= 70% |
| D7 | Edge Cases | >= 85% |

## 5 Personas

| Persona | Focus |
|---------|-------|
| End User | Daily usage, speed, clarity, data safety |
| Business Analyst | Business rules, permissions, data consistency |
| QA Destroyer | Edge cases, race conditions, malformed inputs |
| DevOps Tester | Load, recovery, observability, scalability |
| Security Auditor | Auth, access control, data exposure, audit trails |

## Tier Selection

| Tier | Risk Score | Personas | Dimensions | Stress Axes | Est. Time |
|------|------------|----------|------------|-------------|-----------|
| Full | 6-9 | 5 | 7 | 8 | 2-4 hours |
| Standard | 3-5 | 3 | 4 | 4 | 1-2 hours |
| Minimal | 1-2 | 1 | 2 | 2 | 30-60 min |

## Release Gates

| State | Criteria |
|-------|----------|
| PASS | P0 coverage = 100% AND P1 >= 90% AND overall >= 80% |
| CONCERNS | P0 = 100% AND P1 = 80-89% AND mitigations documented |
| FAIL | P0 < 100% OR P1 < 80% OR unresolved security issues |
| WAIVED | FAIL + business approval + owner + expiry + remediation plan |

## Risk Categories

| Code | Category | Description |
|------|----------|-------------|
| TECH | Technical | Architecture/integration fragility |
| SEC | Security | Security vulnerabilities |
| PERF | Performance | Performance/scalability issues |
| DATA | Data | Data integrity/corruption |
| BUS | Business | Business logic errors |
| OPS | Operational | Deployment/operational issues |

## Guardrails

- Always run Phase 0 ASSESS before testing
- Score risk before testing (PxI formula)
- Use Q-A-R-P-T format for all test cases
- Map every test case to a requirement (traceability)
- Capture evidence for all FAIL and PAINFUL results
- Save to nano-brain after every phase
- Never skip security dimension for SEC-category risks
- Document all waivers with owner, expiry, remediation
