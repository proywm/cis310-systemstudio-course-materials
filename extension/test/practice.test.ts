import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import path from 'node:path';
import {
  PRACTICE_QUESTIONS,
  PRACTICE_TOPICS,
  attemptedPracticeQuestionsForResource,
  buildPracticeDashboard,
  emptyPracticeProgress,
  normalizePracticeProgress,
  parsePracticePanelRequest,
  recordPracticeAnswer,
  recordPracticeReflection,
  selectPracticeQuestions,
  toggleSavedQuestion
} from '../src/core/practice';
import { MODULE_CONFIDENCE_QUESTION_TARGET } from '../src/core/learningResources';

describe('CIS 310 formative practice', () => {
  it('ships a valid question bank covering every course topic and lecture', () => {
    assert.equal(PRACTICE_QUESTIONS.length, 13 * MODULE_CONFIDENCE_QUESTION_TARGET);
    assert.equal(new Set(PRACTICE_QUESTIONS.map((question) => question.id)).size, PRACTICE_QUESTIONS.length);
    const coveredTopics = new Set(PRACTICE_QUESTIONS.map((question) => question.topicId));
    const coveredResources = new Set(PRACTICE_QUESTIONS.map((question) => question.resourceId));
    for (const topic of PRACTICE_TOPICS) {
      assert.ok(coveredTopics.has(topic.id), `missing questions for ${topic.id}`);
      for (const resourceId of topic.resourceIds) {
        assert.ok(coveredResources.has(resourceId), `missing practice mapped to ${resourceId}`);
      }
    }
    for (const question of PRACTICE_QUESTIONS) {
      assert.ok(question.options.length >= 3);
      assert.ok(question.correctIndex >= 0 && question.correctIndex < question.options.length);
      assert.ok(question.explanation.length > 30);
      assert.ok(question.takeaway.length > 10);
      assert.ok(['remember', 'understand', 'apply', 'analyze', 'evaluate'].includes(question.bloomLevel));
      assert.ok(
        question.sourceMap.readingIndexes.length > 0
          || question.sourceMap.videoIndexes.length > 0
          || (question.sourceMap.lectureSlides?.length ?? 0) > 0,
        `${question.id} lacks mapped evidence`
      );
    }
    assert.deepEqual(
      PRACTICE_QUESTIONS.reduce<number[]>((counts, question) => {
        counts[question.correctIndex] = (counts[question.correctIndex] ?? 0) + 1;
        return counts;
      }, []),
      [26, 26, 26, 26]
    );
    for (const resourceId of coveredResources) {
      assert.equal(
        PRACTICE_QUESTIONS.filter((question) => question.resourceId === resourceId).length,
        MODULE_CONFIDENCE_QUESTION_TARGET,
        `${resourceId} does not have a complete confidence set`
      );
    }
    assert.deepEqual(
      new Set(PRACTICE_QUESTIONS.map((question) => question.bloomLevel)),
      new Set(['remember', 'understand', 'apply', 'analyze', 'evaluate'])
    );
  });

  it('records correctness, confidence, hints, and spaced review without claiming mastery', () => {
    const now = new Date('2026-08-26T14:00:00.000Z');
    const question = PRACTICE_QUESTIONS[0]!;
    const first = recordPracticeAnswer(emptyPracticeProgress(), {
      questionId: question.id,
      selectedIndex: question.correctIndex,
      confidence: 'high',
      usedHint: false,
      durationMs: 12_000
    }, now);
    const progress = first.progress.questions[question.id]!;
    assert.equal(first.result.correct, true);
    assert.equal(progress.stage, 2);
    assert.equal(progress.highConfidenceCorrect, 1);
    assert.equal(progress.nextReviewAt, '2026-08-30T14:00:00.000Z');
    assert.match(first.result.reviewLabel, /Correct retrieval/);

    const missed = recordPracticeAnswer(first.progress, {
      questionId: question.id,
      selectedIndex: (question.correctIndex + 1) % question.options.length,
      confidence: 'high',
      usedHint: true,
      durationMs: 20_000
    }, new Date('2026-08-30T14:00:00.000Z'));
    assert.equal(missed.progress.questions[question.id]!.stage, 0);
    assert.equal(missed.progress.questions[question.id]!.correctStreak, 0);
    assert.match(missed.result.reviewLabel, /Confident miss/);
  });

  it('counts distinct attempted questions for a lecture preparation check', () => {
    const questions = PRACTICE_QUESTIONS.filter((question) => question.resourceId === 'lecture-06').slice(0, 3);
    let progress = emptyPracticeProgress();
    for (const question of questions) {
      progress = recordPracticeAnswer(progress, {
        questionId: question.id,
        selectedIndex: question.correctIndex,
        confidence: 'medium',
        usedHint: false,
        durationMs: 1_000
      }).progress;
    }
    assert.equal(attemptedPracticeQuestionsForResource(progress, 'lecture-06'), 3);
    const repeated = recordPracticeAnswer(progress, {
      questionId: questions[0]!.id,
      selectedIndex: questions[0]!.correctIndex,
      confidence: 'medium',
      usedHint: false,
      durationMs: 1_000
    }).progress;
    assert.equal(attemptedPracticeQuestionsForResource(repeated, 'lecture-06'), 3);
  });

  it('labels readiness sources and avoids claiming source links open at an exact locator', async () => {
    const source = await readFile(path.resolve('src/practicePanel.ts'), 'utf8');
    assert.match(source, /Readiness source/);
    assert.match(source, /Additional reference/);
    assert.match(source, /Five distinct questions establish readiness/);
    assert.match(source, /Explanation and justification/);
    assert.doesNotMatch(source, /exact supporting source/i);
  });

  it('builds transparent topic and confidence summaries from local attempts', () => {
    const firstQuestion = PRACTICE_QUESTIONS[0]!;
    const secondQuestion = PRACTICE_QUESTIONS.find((question) => question.topicId !== firstQuestion.topicId)!;
    const now = new Date('2026-08-26T14:00:00.000Z');
    const first = recordPracticeAnswer(emptyPracticeProgress(), {
      questionId: firstQuestion.id,
      selectedIndex: firstQuestion.correctIndex,
      confidence: 'low',
      usedHint: false,
      durationMs: 8_000
    }, now);
    const second = recordPracticeAnswer(first.progress, {
      questionId: secondQuestion.id,
      selectedIndex: (secondQuestion.correctIndex + 1) % secondQuestion.options.length,
      confidence: 'high',
      usedHint: false,
      durationMs: 10_000
    }, now);
    const dashboard = buildPracticeDashboard(second.progress, now);
    assert.equal(dashboard.attempts, 2);
    assert.equal(dashboard.correct, 1);
    assert.equal(dashboard.accuracy, 0.5);
    assert.equal(dashboard.correctButUncertain, 1);
    assert.equal(dashboard.confidentMisses, 1);
    assert.equal(dashboard.practiceDays, 1);
    assert.equal(dashboard.topics.length, PRACTICE_TOPICS.length);
    assert.ok(dashboard.topics.some((topic) => topic.status === 'review'));
  });

  it('prioritizes due, missed, and saved questions and supports topic filters', () => {
    const question = PRACTICE_QUESTIONS[0]!;
    const answered = recordPracticeAnswer(emptyPracticeProgress(), {
      questionId: question.id,
      selectedIndex: (question.correctIndex + 1) % question.options.length,
      confidence: 'medium',
      usedHint: false,
      durationMs: 5_000
    }, new Date('2026-08-20T12:00:00.000Z')).progress;
    const due = selectPracticeQuestions(answered, { mode: 'practice', focus: 'due', length: 5 }, new Date('2026-08-22T12:00:00.000Z'));
    assert.equal(due[0]?.id, question.id);

    const savedProgress = toggleSavedQuestion(answered, question.id);
    const saved = selectPracticeQuestions(savedProgress, { mode: 'practice', focus: 'saved', length: 10 });
    assert.deepEqual(saved.map((item) => item.id), [question.id]);

    const topic = PRACTICE_TOPICS[1]!;
    const topicQuestions = selectPracticeQuestions(emptyPracticeProgress(), {
      mode: 'quiz', focus: 'all', topicId: topic.id, length: 20
    });
    assert.ok(topicQuestions.length > 0);
    assert.ok(topicQuestions.every((item) => item.topicId === topic.id));

    const lectureQuestions = selectPracticeQuestions(emptyPracticeProgress(), {
      mode: 'practice', focus: 'recommended', resourceId: 'lecture-05', length: 3
    });
    assert.equal(lectureQuestions.length, 3);
    assert.ok(lectureQuestions.every((item) => item.resourceId === 'lecture-05'));
  });

  it('records optional error-log reflection safely', () => {
    const question = PRACTICE_QUESTIONS[0]!;
    const answered = recordPracticeAnswer(emptyPracticeProgress(), {
      questionId: question.id,
      selectedIndex: question.correctIndex,
      confidence: 'medium',
      usedHint: false,
      durationMs: 1_000
    }).progress;
    const reflected = recordPracticeReflection(answered, question.id, 'concept');
    assert.equal(reflected.questions[question.id]!.reflectionCounts.concept, 1);
    assert.throws(() => recordPracticeReflection(emptyPracticeProgress(), question.id, 'concept'), /Answer the question/);
  });

  it('accepts only bounded practice-panel requests and resets invalid stored data', () => {
    assert.deepEqual(parsePracticePanelRequest({
      type: 'start', mode: 'practice', focus: 'recommended', topicId: 'processor', length: 5
    }), { type: 'start', mode: 'practice', focus: 'recommended', topicId: 'processor', length: 5 });
    assert.deepEqual(parsePracticePanelRequest({
      type: 'start', mode: 'practice', focus: 'recommended', resourceId: 'lecture-01', length: 3
    }), { type: 'start', mode: 'practice', focus: 'recommended', resourceId: 'lecture-01', length: 3 });
    assert.deepEqual(parsePracticePanelRequest({
      type: 'open-preparation', resourceId: 'lecture-01', target: 'reading', readingIndex: 1
    }), { type: 'open-preparation', resourceId: 'lecture-01', target: 'reading', readingIndex: 1 });
    assert.deepEqual(parsePracticePanelRequest({
      type: 'open-preparation', resourceId: 'lecture-01', target: 'video', readingIndex: 2
    }), { type: 'open-preparation', resourceId: 'lecture-01', target: 'video', readingIndex: 2 });
    assert.deepEqual(parsePracticePanelRequest({
      type: 'toggle-preparation', resourceId: 'lecture-01', field: 'watched'
    }), { type: 'toggle-preparation', resourceId: 'lecture-01', field: 'watched' });
    assert.deepEqual(parsePracticePanelRequest({
      type: 'open-help', destination: 'ai-tutor'
    }), { type: 'open-help', destination: 'ai-tutor' });
    assert.deepEqual(parsePracticePanelRequest({
      type: 'open-guided-lab', labId: 'circuit-half-adder'
    }), { type: 'open-guided-lab', labId: 'circuit-half-adder' });
    assert.equal(parsePracticePanelRequest({ type: 'open-help', destination: 'external-command' }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'open-guided-lab', labId: '../bad' }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'start', mode: 'practice', focus: 'recommended', length: 100 }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'start', mode: 'practice', focus: 'recommended', resourceId: '../bad', length: 3 }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'open-preparation', resourceId: 'lecture-01', target: 'reading', readingIndex: 9 }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'open-preparation', resourceId: 'lecture-01', target: 'video', readingIndex: 9 }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'toggle-preparation', resourceId: 'lecture-01', field: 'complete' }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'answer', questionId: '../bad', selectedIndex: 0, confidence: 'high', usedHint: false, durationMs: 10 }), undefined);
    assert.equal(parsePracticePanelRequest({ type: 'open-resource', resourceId: 'https://example.com' }), undefined);
    assert.deepEqual(normalizePracticeProgress({ version: 999, questions: {}, attempts: [] }), emptyPracticeProgress());
  });
});
