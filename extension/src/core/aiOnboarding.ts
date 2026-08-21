export const AI_ASSISTANCE_ONBOARDING_VERSION = 2;

export type AiAssistancePreference = 'maizey' | 'umgpt' | 'offline';

export interface AiAssistanceState {
  version: number;
  preference: AiAssistancePreference;
  verifiedAt: string;
  verification: 'student-confirmed' | 'local-ready';
}

export function normalizeAiAssistanceState(value: unknown): AiAssistanceState | undefined {
  if (!isRecord(value) || value.version !== AI_ASSISTANCE_ONBOARDING_VERSION) return undefined;
  if (!['maizey', 'umgpt', 'offline'].includes(String(value.preference))) return undefined;
  if (!['student-confirmed', 'local-ready'].includes(String(value.verification))) return undefined;
  if (typeof value.verifiedAt !== 'string' || !Number.isFinite(Date.parse(value.verifiedAt))) return undefined;
  return value as unknown as AiAssistanceState;
}

export function aiAssistanceState(
  preference: AiAssistancePreference,
  verification: AiAssistanceState['verification'],
  now = new Date()
): AiAssistanceState {
  return {
    version: AI_ASSISTANCE_ONBOARDING_VERSION,
    preference,
    verifiedAt: now.toISOString(),
    verification
  };
}

export function aiAssistanceLabel(preference: AiAssistancePreference): string {
  if (preference === 'maizey') return 'U-M Maizey course and setup coach';
  if (preference === 'umgpt') return 'U-M GPT general learning and setup coach';
  return 'private offline Orbit helper';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
