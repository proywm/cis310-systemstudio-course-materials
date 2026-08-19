import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSupportedJava, parseJavaVersion } from '../src/core/javaVersion';

describe('Java version parsing', () => {
  it('parses a modern OpenJDK version', () => {
    assert.deepEqual(parseJavaVersion('openjdk version "17.0.11" 2024-04-16'), {
      major: 17,
      raw: '17.0.11'
    });
  });

  it('parses legacy Java 8 notation', () => {
    assert.deepEqual(parseJavaVersion('java version "1.8.0_402"'), {
      major: 8,
      raw: '1.8.0_402'
    });
  });

  it('parses unquoted OpenJDK output', () => {
    assert.deepEqual(parseJavaVersion('openjdk 21.0.4 2024-07-16'), {
      major: 21,
      raw: '21.0.4'
    });
  });

  it('rejects missing and unsupported versions', () => {
    assert.equal(parseJavaVersion('command not found'), undefined);
    assert.equal(isSupportedJava(parseJavaVersion('java version "1.7.0_80"')), false);
    assert.equal(isSupportedJava(parseJavaVersion('openjdk version "17.0.11"')), true);
  });
});
