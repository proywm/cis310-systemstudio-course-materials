import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runProcess } from '../src/core/processRunner';

describe('safe process runner', () => {
  it('passes arguments without shell interpolation', async () => {
    const payload = 'literal;$(not-executed)';
    const result = await runProcess(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', payload]);
    assert.equal(result.code, 0);
    assert.equal(result.stdout, payload);
  });

  it('stops a process at the timeout', async () => {
    const result = await runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { timeoutMs: 50 });
    assert.equal(result.timedOut, true);
  });

  it('limits captured output', async () => {
    const result = await runProcess(process.execPath, ['-e', 'process.stdout.write("x".repeat(1000))'], {
      maxOutputBytes: 64
    });
    assert.equal(result.stdout.length, 64);
    assert.equal(result.truncated, true);
  });
});
