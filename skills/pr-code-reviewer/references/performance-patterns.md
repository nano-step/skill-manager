# Performance Patterns

## N+1 Queries
```javascript
// CRITICAL: N+1 pattern
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
}

// SECURE: Eager loading
const users = await db.query(`
  SELECT u.*, p.* FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
`);
```

## React Re-renders
```jsx
// WARNING: Inline function
<button onClick={() => handleClick(id)}>

// BETTER: useCallback
const handleClick = useCallback(() => { ... }, [id]);
<button onClick={handleClick}>
```
