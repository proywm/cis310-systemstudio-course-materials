# Near-Transfer Assignment Rubric

**Total:** 100 points

**Use:** identical analytic rubric for pre, post, and optional delayed forms

## Dimensions and weights

| ID | Dimension | Weight |
|---|---|---:|
| `AR01` | Functional correctness | 30 |
| `AR02` | Evidence localization and use | 20 |
| `AR03` | Diagnosis and conceptual reasoning | 20 |
| `AR04` | Repair and verification strategy | 20 |
| `AR05` | Explanation and transfer | 10 |

For each dimension, select a level from 0 to 4. Dimension points equal `weight × level / 4`. Retain the five levels as well as the total.

## `AR01` Functional correctness — 30 points

| Level | Descriptor |
|---:|---|
| 4 | The targeted behavior and all required regression checks pass; the result preserves the stated constraints. |
| 3 | The target behavior passes, with one minor incomplete edge case or nonessential defect. |
| 2 | The repair shows the correct mechanism but remains incomplete or passes only part of the target checks. |
| 1 | A relevant change is attempted but the targeted behavior remains substantially incorrect. |
| 0 | No relevant working change, or the artifact no longer builds/runs because of the submitted changes. |

## `AR02` Evidence localization and use — 20 points

| Level | Descriptor |
|---:|---|
| 4 | Identifies the earliest relevant failure and accurately cites the decisive line, signal, cycle, or check; distinguishes relevant from distracting evidence. |
| 3 | Cites valid evidence and localizes the correct region, but misses the earliest divergence or one important detail. |
| 2 | Uses genuine evidence from the correct subsystem, but the citation or connection to the diagnosis is incomplete. |
| 1 | Mentions output or a trace without locating relevant evidence, or relies mainly on unsupported intuition. |
| 0 | Provides no evidence or cites evidence that contradicts the diagnosis. |

## `AR03` Diagnosis and conceptual reasoning — 20 points

| Level | Descriptor |
|---:|---|
| 4 | States the correct violated invariant and gives a coherent causal chain from evidence to failure. |
| 3 | Diagnosis and invariant are substantially correct, with a minor reasoning gap. |
| 2 | Identifies the correct component or code region but only partially explains the violated concept. |
| 1 | Gives a broad or partly plausible diagnosis that is not supported by a causal explanation. |
| 0 | Diagnosis is absent, unrelated, or technically incorrect. |

## `AR04` Repair and verification strategy — 20 points

| Level | Descriptor |
|---:|---|
| 4 | Makes a minimal evidence-based repair, reruns the decisive check, and adds/selects a focused regression check that would catch recurrence. |
| 3 | Repair is focused and verified, but regression coverage or explanation of verification is incomplete. |
| 2 | Repair addresses the diagnosis but changes more than necessary or uses weak verification. |
| 1 | Repair is speculative, combines unrelated changes, or is not meaningfully verified. |
| 0 | No repair/verification strategy, or the action is unsafe/destructive. |

## `AR05` Explanation and transfer — 10 points

| Level | Descriptor |
|---:|---|
| 4 | Concisely explains why the repair follows from the evidence and states how the invariant applies to a new but related case. |
| 3 | Clearly explains the repair and evidence but gives a limited transfer statement. |
| 2 | Describes what changed but only partly explains why. |
| 1 | Gives a procedural summary with little conceptual explanation. |
| 0 | Explanation is absent, copied, or inconsistent with the submitted artifact. |

## Non-score flags

Flags do not automatically change the research score unless the frozen protocol says so. They identify cases requiring review.

- `AF01` verified infrastructure failure;
- `AF02` accessibility barrier;
- `AF03` prohibited external assistance suspected;
- `AF04` assessment exposure or corrupted form;
- `AF05` response incomplete because participant withdrew; and
- `AF06` scoring ambiguity requiring adjudication.

## Rater training and agreement

1. Course experts create at least two anchor responses per performance band.
2. Raters independently score the same 8--12 pilot responses and discuss discrepancies.
3. Freeze clarifications in a scoring memo before study scoring.
4. Double-score at least 25% of study responses, sampled across form and condition.
5. Report an intraclass correlation for the 0--100 total and weighted kappa for ordinal dimensions, with confidence intervals where feasible.
6. Adjudicate while retaining both original ratings.

A high internal-consistency statistic is not required: the five rubric dimensions intentionally measure different parts of performance.
