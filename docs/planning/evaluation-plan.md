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

## Interpretation limits

- Open-ended course evaluations are self-selected and cannot estimate prevalence precisely.
- A successful implementation does not itself prove improved learning.
- Faster automated output is not necessarily useful feedback.
- Higher assignment completion may reflect answer leakage rather than learning.
- A pilot in one CIS 310 or CIS 450 activity does not establish effectiveness across courses.
- Satisfaction and trust must be interpreted alongside correctness and learning measures.

## Reporting language

Use language such as:

> The prototype is designed to provide evidence-grounded formative feedback within hours and will be evaluated for correctness, usefulness, learning impact, and instructor workload.

Avoid language such as:

> The system eliminates the feedback gap or has been proven to improve student learning.
