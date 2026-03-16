# RRI-T Test Cases — {Feature Name}

**Feature:** {feature-name}
**Generated from:** Persona Interview ({date})
**Total Test Cases:** {count}

## Priority Distribution
| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 0 | Critical — blocks release |
| P1 | 0 | Major — fix before release |
| P2 | 0 | Minor — next sprint |
| P3 | 0 | Trivial — backlog |

## Dimension Distribution
| Dimension | Count | Target Coverage |
|-----------|-------|----------------|
| D1: UI/UX | 0 | >= 85% |
| D2: API | 0 | >= 85% |
| D3: Performance | 0 | >= 70% |
| D4: Security | 0 | >= 85% |
| D5: Data Integrity | 0 | >= 85% |
| D6: Infrastructure | 0 | >= 70% |
| D7: Edge Cases | 0 | >= 85% |

---

## Test Cases

### TC-RRI-{FEATURE}-001
- **Q (Question):** As an end user, what happens when I add an inventory item while on a weak 3G connection?
- **A (Answer):** The item should be saved locally immediately, show a "syncing" indicator, and sync to the server when connection improves. No data loss should occur.
- **R (Requirement):** REQ-OFFLINE-001: App must support offline-first operations with automatic sync
- **P (Priority):** P0
- **T (Test Case):**
  - **Preconditions:** 
    - User logged in to household
    - Device has weak 3G connection (simulated: 500ms latency, 50% packet loss)
    - At least 1 existing inventory item for comparison
  - **Steps:**
    1. Navigate to Inventory screen
    2. Tap "Add Item" button
    3. Fill in: Name "Gao ST25", Quantity "5", Unit "kg", Expiration "2026-03-15"
    4. Tap "Save"
    5. Observe UI feedback
    6. Wait 30 seconds
    7. Check item appears in inventory list
    8. Restore normal network connection
    9. Wait for sync indicator to complete
    10. Verify item exists on server (check from another device)
  - **Expected Result:** 
    - Item appears in list immediately with "syncing" badge
    - No error message shown
    - After network restores, item syncs successfully
    - Item visible from other devices within 5 seconds of sync
  - **Dimension:** D3: Performance
  - **Stress Axis:** TIME, INFRA
  - **Source Persona:** End User
- **Risk Category:** PERF
- **Risk Score:** 6
- **Traceability:** REQ-OFFLINE-001
- **Result:** PASS
- **Notes:** Tested on iPhone 12 with Network Link Conditioner. Sync completed in 3.2s after network restored.

---

### TC-RRI-{FEATURE}-002
- **Q (Question):** As a business analyst, what happens when a household member with "viewer" role tries to delete an inventory item?
- **A (Answer):** The delete button should be hidden or disabled for viewers. If they somehow trigger a delete (via API manipulation), the server should reject it with a 403 Forbidden error.
- **R (Requirement):** REQ-RBAC-003: Viewers can only read data, not modify or delete
- **P (Priority):** P1
- **T (Test Case):**
  - **Preconditions:**
    - User "viewer@example.com" has "viewer" role in household "Test Family"
    - Household has inventory item "Sua tuoi" (ID: inv_123)
    - User logged in on mobile app
  - **Steps:**
    1. Login as viewer@example.com
    2. Navigate to Inventory screen
    3. Tap on "Sua tuoi" item to view details
    4. Look for delete button/option
    5. (If delete button exists) Attempt to tap it
    6. (Alternative) Use GraphQL client to send deleteInventoryItem mutation directly
  - **Expected Result:**
    - Delete button should not be visible in UI
    - If mutation sent directly, server returns error: `{"errors": [{"message": "Forbidden: insufficient permissions", "extensions": {"code": "FORBIDDEN"}}]}`
    - Item remains in database unchanged
  - **Dimension:** D4: Security
  - **Stress Axis:** SECURITY
  - **Source Persona:** Business Analyst
- **Risk Category:** SEC
- **Risk Score:** 6
- **Traceability:** REQ-RBAC-003
- **Result:** PAINFUL
- **Notes:** Delete button is correctly hidden, but when mutation sent via GraphQL Playground, error message is generic "Unauthorized" instead of specific "Forbidden: insufficient permissions". UX improvement: add clearer error messages for debugging. Item was NOT deleted (security works), but error clarity needs improvement.

---

### TC-RRI-{FEATURE}-003
- **Q (Question):** As a QA destroyer, what happens when I paste 50,000 characters into the "item name" field?
- **A (Answer):** The field should enforce a maximum length (e.g., 200 characters), truncate or reject input gracefully, and show a validation error. The app should not crash or freeze.
- **R (Requirement):** REQ-VALIDATION-005: All text inputs must have reasonable length limits
- **P (Priority):** P1
- **T (Test Case):**
  - **Preconditions:**
    - User logged in
    - On "Add Inventory Item" screen
    - Clipboard contains 50,000-character string
  - **Steps:**
    1. Tap into "Item Name" field
    2. Paste 50,000-character string
    3. Observe UI behavior
    4. Attempt to save the form
  - **Expected Result:**
    - Field truncates input to max length (200 chars) OR shows validation error
    - UI remains responsive (no freeze)
    - Save button disabled or shows error: "Item name too long (max 200 characters)"
    - No crash or GraphQL error
  - **Dimension:** D7: Edge Cases
  - **Stress Axis:** DATA, ERROR
  - **Source Persona:** QA Destroyer
- **Risk Category:** DATA
- **Risk Score:** 4
- **Traceability:** REQ-VALIDATION-005
- **Result:** MISSING
- **Notes:** Feature not yet implemented. Current behavior: field accepts all 50,000 characters, UI freezes for 2-3 seconds, GraphQL mutation fails with "Payload too large" error. Need to add client-side validation and maxLength attribute.

---

### TC-RRI-{FEATURE}-004
- **Q (Question):** {From persona's perspective — what are they trying to do/verify?}
- **A (Answer):** {Expected behavior — what SHOULD happen}
- **R (Requirement):** {Requirement ID or description}
- **P (Priority):** P0 | P1 | P2 | P3
- **T (Test Case):**
  - **Preconditions:** {required state}
  - **Steps:**
    1. {step 1}
    2. {step 2}
  - **Expected Result:** {specific, measurable outcome}
  - **Dimension:** D{n}: {name}
  - **Stress Axis:** {axis name} (if applicable)
  - **Source Persona:** {persona name}
- **Risk Category:** TECH | SEC | PERF | DATA | BUS | OPS
- **Risk Score:** {1-9}
- **Traceability:** {REQ-XXX}
- **Result:** PASS | FAIL | PAINFUL | MISSING
- **Notes:** {observations, screenshots, bug IDs}

---

### TC-RRI-{FEATURE}-005
- **Q (Question):** {From persona's perspective — what are they trying to do/verify?}
- **A (Answer):** {Expected behavior — what SHOULD happen}
- **R (Requirement):** {Requirement ID or description}
- **P (Priority):** P0 | P1 | P2 | P3
- **T (Test Case):**
  - **Preconditions:** {required state}
  - **Steps:**
    1. {step 1}
    2. {step 2}
  - **Expected Result:** {specific, measurable outcome}
  - **Dimension:** D{n}: {name}
  - **Stress Axis:** {axis name} (if applicable)
  - **Source Persona:** {persona name}
- **Risk Category:** TECH | SEC | PERF | DATA | BUS | OPS
- **Risk Score:** {1-9}
- **Traceability:** {REQ-XXX}
- **Result:** PASS | FAIL | PAINFUL | MISSING
- **Notes:** {observations, screenshots, bug IDs}

---

## Result Legend

| Result | Symbol | Description |
|--------|--------|-------------|
| PASS | PASS | Test passed, feature works as expected |
| FAIL | FAIL | Test failed, feature does not work |
| PAINFUL | PAINFUL | Feature works but UX is poor |
| MISSING | MISSING | Feature not implemented yet |
