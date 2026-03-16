# RRI-T Stress Matrix Template

## Feature
- Name: <feature-name>
- Owner: <owner>
- Date: <yyyy-mm-dd>
- Build/Release: <build-id>
- Environment: <dev/staging/prod>

## Summary
This template covers RRI-T 8-axis stress testing for a household management app
(inventory, meal planning, shopping lists, finances).

## Stress Axes Summary
| Axis | Name | Focus | Notes |
| --- | --- | --- | --- |
| 1 | TIME | Deadlines, bulk ops, timeouts | Burst actions, long-running jobs |
| 2 | DATA | 1000+ rows, search/filter speed | Large inventory, long history |
| 3 | ERROR | Undo/redo, auto-save recovery, messages | Resilience, recoverability |
| 4 | COLLAB | Concurrent editing, conflicts, multi-user | Household members overlap |
| 5 | EMERGENCY | Interruptions, crash recovery | Browser/device failures |
| 6 | SECURITY | Access revocation, audit logs, session expiry | Role changes, expiring auth |
| 7 | INFRA | Server crash, RTO<15m, RPO<5m, offline | Service resilience |
| 8 | LOCALE | Vietnamese diacritics, VND, GMT+7, overflow | Local UX correctness |

## Axis Combination Matrix (Test Where X)
| Axis | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 TIME | - | X | X | X | X | X | X | X |
| 2 DATA | X | - | X | X |  | X | X | X |
| 3 ERROR | X | X | - | X | X |  | X | X |
| 4 COLLAB | X | X | X | - |  | X |  | X |
| 5 EMERGENCY | X |  | X |  | - | X | X |  |
| 6 SECURITY | X | X |  | X | X | - | X | X |
| 7 INFRA | X | X | X |  | X | X | - | X |
| 8 LOCALE | X | X | X | X |  | X | X | - |

## Stress Scenarios

### Axis 1: TIME
| # | Scenario | Steps | Expected | Priority |
| --- | --- | --- | --- | --- |
| S-TIME-001 | Bulk add 500 pantry items before dinner | Start timer 2 min, import CSV of pantry items | Import completes, progress visible, no timeout | P1 |
| S-TIME-002 | Rapid meal plan edits during 10-min window | Update 10 meals in 60s, save each | Saves succeed, no stale data, UI responsive | P1 |
| S-TIME-003 | Shopping list sync under poor network | Add 30 items quickly, toggle offline/online | Sync resolves within 60s, no duplicates | P2 |
| S-TIME-004 | Finance entry auto-save timeout | Create expense, wait 45s idle, resume edit | Auto-save persists, no data loss | P2 |

### Axis 2: DATA
| # | Scenario | Steps | Expected | Priority |
| S-DATA-001 | Inventory list 1000+ items | Load inventory with 1200 items | Scroll, search, filter remain under 2s | P1 |
| S-DATA-002 | Shopping history filter speed | Filter 800 past purchases by category | Results appear under 2s, no UI freeze | P2 |
| S-DATA-003 | Meal plan calendar 6 months | Open 6-month plan view with 180 entries | Render within 3s, no layout shift | P2 |
| S-DATA-004 | Finance ledger export 2000 rows | Export 2k ledger rows to CSV | Export completes, file accurate | P2 |

### Axis 3: ERROR
| # | Scenario | Steps | Expected | Priority |
| S-ERROR-001 | Undo/redo inventory quantity changes | Change item qty 5 times, undo 5, redo 5 | Exact state restored each step | P1 |
| S-ERROR-002 | Auto-save recovery after crash | Edit meal notes, force close tab, reopen | Draft restored with last autosave | P1 |
| S-ERROR-003 | Validation error messages | Add expense with negative value | Clear inline error, no save | P2 |
| S-ERROR-004 | Failed bulk import rollback | Import malformed CSV for pantry | No partial data, error list shown | P1 |

### Axis 4: COLLAB
| # | Scenario | Steps | Expected | Priority |
| S-COLLAB-001 | Two users edit shopping list | User A adds 5 items, User B deletes 2 | Conflict warning, final list consistent | P1 |
| S-COLLAB-002 | Concurrent budget updates | Two users change monthly budget | Latest change prompts merge dialog | P2 |
| S-COLLAB-003 | Shared meal plan edit | User A updates recipe, User B updates servings | Both changes applied without loss | P2 |
| S-COLLAB-004 | New member joins household | Invite new user during active edits | New user sees updated list | P3 |

### Axis 5: EMERGENCY
| # | Scenario | Steps | Expected | Priority |
| S-EMERGENCY-001 | Browser crash while editing | Edit grocery item notes, kill browser | Reopen, draft restored | P1 |
| S-EMERGENCY-002 | Power loss during bulk update | Start bulk pantry update, go offline | Partial changes queued or rolled back | P1 |
| S-EMERGENCY-003 | Device sleep mid-sync | Start sync, close laptop lid | Resume sync without duplication | P2 |
| S-EMERGENCY-004 | App reload mid-transaction | Save expense, hit refresh instantly | No double charge, one entry saved | P2 |

### Axis 6: SECURITY
| # | Scenario | Steps | Expected | Priority |
| S-SECURITY-001 | Access revoked during edit | Admin removes user role mid-edit | User warned, changes blocked, data safe | P1 |
| S-SECURITY-002 | Session expiry while shopping | Session expires, user adds item | Redirect to login, item queued | P1 |
| S-SECURITY-003 | Audit log for finance edits | Edit expense amount | Audit entry with user, time, change | P2 |
| S-SECURITY-004 | Private list access attempt | Non-member tries to open list | Access denied, no data leak | P1 |

### Axis 7: INFRA
| # | Scenario | Steps | Expected | Priority |
| S-INFRA-001 | Server crash during sync | Trigger sync, kill server | Retry logic, no data loss | P1 |
| S-INFRA-002 | RTO < 15m recovery | Simulate outage, restore service | Service back within 15m, status updated | P1 |
| S-INFRA-003 | RPO < 5m data recovery | Create 3 entries, failover | Max 5m data loss, latest persists | P1 |
| S-INFRA-004 | Offline mode for shopping list | Go offline, add 10 items | Local cache used, sync on reconnect | P2 |

### Axis 8: LOCALE
| # | Scenario | Steps | Expected | Priority |
| S-LOCALE-001 | Diacritic-insensitive search | Search "nguyen" in household members | Finds "Nguyen" matches | P1 |
| S-LOCALE-002 | VND currency formatting | View finance summary | Shows "1.000.000d" not "1,000,000" | P1 |
| S-LOCALE-003 | Vietnamese text overflow | Open long Vietnamese recipe names | No overflow, wraps cleanly | P2 |
| S-LOCALE-004 | Date format DD/MM/YYYY | View meal plan date header | Displays DD/MM/YYYY | P1 |

## Notes
- Attach logs, screenshots, and timings for any P1 or P2 failures.
- Capture device, OS, browser, and network conditions.
- Link to any incident or bug IDs created from results.
