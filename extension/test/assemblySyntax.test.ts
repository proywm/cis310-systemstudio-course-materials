import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectAssemblySyntax } from '../src/core/assemblySyntax';

describe('real assembly syntax selection', () => {
  it('recognizes distinctive MASM and NASM source forms', () => {
    assert.equal(detectAssemblySyntax('.code\nmain PROC\n mov eax, OFFSET value\nmain ENDP\nEND main\n'), 'masm');
    assert.equal(detectAssemblySyntax('bits 32\nsection .text\nglobal _start\n_start:\n int 0x80\n'), 'nasm');
  });

  it('requires an explicit choice for non-distinctive or conflicting source', () => {
    assert.equal(detectAssemblySyntax('mov eax, 1\nadd eax, 2\n'), 'ambiguous');
    assert.equal(detectAssemblySyntax('.code\nbits 32\nmov eax, 1\n'), 'ambiguous');
  });
});
