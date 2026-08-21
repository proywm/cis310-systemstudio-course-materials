import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { prepareSaveParent } from '../src/core/circuitSave';

describe('new-circuit save parent', () => {
  it('uses the prepared circuits/work directory', async () => {
    const created: string[] = [];
    const prepared = await prepareSaveParent('workspace/circuits/work', 'workspace', async (target) => {
      created.push(target);
    });
    assert.deepEqual(created, ['workspace/circuits/work']);
    assert.deepEqual(prepared, { parent: 'workspace/circuits/work', usedFallback: false });
  });

  it('falls back visibly to the workspace root when preparation fails', async () => {
    const prepared = await prepareSaveParent('workspace/circuits/work', 'workspace', async () => {
      throw new Error('read-only filesystem');
    });
    assert.equal(prepared.parent, 'workspace');
    assert.equal(prepared.usedFallback, true);
    assert.match(prepared.reason ?? '', /read-only/);
  });
});
