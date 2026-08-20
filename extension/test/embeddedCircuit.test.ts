import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  clockEmbeddedCircuit,
  emptyEmbeddedCircuit,
  evaluateEmbeddedCircuit,
  parseDigitalCircuit,
  serializeDigitalCircuit,
  validateEmbeddedCircuit,
  type EmbeddedCircuitModel
} from '../src/core/embeddedCircuit';

const HALF_ADDER: EmbeddedCircuitModel = {
  version: 1,
  components: [
    { id: 'a', kind: 'In', label: 'A', x: 100, y: 100 },
    { id: 'b', kind: 'In', label: 'B', x: 100, y: 220 },
    { id: 'sumGate', kind: 'XOr', label: 'SUM XOR', x: 260, y: 100 },
    { id: 'carryGate', kind: 'And', label: 'CARRY AND', x: 260, y: 220 },
    { id: 'sum', kind: 'Out', label: 'Sum', x: 440, y: 120 },
    { id: 'carry', kind: 'Out', label: 'Carry', x: 440, y: 240 }
  ],
  connections: [
    { id: 'w0', from: { componentId: 'a', port: 'out' }, to: { componentId: 'sumGate', port: 'a' } },
    { id: 'w1', from: { componentId: 'b', port: 'out' }, to: { componentId: 'sumGate', port: 'b' } },
    { id: 'w2', from: { componentId: 'a', port: 'out' }, to: { componentId: 'carryGate', port: 'a' } },
    { id: 'w3', from: { componentId: 'b', port: 'out' }, to: { componentId: 'carryGate', port: 'b' } },
    { id: 'w4', from: { componentId: 'sumGate', port: 'out' }, to: { componentId: 'sum', port: 'in' } },
    { id: 'w5', from: { componentId: 'carryGate', port: 'out' }, to: { componentId: 'carry', port: 'in' } }
  ]
};

describe('embedded Digital-compatible circuit workbench', () => {
  it('simulates all four half-adder rows without revealing a graded full-adder artifact', () => {
    const rows = [
      [false, false, false, false],
      [false, true, true, false],
      [true, false, true, false],
      [true, true, false, true]
    ] as const;
    for (const [a, b, sum, carry] of rows) {
      const result = evaluateEmbeddedCircuit(HALF_ADDER, { a, b });
      assert.equal(result.outputValues.Sum, sum);
      assert.equal(result.outputValues.Carry, carry);
      assert.deepEqual(result.unresolvedComponentIds, []);
    }
  });

  it('round-trips the supported subset through Digital .dig XML', () => {
    const xml = serializeDigitalCircuit(HALF_ADDER);
    assert.match(xml, /<elementName>XOr<\/elementName>/);
    assert.match(xml, /<elementName>And<\/elementName>/);
    assert.equal((xml.match(/<wire>/g) ?? []).length, 6);
    const parsed = parseDigitalCircuit(xml);
    assert.deepEqual(parsed.unsupported, []);
    assert.equal(parsed.model.components.length, HALF_ADDER.components.length);
    assert.equal(parsed.model.connections.length, HALF_ADDER.connections.length);
    const result = evaluateEmbeddedCircuit(parsed.model, { c0: true, c1: true });
    assert.equal(result.outputValues.Sum, false);
    assert.equal(result.outputValues.Carry, true);
  });

  it('loads a blank Digital circuit and rejects malformed models', () => {
    const blank = serializeDigitalCircuit(emptyEmbeddedCircuit());
    assert.deepEqual(parseDigitalCircuit(blank), { model: emptyEmbeddedCircuit(), unsupported: [] });
    assert.equal(validateEmbeddedCircuit({ version: 1, components: [], connections: [{ id: 'bad' }] }), undefined);
  });

  it('preserves D flip-flop state until a rising clock edge', () => {
    const model: EmbeddedCircuitModel = {
      version: 1,
      components: [
        { id: 'd', kind: 'In', label: 'D', x: 100, y: 100 },
        { id: 'clk', kind: 'Clock', label: 'CLK', x: 100, y: 180 },
        { id: 'ff', kind: 'D_FF', label: 'Q', x: 260, y: 100 },
        { id: 'q', kind: 'Out', label: 'Q', x: 420, y: 100 }
      ],
      connections: [
        { id: 'w0', from: { componentId: 'd', port: 'out' }, to: { componentId: 'ff', port: 'd' } },
        { id: 'w1', from: { componentId: 'clk', port: 'out' }, to: { componentId: 'ff', port: 'clk' } },
        { id: 'w2', from: { componentId: 'ff', port: 'q' }, to: { componentId: 'q', port: 'in' } }
      ]
    };
    const initial = evaluateEmbeddedCircuit(model, { d: true, clk: false }, {});
    assert.equal(initial.outputValues.Q, false);
    const state = clockEmbeddedCircuit(model, { d: true, clk: false }, { d: true, clk: true }, {});
    assert.equal(state.ff, true);
    assert.equal(evaluateEmbeddedCircuit(model, { d: false, clk: true }, state).outputValues.Q, true);
  });

  it('marks unsupported Digital components instead of silently rewriting them', () => {
    const parsed = parseDigitalCircuit('<?xml version="1.0"?><circuit><version>1</version><attributes/><visualElements><visualElement><elementName>RAM</elementName><elementAttributes/><pos x="20" y="20"/></visualElement></visualElements><wires/></circuit>');
    assert.deepEqual(parsed.unsupported, ['RAM']);
  });

  it('fails closed on circuit metadata and routed wire geometry that it cannot preserve', () => {
    const metadata = parseDigitalCircuit('<?xml version="1.0"?><circuit><version>1</version><attributes><entry><string>Description</string><string>Keep me</string></entry></attributes><visualElements/><wires/></circuit>');
    assert.deepEqual(metadata.unsupported, ['circuit-level attributes']);
    const routed = parseDigitalCircuit('<?xml version="1.0"?><circuit><version>1</version><attributes/><visualElements><visualElement><elementName>In</elementName><elementAttributes><entry><string>Label</string><string>A</string></entry></elementAttributes><pos x="20" y="20"/></visualElement><visualElement><elementName>Out</elementName><elementAttributes><entry><string>Label</string><string>Y</string></entry></elementAttributes><pos x="100" y="60"/></visualElement></visualElements><wires><wire><p1 x="20" y="20"/><p2 x="60" y="20"/></wire><wire><p1 x="60" y="20"/><p2 x="100" y="60"/></wire></wires></circuit>');
    assert.deepEqual(routed.unsupported, ['routed or branched wire geometry']);
  });

  it('ships syntactically valid embedded-editor JavaScript', () => {
    const source = readFileSync(path.join(process.cwd(), 'src', 'embeddedCircuitEditor.ts'), 'utf8');
    const body = source.match(/export function embeddedCircuitEditorScript\(initial: string\): string \{\s*return `([\s\S]*?)`;\s*\}/)?.[1];
    assert.ok(body, 'embedded editor script should remain extractable for syntax validation');
    const script = body.replace('${initial}', JSON.stringify(emptyEmbeddedCircuit()));
    assert.doesNotThrow(() => new Function(script));
  });
});
