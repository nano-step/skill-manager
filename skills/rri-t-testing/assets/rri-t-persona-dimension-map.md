# RRI-T Persona × Dimension Coverage Map

Từ PDF section 8.2 — đảm bảo coverage đủ 100 test cases.

## Primary Responsibility Map

| Persona | Min Tests | Primary Dimensions | Secondary Dimensions |
|---------|-----------|-------------------|---------------------|
| End User | 25 | D1: UI/UX, D7: Edge Cases | D3: Performance |
| Business Analyst | 20 | D2: API, D5: Data Integrity | D1: UI/UX |
| QA Destroyer | 25 | D7: Edge Cases, D2: API | D4: Security |
| DevOps Tester | 15 | D3: Performance, D6: Infrastructure | D7: Edge Cases |
| Security Auditor | 15 | D4: Security | D2: API, D6: Infrastructure |
| **Total** | **100** | | |

## Coverage Matrix

✓ = Primary (trách nhiệm chính) | ○ = Secondary (bổ sung) | - = Không focus

| Persona | D1: UI/UX | D2: API | D3: Perf | D4: Sec | D5: Data | D6: Infra | D7: Edge |
|---------|-----------|---------|----------|---------|----------|-----------|----------|
| End User | ✓ | - | ○ | - | - | - | ✓ |
| Business Analyst | ○ | ✓ | - | - | ✓ | - | - |
| QA Destroyer | - | ✓ | - | ○ | - | - | ✓ |
| DevOps Tester | - | - | ✓ | - | - | ✓ | ○ |
| Security Auditor | - | ○ | - | ✓ | - | ○ | - |

## Gap Detection

Một dimension bị **under-tested** nếu có ít hơn 2 personas cover (✓ hoặc ○).

**Warning conditions:**
- D1 (UI/UX): chỉ End User + BA → OK (2 personas)
- D3 (Performance): chỉ DevOps + End User → OK (2 personas)
- D4 (Security): chỉ Security Auditor + QA Destroyer → OK (2 personas)
- D5 (Data): chỉ BA → **WARN** — chỉ 1 persona, nên bổ sung QA Destroyer coverage
- D6 (Infrastructure): chỉ DevOps + Security Auditor → OK (2 personas)

Nếu tổng test count < 100 sau DISCOVER phase → chạy bổ sung với personas thiếu.
