# Express Code Review Rules

## Critical Rules
- Unhandled async errors in route handlers → use express-async-handler or try-catch
- SQL injection in raw queries → use parameterized queries
- Missing authentication middleware on protected routes
- Exposing sensitive data in error responses

## Warning Rules
- Missing input validation → use express-validator or joi
- Exposing stack traces in production → check NODE_ENV
- Missing rate limiting on public endpoints
- No request body size limit → use express.json({ limit: '10kb' })

## Suggestions
- Use helmet for security headers
- Use compression middleware
- Centralize error handling middleware
- Use router.param() for parameter validation

## Detection Patterns

```javascript
// CRITICAL: Unhandled async
app.get('/api', async (req, res) => {
  const data = await fetchData()  // if throws, crashes server
})

// SECURE: Wrapped async
app.get('/api', asyncHandler(async (req, res) => {
  const data = await fetchData()
}))

// CRITICAL: SQL injection
db.query(`SELECT * FROM users WHERE id = ${req.params.id}`)

// SECURE: Parameterized
db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
```
