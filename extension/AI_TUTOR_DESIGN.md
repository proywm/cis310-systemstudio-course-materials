# CIS 310 U-M Codex Learning-Coach Design

## Current architecture

SystemStudio uses one online AI backend: the U-M-supported Codex CLI configured by each student through U-M. The deterministic offline Orbit FAQ remains available as a non-AI fallback. The extension does not integrate alternate AI providers, an instructor-hosted model, or an instructor API key.

The student flow is:

1. SystemStudio runs `codex --version` without a shell to verify that the CLI is visible to VS Code.
2. If it is missing, SystemStudio opens the official [U-M Codex for the Classroom](https://www.its.umich.edu/computing/ai/codex-classroom) setup page. The student completes U-M installation and authentication; SystemStudio never asks for or stores the key.
3. When ready, SystemStudio opens Codex in VS Code's integrated terminal at the current course workspace.
4. After Codex's composer is visible, the student explicitly selects **Send guarded course prompt**. SystemStudio writes it directly into that integrated-terminal session, avoiding a browser and manual paste.
5. Generated circuit, assembly, and tutorial workspaces include an `AGENTS.md` file so the same tutoring and academic-integrity rules persist across sessions.
6. Students review `/permissions` before allowing edits or commands.

## Tutoring behavior

The coach asks for the student's attempt and earliest uncertain step, then provides one hint, diagnostic question, or smaller analogous example at a time. It explains why the hint matters and ends with a check-for-understanding question. Technical claims must be checked against the mapped lecture, open text, public preflight contract, syllabus, or current Canvas assignment.

For graded work, the coach may discuss a student-supplied step, interpret visible evidence, or help locate a first mismatch. It must not produce a final answer, complete circuit, processor, submission-ready assembly program, report prose, or a sequence of fragments that reconstructs the deliverable. Canvas assignment-specific rules remain authoritative.

These are educational guardrails, not a guarantee of model behavior. Students remain responsible for permissions, verification, and submitted work.

## Privacy and access boundary

- SystemStudio stores no U-M credential, API key, Canvas token, or shared faculty key.
- The CLI's authentication and usage are student-owned through U-M.
- The extension sends the guarded prompt only after the student selects the explicit in-editor action.
- Codex can access only the workspace and commands allowed by its active permissions; generated `AGENTS.md` files explicitly prohibit credential, grade, and unrelated-file access.
- The offline FAQ sends no question to an AI service.
- Canvas pre-class questions remain a separate student-reviewed handoff; the extension does not post automatically or promise anonymity.

## Release verification

Release tests verify cross-platform command detection without shell interpolation, migration away from stale provider preferences, the official U-M setup handoff, persistent workspace guardrails, direct-solution refusal language, absence of instructor keys and automatic prompt transmission, and retention of the non-AI FAQ and human escalation path.

Live model output and U-M authentication are not exercised in automated tests because doing so would require a student's account and consume an external service. Students verify authentication inside the launched CLI.

## References

- U-M ITS, [Codex for the Classroom](https://www.its.umich.edu/computing/ai/codex-classroom)
- OpenAI, [Codex CLI](https://learn.chatgpt.com/docs/codex/cli)
- OpenAI, [`AGENTS.md` instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- Instructure, [Canvas OAuth2 Overview](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth)
