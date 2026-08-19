# Usability and Accessibility Observation Protocol

**Participants:** small purposive sample not currently graded on the activity

**Purpose:** identify barriers, not estimate prevalence

## Test tasks

1. Open the supplied workspace and understand the trust notice.
2. Start or attach to the supported environment.
3. Run preflight validation and recover from one seeded setup issue.
4. Open the code or processor artifact.
5. Run a check and locate expected versus observed evidence.
6. Request one progressive hint and identify which text is AI-generated.
7. Preview a help packet, remove one unnecessary item, and choose whether to send it.
8. Recover from an unavailable AI service without losing work.

At least one participant should test each supported operating-system path. Include keyboard-only and relevant assistive-technology paths before classroom release.

## Moderator script

- Explain that the product, not the participant, is being evaluated.
- Ask the participant to think aloud without teaching the interface.
- Use neutral probes: “What are you looking for?” and “What did you expect to happen?”
- Do not rescue immediately unless safety, privacy, distress, or data-loss risk is present.
- After the task, administer [`task-pulse.md`](task-pulse.md) and a short debrief.

## Observation fields

For each task record:

- completion: success / success with assistance / failure;
- start and end timestamp;
- wrong turns and recoveries;
- moderator assistance count and reason;
- accessibility mode/platform;
- whether evidence and AI explanation were correctly distinguished;
- privacy/help-packet errors;
- severity of each usability problem; and
- nonidentifying observation notes.

Severity:

- `0 Cosmetic`: no effect on completion;
- `1 Minor`: delay or confusion with easy recovery;
- `2 Major`: substantial delay or assistance required;
- `3 Critical`: prevents completion or creates safety, privacy, or irreversible-action risk.

## Debrief prompts

1. What did you believe the extension had installed or changed on your computer?
2. Which result did you treat as authoritative, and why?
3. What did the AI know about your work?
4. When would you stop using the hint system and contact a person?
5. What was the most difficult step?
6. Was any content hard to perceive, navigate, or understand with your setup?

All critical findings block classroom release until corrected or explicitly mitigated and accepted by the client/accessibility reviewer.
