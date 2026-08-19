import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DIGITAL_RELEASE } from '../src/core/digitalRelease';

describe('pinned Digital release', () => {
  it('uses immutable versioned URLs and complete SHA-256 digests', () => {
    assert.equal(DIGITAL_RELEASE.version, 'v0.31');
    assert.match(DIGITAL_RELEASE.downloadUrl, /\/releases\/download\/v0\.31\/Digital\.zip$/);
    assert.match(DIGITAL_RELEASE.archiveSha256, /^[a-f0-9]{64}$/);
    assert.match(DIGITAL_RELEASE.jarSha256, /^[a-f0-9]{64}$/);
  });
});
