# Pre-Specified Pilot Analysis Plan

**Status:** protocol draft; freeze before enrollment or access to condition-labeled outcomes

## Objective

Estimate whether adding a constrained AI coach to identical deterministic evidence and static course resources improves near-transfer performance in the tested activity, while characterizing technical accuracy, productive retries, timeliness, human workload, trust calibration, accessibility, and safety.

The pilot is not designed to establish effectiveness across all courses, terms, instructors, platforms, or student populations.

## Recommended design

### Conditions

- `Evidence`: deterministic checks/traces plus approved static course resources.
- `Evidence + AI`: the identical evidence/resources plus constrained generated explanation and progressive hints.

Normal instructor/TA access remains available in both conditions. The pre/post assessment itself has the AI coach disabled in both conditions.

### Assignment

Randomly assign eligible consenting participants 1:1 after the pre-survey and baseline assignment. Block by course workflow and a pre-specified baseline-score band. Independently counterbalance assessment form order (`A-pre/B-post` versus `B-pre/A-post`). Conceal the randomization sequence from graders.

If students perform the practice activity in collaborating teams, randomize whole teams and use cluster-aware analysis. Do not assign different conditions within a team. If there are too few independent teams for meaningful cluster inference, report the study as a feasibility pilot.

### Analysis population

The primary estimand is the intention-to-treat effect of assignment to `Evidence + AI` versus `Evidence` among randomized participants, regardless of actual hint use. A per-protocol description of tool users is secondary and cannot replace intention-to-treat.

Document:

- approached, eligible, consented, randomized, and analyzed counts;
- withdrawal and missing-outcome counts by condition;
- reasons that occur before condition disclosure where possible; and
- protocol deviations without using outcome knowledge to redefine eligibility.

## Outcomes

### Primary outcome

`assign_post_total`, the blinded 0--100 score on the alternate-form near-transfer assignment completed without assignment-specific AI hints.

### Key secondary outcomes

1. `productive_within_two` after a practice hint;
2. `time_to_useful_feedback` using expert class A as the primary usefulness threshold;
3. expert technical/evidence dimensions `EX01` and `EX02`;
4. active human minutes per resolved routine case;
5. `trustcal_prop`, over-reliance, and unsafe acceptance;
6. `selfeff_post` controlling for `selfeff_pre`;
7. `useful_post`, `feedbackq_post`, and `raw_tlx`; and
8. setup/task completion by supported platform and accessibility mode.

### Safety release gates

`F01`--`F06`, student safety screens `SF02`--`SF05`, and incident records are evaluated by event type. They are not combined with learning into a net-benefit score. A statistically favorable learning result cannot compensate for a severe privacy, destructive-command, or answer-leakage event.

## Primary analysis

Fit the baseline-adjusted model:

```text
assign_post_total = beta0
                  + beta1 * assigned_AI_condition
                  + beta2 * assign_pre_total
                  + form_order
                  + randomization_block
                  + error
```

`beta1` is the primary estimated effect. Report:

- adjusted mean difference in points;
- 95% confidence interval;
- two-sided p-value as a compatibility measure, not a success label;
- group sample sizes, raw means/SDs, and adjusted means; and
- standardized effect based on the pooled baseline SD, with 95% CI.

Use heteroskedasticity-robust standard errors. If randomization is clustered, include the randomization unit and use cluster-appropriate uncertainty; do not pretend individual rows are independent.

The rationale for baseline adjustment follows [Vickers and Altman (2001)](https://www.bmj.com/content/323/7321/1123). The standardized pretest/posttest/control effect should be reported consistently with [Morris (2008)](https://doi.org/10.1177/1094428106291059).

## Secondary analyses by RQ

### RQ1 accuracy

- Report each `EX01`/`EX02` level and the proportion meeting level 2 with Wilson 95% CIs.
- Report invalid-citation and unsupported-claim rates with numerator and denominator.
- Provide a failure-category confusion matrix for the offline benchmark.
- Stratify by course workflow, seeded-fault family, course-pack version, and model configuration where sample size permits.

### RQ2 usefulness

- Report the proportion with a productive retry within two observable attempts by condition.
- Estimate the condition contrast as a risk difference with 95% CI; add a regression model only if sample/event counts support it.
- Report partly productive and unobservable outcomes rather than collapsing them into failure.
- Summarize `useful_post` and `feedbackq_post` with item distributions and composite estimates.

### RQ3 learning and self-efficacy

- Primary: baseline-adjusted near-transfer model above.
- Inspect the condition-by-baseline interaction as exploratory, not as a basis for an unplanned subgroup claim.
- Analyze `selfeff_post` with the corresponding pre composite as a covariate. Call this perceived capability, not learning.
- If delayed transfer is collected, report its model separately as a secondary retention analysis.

### RQ4 timeliness

- Start the clock at the qualifying failed attempt.
- End at the first response rated expert class A.
- Treat cases without class A feedback as right-censored at task end, not as missing or infinitely slow.
- Report response-time and useful-feedback-time distributions separately.
- If events permit, report a Kaplan--Meier curve/median or restricted mean time; otherwise report median/IQR among resolved cases plus the unresolved proportion.
- Sensitivity analysis: class A or B as “useful.”

### RQ5 human workload

- Primary: active minutes per resolved routine case by route/condition.
- Report median/IQR, mean and bootstrap 95% CI, case count, resolution rate, verification minutes, and rework minutes.
- Include unresolved cases and logging overhead in separate implementation-cost summaries.
- A workload claim requires no material reduction in student access or resolution rate.

### RQ6 trust calibration

- Report `trustcal_prop`, over-reliance, under-reliance, and unsafe acceptance with CIs or exact counts.
- Compare behavioral calibration with actual condition exposure and `trustlit_post`; the relationship is explanatory.
- Analyze repeated trust-literacy scores as a secondary pre/post construct. Do not define success as higher global trust.

### RQ7 equity and accessibility

- Report setup success, task completion, time, critical incidents, and opt-out by coarse supported platform/access mode.
- Suppress or combine cells according to the approved disclosure rule.
- With small cells, use descriptive case review and confidence intervals, not claims of no disparity.
- Accessibility-critical failures remain release blockers even if the overall average is favorable.

### RQ8 safety

- Report numerator, denominator, and interval by unsupported claim, citation error, leakage, privacy, destructive action, and failed escalation.
- For zero observed events, report the upper confidence bound; do not write “zero risk.”
- Triangulate expert flags, telemetry incidents, and student reports. Adjudicate mismatches.
- Report red-team and classroom rates separately.

## Questionnaire scoring

- Preserve the ordinal distribution of every item.
- Compute only the composites pre-defined in the instrument/data dictionary.
- Do not impute the midpoint for missing, not-applicable, refusal, or feature-not-used responses.
- Estimate internal consistency only as a diagnostic. If the sample is adequate, report coefficient omega with uncertainty. A favorable reliability estimate does not validate the intended interpretation.
- Do not drop an item merely because doing so improves reliability after outcomes are known.
- Treat study-specific scales as provisional until content review, response-process evidence, and pilot structure support their use.

## Rater agreement

- Assignment totals: intraclass correlation with confidence interval on the double-scored sample.
- Ordinal rubric dimensions: weighted kappa.
- Binary rare safety flags: percent agreement plus event counts; kappa can be misleading when prevalence is near zero.
- Report original and adjudicated results. Adjudication cannot erase evidence of ambiguous criteria.

## Missing data and attrition

1. Identify structural not-applicable, participant refusal, technical loss, withdrawal, infrastructure failure, and scorer-unavailable as distinct reasons.
2. Report missingness and attrition by assigned condition and occasion.
3. Do not score verified infrastructure failure as zero learning.
4. Use the pre-specified primary model for participants with observed baseline and post outcomes; report the resulting estimand clearly.
5. If outcome missingness is material, perform sensitivity analyses under explicit favorable/unfavorable assumptions and, if justified, a multiple-imputation analysis that includes assignment, baseline, form, block, and observed predictors of missingness.
6. Do not choose the missing-data method after seeing which produces the preferred conclusion.

## Multiple outcomes and decision rules

There is one confirmatory primary outcome. All other effectiveness outcomes are secondary/exploratory unless a later powered protocol specifies a multiplicity procedure. Report effect estimates and uncertainty for all pre-specified outcomes, not only statistically significant results.

Before enrollment, the client and assessment reviewer must define:

- the smallest educationally meaningful difference on the 100-point assignment;
- maximum acceptable uncertainty for a go/no-go decision;
- safety release gates and benchmark case count;
- minimum usable setup/task-completion standard; and
- sample-size/power assumptions.

A senior-design usability or classroom pilot may be too small for an effectiveness claim. In that case, success means demonstrating feasibility, estimating uncertainty, finding failure modes, and producing a credible basis for a larger study.

## Qualitative analysis

Develop a codebook before opening condition-labeled comments. Start with evidence usefulness, conceptual explanation, answer leakage, setup barrier, accessibility barrier, trust/verification, escalation, and unmet human-support need. Two analysts independently code a purposive calibration sample, revise the codebook, then code the remaining responses. Report themes with counts only when the denominator and response process are clear; redact identifying or submission-specific details.

## Official course evaluations

The official UM-Dearborn evaluation is collected anonymously and released after final grades. Use only aggregate course-level results and response rates. Pre-specify the directly relevant common items (for example, advancement of understanding/skills, practical assistance, access to materials, and helpful feedback) before reports are opened.

If historical same-course data are shown, label the comparison descriptive. Terms differ in cohort, content, modality, staffing, and response composition; they are not randomized controls and do not estimate the AI effect.

## Reporting checklist

- participant flow and attrition;
- randomization and concealment;
- baseline table without significance testing as a gate;
- intervention/course-pack/model versions;
- exposure and contamination;
- all pre-specified outcomes and denominators;
- effect estimates, confidence intervals, and raw distributions;
- rater agreement;
- adverse/safety/accessibility events;
- missing-data and sensitivity results;
- deviations from this plan with dates/reasons; and
- explicit limits on causal and general claims.

No real participant data, outputs, grades, course-evaluation exports, or linkage keys may be committed to this repository. Analysis code should be developed against synthetic data and run on approved institutional storage.
