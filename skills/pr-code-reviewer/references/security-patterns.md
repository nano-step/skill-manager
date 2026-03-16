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
