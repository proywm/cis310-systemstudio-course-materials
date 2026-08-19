# SystemStudio AI Pre-Survey

**Status:** draft for expert review, cognitive testing, and institutional determination

**Target duration:** 6--8 minutes

**Administration:** before the baseline assignment and before exposure to the AI coach

## Front matter

Insert the approved study information/consent language here. It should state voluntariness, foreseeable risks, benefits, confidentiality limits, whether course records will be linked, compensation if any, the equivalent nonresearch route, withdrawal procedures, and investigator/IRB contacts.

Do not collect study responses if the approved process requires affirmative consent and the participant does not consent.

### Administrative fields

These fields are populated by the study system, not typed by the student.

| ID | Field |
|---|---|
| `ADM01` | Research-generated participant code |
| `ADM02` | Protocol and instrument version |
| `ADM03` | Course/activity code |
| `ADM04` | Timestamp |

## Background and prior exposure

These items support blocking, implementation analysis, and accessibility checks. They are not summed into a scale.

**`BG01` Course workflow**

Which workflow will you use in this study?

- CIS 310 processor-design workflow
- CIS 450 systems-programming workflow
- Usability test only
- Other approved workflow: [specify]

**`BG02` Primary operating system for the activity**

- Windows
- macOS on Apple silicon
- macOS on Intel
- Linux
- ChromeOS/remote environment
- Other: [free text]
- Prefer not to answer

**`BG03` Development environment access**

Which description best matches your expected environment?

- My own supported computer
- University-managed computer
- Remote lab or cloud environment
- Shared computer
- I am not yet sure
- Prefer not to answer

**`BG04` Accessibility/support context**

Will you use any of the following for this activity? Select all that apply.

- Keyboard-only navigation
- Screen reader
- Magnification or high contrast
- Speech input
- Reduced-motion setting
- Extra time or scheduled breaks
- Another approved accommodation or assistive technology
- None of these
- Prefer not to answer

Do not ask students to disclose a diagnosis.

**`BG05` VS Code experience**

Before today, how often have you used VS Code?

- Never
- Once or twice
- A few times each term
- A few times each month
- A few times each week
- Daily or almost daily

**`BG06` Container experience**

Before today, how often have you built or used a development container, Docker container, or comparable reproducible environment?

- Never
- Once or twice
- Occasionally
- Monthly
- Weekly or more often

**`BG07` AI coding-assistant experience**

Before today, how often have you used an AI assistant to explain or debug code or a processor/circuit design?

- Never
- Once or twice
- Occasionally
- Monthly
- Weekly
- Daily or almost daily

**`BG08` Relevant task exposure**

Before today, which tasks have you completed? Select all that apply.

- Compile and debug a C program from a terminal
- Interpret an automated test failure
- Use GDB or a comparable debugger
- Build or modify xv6 or another teaching operating system
- Design a datapath or processor in a digital-logic simulator
- Interpret a signal trace or timing diagram
- None of these
- Prefer not to answer

## Task-specific self-efficacy

Prompt: **Right now, how confident are you that you can complete each task successfully without another person doing it for you?**

Use a slider or eleven radio buttons from 0 to 100 in increments of 10.

- `0` = cannot do at all
- `50` = moderately certain I can do
- `100` = highly certain I can do

| ID | Capability statement |
|---|---|
| `SE01` | Configure and validate the supported development environment for a course project. |
| `SE02` | Use compiler, simulator, or test output to identify the category of a failure. |
| `SE03` | Locate the specific line, signal, cycle, or configuration value that provides evidence about a failure. |
| `SE04` | Explain why the observed evidence differs from the expected behavior. |
| `SE05` | Plan a focused next step instead of changing several things at once. |
| `SE06` | Verify that a proposed repair fixes the original problem without causing a new one. |
| `SE07` | Create a precise help request that includes the relevant evidence and protects unnecessary personal information. |

Scoring: `selfeff_pre` is the arithmetic mean when at least five of seven items are present. Report item results too. Do not impute missing values.

## Evidence and AI trust literacy

Prompt: **How strongly do you agree or disagree with each statement right now?**

Response scale for every item:

1. Strongly disagree
2. Disagree
3. Somewhat disagree
4. Neither agree nor disagree
5. Somewhat agree
6. Agree
7. Strongly agree

| ID | Statement |
|---|---|
| `TR01` | I can distinguish a measured test or simulator result from an AI-generated explanation of that result. |
| `TR02` | I know how to check whether an AI explanation is supported by the evidence it cites. |
| `TR03` | I know when an AI suggestion should be verified before I act on it. |
| `TR04` | I know when a problem should be escalated to an instructor or teaching assistant. |
| `TR05` | I can identify common limits of an AI assistant used for systems programming or processor design. |

Scoring: `trustlit_pre` is the arithmetic mean when at least four of five items are present. This is perceived literacy; [`trust-calibration-task.md`](trust-calibration-task.md) measures behavior.

## Baseline assessment handoff

The survey ends with a neutral link or code for the assigned parallel assessment form. It must not reveal condition assignment. The AI coach is disabled during the baseline assessment.
