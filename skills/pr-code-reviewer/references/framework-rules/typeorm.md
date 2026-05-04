# TypeORM Code Review Rules

## Critical Rules
- Raw SQL with string interpolation → SQL injection risk
- Missing `@Transaction()` on multi-entity operations
- Forgetting to `await` repository methods → silent failures
- Using `save()` in loops → N+1 writes, use `save([entities])`

## Warning Rules
- N+1 query pattern → use `relations` option or `leftJoinAndSelect`
- Missing indexes on frequently queried columns
- Using `find()` without `take` limit on large tables
- Eager loading too many relations → performance hit

## Suggestions
- Use QueryBuilder for complex queries
- Use `@Index()` decorator for query optimization
- Use `createQueryBuilder().insert()` for bulk inserts
- Consider `@DeleteDateColumn()` for soft deletes

## Detection Patterns

```typescript
// CRITICAL: SQL injection
repository.query(`SELECT * FROM users WHERE name = '${name}'`)

// SECURE: Parameterized
repository.query('SELECT * FROM users WHERE name = ?', [name])

// CRITICAL: N+1 in loop
for (const user of users) {
  await userRepo.save(user)  // N writes
}

// SECURE: Batch save
await userRepo.save(users)  // 1 write

// WARNING: N+1 query
const users = await userRepo.find()
for (const user of users) {
  const posts = await postRepo.find({ where: { userId: user.id } })
}

// SECURE: Eager load
const users = await userRepo.find({ relations: ['posts'] })

// WARNING: Missing limit
await userRepo.find({ where: { status: 'active' } })  // could return millions

// SECURE: With limit
await userRepo.find({ where: { status: 'active' }, take: 100 })
```
