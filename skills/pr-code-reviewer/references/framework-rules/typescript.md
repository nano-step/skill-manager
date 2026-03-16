# TypeScript Code Review Rules

## Critical Rules
- Using `any` type to bypass type checking
- Using `@ts-ignore` or `@ts-expect-error` without justification
- Type assertion (`as Type`) on untrusted external data
- Missing null checks before accessing optional properties

## Warning Rules
- Non-null assertion (`!`) without prior validation
- Using `as unknown as Type` double assertion
- Implicit `any` from missing return types
- Using `Object` or `{}` as type → too permissive

## Suggestions
- Use `unknown` instead of `any` for external data, then narrow
- Use discriminated unions for state machines
- Use `satisfies` operator for type checking without widening
- Use `readonly` for immutable data structures

## Detection Patterns

```typescript
// CRITICAL: any type
const data: any = await fetchData()
data.whatever.you.want  // no type safety

// SECURE: unknown + narrowing
const data: unknown = await fetchData()
if (isUserData(data)) {
  data.name  // type-safe
}

// CRITICAL: Unsafe assertion
const user = JSON.parse(input) as User  // input could be anything

// SECURE: Runtime validation
const user = userSchema.parse(JSON.parse(input))  // zod/yup validation

// WARNING: Non-null assertion without check
function process(user?: User) {
  return user!.name  // crashes if undefined
}

// SECURE: With guard
function process(user?: User) {
  if (!user) throw new Error('User required')
  return user.name
}
```
