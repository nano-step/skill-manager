# Frontend Vue/Nuxt Checklist

Comprehensive review checklist for Vue 3/Nuxt 3 frontend PRs (tradeit, tradeit-admin, audit-dashboard-frontend, etc.)

---

## 1. State Management

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Vuex vs Pinia correct | `rootState.x` vs `useXStore()` | Vuex can't access Pinia |
| Store registered | Module in `store/index.js` | Undefined state |
| Computed get/set pattern | `computed({ get, set })` | Two-way binding |
| storeToRefs for destructuring | `storeToRefs(store)` | Maintains reactivity |

### Detection Patterns

```javascript
// CRITICAL: Vuex accessing Pinia store (will be undefined)
// In Vuex action:
const rate = rootState.currency.selectedRate  // currency is Pinia!

// SECURE: Use Pinia directly
import { useCurrencyStore } from '~/store/useCurrencyStore'
const currencyStore = useCurrencyStore()
const rate = currencyStore.selectedRate

// CRITICAL: Store not registered
// store/index.js missing:
modules: {
  // currency: currencyModule  // MISSING!
}

// WARNING: Destructuring loses reactivity
const { items, loading } = useInventoryStore()  // Not reactive!

// SECURE: Use storeToRefs
const store = useInventoryStore()
const { items, loading } = storeToRefs(store)

// CRITICAL: Direct mutation (Vuex)
state.items.push(newItem)  // Mutation outside mutation handler!

// SECURE: Use mutation
commit('ADD_ITEM', newItem)
```

---

## 2. Reactivity

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| ref() for primitives | `ref(0)` not `reactive(0)` | reactive() doesn't work on primitives |
| .value in script | `count.value++` | Required for refs in script |
| toRefs for destructuring | `toRefs(props)` | Maintains reactivity |
| No direct prop mutation | `emit('update:x', newVal)` | One-way data flow |

### Detection Patterns

```javascript
// WARNING: reactive() on primitive
const count = reactive(0)  // Won't work!

// SECURE: ref() for primitives
const count = ref(0)

// CRITICAL: Missing .value in script
const count = ref(0)
count++  // Wrong! count is a ref object

// SECURE: Use .value
count.value++

// CRITICAL: Mutating prop directly
props.items.push(newItem)  // Mutating parent state!

// SECURE: Emit event
emit('add-item', newItem)

// WARNING: Destructuring props loses reactivity
const { modelValue } = defineProps(['modelValue'])
watch(modelValue, ...)  // Won't trigger!

// SECURE: Use toRefs or computed
const props = defineProps(['modelValue'])
watch(() => props.modelValue, ...)
```

---

## 3. Network Calls

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Use getAxiosInstance() | Not raw axios | Includes auth, base URL |
| Error handling | try/catch or .catch() | User feedback |
| Loading state managed | `loading.value = true/false` | UX |
| Response fields validated | Check before access | Defensive coding |

### Detection Patterns

```javascript
// WARNING: Raw axios
import axios from 'axios'
const { data } = await axios.get('/api/user')

// SECURE: Use instance
import { getAxiosInstance } from '~/network/axiosInstance'
const axios = getAxiosInstance()
const { data } = await axios.get('/api/user')

// CRITICAL: No error handling
const fetchData = async () => {
  const { data } = await axios.get('/api/items')
  items.value = data.items
}

// SECURE: With error handling
const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await axios.get('/api/items')
    items.value = data.items
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// CRITICAL: Assuming response field exists (PR #1101 issue!)
const imgUrl = item.imgURL  // undefined if backend changed!

// SECURE: Defensive access
const imgUrl = item.imgURL ?? getFallbackImage(item.groupId)
```

---

## 4. Component Patterns

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Props typed | `defineProps<{ x: string }>()` | Type safety |
| Emits declared | `defineEmits(['update:x'])` | Documentation |
| v-if/v-for not on same element | Use template wrapper | Vue limitation |
| Key on v-for | `:key="item.id"` | Efficient updates |

### Detection Patterns

```vue
<!-- CRITICAL: v-if and v-for on same element -->
<div v-for="item in items" v-if="item.active">  <!-- Wrong! -->

<!-- SECURE: Use template -->
<template v-for="item in items" :key="item.id">
  <div v-if="item.active">...</div>
</template>

<!-- WARNING: Missing key -->
<div v-for="item in items">  <!-- No key! -->

<!-- SECURE: With key -->
<div v-for="item in items" :key="item.id">

<!-- WARNING: Untyped props -->
const props = defineProps(['modelValue', 'items'])

<!-- SECURE: Typed props -->
interface Props {
  modelValue: string
  items: Item[]
}
const props = defineProps<Props>()
```

---

## 5. Composables

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Returns reactive refs | `return { items, loading }` | Reactivity preserved |
| No `this` usage | Composables don't have `this` | Runtime error |
| Cleanup on unmount | `onUnmounted(() => ...)` | Memory leaks |
| Named exports | `export function useX()` | Tree shaking |

### Detection Patterns

```javascript
// CRITICAL: Using this in composable
export function useInventory() {
  this.items = []  // TypeError! No 'this' in composables
}

// SECURE: Use refs
export function useInventory() {
  const items = ref([])
  return { items }
}

// WARNING: Not returning reactive
export function useCounter() {
  let count = 0  // Not reactive!
  return { count }
}

// SECURE: Return refs
export function useCounter() {
  const count = ref(0)
  return { count }
}

// WARNING: No cleanup
export function useWebSocket() {
  const ws = new WebSocket(url)
  // Never closed!
}

// SECURE: Cleanup on unmount
export function useWebSocket() {
  const ws = new WebSocket(url)
  onUnmounted(() => ws.close())
  return { ws }
}
```

---

## 6. Nuxt-Specific

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Client-only code guarded | `import.meta.client` | SSR errors |
| Auto-imports from composables/ | Not utils/ | Only composables auto-imported |
| useFetch for SSR data | Not axios in setup | SSR hydration |
| definePageMeta for layouts | `definePageMeta({ layout: 'x' })` | Nuxt convention |

### Detection Patterns

```javascript
// CRITICAL: Browser API in SSR
const width = window.innerWidth  // ReferenceError on server!

// SECURE: Guard with import.meta.client
const width = import.meta.client ? window.innerWidth : 0

// Or use onMounted
onMounted(() => {
  width.value = window.innerWidth
})

// CRITICAL: Using function from utils/ without import
// In component:
stripImageSizeFromUrl(url)  // undefined! utils/ not auto-imported

// SECURE: Import explicitly
import { stripImageSizeFromUrl } from '~/utils/helpers'

// WARNING: axios in setup (SSR issues)
const { data } = await axios.get('/api/items')

// SECURE: useFetch for SSR
const { data } = await useFetch('/api/items')
```

---

## 7. i18n / Localization

### WARNING - Should Check

| Check | Pattern | Why |
|-------|---------|-----|
| No hardcoded strings | Use `$t('key')` | Localization |
| Keys exist in locale files | Check en.js | Runtime errors |
| Interpolation correct | `$t('key', { name })` | Dynamic content |

### Detection Patterns

```vue
<!-- WARNING: Hardcoded string -->
<button>Submit</button>

<!-- SECURE: Use i18n -->
<button>{{ $t('common.submit') }}</button>

<!-- WARNING: Missing interpolation -->
<p>{{ $t('welcome') }}</p>  <!-- "Welcome, {name}" shows literally -->

<!-- SECURE: With interpolation -->
<p>{{ $t('welcome', { name: user.name }) }}</p>
```

---

## 8. Images & CDN

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Use useCDNImage() | Not raw URLs | CDN optimization |
| ImageWithFallback component | For item images | Handles missing images |
| Lazy loading | `loading="lazy"` | Performance |

### Detection Patterns

```vue
<!-- WARNING: Raw image URL -->
<img :src="item.imgURL">  <!-- No fallback if undefined! -->

<!-- SECURE: Use ImageWithFallback -->
<ImageWithFallback :src="item.imgURL" :fallback="getFallback(item)" />

<!-- WARNING: No lazy loading -->
<img :src="url">

<!-- SECURE: Lazy load -->
<img :src="url" loading="lazy">
```

---

## 9. Breaking Change Detection

### Auto-Flag These Changes

| Signal | Severity | Action |
|--------|----------|--------|
| Store module removed | CRITICAL | Search all consumers |
| Composable return value changed | CRITICAL | Search all usages |
| Network function signature changed | CRITICAL | Search all callers |
| Component prop removed | WARNING | Search all usages |
| Emit event renamed | WARNING | Search parent listeners |

### Consumer Search Required

```bash
# For store changes
grep -rn "useXStore" ./
grep -rn "rootState.x" ./

# For composable changes
grep -rn "useComposable" ./

# For component changes
grep -rn "<ComponentName" ./
```

---

## 10. Performance Checks

### WARNING - Should Check

| Check | Pattern | Why |
|-------|---------|-----|
| Large lists virtualized | `vue-virtual-scroller` | Memory |
| Computed for derived state | Not methods | Caching |
| v-once for static content | `<div v-once>` | Skip re-renders |
| Async components for heavy | `defineAsyncComponent` | Code splitting |

---

## Quick Checklist

Copy this for PR reviews:

```markdown
## Vue/Nuxt Frontend Review

### State Management
- [ ] Vuex/Pinia used correctly (not mixed)
- [ ] Store modules registered
- [ ] storeToRefs used for destructuring
- [ ] No direct state mutation

### Reactivity
- [ ] ref() for primitives, reactive() for objects
- [ ] .value used in script
- [ ] Props not mutated directly

### Network
- [ ] getAxiosInstance() used (not raw axios)
- [ ] Error handling present
- [ ] Loading states managed
- [ ] Response fields validated (defensive)

### Components
- [ ] Props typed with TypeScript
- [ ] Emits declared
- [ ] v-if/v-for not on same element
- [ ] Keys on v-for

### Nuxt-Specific
- [ ] Client-only code guarded (import.meta.client)
- [ ] Auto-imports only from composables/
- [ ] useFetch for SSR data

### i18n
- [ ] No hardcoded user-facing strings
- [ ] $t() keys exist in locale files

### Images
- [ ] useCDNImage() or ImageWithFallback used
- [ ] Fallbacks for missing images

### Breaking Changes
- [ ] No store modules removed without consumer check
- [ ] No composable signatures changed without search
- [ ] No component props removed without search
```
