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

  it('carries the current Canvas worked examples into all extension lessons', () => {
    const markers: Readonly<Record<string, readonly RegExp[]>> = {
      'lecture-01': [/128 \+ 32 \+ 16 \+ 2 = 178/, /2 \+ F = 17/],
      'lecture-02': [/1110 0001/, /Sum is 1 when an odd number/],
      'lecture-03': [/\(NOT A\)\(NOT B\)C/, /Recognize the remaining pattern as A XOR C/],
      'lecture-04': [/Σm\(2,3,4,5,6,7\)/, /adjacent across the top\/bottom boundary/],
      'lecture-05': [/00 selects D0, so Y=1/, /active-low outputs are 0111/],
      'lecture-06': [/falling edge occurs: Q still stays 1/, /next S1 = S1 XOR/],
      'lecture-07': [/4,096×16 = 65,536 bits/, /0x27FFF − 0x20000 \+ 1/],
      'lecture-08': [/Two STATUS reads return BUSY=1/, /1,000,000 polling cycles/],
      'lecture-08-supplement': [/controller performs all 1,024 transfers/, /FRAM, battery-backed RAM/],
      'lecture-09': [/32,768 ÷ 64 gives 512 cache lines/, /3 hits in 7 accesses/],
      'lecture-10': [/MAR ← address\(a\)/, /Select R4 as the write address/],
      'lecture-11': [/5 \+ \(6−1\) = 10 cycles/, /load-use pair needs one bubble/],
      'lecture-12': [/CMP computes 12−12/, /return address 0x08048405/]
    };

    for (const lesson of LESSON_NARRATIVES) {
      const content = JSON.stringify(lesson.examples);
      for (const marker of markers[lesson.resourceId] ?? []) assert.match(content, marker, `${lesson.resourceId}: ${marker}`);
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
    assert.match(source, /role="tablist" aria-label="Lesson sections"/);
    assert.equal((source.match(/role="tab" aria-selected=/g) ?? []).length, 4);
    assert.equal((source.match(/class="lesson-panel" role="tabpanel"/g) ?? []).length, 4);
    assert.match(source, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/);
    assert.match(source, /savedState\.lessonId === lessonId/);
    assert.match(source, /\.lesson-tabs \{[^}]*flex-wrap: wrap/);
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
