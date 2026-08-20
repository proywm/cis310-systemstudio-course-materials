import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { installCurrentAssemblyGuides } from '../src/core/assemblyGuideUpgrade';

describe('pre-0.11 assembly-workspace migration', () => {
  it('archives all stale guides, installs current guides, and preserves student source', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'systemstudio-assembly-upgrade-'));
    const target = path.join(temporary, 'assembly');
    const studentSource = path.join(target, 'irvine32', 'student-work.asm');
    await mkdir(path.dirname(studentSource), { recursive: true });
    await writeFile(path.join(target, 'README.md'), '# CIS 310 Embedded Assembly Lab\nFlagsBranch.asm\n', 'utf8');
    await writeFile(path.join(target, 'COMPATIBILITY.md'), '# Portable embedded subset\n', 'utf8');
    await writeFile(path.join(target, 'IRVINE32_PROFILE.md'), '# Irvine32 Classroom profile\n', 'utf8');
    await writeFile(studentSource, 'mov eax, 42\n', 'utf8');

    try {
      const changed = await installCurrentAssemblyGuides(path.resolve('assembly-starter'), target);
      assert.equal(changed, true);
      assert.match(await readFile(path.join(target, 'README.md'), 'utf8'), /systemstudio-assembly-guide: 0\.11/);
      assert.match(await readFile(path.join(target, 'COMPATIBILITY.md'), 'utf8'), /systemstudio-assembly-compatibility: 0\.11/);
      assert.match(await readFile(path.join(target, 'IRVINE32_PROFILE.md'), 'utf8'), /systemstudio-irvine-guide: 0\.11/);
      assert.match(await readFile(path.join(target, 'README-pre-0.11.md'), 'utf8'), /Embedded Assembly Lab/);
      assert.match(await readFile(path.join(target, 'COMPATIBILITY-pre-0.11.md'), 'utf8'), /Portable embedded subset/);
      assert.match(await readFile(path.join(target, 'IRVINE32_PROFILE-pre-0.11.md'), 'utf8'), /Classroom profile/);
      assert.equal(await readFile(studentSource, 'utf8'), 'mov eax, 42\n');
      assert.equal(await installCurrentAssemblyGuides(path.resolve('assembly-starter'), target), false);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
});
