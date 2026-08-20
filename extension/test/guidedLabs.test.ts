import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  GUIDED_LABS,
  emptyGuidedLabProgress,
  guidedLabsForResource,
  normalizeGuidedLabProgress,
  parseGuidedLabRequest,
  resetGuidedLab,
  setGuidedLabStep
} from '../src/core/guidedLabs';
import { preparationModule } from '../src/core/learningResources';

describe('guided circuit and assembly labs', () => {
  it('maps seven circuit builds and five assembly traces to verified lecture sources', async () => {
    assert.equal(GUIDED_LABS.filter((lab) => lab.kind === 'circuit').length, 7);
    assert.equal(GUIDED_LABS.filter((lab) => lab.kind === 'assembly').length, 5);
    assert.equal(new Set(GUIDED_LABS.map((lab) => lab.id)).size, GUIDED_LABS.length);
    for (const lab of GUIDED_LABS) {
      const module = preparationModule(lab.resourceId);
      assert.ok(module, `missing lecture module for ${lab.id}`);
      assert.ok(module.readings[lab.sourceReadingIndex], `missing mapped reading for ${lab.id}`);
      assert.ok(module.authorVideos[lab.sourceVideoIndex], `missing mapped video for ${lab.id}`);
      assert.ok(lab.steps.length >= 6, `insufficient walkthrough steps for ${lab.id}`);
      assert.equal(new Set(lab.steps.map((step) => step.id)).size, lab.steps.length);
      assert.ok(lab.steps.every((step) => step.instruction.length > 25 && step.evidence.length > 15));
      assert.equal(typeof lab.requiredForModule, 'boolean');
      if (lab.artifact.kind === 'circuit') {
        assert.match(lab.artifact.fileName, /^[a-z0-9][a-z0-9-]*\.dig$/);
      } else {
        assert.match(lab.artifact.relativePath, /^(?:irvine32|nasm-ia32)\/[A-Za-z0-9-]+\.asm$/);
        await access(path.resolve('assembly-starter', ...lab.artifact.relativePath.split('/')));
      }
    }
  });

  it('provides a lecture-2 half-adder build without supplying the graded full-adder artifact', () => {
    const halfAdder = GUIDED_LABS.find((lab) => lab.id === 'circuit-half-adder');
    assert.ok(halfAdder);
    assert.equal(halfAdder.resourceId, 'lecture-02');
    assert.deepEqual(halfAdder.steps.map((step) => step.id), ['predict', 'pins', 'sum', 'carry', 'test', 'inspect']);
    assert.match(halfAdder.boundary, /does not provide the full-adder or four-bit-adder/);
    assert.equal(guidedLabsForResource('lecture-02').some((lab) => lab.id === halfAdder.id), true);
  });

  it('normalizes, updates, resets, and bounds self-reported lab progress', () => {
    const lab = GUIDED_LABS[0]!;
    const firstStep = lab.steps[0]!;
    const updated = setGuidedLabStep(
      emptyGuidedLabProgress(),
      lab.id,
      firstStep.id,
      true,
      new Date('2026-08-20T12:00:00Z')
    );
    assert.deepEqual(updated.labs[lab.id]?.completedStepIds, [firstStep.id]);
    assert.equal(updated.labs[lab.id]?.updatedAt, '2026-08-20T12:00:00.000Z');
    const normalized = normalizeGuidedLabProgress({
      version: 1,
      labs: {
        [lab.id]: { completedStepIds: [firstStep.id, '../bad', firstStep.id], updatedAt: 'bad-date' },
        '../bad': { completedStepIds: ['predict'], updatedAt: '2026-08-20T12:00:00Z' }
      }
    });
    assert.deepEqual(normalized.labs[lab.id]?.completedStepIds, [firstStep.id]);
    assert.equal(normalized.labs[lab.id]?.updatedAt, '1970-01-01T00:00:00.000Z');
    assert.deepEqual(resetGuidedLab(updated, lab.id), emptyGuidedLabProgress());
    assert.throws(() => setGuidedLabStep(updated, lab.id, '../bad', true), /invalid/);
  });

  it('accepts only allowlisted lab, source, artifact, and step requests', () => {
    const lab = GUIDED_LABS[0]!;
    const step = lab.steps[0]!;
    assert.deepEqual(parseGuidedLabRequest({ type: 'select', labId: lab.id }), { type: 'select', labId: lab.id });
    assert.deepEqual(parseGuidedLabRequest({ type: 'open-source', labId: lab.id, source: 'reading' }), {
      type: 'open-source', labId: lab.id, source: 'reading'
    });
    assert.deepEqual(parseGuidedLabRequest({ type: 'toggle-step', labId: lab.id, stepId: step.id, completed: true }), {
      type: 'toggle-step', labId: lab.id, stepId: step.id, completed: true
    });
    assert.equal(parseGuidedLabRequest({ type: 'open-source', labId: lab.id, source: 'file:///etc/passwd' }), undefined);
    assert.equal(parseGuidedLabRequest({ type: 'toggle-step', labId: lab.id, stepId: '../bad', completed: true }), undefined);
    assert.equal(parseGuidedLabRequest({ type: 'open-artifact', labId: '../bad' }), undefined);
  });
});
