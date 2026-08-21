import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { codexCommandCandidates, codexProbeInvocation, probeCodexCli, UM_CODEX_CLASSROOM_URL } from '../src/core/codexCli';

describe('U-M Codex CLI readiness', () => {
  it('checks Windows executables and fixed command shims without interpolating student input', () => {
    assert.deepEqual(codexCommandCandidates('win32'), ['codex.exe', 'codex.cmd', 'codex']);
    assert.deepEqual(codexCommandCandidates('darwin'), ['codex']);
    assert.deepEqual(codexProbeInvocation('codex.exe', 'win32'), { executable: 'codex.exe', args: ['--version'] });
    assert.match(codexProbeInvocation('codex.cmd', 'win32').args.at(-1) ?? '', /^codex\.cmd --version$/);
    assert.match(UM_CODEX_CLASSROOM_URL, /^https:\/\/www\.its\.umich\.edu\//);
  });

  it('reports a detected CLI without reading authentication data', async () => {
    const fake = ((command: string, _args: readonly string[], _options: object, callback: Function) => {
      callback(null, `codex-cli test via ${command}\n`, '');
      return undefined;
    }) as unknown as Parameters<typeof probeCodexCli>[1];
    const status = await probeCodexCli(['codex'], fake);
    assert.equal(status.ready, true);
    assert.equal(status.command, 'codex');
    assert.match(status.version ?? '', /codex-cli test/);
    assert.match(status.detail, /authentication remains student-owned/i);
  });
});
