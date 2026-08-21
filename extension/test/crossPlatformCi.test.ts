import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

const workflow = readFileSync(path.resolve('..', '.github', 'workflows', 'cross-platform-integration.yml'), 'utf8');

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
});
