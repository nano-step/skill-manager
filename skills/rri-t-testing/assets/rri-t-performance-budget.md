# RRI-T Performance Budget

D3: Performance — từ PDF section 5.3.

## Metric Budgets

| Metric | Target (GO) | Degraded (WARN) | Failed (NO-GO) |
|--------|-------------|-----------------|----------------|
| FCP (First Contentful Paint) | < 1.5s | < 3s | > 3s |
| TTI (Time to Interactive) | < 3s | < 5s | > 5s |
| API Response p50 | < 200ms | < 500ms | > 500ms |
| API Response p95 | < 500ms | < 1s | > 1s |
| Bundle Size | < 500KB | < 1MB | > 1MB |
| DB Query | < 50ms | < 200ms | > 200ms |

## Load Test Scenarios

| Scenario | Concurrent Users | Duration | Success Criteria |
|----------|-----------------|----------|-----------------|
| Normal Load | 50 | 30 min | p95 < 500ms, 0 errors |
| Peak Load | 200 | 15 min | p95 < 1s, error rate < 0.1% |
| Stress Test | 500 | 10 min | Graceful degradation, no crash |
| Endurance | 100 | 4 hours | No memory leak, consistent p95 |
| Spike Test | 0 → 300 → 0 trong 1 phút | 5 min | Recovery < 30s, no data loss |

## Performance Gate

**PASS** = Tất cả metrics nằm trong range Target hoặc Degraded, không có metric nào ở Failed.

**FAIL** = Bất kỳ metric nào vào vùng Failed → Block release.

> Tip: Chạy load test với k6, Locust, hoặc Artillery. Capture p50/p95/p99 per endpoint.
