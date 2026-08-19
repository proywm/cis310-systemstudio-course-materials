export const TUTORIAL_VERSION = 7;

export const TUTORIAL_STEP_IDS = [
  'choose-environment',
  'canvas-and-materials',
  'diagnose-environment',
  'concept-to-circuit',
  'concept-to-assembly',
  'inspect-evidence',
  'ask-for-help',
  'recover-and-continue'
] as const;

export type TutorialStatus = 'in-progress' | 'completed' | 'skipped';

export interface TutorialProgress {
  version: number;
  status: TutorialStatus;
  lastStep: number;
}

export type TutorialAction =
  | 'show-tools'
  | 'show-materials'
  | 'open-canvas'
  | 'open-calendar'
  | 'open-syllabus'
  | 'open-helper'
  | 'open-ai-tutor'
  | 'ask-before-class'
  | 'open-learning'
  | 'practice-now'
  | 'check-digital'
  | 'setup-digital'
  | 'create-circuit'
  | 'create-workspace'
  | 'create-assembly-lab'
  | 'assembly-guide'
  | 'native-walkthrough';

export type TutorialRequest =
  | { type: 'navigate'; step: number }
  | { type: 'action'; action: TutorialAction }
  | { type: 'complete' }
  | { type: 'skip' }
  | { type: 'restart' };

const TUTORIAL_ACTIONS = new Set<TutorialAction>([
  'show-tools',
  'show-materials',
  'open-canvas',
  'open-calendar',
  'open-syllabus',
  'open-helper',
  'open-ai-tutor',
  'ask-before-class',
  'open-learning',
  'practice-now',
  'check-digital',
  'setup-digital',
  'create-circuit',
  'create-workspace',
  'create-assembly-lab',
  'assembly-guide',
  'native-walkthrough'
]);

export function tutorialProgress(status: TutorialStatus, lastStep: number): TutorialProgress {
  return {
    version: TUTORIAL_VERSION,
    status,
    lastStep: clampTutorialStep(lastStep)
  };
}

export function resumeTutorialStep(value: unknown): number {
  if (!isRecord(value)) return 0;
  if (value.version !== TUTORIAL_VERSION || value.status !== 'in-progress') return 0;
  return clampTutorialStep(value.lastStep);
}

export function parseTutorialRequest(value: unknown): TutorialRequest | undefined {
  if (!isRecord(value) || typeof value.type !== 'string') return undefined;
  switch (value.type) {
    case 'navigate':
      return Number.isInteger(value.step) && Number(value.step) >= 0 && Number(value.step) < TUTORIAL_STEP_IDS.length
        ? { type: 'navigate', step: Number(value.step) }
        : undefined;
    case 'action':
      return typeof value.action === 'string' && TUTORIAL_ACTIONS.has(value.action as TutorialAction)
        ? { type: 'action', action: value.action as TutorialAction }
        : undefined;
    case 'complete':
    case 'skip':
    case 'restart':
      return { type: value.type };
    default:
      return undefined;
  }
}

function clampTutorialStep(step: unknown): number {
  if (!Number.isInteger(step)) return 0;
  return Math.max(0, Math.min(TUTORIAL_STEP_IDS.length - 1, Number(step)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
