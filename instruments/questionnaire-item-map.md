# Questionnaire Item-to-RQ Map

This is the item-level audit trail for the pre-survey, post-survey, and immediate task pulse. “Supporting” means the item helps explain a result but cannot answer the RQ by itself.

## Background and repeated constructs

| Item | Phase | Short content | RQ | Measurement role |
|---|---|---|---|---|
| `BG01` | Pre | Course workflow | RQ7 | Stratification/context |
| `BG02` | Pre | Operating system | RQ7 | Platform disaggregation |
| `BG03` | Pre | Environment access | RQ7 | Access context |
| `BG04` | Pre | Accessibility/support mode | RQ7 | Accessibility disaggregation; optional disclosure |
| `BG05` | Pre | Prior VS Code use | RQ3, RQ7 | Baseline context |
| `BG06` | Pre | Prior container use | RQ3, RQ7 | Baseline context |
| `BG07` | Pre | Prior AI-assistant use | RQ6 | Baseline context |
| `BG08` | Pre | Prior relevant task exposure | RQ3 | Baseline context |
| `SE01` | Pre + post | Configure/validate environment | RQ3, RQ7 | Supporting perceived capability |
| `SE02` | Pre + post | Classify failure from evidence | RQ3 | Supporting perceived capability |
| `SE03` | Pre + post | Locate decisive evidence | RQ3 | Supporting perceived capability |
| `SE04` | Pre + post | Explain expected/observed difference | RQ3 | Supporting perceived capability |
| `SE05` | Pre + post | Plan a focused next step | RQ2, RQ3 | Supporting perceived capability |
| `SE06` | Pre + post | Verify repair/no regression | RQ3 | Supporting perceived capability |
| `SE07` | Pre + post | Create precise, privacy-limited help request | RQ5, RQ8 | Supporting perceived capability |
| `TR01` | Pre + post | Distinguish evidence from AI explanation | RQ6 | Supporting perceived trust literacy |
| `TR02` | Pre + post | Check explanation against cited evidence | RQ1, RQ6 | Supporting perceived trust literacy |
| `TR03` | Pre + post | Know when to verify | RQ6 | Supporting perceived trust literacy |
| `TR04` | Pre + post | Know when to escalate | RQ5, RQ6, RQ8 | Supporting perceived trust literacy |
| `TR05` | Pre + post | Identify AI limitations | RQ6, RQ8 | Supporting perceived trust literacy |

## Post-use experience

| Item | Phase | Short content | RQ | Measurement role |
|---|---|---|---|---|
| `PU01` | Post | Decide what to try next | RQ2 | Supporting usefulness perception |
| `PU02` | Post | Focus on relevant evidence | RQ2 | Supporting usefulness perception |
| `PU03` | Post | Make task progress | RQ2 | Supporting usefulness perception |
| `PU04` | Post | Support understanding, not only finishing | RQ2, RQ3 | Supporting usefulness perception |
| `PU05` | Post | Intention to reuse for comparable activity | RQ2 | Adoption context |
| `FQ01` | Post | Separate evidence from interpretation | RQ1, RQ6 | Supporting quality perception |
| `FQ02` | Post | Citation matched explanation | RQ1 | Supporting quality perception |
| `FQ03` | Post | Specific, focused next step | RQ2 | Supporting quality perception |
| `FQ04` | Post | Appropriate amount of guidance | RQ2 | Supporting hint calibration perception |
| `FQ05` | Post | Avoided excess solution disclosure | RQ8 | Supporting leakage perception |
| `TM01` | Post | Guidance arrived in time for next attempt | RQ4 | Supporting timeliness perception |
| `TM02` | Post | Wait interrupted progress | RQ4 | Supporting timeliness perception |
| `UX01` | Post | Start without unnecessary setup | RQ7 | Supporting ease/accessibility perception |
| `UX02` | Post | Find needed functions | RQ7 | Supporting ease/accessibility perception |
| `UX03` | Post | Evidence/AI distinction clear in interface | RQ6, RQ7 | Supporting trust/accessibility perception |
| `UX04` | Post | Error recovery clear | RQ2, RQ7 | Supporting ease/accessibility perception |
| `UX05` | Post | Worked with input/display/assistive settings | RQ7 | Supporting accessibility perception |
| `UX06` | Post | Preview/control help-request content | RQ7, RQ8 | Supporting access/privacy perception |
| `SF01` | Post | Uncertainty made clear | RQ6, RQ8 | Supporting safety perception |
| `SF02` | Post | Unsupported explanation noticed | RQ1, RQ8 | Incident screen |
| `SF03` | Post | Secret/personal/unnecessary-file request noticed | RQ8 | Incident screen |
| `SF04` | Post | Unsafe/destructive command noticed | RQ8 | Incident screen |
| `SF05` | Post | Excess solution disclosure noticed | RQ8 | Incident screen |
| `HS01` | Post | Human help requested and route | RQ5 | Workload/access context |
| `HS02` | Post | Ease of deciding what to share | RQ7, RQ8 | Privacy/access context |
| `HS03` | Post | Response to escalation recommendation | RQ6, RQ8 | Supporting behavioral self-report |
| `OPEN01` | Post | Productive-next-attempt example | RQ2 | Qualitative explanation |
| `OPEN02` | Post | Confusing/misleading/revealing guidance | RQ1, RQ2, RQ8 | Qualitative explanation/incident lead |
| `OPEN03` | Post | Unmet need for human help | RQ5 | Qualitative explanation |
| `OPEN04` | Post | Setup/platform/accessibility barrier | RQ7 | Qualitative explanation/incident lead |
| `OPEN05` | Post | Most important change | RQ2, RQ7, RQ8 | Product improvement context |

## Immediate task pulse

| Item | Phase | Short content | RQ | Measurement role |
|---|---|---|---|---|
| `TLX01` | After selected task | Mental demand | RQ2, RQ7 | Workload context |
| `TLX02` | After selected task | Physical demand | RQ7 | Accessibility/workload context |
| `TLX03` | After selected task | Temporal demand | RQ4 | Workload/timeliness context |
| `TLX04` | After selected task | Perceived performance | RQ2 | Workload context; not objective performance |
| `TLX05` | After selected task | Effort | RQ2, RQ7 | Workload context |
| `TLX06` | After selected task | Frustration | RQ2, RQ7 | Workload context |
| `TP01` | After selected task | Knew which evidence to inspect | RQ2 | Supporting task experience |
| `TP02` | After selected task | Support enabled productive action | RQ2 | Supporting task experience |
| `TP03` | After selected task | Distinguished evidence from AI | RQ6 | Supporting task experience |
| `TP04` | After selected task | Preferred earlier human help | RQ4, RQ5 | Supporting timeliness/workload experience |
| `TP05` | After selected task | End-of-task status | RQ2, RQ7 | Task status context |
| `TP06` | After selected task | Reason for task status | RQ2, RQ7 | Qualitative explanation |

## Interpretation rule

Questionnaire items are primary for none of RQ1, RQ3, RQ4, RQ5, RQ6, or RQ8. Those questions require expert review, scored assignments, timestamps, staff logs, behavioral calibration, or red-team tests. The survey modules are supporting evidence and diagnostic context. For RQ7, self-reported access context supports—but does not replace—observed setup and task completion.
