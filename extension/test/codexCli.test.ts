import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { codexCommandCandidates, codexProbeInvocation, probeCodexCli, UM_CODEX_CLASSROOM_URL } from '../src/core/codexCli';

describe('U-M Codex CLI readiness', () => {
  it('checks Windows executables and fixed command shims without interpolating student input', () => {
    assert.deepEqual(codexCommandCandidates('win32'), ['codex.exe', 'codex.cmd', 'codex']);
    assert.deepEqual(codexCommandCandidates('darwin'), ['codex']);
    assert.deepEqual(codexProbeInvocation('codex.exe', 'win32'), { executable: 'codex.exe', args: ['--version'] });
    assert.match(codexProbeInvocation('codex.cmd', 'win32').args.at(-1) ?? '', /^codex\.cmd --version$/);
    assert.match(codexProbeInvocation('codex.cmd', 'win32', ['login', 'status']).args.at(-1) ?? '', /^codex\.cmd login status$/);
    assert.match(UM_CODEX_CLASSROOM_URL, /^https:\/\/www\.its\.umich\.edu\//);
  });

  it('executes both readiness probes through the fixed Windows command shim', async () => {
    const calls: string[][] = [];
    const fake = ((command: string, args: readonly string[], _options: object, callback: Function) => {
      calls.push([command, ...args]);
      callback(null, args.at(-1)?.endsWith('--version') ? 'codex-cli test\n' : 'Logged in using ChatGPT\n', '');
      return undefined;
    }) as unknown as Parameters<typeof probeCodexCli>[1];
    const status = await probeCodexCli(['codex.cmd'], fake, 'win32');
    assert.equal(status.ready, true);
    assert.deepEqual(calls.map((call) => call.slice(1)), [
      ['/d', '/s', '/c', 'codex.cmd --version'],
      ['/d', '/s', '/c', 'codex.cmd login status']
    ]);
  });

  it('reports ready only after the fixed login-status check succeeds', async () => {
    const calls: string[][] = [];
    const fake = ((command: string, args: readonly string[], _options: object, callback: Function) => {
      calls.push([command, ...args]);
      callback(null, args.includes('--version') ? `codex-cli test via ${command}\n` : 'Logged in using ChatGPT\n', '');
      return undefined;
    }) as unknown as Parameters<typeof probeCodexCli>[1];
    const status = await probeCodexCli(['codex'], fake, 'linux');
    assert.equal(status.ready, true);
    assert.equal(status.installed, true);
    assert.equal(status.authenticated, true);
    assert.equal(status.command, 'codex');
    assert.match(status.version ?? '', /codex-cli test/);
    assert.deepEqual(calls.map((call) => call.slice(1)), [['--version'], ['login', 'status']]);
    assert.match(status.detail, /login status is confirmed/i);
  });

  it('does not report ready when Codex is installed but logged out', async () => {
    const fake = ((_command: string, args: readonly string[], _options: object, callback: Function) => {
      callback(args.includes('--version') ? null : new Error('Not logged in'), args.includes('--version') ? 'codex-cli test' : '', '');
      return undefined;
    }) as unknown as Parameters<typeof probeCodexCli>[1];
    const status = await probeCodexCli(['codex'], fake, 'linux');
    assert.equal(status.ready, false);
    assert.equal(status.installed, true);
    assert.equal(status.authenticated, false);
    assert.match(status.detail, /not authenticated/i);
  });
});
