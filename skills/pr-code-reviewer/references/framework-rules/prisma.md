# Prisma Code Review Rules

## Critical Rules

### Data Safety
- `prisma.user.deleteMany({})` with empty where → deletes all rows
- Raw queries with string interpolation → SQL injection (`prisma.$queryRaw` must use tagged template literal `Prisma.sql`)
- Missing `select` / `omit` on queries that return sensitive fields (e.g., `password`, `token`) → data leak
- `prisma.$transaction` with non-atomic operations that should be atomic → partial write on failure

### Migrations
- Renaming a column by adding new + deleting old in one migration → data loss if deployed without backfill
- `@default(now())` added to existing non-nullable column → migration fails on non-empty table
- Missing `migrate deploy` step noted in release process for schema changes

## Warning Rules

### Performance
- `findMany` without `take` (limit) → unbounded query, potential OOM
- N+1: loop calling `findUnique` per item → use `findMany` with `in` filter or `include`
- Missing `index` on columns used in `where`, `orderBy`, or `join` → full table scan
- `include` nesting 3+ levels deep → over-fetching

### Patterns
- Using `upsert` when only create or only update is semantically correct → confusing intent
- `update` without checking record exists → silent no-op if not found (use `update` which throws, not `upsert`)
- Accessing `prisma` directly in route handlers → should go through a repository/service layer

## Suggestions
- Use `select` to fetch only needed columns (reduces payload size)
- Use `prisma.$transaction([...])` for related writes that must succeed together
- Add `@@index` directives for common query patterns in schema

## Detection Patterns

```typescript
// CRITICAL: SQL injection via raw query
const user = await prisma.$queryRaw(`SELECT * FROM users WHERE id = ${userId}`)
// SAFE:
const user = await prisma.$queryRaw(Prisma.sql`SELECT * FROM users WHERE id = ${userId}`)

// CRITICAL: missing field exclusion
const user = await prisma.user.findUnique({ where: { id } })
// user.password is returned — should use select or omit

// WARNING: N+1
for (const order of orders) {
  const user = await prisma.user.findUnique({ where: { id: order.userId } })
}
// FIX: findMany with where: { id: { in: orders.map(o => o.userId) } }

// WARNING: unbounded query
const all = await prisma.product.findMany()  // missing take:
```
