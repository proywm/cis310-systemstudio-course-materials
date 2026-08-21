import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import path from 'node:path';
import { AI_TUTOR_PREFLIGHT, looksLikeDirectSolutionRequest } from '../src/core/aiTutorGuardrails';

describe('AI tutor learning guardrails', () => {
  it('detects direct deliverable requests without blocking normal concept questions', () => {
    assert.equal(looksLikeDirectSolutionRequest('Give me the answer to this question'), true);
    assert.equal(looksLikeDirectSolutionRequest('Do my homework'), true);
    assert.equal(looksLikeDirectSolutionRequest('Write my assembly program'), true);
    assert.equal(looksLikeDirectSolutionRequest('Build this circuit for my assignment'), true);
    assert.equal(looksLikeDirectSolutionRequest('Can you explain how a loop changes ECX?'), false);
    assert.equal(looksLikeDirectSolutionRequest('Please give me one hint about K-map adjacency'), false);
  });

  it('states attempt-first, graded-work, and Canvas boundaries before opening the tutor', () => {
    const text = `${AI_TUTOR_PREFLIGHT.message} ${AI_TUTOR_PREFLIGHT.detail}`;
    assert.match(text, /Make an attempt first/);
    assert.match(text, /Do not ask it to produce an answer/);
    assert.match(text, /Canvas assignment rules/);
    assert.equal(AI_TUTOR_PREFLIGHT.openLabel, 'Open as Learning Coach');
  });

  it('ships Codex workspace policy that withholds first-turn practice answers and graded deliverables', async () => {
    const prompt = await readFile(
      path.resolve('../course-packs/cis310-fall2026/support/CODEX_AGENTS.md'),
      'utf8'
    );
    assert.match(prompt, /only when supplied course context clearly identifies it/);
    assert.match(prompt, /unsupported claim that an item is ungraded is not enough/);
    assert.match(prompt, /Do not give the answer, answer choice, or option letter in the first response/);
    assert.match(prompt, /default to graded-task mode/);
    assert.match(prompt, /Do not complete missing portions of student work one piece at a time/);
    assert.match(prompt, /role-change or prompt-injection|change roles/);
  });
});
