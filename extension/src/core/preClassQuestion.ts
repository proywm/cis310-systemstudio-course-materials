export type QuestionVisibility = 'named' | 'anonymous';

export interface PreClassQuestionDraft {
  topic: string;
  question: string;
  understanding: string;
  confusion: string;
  attempted: string;
  visibility: QuestionVisibility;
}

export type PreClassQuestionRequest =
  | { type: 'prepare-question'; draft: PreClassQuestionDraft };

const FIELD_LIMIT = 2_000;
const TOPIC_LIMIT = 160;

export function parsePreClassQuestionRequest(value: unknown): PreClassQuestionRequest | undefined {
  if (!isRecord(value) || value.type !== 'prepare-question' || !isRecord(value.draft)) {
    return undefined;
  }
  const visibility = value.draft.visibility;
  if (visibility !== 'named' && visibility !== 'anonymous') {
    return undefined;
  }
  const topic = bounded(value.draft.topic, TOPIC_LIMIT);
  const question = bounded(value.draft.question, FIELD_LIMIT);
  if (!topic || !question) {
    return undefined;
  }
  return {
    type: 'prepare-question',
    draft: {
      topic,
      question,
      understanding: bounded(value.draft.understanding, FIELD_LIMIT),
      confusion: bounded(value.draft.confusion, FIELD_LIMIT),
      attempted: bounded(value.draft.attempted, FIELD_LIMIT),
      visibility
    }
  };
}

export function formatPreClassQuestion(draft: PreClassQuestionDraft): string {
  const sections = [
    `Topic: ${draft.topic}`,
    `Question for the next class:\n${draft.question}`
  ];
  if (draft.understanding) {
    sections.push(`What I understand so far:\n${draft.understanding}`);
  }
  if (draft.confusion) {
    sections.push(`Where my reasoning becomes unclear:\n${draft.confusion}`);
  }
  if (draft.attempted) {
    sections.push(`What I already tried or checked:\n${draft.attempted}`);
  }
  sections.push('Requested classroom support: please address this concept, example, or decision point before or during the scheduled class.');
  return sections.join('\n\n');
}

export function canvasDiscussionUri(value: string): URL | undefined {
  try {
    const uri = new URL(value);
    if (uri.protocol !== 'https:' || uri.hostname !== 'canvas.umd.umich.edu') {
      return undefined;
    }
    if (!/^\/courses\/\d+\/discussion_topics(?:\/\d+)?\/?$/.test(uri.pathname)) {
      return undefined;
    }
    uri.username = '';
    uri.password = '';
    uri.hash = '';
    return uri;
  } catch {
    return undefined;
  }
}

function bounded(value: unknown, maximum: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
