import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRE_CLASS_MODULES,
  MODULE_CONFIDENCE_QUESTION_TARGET,
  MODULE_READINESS_QUESTION_TARGET,
  TARNOFF_AUTHOR_CHANNEL,
  TARNOFF_BOOK_HOME,
  TARNOFF_OER_SERIES,
  emptyPreparationProgress,
  normalizePreparationProgress,
  preparationModule,
  preparationModuleComplete,
  preparationUrl,
  togglePreparation
} from '../src/core/learningResources';
import { PRACTICE_QUESTIONS } from '../src/core/practice';

describe('CIS 310 pre-class learning path', () => {
  it('maps every readiness prompt and practice question to bounded official readings and author videos', () => {
    assert.equal(PRE_CLASS_MODULES.length, 13);
    assert.equal(new Set(PRE_CLASS_MODULES.map((module) => module.resourceId)).size, 13);
    const questionResources = new Set(PRACTICE_QUESTIONS.map((question) => question.resourceId));

    for (const module of PRE_CLASS_MODULES) {
      assert.ok(questionResources.has(module.resourceId), `missing practice for ${module.resourceId}`);
      assert.ok(module.readings.length >= 1);
      assert.ok(module.authorVideos.length >= 1);
      assert.ok(module.focus.length > 20);
      assert.ok(module.readinessPrompt.endsWith('?'));
      assert.equal(PRACTICE_QUESTIONS.filter((question) => question.resourceId === module.resourceId).length, MODULE_CONFIDENCE_QUESTION_TARGET);
      for (const reading of module.readings) {
        assert.ok(
          reading.url.startsWith('https://faculty.etsu.edu/tarnoff/')
            || reading.url.startsWith('https://pages.cs.wisc.edu/~remzi/OSTEP/'),
          `unexpected reading source for ${module.resourceId}`
        );
      }
      for (const video of module.authorVideos) {
        assert.ok(
          video.url.startsWith('https://www.youtube.com/watch?v=')
            || video.url.startsWith(TARNOFF_OER_SERIES),
          `unexpected video source for ${module.resourceId}`
        );
        assert.ok(video.focus.length > 10, `missing video focus for ${module.resourceId}`);
      }
      assert.ok(module.readinessSources.readingIndexes.length >= 1, `readiness lacks reading for ${module.resourceId}`);
      assert.ok(module.readinessSources.videoIndexes.length >= 1, `readiness lacks video for ${module.resourceId}`);
      for (const index of module.readinessSources.readingIndexes) {
        assert.ok(module.readings[index], `readiness reading ${index} is invalid for ${module.resourceId}`);
      }
      for (const index of module.readinessSources.videoIndexes) {
        assert.ok(module.authorVideos[index], `readiness video ${index} is invalid for ${module.resourceId}`);
      }
      for (const question of PRACTICE_QUESTIONS.filter((item) => item.resourceId === module.resourceId)) {
        assert.ok(
          question.sourceMap.readingIndexes.length > 0
            || question.sourceMap.videoIndexes.length > 0
            || (question.sourceMap.lectureSlides?.length ?? 0) > 0,
          `${question.id} lacks mapped reading, video, or lecture-slide evidence`
        );
        for (const index of question.sourceMap.readingIndexes) {
          assert.ok(module.readings[index], `${question.id} reading ${index} is invalid`);
        }
        for (const index of question.sourceMap.videoIndexes) {
          assert.ok(module.authorVideos[index], `${question.id} video ${index} is invalid`);
        }
      }
    }
  });

  it('resolves only the fixed authoritative resource map', () => {
    const first = PRE_CLASS_MODULES[0]!;
    assert.equal(preparationModule(first.resourceId), first);
    assert.equal(preparationUrl(first.resourceId, 'reading'), first.readings[0]!.url);
    assert.equal(preparationUrl(first.resourceId, 'video'), first.authorVideos[0]!.url);
    assert.equal(preparationUrl(first.resourceId, 'video', 1), first.authorVideos[1]!.url);
    assert.equal(preparationUrl(first.resourceId, 'book-home'), TARNOFF_BOOK_HOME);
    assert.equal(preparationUrl(first.resourceId, 'author-channel'), TARNOFF_AUTHOR_CHANNEL);
    assert.equal(preparationUrl(first.resourceId, 'oer-series'), TARNOFF_OER_SERIES);
    assert.equal(preparationUrl(first.resourceId, 'lecture'), undefined);
    assert.equal(preparationUrl('../bad', 'reading'), undefined);
    assert.equal(preparationUrl(first.resourceId, 'reading', 99), undefined);
    assert.equal(preparationUrl(first.resourceId, 'video', 99), undefined);
  });

  it('requires five distinct attempted questions before a preparation module is ready', () => {
    assert.equal(preparationModuleComplete(true, true, MODULE_READINESS_QUESTION_TARGET - 1), false);
    assert.equal(preparationModuleComplete(true, true, MODULE_READINESS_QUESTION_TARGET), true);
    assert.equal(preparationModuleComplete(false, true, MODULE_READINESS_QUESTION_TARGET), false);
    assert.equal(preparationModuleComplete(true, false, MODULE_READINESS_QUESTION_TARGET), false);
  });

  it('normalizes and toggles self-reported preparation progress without preserving unknown modules', () => {
    const module = PRE_CLASS_MODULES[0]!;
    const first = togglePreparation(emptyPreparationProgress(), module.resourceId, 'read', new Date('2026-08-20T12:00:00Z'));
    assert.equal(first.modules[module.resourceId]?.read, true);
    assert.equal(first.modules[module.resourceId]?.watched, false);
    const second = togglePreparation(first, module.resourceId, 'watched', new Date('2026-08-21T12:00:00Z'));
    assert.equal(second.modules[module.resourceId]?.watched, true);
    assert.equal(second.modules[module.resourceId]?.updatedAt, '2026-08-21T12:00:00.000Z');

    const normalized = normalizePreparationProgress({
      version: 1,
      modules: {
        [module.resourceId]: { read: true, watched: true, updatedAt: 'not-a-date' },
        '../bad': { read: true, watched: true, updatedAt: '2026-08-21T12:00:00Z' }
      }
    });
    assert.deepEqual(Object.keys(normalized.modules), [module.resourceId]);
    assert.equal(normalized.modules[module.resourceId]?.updatedAt, '1970-01-01T00:00:00.000Z');
    assert.throws(() => togglePreparation(second, '../bad', 'read'), /invalid/);
  });
});
