import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { diagnoseDigitalLaunchFailure } from '../src/core/digitalLaunchDiagnosis';

describe('Full Digital launch diagnosis', () => {
  it('explains the Windows named-pipe failure without blaming the circuit', () => {
    const detail = 'Docker Desktop is installed but its engine is not ready. open //./pipe/docker_engine: The system cannot find the file specified.';
    const diagnosis = diagnoseDigitalLaunchFailure(detail);
    assert.equal(diagnosis.kind, 'docker-engine-stopped');
    assert.match(diagnosis.summary, /circuit is safe/i);
    assert.match(diagnosis.explanation, /Windows and macOS/);
    assert.match(diagnosis.steps.join(' '), /Retry embedded Digital/);
    assert.equal(diagnosis.technicalDetail, detail);
  });

  it('distinguishes a missing Docker installation from a stopped engine', () => {
    const diagnosis = diagnoseDigitalLaunchFailure('Embedded Full Digital on Windows/macOS requires Docker Desktop.');
    assert.equal(diagnosis.kind, 'docker-missing');
    assert.match(diagnosis.title, /required/i);
  });

  it('preserves unknown evidence in a generic recovery path', () => {
    const diagnosis = diagnoseDigitalLaunchFailure('x11vnc exited before the display was ready');
    assert.equal(diagnosis.kind, 'generic');
    assert.equal(diagnosis.technicalDetail, 'x11vnc exited before the display was ready');
  });
});
