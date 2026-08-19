import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assemblyRunArguments } from '../src/core/assemblyContainer';

describe('portable assembly container arguments', () => {
  it('keeps the workspace read-only and gives write access only to build output', () => {
    const args = assemblyRunArguments(
      'systemstudio-cis310-assembly:test',
      '/course',
      '/course/build',
      'assembly/portable/hello.asm',
      { uid: 1000, gid: 1000 }
    );
    assert.deepEqual(args.slice(0, 2), ['run', '--rm']);
    assert.ok(args.includes('--read-only'));
    assert.ok(args.includes('none'));
    assert.ok(args.includes('ALL'));
    assert.ok(args.includes('/course:/workspace:ro'));
    assert.ok(args.includes('/course/build:/workspace/build:rw'));
    assert.ok(args.includes('1000:1000'));
    assert.deepEqual(args.slice(-3), ['systemstudio-cis310-assembly:test', 'run', 'assembly/portable/hello.asm']);
  });
});
