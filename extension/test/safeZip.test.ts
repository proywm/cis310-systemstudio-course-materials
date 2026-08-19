import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { strToU8, zipSync } from 'fflate';
import { extractZipSafely, validateArchivePath } from '../src/core/safeZip';

describe('safe ZIP paths', () => {
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
  });

  it('accepts relative Digital paths', () => {
    assert.equal(validateArchivePath('Digital/examples/HalfAdder.dig'),
      ['Digital', 'examples', 'HalfAdder.dig'].join(process.platform === 'win32' ? '\\' : '/'));
  });

  it('rejects traversal and absolute paths', () => {
    assert.throws(() => validateArchivePath('../outside'));
    assert.throws(() => validateArchivePath('Digital/../../outside'));
    assert.throws(() => validateArchivePath('/etc/passwd'));
    assert.throws(() => validateArchivePath('C:/Windows/System32/file'));
    assert.throws(() => validateArchivePath('bad\0name'));
  });

  it('extracts a regular archive below the safety limits', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'systemstudio-safezip-'));
    temporaryDirectories.push(directory);
    const archive = path.join(directory, 'fixture.zip');
    const destination = path.join(directory, 'output');
    await writeFile(archive, zipSync({ 'Digital/example.dig': strToU8('circuit') }));

    await extractZipSafely(archive, destination);

    assert.equal(await readFile(path.join(destination, 'Digital', 'example.dig'), 'utf8'), 'circuit');
  });

  it('rejects a traversal entry before writing outside the destination', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'systemstudio-safezip-'));
    temporaryDirectories.push(directory);
    const archive = path.join(directory, 'traversal.zip');
    const destination = path.join(directory, 'output');
    await writeFile(archive, zipSync({ '../outside.txt': strToU8('blocked') }));

    await assert.rejects(extractZipSafely(archive, destination), /parent-directory path/);
    await assert.rejects(readFile(path.join(directory, 'outside.txt')));
  });
});
