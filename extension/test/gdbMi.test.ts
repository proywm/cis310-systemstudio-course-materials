import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decodeMiString,
  miQuote,
  parseDisassembly,
  parseFlags,
  parseMemoryRows,
  parseRegisters,
  stopReason,
  validateBreakpoint,
  validateMemoryExpression
} from '../src/core/gdbMi';

describe('NASM GDB workbench parsing and input boundaries', () => {
  it('parses IA-32 registers and decoded flags from actual GDB text', () => {
    const text = [
      'eax            0xffffffff          -1',
      'ebx            0x2                 2',
      'eip            0x8049004           0x8049004 <loop_start>',
      'eflags         0x246               [ PF ZF IF ]'
    ].join('\n');
    assert.deepEqual(parseRegisters(text).map((item) => [item.name, item.hex]), [
      ['EAX', '0xffffffff'], ['EBX', '0x2'], ['EIP', '0x8049004'], ['EFLAGS', '0x246']
    ]);
    assert.deepEqual(parseFlags(text.split('\n').at(-1)!), ['PF', 'ZF', 'IF']);
  });

  it('parses stack/memory and Intel disassembly without treating text as HTML', () => {
    assert.deepEqual(parseMemoryRows('0xffffd000:\t0x00000001\t0x00000002'), [
      { address: '0xffffd000', values: ['0x00000001', '0x00000002'] }
    ]);
    assert.deepEqual(parseDisassembly('=> 0x08049004 <loop_start>:\tadd eax,ebx'), [
      { current: true, address: '0x08049004', symbol: 'loop_start', instruction: 'add eax,ebx' }
    ]);
  });

  it('allowlists breakpoint and memory expressions before sending them to GDB', () => {
    assert.equal(validateBreakpoint('loop_start'), 'loop_start');
    assert.equal(validateBreakpoint('*0x08049004'), '*0x08049004');
    assert.throws(() => validateBreakpoint('main; shell'), /NASM label/);
    assert.equal(validateMemoryExpression('$ESP'), '$esp');
    assert.equal(validateMemoryExpression('array'), 'array');
    assert.throws(() => validateMemoryExpression('$(command)'), /register/);
  });

  it('quotes MI strings and reports meaningful stop reasons', () => {
    assert.equal(miQuote('a "quoted" path'), '"a \\"quoted\\" path"');
    assert.equal(decodeMiString('"line\\nnext"'), 'line\nnext');
    assert.equal(stopReason('*stopped,reason="breakpoint-hit"'), 'Breakpoint reached in actual machine code');
    assert.equal(stopReason('*stopped,reason="exited",exit-code="07"'), 'Program exited with code 07');
  });
});
