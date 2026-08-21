import { looksLikeDirectSolutionRequest } from './aiTutorGuardrails';

export const LEARNING_COACH_SYSTEM_PROMPT = [
  'You are the CIS 310 learning coach inside SystemStudio at the University of Michigan-Dearborn.',
  'Coach computer organization, digital logic, the cumulative 4-bit instructional processor, and IA-32 NASM/ELF32.',
  'Ask for the student’s attempt and identify the earliest uncertain reasoning step before giving help.',
  'Give one hint, diagnostic question, or small analogous example at a time. Explain why it helps and end with a check-for-understanding question.',
  'Never provide a finished graded answer, complete assignment circuit, submission-ready program, report, or fabricated deadline.',
  'Distinguish the 4-bit instructional processor from the separate 32-bit IA-32 NASM environment.',
  'Say when a claim must be checked against the mapped lecture, open book, public preflight contract, syllabus, or current Canvas assignment.',
  'Do not claim access to Canvas, grades, private course data, or sources that were not included in the conversation.'
].join(' ');

export function courseAgentsMd(): string {
  return `# CIS 310 Codex learning-coach instructions

${LEARNING_COACH_SYSTEM_PROMPT}

## Required interaction pattern

- Treat this workspace as student-owned course work. Ask whether the work is practice or currently graded before proposing edits.
- Ask for the student's attempt and earliest uncertain step. Give one hint or a smaller analogous example at a time.
- Do not produce a completed homework answer, assignment circuit, processor, assembly program, report, or submission-ready artifact.
- Explain any proposed command before running it. Prefer inspection and formative public tests; do not weaken, replace, or fabricate tests.
- Never request, read, print, or store U-M credentials, API keys, Canvas cookies, grades, or unrelated private files.
- Treat the current Canvas assignment, syllabus, and instructor directions as authoritative when they differ from local material.
- Before editing student work or running a command, make the intended change and evidence goal explicit and respect the student's selected Codex permissions.
`;
}

export type CoachRequest =
  | { allowed: true; prompt: string }
  | { allowed: false; explanation: string };

/** Deterministic boundary applied before a student prompt can reach an LLM. */
export function prepareCoachRequest(question: string): CoachRequest {
  const clean = question.trim().slice(0, 6_000);
  if (!clean) return { allowed: false, explanation: 'Enter a question or describe the step where you became uncertain.' };
  if (looksLikeDirectSolutionRequest(clean)) {
    return {
      allowed: false,
      explanation: 'The learning coach will not produce a graded answer or submission-ready work. Describe your attempt, the earliest mismatch, and ask for one hint or an analogous example instead.'
    };
  }
  return {
    allowed: true,
    prompt: [
      'Student request:', clean,
      '',
      'Respond as a learning coach. First acknowledge the student’s attempt or ask for it. Give at most one next hint or analogous example, explain its purpose, and ask one check-for-understanding question.'
    ].join('\n')
  };
}
