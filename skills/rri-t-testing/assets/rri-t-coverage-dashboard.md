# RRI-T Coverage Dashboard — {feature_name}

Feature: {feature_name}
Date: {date}
Release Gate Status: {release_gate_status}
Release Version: {release_version}
Owner: {owner}
Prepared By: {prepared_by}

## Release Gate Criteria

| Rule | Criteria | Status |
| --- | --- | --- |
| RG-1 | All 7 dimensions >= 70% coverage | PASS / CONCERNS / FAIL / WAIVED |
| RG-2 | At least 5/7 dimensions >= 85% coverage | PASS / CONCERNS / FAIL / WAIVED |
| RG-3 | Zero P0 items in FAIL state | PASS / CONCERNS / FAIL / WAIVED |
| RG-4 | P0 coverage = 100% | PASS / CONCERNS / FAIL / WAIVED |
| RG-5 | P1 coverage >= 90% | PASS / CONCERNS / FAIL / WAIVED |

### Gate Status Definitions

| Status | Definition |
| --- | --- |
| PASS | Criteria fully met |
| CONCERNS | Criteria partially met with documented mitigations |
| FAIL | Criteria not met |
| WAIVED | Criteria not met but approved with owner, expiry, remediation |

## Dimension Coverage

| Dimension | Total | PASS | FAIL | PAINFUL | MISSING | Coverage % | Risk Score | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1: UI/UX | {d1_total} | {d1_pass} | {d1_fail} | {d1_painful} | {d1_missing} | {d1_coverage} | {d1_risk} | PASS / CONCERNS / FAIL / WAIVED |
| D2: API | {d2_total} | {d2_pass} | {d2_fail} | {d2_painful} | {d2_missing} | {d2_coverage} | {d2_risk} | PASS / CONCERNS / FAIL / WAIVED |
| D3: Performance | {d3_total} | {d3_pass} | {d3_fail} | {d3_painful} | {d3_missing} | {d3_coverage} | {d3_risk} | PASS / CONCERNS / FAIL / WAIVED |
| D4: Security | {d4_total} | {d4_pass} | {d4_fail} | {d4_painful} | {d4_missing} | {d4_coverage} | {d4_risk} | PASS / CONCERNS / FAIL / WAIVED |
| D5: Data Integrity | {d5_total} | {d5_pass} | {d5_fail} | {d5_painful} | {d5_missing} | {d5_coverage} | {d5_risk} | PASS / CONCERNS / FAIL / WAIVED |
| D6: Infrastructure | {d6_total} | {d6_pass} | {d6_fail} | {d6_painful} | {d6_missing} | {d6_coverage} | {d6_risk} | PASS / CONCERNS / FAIL / WAIVED |
| D7: Edge Cases | {d7_total} | {d7_pass} | {d7_fail} | {d7_painful} | {d7_missing} | {d7_coverage} | {d7_risk} | PASS / CONCERNS / FAIL / WAIVED |

Legend: PASS | FAIL | PAINFUL | MISSING

## Priority Breakdown

| Priority | Total | PASS | FAIL | PAINFUL | MISSING | Coverage % | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | {p0_total} | {p0_pass} | {p0_fail} | {p0_painful} | {p0_missing} | {p0_coverage} | PASS / CONCERNS / FAIL / WAIVED |
| P1 | {p1_total} | {p1_pass} | {p1_fail} | {p1_painful} | {p1_missing} | {p1_coverage} | PASS / CONCERNS / FAIL / WAIVED |
| P2 | {p2_total} | {p2_pass} | {p2_fail} | {p2_painful} | {p2_missing} | {p2_coverage} | PASS / CONCERNS / FAIL / WAIVED |
| P3 | {p3_total} | {p3_pass} | {p3_fail} | {p3_painful} | {p3_missing} | {p3_coverage} | PASS / CONCERNS / FAIL / WAIVED |

## Summary Metrics

- Total Test Cases: {total_tc}
- Overall Coverage %: {overall_coverage}
- Dimensions Passing Gate: {dimensions_passing_gate}
- P0 FAIL Count: {p0_fail_count}
- P0 PAINFUL Count: {p0_painful_count}
- MISSING Count: {missing_count}
- Quality Score: {quality_score} (Grade: {grade})
- Latest Update: {latest_update}
- Notes: {summary_notes}
- Risks: {summary_risks}

## Trend Tracking

| Metric | This Release | Last Release | Delta |
| --- | --- | --- | --- |
| Overall Coverage | {this_coverage}% | {last_coverage}% | {delta}% |
| P0 Pass Rate | {this_p0}% | {last_p0}% | {delta}% |
| P1 Pass Rate | {this_p1}% | {last_p1}% | {delta}% |
| Quality Score | {this_quality} | {last_quality} | {delta} |
| FAIL Count | {this_fail} | {last_fail} | {delta} |
| PAINFUL Count | {this_painful} | {last_painful} | {delta} |

## Waiver Log

| Waiver ID | Item | Reason | Owner | Approved By | Expiry | Remediation Plan |
| --- | --- | --- | --- | --- | --- | --- |
| W-001 | | | | | | |
| W-002 | | | | | | |
| W-003 | | | | | | |

## FAIL Items

| TC ID | Priority | Dimension | Description | Assigned To |
| --- | --- | --- | --- | --- |
| {fail_tc_id_1} | {fail_priority_1} | {fail_dimension_1} | {fail_description_1} | {fail_assigned_to_1} |
| {fail_tc_id_2} | {fail_priority_2} | {fail_dimension_2} | {fail_description_2} | {fail_assigned_to_2} |
| {fail_tc_id_3} | {fail_priority_3} | {fail_dimension_3} | {fail_description_3} | {fail_assigned_to_3} |
| {fail_tc_id_4} | {fail_priority_4} | {fail_dimension_4} | {fail_description_4} | {fail_assigned_to_4} |
| {fail_tc_id_5} | {fail_priority_5} | {fail_dimension_5} | {fail_description_5} | {fail_assigned_to_5} |

## PAINFUL Items

| TC ID | Priority | Dimension | Description | UX Impact |
| --- | --- | --- | --- | --- |
| {painful_tc_id_1} | {painful_priority_1} | {painful_dimension_1} | {painful_description_1} | {painful_ux_impact_1} |
| {painful_tc_id_2} | {painful_priority_2} | {painful_dimension_2} | {painful_description_2} | {painful_ux_impact_2} |
| {painful_tc_id_3} | {painful_priority_3} | {painful_dimension_3} | {painful_description_3} | {painful_ux_impact_3} |
| {painful_tc_id_4} | {painful_priority_4} | {painful_dimension_4} | {painful_description_4} | {painful_ux_impact_4} |
| {painful_tc_id_5} | {painful_priority_5} | {painful_dimension_5} | {painful_description_5} | {painful_ux_impact_5} |

## MISSING Items

| TC ID | Priority | Dimension | Description | User Need |
| --- | --- | --- | --- | --- |
| {missing_tc_id_1} | {missing_priority_1} | {missing_dimension_1} | {missing_description_1} | {missing_user_need_1} |
| {missing_tc_id_2} | {missing_priority_2} | {missing_dimension_2} | {missing_description_2} | {missing_user_need_2} |
| {missing_tc_id_3} | {missing_priority_3} | {missing_dimension_3} | {missing_description_3} | {missing_user_need_3} |
| {missing_tc_id_4} | {missing_priority_4} | {missing_dimension_4} | {missing_description_4} | {missing_user_need_4} |
| {missing_tc_id_5} | {missing_priority_5} | {missing_dimension_5} | {missing_description_5} | {missing_user_need_5} |

## Regression Test List

| Test ID | Title | Dimension | Priority | Status |
| --- | --- | --- | --- | --- |
| {regression_id_1} | {regression_title_1} | {regression_dimension_1} | {regression_priority_1} | {regression_status_1} |
| {regression_id_2} | {regression_title_2} | {regression_dimension_2} | {regression_priority_2} | {regression_status_2} |
| {regression_id_3} | {regression_title_3} | {regression_dimension_3} | {regression_priority_3} | {regression_status_3} |
| {regression_id_4} | {regression_title_4} | {regression_dimension_4} | {regression_priority_4} | {regression_status_4} |
| {regression_id_5} | {regression_title_5} | {regression_dimension_5} | {regression_priority_5} | {regression_status_5} |

## Sign-off

| Role | Name | Decision | Notes |
| --- | --- | --- | --- |
| QA Lead | {qa_lead_name} | APPROVE / REJECT / WAIVE | {qa_lead_notes} |
| Dev Lead | {dev_lead_name} | APPROVE / REJECT / WAIVE | {dev_lead_notes} |
| Product | {product_name} | APPROVE / REJECT / WAIVE | {product_notes} |

## Final Gate Decision

**Decision:** PASS / CONCERNS / FAIL / WAIVED

**Rationale:** {rationale}

**Next Steps:** {next_steps}
