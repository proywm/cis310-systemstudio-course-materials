import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CIRCUIT_PREFLIGHT_CONTRACTS,
  circuitPreflightById,
  circuitPreflightsForCoursework,
  circuitTutorPrompt,
  createAluTestData,
  expectedAluResult,
  externalTestCircuit
} from '../src/core/circuitPreflight';

describe('assignment circuit preflights', () => {
  it('offers component tests along the cumulative 4-bit progression', () => {
    assert.deepEqual(circuitPreflightsForCoursework('project-01').map((item) => item.id), [
      'register-4', 'program-counter-4', 'instruction-register-8', 'instruction-memory-16x8', 'memory-16x4'
    ]);
    assert.deepEqual(circuitPreflightsForCoursework('project-02').map((item) => item.id), [
      'register-file-4x4', 'alu-4'
    ]);
    assert.deepEqual(circuitPreflightsForCoursework('project-03').map((item) => item.id), [
      'register-4', 'program-counter-4', 'instruction-register-8', 'instruction-memory-16x8', 'memory-16x4', 'register-file-4x4', 'alu-4', 'processor-4bit'
    ]);
    assert.deepEqual(circuitPreflightsForCoursework('final-project').map((item) => item.id), [
      'register-4', 'program-counter-4', 'instruction-register-8', 'instruction-memory-16x8', 'memory-16x4', 'register-file-4x4', 'alu-4', 'processor-4bit'
    ]);
  });

  it('encodes only a public Testcase harness, never a solution circuit', () => {
    for (const contract of CIRCUIT_PREFLIGHT_CONTRACTS.filter((item) => item.mode === 'external')) {
      const xml = externalTestCircuit(contract);
      assert.match(xml, /^<\?xml version="1\.0" encoding="utf-8"\?>/);
      assert.match(xml, /<elementName>Testcase<\/elementName>/);
      assert.doesNotMatch(xml, /<elementName>(?:And|Or|Register|RAMSinglePort|RegisterFile|Add|Multiplexer)<\/elementName>/);
      assert.doesNotMatch(xml, /&(?!amp;|lt;|gt;|quot;|apos;)/);
    }
    assert.match(externalTestCircuit(circuitPreflightById('processor-4bit')!), /Complete cumulative|public ISA program|Testcase/i);
  });

  it('generates exactly 2,048 exhaustive 4-bit ALU vectors', () => {
    const lines = createAluTestData().split('\n').filter((line) => /^\d/.test(line));
    assert.equal(lines.length, 8 * 16 * 16);
    assert.equal(new Set(lines).size, lines.length);
    assert.equal(expectedAluResult(0, 15, 1), 0);
    assert.equal(expectedAluResult(1, 15, 0), 0);
    assert.equal(expectedAluResult(2, 5, 3), 1);
    assert.equal(expectedAluResult(3, 5, 3), 2);
    assert.equal(expectedAluResult(4, 9, 7), 9);
    assert.equal(expectedAluResult(5, 15, 7), 0);
    assert.equal(expectedAluResult(6, 0, 7), 15);
    assert.equal(expectedAluResult(7, 9, 7), 9);
    assert.throws(() => expectedAluResult(8, 0, 0));
  });

  it('keeps the two register-file read ports in their published order', () => {
    const data = circuitPreflightById('register-file-4x4')?.testData ?? '';
    assert.match(data, /^C WE WriteSel WriteData ReadSelA ReadSelB ReadA ReadB/m);
    assert.match(data, /^0 0 0 0 2 1 5 12$/m);
  });

  it('makes the interface and formative boundary explicit', () => {
    for (const contract of CIRCUIT_PREFLIGHT_CONTRACTS) {
      assert.ok(contract.interfaceSummary.length > 30);
      assert.ok(contract.detail.length > 20);
    }
    assert.match(circuitPreflightById('processor-4bit')?.interfaceSummary ?? '', /FETCH=0/);
    assert.equal(circuitPreflightById('processor-4bit')?.expectedVectors, 25);
    assert.match(circuitPreflightById('instruction-memory-16x8')?.testData ?? '', /^0 149$/m);
    assert.match(circuitPreflightById('instruction-memory-16x8')?.testData ?? '', /^5 53$/m);
    const processor = circuitPreflightById('processor-4bit')?.testData ?? '';
    assert.match(processor, /^C RST PC State IR ReadA ReadB ALUOut DataOut RFWE DMemWE$/m);
    assert.match(processor, /^C 0 6 0 53 3 5 14 x 0 0$/m);
  });

  it('creates bounded attempt-first circuit coaching prompts without exposing solutions', () => {
    const design = circuitTutorPrompt('alu-4', 'design') ?? '';
    assert.match(design, /public interface/i);
    assert.match(design, /smallest case I have tested/i);
    assert.match(design, /Do not give me a finished wiring plan/i);
    assert.match(design, /make the change myself in Digital/i);
    const failed = circuitTutorPrompt('register-file-4x4', 'failed-preflight') ?? '';
    assert.match(failed, /earliest mismatch or error/i);
    assert.match(failed, /one change I already tried/i);
    assert.equal(circuitTutorPrompt('not-a-contract'), undefined);
  });
});
