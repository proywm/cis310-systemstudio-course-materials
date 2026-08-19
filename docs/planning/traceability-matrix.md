# Evidence-to-Requirement Traceability

This matrix keeps product claims connected to the student-evaluation evidence and prevents features from being justified only because they are technically interesting.

| Evaluation-derived need | Product response | Requirement IDs | Validation |
|---|---|---|---|
| Students need feedback before dependent work proceeds | Deterministic local checks and evidence-linked formative guidance | FR-CODE-03--05, FR-AI-01--07 | Time to useful feedback; correctness; productive retry |
| Scores without explanations do not support revision | Explain expected/observed behavior and relevant concept | FR-CODE-04--05, FR-AI-02--03 | Faculty rubric; citation validity; student interpretation task |
| Students struggle to translate concepts into projects | Milestones, micro-lessons, worked analogies, progressive hints | FR-LEARN-01--05, FR-AI-04--05 | Retry success and near-transfer performance |
| Tool setup consumes learning time | Versioned Dev Container and preflight diagnostics | FR-ENV-01--06 | Setup completion/time and platform failure categories |
| Students cannot tell environment failures from code failures | Layered diagnostic classification | FR-ENV-03--04, FR-CODE-04 | Seeded environment/code fault classification accuracy |
| C, assembly, xv6, and digital-logic prerequisites vary | Readiness check and targeted refreshers | FR-LEARN-01--03 | Diagnostic-to-lesson mapping and opt-out usability |
| Students request more examples and short practice | Magoosh-style micro-lessons and practice tasks | FR-LEARN-01, FR-LEARN-04 | Lesson completion, explanation comprehension, transfer task |
| Processor construction needs visible debugging support | JSON-backed visual editor, cycle trace, earliest divergence | FR-CPU-01--06 | Reference design and seeded-fault test suite |
| Assignment instructions and expectations can be unclear | Versioned instructor-authored course packs | FR-AUTHOR-01--04 | Schema/integrity tests and instructor preview |
| Students need a predictable path to human support | Previewable, redacted help packet | FR-HELP-01--04 | Completeness, unnecessary-data rate, instructor resolution time |
| Some students are reluctant to ask public questions | Private hints and student-controlled escalation | FR-AI-04, FR-HELP-01--04 | Usability interview; trust calibration; opt-out behavior |
| Generic ChatGPT referrals can reduce trust | Constrained evidence-grounded coach; visible authority hierarchy | FR-AI-01--07 | Unsupported-claim, leakage, citation, and trust measures |
| Software cannot fix course alignment or classroom climate | Explicit product non-goals and human responsibility | Non-goals; NFR-06--10 | Client review and evaluation-report limitations |

Detailed measurement coverage is maintained in [`rq-instrument-matrix.md`](rq-instrument-matrix.md). Learning is evaluated with matched pre/post assignments; student perception, telemetry, expert review, trust-calibration cases, accessibility observation, and staff workload logs provide distinct supporting evidence.

## Claim discipline

| Stage | Permitted statement |
|---|---|
| Proposal | “We plan to build and evaluate…” |
| Prototype | “The prototype is designed to…” |
| Offline validation | “On the seeded-fault benchmark…” |
| Usability test | “Among participants completing the synthetic tasks…” |
| Classroom pilot | “In the tested activity and term…” |

Broader statements about learning, equity, or feedback turnaround require evidence beyond a successful implementation.
