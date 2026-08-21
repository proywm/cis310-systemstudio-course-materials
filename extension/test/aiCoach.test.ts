import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyTutorDestination,
  COPILOT_COACH_SYSTEM_PROMPT,
  prepareCoachRequest
} from '../src/core/aiCoach';

describe('AI coach routing and prompt boundaries', () => {
  it('rejects the observed Maizey management URL instead of treating it as student chat', () => {
    assert.equal(
      classifyTutorDestination('https://umgpt.umich.edu/maizey/2b85385a-a00d-4348-852a-b71a9b2ec0a5/detail/overview').kind,
      'maizey-management'
    );
    assert.equal(classifyTutorDestination('https://canvas.umd.umich.edu/courses/552144').kind, 'canvas');
    assert.equal(classifyTutorDestination('https://maizey.umich.edu/apps/cis310-chat').kind, 'maizey-app');
    assert.equal(classifyTutorDestination('http://maizey.umich.edu/apps/cis310-chat').kind, 'invalid');
    assert.equal(classifyTutorDestination('https://evil.example/apps/cis310-chat').kind, 'invalid');
  });

  it('blocks direct deliverables before an optional Copilot request', () => {
    const blocked = prepareCoachRequest('Write my complete assembly assignment code');
    assert.equal(blocked.allowed, false);
    assert.match(blocked.allowed ? '' : blocked.explanation, /will not produce/);
    const allowed = prepareCoachRequest('My prediction is ZF=1 after CMP EAX, EAX. Why?');
    assert.equal(allowed.allowed, true);
    assert.match(allowed.allowed ? allowed.prompt : '', /Student request/);
  });

  it('keeps the instructional processor and NASM environments distinct', () => {
    assert.match(COPILOT_COACH_SYSTEM_PROMPT, /4-bit instructional processor/);
    assert.match(COPILOT_COACH_SYSTEM_PROMPT, /32-bit IA-32 NASM/);
    assert.match(COPILOT_COACH_SYSTEM_PROMPT, /Never provide a finished graded answer/);
    assert.match(COPILOT_COACH_SYSTEM_PROMPT, /Do not claim access to Canvas/);
  });
});
