# Next.js Code Review Rules

## Critical Rules

### Data Fetching
- `getServerSideProps` fetching data that doesn't change per-request → use `getStaticProps` + ISR
- Missing `revalidate` in `getStaticProps` for dynamic content → stale data
- Calling internal API routes from `getServerSideProps` → call the handler function directly
- `fetch` in Server Components without `{ cache: 'no-store' }` when fresh data required → unexpected caching

### Routing & Navigation
- `useRouter().push()` for external URLs → use `window.location.href`
- Missing `loading.tsx` for slow data fetches → no loading state shown
- Dynamic route params accessed before null check → crash on direct URL access

### App Router (Next.js 13+)
- `'use client'` on a component that has no client-side interactivity → unnecessary client bundle
- `useState` / `useEffect` in Server Component → runtime error
- Passing non-serializable props from Server → Client component → crash

### Server Actions
- No input validation in Server Actions → security hole
- Missing `revalidatePath` / `revalidateTag` after mutations → stale cache

## Warning Rules

### Performance
- Large `node_modules` imports in `'use client'` components → bundle bloat (use dynamic imports)
- Missing `next/image` for `<img>` tags → no lazy loading / optimization
- Missing `next/font` for Google Fonts → layout shift (CLS)
- `useEffect` for data fetching → waterfall; prefer Server Components

### Auth & Security
- Middleware not protecting `/api` routes that require auth
- `cookies()` / `headers()` in cached Server Components → dynamic rendering forced silently
- Sensitive env vars without `NEXT_PUBLIC_` prefix check — public prefix exposes to client

## Suggestions
- Use `next/dynamic` for heavy components with `ssr: false` when not needed server-side
- Use `unstable_cache` for expensive DB queries in Server Components
- Wrap `<Suspense>` around async Server Components for streaming

## Detection Patterns

```tsx
// CRITICAL: useState in Server Component
// app/page.tsx (no 'use client')
const [count, setCount] = useState(0)  // Error: hooks in Server Component

// CRITICAL: internal API fetch in getServerSideProps
export async function getServerSideProps() {
  const res = await fetch('http://localhost:3000/api/data')  // Wrong
  // Should: import and call the handler directly
}

// WARNING: img instead of next/image
<img src={user.avatar} />  // Use <Image> from 'next/image'
```
