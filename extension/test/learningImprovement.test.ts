import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEARNING_IMPROVEMENT_PROGRAM,
  MAX_LEARNING_IMPROVEMENT_EVENTS,
  appendImprovementEvent,
  approvedUmichEndpoint,
  buildImprovementEvent,
  buildImprovementPayload,
  emptyImprovementConsent,
  normalizeImprovementConsent,
  normalizeImprovementEvents,
  type ImprovementEvent
} from '../src/core/learningImprovement';

test('learning-improvement collection is hard-disabled before institutional approval', () => {
  assert.deepEqual(LEARNING_IMPROVEMENT_PROGRAM, { enabled: false, protocolId: '', endpoint: '' });
  assert.deepEqual(emptyImprovementConsent(), { noticeVersion: 1, technical: false, learning: false, survey: false });
  assert.deepEqual(normalizeImprovementConsent({ noticeVersion: 0, technical: true }), emptyImprovementConsent());
});

test('events are allowlisted, coarse, and omit identity and timestamps', () => {
  const event = buildImprovementEvent({
    category: 'learning', name: 'practice-attempt', moduleId: 'lecture-01', activityId: 'q-01',
    selectedOption: 2, correct: false, confidence: 'high', usedHint: true, durationMs: 94_000, attemptNumber: 7
  }, { courseWeek: 'week-1', extensionVersion: '0.25.6', platform: 'darwin', architecture: 'arm64' });
  assert.deepEqual(event, {
    schemaVersion: 1, category: 'learning', name: 'practice-attempt', courseWeek: 'week-1', extensionVersion: '0.25.6',
    moduleId: 'lecture-01', activityId: 'q-01', selectedOption: 2, correct: false, confidence: 'high', usedHint: true,
    durationBucket: '90s-5m', attemptBucket: 'third-plus'
  });
  assert.doesNotMatch(JSON.stringify(event), /email|umid|canvas|grade|prompt|path|timestamp|deviceId/i);
  assert.equal(buildImprovementEvent({ category: 'learning', name: 'arbitrary-clickstream' }, { courseWeek: 'week-1', extensionVersion: 'test' }), undefined);
  assert.deepEqual(normalizeImprovementEvents([{ ...event, studentEmail: 'student@umich.edu', prompt: 'private' }]), [event]);
});

test('queue is bounded and payload requires a protocol identifier', () => {
  const event = buildImprovementEvent({ category: 'technical', name: 'setup-result', outcome: 'success' }, { courseWeek: 'week-1', extensionVersion: 'test', platform: 'linux', architecture: 'x64' })!;
  let queue: ImprovementEvent[] = [];
  for (let index = 0; index < MAX_LEARNING_IMPROVEMENT_EVENTS + 20; index += 1) queue = appendImprovementEvent(queue, event);
  assert.equal(queue.length, MAX_LEARNING_IMPROVEMENT_EVENTS);
  assert.equal(buildImprovementPayload(queue, 'week-1', ''), undefined);
  assert.equal(buildImprovementPayload(queue, 'week-1', 'HUM-IRB-APPROVED')?.courseId, 'cis310-fall2026');
});

test('only approved U-M HTTPS endpoint shapes are accepted', () => {
  assert.equal(approvedUmichEndpoint('https://research.umich.edu/systemstudio')?.hostname, 'research.umich.edu');
  for (const value of ['http://research.umich.edu/x', 'https://umich.edu.evil.example/x', 'https://example.com/x', 'https://user:pass@umich.edu/x']) {
    assert.equal(approvedUmichEndpoint(value), undefined);
  }
});
