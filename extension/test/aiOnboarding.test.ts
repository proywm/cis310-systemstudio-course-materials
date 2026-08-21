import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  AI_ASSISTANCE_ONBOARDING_VERSION,
  aiAssistanceLabel,
  aiAssistanceState,
  normalizeAiAssistanceState
} from '../src/core/aiOnboarding';

describe('first-run Orbit assistance setup', () => {
  it('normalizes only current, verified student assistance choices', () => {
    const now = new Date('2026-08-21T12:00:00Z');
    const state = aiAssistanceState('codex', 'local-ready', now);
    assert.deepEqual(normalizeAiAssistanceState(state), state);
    assert.equal(normalizeAiAssistanceState({ ...state, version: AI_ASSISTANCE_ONBOARDING_VERSION + 1 }), undefined);
    assert.equal(normalizeAiAssistanceState({ ...state, preference: 'instructor-key' }), undefined);
    assert.match(aiAssistanceLabel('codex'), /Codex CLI learning and setup coach/i);
    assert.match(aiAssistanceLabel('offline'), /private offline/i);
  });

  it('runs assistance onboarding before the existing tutorial and environment prompt', async () => {
    const source = await readFile(path.resolve('src/extension.ts'), 'utf8');
    const onboarding = source.indexOf('await promptForOrbitSetupOnFirstRun(context)');
    const tutorial = source.indexOf('await TutorialPanel.promptOnFirstRun(context)');
    const install = source.indexOf('await maybePromptForInstall(context, manager, setupDigital)');
    assert.ok(onboarding >= 0 && onboarding < tutorial && tutorial < install);
    assert.match(source, /probeCodexCli/);
    assert.match(source, /Open official U-M setup/);
    assert.doesNotMatch(source, /Maizey|U-M GPT/);
    assert.match(source, /private offline Orbit helper/i);
    assert.match(source, /only a short diagnostic that you review can be sent to U-M Codex after your explicit action/i);
  });
});
