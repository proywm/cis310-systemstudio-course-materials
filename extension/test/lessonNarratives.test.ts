import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { PRE_CLASS_MODULES } from '../src/core/learningResources';
import { LESSON_NARRATIVES, lessonTutorPrompt } from '../src/core/lessonNarratives';

describe('accessible novice lesson texts', () => {
  it('provides one substantial, evidence-bounded narrative for every course module', () => {
    assert.equal(LESSON_NARRATIVES.length, 13);
    assert.deepEqual(
      LESSON_NARRATIVES.map((lesson) => lesson.resourceId),
      PRE_CLASS_MODULES.map((module) => module.resourceId)
    );
    for (const lesson of LESSON_NARRATIVES) {
      const words = JSON.stringify(lesson).replace(/[^A-Za-z0-9’'-]+/g, ' ').trim().split(/\s+/).length;
      assert.ok(words >= 500, `${lesson.resourceId} is too short for a novice lesson (${words} words)`);
      assert.ok(lesson.objectives.length >= 4, `${lesson.resourceId} needs measurable objectives`);
      assert.ok(lesson.terms.length >= 4, `${lesson.resourceId} needs plain-language vocabulary`);
      assert.ok(lesson.sections.length >= 3, `${lesson.resourceId} needs concept development`);
      assert.ok(lesson.sections.every((section) => section.paragraphs.length > 0));
      assert.ok(lesson.examples.length >= 2, `${lesson.resourceId} needs worked examples`);
      assert.ok(lesson.examples.every((example) => example.steps.length >= 3));
      assert.ok(lesson.selfChecks.length >= 3);
      assert.ok(lesson.tutorPrompts.length >= 3);
      assert.match(lesson.slideEvidence, /Lecture .+ PDF, (?:core )?slides/i);
      assert.ok(lesson.scopeBoundary.length >= 40);
    }
  });

  it('renders a semantic, reflowable, keyboard-operable HTML alternative', () => {
    const source = readFileSync(path.resolve('src/lessonTextPanel.ts'), 'utf8');
    assert.match(source, /<html lang="en">/);
    assert.equal((source.match(/<h1>/g) ?? []).length, 1);
    assert.match(source, /<nav aria-label="Lesson navigation">/);
    assert.match(source, /<main id="lesson-main" tabindex="-1">/);
    assert.match(source, /<aside class="tutor" aria-labelledby="tutor-heading">/);
    assert.match(source, /<footer>/);
    assert.match(source, /class="skip-link" href="#lesson-main"/);
    assert.match(source, /button:focus-visible/);
    assert.match(source, /@media \(forced-colors: active\)/);
    assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
    assert.doesNotMatch(source, /<img\b/i, 'Important visuals must be described in text, not added as inaccessible images');
    assert.doesNotMatch(source, /<table\b/i, 'Layout must not use tables');
    for (const lesson of LESSON_NARRATIVES) {
      const visibleText = JSON.stringify(lesson);
      assert.doesNotMatch(visibleText, /\b(?:click here|follow this link|read more)\b/i);
    }
  });

  it('creates bounded tutor prompts', () => {
    const prompt = lessonTutorPrompt('lecture-06', 0);
    assert.match(prompt ?? '', /Lecture 6/);
    assert.match(prompt ?? '', /Ask for my attempt first/);
    assert.match(prompt ?? '', /do not complete graded work/);
    assert.equal(lessonTutorPrompt('lecture-06', 99), undefined);
  });
});
