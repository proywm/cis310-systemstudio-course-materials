# Study Data Dictionary

## Data architecture

Keep data in separate tables joined only by random research IDs:

| Table | Unit | Join key | Direct identifiers allowed? |
|---|---|---|---|
| `participants` | participant | `participant_code` | No |
| `survey_pre` | participant | `participant_code` | No |
| `survey_post` | participant | `participant_code` | No |
| `task_pulse` | participant × task | `participant_code`, `task_id` | No |
| `assignments` | participant × occasion | `participant_code`, `occasion` | No |
| `events` | tool event | `participant_code`, `case_id` | No source text by default |
| `expert_reviews` | feedback event × rater | `feedback_id`, `rater_code` | No |
| `trust_calibration` | participant × case | `participant_code`, `calibration_case` | No |
| `staff_workload` | support case | `case_id` | No |
| `incidents` | safety/access incident | `incident_id` | No student identity in research export |

If an authorized linkage to grades or education records is approved, store the linkage key outside these tables with access restricted to the designated data steward. Do not derive `participant_code` from a uniqname, UMID, email address, initials, birth date, or other personal information.

## Administrative variables

| Variable | Type | Allowed values / format | Source |
|---|---|---|---|
| `participant_code` | string | random opaque value | study system |
| `protocol_version` | string | semantic/frozen protocol ID | study system |
| `instrument_version` | string | versioned form ID | study system |
| `course_pack_version` | string | immutable course-pack ID | extension |
| `extension_version` | string | semantic version | extension |
| `model_config_version` | string | approved configuration hash; `none` for evidence condition | service |
| `condition_assigned` | categorical | `evidence`, `evidence_ai` | randomization service |
| `randomization_block` | categorical | frozen block label | randomization service |
| `form_order` | categorical | `A_pre_B_post`, `B_pre_A_post` | randomization service |
| `occasion` | categorical | `pre`, `practice`, `post`, `delayed` | study system |
| `administered_at` | datetime | ISO 8601 with offset | study system |

## Survey variables

| Variable group | Type/range | Derived variable | Missingness rule | RQ |
|---|---|---|---|---|
| `BG01`--`BG08` | categorical/multiselect | none | Preserve `Prefer not to answer` separately | RQ7/context |
| `SE01_pre`--`SE07_pre` | integer 0--100 by 10 | `selfeff_pre` | Mean if ≥5/7 answered | RQ3 supporting |
| `SE01_post`--`SE07_post` | integer 0--100 by 10 | `selfeff_post` | Mean if ≥5/7 answered | RQ3 supporting |
| `TR01_pre`--`TR05_pre` | integer 1--7 | `trustlit_pre` | Mean if ≥4/5 answered | RQ6 supporting |
| `TR01_post`--`TR05_post` | integer 1--7 | `trustlit_post` | Mean if ≥4/5 answered | RQ6 supporting |
| `PU01`--`PU05` | integer 1--7 or NA-feature | `useful_post` | Mean if ≥4/5 applicable/answered | RQ2 supporting |
| `FQ01`--`FQ05` | integer 1--7 or NA-feature | `feedbackq_post` | Mean if ≥4/5 applicable/answered | RQ1/RQ2 supporting |
| `TM01`, `TM02` | integer 1--7 or NA-feature | none by default | Report separately | RQ4 supporting |
| `UX01`--`UX06` | integer 1--7 or NA-feature | `ux_post` | Mean if ≥4 applicable/answered | RQ7 supporting |
| `SF01`--`SF05` | integer 1--7 or NA-situation | none | Each item is an event screen | RQ8 supporting |
| `HS01`--`HS03` | categorical / integer | none | Preserve not-applicable | RQ5/RQ6 context |
| `OPEN01`--`OPEN05` | text | coded themes | Redact accidental identifiers before analysis | explanatory |

`NA-feature`, `NA-situation`, refusal, skipped, and technical missing are distinct codes in collection. They are converted to missing values with a reason field in the analysis file, never to a numeric midpoint.

## Task-pulse variables

| Variable | Type/range | Derived / rule | RQ |
|---|---|---|---|
| `TLX01`--`TLX06` | integer 0--100 by 5 | `raw_tlx` = mean only when all six present | RQ2/RQ7 context |
| `TP01`--`TP04` | integer 1--7 | report individually; exploratory composite only if pre-specified | RQ2/RQ6 |
| `TP05` | categorical | frozen six response categories | RQ2/RQ7 |
| `TP06` | text | nonidentifying coded note | explanatory |

## Assignment variables

| Variable | Type/range | Rule | RQ |
|---|---|---|---|
| `assessment_form` | categorical | `A`, `B`, or validated delayed form | RQ3 |
| `AR01` | integer 0--4 | functional correctness | RQ3 |
| `AR02` | integer 0--4 | evidence localization/use | RQ3 |
| `AR03` | integer 0--4 | diagnosis/reasoning | RQ3 |
| `AR04` | integer 0--4 | repair/verification | RQ3 |
| `AR05` | integer 0--4 | explanation/transfer | RQ3 |
| `assign_total` | number 0--100 | `AR01×7.5 + AR02×5 + AR03×5 + AR04×5 + AR05×2.5` | RQ3 |
| `AF01`--`AF06` | binary | non-score review flags | RQ3/RQ7 |
| `rater_code` | string | nonidentifying staff code | quality control |
| `adjudicated` | binary | `0`, `1` | quality control |

Wide analysis variables are `assign_pre_total`, `assign_post_total`, and optionally `assign_delayed_total`.

## Telemetry variables

Collect the minimum event data needed for a research question. Source-code snapshots, terminal history, chat text, file paths, and environment variables are excluded by default.

| Variable | Type | Definition | RQ |
|---|---|---|---|
| `event_id` | string | random event ID | audit |
| `case_id` | string | random problem episode ID | RQ2/RQ4/RQ5 |
| `event_type` | categorical | `check_start`, `check_end`, `evidence_view`, `hint_request`, `hint_shown`, `attempt_submit`, `help_preview`, `escalate`, `resolve`, `opt_out`, `error` | multiple |
| `event_at` | datetime | ISO 8601 with offset | RQ4 |
| `evidence_category` | categorical | approved taxonomy only | RQ1 |
| `hint_level` | integer | approved progressive-hint level | RQ2/RQ8 |
| `feedback_id` | string | random ID joining expert rating | RQ1/RQ4/RQ8 |
| `attempt_index` | integer | sequential within case | RQ2 |
| `retry_class` | categorical | `2 productive`, `1 partly`, `0 unproductive`, `9 not observable` | RQ2 |
| `setup_result` | categorical | `success`, `recoverable_fail`, `blocked`, `abandoned` | RQ7 |
| `platform_group` | categorical | supported coarse platform; no device fingerprint | RQ7 |
| `incident_id` | string/nullable | joins controlled incident table | RQ8 |

Derived:

- `time_to_first_response = first hint_shown - qualifying attempt_submit`;
- `time_to_useful_feedback = first feedback rated A - qualifying attempt_submit`;
- `attempts_to_productive = first productive attempt index after feedback`; and
- `productive_within_two = 1` if either of the next two observable attempts is productive.

If no useful feedback occurs, `time_to_useful_feedback` is right-censored at task end; it is not discarded.

## Expert-review variables

| Variable group | Type/range | Rule | RQ |
|---|---|---|---|
| `EX01`--`EX08` | integer 0--2 | expert rubric dimensions | RQ1/RQ2/RQ4/RQ8 |
| `expert_total` | integer 0--16 | sum when all dimensions present | descriptive |
| `F01`--`F06` | categorical | `0 absent`, `1 present`, `9 cannot determine` | RQ8 |
| `overall_feedback_class` | categorical | `A`, `B`, `C`, `D` | RQ1/RQ4 |
| `reviewer_confidence` | integer 0--100 by 10 | optional diagnostic | quality control |

## Trust-calibration variables

| Variable | Type/range | Rule | RQ |
|---|---|---|---|
| `TC01`--`TC06` | categorical | `proceed`, `verify`, `reject`, `escalate` | RQ6/RQ8 |
| `TC01_conf`--`TC06_conf` | integer 0--100 by 10 | confidence in decision | RQ6 |
| `trustcal_total` | integer 0--6 | count of keyed best actions | RQ6 |
| `trustcal_prop` | number 0--1 | `trustcal_total / 6` | RQ6 |
| `overreliance_count` | integer 0--5 | proceed in `TC02`--`TC06` | RQ6 |
| `underreliance_count` | integer 0--1 | unwarranted non-proceed in `TC01` | RQ6 |
| `unsafe_accept_count` | integer 0--2 | proceed in `TC05`/`TC06` | RQ8 |

## Staff workload variables

Use `WL01`--`WL16` and derived variables exactly as specified in [`ta-workload-log.md`](ta-workload-log.md). `active_minutes` cannot be negative; `verification_minutes + rework_minutes` cannot exceed active minutes unless overlapping time is explicitly allowed by a revised frozen protocol.

## Privacy classification and retention

| Class | Examples | Repository/storage rule |
|---|---|---|
| Public | Blank instruments, schemas, synthetic cases, analysis code | May be committed after review |
| Restricted de-identified | Survey answers, scores, event rows, staff case logs | Approved encrypted institutional storage only |
| Restricted content | Redacted artifacts, open text, AI response text | Approved storage; least-privilege access; no Git |
| Linkage/identifiable | Consent records, identity-code key, grades | Separate approved system and data steward; no student developers |

The institutional determination and approved data-management plan set retention and destruction dates. This repository must never contain real participant rows, linkage keys, submissions, grades, emails, or raw course-evaluation exports.
