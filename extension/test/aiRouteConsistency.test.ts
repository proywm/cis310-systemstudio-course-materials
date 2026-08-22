import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

test('student-facing extension and syllabus use U-M Codex rather than retired AI routes', async () => {
  const files = [
    resolve(process.cwd(), 'package.json'),
    resolve(process.cwd(), 'README.md'),
    resolve(process.cwd(), 'src/extension.ts'),
    resolve(process.cwd(), 'src/studentHelperPanel.ts'),
    resolve(process.cwd(), '../course-packs/cis310-fall2026/syllabus/CIS310_Fall_2026_Syllabus.html')
  ];
  const studentFacing = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
  assert.match(studentFacing, /U-M Codex CLI/);
  assert.doesNotMatch(studentFacing, /Maizey|U-M GPT|GitHub Copilot/i);
});
