export type AssemblyDialect = 'masm' | 'nasm' | 'common';

export interface AssemblyDiagnostic {
  line: number;
  message: string;
}

export interface EmbeddedInstruction {
  opcode: string;
  operands: string[];
  line: number;
  source: string;
}

export interface DataSymbol {
  name: string;
  address: number;
  elementSize: 1 | 2 | 4;
  byteLength: number;
}

export interface EmbeddedProgram {
  dialect: AssemblyDialect;
  instructions: EmbeddedInstruction[];
  labels: Map<string, number>;
  dataSymbols: Map<string, DataSymbol>;
  constants: Map<string, number>;
  memoryImage: Uint8Array;
  entryPoint: number;
}

export interface MachineFlags {
  CF: boolean;
  PF: boolean;
  ZF: boolean;
  SF: boolean;
  OF: boolean;
}

export interface MachineSnapshot {
  dialect: AssemblyDialect;
  registers: Record<BaseRegister, number>;
  flags: MachineFlags;
  currentLine?: number;
  currentInstruction?: string;
  halted: boolean;
  reason?: string;
  steps: number;
  output: string;
  trace: Array<{ line: number; source: string }>;
  stack: Array<{ address: number; value: number }>;
  data: Array<{ name: string; address: number; size: number; value: number }>;
}

export class AssemblyCompileError extends Error {
  constructor(readonly diagnostics: AssemblyDiagnostic[]) {
    super(diagnostics.map((diagnostic) => `Line ${diagnostic.line}: ${diagnostic.message}`).join('\n'));
    this.name = 'AssemblyCompileError';
  }
}

export class AssemblyRuntimeError extends Error {
  constructor(readonly line: number, message: string) {
    super(`Line ${line}: ${message}`);
    this.name = 'AssemblyRuntimeError';
  }
}

export type BaseRegister = 'EAX' | 'EBX' | 'ECX' | 'EDX' | 'ESI' | 'EDI' | 'EBP' | 'ESP' | 'EIP';

interface RegisterDescriptor {
  base: BaseRegister;
  width: 8 | 16 | 32;
  shift: 0 | 8;
}

interface OperandReference {
  kind: 'register' | 'memory' | 'immediate';
  width: 8 | 16 | 32;
  read(): number;
  write?(value: number): void;
  address?: number;
}

const MEMORY_SIZE = 1024 * 1024;
const DATA_BASE = 0x1000;
const STACK_TOP = 0xf0000;
const CODE_BASE = 0x00401000;
const MAX_STRING_OUTPUT = 4096;
const BASE_REGISTERS: BaseRegister[] = ['EAX', 'EBX', 'ECX', 'EDX', 'ESI', 'EDI', 'EBP', 'ESP', 'EIP'];

const REGISTER_DESCRIPTORS = new Map<string, RegisterDescriptor>([
  ...BASE_REGISTERS.map((base): [string, RegisterDescriptor] => [base.toLowerCase(), { base, width: 32, shift: 0 }]),
  ['ax', { base: 'EAX', width: 16, shift: 0 }],
  ['bx', { base: 'EBX', width: 16, shift: 0 }],
  ['cx', { base: 'ECX', width: 16, shift: 0 }],
  ['dx', { base: 'EDX', width: 16, shift: 0 }],
  ['si', { base: 'ESI', width: 16, shift: 0 }],
  ['di', { base: 'EDI', width: 16, shift: 0 }],
  ['bp', { base: 'EBP', width: 16, shift: 0 }],
  ['sp', { base: 'ESP', width: 16, shift: 0 }],
  ['al', { base: 'EAX', width: 8, shift: 0 }],
  ['ah', { base: 'EAX', width: 8, shift: 8 }],
  ['bl', { base: 'EBX', width: 8, shift: 0 }],
  ['bh', { base: 'EBX', width: 8, shift: 8 }],
  ['cl', { base: 'ECX', width: 8, shift: 0 }],
  ['ch', { base: 'ECX', width: 8, shift: 8 }],
  ['dl', { base: 'EDX', width: 8, shift: 0 }],
  ['dh', { base: 'EDX', width: 8, shift: 8 }]
]);

const CONDITIONAL_JUMPS = new Set([
  'je', 'jz', 'jne', 'jnz', 'jg', 'jnle', 'jge', 'jnl', 'jl', 'jnge', 'jle', 'jng',
  'ja', 'jnbe', 'jae', 'jnb', 'jnc', 'jb', 'jnae', 'jc', 'jbe', 'jna', 'jo', 'jno',
  'js', 'jns', 'jp', 'jpe', 'jnp', 'jpo'
]);

const SUPPORTED_OPCODES = new Set([
  'mov', 'movzx', 'movsx', 'lea', 'xchg', 'push', 'pop', 'pushad', 'popad', 'pushfd', 'popfd',
  'add', 'adc', 'sub', 'sbb', 'inc', 'dec', 'neg', 'cmp', 'mul', 'imul', 'div', 'idiv',
  'and', 'or', 'xor', 'not', 'test', 'shl', 'sal', 'shr', 'sar', 'jmp', 'call', 'ret', 'loop',
  'nop', 'hlt', 'exit', 'invoke', 'clc', 'stc', 'cmc', 'cdq', 'leave', 'int',
  ...CONDITIONAL_JUMPS
]);

export function assembleEmbeddedX86(source: string): EmbeddedProgram {
  const dialect = detectDialect(source);
  const instructions: EmbeddedInstruction[] = [];
  const labels = new Map<string, number>();
  const dataSymbols = new Map<string, DataSymbol>();
  const constants = new Map<string, number>();
  const memoryImage = new Uint8Array(MEMORY_SIZE);
  const diagnostics: AssemblyDiagnostic[] = [];
  let section: 'data' | 'code' | undefined;
  let dataAddress = DATA_BASE;
  let requestedEntry: string | undefined;

  const lines = source.replaceAll('\r\n', '\n').split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const original = lines[index] ?? '';
    let line = stripComment(original).trim();
    if (!line) {
      continue;
    }

    if (/^\.data\b/i.test(line) || /^section\s+\.?(?:data|rodata)\b/i.test(line)) {
      section = 'data';
      continue;
    }
    if (/^\.code\b/i.test(line) || /^section\s+\.?(?:text|code)\b/i.test(line)) {
      section = 'code';
      continue;
    }
    if (/^(?:\.386|\.model\b.*|\.stack\b.*|bits\s+32|global\b.*|extern\b.*|include\b.*|title\b.*|\.const\b.*)$/i.test(line)) {
      continue;
    }
    const endMatch = /^end(?:\s+([A-Za-z_.$?@][\w.$?@]*))?\s*$/i.exec(line);
    if (endMatch) {
      requestedEntry = endMatch[1];
      continue;
    }
    if (/^[A-Za-z_.$?@][\w.$?@]*\s+endp\b/i.test(line)) {
      continue;
    }
    const procMatch = /^([A-Za-z_.$?@][\w.$?@]*)\s+proc\b/i.exec(line);
    if (procMatch) {
      defineLabel(labels, procMatch[1]!, instructions.length, lineNumber, diagnostics);
      section = 'code';
      continue;
    }

    const labelMatch = /^([A-Za-z_.$?@][\w.$?@]*):\s*(.*)$/.exec(line);
    if (labelMatch) {
      const name = labelMatch[1]!;
      if (section === 'data') {
        if (labelMatch[2]!.trim().length === 0) {
          diagnostics.push({ line: lineNumber, message: 'A data label must declare BYTE/WORD/DWORD or DB/DW/DD on the same line.' });
          continue;
        }
        line = `${name} ${labelMatch[2]!.trim()}`;
      } else {
        defineLabel(labels, name, instructions.length, lineNumber, diagnostics);
        line = labelMatch[2]!.trim();
        if (!line) {
          continue;
        }
      }
    }

    const equMatch = /^([A-Za-z_.$?@][\w.$?@]*)\s+equ\s+(.+)$/i.exec(line);
    if (equMatch) {
      try {
        const value = evaluateExpression(equMatch[2]!, {
          constants,
          dataSymbols,
          labels,
          currentAddress: dataAddress,
          sectionBase: DATA_BASE
        });
        constants.set(normalizeName(equMatch[1]!), value >>> 0);
      } catch (error) {
        diagnostics.push({ line: lineNumber, message: errorText(error) });
      }
      continue;
    }

    const dataMatch = /^([A-Za-z_.$?@][\w.$?@]*)\s+(byte|word|dword|db|dw|dd)\s+(.+)$/i.exec(line);
    if (dataMatch) {
      const name = dataMatch[1]!;
      const width = dataWidth(dataMatch[2]!);
      try {
        if (dataSymbols.has(normalizeName(name)) || labels.has(normalizeName(name))) {
          throw new Error(`Duplicate symbol “${name}”.`);
        }
        const bytes = parseDataValues(dataMatch[3]!, width, {
          constants,
          dataSymbols,
          labels,
          currentAddress: dataAddress,
          sectionBase: DATA_BASE
        });
        if (dataAddress + bytes.length >= STACK_TOP) {
          throw new Error('The data segment exceeds the embedded memory limit.');
        }
        memoryImage.set(bytes, dataAddress);
        dataSymbols.set(normalizeName(name), {
          name,
          address: dataAddress,
          elementSize: width,
          byteLength: bytes.length
        });
        dataAddress += bytes.length;
      } catch (error) {
        diagnostics.push({ line: lineNumber, message: errorText(error) });
      }
      continue;
    }

    if (/^(?:align|\.align|\.file|\.type|\.size|\.globl|\.section|\.cfi_|times\b)/i.test(line)) {
      diagnostics.push({ line: lineNumber, message: 'This directive is outside the embedded IA-32 teaching subset.' });
      continue;
    }

    const instructionMatch = /^([A-Za-z][\w]*)\s*(.*)$/.exec(line);
    if (!instructionMatch) {
      diagnostics.push({ line: lineNumber, message: 'Could not parse this assembly statement.' });
      continue;
    }
    const opcode = instructionMatch[1]!.toLowerCase();
    if (!SUPPORTED_OPCODES.has(opcode)) {
      diagnostics.push({ line: lineNumber, message: `Instruction “${opcode}” is not in the embedded IA-32 teaching subset.` });
      continue;
    }
    instructions.push({
      opcode,
      operands: splitOperands(instructionMatch[2]!),
      line: lineNumber,
      source: line
    });
  }

  if (instructions.length === 0 && diagnostics.length === 0) {
    diagnostics.push({ line: 1, message: 'No executable instructions were found.' });
  }
  if (diagnostics.length > 0) {
    throw new AssemblyCompileError(diagnostics);
  }

  const preferredEntry = requestedEntry ?? (labels.has('_start') ? '_start' : labels.has('main') ? 'main' : undefined);
  const entryPoint = preferredEntry ? labels.get(normalizeName(preferredEntry)) : 0;
  if (preferredEntry && entryPoint === undefined) {
    throw new AssemblyCompileError([{ line: 1, message: `Entry label “${preferredEntry}” was not defined.` }]);
  }

  return {
    dialect,
    instructions,
    labels,
    dataSymbols,
    constants,
    memoryImage,
    entryPoint: entryPoint ?? 0
  };
}

export class EmbeddedX86Machine {
  private readonly memory: Uint8Array;
  private readonly registers = Object.fromEntries(BASE_REGISTERS.map((name) => [name, 0])) as Record<BaseRegister, number>;
  private readonly flags: MachineFlags = { CF: false, PF: false, ZF: false, SF: false, OF: false };
  private instructionIndex: number;
  private halted = false;
  private haltReason: string | undefined;
  private stepCount = 0;
  private outputText = '';
  private readonly executionTrace: Array<{ line: number; source: string }> = [];

  constructor(readonly program: EmbeddedProgram) {
    this.memory = program.memoryImage.slice();
    this.instructionIndex = program.entryPoint;
    this.registers.ESP = STACK_TOP;
    this.registers.EBP = STACK_TOP;
    this.updateEip();
  }

  step(): MachineSnapshot {
    if (this.halted) {
      return this.snapshot();
    }
    const instruction = this.program.instructions[this.instructionIndex];
    if (!instruction) {
      this.halt('Reached the end of the program.');
      return this.snapshot();
    }
    let nextIndex = this.instructionIndex + 1;
    try {
      this.executionTrace.push({ line: instruction.line, source: instruction.source });
      if (this.executionTrace.length > 50) {
        this.executionTrace.shift();
      }
      nextIndex = this.execute(instruction, nextIndex);
    } catch (error) {
      if (error instanceof AssemblyRuntimeError) {
        throw error;
      }
      throw new AssemblyRuntimeError(instruction.line, errorText(error));
    }
    this.stepCount += 1;
    if (!this.halted) {
      this.instructionIndex = nextIndex;
      if (this.instructionIndex < 0 || this.instructionIndex >= this.program.instructions.length) {
        this.halt('Reached the end of the program.');
      }
    }
    this.updateEip();
    return this.snapshot();
  }

  run(maxSteps = 10_000): MachineSnapshot {
    const startingSteps = this.stepCount;
    while (!this.halted && this.stepCount - startingSteps < maxSteps) {
      this.step();
    }
    if (!this.halted) {
      const instruction = this.program.instructions[this.instructionIndex];
      throw new AssemblyRuntimeError(
        instruction?.line ?? 1,
        `Execution stopped after ${maxSteps} steps. Check for an infinite loop.`
      );
    }
    return this.snapshot();
  }

  snapshot(): MachineSnapshot {
    const current = this.halted ? undefined : this.program.instructions[this.instructionIndex];
    const stack: Array<{ address: number; value: number }> = [];
    for (let address = this.registers.ESP; address < Math.min(STACK_TOP, this.registers.ESP + 32); address += 4) {
      stack.push({ address, value: this.readMemory(address, 32) });
    }
    const data = [...this.program.dataSymbols.values()].map((symbol) => ({
      name: symbol.name,
      address: symbol.address,
      size: symbol.byteLength,
      value: this.readMemory(symbol.address, symbol.elementSize * 8 as 8 | 16 | 32)
    }));
    return {
      dialect: this.program.dialect,
      registers: { ...this.registers },
      flags: { ...this.flags },
      currentLine: current?.line,
      currentInstruction: current?.source,
      halted: this.halted,
      reason: this.haltReason,
      steps: this.stepCount,
      output: this.outputText,
      trace: this.executionTrace.map((entry) => ({ ...entry })),
      stack,
      data
    };
  }

  private execute(instruction: EmbeddedInstruction, nextIndex: number): number {
    const { opcode, operands, line } = instruction;
    const destination = (position = 0): OperandReference => this.resolveOperand(operands[position], line, true);
    const source = (position = 1, width?: 8 | 16 | 32): OperandReference => this.resolveOperand(operands[position], line, false, width);
    const requireCount = (count: number | number[]): void => {
      const allowed = Array.isArray(count) ? count : [count];
      if (!allowed.includes(operands.length)) {
        throw new AssemblyRuntimeError(line, `${opcode.toUpperCase()} expects ${allowed.join(' or ')} operand(s).`);
      }
    };

    switch (opcode) {
      case 'mov': {
        requireCount(2);
        const dest = destination();
        this.writeOperand(dest, source(1, dest.width).read(), line);
        break;
      }
      case 'movzx':
      case 'movsx': {
        requireCount(2);
        const dest = destination();
        const src = source(1);
        const value = opcode === 'movsx' ? signedValue(src.read(), src.width) : src.read();
        this.writeOperand(dest, value, line);
        break;
      }
      case 'lea': {
        requireCount(2);
        const dest = destination();
        const address = this.resolveAddressOperand(operands[1], line);
        this.writeOperand(dest, address, line);
        break;
      }
      case 'xchg': {
        requireCount(2);
        const left = destination();
        const right = this.resolveOperand(operands[1], line, true, left.width);
        const leftValue = left.read();
        this.writeOperand(left, right.read(), line);
        this.writeOperand(right, leftValue, line);
        break;
      }
      case 'push': {
        requireCount(1);
        this.push(this.resolveOperand(operands[0], line, false, 32).read());
        break;
      }
      case 'pop': {
        requireCount(1);
        this.writeOperand(destination(), this.pop(), line);
        break;
      }
      case 'pushad': {
        requireCount(0);
        const originalEsp = this.registers.ESP;
        for (const name of ['EAX', 'ECX', 'EDX', 'EBX'] as BaseRegister[]) this.push(this.registers[name]);
        this.push(originalEsp);
        for (const name of ['EBP', 'ESI', 'EDI'] as BaseRegister[]) this.push(this.registers[name]);
        break;
      }
      case 'popad': {
        requireCount(0);
        for (const name of ['EDI', 'ESI', 'EBP'] as BaseRegister[]) this.registers[name] = this.pop();
        this.pop();
        for (const name of ['EBX', 'EDX', 'ECX', 'EAX'] as BaseRegister[]) this.registers[name] = this.pop();
        break;
      }
      case 'pushfd':
        requireCount(0);
        this.push(this.flagsToNumber());
        break;
      case 'popfd':
        requireCount(0);
        this.numberToFlags(this.pop());
        break;
      case 'add':
      case 'adc':
      case 'sub':
      case 'sbb':
      case 'cmp': {
        requireCount(2);
        const dest = destination();
        const left = dest.read();
        const right = source(1, dest.width).read();
        const carry = opcode === 'adc' || opcode === 'sbb' ? Number(this.flags.CF) : 0;
        const subtract = opcode === 'sub' || opcode === 'sbb' || opcode === 'cmp';
        const result = subtract
          ? this.subtract(left, right, carry, dest.width)
          : this.add(left, right, carry, dest.width);
        if (opcode !== 'cmp') {
          this.writeOperand(dest, result, line);
        }
        break;
      }
      case 'inc':
      case 'dec': {
        requireCount(1);
        const dest = destination();
        const oldCarry = this.flags.CF;
        const value = opcode === 'inc'
          ? this.add(dest.read(), 1, 0, dest.width)
          : this.subtract(dest.read(), 1, 0, dest.width);
        this.flags.CF = oldCarry;
        this.writeOperand(dest, value, line);
        break;
      }
      case 'neg': {
        requireCount(1);
        const dest = destination();
        const original = dest.read();
        const value = this.subtract(0, original, 0, dest.width);
        this.flags.CF = original !== 0;
        this.writeOperand(dest, value, line);
        break;
      }
      case 'and':
      case 'or':
      case 'xor':
      case 'test': {
        requireCount(2);
        const dest = destination();
        const right = source(1, dest.width).read();
        const result = opcode === 'and' || opcode === 'test'
          ? dest.read() & right
          : opcode === 'or' ? dest.read() | right : dest.read() ^ right;
        this.setLogicFlags(result, dest.width);
        if (opcode !== 'test') {
          this.writeOperand(dest, result, line);
        }
        break;
      }
      case 'not': {
        requireCount(1);
        const dest = destination();
        this.writeOperand(dest, ~dest.read(), line);
        break;
      }
      case 'shl':
      case 'sal':
      case 'shr':
      case 'sar': {
        requireCount(2);
        const dest = destination();
        const count = source(1, 8).read() & 0x1f;
        let value = dest.read();
        if (count > 0) {
          for (let iteration = 0; iteration < count; iteration += 1) {
            if (opcode === 'shl' || opcode === 'sal') {
              this.flags.CF = ((value >>> (dest.width - 1)) & 1) === 1;
              value = unsignedValue(value << 1, dest.width);
            } else {
              this.flags.CF = (value & 1) === 1;
              value = opcode === 'sar'
                ? unsignedValue(signedValue(value, dest.width) >> 1, dest.width)
                : value >>> 1;
            }
          }
          this.setZeroSignParity(value, dest.width);
          if (count === 1) {
            this.flags.OF = opcode === 'shl' || opcode === 'sal'
              ? (((value >>> (dest.width - 1)) & 1) === 1) !== this.flags.CF
              : opcode === 'shr' ? ((dest.read() >>> (dest.width - 1)) & 1) === 1 : false;
          }
        }
        this.writeOperand(dest, value, line);
        break;
      }
      case 'imul': {
        requireCount([1, 2]);
        if (operands.length === 2) {
          const dest = destination();
          const product = BigInt(signedValue(dest.read(), dest.width)) * BigInt(signedValue(source(1, dest.width).read(), dest.width));
          const masked = Number(BigInt.asUintN(dest.width, product));
          const exact = BigInt.asIntN(dest.width, product) === product;
          this.flags.CF = this.flags.OF = !exact;
          this.writeOperand(dest, masked, line);
        } else {
          this.multiplyAccumulator(this.resolveOperand(operands[0], line, false, 32).read(), true);
        }
        break;
      }
      case 'mul':
        requireCount(1);
        this.multiplyAccumulator(this.resolveOperand(operands[0], line, false, 32).read(), false);
        break;
      case 'div':
      case 'idiv':
        requireCount(1);
        this.divideAccumulator(this.resolveOperand(operands[0], line, false, 32).read(), opcode === 'idiv', line);
        break;
      case 'cdq':
        requireCount(0);
        this.registers.EDX = (this.registers.EAX & 0x80000000) !== 0 ? 0xffffffff : 0;
        break;
      case 'jmp':
        requireCount(1);
        nextIndex = this.labelIndex(operands[0], line);
        break;
      case 'loop':
        requireCount(1);
        this.registers.ECX = (this.registers.ECX - 1) >>> 0;
        if (this.registers.ECX !== 0) nextIndex = this.labelIndex(operands[0], line);
        break;
      case 'call': {
        requireCount(1);
        const runtime = normalizeName(operands[0]!);
        if (this.executeRuntimeCall(runtime, line)) {
          break;
        }
        this.push(nextIndex);
        nextIndex = this.labelIndex(operands[0], line);
        break;
      }
      case 'ret':
        requireCount([0, 1]);
        nextIndex = this.pop();
        if (operands[0]) this.registers.ESP = (this.registers.ESP + this.immediate(operands[0], line)) >>> 0;
        break;
      case 'leave':
        requireCount(0);
        this.registers.ESP = this.registers.EBP;
        this.registers.EBP = this.pop();
        break;
      case 'invoke': {
        if (operands.length < 1) throw new AssemblyRuntimeError(line, 'INVOKE expects a target.');
        const target = normalizeName(operands[0]!);
        if (target === 'exitprocess') {
          const exitCode = operands[1] ? this.immediate(operands[1], line) : 0;
          this.registers.EAX = exitCode >>> 0;
          this.halt(`ExitProcess(${exitCode >>> 0}).`);
        } else if (!this.executeRuntimeCall(target, line)) {
          throw new AssemblyRuntimeError(line, `Embedded runtime procedure “${operands[0]}” is not supported.`);
        }
        break;
      }
      case 'int': {
        requireCount(1);
        const vector = this.immediate(operands[0]!, line);
        if (vector === 0x20 || (vector === 0x80 && this.registers.EAX === 1)) {
          this.halt(`INT ${formatHex(vector, 8)} terminated the program.`);
        } else {
          throw new AssemblyRuntimeError(line, `INT ${formatHex(vector, 8)} is outside the embedded runtime subset.`);
        }
        break;
      }
      case 'exit':
      case 'hlt':
        requireCount(0);
        this.halt(opcode === 'exit' ? 'EXIT completed.' : 'HLT reached.');
        break;
      case 'nop':
        requireCount(0);
        break;
      case 'clc':
        requireCount(0);
        this.flags.CF = false;
        break;
      case 'stc':
        requireCount(0);
        this.flags.CF = true;
        break;
      case 'cmc':
        requireCount(0);
        this.flags.CF = !this.flags.CF;
        break;
      default:
        if (CONDITIONAL_JUMPS.has(opcode)) {
          requireCount(1);
          if (this.jumpCondition(opcode)) nextIndex = this.labelIndex(operands[0], line);
          break;
        }
        throw new AssemblyRuntimeError(line, `Instruction “${opcode}” is not implemented.`);
    }
    return nextIndex;
  }

  private resolveOperand(text: string | undefined, line: number, writable: boolean, widthHint?: 8 | 16 | 32): OperandReference {
    if (!text) {
      throw new AssemblyRuntimeError(line, 'Missing operand.');
    }
    let value = text.trim();
    let explicitWidth: 8 | 16 | 32 | undefined;
    const sizeMatch = /^(byte|word|dword)(?:\s+ptr)?\s+(.+)$/i.exec(value);
    if (sizeMatch) {
      explicitWidth = dataWidth(sizeMatch[1]!) * 8 as 8 | 16 | 32;
      value = sizeMatch[2]!.trim();
    }
    const register = REGISTER_DESCRIPTORS.get(value.toLowerCase());
    if (register) {
      return {
        kind: 'register',
        width: register.width,
        read: () => this.readRegister(register),
        write: (next) => this.writeRegister(register, next)
      };
    }
    const bracket = /^\[(.+)]$/.exec(value);
    if (bracket) {
      const address = this.evaluateRuntimeExpression(bracket[1]!.replace(/^rel\s+/i, ''));
      const width = explicitWidth ?? widthHint ?? 32;
      this.assertMemory(address, width);
      return {
        kind: 'memory',
        width,
        address,
        read: () => this.readMemory(address, width),
        write: (next) => this.writeMemory(address, next, width)
      };
    }
    const masmIndexed = /^([A-Za-z_.$?@][\w.$?@]*)\s*\[(.+)]$/.exec(value);
    if (masmIndexed) {
      const symbol = this.program.dataSymbols.get(normalizeName(masmIndexed[1]!));
      if (!symbol) {
        throw new AssemblyRuntimeError(line, `Unknown data symbol “${masmIndexed[1]}”.`);
      }
      const address = (symbol.address + this.evaluateRuntimeExpression(masmIndexed[2]!)) >>> 0;
      const width = explicitWidth ?? widthHint ?? symbol.elementSize * 8 as 8 | 16 | 32;
      this.assertMemory(address, width);
      return {
        kind: 'memory',
        width,
        address,
        read: () => this.readMemory(address, width),
        write: (next) => this.writeMemory(address, next, width)
      };
    }
    const symbol = this.program.dataSymbols.get(normalizeName(value));
    if (symbol && this.program.dialect === 'masm') {
      const width = explicitWidth ?? symbol.elementSize * 8 as 8 | 16 | 32;
      return {
        kind: 'memory',
        width,
        address: symbol.address,
        read: () => this.readMemory(symbol.address, width),
        write: (next) => this.writeMemory(symbol.address, next, width)
      };
    }
    if (writable) {
      throw new AssemblyRuntimeError(line, `Operand “${text}” is not writable.`);
    }
    const immediate = this.evaluateRuntimeExpression(value.replace(/^offset\s+/i, ''));
    return { kind: 'immediate', width: explicitWidth ?? widthHint ?? 32, read: () => immediate };
  }

  private resolveAddressOperand(text: string | undefined, line: number): number {
    if (!text) throw new AssemblyRuntimeError(line, 'LEA requires a source address.');
    const cleaned = text.trim().replace(/^(?:byte|word|dword)(?:\s+ptr)?\s+/i, '');
    const bracket = /^\[(.+)]$/.exec(cleaned);
    return this.evaluateRuntimeExpression((bracket?.[1] ?? cleaned).replace(/^rel\s+/i, ''));
  }

  private evaluateRuntimeExpression(expression: string): number {
    return evaluateExpression(expression, {
      constants: this.program.constants,
      dataSymbols: this.program.dataSymbols,
      labels: this.program.labels,
      registers: this.registers,
      currentAddress: CODE_BASE + this.instructionIndex * 4,
      sectionBase: CODE_BASE
    });
  }

  private immediate(text: string, line: number): number {
    try {
      return this.evaluateRuntimeExpression(text);
    } catch (error) {
      throw new AssemblyRuntimeError(line, errorText(error));
    }
  }

  private writeOperand(operand: OperandReference, value: number, line: number): void {
    if (!operand.write) throw new AssemblyRuntimeError(line, 'The destination operand is not writable.');
    operand.write(unsignedValue(value, operand.width));
  }

  private readRegister(descriptor: RegisterDescriptor): number {
    return (this.registers[descriptor.base] >>> descriptor.shift) & maskNumber(descriptor.width);
  }

  private writeRegister(descriptor: RegisterDescriptor, value: number): void {
    if (descriptor.width === 32) {
      this.registers[descriptor.base] = value >>> 0;
      return;
    }
    const mask = maskNumber(descriptor.width) << descriptor.shift;
    const current = this.registers[descriptor.base];
    this.registers[descriptor.base] = ((current & ~mask) | ((value & maskNumber(descriptor.width)) << descriptor.shift)) >>> 0;
  }

  private readMemory(address: number, width: 8 | 16 | 32): number {
    this.assertMemory(address, width);
    let result = 0;
    for (let offset = 0; offset < width / 8; offset += 1) {
      result += (this.memory[address + offset] ?? 0) * 2 ** (offset * 8);
    }
    return result >>> 0;
  }

  private writeMemory(address: number, value: number, width: 8 | 16 | 32): void {
    this.assertMemory(address, width);
    let remaining = value >>> 0;
    for (let offset = 0; offset < width / 8; offset += 1) {
      this.memory[address + offset] = remaining & 0xff;
      remaining >>>= 8;
    }
  }

  private assertMemory(address: number, width: 8 | 16 | 32): void {
    if (!Number.isInteger(address) || address < 0 || address + width / 8 > this.memory.length) {
      throw new Error(`Memory address ${formatHex(address, 32)} is outside the embedded 1 MiB memory.`);
    }
  }

  private push(value: number): void {
    const next = this.registers.ESP - 4;
    this.assertMemory(next, 32);
    this.registers.ESP = next >>> 0;
    this.writeMemory(next, value, 32);
  }

  private pop(): number {
    const address = this.registers.ESP;
    if (address >= STACK_TOP) throw new Error('Stack underflow.');
    const value = this.readMemory(address, 32);
    this.registers.ESP = (address + 4) >>> 0;
    return value;
  }

  private add(left: number, right: number, carry: number, width: 8 | 16 | 32): number {
    const leftBig = BigInt(unsignedValue(left, width));
    const rightBig = BigInt(unsignedValue(right, width));
    const full = leftBig + rightBig + BigInt(carry);
    const result = Number(BigInt.asUintN(width, full));
    this.flags.CF = full > (1n << BigInt(width)) - 1n;
    const leftSign = (left >>> (width - 1)) & 1;
    const rightSign = (right >>> (width - 1)) & 1;
    const resultSign = (result >>> (width - 1)) & 1;
    this.flags.OF = leftSign === rightSign && leftSign !== resultSign;
    this.setZeroSignParity(result, width);
    return result;
  }

  private subtract(left: number, right: number, borrow: number, width: 8 | 16 | 32): number {
    const leftUnsigned = BigInt(unsignedValue(left, width));
    const rightUnsigned = BigInt(unsignedValue(right, width)) + BigInt(borrow);
    const result = Number(BigInt.asUintN(width, leftUnsigned - rightUnsigned));
    this.flags.CF = leftUnsigned < rightUnsigned;
    const leftSign = (left >>> (width - 1)) & 1;
    const rightSign = (Number(BigInt.asUintN(width, rightUnsigned)) >>> (width - 1)) & 1;
    const resultSign = (result >>> (width - 1)) & 1;
    this.flags.OF = leftSign !== rightSign && leftSign !== resultSign;
    this.setZeroSignParity(result, width);
    return result;
  }

  private setLogicFlags(value: number, width: 8 | 16 | 32): void {
    this.flags.CF = false;
    this.flags.OF = false;
    this.setZeroSignParity(value, width);
  }

  private setZeroSignParity(value: number, width: 8 | 16 | 32): void {
    const normalized = unsignedValue(value, width);
    this.flags.ZF = normalized === 0;
    this.flags.SF = ((normalized >>> (width - 1)) & 1) === 1;
    this.flags.PF = parityEven(normalized & 0xff);
  }

  private multiplyAccumulator(value: number, signed: boolean): void {
    const left = signed ? BigInt(signedValue(this.registers.EAX, 32)) : BigInt(this.registers.EAX);
    const right = signed ? BigInt(signedValue(value, 32)) : BigInt(value >>> 0);
    const product = left * right;
    this.registers.EAX = Number(BigInt.asUintN(32, product));
    this.registers.EDX = Number(BigInt.asUintN(32, product >> 32n));
    const fits = signed
      ? BigInt.asIntN(32, product) === product
      : product <= 0xffffffffn;
    this.flags.CF = this.flags.OF = !fits;
  }

  private divideAccumulator(divisorValue: number, signed: boolean, line: number): void {
    if (divisorValue === 0) throw new AssemblyRuntimeError(line, 'Division by zero.');
    let dividend: bigint;
    let divisor: bigint;
    if (signed) {
      dividend = BigInt.asIntN(64, (BigInt(this.registers.EDX) << 32n) | BigInt(this.registers.EAX));
      divisor = BigInt(signedValue(divisorValue, 32));
    } else {
      dividend = (BigInt(this.registers.EDX) << 32n) | BigInt(this.registers.EAX);
      divisor = BigInt(divisorValue >>> 0);
    }
    const quotient = dividend / divisor;
    const remainder = dividend % divisor;
    if (signed ? BigInt.asIntN(32, quotient) !== quotient : quotient > 0xffffffffn) {
      throw new AssemblyRuntimeError(line, 'Division quotient does not fit in EAX.');
    }
    this.registers.EAX = Number(BigInt.asUintN(32, quotient));
    this.registers.EDX = Number(BigInt.asUintN(32, remainder));
  }

  private jumpCondition(opcode: string): boolean {
    const { CF, PF, ZF, SF, OF } = this.flags;
    switch (opcode) {
      case 'je': case 'jz': return ZF;
      case 'jne': case 'jnz': return !ZF;
      case 'jg': case 'jnle': return !ZF && SF === OF;
      case 'jge': case 'jnl': return SF === OF;
      case 'jl': case 'jnge': return SF !== OF;
      case 'jle': case 'jng': return ZF || SF !== OF;
      case 'ja': case 'jnbe': return !CF && !ZF;
      case 'jae': case 'jnb': case 'jnc': return !CF;
      case 'jb': case 'jnae': case 'jc': return CF;
      case 'jbe': case 'jna': return CF || ZF;
      case 'jo': return OF;
      case 'jno': return !OF;
      case 'js': return SF;
      case 'jns': return !SF;
      case 'jp': case 'jpe': return PF;
      case 'jnp': case 'jpo': return !PF;
      default: return false;
    }
  }

  private labelIndex(label: string | undefined, line: number): number {
    if (!label) throw new AssemblyRuntimeError(line, 'Missing branch label.');
    const index = this.program.labels.get(normalizeName(label));
    if (index === undefined) throw new AssemblyRuntimeError(line, `Unknown code label “${label}”.`);
    return index;
  }

  private executeRuntimeCall(name: string, line: number): boolean {
    switch (name) {
      case 'dumpregs':
        this.outputText += this.formatRegisterDump();
        return true;
      case 'writeint':
        this.outputText += String(signedValue(this.registers.EAX, 32));
        return true;
      case 'writedec':
        this.outputText += String(this.registers.EAX >>> 0);
        return true;
      case 'writehex':
        this.outputText += formatHex(this.registers.EAX, 32);
        return true;
      case 'writechar':
        this.outputText += String.fromCharCode(this.registers.EAX & 0xff);
        return true;
      case 'writestring':
        this.outputText += this.readZeroTerminatedString(this.registers.EDX, line);
        return true;
      case 'crlf':
        this.outputText += '\n';
        return true;
      case 'exitprocess':
        this.halt(`ExitProcess(${this.registers.EAX >>> 0}).`);
        return true;
      default:
        return false;
    }
  }

  private readZeroTerminatedString(address: number, line: number): string {
    this.assertMemory(address, 8);
    let result = '';
    for (let offset = 0; offset < MAX_STRING_OUTPUT; offset += 1) {
      const value = this.memory[address + offset];
      if (value === undefined) throw new AssemblyRuntimeError(line, 'WriteString reached the end of embedded memory.');
      if (value === 0) return result;
      result += String.fromCharCode(value);
    }
    throw new AssemblyRuntimeError(line, `WriteString exceeded ${MAX_STRING_OUTPUT} bytes without a zero terminator.`);
  }

  private formatRegisterDump(): string {
    const values = BASE_REGISTERS.map((name) => `${name}=${formatHex(this.registers[name], 32)}`);
    const flags = Object.entries(this.flags).map(([name, enabled]) => `${name}=${Number(enabled)}`).join(' ');
    return `${values.slice(0, 4).join(' ')}\n${values.slice(4).join(' ')}\n${flags}\n`;
  }

  private flagsToNumber(): number {
    return (Number(this.flags.CF) << 0) |
      (Number(this.flags.PF) << 2) |
      (Number(this.flags.ZF) << 6) |
      (Number(this.flags.SF) << 7) |
      (Number(this.flags.OF) << 11);
  }

  private numberToFlags(value: number): void {
    this.flags.CF = (value & (1 << 0)) !== 0;
    this.flags.PF = (value & (1 << 2)) !== 0;
    this.flags.ZF = (value & (1 << 6)) !== 0;
    this.flags.SF = (value & (1 << 7)) !== 0;
    this.flags.OF = (value & (1 << 11)) !== 0;
  }

  private halt(reason: string): void {
    this.halted = true;
    this.haltReason = reason;
  }

  private updateEip(): void {
    this.registers.EIP = (CODE_BASE + this.instructionIndex * 4) >>> 0;
  }
}

interface ExpressionContext {
  constants: Map<string, number>;
  dataSymbols: Map<string, DataSymbol>;
  labels: Map<string, number>;
  registers?: Record<BaseRegister, number>;
  currentAddress: number;
  sectionBase: number;
}

function evaluateExpression(expression: string, context: ExpressionContext): number {
  const tokens = tokenizeExpression(expression.trim());
  let position = 0;

  const parseExpression = (): bigint => {
    let value = parseTerm();
    while (tokens[position] === '+' || tokens[position] === '-') {
      const operator = tokens[position++];
      const right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };
  const parseTerm = (): bigint => {
    let value = parseFactor();
    while (tokens[position] === '*') {
      position += 1;
      value *= parseFactor();
    }
    return value;
  };
  const parseFactor = (): bigint => {
    const token = tokens[position++];
    if (token === undefined) throw new Error(`Incomplete expression “${expression}”.`);
    if (token === '+') return parseFactor();
    if (token === '-') return -parseFactor();
    if (token === '(') {
      const value = parseExpression();
      if (tokens[position++] !== ')') throw new Error(`Missing closing parenthesis in “${expression}”.`);
      return value;
    }
    if (token === '$') return BigInt(context.currentAddress);
    if (token === '$$') return BigInt(context.sectionBase);
    const numeric = parseNumericToken(token);
    if (numeric !== undefined) return BigInt(numeric);
    const name = normalizeName(token);
    if (name === 'lengthof' || name === 'sizeof' || name === 'type') {
      const symbolToken = tokens[position++];
      if (!symbolToken || !/^[A-Za-z_.$?@][\w.$?@]*$/.test(symbolToken)) {
        throw new Error(`${token.toUpperCase()} expects a data symbol.`);
      }
      const symbol = context.dataSymbols.get(normalizeName(symbolToken));
      if (!symbol) throw new Error(`Unknown data symbol “${symbolToken}”.`);
      if (name === 'lengthof') return BigInt(symbol.byteLength / symbol.elementSize);
      if (name === 'sizeof') return BigInt(symbol.byteLength);
      return BigInt(symbol.elementSize);
    }
    const register = REGISTER_DESCRIPTORS.get(name);
    if (register && context.registers) {
      const value = (context.registers[register.base] >>> register.shift) & maskNumber(register.width);
      return BigInt(value);
    }
    const constant = context.constants.get(name);
    if (constant !== undefined) return BigInt(constant);
    const data = context.dataSymbols.get(name);
    if (data) return BigInt(data.address);
    const label = context.labels.get(name);
    if (label !== undefined) return BigInt(CODE_BASE + label * 4);
    throw new Error(`Unknown symbol “${token}”.`);
  };

  if (tokens.length === 0) throw new Error('Expected an expression.');
  const result = parseExpression();
  if (position !== tokens.length) throw new Error(`Unexpected token “${tokens[position]}” in expression “${expression}”.`);
  return Number(BigInt.asUintN(32, result));
}

function tokenizeExpression(expression: string): string[] {
  const cleaned = expression.replace(/^offset\s+/i, '').replace(/^rel\s+/i, '');
  const tokens: string[] = [];
  let position = 0;
  while (position < cleaned.length) {
    const rest = cleaned.slice(position);
    const whitespace = /^\s+/.exec(rest);
    if (whitespace) {
      position += whitespace[0].length;
      continue;
    }
    const token = /^(\$\$|\$|0x[0-9a-f]+|0b[01]+|[0-9][0-9a-f]*h|[01]+b|[0-9]+|'(?:\\.|[^'])'|[A-Za-z_.$?@][\w.$?@]*|[()+\-*])/i.exec(rest);
    if (!token) throw new Error(`Invalid expression near “${rest}”.`);
    tokens.push(token[1]!);
    position += token[0].length;
  }
  return tokens;
}

function parseNumericToken(token: string): number | undefined {
  if (/^0x[0-9a-f]+$/i.test(token)) return Number.parseInt(token.slice(2), 16) >>> 0;
  if (/^0b[01]+$/i.test(token)) return Number.parseInt(token.slice(2), 2) >>> 0;
  if (/^[0-9][0-9a-f]*h$/i.test(token)) return Number.parseInt(token.slice(0, -1), 16) >>> 0;
  if (/^[01]+b$/i.test(token)) return Number.parseInt(token.slice(0, -1), 2) >>> 0;
  if (/^[0-9]+$/.test(token)) return Number.parseInt(token, 10) >>> 0;
  if (/^'(?:\\.|[^'])'$/.test(token)) return decodeQuoted(token).charCodeAt(0);
  return undefined;
}

function parseDataValues(text: string, width: 1 | 2 | 4, context: ExpressionContext): Uint8Array {
  const bytes: number[] = [];
  for (const item of splitOperands(text)) {
    const duplicate = /^(\d+)\s+dup\s*\((.*)\)$/i.exec(item);
    if (duplicate) {
      const count = Number.parseInt(duplicate[1]!, 10);
      if (count > 4096) throw new Error('DUP count exceeds 4096 elements.');
      const nested = parseDataValues(duplicate[2]!, width, context);
      for (let repeat = 0; repeat < count; repeat += 1) bytes.push(...nested);
      continue;
    }
    if (/^(['"]).*\1$/s.test(item)) {
      const decoded = decodeQuoted(item);
      if (item.startsWith('"') || decoded.length > 1) {
        for (const character of decoded) appendLittleEndian(bytes, character.charCodeAt(0), width);
      } else {
        appendLittleEndian(bytes, decoded.charCodeAt(0), width);
      }
      continue;
    }
    const value = item === '?' ? 0 : evaluateExpression(item, { ...context, currentAddress: context.currentAddress + bytes.length });
    appendLittleEndian(bytes, value, width);
  }
  return Uint8Array.from(bytes);
}

function appendLittleEndian(target: number[], value: number, width: 1 | 2 | 4): void {
  let remaining = value >>> 0;
  for (let index = 0; index < width; index += 1) {
    target.push(remaining & 0xff);
    remaining >>>= 8;
  }
}

function splitOperands(text: string): string[] {
  if (!text.trim()) return [];
  const result: string[] = [];
  let start = 0;
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let quote: string | undefined;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!;
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[') bracketDepth += 1;
    else if (character === ']') bracketDepth -= 1;
    else if (character === '(') parenthesisDepth += 1;
    else if (character === ')') parenthesisDepth -= 1;
    else if (character === ',' && bracketDepth === 0 && parenthesisDepth === 0) {
      result.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  result.push(text.slice(start).trim());
  return result.filter(Boolean);
}

function stripComment(line: string): string {
  let quote: string | undefined;
  let escaped = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]!;
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ';') {
      return line.slice(0, index);
    }
  }
  return line;
}

function decodeQuoted(text: string): string {
  const quote = text[0];
  if (!quote || text.at(-1) !== quote) throw new Error(`Unterminated string ${text}.`);
  return text.slice(1, -1)
    .replaceAll('\\n', '\n')
    .replaceAll('\\r', '\r')
    .replaceAll('\\t', '\t')
    .replaceAll(`\\${quote}`, quote)
    .replaceAll('\\\\', '\\');
}

function defineLabel(
  labels: Map<string, number>,
  name: string,
  index: number,
  line: number,
  diagnostics: AssemblyDiagnostic[]
): void {
  const normalized = normalizeName(name);
  if (labels.has(normalized)) diagnostics.push({ line, message: `Duplicate code label “${name}”.` });
  else labels.set(normalized, index);
}

function detectDialect(source: string): AssemblyDialect {
  if (/^\s*(?:\.386|\.model\b|include\b)|\b(?:proc|endp|invoke)\b/im.test(source)) return 'masm';
  if (/^\s*(?:bits\s+32|section\s+\.|global\b)/im.test(source)) return 'nasm';
  return 'common';
}

function dataWidth(name: string): 1 | 2 | 4 {
  switch (name.toLowerCase()) {
    case 'byte': case 'db': return 1;
    case 'word': case 'dw': return 2;
    case 'dword': case 'dd': return 4;
    default: throw new Error(`Unsupported data width “${name}”.`);
  }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function maskNumber(width: 8 | 16 | 32): number {
  return width === 32 ? 0xffffffff : 2 ** width - 1;
}

function unsignedValue(value: number, width: 8 | 16 | 32): number {
  return Number(BigInt.asUintN(width, BigInt(Math.trunc(value))));
}

function signedValue(value: number, width: 8 | 16 | 32): number {
  return Number(BigInt.asIntN(width, BigInt(unsignedValue(value, width))));
}

function parityEven(value: number): boolean {
  let ones = 0;
  for (let bit = 0; bit < 8; bit += 1) ones += (value >>> bit) & 1;
  return ones % 2 === 0;
}

function formatHex(value: number, width: 8 | 16 | 32): string {
  return `0x${unsignedValue(value, width).toString(16).toUpperCase().padStart(width / 4, '0')}`;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
