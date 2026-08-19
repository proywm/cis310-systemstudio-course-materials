# Research Question-to-Instrument Matrix

## Measurement rule

No research question is answered by a single satisfaction item. Each conclusion must use the primary measure below; secondary measures explain mechanisms or implementation quality.

The questionnaire ranges below are expanded item by item in [`../../instruments/questionnaire-item-map.md`](../../instruments/questionnaire-item-map.md).

| RQ | Construct and operational definition | Primary measure | Secondary or diagnostic measures | Instrument item IDs | Planned analysis | Claim boundary |
|---|---|---|---|---|---|---|
| RQ1 | **Accuracy:** correct failure category and valid evidence | Blinded faculty/TA rating of benchmark responses | Deterministic-check precision/recall; citation-validity audit | `EX01`, `EX02`, `EX08`; flags `F01`--`F06` | Proportion at release standard with Wilson 95% CI; category confusion matrix | Applies only to tested versions, course packs, and fault categories |
| RQ2 | **Usefulness:** guidance enables a productive next attempt without giving away the solution | Productive retry within the next two attempts | Perceived usefulness and feedback-quality composites; student explanation | `PU01`--`PU05`, `FQ01`--`FQ05`, `OPEN01` | Condition difference in productive-retry rate; descriptive composites with CIs | Perceived usefulness is not learning or correctness |
| RQ3 | **Learning:** performance on a related task without assignment-specific AI hints | Blinded 100-point near-transfer assignment score | Repeated task-specific self-efficacy; optional delayed-transfer score | `SE01`--`SE07`; assignment dimensions `AR01`--`AR05` | Postscore ANCOVA controlling baseline and blocking factors; adjusted difference and 95% CI | Limited to matched concepts and tested activity; confidence is secondary |
| RQ4 | **Timeliness:** elapsed time from a failed attempt to useful guidance | Timestamp difference to first response that meets the expert usefulness threshold | Student-perceived timeliness; attempts before useful guidance | `TM01`, `TM02`; `EX03`--`EX05` | Median, IQR, empirical distribution; condition contrast with CI | Automated response time alone is not “useful feedback” |
| RQ5 | **Human workload:** active instructor/TA time per resolved routine case | Case-level active minutes from staff workload log | Rework, escalations, unresolved cases, after-hours work | `WL01`--`WL16` | Median/IQR and mean with bootstrap CI by condition and case type | Must count verification and rework; may not shift hidden work to students |
| RQ6 | **Trust calibration:** reliance matches actual response quality and authority | Six-case behavioral calibration score | Repeated trust-literacy composite; verification and escalation telemetry | `TC01`--`TC06`, `TR01`--`TR05` | Mean proportion appropriate; over-reliance and under-reliance rates; pre/post literacy change | High reported trust is not success; appropriate reliance is success |
| RQ7 | **Equity/accessibility:** supported users can set up and complete tasks without systematic platform/access barriers | Environment-validation and assessment-completion rate by supported platform/accessibility mode | Ease-of-use/accessibility items; observed critical incidents; opt-out reason | `BG02`--`BG04`, `UX01`--`UX06`, `OPEN04` | Descriptive disaggregation and case review; no subgroup inference when cells are small | Absence of detected disparity in a small pilot does not prove equity |
| RQ8 | **Safety:** unsupported claims, leakage, privacy/command problems, and failed escalations are rare and caught | Offline red-team benchmark and expert binary safety flags | Student-reported incidents; behavioral calibration cases; incident log | `SF01`--`SF05`, `TC03`--`TC06`, flags `F01`--`F06` | Rate and exact/Wilson 95% CI by event type; every severe event reviewed | A zero count gives an upper uncertainty bound, not proof of zero risk |

## Instrument schedule

| Time | Instrument | Purpose | Estimated time |
|---|---|---|---:|
| Before exposure | [`pre-survey.md`](../../instruments/pre-survey.md) | Background, repeated self-efficacy, trust literacy | 6--8 min |
| Before exposure | Parallel assignment Form A or B | Baseline demonstrated performance | 35--45 min |
| During each study task | Telemetry and [`ta-workload-log.md`](../../instruments/ta-workload-log.md) | Timing, attempts, escalation, human workload | Passive / staff log |
| Immediately after selected task | [`task-pulse.md`](../../instruments/task-pulse.md) | Raw TLX workload and immediate task experience | 3--4 min |
| After exposure | Parallel assignment alternate form, AI coach disabled | Near-transfer learning | 35--45 min |
| After exposure | [`post-survey.md`](../../instruments/post-survey.md) | Repeated constructs, usefulness, quality, usability, safety | 10--12 min |
| After exposure | [`trust-calibration-task.md`](../../instruments/trust-calibration-task.md) | Appropriate reliance, verification, rejection, escalation | 8--10 min |
| Optional 1--2 weeks later | New parallel transfer task | Retention/transfer | 25--35 min |
| End of term | Official UM-Dearborn course evaluation | Secondary course-level context only | Existing process |

## Primary and secondary outcomes

The single primary outcome is the blinded near-transfer assignment score (`assign_post_total`, 0--100). This prevents a favorable survey result from substituting for learning.

Key secondary outcomes are:

1. productive retry rate;
2. time to first useful feedback;
3. expert accuracy/evidence score;
4. active TA/instructor minutes per routine case;
5. behavioral trust-calibration score;
6. self-efficacy change; and
7. Raw TLX and perceived-usefulness composites.

Safety metrics are release gates, not outcomes to trade against learning gains.

## RQ coverage audit

| Instrument | RQ1 | RQ2 | RQ3 | RQ4 | RQ5 | RQ6 | RQ7 | RQ8 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Pre/post survey |  | Supporting | Supporting | Supporting |  | Supporting | Supporting | Supporting |
| Parallel assignments |  | Supporting | **Primary** |  |  |  | Supporting |  |
| Product telemetry | Supporting | **Primary** | Supporting | **Primary** | Supporting | Supporting | **Primary** | Supporting |
| Expert response rubric | **Primary** | Supporting |  | Supporting |  | Supporting |  | **Primary** |
| Trust-calibration task |  |  |  |  |  | **Primary** |  | Supporting |
| TA workload log |  |  |  | Supporting | **Primary** |  |  | Supporting |
| Usability observation |  | Supporting |  | Supporting |  | Supporting | **Primary** | Supporting |
| Official course evaluation |  | Context | Context | Context |  |  | Context |  |
