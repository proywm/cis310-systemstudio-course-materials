# Student Assignment and Learning-Assessment Blueprint

## Evaluation sequence

The study separates **practice with the tool** from **assessment of learning**.

1. Pre-survey.
2. Baseline parallel assignment with the AI coach disabled.
3. Practice assignment(s) using the assigned condition.
4. Immediate task pulse after selected practice tasks.
5. Alternate-form near-transfer assignment with the AI coach disabled.
6. Post-survey and trust-calibration task.
7. Optional delayed-transfer task 1--2 weeks later.

Both conditions keep normal course resources and human support. The recommended comparison is:

- **Evidence condition:** deterministic checks, traces, and approved static resources.
- **Evidence + AI condition:** the same evidence and resources plus the constrained progressive-hint coach.

This comparison estimates the value added by the generated explanation. Comparing the entire extension with no support would confound setup, tests, visualizations, resources, and AI.

## Parallel-form rules

Forms A and B must assess the same learning objectives without sharing surface details or exact repairs.

Each form must match on:

- number and type of files/components;
- prerequisite concepts;
- seeded-fault family;
- amount and form of deterministic evidence;
- number of required decisions;
- expected repair size;
- time limit;
- allowed resources; and
- scoring rubric.

Randomly assign half the participants to A-pre/B-post and half to B-pre/A-post. Store `form_order`. Expert reviewers should predict difficulty before piloting; pilot data should be checked for time, score distributions, and common misconceptions. If one form is materially harder, revise and re-pilot rather than applying an improvised score correction.

## Common student instructions

> You have [40] minutes. Work independently. You may use the displayed deterministic checks, course-pack reference pages, and the normal editor/debugger functions. The SystemStudio AI coach is disabled for this assessment. Do not use an external generative-AI tool. Your score depends on your diagnosis, evidence, repair, verification, and explanation—not only on whether the final test passes. If the environment fails, use the `Report environment problem` button; verified infrastructure time will be handled according to the frozen protocol.

The assessment must use instructor-created synthetic artifacts, not an active graded problem or a prior student's work.

## Common deliverables

Every assessment form asks the student to submit:

1. the first relevant observed failure;
2. a citation to the line, signal, cycle, or check that supports the diagnosis;
3. the expected behavior or invariant;
4. one focused diagnosis;
5. a minimal repair;
6. a rerun of the relevant checks;
7. one added or selected check that guards against recurrence; and
8. a 100--150 word explanation of why the evidence supports the repair.

The platform exports a redacted assessment packet containing artifacts, deterministic evidence, attempt timestamps, and final written responses. AI-generated text must not appear in assessment packets.

## CIS 450 parallel assessment

### Learning objectives

Students will be able to:

- distinguish environment/build failures from program-logic failures;
- use compiler, test, and trace evidence to localize a systems-programming defect;
- state the violated memory, boundary, or synchronization invariant;
- make a minimal repair; and
- verify the repair with a focused regression check.

### Form A shell: bounded message queue

Artifact: a small C repository containing a fixed-capacity message queue, Make target, instructor tests, and a trace view.

Seeded structure:

- one recoverable configuration/build distractor that the preflight check classifies explicitly;
- one queue boundary or wraparound defect that appears only at a specified capacity transition; and
- passing ordinary-case tests plus a failing boundary test.

Student prompt:

> Validate the environment, run `study-check`, and diagnose the first remaining program defect. Cite the earliest relevant evidence, state the queue invariant that is violated, make the smallest justified repair, and add or select a regression check that would fail on the original version.

### Form B shell: bounded descriptor table

Artifact: a small C repository containing a fixed-capacity descriptor table, equivalent build structure, instructor tests, and a trace view.

Seeded structure:

- a matched recoverable configuration/build distractor;
- one length/capacity or index-transition defect from the same boundary-reasoning family; and
- passing ordinary-case tests plus a failing boundary test.

Student prompt:

> Validate the environment, run `study-check`, and diagnose the first remaining program defect. Cite the earliest relevant evidence, state the table invariant that is violated, make the smallest justified repair, and add or select a regression check that would fail on the original version.

### CIS 450 practice assignment

Use a different artifact such as a bounded producer-consumer buffer or a small xv6 subsystem. Both study conditions receive identical deterministic checks and course-pack resources. Only the assigned condition receives generated explanations and progressive hints. The practice task must not contain the same defect, variable names, test data, or repair as either assessment form.

## CIS 310 parallel assessment

### Learning objectives

Students will be able to:

- interpret a processor test failure and cycle trace;
- identify the earliest divergence between expected and observed behavior;
- connect that divergence to a datapath/control invariant;
- correct a localized component or control configuration; and
- verify the repair across the failing instruction and a non-failing regression instruction.

### Form A shell: arithmetic/write-back path

Artifact: a structured 4-bit processor design, instruction test, accessible signal table, and cycle trace.

Seeded structure:

- ordinary instructions that pass;
- one arithmetic instruction whose earliest divergence occurs at a specified control or write-back boundary; and
- one visually nearby but irrelevant signal to discourage guessing.

Student prompt:

> Run the processor check, identify the earliest cycle and signal at which observed behavior diverges from expected behavior, state the violated invariant, make one localized repair, and verify both the failing instruction and a regression instruction.

### Form B shell: compare/branch path

Artifact: an equivalent 4-bit processor design, instruction test, accessible signal table, and cycle trace.

Seeded structure:

- ordinary instructions that pass;
- one compare or branch instruction whose earliest divergence occurs at a matched control/flag boundary; and
- one visually nearby but irrelevant signal.

Student prompt:

> Run the processor check, identify the earliest cycle and signal at which observed behavior diverges from expected behavior, state the violated invariant, make one localized repair, and verify both the failing instruction and a regression instruction.

### CIS 310 practice assignment

Use a related but distinct processor fault, such as register enable timing or a bus-width mismatch. Both conditions receive identical traces and reference pages; the AI condition additionally receives evidence-constrained progressive hints. Do not expose the assessment-form fault or solution during practice.

## Productive-retry classification

For RQ2, the next two submitted attempts after a hint are classified from artifacts and evidence, not from student self-report.

| Code | Definition |
|---|---|
| `2 Productive` | The attempt tests the stated hypothesis or changes the implicated location in a way consistent with the evidence. |
| `1 Partly productive` | The attempt addresses the correct subsystem but changes multiple variables or does not generate decisive evidence. |
| `0 Unproductive` | The attempt is unrelated to the evidence, repeats the same action without new information, or introduces an unrelated change. |
| `9 Not observable` | No eligible next attempt occurred because of an infrastructure failure, withdrawal, or immediate human takeover. |

Two blinded raters independently classify a calibration sample. Disagreements are adjudicated; the adjudication rule is frozen before condition comparisons.

## Grading and study separation

- A study scorer uses [`assignment-rubric.md`](assignment-rubric.md) while blind to participant, condition, and pre/post timing.
- A second blinded scorer independently rates at least 25% of responses, including a spread of apparent quality.
- The study score is not shown as the course grade. If the activity also has course credit, use completion credit or an equivalent route approved in the protocol.
- Verified environment failures are flagged before scoring. Never code an infrastructure failure as lack of learning.
- Retain original scores, adjudicated scores, reason codes, and rubric version.

## Optional delayed transfer

A delayed task can test retention but must use a third artifact and the same learning objectives. Report it as secondary unless the protocol is powered and pre-specified for it. Do not make delayed participation a prerequisite for ordinary course support.
