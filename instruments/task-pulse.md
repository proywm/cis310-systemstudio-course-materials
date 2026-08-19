# Immediate Task Pulse

**Status:** draft

**Administration:** immediately after each selected study task or condition; target 3--4 minutes

This short instrument captures task workload and immediate experience before recall decays. It is not the final post-survey.

## Raw NASA-TLX

Use a 0--100 scale in increments of 5 for every item. Preserve the direction shown below. Calculate the unweighted Raw TLX mean only when all six responses are present; otherwise report the observed dimensions without an overall score.

| ID | Dimension | Prompt | Anchors |
|---|---|---|---|
| `TLX01` | Mental demand | How mentally demanding was the task? | 0 `Very low`; 100 `Very high` |
| `TLX02` | Physical demand | How physically demanding was the task? | 0 `Very low`; 100 `Very high` |
| `TLX03` | Temporal demand | How hurried or rushed was the pace of the task? | 0 `Very low`; 100 `Very high` |
| `TLX04` | Performance | How successful were you in accomplishing what you were asked to do? | 0 `Perfect`; 100 `Failure` |
| `TLX05` | Effort | How hard did you have to work to accomplish your level of performance? | 0 `Very low`; 100 `Very high` |
| `TLX06` | Frustration | How insecure, discouraged, irritated, stressed, or annoyed were you? | 0 `Very low`; 100 `Very high` |

The performance scale runs from `Perfect` to `Failure`; do not reverse its display. If analysis needs a “higher is better” performance variable, create a derived variable and document it rather than changing the administered scale.

Source and administration manual: [NASA Task Load Index](https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/).

## Immediate experience

Use 1 `Strongly disagree` through 7 `Strongly agree`.

| ID | Statement |
|---|---|
| `TP01` | I knew what evidence to inspect first. |
| `TP02` | The support helped me choose a productive next action. |
| `TP03` | I could tell which information came from a test or trace and which came from AI. |
| `TP04` | I would have preferred human help earlier in this task. |

## Task status

**`TP05` At the end of the task, which best describes your status?**

- Completed and verified
- Completed but not verified
- Made partial progress
- Escalated for human help
- Stopped because of a technical/accessibility barrier
- Stopped for another reason

**`TP06` Optional note**

What was the main reason for your answer? Do not include identifying information.
