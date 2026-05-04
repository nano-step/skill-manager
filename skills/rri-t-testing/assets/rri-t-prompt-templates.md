# RRI-T Prompt Templates

Ready-to-use Claude Code prompt templates — từ PDF section 10.3.

## Template 1: Single-Persona Single-Dimension

Dùng khi muốn focus vào một persona + một dimension cụ thể.

```
ROLE: RRI-T Test Engineer
MODULE: [tên module]
PERSONA: [End User | Business Analyst | QA Destroyer | DevOps Tester | Security Auditor]
DIMENSION: [D1: UI/UX | D2: API | D3: Performance | D4: Security | D5: Data | D6: Infrastructure | D7: Edge Cases]

Generate 20 questions from [PERSONA]'s perspective about [MODULE],
focusing on [DIMENSION].
Output format: Q→A→R→P→T for each question.
Include Vietnamese-specific test cases if relevant.
```

## Template 2: Full-Coverage (All Personas × All Dimensions)

Dùng cho DISCOVER phase đầy đủ.

```
ROLE: RRI-T Test Engineer
MODULE: [tên module]
RRI OUTPUT: [paste RRI requirements here hoặc "N/A"]

Run the full DISCOVER phase:
- Interview all 5 personas (End User, BA, QA Destroyer, DevOps, Security Auditor)
- Cover all 7 dimensions per persona
- Generate minimum 100 test ideas total
- Format as Q→A→R→P→T
- Flag Vietnamese-specific edge cases with [VN]
Output to: /ai/test-case/rri-t/[module-name]/02-discover.md
```

## Template 3: Resume Single Phase

Dùng khi cần tiếp tục một phase đang dở.

```
SKILL: rri-t-testing
FEATURE: [feature-name]
RESUME_PHASE: [1 | 2 | 3 | 4 | 5]
CONTEXT: [mô tả ngắn đang ở đâu / đã làm gì rồi]
```

## When to Use Each Template

| Situation | Template |
|-----------|----------|
| Focus QA cho một area cụ thể | Template 1 (Single-Persona) |
| Full DISCOVER phase cho feature mới | Template 2 (Full-Coverage) |
| Session bị ngắt, cần tiếp tục | Template 3 (Resume) |
| Quick sanity check một persona | Template 1 với 10 questions thay 20 |
