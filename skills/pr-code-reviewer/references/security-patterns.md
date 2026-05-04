# Security Patterns

## OWASP Top 10 Detection

### 1. Injection
```javascript
// CRITICAL: SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// SECURE: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
await db.query(query, [userId]);
```

### 2. Broken Authentication
```javascript
// CRITICAL: Weak hashing
crypto.createHash('md5').update(password);

// SECURE: Strong hashing
bcrypt.hash(password, 12);
```

### 3. XSS
```javascript
// CRITICAL: Direct HTML insertion
element.innerHTML = userInput;

// SECURE: Text content
element.textContent = userInput;
```

## Broken Access Control
- Pattern: IDOR via sequential IDs in routes (e.g., /users/123) without ownership checks
- Pattern: Missing authorization checks on read/update/delete endpoints
- Pattern: Privilege escalation by accepting role/userId in req.body or query params
- Pattern: Direct object reference without validating org/team membership
- Impact: Unauthorized data access or actions across accounts/tenants
- Fix: Enforce ownership/role checks server-side using auth context; ignore client-supplied roles

## Security Misconfiguration
- Pattern: Debug mode or stack traces enabled in production builds
- Pattern: Default credentials or sample secrets left in config
- Pattern: Verbose error messages leaking SQL, stack, or internal service details
- Pattern: CORS wildcard with credentials or overly broad origins
- Impact: Exposure of internals, elevated attack surface, accidental access from untrusted origins
- Fix: Lock down env flags, sanitize errors, restrict CORS, set CSP/HSTS/X-Frame-Options

## Sensitive Data Exposure
- Pattern: Secrets embedded in code/config committed to repo
- Pattern: PII or auth tokens logged (request/response body logging)
- Pattern: Tokens or session IDs placed in URLs or query params
- Pattern: API keys shipped in frontend bundles or public config
- Impact: Credential leakage, account takeover, compliance violations
- Fix: Use secret manager/env vars, scrub logs, keep tokens in headers, server-side key usage

## SSRF (Server-Side Request Forgery)
- Pattern: User-controlled URL passed to fetch/axios/http without allowlist
- Pattern: DNS rebinding or open redirects used to reach internal IPs
- Pattern: URL parsing based only on string prefix checks
- Pattern: File or gopher schemes allowed via URL input
- Impact: Internal service access, metadata theft, lateral movement
- Fix: Allowlist hosts, resolve DNS + block private ranges, enforce http/https schemes

## Path Traversal
- Pattern: User input used in fs.readFile/fs.writeFile path
- Pattern: Directory traversal via ../ or URL-decoded segments
- Pattern: Zip slip during archive extraction without path normalization
- Pattern: Following symlinks into restricted paths
- Impact: Arbitrary file read/write or overwriting server files
- Fix: Use path.join + path.normalize, enforce base dir, reject .. and symlinks

## Insecure Deserialization
- Pattern: JSON.parse of untrusted input merged into objects (prototype pollution)
- Pattern: eval/Function constructor on user-provided strings
- Pattern: Template injection via unsafe renderers or string interpolation
- Pattern: Unsafe regex on untrusted input leading to ReDoS
- Impact: Remote code execution, data tampering, or denial of service
- Fix: Use safe parsers, block __proto__/constructor keys, avoid eval, limit regex complexity

## Mass Assignment
- Pattern: Spreading req.body directly into DB models or ORM entities
- Pattern: Missing allowlist for fields on create/update handlers
- Pattern: TypeORM/Prisma save() called with unfiltered input
- Pattern: Client-controlled flags (isAdmin, status) accepted without validation
- Impact: Unauthorized field updates and privilege escalation
- Fix: Use explicit allowlists, map inputs to safe DTOs, ignore privileged fields
