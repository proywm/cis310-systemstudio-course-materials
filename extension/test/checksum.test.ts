import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { equalsSha256, sha256File } from '../src/core/checksum';

describe('checksum verification', () => {
  let directory = '';

  before(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'systemstudio-checksum-'));
  });

  after(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('computes and compares SHA-256 values', async () => {
    const file = path.join(directory, 'fixture.txt');
    await writeFile(file, 'SystemStudio CIS 310\n', 'utf8');
    const digest = await sha256File(file);
    assert.equal(digest, 'b1df15f0c7dbc8aaf5b3a03f82ca29b6da2e3b75c6f35194038c81b353d67f56');
    assert.equal(equalsSha256(digest.toUpperCase(), digest), true);
    assert.equal(equalsSha256(digest, '0'.repeat(64)), false);
  });
});
