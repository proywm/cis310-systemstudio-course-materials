import { looksLikeDirectSolutionRequest } from './aiTutorGuardrails';

export type TutorDestination =
  | { kind: 'canvas'; url: string }
  | { kind: 'maizey-app'; url: string }
  | { kind: 'maizey-management'; url: string }
  | { kind: 'invalid' };

const UM_TUTOR_HOSTS = new Set(['maizey.umich.edu', 'umgpt.umich.edu']);

/** Classifies a URL without treating a Maizey project-management page as student chat. */
export function classifyTutorDestination(value: string): TutorDestination {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return { kind: 'invalid' };
    if (parsed.hostname === 'canvas.umd.umich.edu') {
      return /^\/courses\/\d+(?:\/|$)/.test(parsed.pathname)
        ? { kind: 'canvas', url: parsed.toString() }
        : { kind: 'invalid' };
    }
    if (!UM_TUTOR_HOSTS.has(parsed.hostname)) return { kind: 'invalid' };
    const managementSegment = parsed.pathname.toLowerCase().split('/').some((segment) =>
      ['detail', 'overview', 'settings', 'data-sources', 'datasources', 'billing'].includes(segment)
    );
    return managementSegment
      ? { kind: 'maizey-management', url: parsed.toString() }
      : { kind: 'maizey-app', url: parsed.toString() };
  } catch {
    return { kind: 'invalid' };
  }
}

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
