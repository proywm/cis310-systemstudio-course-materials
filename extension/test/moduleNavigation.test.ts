import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { buildCourseModuleNavigation } from '../src/core/moduleNavigation';
import { PRE_CLASS_MODULES, type LearningPathModule } from '../src/core/learningResources';

function learningPath(): LearningPathModule[] {
  return PRE_CLASS_MODULES.map((module, index) => ({
    ...module,
    read: index === 0,
    watched: index === 0,
    practiceAttempts: index === 0 ? 3 : 0,
    practiceQuestionsAttempted: index === 0 ? 3 : 0,
    complete: index === 0
  }));
}

describe('sidebar course-module navigation', () => {
  it('shows every sequential module and identifies the next incomplete module without hiding the outline', () => {
    const navigation = buildCourseModuleNavigation(learningPath());
    assert.equal(navigation.length, 13);
    assert.match(navigation[0]?.label ?? '', /^Module 1:/);
    assert.match(navigation[12]?.label ?? '', /^Module 13:/);
    assert.equal(navigation[0]?.description, 'complete');
    assert.equal(navigation[1]?.next, true);
    assert.equal(navigation.filter((module) => module.next).length, 1);
    assert.equal(navigation.filter((module) => module.expanded).length, 0);
  });

  it('places mapped readings, videos, lecture, readiness practice, progress controls, and labs inside modules', () => {
    const navigation = buildCourseModuleNavigation(learningPath());
    for (const module of navigation) {
      const kinds = new Set(module.items.map((item) => item.kind));
      assert.ok(kinds.has('reading'), `${module.resourceId} has no reading`);
      assert.ok(kinds.has('toggle-read'), `${module.resourceId} has no reading progress control`);
      assert.ok(kinds.has('video'), `${module.resourceId} has no video`);
      assert.ok(kinds.has('toggle-watched'), `${module.resourceId} has no video progress control`);
      assert.ok(kinds.has('lecture'), `${module.resourceId} has no lecture presentation`);
      assert.ok(kinds.has('practice'), `${module.resourceId} has no readiness practice`);
    }
    const lecture2 = navigation.find((module) => module.resourceId === 'lecture-02');
    assert.ok(lecture2?.items.some((item) => item.kind === 'lab' && item.labId === 'circuit-half-adder'));
  });

  it('renders Course Modules as an expanded top-level sidebar group', () => {
    const source = readFileSync(path.resolve('src/statusTree.ts'), 'utf8');
    assert.match(source, /Course Modules \(\$\{complete\}\/\$\{learningPath\.length\}\)/);
    assert.match(source, /groupItem\('modules',[\s\S]*'list-tree', true\)/);
    assert.match(source, /buildCourseModuleNavigation\(this\.practiceStore\.getLearningPath\(\)\)\.map\(moduleItem\)/);
  });
});
