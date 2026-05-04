# Vue 3 / Nuxt 3 Code Review Rules

## Critical Rules

### State Management (Vuex ↔ Pinia)
- `rootState.{module}` where module is Pinia store → Vuex cannot access Pinia state
- `useStore()` in Pinia-only context → wrong store type
- Store module exists but not registered in `store/index.js`
- Pinia store file missing `export` or `defineStore`

### Auto-Import Gotchas (Nuxt)
- Using function from `utils/` without import → only `composables/` auto-imported
- Using `defineStore` without import when `@pinia/nuxt` not in modules

### Component Issues
- Mutating props directly
- `v-if` and `v-for` on same element

## Warning Rules

### State Management
- Mixed `useStore()` and `use*Store()` in same composable
- Vuex action accessing Pinia store via workaround
- `rootState.{x}` or `rootGetters['{x}/...']` → verify module exists

### Reactivity
- Using `reactive()` for primitives → use `ref()`
- Destructuring reactive object without `toRefs()` or `storeToRefs()`
- Missing `.value` on ref in script (not template)

### Composables
- Composable not returning reactive refs
- Using `this` in composable (not available in setup)

## Suggestions
- Use `storeToRefs()` when destructuring Pinia store
- Use `computed` for derived state
- Prefer Pinia for new stores (migration in progress)
- Use `<script setup>` syntax for components

## Detection Patterns

```javascript
// CRITICAL: Vuex accessing Pinia (will be undefined)
rootState.currency.selectedRate  // if currency is Pinia store

// WARNING: Check if module exists
rootState.{moduleName}  // verify in store/index.js modules: { {moduleName} }

// CRITICAL: Missing import in utils (not auto-imported)
// In component using function from utils/helpers.js without import
stripImageSizeFromUrl(url)  // will be undefined if not imported
```
