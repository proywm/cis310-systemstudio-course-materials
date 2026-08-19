# Behavioral Trust-Calibration Task

**Status:** scenario shells requiring course-specific examples and expert validation

**Target duration:** 8--10 minutes

**Primary construct:** whether reliance matches actual response quality and authority

## Why this task is needed

A rating such as “I trust the AI” cannot distinguish justified reliance from over-reliance. This task presents six short SystemStudio outputs. For each output, the student selects the best immediate action.

## Response options

Use the same four options for every case:

1. **Proceed** using the guidance because the claim is adequately supported.
2. **Verify** the claim against the cited evidence or an approved source before acting.
3. **Reject/report** the guidance because it is unsupported, unsafe, private, or beyond the allowed hint level.
4. **Escalate** to an instructor/TA because the available evidence cannot resolve the case.

Also ask: **How confident are you in that decision?** `0`--`100` in increments of 10.

## Case blueprint

The content expert creates two equivalent sets so the exact examples are not memorized. Each case contains a screenshot or accessible text rendering of the deterministic evidence, AI explanation, confidence/limitation display, and cited source.

| ID | Required case | Ground truth | Best action | RQ |
|---|---|---|---|---|
| `TC01` | Correct explanation, valid evidence citation, permitted hint level, reversible next step | Adequately supported | Proceed | RQ6 |
| `TC02` | Plausible explanation with a claim not established by the displayed evidence | Verification can resolve it | Verify | RQ6, RQ8 |
| `TC03` | Confident explanation whose citation points to a different line, signal, or cycle | Unsupported/mismatched | Reject/report | RQ6, RQ8 |
| `TC04` | Incomplete evidence and an explicit low-confidence message | Human judgment is required | Escalate | RQ6, RQ8 |
| `TC05` | Technically correct response that reveals the restricted solution instead of a permitted hint | Answer leakage | Reject/report | RQ6, RQ8 |
| `TC06` | Suggestion to upload secrets/personal files or run a destructive command | Privacy or command hazard | Reject/report | RQ6, RQ8 |

## Scoring

- `trustcal_total`: number of best-action selections, 0--6.
- `trustcal_prop`: `trustcal_total / 6`.
- `overreliance_count`: proceeding in `TC02`--`TC06`.
- `underreliance_count`: verifying, rejecting, or escalating `TC01` without an articulated course-pack reason.
- `unsafe_accept_count`: proceeding in `TC05` or `TC06`; this is a safety-critical result.
- Preserve confidence ratings separately. Confidently wrong decisions indicate more severe miscalibration than uncertain wrong decisions, but confidence-weighted scoring is exploratory unless pre-specified.

## Quality controls

- Two experts independently verify each case's ground truth and best action.
- Cases must not depend on obscure syntax, unstated assignment policy, or inaccessible visual cues.
- Pilot cases for difficulty; avoid ceiling effects in which every participant recognizes every bad case.
- Randomize case order, not answer-option order.
- Do not tell participants how many cases of each type are present.
- Do not include these cases in training examples.
