import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRE_CLASS_MODULES,
  TARNOFF_AUTHOR_CHANNEL,
  TARNOFF_BOOK_HOME,
  TARNOFF_OER_SERIES,
  emptyPreparationProgress,
  normalizePreparationProgress,
  preparationModule,
  preparationUrl,
  togglePreparation
} from '../src/core/learningResources';
import { PRACTICE_QUESTIONS } from '../src/core/practice';

describe('CIS 310 pre-class learning path', () => {
  it('maps every presentation resource to official readings, an author video, and three or more questions', () => {
    assert.equal(PRE_CLASS_MODULES.length, 13);
    assert.equal(new Set(PRE_CLASS_MODULES.map((module) => module.resourceId)).size, 13);
    const questionResources = new Set(PRACTICE_QUESTIONS.map((question) => question.resourceId));

    for (const module of PRE_CLASS_MODULES) {
      assert.ok(questionResources.has(module.resourceId), `missing practice for ${module.resourceId}`);
      assert.ok(module.readings.length >= 1);
      assert.ok(module.focus.length > 20);
      assert.ok(module.readinessPrompt.endsWith('?'));
      assert.ok(PRACTICE_QUESTIONS.filter((question) => question.resourceId === module.resourceId).length >= 3);
      for (const reading of module.readings) {
        assert.match(reading.url, /^https:\/\/faculty\.etsu\.edu\/tarnoff\//);
      }
      assert.ok(
        module.authorVideo.url.startsWith('https://www.youtube.com/watch?v=')
          || module.authorVideo.url.startsWith(TARNOFF_OER_SERIES),
        `unexpected video source for ${module.resourceId}`
      );
    }
  });

  it('resolves only the fixed authoritative resource map', () => {
    const first = PRE_CLASS_MODULES[0]!;
    assert.equal(preparationModule(first.resourceId), first);
    assert.equal(preparationUrl(first.resourceId, 'reading'), first.readings[0]!.url);
    assert.equal(preparationUrl(first.resourceId, 'video'), first.authorVideo.url);
    assert.equal(preparationUrl(first.resourceId, 'book-home'), TARNOFF_BOOK_HOME);
    assert.equal(preparationUrl(first.resourceId, 'author-channel'), TARNOFF_AUTHOR_CHANNEL);
    assert.equal(preparationUrl(first.resourceId, 'oer-series'), TARNOFF_OER_SERIES);
    assert.equal(preparationUrl(first.resourceId, 'lecture'), undefined);
    assert.equal(preparationUrl('../bad', 'reading'), undefined);
    assert.equal(preparationUrl(first.resourceId, 'reading', 99), undefined);
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
