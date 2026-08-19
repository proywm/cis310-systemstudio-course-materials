import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BLANK_DIGITAL_CIRCUIT } from '../src/core/circuitTemplate';

describe('blank Digital circuit template', () => {
  it('contains the minimal Digital circuit structure without a solution', () => {
    assert.match(BLANK_DIGITAL_CIRCUIT, /<circuit>/);
    assert.match(BLANK_DIGITAL_CIRCUIT, /<version>1<\/version>/);
    assert.match(BLANK_DIGITAL_CIRCUIT, /<visualElements\/>/);
    assert.match(BLANK_DIGITAL_CIRCUIT, /<wires\/>/);
    assert.doesNotMatch(BLANK_DIGITAL_CIRCUIT, /ALU|Register|Testcase/i);
  });
});
