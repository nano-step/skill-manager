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

## Persona 1: End User (Người dùng cuối)

### Context
As a household member using {feature-name} daily to manage my family's shared resources, I need the feature to work reliably across different devices, network conditions, and usage patterns. I care about speed, clarity, and not losing my work.

### Questions
1. What happens when I add an inventory item while my phone has weak 3G signal?
2. What happens when I start editing a shopping list on mobile, then switch to desktop mid-task?
3. What happens when I search for "nguyen" but the item name is "Nguyễn Văn A"?
4. What happens when I accidentally navigate away from a half-filled form?
5. What happens when I try to delete an item that another household member is currently editing?
6. What happens when I upload a photo of a receipt and the file is 10MB?
7. What happens when I filter 500+ inventory items by expiration date on a mid-range phone?
8. What happens when I receive a phone call while recording a voice note for a meal plan?
9. What happens when the app shows "1,000,000đ" instead of "1.000.000đ" for Vietnamese currency?
10. What happens when I'm offline for 2 days and then reconnect with 50 pending changes?
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

## Persona 2: Business Analyst (Phân tích nghiệp vụ)

### Context
As someone responsible for ensuring business rules are correctly implemented, I need to verify that household permissions, data ownership, financial calculations, and multi-household scenarios work as specified. I care about data consistency and rule enforcement.

### Questions
1. What happens when a household member with "viewer" role tries to delete an inventory item?
2. What happens when a user belongs to 3 households and switches between them rapidly?
3. What happens when two members simultaneously mark the same shopping list item as "purchased"?
4. What happens when a household admin removes a member who has pending edits?
5. What happens when the total expense calculation includes items in different currencies (VND and USD)?
6. What happens when a recurring meal plan conflicts with a one-time event on the same date?
7. What happens when a user tries to share an inventory item with a household they don't belong to?
8. What happens when the system calculates "items expiring in 3 days" across different timezones?
9. What happens when a household reaches the maximum allowed inventory items (if there's a limit)?
10. What happens when a deleted household still has active shopping lists in other members' offline caches?
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

## Persona 3: QA Destroyer (Phá hoại viên QA)

### Context
As someone whose job is to break things, I need to find every edge case, race condition, and unexpected input that could crash the system or corrupt data. I care about boundary conditions, malformed inputs, and timing attacks.

### Questions
1. What happens when I paste 50,000 characters into the "item name" field?
2. What happens when I rapidly click "save" 20 times in 1 second?
3. What happens when I set my device date to 2099 and create an inventory item?
4. What happens when I upload a file named `"; DROP TABLE inventory; --"` as an item photo?
5. What happens when I create an item with expiration date "yesterday" and quantity "-5"?
6. What happens when I open the app in 10 browser tabs and edit the same item in all of them?
7. What happens when I force-kill the app during a GraphQL mutation?
8. What happens when I inject `<script>alert('xss')</script>` into a meal plan description?
9. What happens when I create a circular dependency (Item A requires Item B, Item B requires Item A)?
10. What happens when I change my device timezone mid-session and create a timestamped event?
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

## Persona 4: DevOps Tester (Kiểm thử hạ tầng)

### Context
As someone responsible for deployment, monitoring, and infrastructure reliability, I need to verify that the feature works under load, handles server restarts gracefully, and doesn't leak resources. I care about scalability, observability, and recovery.

### Questions
1. What happens when the GraphQL server restarts while a user is mid-sync?
2. What happens when 100 users simultaneously bulk-import 500 inventory items each?
3. What happens when the database connection pool is exhausted during peak usage?
4. What happens when the CDN serving item photos goes down?
5. What happens when a GraphQL query takes longer than the 30-second timeout?
6. What happens when the Redis cache is cleared while users have active sessions?
7. What happens when a deployment rolls out a new schema version while old clients are still connected?
8. What happens when disk space runs out during a photo upload?
9. What happens when the monitoring system detects 500 errors but the app still appears functional?
10. What happens when a user's offline queue grows to 1000+ pending mutations?
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

## Persona 5: Security Auditor (Kiểm toán bảo mật)

### Context
As someone responsible for security compliance, I need to verify that authentication, authorization, data exposure, and audit trails are properly implemented. I care about access control, data leakage, and attack surface.

### Questions
1. What happens when a user's JWT token expires mid-session?
2. What happens when a user tries to access another household's data by guessing the household ID?
3. What happens when a removed household member still has cached data on their device?
4. What happens when someone intercepts the GraphQL request and replays it with modified variables?
5. What happens when a user tries to upload a malicious file disguised as an image?
6. What happens when the audit log shows who deleted an item, but the user claims they didn't?
7. What happens when a user shares their session token with someone outside the household?
8. What happens when someone uses SQL injection in a search query (even though it's GraphQL)?
9. What happens when a user's password is compromised and they don't realize it for 3 days?
10. What happens when the system logs sensitive data (like financial amounts) in plain text?
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
