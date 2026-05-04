# RRI-T Dimension Checklists — D5 & D6

Từ PDF sections 5.5 và 5.6.

## D5: Data Integrity — 7 Khu Vực

| Area | Kiểm tra | Tiêu chí Pass |
|------|----------|---------------|
| CRUD Consistency | Create→Read→Update→Delete lifecycle | Data roundtrip 100% chính xác, không mất field |
| Cross-Module | Data shared giữa các modules | Thay đổi ở module A reflect đúng ở module B |
| Calculation | Công thức, aggregation, rounding | Kết quả khớp 100% với Excel reference |
| Migration | Schema change, data migration script | Zero data loss, rollback safe, idempotent |
| Backup/Restore | Backup procedure, restore verify | Restore khớp 100% backup point, RTO đúng SLA |
| Concurrent Write | Optimistic/pessimistic locking | No lost updates, conflict detected và handled |
| Temporal | Timestamps, timezone, date ranges | UTC storage, GMT+7 display đúng, no DST bug |

## D6: Infrastructure — 6 Khu Vực

| Area | Kiểm tra | Tiêu chí Pass |
|------|----------|---------------|
| Deploy | Zero-downtime deployment, rollback procedure | 0 downtime, rollback < 5 phút |
| Env Parity | Dev ≈ Staging ≈ Prod config | Config drift < 5%, không có secret hardcode |
| Health Checks | Liveness, readiness, startup probes | Status đúng trong vòng 10s sau state change |
| Monitoring | Metrics, dashboards, alert rules | Alert fire trong vòng 60s khi ngưỡng vượt |
| Scaling | Horizontal scale up/down | Scale < 2 phút, không drop request |
| Resource Limits | CPU/Memory limits, disk usage | Graceful tại 90% capacity, no OOM kill |
