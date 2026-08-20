import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COURSEWORK_CATALOG,
  CANVAS_INSTRUCTOR_GSI_GRADE_SOURCE,
  LOCAL_SELF_EVALUATION_SOURCE,
  createCourseworkProgress,
  diagnoseDigitalErrors,
  estimateFinalGrade,
  letterGradeForPercentage,
  normalizeCourseworkProgress,
  parseCanvasIcsEvents,
  summarizeCourseworkProgress,
  toggleCourseworkCheck,
  updateCourseworkStatus,
  updateFinalProjectSelfEvaluation
} from '../src/core/coursework';

describe('coursework roadmap', () => {
  it('separates the 4-bit implementation milestone from the 8-bit final demonstration', () => {
    assert.equal(COURSEWORK_CATALOG.length, 7);
    assert.match(COURSEWORK_CATALOG.find((item) => item.id === 'project-03')?.title ?? '', /4-bit/);
    const final = COURSEWORK_CATALOG.find((item) => item.id === 'final-project');
    assert.match(final?.title ?? '', /8-bit Processor/);
    assert.match(final?.summary ?? '', /final examination week/i);
    assert.match(final?.summary ?? '', /to be announced in Canvas/i);
    assert.match(final?.checks.find((check) => check.id === 'assembly-program')?.label ?? '', /assembly program/i);
  });

  it('tracks local planning without labeling it as an official grade', () => {
    let progress = createCourseworkProgress();
    progress = updateCourseworkStatus(progress, 'homework-01', 'receipt-confirmed', new Date('2026-09-01T00:00:00Z'));
    progress = toggleCourseworkCheck(progress, 'homework-01', 'canvas-receipt', new Date('2026-09-01T00:00:01Z'));
    progress = updateFinalProjectSelfEvaluation(progress, 'architecture', 3);
    const summary = summarizeCourseworkProgress(progress);
    assert.equal(summary.receiptConfirmed, 1);
    assert.equal(progress.items['homework-01']?.completedCheckIds.includes('canvas-receipt'), true);
    assert.equal(progress.finalSelfEvaluation.architecture, 3);
    assert.match(LOCAL_SELF_EVALUATION_SOURCE, /not graded/i);
    assert.match(CANVAS_INSTRUCTOR_GSI_GRADE_SOURCE, /Official evaluated performance/);
  });

  it('rejects stale or malformed local state', () => {
    const normalized = normalizeCourseworkProgress({
      version: 1,
      items: { 'not-a-course-item': { status: 'submitted', completedCheckIds: ['x'] } },
      finalSelfEvaluation: { architecture: 9 },
      canvasEvents: [{ id: 'x', title: 'x', startsAt: 'invalid' }]
    });
    assert.deepEqual(normalized.items, {});
    assert.deepEqual(normalized.finalSelfEvaluation, {});
    assert.deepEqual(normalized.canvasEvents, []);
  });
});

describe('manual grade estimate', () => {
  it('drops the two lowest participation-quiz percentages and applies 15/65/20', () => {
    const result = estimateFinalGrade({
      participationQuizzes: [
        { earned: 10, possible: 10 },
        { earned: 2, possible: 10 },
        { earned: 8, possible: 10 },
        { earned: 5, possible: 10 }
      ],
      courseworkCategoryPercent: 90,
      finalProject: { earned: 85, possible: 100 }
    });
    assert.deepEqual(result.droppedQuizIndexes, [1, 3]);
    assert.equal(result.quizCategoryPercent, 90);
    assert.equal(result.totalPercent, 89);
    assert.equal(result.letter, 'B+');
  });

  it('uses the syllabus letter boundaries without rounding across them', () => {
    assert.equal(letterGradeForPercentage(96.5), 'A+');
    assert.equal(letterGradeForPercentage(96.499), 'A');
    assert.equal(letterGradeForPercentage(59.999), 'E');
    assert.throws(() => estimateFinalGrade({
      participationQuizzes: [{ earned: 1, possible: 1 }, { earned: 1, possible: 1 }],
      courseworkCategoryPercent: 100,
      finalProject: { earned: 1, possible: 1 }
    }), /at least three/);
  });

  it('combines retained earned and possible points when quiz point values differ', () => {
    const result = estimateFinalGrade({
      participationQuizzes: [
        { earned: 0, possible: 10 },
        { earned: 20, possible: 100 },
        { earned: 10, possible: 10 },
        { earned: 50, possible: 100 }
      ],
      courseworkCategoryPercent: 0,
      finalProject: { earned: 0, possible: 100 }
    });
    assert.deepEqual(result.droppedQuizIndexes, [0, 1]);
    assert.ok(Math.abs(result.quizCategoryPercent - (60 / 110 * 100)) < 1e-10);
  });
});

describe('student diagnostics and calendar import', () => {
  it('classifies recurring Digital evidence without generating a solution', () => {
    const diagnoses = diagnoseDigitalErrors('No output connected to a wire; D flip-flop must be connected to clock');
    assert.ok(diagnoses.some((diagnosis) => diagnosis.id === 'undefined-wire'));
    assert.ok(diagnoses.some((diagnosis) => diagnosis.id === 'clock'));
    assert.ok(diagnoses.every((diagnosis) => !/build the finished circuit/i.test(diagnosis.explanation)));
  });

  it('parses Canvas events locally and drops unsafe URLs', () => {
    const events = parseCanvasIcsEvents([
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:quiz-1',
      'DTSTART:20260901T140000Z',
      'SUMMARY:CIS 310 Quiz 1',
      'URL:https://canvas.umd.umich.edu/courses/552144/assignments/1',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:bad-link',
      'DTSTART;VALUE=DATE:20260902',
      'SUMMARY:CIS 310 Homework',
      'URL:https://example.com/collect-token',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n'));
    assert.equal(events.length, 2);
    assert.match(events[0]?.url ?? '', /canvas\.umd\.umich\.edu/);
    assert.equal(events[1]?.url, undefined);
    assert.equal(events[1]?.allDay, true);
    assert.equal(events[1]?.startsAt, '2026-09-02T12:00:00.000Z');
  });

  it('honors a Canvas TZID instead of the extension host timezone', () => {
    const events = parseCanvasIcsEvents([
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:eastern-deadline',
      'DTSTART;TZID=America/Detroit:20261102T100000',
      'SUMMARY:CIS 310 deadline',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n'));
    assert.equal(events[0]?.startsAt, '2026-11-02T15:00:00.000Z');
    assert.equal(events[0]?.allDay, undefined);
  });
});
