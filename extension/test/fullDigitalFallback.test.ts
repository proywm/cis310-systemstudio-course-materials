import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { nativeDigitalFallbackAvailable } from '../src/core/fullDigitalFallback';

const ready = { integrityVerified: true, java: { supported: true } };

describe('Full Digital native fallback', () => {
  it('falls back on Windows/macOS when verified Digital and Java are ready', () => {
    assert.equal(nativeDigitalFallbackAvailable('win32', {}, ready), true);
    assert.equal(nativeDigitalFallbackAvailable('darwin', {}, ready), true);
  });

  it('requires a display on Linux and never claims fallback without Java/integrity', () => {
    assert.equal(nativeDigitalFallbackAvailable('linux', {}, ready), false);
    assert.equal(nativeDigitalFallbackAvailable('linux', { DISPLAY: ':0' }, ready), true);
    assert.equal(nativeDigitalFallbackAvailable('win32', {}, { ...ready, java: { supported: false } }), false);
    assert.equal(nativeDigitalFallbackAvailable('win32', {}, { ...ready, integrityVerified: false }), false);
  });
});
