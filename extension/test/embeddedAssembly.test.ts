import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import {
  assembleEmbeddedX86,
  AssemblyCompileError,
  AssemblyRuntimeError,
  EmbeddedX86Machine
} from '../src/core/embeddedAssembly';

describe('embedded IA-32 assembly lab', () => {
  it('runs an Irvine-style MASM AddTwo program without external tools', () => {
    const source = `
.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

.data
val1 DWORD 10000h
val2 DWORD 40000h

.code
main PROC
    mov eax, val1
    add eax, val2
    call DumpRegs
    exit
main ENDP
END main
`;
    const machine = new EmbeddedX86Machine(assembleEmbeddedX86(source));
    const snapshot = machine.run();
    assert.equal(snapshot.dialect, 'masm');
    assert.equal(snapshot.registers.EAX, 0x50000);
    assert.match(snapshot.output, /EAX=0x00050000/);
    assert.equal(snapshot.halted, true);
  });

  it('supports NASM memory syntax and register aliases', () => {
    const source = `
bits 32
section .data
values dd 3, 4
section .text
global _start
_start:
    mov eax, [values]
    add eax, [values + 4]
    mov ah, 12h
    push eax
    pop ebx
    hlt
`;
    const snapshot = new EmbeddedX86Machine(assembleEmbeddedX86(source)).run();
    assert.equal(snapshot.dialect, 'nasm');
    assert.equal(snapshot.registers.EAX, 0x1207);
    assert.equal(snapshot.registers.EBX, 0x1207);
  });

  it('steps through loops, calls, returns, and flags', () => {
    const source = `
start:
    mov ecx, 5
    xor eax, eax
again:
    add eax, ecx
    loop again
    call double_value
    cmp eax, 30
    jne failed
    hlt
double_value:
    shl eax, 1
    ret
failed:
    mov eax, 0
    hlt
`;
    const machine = new EmbeddedX86Machine(assembleEmbeddedX86(source));
    assert.equal(machine.step().currentLine, 4);
    const snapshot = machine.run();
    assert.equal(snapshot.registers.EAX, 30);
    assert.equal(snapshot.flags.ZF, true);
    assert.match(snapshot.reason ?? '', /HLT/);
  });

  it('provides embedded Irvine output helpers and data inspection', () => {
    const source = `
.386
.data
message BYTE "Hello, CIS 310!",0
.code
main PROC
    lea edx, message
    call WriteString
    call Crlf
    mov eax, -7
    call WriteInt
    exit
main ENDP
END main
`;
    const snapshot = new EmbeddedX86Machine(assembleEmbeddedX86(source)).run();
    assert.equal(snapshot.output, 'Hello, CIS 310!\n-7');
    assert.equal(snapshot.data[0]?.name, 'message');
  });

  it('reports unsupported syntax with the source line', () => {
    assert.throws(
      () => assembleEmbeddedX86('start:\n    fldpi\n    hlt\n'),
      (error) => error instanceof AssemblyCompileError && error.diagnostics[0]?.line === 2
    );
  });

  it('bounds execution to catch infinite loops', () => {
    const machine = new EmbeddedX86Machine(assembleEmbeddedX86('again:\n    jmp again\n'));
    assert.throws(() => machine.run(25), AssemblyRuntimeError);
  });

  it('supports MASM indexed data and LENGTHOF/SIZEOF/TYPE', () => {
    const source = `
.data
values: DWORD 10, 20, 30
.code
main PROC
    mov esi, TYPE values
    mov ecx, LENGTHOF values
    mov eax, values[esi]
    add eax, SIZEOF values
    exit
main ENDP
END main
`;
    const snapshot = new EmbeddedX86Machine(assembleEmbeddedX86(source)).run();
    assert.equal(snapshot.registers.ESI, 4);
    assert.equal(snapshot.registers.ECX, 3);
    assert.equal(snapshot.registers.EAX, 32);
  });

  it('executes both starter programs shipped in the VSIX', () => {
    const starter = (name: string) => readFileSync(path.join(process.cwd(), 'assembly-starter', 'embedded', name), 'utf8');
    const masm = new EmbeddedX86Machine(assembleEmbeddedX86(starter('add-two.asm'))).run();
    const nasm = new EmbeddedX86Machine(assembleEmbeddedX86(starter('loop-sum.asm'))).run();
    assert.equal(masm.registers.EAX, 0x50000);
    assert.match(masm.output, /CIS 310 sum: 0x00050000/);
    assert.equal(nasm.registers.EAX, 30);
    assert.equal(nasm.output, '30\n');
    assert.ok(nasm.trace.length > 0);
  });
});
