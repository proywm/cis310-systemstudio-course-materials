# SystemStudio AI Post-Survey

**Status:** draft for expert review, cognitive testing, and institutional determination

**Target duration:** 10--12 minutes

**Administration:** after the alternate-form near-transfer assignment

Use the same approved front matter, research-generated participant code, and protocol metadata as the pre-survey. Do not collect names, email addresses, uniqnames, UMIDs, or student IDs in the response file.

## Task-specific self-efficacy

Repeat `SE01`--`SE07` from the pre-survey **word for word with the same 0--100 anchors**. Do not add “after using SystemStudio” to the repeated item stems.

Scoring: `selfeff_post` is the arithmetic mean when at least five of seven items are present. `selfeff_change = selfeff_post - selfeff_pre` when both composites exist.

## Evidence and AI trust literacy

Repeat `TR01`--`TR05` from the pre-survey **word for word with the same 1--7 anchors**.

Scoring: `trustlit_post` is the arithmetic mean when at least four of five items are present. `trustlit_change = trustlit_post - trustlit_pre` when both composites exist. The behavioral calibration score remains the primary RQ6 measure.

## Perceived usefulness

Prompt: **Thinking only about the SystemStudio activity you completed, how strongly do you agree or disagree?**

Use the same 1 = Strongly disagree through 7 = Strongly agree scale. Include `I did not use this feature` where appropriate and code it as not applicable, not as the midpoint.

| ID | Statement |
|---|---|
| `PU01` | SystemStudio helped me decide what to try next after a failed attempt. |
| `PU02` | SystemStudio helped me focus on evidence relevant to the problem. |
| `PU03` | SystemStudio helped me make progress on the activity. |
| `PU04` | The guidance supported my understanding rather than only helping me finish. |
| `PU05` | I would choose to use this kind of support for a comparable course activity. |

Scoring: `useful_post` is the mean when at least four of five items are present.

## Feedback quality and timeliness

Use the same 1--7 agreement scale.

| ID | Statement |
|---|---|
| `FQ01` | The guidance clearly separated observed evidence from interpretation. |
| `FQ02` | The cited evidence matched the explanation. |
| `FQ03` | The guidance was specific enough for me to take a focused next step. |
| `FQ04` | The amount of guidance was appropriate for my stage of work. |
| `FQ05` | The guidance avoided revealing more of the solution than I needed. |
| `TM01` | I received guidance early enough to use it in my next attempt. |
| `TM02` | The wait for useful guidance interrupted my progress. |

Scoring:

- `feedbackq_post`: mean of `FQ01`--`FQ05` when at least four are present.
- Report `TM01` and `TM02` separately; do not combine them unless `TM02` is reverse-scored and that rule is frozen before analysis.
- RQ4's primary measure is logged elapsed time to expert-rated useful feedback, not this perception module.

## Ease of use and accessibility

Use the same 1--7 agreement scale.

| ID | Statement |
|---|---|
| `UX01` | I could start the supported environment without unnecessary setup work. |
| `UX02` | I could find the test, trace, hint, and help-request functions I needed. |
| `UX03` | The difference between measured evidence and AI explanation was visually and verbally clear. |
| `UX04` | Error messages told me how to recover or where to obtain help. |
| `UX05` | The interface worked with the keyboard, display, and assistive settings I used. |
| `UX06` | I could preview and control what would be included in a help request. |

Scoring: `ux_post` is the mean when at least four applicable items are present. Always report `UX05` and critical accessibility incidents separately.

## Safety, privacy, and answer control

Use the same 1--7 agreement scale, with `I did not encounter this situation` where needed.

| ID | Statement |
|---|---|
| `SF01` | When the system was uncertain, it made that uncertainty clear. |
| `SF02` | I noticed at least one explanation that was not supported by the displayed evidence. |
| `SF03` | I noticed at least one suggestion that would expose secrets, personal data, or more files than necessary. |
| `SF04` | I noticed at least one suggestion that could run a destructive or unsafe command. |
| `SF05` | I received more of an assignment solution than I wanted or was permitted to receive. |

Scoring and action:

- Do not combine `SF01`--`SF05` into a “safety score.” They represent different events.
- Any response other than `Strongly disagree` to `SF02`--`SF05` triggers a confidential follow-up path if the approved protocol permits it.
- Student reports are investigated against logs; absence of a student report is not evidence that an event did not occur.

## Support and help seeking

| ID | Question and response |
|---|---|
| `HS01` | During the activity, did you request help from an instructor or TA? `No`; `Yes through SystemStudio`; `Yes another way`; `Prefer not to answer` |
| `HS02` | If you needed human help, how easy was it to decide what information to share? 1 `Very difficult` to 7 `Very easy`; `Not applicable` |
| `HS03` | If the system recommended escalation, what did you do? `Escalated`; `Continued alone`; `Used another resource`; `No escalation was recommended`; `Prefer not to answer` |

## Open responses

| ID | Prompt |
|---|---|
| `OPEN01` | Describe one moment when the system helped you make a productive next attempt. Do not include your name or another student's information. |
| `OPEN02` | Describe any guidance that was confusing, misleading, too broad, or too revealing. |
| `OPEN03` | What did you still need from an instructor or TA? |
| `OPEN04` | Describe any setup, platform, keyboard, display, or assistive-technology barrier you encountered. |
| `OPEN05` | What is the single most important change you would make before this tool is used again? |

Open responses are coded with a pre-defined codebook by reviewers who do not have access to student identities or grades.

## Course-evaluation linkage

Do not add these study items to the official UM-Dearborn end-of-semester form without the required campus process. The official common items on access to materials, advancement of understanding/skills, practical assistance, and helpful feedback may be summarized as **secondary course-level context** after final grades.

Report response count and response rate. Do not match anonymous official course-evaluation comments to individual study participants, and do not present historical term differences as a causal treatment effect.
