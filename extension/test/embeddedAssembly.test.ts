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

describe('IA-32 instruction-trace tutor', () => {
  it('models an Irvine-style AddTwo example without claiming to assemble it', () => {
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
    assert.equal(snapshot.profile, 'irvine32');
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
    assert.equal(snapshot.profile, 'nasm-ia32');
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

  it('models selected Irvine output helpers and data inspection', () => {
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

  it('runs the Visual Studio AddTwo shape with PROTO and INVOKE', () => {
    const source = `
TITLE Add Two Integers
.386
.model flat,stdcall
.stack 4096
ExitProcess PROTO, dwExitCode:DWORD
.code
main PROC
    mov eax,5
    add eax,6
    call DumpRegs
    invoke ExitProcess,0
main ENDP
END main
`;
    const program = assembleEmbeddedX86(source, { profile: 'irvine32' });
    const snapshot = new EmbeddedX86Machine(program).run();
    assert.equal(program.profile, 'irvine32');
    assert.equal(program.dialect, 'masm');
    assert.match(snapshot.output, /EAX=0x0000000B/);
    assert.match(snapshot.reason ?? '', /ExitProcess\(0\)/);
  });

  it('uses virtual console input for Irvine ReadInt and ReadString', () => {
    const source = `
.386
INCLUDE Irvine32.inc
BUFFER_SIZE = 20
.data?
nameBuffer BYTE BUFFER_SIZE + 1 DUP(?)
.code
main PROC
    call ReadInt
    call WriteInt
    call Crlf
    mov edx, OFFSET nameBuffer
    mov ecx, BUFFER_SIZE
    call ReadString
    mov edx, OFFSET nameBuffer
    call WriteString
    exit
main ENDP
END main
`;
    const snapshot = new EmbeddedX86Machine(
      assembleEmbeddedX86(source, { profile: 'irvine32' }),
      { input: '-42\nAda Lovelace\n' }
    ).run();
    assert.equal(snapshot.output, '-42\nAda Lovelace');
    assert.equal(snapshot.registers.EAX, 12);
    assert.equal(snapshot.inputRemaining, '');
  });

  it('reports invalid ReadInt input through OF for Irvine-style branching', () => {
    const source = `
.code
main PROC
    call ReadInt
    jo invalid
    mov ebx, 0
    exit
invalid:
    mov ebx, 1
    exit
main ENDP
END main
`;
    const snapshot = new EmbeddedX86Machine(
      assembleEmbeddedX86(source, { profile: 'irvine32' }),
      { input: 'not-a-number\n' }
    ).run();
    assert.equal(snapshot.flags.OF, true);
    assert.equal(snapshot.registers.EBX, 1);
    assert.match(snapshot.output, /Invalid signed integer input/);
  });

  it('formats Irvine hexadecimal, binary, memory dump, and macros', () => {
    const source = `
.data
values BYTE 1, 2, 0ABh
message BYTE "done",0
.code
main PROC
    mWrite "hex="
    mov eax, 2Ah
    call WriteHex
    mWrite ", bin="
    mov ebx, 1
    call WriteBinB
    call Crlf
    mov esi, OFFSET values
    mov ecx, LENGTHOF values
    mov ebx, TYPE values
    call DumpMem
    mWriteString message
    mWriteLn
    exit
main ENDP
END main
`;
    const snapshot = new EmbeddedX86Machine(
      assembleEmbeddedX86(source, { profile: 'irvine32' })
    ).run();
    assert.match(snapshot.output, /^hex=0000002A, bin=0010 1010\n/);
    assert.match(snapshot.output, /01 02 AB/);
    assert.match(snapshot.output, /done\n$/);
  });

  it('keeps RandomRange deterministic for repeatable classroom runs', () => {
    const source = `
main:
    mov eax, 10
    call RandomRange
    hlt
`;
    const program = assembleEmbeddedX86(source, { profile: 'irvine32' });
    const first = new EmbeddedX86Machine(program, { randomSeed: 310 }).run();
    const second = new EmbeddedX86Machine(program, { randomSeed: 310 }).run();
    assert.equal(first.registers.EAX, second.registers.EAX);
    assert.ok(first.registers.EAX < 10);
  });

  it('explains when an Irvine input procedure has no virtual console input', () => {
    const machine = new EmbeddedX86Machine(assembleEmbeddedX86('main:\n call ReadInt\n hlt\n', { profile: 'irvine32' }));
    assert.throws(() => machine.run(), /ReadInt needs console input/);
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

  it('executes every assembly example used by the guided labs', () => {
    const source = (directory: string, name: string) => readFileSync(
      path.join(process.cwd(), 'assembly-starter', directory, name),
      'utf8'
    );
    const addTwo = new EmbeddedX86Machine(
      assembleEmbeddedX86(source('irvine32', 'AddTwo.asm'), { profile: 'irvine32' })
    ).run();
    const consoleInput = new EmbeddedX86Machine(
      assembleEmbeddedX86(source('irvine32', 'ConsoleInput.asm'), { profile: 'irvine32' }),
      { input: '-42\nAda Lovelace\n' }
    ).run();
    const flagsBranch = new EmbeddedX86Machine(
      assembleEmbeddedX86(source('irvine32', 'FlagsBranch.asm'), { profile: 'irvine32' })
    ).run();
    const stackCall = new EmbeddedX86Machine(
      assembleEmbeddedX86(source('irvine32', 'StackCall.asm'), { profile: 'irvine32' })
    ).run();
    const nasm = new EmbeddedX86Machine(
      assembleEmbeddedX86(source('nasm-ia32', 'LoopSum.asm'), { profile: 'nasm-ia32' })
    ).run();

    assert.match(addTwo.output, /EAX=0x0000002A/);
    assert.match(consoleInput.output, /You entered -42; name=Ada Lovelace/);
    assert.equal(consoleInput.inputRemaining, '');
    assert.equal(flagsBranch.registers.EBX, 1);
    assert.equal(stackCall.registers.EAX, 42);
    assert.equal(stackCall.registers.EBX, 32);
    assert.equal(nasm.output, '30\n');
  });
});
