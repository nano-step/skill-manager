# RRI-T Persona Interview — {Feature Name}

**Feature:** {feature-name}
**Date:** {YYYY-MM-DD}
**Interviewer:** {agent/person}

## Interview Summary
| Persona | Questions Generated | Key Concerns |
|---------|-------------------|--------------|
| End User | 0/25 | |
| Business Analyst | 0/25 | |
| QA Destroyer | 0/25 | |
| DevOps Tester | 0/25 | |
| Security Auditor | 0/25 | |
| **Total** | **0/125** | |

---

## Persona 1: End User (Nguoi dung cuoi)

### Context
As a household member using {feature-name} daily to manage my family's shared resources, I need the feature to work reliably across different devices, network conditions, and usage patterns. I care about speed, clarity, and not losing my work.

### Questions
1. What happens when I add an inventory item while my phone has weak 3G signal? `[PERF]` `[D3: Performance]`
2. What happens when I start editing a shopping list on mobile, then switch to desktop mid-task? `[DATA]` `[D5: Data Integrity]`
3. What happens when I search for "nguyen" but the item name is "Nguyen Van A"? `[DATA]` `[D1: UI/UX]`
4. What happens when I accidentally navigate away from a half-filled form? `[DATA]` `[D1: UI/UX]`
5. What happens when I try to delete an item that another household member is currently editing? `[DATA]` `[D5: Data Integrity]`
6. What happens when I upload a photo of a receipt and the file is 10MB? `[PERF]` `[D3: Performance]`
7. What happens when I filter 500+ inventory items by expiration date on a mid-range phone? `[PERF]` `[D3: Performance]`
8. What happens when I receive a phone call while recording a voice note for a meal plan? `[TECH]` `[D7: Edge Cases]`
9. What happens when the app shows "1,000,000d" instead of "1.000.000d" for Vietnamese currency? `[BUS]` `[D1: UI/UX]`
10. What happens when I'm offline for 2 days and then reconnect with 50 pending changes? `[DATA]` `[D6: Infrastructure]`
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 
21. 
22. 
23. 
24. 
25. 

### Key Concerns
- {list concerns discovered}

---

## Persona 2: Business Analyst (Phan tich nghiep vu)

### Context
As someone responsible for ensuring business rules are correctly implemented, I need to verify that household permissions, data ownership, financial calculations, and multi-household scenarios work as specified. I care about data consistency and rule enforcement.

### Questions
1. What happens when a household member with "viewer" role tries to delete an inventory item? `[SEC]` `[D4: Security]`
2. What happens when a user belongs to 3 households and switches between them rapidly? `[DATA]` `[D5: Data Integrity]`
3. What happens when two members simultaneously mark the same shopping list item as "purchased"? `[DATA]` `[D5: Data Integrity]`
4. What happens when a household admin removes a member who has pending edits? `[BUS]` `[D4: Security]`
5. What happens when the total expense calculation includes items in different currencies (VND and USD)? `[BUS]` `[D5: Data Integrity]`
6. What happens when a recurring meal plan conflicts with a one-time event on the same date? `[BUS]` `[D7: Edge Cases]`
7. What happens when a user tries to share an inventory item with a household they don't belong to? `[SEC]` `[D4: Security]`
8. What happens when the system calculates "items expiring in 3 days" across different timezones? `[BUS]` `[D7: Edge Cases]`
9. What happens when a household reaches the maximum allowed inventory items (if there's a limit)? `[BUS]` `[D7: Edge Cases]`
10. What happens when a deleted household still has active shopping lists in other members' offline caches? `[DATA]` `[D6: Infrastructure]`
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 
21. 
22. 
23. 
24. 
25. 

### Key Concerns
- {list concerns discovered}

---

## Persona 3: QA Destroyer (Pha hoai vien QA)

### Context
As someone whose job is to break things, I need to find every edge case, race condition, and unexpected input that could crash the system or corrupt data. I care about boundary conditions, malformed inputs, and timing attacks.

### Questions
1. What happens when I paste 50,000 characters into the "item name" field? `[DATA]` `[D7: Edge Cases]`
2. What happens when I rapidly click "save" 20 times in 1 second? `[PERF]` `[D7: Edge Cases]`
3. What happens when I set my device date to 2099 and create an inventory item? `[DATA]` `[D7: Edge Cases]`
4. What happens when I upload a file named `"; DROP TABLE inventory; --"` as an item photo? `[SEC]` `[D4: Security]`
5. What happens when I create an item with expiration date "yesterday" and quantity "-5"? `[DATA]` `[D7: Edge Cases]`
6. What happens when I open the app in 10 browser tabs and edit the same item in all of them? `[DATA]` `[D5: Data Integrity]`
7. What happens when I force-kill the app during a GraphQL mutation? `[DATA]` `[D6: Infrastructure]`
8. What happens when I inject `<script>alert('xss')</script>` into a meal plan description? `[SEC]` `[D4: Security]`
9. What happens when I create a circular dependency (Item A requires Item B, Item B requires Item A)? `[BUS]` `[D7: Edge Cases]`
10. What happens when I change my device timezone mid-session and create a timestamped event? `[DATA]` `[D7: Edge Cases]`
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 
21. 
22. 
23. 
24. 
25. 

### Key Concerns
- {list concerns discovered}

---

## Persona 4: DevOps Tester (Kiem thu ha tang)

### Context
As someone responsible for deployment, monitoring, and infrastructure reliability, I need to verify that the feature works under load, handles server restarts gracefully, and doesn't leak resources. I care about scalability, observability, and recovery.

### Questions
1. What happens when the GraphQL server restarts while a user is mid-sync? `[OPS]` `[D6: Infrastructure]`
2. What happens when 100 users simultaneously bulk-import 500 inventory items each? `[PERF]` `[D3: Performance]`
3. What happens when the database connection pool is exhausted during peak usage? `[OPS]` `[D6: Infrastructure]`
4. What happens when the CDN serving item photos goes down? `[OPS]` `[D6: Infrastructure]`
5. What happens when a GraphQL query takes longer than the 30-second timeout? `[PERF]` `[D3: Performance]`
6. What happens when the Redis cache is cleared while users have active sessions? `[OPS]` `[D6: Infrastructure]`
7. What happens when a deployment rolls out a new schema version while old clients are still connected? `[OPS]` `[D2: API]`
8. What happens when disk space runs out during a photo upload? `[OPS]` `[D6: Infrastructure]`
9. What happens when the monitoring system detects 500 errors but the app still appears functional? `[OPS]` `[D6: Infrastructure]`
10. What happens when a user's offline queue grows to 1000+ pending mutations? `[PERF]` `[D3: Performance]`
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 
21. 
22. 
23. 
24. 
25. 

### Key Concerns
- {list concerns discovered}

---

## Persona 5: Security Auditor (Kiem toan bao mat)

### Context
As someone responsible for security compliance, I need to verify that authentication, authorization, data exposure, and audit trails are properly implemented. I care about access control, data leakage, and attack surface.

### Questions
1. What happens when a user's JWT token expires mid-session? `[SEC]` `[D4: Security]`
2. What happens when a user tries to access another household's data by guessing the household ID? `[SEC]` `[D4: Security]`
3. What happens when a removed household member still has cached data on their device? `[SEC]` `[D4: Security]`
4. What happens when someone intercepts the GraphQL request and replays it with modified variables? `[SEC]` `[D4: Security]`
5. What happens when a user tries to upload a malicious file disguised as an image? `[SEC]` `[D4: Security]`
6. What happens when the audit log shows who deleted an item, but the user claims they didn't? `[SEC]` `[D4: Security]`
7. What happens when a user shares their session token with someone outside the household? `[SEC]` `[D4: Security]`
8. What happens when someone uses SQL injection in a search query (even though it's GraphQL)? `[SEC]` `[D4: Security]`
9. What happens when a user's password is compromised and they don't realize it for 3 days? `[SEC]` `[D4: Security]`
10. What happens when the system logs sensitive data (like financial amounts) in plain text? `[SEC]` `[D4: Security]`
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 
21. 
22. 
23. 
24. 
25. 

### Key Concerns
- {list concerns discovered}

---

## Consolidation Method

After completing all persona interviews, consolidate findings into the risk register:

1. **Group by Category:** Organize questions by risk category (TECH, SEC, PERF, DATA, BUS, OPS)
2. **Identify Patterns:** Look for concerns raised by multiple personas
3. **Score Risks:** For each unique risk, assign Probability (1-3) x Impact (1-3)
4. **Prioritize:** Sort by risk score descending
5. **Map to Dimensions:** Ensure each risk maps to at least one dimension (D1-D7)
6. **Create Test Cases:** Convert high-priority risks into test cases using Q-A-R-P-T format

### Consolidation Table

| Risk ID | Description | Raised By | Category | Dimension | P | I | Score |
|---------|-------------|-----------|----------|-----------|---|---|-------|
| R-001 | | | | | | | |
| R-002 | | | | | | | |
| R-003 | | | | | | | |
| R-004 | | | | | | | |
| R-005 | | | | | | | |

---

## Raw Test Ideas (Consolidated)
| # | Idea | Source Persona | Potential Dimension | Priority Estimate |
|---|------|---------------|--------------------|--------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |
| 13 | | | | |
| 14 | | | | |
| 15 | | | | |
| 16 | | | | |
| 17 | | | | |
| 18 | | | | |
| 19 | | | | |
| 20 | | | | |
