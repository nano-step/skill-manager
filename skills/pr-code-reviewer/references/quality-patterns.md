# Quality Patterns

## Type Safety
```typescript
// WARNING: any type
const data: any = getData();

// BETTER: Proper typing
interface UserData { id: string; name: string; }
const data: UserData = getData();
```

## Error Handling
```javascript
// CRITICAL: Silent catch
try { await doSomething(); } catch (e) { }

// BETTER: Proper handling
try {
  await doSomething();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new CustomError('Operation failed', error);
}
```
