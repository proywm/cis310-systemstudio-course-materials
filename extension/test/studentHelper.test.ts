import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { answerStudentQuestion, parseStudentHelperRequest } from '../src/core/studentHelper';

describe('student helper', () => {
  it('routes deadlines and submissions to Fall 2026 Canvas without inventing a date', () => {
    const reply = answerStudentQuestion('When is Homework 2 due and where do I submit?');
    assert.match(reply.title, /Canvas/);
    assert.ok(reply.actions.some((action) => action.id === 'open-canvas'));
    assert.doesNotMatch(JSON.stringify(reply), /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\b\d{1,2}\/\d{1,2}\b/);
  });

  it('lists all three homework topic areas', () => {
    const reply = answerStudentQuestion('What homework is in CIS 310?');
    const text = JSON.stringify(reply);
    assert.match(text, /Homework 1/);
    assert.match(text, /Homework 2/);
    assert.match(text, /Homework 3/);
  });

  it('answers calendar questions from the verified term schedule', () => {
    const reply = answerStudentQuestion('When does the semester start and what days do we meet?');
    const text = JSON.stringify(reply);
    assert.match(text, /August 26/);
    assert.match(text, /27 regular/);
    assert.ok(reply.actions.some((action) => action.id === 'open-calendar'));
    assert.ok(reply.actions.some((action) => action.id === 'open-canvas'));
  });

  it('opens the packaged syllabus while routing live fields to Canvas', () => {
    const reply = answerStudentQuestion('Where is the syllabus and office hours?');
    assert.ok(reply.actions.some((action) => action.id === 'open-syllabus'));
    assert.match(JSON.stringify(reply), /instructor-confirmed fields in Canvas/);
  });

  it('routes pre-class preparation to the required open book and author video path', () => {
    const reply = answerStudentQuestion('What should I read and watch before class?');
    const text = JSON.stringify(reply);
    assert.match(text, /David Tarnoff/);
    assert.match(text, /Read → Watch → Try 3 questions/);
    assert.ok(reply.actions.some((action) => action.id === 'open-learning'));
  });

  it('routes half-adder and hands-on questions to mapped guided labs', () => {
    const reply = answerStudentQuestion('Is there a half adder tutorial or circuit walkthrough?');
    assert.match(reply.title, /Hands-on Lab Center/);
    assert.match(JSON.stringify(reply), /fresh blank file/);
    assert.ok(reply.actions.some((action) => action.id === 'open-guided-labs'));
    assert.deepEqual(parseStudentHelperRequest({ type: 'action', action: 'open-guided-labs' }), {
      type: 'action', action: 'open-guided-labs'
    });
  });

  it('distinguishes Remote SSH from a Digital installation failure', () => {
    const reply = answerStudentQuestion('Why will Digital not open over SSH?');
    assert.match(JSON.stringify(reply), /complete upstream Digital application/);
    assert.match(JSON.stringify(reply), /private X\/VNC display/);
    assert.ok(reply.actions.some((action) => action.id === 'check-environment'));
  });

  it('routes AI tutoring to U-M Maizey without claiming the local FAQ is AI', () => {
    const reply = answerStudentQuestion('What is the AI tutor?');
    assert.match(JSON.stringify(reply), /U-M Maizey/);
    assert.ok(reply.actions.some((action) => action.id === 'open-ai-tutor'));
  });

  it('redirects direct-answer and assignment-generation requests to bounded learning help', () => {
    const reply = answerStudentQuestion('Just give me the answer and write my assignment code');
    const text = JSON.stringify(reply);
    assert.match(reply.title, /not replace it/);
    assert.match(text, /will not route a request for an answer/);
    assert.match(text, /one hint or an analogous example/);
    assert.ok(reply.actions.some((action) => action.id === 'ask-before-class'));
    assert.ok(reply.actions.some((action) => action.id === 'open-canvas'));
  });

  it('answers recurring circuit-save and nested-clock questions specifically', () => {
    const saveReply = answerStudentQuestion('How do I save multiple Digital circuits without overwriting?');
    assert.match(saveReply.title, /separate Digital file/);
    const clockReply = answerStudentQuestion('Digital processor analysis says a flip-flop must be connected to the clock');
    assert.match(JSON.stringify(clockReply), /nested subcircuit/);
    assert.ok(clockReply.actions.some((action) => action.id === 'ask-before-class'));
  });

  it('accepts only bounded questions and allowlisted actions', () => {
    assert.deepEqual(parseStudentHelperRequest({ type: 'ask', question: '  help  ' }), { type: 'ask', question: 'help' });
    assert.equal((parseStudentHelperRequest({ type: 'ask', question: 'x'.repeat(3_000) }) as { question: string }).question.length, 2_000);
    assert.deepEqual(parseStudentHelperRequest({ type: 'action', action: 'open-canvas' }), { type: 'action', action: 'open-canvas' });
    assert.deepEqual(parseStudentHelperRequest({ type: 'action', action: 'ask-before-class' }), { type: 'action', action: 'ask-before-class' });
    assert.equal(parseStudentHelperRequest({ type: 'action', action: 'workbench.action.terminal.kill' }), undefined);
  });
});
