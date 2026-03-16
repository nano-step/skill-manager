# Consumer Search Matrix

When reviewing PRs, use this matrix to determine WHAT to search and WHERE.

## Quick Reference

| Change Type | Search Repos | Search Patterns | Severity |
|-------------|--------------|-----------------|----------|
| API response field removed/renamed | tradeit, tradeit-admin, tradeit-extension | `.{fieldName}`, `{fieldName}:`, `data.{fieldName}` | 🔴 CRITICAL |
| API endpoint path changed | All frontend repos | `/api/v2/{path}`, network/*.js | 🔴 CRITICAL |
| Database column removed | From by-database.md readers | `{column_name}`, `{camelCaseName}` | 🔴 CRITICAL |
| Redis key pattern changed | tradeit-backend, tradeit-socket-server | Exact key string, key prefix | 🟡 WARNING |
| External URL pattern changed | tradeit, tradeit-admin | Field name holding URL | 🔴 CRITICAL |
| Middleware removed | Same repo | `httpContext.get()`, middleware name | 🟡 WARNING |
| Socket event changed | tradeit-socket-server, tradeit | `socket.on()`, `socket.emit()` | 🔴 CRITICAL |
| Enum/constant changed | All repos importing enums | Enum name, literal value | 🟡 WARNING |

---

## 1. API Response Field Changes

### Detection
- Diff shows field removed/renamed in `res.success()` or return statement
- Controller response shape changed
- Service return value modified

### Search Scope

**tradeit-backend changes → Search:**
| Repo | Location | Pattern |
|------|----------|---------|
| tradeit | `network/*.js` | Response destructuring |
| tradeit | `composables/*.js` | Data field access |
| tradeit | `components/**/*.vue` | Template bindings |
| tradeit-admin | `api/*.js`, `services/*.js` | API consumers |
| tradeit-extension | `src/background/*.js` | Extension API calls |

### Search Patterns
```bash
# Field removed: "imgURL"
grep -rn "\.imgURL" tradeit/
grep -rn "imgURL:" tradeit/
grep -rn "item\.imgURL" tradeit/
grep -rn "data\.imgURL" tradeit/

# Destructuring pattern
grep -rn "{ imgURL" tradeit/
grep -rn "{ .*imgURL.*}" tradeit/
```

### Critical Fields (NEVER remove without migration)

**User Data** (`/api/v2/user/data`):
- `balance`, `storeBalance`, `steamId`, `email`
- `firstTradeBonus`, `stripeAccountId`
- `likedItemMap`, `likedAssetMap`
- `currencyPreference`, `tickets`

**Inventory** (`/api/v2/inventory/*`):
- `items[]`, `reserveAssetIds`, `tradeAwayAssetIds`
- `assetId`, `imgURL`, `price`, `name`
- `chartData`, `appId`, `groupId`

**Trade** (`/api/v2/trade/*`):
- `success`, `message`, `tradesInfo`
- `trades[]`, `tradeId`, `status`

**Insight** (`/api/v2/insight/*`):
- `chartData`, `stockData`, `marketContent`
- `sections`, `stats`

---

## 2. API Endpoint Path Changes

### Detection
- Route definition changed in `routes/*.js`
- HTTP method changed (GET→POST)
- Path parameter renamed

### Search Scope
```bash
# Search all frontend repos for API path
grep -rn "/api/v2/insight" tradeit/network/
grep -rn "/api/v2/insight" tradeit-admin/
grep -rn "insight" tradeit/network/*.js
```

### Network File Mapping

| Backend Route File | Frontend Network File |
|-------------------|----------------------|
| `routes/user.js` | `network/userNetwork.js` |
| `routes/inventory.js` | `network/inventoryNetwork.js` |
| `routes/trade.js` | `network/tradeNetwork.js` |
| `routes/sell.js` | `network/sellNetwork.js` |
| `routes/insight.js` | `network/insightNetwork.js` |
| `routes/meta.js` | `network/metaNetwork.js` |
| `routes/steam.js` | `network/steamNetwork.js` |
| `routes/stripe.js` | `network/paymentNetwork.js` |
| `routes/giveaway.js` | `network/giveawayNetwork.js` |
| `routes/skinCollection.js` | `network/skinCollectionNetwork.js` |
| `routes/coupons.js` | `network/couponNetwork.js` |
| `routes/oauth2.js` | `network/oauth2Network.js` |
| `routes/guessGame.js` | `network/guessGameNetwork.js` |
| `routes/invest.js` | `network/investNetwork.js` |

---

## 3. Database Schema Changes

### Detection
- SQL query column list changed
- Migration file added
- Repository method modified

### Search Scope (from by-database.md)

| Table | Owner (Write) | Readers (Search These) |
|-------|---------------|------------------------|
| `item_prices` | pricing-manager | tradeit-backend, tradeit-service |
| `trades` | tradeit-backend | tradeit-service, tradeit-admin-backend |
| `users` | tradeit-backend | ALL services |
| `items_meta` | bymykel-scraper | tradeit-backend, pricing-manager |
| `pro_players` | pro-settings-scraper | tradeit-backend |

### Search Patterns
```bash
# Column "stable_price" removed
grep -rn "stable_price" tradeit-backend/server/repository/
grep -rn "stablePrice" tradeit-backend/server/  # camelCase version
grep -rn "stablePrice" tradeit/  # frontend usage
```

---

## 4. Redis Key Changes

### Detection
- Redis key pattern changed in `redis/*.js`
- Key prefix modified
- TTL changed significantly

### Search Scope
| Repo | Redis Usage |
|------|-------------|
| tradeit-backend | Session, cache, pubsub, queue |
| tradeit-socket-server | Pubsub, real-time state |
| pricing-manager | Price cache |
| tradeit-inventory-server | Inventory cache |

### Common Key Patterns
```javascript
// Inventory cache
`cinv:${steamId}:${gameId}:compressed`
`sinv:${steamId}:${gameId}`

// User data
`ud:${steamId}`
`steamLevel:${steamId}`

// Insight cache
`insight_chart:${gameId}:${slug}`
`insight_chart_item_details:${gameId}:${itemId}`
```

---

## 5. External URL Pattern Changes

### Detection
- URL template changed (CDN, Steam, etc.)
- Conditional URL logic removed
- Domain changed

### Example: imgURL Change (PR #1101)
```javascript
// BEFORE (conditional)
imgURL: iconUrl 
  ? `https://steamcommunity-a.akamaihd.net/economy/image/${iconUrl}/140fx140f` 
  : `${process.env.TRADEIT_API_URL}static/img/items-webp-256/${groupId}.webp`

// AFTER (always Steam CDN)
imgURL: `https://steamcommunity-a.akamaihd.net/economy/image/${iconUrl}/256fx256f`
```

### Search for URL consumers
```bash
# Find all imgURL usages
grep -rn "imgURL" tradeit/composables/
grep -rn "imgURL" tradeit/components/
grep -rn "\.imgURL" tradeit/

# Found 30+ usages in PR #1101 review
```

---

## 6. Middleware/Context Changes

### Detection
- Middleware removed from `index.js`
- `httpContext.set()` removed
- Request context field removed

### Search Scope (same repo)
```bash
# Analytics middleware removed
grep -rn "httpContext.get('analytics')" server/
grep -rn "analyticsService" server/
```

### Common Context Keys
- `analytics` - Analytics instance
- `mysqlConnection` - DB connection
- `requestId` - Request tracking
- `logger` - Request-scoped logger

---

## 7. Socket Event Changes

### Detection
- Event name changed in emit/on calls
- Event payload structure changed
- Channel/room changed

### Search Scope
| Change In | Search |
|-----------|--------|
| tradeit-backend | tradeit-socket-server, tradeit |
| tradeit-socket-server | tradeit, tradeit-admin |

### Common Events
```javascript
// Trade events
'trade:created', 'trade:updated', 'trade:completed'

// Inventory events
'inventory:updated', 'inventory:reserved'

// User events
'user:balance', 'user:notification'
```

---

## 8. Enum/Constant Changes

### Detection
- Value changed in `config/enums.js`
- Constant renamed
- New enum value added (usually safe)

### Search Scope
```bash
# CSGO_GAME_ID changed
grep -rn "CSGO_GAME_ID" tradeit-backend/
grep -rn "730" tradeit-backend/  # literal value
grep -rn "CSGO_GAME_ID" tradeit/
```

### Critical Enums
- `CSGO_GAME_ID`, `RUST_GAME_ID`, `DOTA2_GAME_ID`
- `TradeStatus`, `BotTradeItemStatus`
- `configurationKeys`
- `CsgoSlugType`, `InsightRootSlug`

---

## Automated Search Commands

### For PR Review
```bash
# 1. Get changed files
git diff --name-only base..head

# 2. For each changed controller, find response fields
grep -A5 "res.success" server/controllers/{file}.js

# 3. Search frontend for field usage
for field in $(extract_fields); do
  grep -rn "\.${field}" ../tradeit/
  grep -rn "${field}:" ../tradeit/
done

# 4. Search other backend repos
for repo in tradeit-service tradeit-admin-backend; do
  grep -rn "{pattern}" ../${repo}/
done
```

### GitHub Search (for remote repos)
```bash
# Search across organization
gh search code "imgURL" --owner zengamingx --language javascript

# Search specific repo
gh search code "imgURL" --repo zengamingx/tradeit
```

---

## Severity Guide

| Severity | Meaning | Action |
|----------|---------|--------|
| 🔴 CRITICAL | Will crash/break functionality | Block PR, require fix |
| 🟡 WARNING | May cause issues, needs verification | Request changes, verify |
| 🟢 SAFE | Low risk, informational | Note in review |

### Auto-Block Triggers
- Response field removed without frontend update
- API path changed without network file update
- Database column removed with active readers
- Middleware removed with active consumers

---

## Cross-Repo Search Checklist

When reviewing a PR, check these boxes:

```markdown
## Consumer Search Completed

- [ ] Searched tradeit frontend for API field usage
- [ ] Searched tradeit-admin for admin API usage
- [ ] Searched tradeit-extension for extension usage
- [ ] Checked by-database.md for DB table readers
- [ ] Searched Redis key consumers (if applicable)
- [ ] Searched socket event subscribers (if applicable)
- [ ] Verified enum/constant consumers (if applicable)

## Findings
| Consumer | File | Impact |
|----------|------|--------|
| ... | ... | ... |
```
