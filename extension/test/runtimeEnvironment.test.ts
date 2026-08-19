import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isHeadlessRemote } from '../src/core/runtimeEnvironment';

describe('runtime environment', () => {
  it('does not require a graphical display for local desktop use', () => {
    assert.equal(isHeadlessRemote(undefined, 'linux', {}), false);
  });

  it('detects a headless Linux remote', () => {
    assert.equal(isHeadlessRemote('ssh-remote', 'linux', {}), true);
    assert.equal(isHeadlessRemote('ssh-remote', 'linux', { DISPLAY: ':10' }), false);
    assert.equal(isHeadlessRemote('ssh-remote', 'linux', { WAYLAND_DISPLAY: 'wayland-0' }), false);
  });
});
