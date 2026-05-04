# Database Checklist

Comprehensive review checklist for database-related changes (MySQL, Redis, migrations).

---

## 1. MySQL Query Safety

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Named parameters | `:paramName` | Prevents SQL injection, readable |
| No string concatenation | `WHERE id = ${id}` | SQL injection |
| Parameterized IN clauses | `WHERE id IN (:ids)` | Injection protection |
| LIMIT on SELECT | `LIMIT 1000` | Memory protection |

### Detection Patterns

```javascript
// CRITICAL: SQL injection via concatenation
await mysql.query(`SELECT * FROM users WHERE id = ${userId}`)
await mysql.query(`SELECT * FROM items WHERE name LIKE '%${search}%'`)

// SECURE: Named parameters
await mysql.query('SELECT * FROM users WHERE id = :userId', { userId })
await mysql.query('SELECT * FROM items WHERE name LIKE :search', { search: `%${search}%` })

// CRITICAL: Unbounded query
await mysql.query('SELECT * FROM items WHERE status = :status', { status })

// SECURE: With limit
await mysql.query('SELECT * FROM items WHERE status = :status LIMIT 1000', { status })

// WARNING: Dynamic column names (can't parameterize)
await mysql.query(`SELECT ${columns} FROM items`)  // Validate columns first!

// SECURE: Whitelist columns
const allowedColumns = ['id', 'name', 'price']
const safeColumns = columns.filter(c => allowedColumns.includes(c))
await mysql.query(`SELECT ${safeColumns.join(',')} FROM items`)
```

---

## 2. Transactions

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Multi-table ops in transaction | `START TRANSACTION` | Data consistency |
| ROLLBACK in catch | `catch { ROLLBACK }` | Cleanup on error |
| Connection released | `finally { release() }` | Connection pool |
| Deadlock handling | Retry on deadlock | Resilience |

### Detection Patterns

```javascript
// CRITICAL: Multi-table without transaction
await mysql.query('INSERT INTO orders ...')
await mysql.query('UPDATE inventory SET quantity = quantity - 1 ...')
await mysql.query('INSERT INTO order_items ...')
// If any fails, data is inconsistent!

// SECURE: With transaction
const connection = await mysql.getConnection()
try {
  await connection.query('START TRANSACTION')
  await connection.query('INSERT INTO orders ...')
  await connection.query('UPDATE inventory SET quantity = quantity - 1 ...')
  await connection.query('INSERT INTO order_items ...')
  await connection.query('COMMIT')
} catch (e) {
  await connection.query('ROLLBACK')
  throw e
} finally {
  connection.release()
}

// WARNING: No deadlock handling
try {
  await runTransaction()
} catch (e) {
  throw e  // Deadlock causes permanent failure
}

// SECURE: Retry on deadlock
const MAX_RETRIES = 3
for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    await runTransaction()
    break
  } catch (e) {
    if (e.code === 'ER_LOCK_DEADLOCK' && i < MAX_RETRIES - 1) {
      await sleep(100 * (i + 1))  // Exponential backoff
      continue
    }
    throw e
  }
}
```

---

## 3. Schema Changes

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Column removal has migration | Check readers first | Breaking change |
| Index added for new WHERE | `CREATE INDEX` | Query performance |
| NOT NULL has default | `DEFAULT value` | Existing rows |
| Foreign key has ON DELETE | `ON DELETE CASCADE/SET NULL` | Referential integrity |

### Detection Patterns

```sql
-- CRITICAL: Removing column without checking readers
ALTER TABLE items DROP COLUMN stable_price;
-- Search all repos for 'stable_price' first!

-- WARNING: Adding NOT NULL without default
ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL;
-- Fails if table has existing rows!

-- SECURE: With default
ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL DEFAULT FALSE;

-- WARNING: Missing index on frequently queried column
SELECT * FROM items WHERE status = 'active' AND game_id = 730;
-- If no index on (status, game_id), full table scan!

-- SECURE: Add composite index
CREATE INDEX idx_items_status_game ON items(status, game_id);

-- WARNING: Foreign key without ON DELETE
ALTER TABLE order_items ADD FOREIGN KEY (order_id) REFERENCES orders(id);
-- What happens when order deleted?

-- SECURE: Specify behavior
ALTER TABLE order_items ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
```

---

## 4. Query Performance

### WARNING - Should Check

| Check | Pattern | Why |
|-------|---------|-----|
| No SELECT * | List specific columns | Network, memory |
| Indexes used | EXPLAIN shows index | Query speed |
| No N+1 queries | Query in loop | Performance |
| Pagination for large results | LIMIT + OFFSET | Memory |

### Detection Patterns

```javascript
// WARNING: SELECT * (fetches all columns)
await mysql.query('SELECT * FROM items WHERE id = :id', { id })

// SECURE: Specific columns
await mysql.query('SELECT id, name, price FROM items WHERE id = :id', { id })

// CRITICAL: N+1 query pattern
const users = await mysql.query('SELECT * FROM users')
for (const user of users) {
  const orders = await mysql.query('SELECT * FROM orders WHERE user_id = :userId', { userId: user.id })
  // N+1 queries!
}

// SECURE: JOIN or batch query
const usersWithOrders = await mysql.query(`
  SELECT u.*, o.* FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
`)

// Or batch:
const userIds = users.map(u => u.id)
const orders = await mysql.query('SELECT * FROM orders WHERE user_id IN (:userIds)', { userIds })

// WARNING: No pagination
const items = await mysql.query('SELECT * FROM items')  // Could be millions!

// SECURE: Paginated
const items = await mysql.query('SELECT * FROM items LIMIT :limit OFFSET :offset', { limit: 100, offset: page * 100 })
```

---

## 5. Redis Operations

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| TTL on all cache keys | `setEx()` not `set()` | Memory leak |
| Key naming consistent | `prefix:${id}:suffix` | Maintainability |
| Large values compressed | JSON.stringify + compress | Memory |
| Pipeline for batch ops | `multi()...exec()` | Performance |

### Detection Patterns

```javascript
// CRITICAL: No TTL - memory leak
await redis.set(`cache:${userId}`, JSON.stringify(data))

// SECURE: With TTL
await redis.setEx(`cache:${userId}`, 3600, JSON.stringify(data))

// WARNING: Inconsistent key patterns
await redis.get(`user_${userId}`)      // underscore
await redis.get(`user:${otherId}`)     // colon
await redis.get(`USER:${anotherId}`)   // uppercase

// SECURE: Consistent pattern with constants
const KEYS = {
  user: (id) => `user:${id}`,
  inventory: (steamId, gameId) => `inv:${steamId}:${gameId}`,
}
await redis.get(KEYS.user(userId))

// WARNING: Multiple individual operations
for (const key of keys) {
  await redis.get(key)  // N round trips!
}

// SECURE: Pipeline
const pipeline = redis.pipeline()
for (const key of keys) {
  pipeline.get(key)
}
const results = await pipeline.exec()

// WARNING: Large value without compression
const largeData = { items: [...thousandsOfItems] }
await redis.setEx(key, 3600, JSON.stringify(largeData))  // Could be MBs!

// SECURE: Compress large values
const compressed = await compress(JSON.stringify(largeData))
await redis.setEx(`${key}:compressed`, 3600, compressed)
```

---

## 6. Redis Key Changes (Breaking)

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Key pattern change | Search all consumers | Breaking change |
| Key prefix change | Update all services | Data loss |
| TTL significantly changed | Verify cache strategy | Stale data |

### Consumer Search Required

```bash
# Key pattern changed from `user:${id}` to `u:${id}`
grep -rn "user:" tradeit-backend/
grep -rn "user:" tradeit-socket-server/
grep -rn "user:" pricing-manager/

# Check by-database.md for Redis consumers
cat .agents/_indexes/by-database.md | grep "Redis"
```

### Common Key Patterns (DO NOT CHANGE without migration)

```javascript
// User data
`ud:${steamId}`                    // User data cache
`steamLevel:${steamId}`            // Steam level cache

// Inventory
`cinv:${steamId}:${gameId}:compressed`  // Compressed inventory
`sinv:${steamId}:${gameId}`             // Store inventory

// Insight
`insight_chart:${gameId}:${slug}`       // Chart data cache
`insight_chart_item_details:${gameId}:${itemId}`

// Session
`sess:${sessionId}`                // User session

// Queue
`bull:${queueName}:*`              // Bull queue keys
```

---

## 7. Migration Safety

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Backward compatible | Old code still works | Zero-downtime deploy |
| Reversible | Can rollback | Safety |
| Tested on copy | Run on staging first | Catch issues |
| Large table handled | pt-online-schema-change | Lock avoidance |

### Detection Patterns

```sql
-- CRITICAL: Non-backward compatible change
ALTER TABLE users RENAME COLUMN email TO email_address;
-- Old code using 'email' will break!

-- SECURE: Add new, migrate, remove old
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);
UPDATE users SET email_address = email;
-- Deploy code that uses both
-- Later: ALTER TABLE users DROP COLUMN email;

-- WARNING: Large table ALTER without pt-osc
ALTER TABLE items ADD INDEX idx_price (price);
-- On 10M+ row table, this locks for minutes!

-- SECURE: Use pt-online-schema-change
pt-online-schema-change --alter "ADD INDEX idx_price (price)" D=tradeit,t=items
```

---

## 8. Data Integrity

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Unique constraints | `UNIQUE INDEX` | Prevent duplicates |
| Foreign keys | `REFERENCES` | Referential integrity |
| Check constraints | `CHECK (price >= 0)` | Data validation |
| NOT NULL where required | `NOT NULL` | Prevent nulls |

---

## Quick Checklist

Copy this for PR reviews:

```markdown
## Database Review

### MySQL Queries
- [ ] Named parameters used (not string concatenation)
- [ ] LIMIT on SELECT queries
- [ ] No SELECT * (specific columns listed)
- [ ] Indexes exist for WHERE/JOIN columns

### Transactions
- [ ] Multi-table operations in transaction
- [ ] ROLLBACK in catch block
- [ ] Connection released in finally
- [ ] Deadlock retry logic (if applicable)

### Schema Changes
- [ ] Column removal checked against all readers
- [ ] New columns have defaults (if NOT NULL)
- [ ] Indexes added for new query patterns
- [ ] Migration is backward compatible

### Redis
- [ ] TTL on all cache keys (setEx, not set)
- [ ] Key naming follows conventions
- [ ] Large values compressed
- [ ] Pipeline used for batch operations

### Breaking Changes
- [ ] No column removed without consumer check
- [ ] No Redis key pattern changed without migration
- [ ] Schema change tested on staging

### Consumer Search (if schema changed)
- [ ] Checked by-database.md for table readers
- [ ] Searched all repos for column name
- [ ] Searched all repos for Redis key pattern
```
