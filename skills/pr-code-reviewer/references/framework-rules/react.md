# React Code Review Rules

## Critical Rules

### Hooks
- Hooks called conditionally → violates Rules of Hooks, runtime error
- `useEffect` with missing dependency → stale closure / infinite loop
- `useEffect` with object/array literal in deps → new reference every render, infinite loop
- Mutating state directly (`state.items.push(x)`) → no re-render triggered

### State & Props
- Derived state stored in `useState` when it can be computed inline → sync issues
- Prop drilling 3+ levels deep without context or state manager → maintenance burden (flag as warning)
- Reading stale ref value in async callback after unmount → memory leak / crash

### Event Handling
- Missing cleanup in `useEffect` (subscriptions, timers, event listeners) → memory leak
- `onClick` on non-interactive element without keyboard equivalent → accessibility gap

## Warning Rules

### Performance
- Anonymous functions / object literals as props to memoized components → memo is bypassed
- Missing `useCallback` on functions passed to child components with `React.memo`
- Large lists rendered without virtualization (`react-window` / `react-virtual`) → slow paint
- `useContext` on frequently-changing context → unnecessary re-renders

### Patterns
- `index` as `key` in lists that can reorder/filter → wrong element reconciled
- Multiple `useState` for related state → use `useReducer`
- `useEffect` for synchronizing with external system vs for side effects — distinguish them

## Suggestions
- Use `React.lazy` + `<Suspense>` for code-splitting heavy routes
- Consider `useMemo` for expensive calculations with stable inputs
- Use `<ErrorBoundary>` around async components

## Detection Patterns

```tsx
// CRITICAL: conditional hook
if (user) {
  const [name, setName] = useState(user.name)  // Error: conditional hook
}

// CRITICAL: missing cleanup
useEffect(() => {
  const sub = eventBus.subscribe(handler)
  // Missing: return () => sub.unsubscribe()
}, [])

// CRITICAL: stale closure
useEffect(() => {
  setInterval(() => {
    console.log(count)  // stale if count not in deps
  }, 1000)
}, [])  // Missing: count in deps

// WARNING: object literal breaks memo
<MyMemo style={{ color: 'red' }} />  // new object every render
```
