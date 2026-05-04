# Backend Express Checklist

Comprehensive review checklist for Express.js backend PRs (tradeit-backend, tradeit-service, etc.)

---

## 1. Error Handling

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| All async routes wrapped | `asyncHandler()` or try/catch | Unhandled rejection crashes server |
| Errors logged with context | `logger.error(err, { context: {...} })` | Debugging requires context |
| No empty catch blocks | `catch(e) {}` | Swallows errors silently |
| Errors have proper status codes | `res.fail()` not `res.json({ success: false })` | Consistent API responses |

### Detection Patterns

```javascript
// CRITICAL: Unhandled async - will crash on error
router.get('/api', async (req, res) => {
  const data = await fetchData()  // if throws, server crashes
})

// SECURE: Wrapped with asyncHandler
router.get('/api', asyncHandler(async (req, res) => {
  const data = await fetchData()
}))

// CRITICAL: Empty catch
try {
  await riskyOperation()
} catch (e) {}  // Error swallowed!

// SECURE: Logged with context
try {
  await riskyOperation()
} catch (e) {
  logger.error(e, { context: { step: 'riskyOperation', userId } })
  throw e
}
```

---

## 2. Database Operations

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Named parameters used | `:paramName` not `?` | Readability, prevents order bugs |
| No string concatenation in SQL | `WHERE id = ${id}` | SQL injection |
| Transactions have ROLLBACK | `catch { ROLLBACK }` | Data consistency |
| Large queries have LIMIT | `LIMIT 1000` | Memory/performance |

### Detection Patterns

```javascript
// CRITICAL: SQL injection
await mysql.query(`SELECT * FROM users WHERE id = ${userId}`)

// SECURE: Named parameters
await mysql.query('SELECT * FROM users WHERE id = :userId', { userId })

// CRITICAL: Transaction without rollback
await mysql.query('START TRANSACTION')
await mysql.query('INSERT INTO orders ...')
await mysql.query('UPDATE inventory ...')
await mysql.query('COMMIT')  // What if UPDATE fails?

// SECURE: Transaction with rollback
try {
  await mysql.query('START TRANSACTION')
  await mysql.query('INSERT INTO orders ...')
  await mysql.query('UPDATE inventory ...')
  await mysql.query('COMMIT')
} catch (e) {
  await mysql.query('ROLLBACK')
  throw e
}

// WARNING: Unbounded query
await mysql.query('SELECT * FROM items WHERE status = :status', { status })

// SECURE: With limit
await mysql.query('SELECT * FROM items WHERE status = :status LIMIT 1000', { status })
```

---

## 3. Redis Operations

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| setEx has TTL | `Redis.setEx(key, TTL, value)` | Memory leak without TTL |
| Not using set() for cache | `Redis.set()` without TTL | Use setEx instead |
| Key patterns consistent | `prefix:${id}:suffix` | Maintainability |
| Large values compressed | `compressed` suffix | Memory efficiency |

### Detection Patterns

```javascript
// WARNING: No TTL - memory leak
await Redis.set(`cache:${userId}`, JSON.stringify(data))

// SECURE: With TTL
await Redis.setEx(`cache:${userId}`, 3600, JSON.stringify(data))

// WARNING: Inconsistent key pattern
await Redis.get(`user_${userId}`)  // underscore
await Redis.get(`user:${userId}`)  // colon

// SECURE: Consistent pattern
const CACHE_PREFIX = 'user:'
await Redis.get(`${CACHE_PREFIX}${userId}`)
```

---

## 4. External API Calls

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Timeout configured | `{ timeout: 30000 }` | Prevents hanging requests |
| Retry logic for transient errors | Retry on 5xx, network errors | Resilience |
| Circuit breaker for critical APIs | After N failures, fail fast | Prevents cascade failures |
| Response validated | Check expected fields exist | Defensive coding |

### Detection Patterns

```javascript
// CRITICAL: No timeout - can hang forever
const response = await axios.get('https://api.steam.com/...')

// SECURE: With timeout
const response = await axios.get('https://api.steam.com/...', {
  timeout: 30000  // 30 seconds
})

// CRITICAL: AI/LLM call without timeout (PR #1101 issue)
const aiResponse = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...]
})  // Can hang for minutes!

// SECURE: With timeout
const aiResponse = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  timeout: 60000  // 60 seconds max
})
```

---

## 5. Response Handling

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Use res.success() / res.fail() | Not raw res.json() | Consistent API format |
| No sensitive data in responses | No passwords, tokens, internal IDs | Security |
| Response fields documented | JSDoc or TypeScript | API contract |
| Conditional fields have fallbacks | `field: value || default` | Prevents undefined |

### Detection Patterns

```javascript
// WARNING: Raw response
res.json({ success: true, data })

// SECURE: Standard response
res.success(data)

// CRITICAL: Conditional removed (PR #1101 issue!)
// BEFORE - safe
imgURL: iconUrl 
  ? `https://cdn.steam.com/${iconUrl}` 
  : `${API_URL}/fallback/${groupId}.webp`

// AFTER - breaks when iconUrl is undefined
imgURL: `https://cdn.steam.com/${iconUrl}`  // undefined in URL!

// SECURE: Keep fallback or ensure iconUrl always exists
imgURL: iconUrl 
  ? `https://cdn.steam.com/${iconUrl}` 
  : getFallbackImage(groupId)
```

---

## 6. Middleware & Context

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Middleware order correct | Auth before business logic | Security |
| httpContext values set before use | `httpContext.set()` in middleware | Runtime errors |
| Removed middleware has no consumers | Search for `httpContext.get()` | Breaking change |

### Detection Patterns

```javascript
// CRITICAL: Middleware removed but consumers exist
// In index.js - REMOVED:
// app.use(analyticsMiddleware)

// But in controller - STILL USED:
const analytics = httpContext.get('analytics')  // undefined!
analytics.track(...)  // TypeError!

// Before removing middleware, search:
grep -rn "httpContext.get('analytics')" server/
```

---

## 7. Service Logic

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Default case in switch | `default: throw new Error()` | Handles unexpected values |
| Null checks before property access | `item?.property` | Prevents TypeError |
| Array bounds checked | `arr[0]` after `arr.length > 0` | Prevents undefined |
| Enum values validated | Check against known values | Prevents invalid state |

### Detection Patterns

```javascript
// CRITICAL: Default case logic changed (PR #1101 issue!)
// BEFORE - generates content for all slugs
switch (slug) {
  case 'knives': return generateKnivesContent()
  case 'gloves': return generateGlovesContent()
  default: return generateGenericContent(slug)  // Works for any slug
}

// AFTER - only works for root
switch (slug) {
  case 'knives': return generateKnivesContent()
  case 'gloves': return generateGlovesContent()
  default: return null  // Breaks category pages!
}

// WARNING: No null check
const price = item.prices.steam  // TypeError if prices undefined

// SECURE: Optional chaining
const price = item?.prices?.steam ?? 0
```

---

## 8. Breaking Change Signals

### Auto-Flag These Changes

| Signal | Severity | Action |
|--------|----------|--------|
| Response field removed | CRITICAL | Search all frontend consumers |
| Conditional/ternary removed | CRITICAL | Verify fallback not needed |
| Default case changed | WARNING | Verify all callers handle |
| Middleware removed | WARNING | Search httpContext consumers |
| Route path changed | CRITICAL | Update all API consumers |
| HTTP method changed | CRITICAL | Update all API consumers |

### Consumer Search Required

When any of the above detected, MUST search:

```bash
# For tradeit-backend changes
grep -rn "{fieldName}" ../tradeit/
grep -rn "{fieldName}" ../tradeit-admin/
grep -rn "{fieldName}" ../tradeit-extension/

# For route changes
grep -rn "/api/v2/{path}" ../tradeit/network/
```

---

## 9. Performance Checks

### WARNING - Should Check

| Check | Pattern | Why |
|-------|---------|-----|
| No N+1 queries | Query in loop | Performance |
| Batch operations used | `INSERT ... VALUES (...), (...)` | Efficiency |
| Indexes exist for WHERE clauses | Check migration files | Query speed |
| Large responses paginated | `limit`, `offset` params | Memory |

---

## 10. Security Checks

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Auth middleware on protected routes | `requireAuth` middleware | Unauthorized access |
| Input validated | `express-validator` | Injection attacks |
| Rate limiting on public endpoints | `express-rate-limit` | DoS protection |
| No secrets in code | API keys, passwords | Security breach |

---

## Quick Checklist

Copy this for PR reviews:

```markdown
## Express Backend Review

### Error Handling
- [ ] All async routes wrapped in try/catch or asyncHandler
- [ ] Errors logged with context
- [ ] No empty catch blocks

### Database
- [ ] Named parameters used (not ?)
- [ ] No SQL string concatenation
- [ ] Transactions have ROLLBACK

### Redis
- [ ] setEx used with TTL (not set)
- [ ] Key patterns consistent

### External APIs
- [ ] Timeout configured on all external calls
- [ ] AI/LLM calls have timeout

### Response
- [ ] res.success()/res.fail() used
- [ ] Conditionals preserved (no fallback removal)

### Breaking Changes
- [ ] No response fields removed without frontend update
- [ ] No middleware removed without consumer check
- [ ] Default case logic unchanged (or verified)

### Consumer Search (if breaking change detected)
- [ ] Searched tradeit frontend
- [ ] Searched tradeit-admin
- [ ] Searched tradeit-extension
```
