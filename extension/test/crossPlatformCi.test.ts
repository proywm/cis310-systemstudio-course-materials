import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

const workflow = readFileSync(path.resolve('..', '.github', 'workflows', 'cross-platform-integration.yml'), 'utf8');
const integrationRunner = readFileSync(path.resolve('scripts', 'run-vscode-integration.mjs'), 'utf8');
const gitAttributes = readFileSync(path.resolve('..', '.gitattributes'), 'utf8');
const containerSmoke = readFileSync(path.resolve('scripts', 'smoke-containers.mjs'), 'utf8');

describe('cross-platform GitHub integration workflow', () => {
  it('runs a real VS Code Extension Host and VSIX audit on three operating systems', () => {
    assert.match(workflow, /ubuntu-24\.04/);
    assert.match(workflow, /windows-2025/);
    assert.match(workflow, /macos-15/);
    assert.match(workflow, /npm run test:integration:vscode/);
    assert.match(workflow, /npm run package && npm run audit:vsix/);
    assert.match(workflow, /VSCODE_TEST_VERSION: 1\.100\.0/);
  });

  it('keeps actual Digital, NASM/GDB, and container execution required', () => {
    assert.match(workflow, /npm run smoke:nasm/);
    assert.match(workflow, /fullDigitalNoVncSmoke\.ts/);
    assert.match(workflow, /npm run smoke:containers/);
    assert.match(workflow, /required-summary:/);
    assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
  });

  it('uses a short macOS temporary path so VS Code IPC sockets fit the OS limit', () => {
    assert.match(integrationRunner, /process\.platform === 'darwin' \? '\/tmp'/);
    assert.match(integrationRunner, /c310-vscode-/);
  });

  it('keeps resource hashes stable on Windows and bounds every RFB connection attempt', () => {
    assert.match(gitAttributes, /\* text=auto eol=lf/);
    assert.match(gitAttributes, /\*\.pdf binary/);
    assert.match(containerSmoke, /connection closed before RFB greeting/);
    assert.match(containerSmoke, /clearTimeout\(timer\)/);
  });
});
