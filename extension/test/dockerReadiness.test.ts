import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { DOCKER_SERVER_VERSION_ARGS, probeDockerEngine } from '../src/core/dockerReadiness';
import type { ProcessResult } from '../src/core/processRunner';

const result = (overrides: Partial<ProcessResult> = {}): ProcessResult => ({
  code: 0,
  signal: null,
  stdout: '27.5.1\n',
  stderr: '',
  timedOut: false,
  cancelled: false,
  truncated: false,
  ...overrides
});

describe('Docker engine readiness', () => {
  it('does not require Docker on the Linux Full Digital path', async () => {
    assert.equal((await probeDockerEngine('linux', {})).state, 'not-required');
  });

  it('distinguishes a missing client from a stopped engine', async () => {
    assert.equal((await probeDockerEngine('darwin', { PATH: '' })).state, 'cli-missing');

    const directory = await mkdtemp(path.join(tmpdir(), 'cis310-docker-'));
    const executable = path.join(directory, 'docker');
    await writeFile(executable, '#!/bin/sh\n', { mode: 0o755 });
    const stopped = await probeDockerEngine('darwin', { PATH: directory }, async () => result({
      code: 1,
      stdout: '',
      stderr: 'Cannot connect to the Docker daemon.'
    }));
    assert.equal(stopped.state, 'engine-unavailable');
    assert.match(stopped.detail, /engine is not ready/i);
  });

  it('uses the server-version probe and reports a running engine', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'cis310-docker-'));
    const executable = path.join(directory, 'docker.exe');
    await mkdir(directory, { recursive: true });
    await writeFile(executable, '', { mode: 0o755 });
    let args: readonly string[] = [];
    const ready = await probeDockerEngine('win32', { PATH: directory }, async (_command, actual) => {
      args = actual;
      return result();
    });
    assert.deepEqual(args, DOCKER_SERVER_VERSION_ARGS);
    assert.equal(ready.state, 'ready');
    assert.equal(ready.serverVersion, '27.5.1');
  });
});
