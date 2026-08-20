export const COURSEWORK_PROGRESS_VERSION = 1;

export type CourseworkId =
  | 'homework-01'
  | 'homework-02'
  | 'project-01'
  | 'project-02'
  | 'homework-03'
  | 'project-03'
  | 'final-project';

export type CourseworkStatus = 'not-started' | 'in-progress' | 'ready-to-submit' | 'submitted' | 'receipt-confirmed';

export interface CourseworkCheck {
  id: string;
  label: string;
}

export interface CourseworkItem {
  id: CourseworkId;
  title: string;
  kind: 'homework' | 'implementation' | 'final';
  resourceId: string;
  stage: string;
  summary: string;
  preparation: readonly string[];
  checks: readonly CourseworkCheck[];
  expectedExtensions: readonly string[];
}

const COMMON_CANVAS_CHECKS: readonly CourseworkCheck[] = [
  { id: 'canvas-requirements', label: 'I opened the current Canvas assignment and checked its requirements, due date, point value, collaboration rule, AI rule, and required files.' },
  { id: 'evidence', label: 'I compared expected and observed evidence and can explain any mismatch.' },
  { id: 'canvas-submit', label: 'I submitted through Canvas—not by email or by leaving a file only on this computer.' },
  { id: 'canvas-receipt', label: 'I reopened Canvas and confirmed that the intended files and submission receipt are visible.' }
] as const;

export const COURSEWORK_CATALOG: readonly CourseworkItem[] = [
  {
    id: 'homework-01', title: 'Homework 1 · Logic Foundations', kind: 'homework', resourceId: 'homework-01',
    stage: 'Represent and reason', summary: 'Truth tables, Boolean reasoning, K-maps, arithmetic circuits, and evidence.',
    preparation: ['Lectures 1–5', 'Mapped open-book readings and readiness questions'], expectedExtensions: ['pdf', 'docx', 'md', 'dig'],
    checks: [{ id: 'answers-complete', label: 'Every released question has an answer and supporting work.' }, { id: 'logic-evidence', label: 'Truth tables, simplification steps, and circuit evidence agree.' }, ...COMMON_CANVAS_CHECKS]
  },
  {
    id: 'homework-02', title: 'Homework 2 · Sequential Logic and State Machines', kind: 'homework', resourceId: 'homework-02',
    stage: 'Store state', summary: 'Latches, flip-flops, timing, counters, and state-machine reasoning.',
    preparation: ['Lecture 6', 'Timing and state-machine guided work'], expectedExtensions: ['pdf', 'docx', 'md', 'dig'],
    checks: [{ id: 'timing', label: 'Clock edges, current state, next state, and outputs are explicitly shown.' }, { id: 'state-evidence', label: 'The state table/diagram and implementation describe the same behavior.' }, ...COMMON_CANVAS_CHECKS]
  },
  {
    id: 'project-01', title: 'Implementation 1 · Registers and DRAM', kind: 'implementation', resourceId: 'project-01',
    stage: 'Build storage components', summary: 'Registers, program counter, instruction register, memory, and controlled data movement.',
    preparation: ['Lectures 6, 7, and 10', 'Stored-state and address-decoder guided labs'], expectedExtensions: ['dig', 'pdf', 'docx', 'md', 'png'],
    checks: [{ id: 'subcircuits', label: 'Registers, PC, IR, and memory are separated and clearly labeled.' }, { id: 'digital-test', label: 'The Digital circuit opens and each released test or documented test table has been run.' }, ...COMMON_CANVAS_CHECKS]
  },
  {
    id: 'project-02', title: 'Implementation 2 · Register File and ALU', kind: 'implementation', resourceId: 'project-02',
    stage: 'Compute and route data', summary: 'Two-read/one-write register file, ALU behavior, selection, and test evidence.',
    preparation: ['Lectures 2, 5, and 10', 'Adder, selector, and ALU-slice guided labs'], expectedExtensions: ['dig', 'pdf', 'docx', 'md', 'png'],
    checks: [{ id: 'register-ports', label: 'Two read ports and one write path are tested independently.' }, { id: 'alu-table', label: 'Every released ALU control case has expected and observed evidence.' }, ...COMMON_CANVAS_CHECKS]
  },
  {
    id: 'homework-03', title: 'Homework 3 · Memory and Assembly Foundations', kind: 'homework', resourceId: 'homework-03',
    stage: 'Trace instructions', summary: 'Memory organization, processor behavior, registers, flags, stack, and assembly reasoning.',
    preparation: ['Lectures 8–10 and 12', 'Real-toolchain and instruction-trace activities'], expectedExtensions: ['pdf', 'docx', 'md', 'asm'],
    checks: [{ id: 'trace', label: 'Register, flag, memory, stack, and control-flow changes are traced where required.' }, { id: 'assembly-boundary', label: 'Real assembler evidence and trace-tutor visualization are not confused.' }, ...COMMON_CANVAS_CHECKS]
  },
  {
    id: 'project-03', title: 'Implementation 3 · Integrated 4-bit Processor', kind: 'implementation', resourceId: 'project-03',
    stage: 'Integrate the cumulative processor', summary: 'Reuse the tested storage, register-file, and ALU components to complete the cumulative 4-bit processor.',
    preparation: ['Lectures 5–7 and 10–12', 'Prior implementation components'], expectedExtensions: ['dig', 'pdf', 'docx', 'md', 'png'],
    checks: [{ id: 'fetch-decode-execute', label: 'Fetch, decode, execute, register writeback, memory, and PC behavior are demonstrated.' }, { id: 'processor-program', label: 'A released test program has expected and observed state evidence.' }, ...COMMON_CANVAS_CHECKS]
  },
  {
    id: 'final-project', title: 'Final Presentation · Cumulative 4-bit Processor and Assembly Program', kind: 'final', resourceId: 'final-project-4bit',
    stage: 'Demonstrate the cumulative system',
    summary: 'Present and demonstrate the same 4-bit processor built through Implementations 1–3, together with the released assembly program, during final examination week. Exact date, time, room, order, required artifacts, and deadline are to be announced in Canvas.',
    preparation: ['All processor milestones', 'Lecture 10 CPU/instruction cycle', 'Lecture 12 assembly', 'Presentation rehearsal'],
    expectedExtensions: ['dig', 'asm', 'pdf', 'pptx', 'ppt', 'docx', 'md', 'png'],
    checks: [
      { id: 'released-spec', label: 'I checked the released Canvas specification and know which ISA/toolchain, files, tests, and presentation format are required.' },
      { id: 'architecture', label: 'I can explain the cumulative 4-bit datapath, registers, memory, ALU, instruction behavior, and control sequence.' },
      { id: 'processor-tests', label: 'The processor has a documented test plan with expected and observed state changes.' },
      { id: 'assembly-program', label: 'The required assembly program is tested with the released ISA/toolchain, and I can explain every instruction used.' },
      { id: 'integration-demo', label: 'The demonstration connects processor behavior, program behavior, and visible evidence.' },
      { id: 'team-explanation', label: 'Every authorized team member can explain the design, evidence, and their contribution.' },
      { id: 'rehearsal', label: 'The presentation has been rehearsed within the announced format and time.' },
      ...COMMON_CANVAS_CHECKS
    ]
  }
] as const;

export const LOCAL_SELF_EVALUATION_SOURCE = 'Local student planning and self-evaluation — not graded and not sent to Canvas or course staff.';
export const MANUAL_CANVAS_GRADE_ESTIMATE_SOURCE = 'Manual planning estimate from scores entered by the student — not an official Canvas grade.';
export const CANVAS_INSTRUCTOR_GSI_GRADE_SOURCE = 'Official evaluated performance is assigned by the instructor and recorded in Canvas. No GSI or grader is currently confirmed for CIS 310.';

export const FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS = [
  { id: 'architecture', label: 'Explain the cumulative 4-bit architecture and instruction behavior' },
  { id: 'circuit-evidence', label: 'Build, test, and diagnose processor circuit behavior' },
  { id: 'assembly', label: 'Explain and test the required assembly program' },
  { id: 'integration', label: 'Connect program instructions to processor-state evidence' },
  { id: 'presentation', label: 'Present, demonstrate, and answer questions' }
] as const;

export type FinalSelfEvaluationDimension = typeof FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS[number]['id'];
export type FinalProjectSelfEvaluation = Partial<Record<FinalSelfEvaluationDimension, number>>;

export interface CourseworkItemProgress {
  status: CourseworkStatus;
  completedCheckIds: string[];
  updatedAt: string;
}

export interface CanvasCalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  allDay?: boolean;
  url?: string;
}

export interface CourseworkProgress {
  version: 1;
  items: Partial<Record<CourseworkId, CourseworkItemProgress>>;
  finalSelfEvaluation: FinalProjectSelfEvaluation;
  canvasEvents: CanvasCalendarEvent[];
}

const CATALOG_BY_ID = new Map(COURSEWORK_CATALOG.map((item) => [item.id, item]));
const STATUS_ORDER: readonly CourseworkStatus[] = ['not-started', 'in-progress', 'ready-to-submit', 'submitted', 'receipt-confirmed'];

export function createCourseworkProgress(): CourseworkProgress {
  return { version: COURSEWORK_PROGRESS_VERSION, items: {}, finalSelfEvaluation: {}, canvasEvents: [] };
}

export function normalizeCourseworkProgress(value: unknown): CourseworkProgress {
  if (!isRecord(value) || value.version !== COURSEWORK_PROGRESS_VERSION) return createCourseworkProgress();
  const items: CourseworkProgress['items'] = {};
  if (isRecord(value.items)) {
    for (const [id, raw] of Object.entries(value.items)) {
      const item = CATALOG_BY_ID.get(id as CourseworkId);
      if (!item || !isRecord(raw) || !STATUS_ORDER.includes(raw.status as CourseworkStatus)) continue;
      const allowed = new Set(item.checks.map((check) => check.id));
      const completedCheckIds = Array.isArray(raw.completedCheckIds)
        ? raw.completedCheckIds.filter((check): check is string => typeof check === 'string' && allowed.has(check))
        : [];
      items[item.id] = {
        status: raw.status as CourseworkStatus,
        completedCheckIds: [...new Set(completedCheckIds)],
        updatedAt: safeIso(raw.updatedAt)
      };
    }
  }
  return {
    version: COURSEWORK_PROGRESS_VERSION,
    items,
    finalSelfEvaluation: normalizeFinalProjectSelfEvaluation(value.finalSelfEvaluation),
    canvasEvents: normalizeCanvasEvents(value.canvasEvents)
  };
}

export function updateCourseworkStatus(progress: CourseworkProgress, id: CourseworkId, status: CourseworkStatus, now = new Date()): CourseworkProgress {
  const item = CATALOG_BY_ID.get(id);
  if (!item || !STATUS_ORDER.includes(status)) throw new Error('The coursework status is invalid.');
  const previous = progress.items[id] ?? { status: 'not-started' as const, completedCheckIds: [], updatedAt: new Date(0).toISOString() };
  return { ...progress, items: { ...progress.items, [id]: { ...previous, status, updatedAt: now.toISOString() } } };
}

export function toggleCourseworkCheck(progress: CourseworkProgress, id: CourseworkId, checkId: string, now = new Date()): CourseworkProgress {
  const item = CATALOG_BY_ID.get(id);
  if (!item?.checks.some((check) => check.id === checkId)) throw new Error('The coursework checklist item is invalid.');
  const previous = progress.items[id] ?? { status: 'not-started' as const, completedCheckIds: [], updatedAt: new Date(0).toISOString() };
  const completed = new Set(previous.completedCheckIds);
  if (completed.has(checkId)) completed.delete(checkId); else completed.add(checkId);
  return { ...progress, items: { ...progress.items, [id]: { ...previous, completedCheckIds: [...completed], updatedAt: now.toISOString() } } };
}

export function updateFinalProjectSelfEvaluation(progress: CourseworkProgress, dimension: FinalSelfEvaluationDimension, rating: number): CourseworkProgress {
  if (!FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS.some((item) => item.id === dimension) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('The self-evaluation rating must be an integer from 1 to 5.');
  }
  return { ...progress, finalSelfEvaluation: { ...progress.finalSelfEvaluation, [dimension]: rating } };
}

export function replaceCanvasEvents(progress: CourseworkProgress, events: readonly CanvasCalendarEvent[]): CourseworkProgress {
  return { ...progress, canvasEvents: normalizeCanvasEvents(events) };
}

export function summarizeCourseworkProgress(progress: CourseworkProgress): { percent: number; receiptConfirmed: number; readyOrLater: number; total: number } {
  let points = 0;
  let receiptConfirmed = 0;
  let readyOrLater = 0;
  for (const item of COURSEWORK_CATALOG) {
    const state = progress.items[item.id];
    const index = STATUS_ORDER.indexOf(state?.status ?? 'not-started');
    points += index / (STATUS_ORDER.length - 1);
    if (index >= STATUS_ORDER.indexOf('ready-to-submit')) readyOrLater += 1;
    if (state?.status === 'receipt-confirmed') receiptConfirmed += 1;
  }
  return { percent: Math.round(points / COURSEWORK_CATALOG.length * 100), receiptConfirmed, readyOrLater, total: COURSEWORK_CATALOG.length };
}

export function summarizeFinalProjectSelfEvaluation(evaluation: FinalProjectSelfEvaluation): { average?: number; completed: number; total: number } {
  const values = FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS.map((dimension) => evaluation[dimension.id]).filter((value): value is number => typeof value === 'number');
  return { average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined, completed: values.length, total: FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS.length };
}

export interface ScoreInput { earned: number; possible: number; }
export interface FinalGradeEstimateInput {
  participationQuizzes: readonly ScoreInput[];
  courseworkCategoryPercent: number;
  finalProject: ScoreInput;
}

export interface FinalGradeEstimate {
  quizCategoryPercent: number;
  droppedQuizIndexes: number[];
  retainedQuizEarned: number;
  retainedQuizPossible: number;
  courseworkCategoryPercent: number;
  finalProjectPercent: number;
  weightedQuizPoints: number;
  weightedCourseworkPoints: number;
  weightedFinalProjectPoints: number;
  totalPercent: number;
  letter: string;
}

export const LETTER_GRADE_THRESHOLDS = [
  { minimum: 96.5, letter: 'A+' }, { minimum: 94, letter: 'A' }, { minimum: 90, letter: 'A-' },
  { minimum: 87, letter: 'B+' }, { minimum: 84, letter: 'B' }, { minimum: 80, letter: 'B-' },
  { minimum: 77, letter: 'C+' }, { minimum: 74, letter: 'C' }, { minimum: 70, letter: 'C-' },
  { minimum: 67, letter: 'D+' }, { minimum: 64, letter: 'D' }, { minimum: 60, letter: 'D-' },
  { minimum: 0, letter: 'E' }
] as const;

export function estimateFinalGrade(input: FinalGradeEstimateInput): FinalGradeEstimate {
  if (input.participationQuizzes.length < 3) throw new Error('Enter at least three participation-quiz scores so two can be dropped.');
  const quizRates = input.participationQuizzes.map((score, index) => ({ index, score, percent: scorePercent(score) }));
  const droppedQuizIndexes = [...quizRates].sort((a, b) => a.percent - b.percent || a.index - b.index).slice(0, 2).map((score) => score.index);
  const dropped = new Set(droppedQuizIndexes);
  const kept = quizRates.filter((score) => !dropped.has(score.index));
  const keptEarned = kept.reduce((sum, item) => sum + item.score.earned, 0);
  const keptPossible = kept.reduce((sum, item) => sum + item.score.possible, 0);
  const quizCategoryPercent = scorePercent({ earned: keptEarned, possible: keptPossible });
  const courseworkCategoryPercent = boundedPercent(input.courseworkCategoryPercent, 'Homework/implementation category percentage');
  const finalProjectPercent = scorePercent(input.finalProject);
  const weightedQuizPoints = quizCategoryPercent * 0.15;
  const weightedCourseworkPoints = courseworkCategoryPercent * 0.65;
  const weightedFinalProjectPoints = finalProjectPercent * 0.20;
  const totalPercent = weightedQuizPoints + weightedCourseworkPoints + weightedFinalProjectPoints;
  return {
    quizCategoryPercent, droppedQuizIndexes, retainedQuizEarned: keptEarned, retainedQuizPossible: keptPossible,
    courseworkCategoryPercent, finalProjectPercent,
    weightedQuizPoints, weightedCourseworkPoints, weightedFinalProjectPoints, totalPercent,
    letter: letterGradeForPercentage(totalPercent)
  };
}

export function letterGradeForPercentage(percent: number): string {
  const valid = boundedPercent(percent, 'Percentage');
  return LETTER_GRADE_THRESHOLDS.find((threshold) => valid >= threshold.minimum)?.letter ?? 'E';
}

export interface DigitalDiagnosis {
  id: string;
  title: string;
  explanation: string;
  checks: readonly string[];
}

const DIGITAL_DIAGNOSES: readonly (DigitalDiagnosis & { patterns: readonly RegExp[] })[] = [
  {
    id: 'undefined-wire', title: 'Undefined or unconnected Digital signal',
    explanation: 'Digital cannot resolve a value when a wire or output has no valid driver, has conflicting drivers, or ends at the wrong port.',
    patterns: [/undefined/i, /no output connected/i, /unconnected/i, /not connected to a wire/i],
    checks: ['Select the reported wire/component and trace it to exactly one source.', 'Check splitter widths, tunnel names, subcircuit ports, and output-probe connections.', 'Test the smallest subcircuit first; record expected and observed values.']
  },
  {
    id: 'clock', title: 'Clock path or sequential-component problem',
    explanation: 'A flip-flop, register, memory component, or nested subcircuit needs a valid clock connection and the intended edge behavior.',
    patterns: [/clock/i, /flip.?flop/i, /edge.?trigger/i],
    checks: ['Trace the clock from the top-level input into every required subcircuit.', 'Confirm the component clock port—not an enable/data port—is connected.', 'Pulse one clock edge at a time and compare current state with predicted next state.']
  },
  {
    id: 'testcase-signals', title: 'Digital testcase signal-name or interface mismatch',
    explanation: 'The testcase header must use the exact current top-level input/output labels and widths.',
    patterns: [/testcase/i, /test case/i, /signal.*not found/i, /unknown.*signal/i, /header/i, /output.*name/i],
    checks: ['Compare every testcase header name with the top-level label, including capitalization.', 'Check input/output direction and bit width.', 'Remove stale names left from an earlier circuit version, then rerun the official testcase.']
  },
  {
    id: 'test-command', title: 'No runnable Digital testcase was detected',
    explanation: 'The VS Code test action runs testcases embedded in the selected .dig file; a plain circuit may have nothing for the CLI test runner to execute.',
    patterns: [/no tests/i, /no testcase/i, /cannot find.*test/i, /test button/i],
    checks: ['Open the circuit in Full Digital and verify whether the released instructions require a Testcase component.', 'Use the Test view or “Run Digital Circuit Tests” only on the intended .dig file.', 'If Canvas supplies a testcase, use that exact released version.']
  }
];

export function diagnoseDigitalErrors(text: string): DigitalDiagnosis[] {
  const bounded = text.trim().slice(0, 10_000);
  if (!bounded) return [];
  const matches = DIGITAL_DIAGNOSES.filter((diagnosis) => diagnosis.patterns.some((pattern) => pattern.test(bounded)))
    .map(({ patterns: _patterns, ...diagnosis }) => diagnosis);
  return matches.length ? matches : [{
    id: 'general', title: 'Capture a minimal reproducible Digital problem',
    explanation: 'This message does not match a known recurring error. Preserve the exact evidence before changing the circuit.',
    checks: ['Save a copy, then identify the smallest failing subcircuit.', 'Write the expected input/output or state transition and the observed result.', 'Capture the full error, relevant labels/widths, and one attempted fix for the instructor.']
  }];
}

export function diagnoseDigitalError(text: string): DigitalDiagnosis | undefined {
  return diagnoseDigitalErrors(text)[0];
}

export function parseCanvasIcsEvents(ics: string): CanvasCalendarEvent[] {
  const unfolded = ics.replace(/\r?\n[ \t]/g, '');
  const blocks = unfolded.split(/BEGIN:VEVENT\r?\n/).slice(1);
  const events: CanvasCalendarEvent[] = [];
  for (const [index, block] of blocks.entries()) {
    const body = block.split(/\r?\nEND:VEVENT/)[0] ?? '';
    const title = unescapeIcs(icsProperty(body, 'SUMMARY')?.value ?? '').trim();
    const startProperty = icsProperty(body, 'DTSTART');
    if (!title || !startProperty) continue;
    const parsedStart = parseIcsDate(startProperty.value, startProperty.parameters);
    if (!parsedStart) continue;
    const rawUrl = unescapeIcs(icsProperty(body, 'URL')?.value ?? '').trim();
    events.push({
      id: unescapeIcs(icsProperty(body, 'UID')?.value ?? `canvas-event-${index}`).slice(0, 300),
      title: title.slice(0, 300), startsAt: parsedStart.startsAt,
      ...(parsedStart.allDay ? { allDay: true } : {}),
      ...(isSafeCanvasUrl(rawUrl) ? { url: rawUrl } : {})
    });
    if (events.length >= 500) break;
  }
  return events.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function isSafeCanvasUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'canvas.umd.umich.edu' || url.hostname.endsWith('.instructure.com'));
  } catch {
    return false;
  }
}

function normalizeFinalProjectSelfEvaluation(value: unknown): FinalProjectSelfEvaluation {
  if (!isRecord(value)) return {};
  const result: FinalProjectSelfEvaluation = {};
  for (const dimension of FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS) {
    const rating = value[dimension.id];
    if (Number.isInteger(rating) && Number(rating) >= 1 && Number(rating) <= 5) result[dimension.id] = Number(rating);
  }
  return result;
}

function normalizeCanvasEvents(value: unknown): CanvasCalendarEvent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((event): CanvasCalendarEvent[] => {
    if (!isRecord(event) || typeof event.id !== 'string' || typeof event.title !== 'string' || typeof event.startsAt !== 'string' || Number.isNaN(Date.parse(event.startsAt))) return [];
    const url = typeof event.url === 'string' && isSafeCanvasUrl(event.url) ? event.url : undefined;
    return [{
      id: event.id.slice(0, 300), title: event.title.slice(0, 300), startsAt: new Date(event.startsAt).toISOString(),
      ...(event.allDay === true ? { allDay: true } : {}), ...(url ? { url } : {})
    }];
  }).slice(0, 500).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function scorePercent(score: ScoreInput): number {
  if (!Number.isFinite(score.earned) || !Number.isFinite(score.possible) || score.possible <= 0 || score.earned < 0) throw new Error('Every score needs non-negative earned points and possible points greater than zero.');
  return boundedPercent(score.earned / score.possible * 100, 'Score percentage');
}

function boundedPercent(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`${label} must be from 0 to 100.`);
  return value;
}

function icsProperty(block: string, name: string): { value: string; parameters: Record<string, string> } | undefined {
  const match = block.match(new RegExp(`(?:^|\\r?\\n)${name}((?:;[^:]*)?):(.*)(?:\\r?\\n|$)`, 'i'));
  if (!match) return undefined;
  const parameters: Record<string, string> = {};
  for (const segment of (match[1] ?? '').split(';').filter(Boolean)) {
    const separator = segment.indexOf('=');
    if (separator <= 0) continue;
    const key = segment.slice(0, separator).trim().toUpperCase();
    const value = segment.slice(separator + 1).trim().replace(/^"|"$/g, '');
    if (key && value) parameters[key] = value;
  }
  return { value: (match[2] ?? '').trim(), parameters };
}

function parseIcsDate(value: string, parameters: Record<string, string>): { startsAt: string; allDay: boolean } | undefined {
  const compact = value.trim();
  if (parameters.VALUE?.toUpperCase() === 'DATE' || /^\d{8}$/.test(compact)) {
    if (!/^\d{8}$/.test(compact)) return undefined;
    return { startsAt: `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T12:00:00.000Z`, allDay: true };
  }
  const match = compact.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second, zone] = match;
  if (zone === 'Z') {
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    return Number.isNaN(date.getTime()) ? undefined : { startsAt: date.toISOString(), allDay: false };
  }
  const startsAt = zonedLocalTimeToIso(
    { year: Number(year), month: Number(month), day: Number(day), hour: Number(hour), minute: Number(minute), second: Number(second) },
    parameters.TZID ?? 'America/Detroit'
  );
  return startsAt ? { startsAt, allDay: false } : undefined;
}

function zonedLocalTimeToIso(
  components: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  timeZone: string
): string | undefined {
  try {
    const desiredUtc = Date.UTC(components.year, components.month - 1, components.day, components.hour, components.minute, components.second);
    let candidate = desiredUtc;
    for (let iteration = 0; iteration < 3; iteration += 1) {
      const next = desiredUtc - timeZoneOffsetMilliseconds(candidate, timeZone);
      if (next === candidate) break;
      candidate = next;
    }
    const observed = zonedParts(candidate, timeZone);
    if (Object.entries(components).some(([key, expected]) => observed[key] !== expected)) return undefined;
    return new Date(candidate).toISOString();
  } catch {
    return undefined;
  }
}

function timeZoneOffsetMilliseconds(timestamp: number, timeZone: string): number {
  const parts = zonedParts(timestamp, timeZone);
  return Date.UTC(parts.year!, parts.month! - 1, parts.day!, parts.hour!, parts.minute!, parts.second!) - timestamp;
}

function zonedParts(timestamp: number, timeZone: string): Record<string, number> {
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  const result: Record<string, number> = {};
  for (const part of formatter.formatToParts(new Date(timestamp))) {
    if (['year', 'month', 'day', 'hour', 'minute', 'second'].includes(part.type)) result[part.type] = Number(part.value);
  }
  return result;
}

function unescapeIcs(value: string): string {
  return value.replaceAll('\\n', '\n').replaceAll('\\,', ',').replaceAll('\\;', ';').replaceAll('\\\\', '\\');
}

function safeIso(value: unknown): string {
  if (typeof value !== 'string') return new Date(0).toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
