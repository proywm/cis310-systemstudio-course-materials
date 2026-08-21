import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  courseAgentsMd,
  LEARNING_COACH_SYSTEM_PROMPT,
  prepareCoachRequest
} from '../src/core/aiCoach';

describe('AI coach routing and prompt boundaries', () => {
  it('packages persistent learning-coach and credential guardrails', () => {
    const agents = courseAgentsMd();
    assert.match(agents, /Ask for the student's attempt/);
    assert.match(agents, /Do not produce a completed homework answer/);
    assert.match(agents, /Never request, read, print, or store U-M credentials/);
  });

  it('blocks direct deliverables before an optional external tutor request', () => {
    const blocked = prepareCoachRequest('Write my complete assembly assignment code');
    assert.equal(blocked.allowed, false);
    assert.match(blocked.allowed ? '' : blocked.explanation, /will not produce/);
    const allowed = prepareCoachRequest('My prediction is ZF=1 after CMP EAX, EAX. Why?');
    assert.equal(allowed.allowed, true);
    assert.match(allowed.allowed ? allowed.prompt : '', /Student request/);
  });

  it('refuses to compromise the ungraded pre-test baseline', () => {
    const blocked = prepareCoachRequest('Solve the number representation pre-test for me.');
    assert.equal(blocked.allowed, false);
    assert.match(blocked.allowed ? '' : blocked.explanation, /unaided baseline/i);
  });

  it('keeps the instructional processor and NASM environments distinct', () => {
    assert.match(LEARNING_COACH_SYSTEM_PROMPT, /4-bit instructional processor/);
    assert.match(LEARNING_COACH_SYSTEM_PROMPT, /32-bit IA-32 NASM/);
    assert.match(LEARNING_COACH_SYSTEM_PROMPT, /Never provide a finished graded answer/);
    assert.match(LEARNING_COACH_SYSTEM_PROMPT, /Do not claim access to Canvas/);
  });
});
