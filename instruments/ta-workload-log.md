# Instructor/TA Workload Log

**Unit:** one support case

**Purpose:** measure active human effort, not merely ticket count or elapsed queue time

## Logging instructions

- Start a case when a staff member first reads, investigates, or responds to a help request.
- Log active minutes spent reading, reproducing, diagnosing, writing, meeting, verifying AI output, correcting AI output, and documenting resolution.
- Do not count unattended build/queue time as active work; record it separately if it delays resolution.
- Reopen the original case if the same unresolved problem returns within [frozen window].
- Use a new case ID for a distinct problem.
- Do not enter names, uniqnames, student IDs, grades, or free-text excerpts from submissions.

## Case record

| ID | Field | Values / rule |
|---|---|---|
| `WL01` | `case_id` | Random research case ID |
| `WL02` | `opened_at` | ISO 8601 timestamp |
| `WL03` | `first_human_action_at` | ISO 8601 timestamp |
| `WL04` | `resolved_at` | ISO 8601 timestamp or missing if unresolved |
| `WL05` | `workflow` | `CIS310`, `CIS450`, approved alternative |
| `WL06` | `case_type` | `environment`, `build`, `code_logic`, `processor_datapath`, `processor_control`, `concept`, `policy`, `accessibility`, `other` |
| `WL07` | `complexity` | `routine`, `ambiguous`, `novel`, with frozen examples |
| `WL08` | `route` | `direct_human`, `systemstudio_escalation`, `systemstudio_correction`, `other` |
| `WL09` | `active_minutes` | Sum of staff active time across all sessions |
| `WL10` | `verification_minutes` | Subset of active minutes spent checking automated output/evidence |
| `WL11` | `rework_minutes` | Subset spent correcting misleading/incomplete automated guidance |
| `WL12` | `outcome` | `resolved`, `workaround`, `referred`, `student_no_response`, `unresolved`, `withdrawn` |
| `WL13` | `touch_count` | Number of distinct staff work sessions |
| `WL14` | `after_hours` | `0 No`, `1 Yes` according to frozen course definition |
| `WL15` | `safety_incident` | `0 No`, `1 Yes`; link only to nonidentifying incident ID |
| `WL16` | `note_code` | Optional controlled reason code; no free-text student data |

## Weekly completeness check

At the end of each study week, staff answer:

1. Were any support cases handled but not logged? `No`; `Yes, estimated count`; `Unknown`.
2. Were active minutes estimated rather than timed? record count and reason.
3. Did study logging itself add material workload? record aggregate minutes.

Logging burden is reported separately and excluded from the primary case-time outcome, but included in implementation-cost reporting.

## Derived variables

- `queue_minutes = first_human_action_at - opened_at`;
- `resolution_elapsed_minutes = resolved_at - opened_at`;
- `nonverification_minutes = active_minutes - verification_minutes - rework_minutes`;
- `resolved_routine = 1` only when `complexity = routine` and `outcome = resolved`; and
- `human_minutes_per_resolved_routine_case` is the primary RQ5 measure.

Negative derived values or subset minutes greater than active minutes are validation errors.
