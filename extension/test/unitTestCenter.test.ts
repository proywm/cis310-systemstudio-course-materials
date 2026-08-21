import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { describe, it } from 'node:test';

describe('student unit test center', () => {
  it('exposes actual Digital, NASM, and assignment preflight routes', async () => {
    const panel = await readFile(path.resolve('src', 'unitTestCenterPanel.ts'), 'utf8');
    assert.match(panel, /Digital’s own <code>Testcase<\/code>/);
    assert.match(panel, /\*\.test\.asm/);
    assert.match(panel, /systemstudioCis310\.testCircuit/);
    assert.match(panel, /systemstudioCis310\.buildRunAssembly/);
    assert.match(panel, /systemstudioCis310\.openCourseworkCenter/);
    assert.match(panel, /not submit, grade, or certify/);
  });

  it('ships a self-checking NASM template that uses exit status as evidence', async () => {
    const source = await readFile(path.resolve('assembly-starter', 'nasm-elf32', 'StudentUnitTest.test.asm'), 'utf8');
    assert.match(source, /GLOBAL _start/);
    assert.match(source, /cmp eax, 13/);
    assert.match(source, /mov ebx, 1/);
    assert.match(source, /int 0x80/);
  });
});
