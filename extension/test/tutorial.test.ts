import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseTutorialRequest,
  resumeTutorialStep,
  TUTORIAL_STEP_IDS,
  TUTORIAL_VERSION,
  tutorialProgress
} from '../src/core/tutorial';

describe('guided tutorial state', () => {
  it('resumes only a compatible in-progress tutorial', () => {
    assert.equal(resumeTutorialStep(tutorialProgress('in-progress', 4)), 4);
    assert.equal(resumeTutorialStep(tutorialProgress('completed', 4)), 0);
    assert.equal(resumeTutorialStep({ version: TUTORIAL_VERSION + 1, status: 'in-progress', lastStep: 4 }), 0);
    assert.equal(resumeTutorialStep({ version: TUTORIAL_VERSION, status: 'in-progress', lastStep: 100 }), TUTORIAL_STEP_IDS.length - 1);
  });

  it('accepts only bounded navigation and allowlisted actions', () => {
    assert.deepEqual(parseTutorialRequest({ type: 'navigate', step: 2 }), { type: 'navigate', step: 2 });
    assert.equal(parseTutorialRequest({ type: 'navigate', step: -1 }), undefined);
    assert.equal(parseTutorialRequest({ type: 'navigate', step: TUTORIAL_STEP_IDS.length }), undefined);
    assert.deepEqual(parseTutorialRequest({ type: 'action', action: 'create-assembly-lab' }), {
      type: 'action', action: 'create-assembly-lab'
    });
    assert.deepEqual(parseTutorialRequest({ type: 'action', action: 'open-canvas' }), {
      type: 'action', action: 'open-canvas'
    });
    assert.deepEqual(parseTutorialRequest({ type: 'action', action: 'open-ai-tutor' }), {
      type: 'action', action: 'open-ai-tutor'
    });
    assert.deepEqual(parseTutorialRequest({ type: 'action', action: 'ask-before-class' }), {
      type: 'action', action: 'ask-before-class'
    });
    assert.equal(parseTutorialRequest({ type: 'action', action: 'workbench.action.terminal.kill' }), undefined);
  });

  it('accepts skip, restart, and completion without extra fields', () => {
    assert.deepEqual(parseTutorialRequest({ type: 'skip' }), { type: 'skip' });
    assert.deepEqual(parseTutorialRequest({ type: 'restart' }), { type: 'restart' });
    assert.deepEqual(parseTutorialRequest({ type: 'complete' }), { type: 'complete' });
    assert.equal(parseTutorialRequest(null), undefined);
  });
});
