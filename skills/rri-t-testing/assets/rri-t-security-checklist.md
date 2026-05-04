# RRI-T Security Checklist

D4: Security — từ PDF section 5.4. 8 khu vực kiểm tra.

## Checklist 8 Khu Vực

| Area | Kiểm tra | Tiêu chí Pass |
|------|----------|---------------|
| AuthN (Authentication) | Login, logout, token refresh, session timeout | Token secure, session timeout đúng thời gian |
| AuthZ (Authorization) | RBAC per endpoint, horizontal access control | User A KHÔNG access được data của User B |
| Input Sanitization | XSS, SQL Injection, Command Injection | Mọi input được escape/sanitize trước khi xử lý |
| Data Exposure | API response fields, error messages | Không leak password, PII, stack trace ra client |
| File Upload | Type check, size limit, content scan | Reject executable files, limit 10MB per file |
| Security Headers | CSP, HSTS, X-Frame-Options, X-Content-Type | Tất cả security headers present và đúng giá trị |
| Encryption | HTTPS only, sensitive data at rest | TLS 1.2+, AES-256 cho dữ liệu nhạy cảm |
| Audit Trail | Log user actions, admin changes | Immutable logs với timestamp + user ID |

## Security Test Scenarios

1. **Horizontal Privilege Escalation** — User A thay đổi household ID trong request để truy cập data của User B → phải nhận 403.
2. **JWT Tampering** — Modify token payload (thay đổi user_id) rồi gửi request → phải nhận 401.
3. **SQL Injection** — Nhập `'; DROP TABLE users; --` vào search field → không crash, không execute.
4. **Stored XSS** — Lưu `<script>alert(1)</script>` vào tên/mô tả → không execute khi hiển thị.
5. **IDOR via API** — Gọi `GET /api/households/{id}` với id của household khác → phải nhận 403.
6. **Session Fixation** — Login xong kiểm tra session ID có rotate không → phải tạo session mới sau login.
