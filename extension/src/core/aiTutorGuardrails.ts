export const AI_TUTOR_PREFLIGHT = {
  message: 'Open the CIS 310 AI tutor as a learning coach?',
  detail: [
    'Make an attempt first, then ask for one hint, an analogous example, or feedback on your reasoning.',
    'Do not ask it to produce an answer, finished circuit, complete code, report, or other submission-ready work for homework or projects.',
    'Canvas assignment rules determine whether and how AI assistance may be used.'
  ].join(' '),
  openLabel: 'Open as Learning Coach',
  syllabusLabel: 'View Syllabus AI Rules'
} as const;

export function looksLikeDirectSolutionRequest(question: string): boolean {
  const normalized = question.trim().toLowerCase().replaceAll(/\s+/g, ' ');
  return [
    /\b(?:give|tell|show) me (?:the |a )?(?:answer|solution)\b/,
    /\bjust (?:give|tell|show|write|solve|answer|complete)\b/,
    /\b(?:do|solve|complete) (?:my|this|the) (?:homework|assignment|project|question)\b/,
    /\bwrite (?:my|the|this) (?:(?:assembly|nasm|masm|homework|project) )?(?:code|program|report|answer)\b/,
    /\bwrite (?:my|the|this) (?:complete )?(?:assembly |nasm |masm )?(?:assignment |project )?(?:code|program|report|answer)\b/,
    /\bwhat(?:'s| is) the (?:answer|solution)\b/,
    /\b(?:solve|answer) (?:question|problem|homework|assignment|project)(?:\s+[a-z0-9.-]+)?\b/,
    /\b(?:build|design|generate|create) (?:my|the|this) (?:circuit|processor|alu|register file|submission)\b/,
    /\banswer key\b/,
    /\bsubmission[- ]ready\b/
  ].some((pattern) => pattern.test(normalized));
}
