# Evaluation Plan

## Evaluation objective

Determine whether SystemStudio AI can provide correct, useful, timely, and appropriately limited formative support without increasing answer leakage, privacy risk, or student dependence on automation.

The project should not claim success from deployment, usage, or satisfaction alone.

## Research questions

- **RQ1 Accuracy:** How often does the system correctly identify the relevant failure category and cite valid evidence?
- **RQ2 Usefulness:** Does the guidance help students make a productive next attempt?
- **RQ3 Learning:** Do students perform better on a related task that is not directly answered by the tool?
- **RQ4 Timeliness:** How long does it take from a failed attempt to receiving useful formative guidance?
- **RQ5 Workload:** Does the tool reduce instructor/TA time per routine help request while preserving human attention for ambiguous cases?
- **RQ6 Trust:** Can students distinguish deterministic evidence, AI explanation, and instructor authority?
- **RQ7 Equity and accessibility:** Are setup success and task completion comparable across supported platforms and access needs?
- **RQ8 Safety:** How often does the system produce unsupported claims, answer leakage, privacy violations, unsafe commands, or failed escalations?

## Claims and measures

| Proposed claim | Required measure | Success interpretation |
|---|---|---|
| Faster formative feedback | Median time from check request to faculty-rated useful feedback | Report observed distribution; do not generalize beyond tested workflows |
| Accurate evidence-grounded guidance | Faculty-labeled correctness, citation validity, and unsupported-claim rate | High correctness and near-zero invalid citations are release gates |
| Better recovery from errors | Productive retry rate after each hint level | Compare with baseline/help-resource condition |
| Improved learning | Performance on a near-transfer task completed without assignment-specific hints | Evidence of learning, not only task completion |
| Reduced support overhead | Instructor/TA minutes per resolved routine request | Must not reduce access or shift hidden work to students |
| Better setup experience | First-attempt and eventual environment-validation rate by platform | Diagnose platform disparities rather than averaging them away |

## Measurement architecture

The study uses multiple evidence sources because no questionnaire can establish all eight claims:

- **Learning:** matched parallel pre/post assignments scored blind with a common 100-point rubric.
- **Accuracy and safety:** offline benchmarks and blinded expert ratings of technical correctness, evidence validity, hint calibration, privacy, commands, and escalation.
- **Usefulness:** productive retry behavior, supported by perceived-usefulness and feedback-quality items.
- **Timeliness:** event timestamps ending at the first expert-rated useful response, supported by student perception.
- **Human workload:** active-minute instructor/TA case logs including verification and rework.
- **Trust:** a behavioral calibration task, supported by repeated trust-literacy items.
- **Equity/accessibility:** setup and task success disaggregated by supported platform/access mode, plus moderated observation.

The full mapping is in [`rq-instrument-matrix.md`](rq-instrument-matrix.md). Draft instruments and scoring rules are in [`../../instruments/`](../../instruments/), and the pre-specified models are in [`analysis-plan.md`](analysis-plan.md).

## Pre/post sequence

1. pre-survey: background, task-specific self-efficacy, and evidence/AI trust literacy;
2. baseline parallel assignment with the AI coach disabled;
3. practice activity in either deterministic-evidence or deterministic-evidence-plus-AI condition;
4. immediate task workload/experience pulse;
5. alternate-form near-transfer assignment with the AI coach disabled;
6. post-survey repeating the exact self-efficacy/trust-literacy items and adding usefulness, quality, accessibility, safety, and open responses; and
7. behavioral trust-calibration task and optional delayed-transfer assignment.

The primary learning outcome is the blinded post-assignment score adjusted for the baseline score. Self-reported confidence, satisfaction, and official course evaluations remain secondary evidence.

## Phase 1: offline technical benchmark

Create a benchmark from instructor-authored reference solutions and seeded faults. Do not begin with identifiable historical submissions.

Each case contains:

- active course-pack version;
- artifact or processor design;
- expected deterministic evidence;
- faculty-authored diagnosis category;
- allowed hint sequence;
- disallowed leakage examples; and
- expected escalation behavior.

Suggested seeded faults:

- wrong compiler/container architecture;
- missing Make target or incorrect build flag;
- null/pointer boundary error;
- xv6 build or boot failure;
- scheduler ordering or starvation defect;
- ALU operation mismatch;
- bus-width/connectivity mismatch;
- wrong control word; and
- incorrect register clock behavior.

Minimum technical reports:

- evidence precision/recall by category;
- invalid or missing citation rate;
- AI diagnosis agreement with faculty labels;
- false-confidence rate;
- answer-leakage rate;
- response time and cancellation behavior;
- cross-platform setup results; and
- reproducibility across repeated runs.

## Phase 2: expert review

Faculty and TA reviewers evaluate a blinded sample of responses using a rubric:

1. technically correct;
2. supported by cited evidence;
3. aligned with the assignment and allowed hint level;
4. understandable to the target course level;
5. actionable without giving away the solution;
6. safe and respectful; and
7. appropriately escalated when uncertain.

Release should be blocked by any systematic fabrication of evidence, unsafe execution advice, hidden-test exposure, or full-solution leakage.

## Phase 3: usability test

Use synthetic or instructor-created tasks with a small group not currently graded on the activity. Observe:

- setup completion;
- navigation and accessibility;
- interpretation of evidence versus AI explanation;
- hint selection and retry behavior;
- help-packet preview/redaction; and
- recovery from offline AI and failed infrastructure.

Collect task completion, time, errors, and a short interview. Revise before any classroom pilot.

## Phase 4: classroom pilot

Proceed only after the appropriate institutional determination and technical reviews.

Recommended pilot characteristics:

- optional, low-stakes, or shadow mode initially;
- equivalent non-AI support available;
- no automatic grade effect;
- clear disclosure of data handling;
- pre-specified outcomes and analysis plan;
- platform and accessibility subgroup checks; and
- instructor override and immediate opt-out.

When practicable, research consent and linkage are managed by a person who does not grade the students, and the instructor remains unaware of participation status until final grades are submitted. The appropriate U-M determination, recruitment/consent process, FERPA handling, and data-retention plan must be in place before collection.

A useful comparison is deterministic evidence plus static resources versus deterministic evidence plus the constrained AI coach. This isolates the value added by generated explanation instead of comparing the complete tool with no support.

## Core metrics

- environment-validation success rate;
- time to first useful feedback;
- evidence-category accuracy;
- citation validity;
- unsupported-claim and false-confidence rate;
- productive retry rate by hint level;
- number of attempts before success or escalation;
- near-transfer learning score;
- instructor/TA minutes per case;
- help-packet completeness and unnecessary-data rate;
- student trust calibration;
- accessibility task success; and
- opt-out and adverse-event counts.

## Instrument-development gates

Before the classroom pilot:

- content experts confirm each item/task matches its intended construct and RQ;
- 5--8 non-graded students complete a cognitive-interview round on questionnaire wording;
- Forms A and B are piloted for content, time, and difficulty equivalence;
- graders train on anchor responses and demonstrate acceptable agreement;
- item wording, scoring, primary outcome, exclusions, and analysis are frozen; and
- all offline technical, safety, privacy, accessibility, and cross-platform gates pass.

## Interpretation limits

- Open-ended course evaluations are self-selected and cannot estimate prevalence precisely.
- A successful implementation does not itself prove improved learning.
- Faster automated output is not necessarily useful feedback.
- Higher assignment completion may reflect answer leakage rather than learning.
- A pilot in one CIS 310 or CIS 450 activity does not establish effectiveness across courses.
- Satisfaction and trust must be interpreted alongside correctness and learning measures.
- A pre/post change without an appropriate comparison condition does not by itself establish that the tool caused the change.
- Official end-of-semester course evaluations are anonymous course-level context, not an individual study outcome or randomized comparison.

## Reporting language

Use language such as:

> The prototype is designed to provide evidence-grounded formative feedback within hours and will be evaluated for correctness, usefulness, learning impact, and instructor workload.

Avoid language such as:

> The system eliminates the feedback gap or has been proven to improve student learning.
