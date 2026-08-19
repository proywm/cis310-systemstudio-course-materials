import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canvasDiscussionUri,
  formatPreClassQuestion,
  parsePreClassQuestionRequest
} from '../src/core/preClassQuestion';

describe('pre-class question workflow', () => {
  it('accepts a bounded structured question and formats only supplied evidence', () => {
    const request = parsePreClassQuestionRequest({
      type: 'prepare-question',
      draft: {
        topic: 'Lecture 6: Sequential Logic',
        question: 'Why does the clock error persist?',
        understanding: 'The visible flip-flops use the same clock.',
        confusion: '',
        attempted: 'I checked each visible connection.',
        visibility: 'anonymous'
      }
    });
    assert.ok(request);
    const post = formatPreClassQuestion(request.draft);
    assert.match(post, /Lecture 6/);
    assert.match(post, /What I already tried/);
    assert.doesNotMatch(post, /Where my reasoning/);
  });

  it('requires a topic, a question, and an explicit supported visibility choice', () => {
    assert.equal(parsePreClassQuestionRequest({ type: 'prepare-question', draft: {} }), undefined);
    assert.equal(parsePreClassQuestionRequest({
      type: 'prepare-question',
      draft: { topic: 'Lecture 1', question: 'Help', visibility: 'secret' }
    }), undefined);
  });

  it('allows only UM-Dearborn Canvas discussion URLs', () => {
    assert.ok(canvasDiscussionUri('https://canvas.umd.umich.edu/courses/552144/discussion_topics'));
    assert.ok(canvasDiscussionUri('https://canvas.umd.umich.edu/courses/552144/discussion_topics/12345'));
    assert.equal(canvasDiscussionUri('https://example.com/courses/552144/discussion_topics'), undefined);
    assert.equal(canvasDiscussionUri('https://canvas.umd.umich.edu/courses/552144/assignments'), undefined);
  });
});
