import assert from 'node:assert/strict';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { assemblySourceRelativePath } from '../src/core/assemblyPath';

describe('portable assembly source paths', () => {
  it('returns a container-safe relative path for a source inside the workspace', () => {
    const root = path.resolve('/tmp', 'cis310-workspace');
    const source = path.join(root, 'assembly', 'portable', 'hello.asm');
    assert.equal(assemblySourceRelativePath(root, source), 'assembly/portable/hello.asm');
  });

  it('rejects paths outside the workspace and non-assembly files', () => {
    const root = path.resolve('/tmp', 'cis310-workspace');
    assert.throws(
      () => assemblySourceRelativePath(root, path.resolve('/tmp', 'outside.asm')),
      /inside the current workspace/
    );
    assert.throws(
      () => assemblySourceRelativePath(root, path.join(root, 'notes.txt')),
      /.asm extension/
    );
    assert.throws(
      () => assemblySourceRelativePath(root, path.join(root, 'assembly', '-unsafe.asm')),
      /non-leading hyphens/
    );
  });
});
