import type { ChildProcessWithoutNullStreams } from 'node:child_process';

export interface GdbRegister {
  name: string;
  hex: string;
  unsigned: number;
}

export interface GdbMemoryRow {
  address: string;
  values: string[];
}

export interface GdbInstruction {
  current: boolean;
  address: string;
  symbol?: string;
  instruction: string;
}

export interface GdbSnapshot {
  stopped: boolean;
  stopReason: string;
  sourceLocation: string;
  registers: GdbRegister[];
  flags: string[];
  stack: GdbMemoryRow[];
  memory: GdbMemoryRow[];
  disassembly: GdbInstruction[];
  programOutput: string;
}

interface PendingCommand {
  resolve: (resultClass: string) => void;
  reject: (error: Error) => void;
  console: string[];
}

interface StopWaiter {
  resolve: (record: string) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

const REGISTERS = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'ebp', 'esp', 'eip', 'eflags'] as const;

/**
 * Small, course-scoped GDB/MI client. It drives an actual GDB process and reads
 * architectural state through GDB console commands. It does not emulate x86.
 */
export class GdbMiSession {
  private token = 1;
  private buffer = '';
  private readonly pending = new Map<number, PendingCommand>();
  private readonly stopQueue: string[] = [];
  private readonly stopWaiters: StopWaiter[] = [];
  private readonly targetOutput: string[] = [];
  private closed = false;
  private lastStopRecord = '';

  constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    private readonly timeoutMs = 15_000,
    private readonly externalOutput?: () => Promise<string>
  ) {
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => this.consume(chunk));
    child.stderr.on('data', (chunk: string) => this.targetOutput.push(chunk));
    child.once('error', (error) => this.failAll(error));
    child.once('exit', (code, signal) => {
      if (!this.closed) this.failAll(new Error(`GDB stopped unexpectedly (exit ${code ?? 'unknown'}, signal ${signal ?? 'none'}).`));
    });
  }

  async initialize(executablePath: string, mode: 'native' | 'qemu-remote'): Promise<void> {
    await this.command('-gdb-set pagination off');
    await this.command('-gdb-set confirm off');
    await this.command('-gdb-set disassembly-flavor intel');
    await this.command(`-file-exec-and-symbols ${miQuote(executablePath)}`);
    if (mode === 'qemu-remote') {
      await this.connectRemoteTarget();
      return;
    }
    await this.command('-break-insert _start');
    const stop = this.waitForStop();
    await this.command('-exec-run');
    await stop;
  }

  private async connectRemoteTarget(): Promise<void> {
    let lastError: Error | undefined;
    // QEMU and GDB start in the same isolated container, but process startup is
    // asynchronous. Retry the loopback connection instead of exposing a race to
    // students on slower Docker Desktop hosts.
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        await this.command('-target-select remote localhost:1234');
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await delay(150);
      }
    }
    throw new Error(`Could not connect GDB to the isolated QEMU debugger: ${lastError?.message ?? 'unknown connection error'}`);
  }

  async stepInstruction(): Promise<GdbSnapshot> {
    const stop = this.waitForStop();
    await this.command('-exec-step-instruction');
    await stop;
    return this.snapshot();
  }

  async continueTo(breakpoint?: string): Promise<GdbSnapshot> {
    if (breakpoint) await this.command(`-break-insert ${miQuote(validateBreakpoint(breakpoint))}`);
    const stop = this.waitForStop();
    await this.command('-exec-continue');
    await stop;
    return this.snapshot();
  }

  async snapshot(memoryExpression = '$esp'): Promise<GdbSnapshot> {
    if (this.closed) throw new Error('The GDB session is closed. Restart the NASM workbench.');
    if (/reason="exited/i.test(this.lastStopRecord)) {
      return {
        stopped: false,
        stopReason: stopReason(this.lastStopRecord),
        sourceLocation: 'Program execution finished',
        registers: [], flags: [], stack: [], memory: [], disassembly: [],
        programOutput: await this.programOutput()
      };
    }
    const registersText = await this.console(`info registers ${REGISTERS.join(' ')}`);
    if (/The program has no registers now|No registers/i.test(registersText)) {
      return {
        stopped: false,
        stopReason: 'Program exited',
        sourceLocation: 'No current instruction',
        registers: [], flags: [], stack: [], memory: [], disassembly: [],
        programOutput: await this.programOutput()
      };
    }
    // GDB/MI stream records are process-global, so keep console inspections
    // sequential and associate each stream with exactly one pending command.
    const stackText = await this.console('x/12wx $esp');
    const memoryText = await this.console(`x/16xb ${validateMemoryExpression(memoryExpression)}`);
    const disassemblyText = await this.console('x/12i $eip');
    const sourceText = await this.console('info line *$eip');
    const registers = parseRegisters(registersText);
    const eflagsLine = registersText.split(/\r?\n/).find((line) => /^eflags\s/i.test(line)) ?? '';
    return {
      stopped: true,
      stopReason: stopReason(this.lastStopRecord),
      sourceLocation: sourceText.trim() || 'Source line unavailable; use the disassembly address.',
      registers,
      flags: parseFlags(eflagsLine),
      stack: parseMemoryRows(stackText),
      memory: parseMemoryRows(memoryText),
      disassembly: parseDisassembly(disassemblyText),
      programOutput: await this.programOutput()
    };
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    try {
      this.child.stdin.write(`${this.token++}-gdb-exit\n`);
    } catch {
      // Process may already have exited.
    }
    const timer = setTimeout(() => this.child.kill(), 1_000);
    timer.unref();
  }

  private async console(text: string): Promise<string> {
    const token = this.token++;
    const result = new Promise<string>((resolve, reject) => {
      this.pending.set(token, {
        resolve: () => {
          const pending = this.pending.get(token);
          resolve(pending?.console.join('') ?? '');
        },
        reject,
        console: []
      });
    });
    this.write(token, `-interpreter-exec console ${miQuote(text)}`);
    return withTimeout(result, this.timeoutMs, `GDB console command timed out: ${text}`);
  }

  private async command(text: string): Promise<string> {
    const token = this.token++;
    const result = new Promise<string>((resolve, reject) => {
      this.pending.set(token, { resolve, reject, console: [] });
    });
    this.write(token, text);
    return withTimeout(result, this.timeoutMs, `GDB command timed out: ${text}`);
  }

  private write(token: number, command: string): void {
    if (this.closed || this.child.stdin.destroyed) throw new Error('The GDB process is not available.');
    this.child.stdin.write(`${token}${command}\n`);
  }

  private consume(chunk: string): void {
    this.buffer += chunk;
    while (true) {
      const newline = this.buffer.indexOf('\n');
      if (newline < 0) break;
      const line = this.buffer.slice(0, newline).replace(/\r$/, '');
      this.buffer = this.buffer.slice(newline + 1);
      this.line(line);
    }
  }

  private line(line: string): void {
    const stream = /^([~@&])(".*")$/.exec(line);
    if (stream) {
      const [, streamKind, encodedText] = stream;
      if (!streamKind || !encodedText) return;
      const text = decodeMiString(encodedText);
      if (streamKind === '~') {
        const latest = [...this.pending.values()].at(-1);
        latest?.console.push(text);
      } else if (streamKind === '@') {
        this.targetOutput.push(text);
      }
      return;
    }
    if (line.startsWith('*stopped')) {
      this.lastStopRecord = line;
      const waiter = this.stopWaiters.shift();
      if (waiter) {
        clearTimeout(waiter.timer);
        waiter.resolve(line);
      } else {
        this.stopQueue.push(line);
      }
      return;
    }
    const result = /^(\d+)\^(done|running|connected|exit|error)(?:,(.*))?$/.exec(line);
    if (!result) {
      // On Unix hosts GDB/MI can forward inferior stdout as an unprefixed line
      // rather than an @ target-stream record. Preserve only lines that are not
      // MI prompts or async/status records.
      if (line && line !== '(gdb)' && !/^[=+*&^]/.test(line)) this.targetOutput.push(`${line}\n`);
      return;
    }
    const token = Number(result[1]);
    const pending = this.pending.get(token);
    if (!pending) return;
    if (result[2] === 'error') {
      const message = /msg=("(?:[^"\\]|\\.)*")/.exec(result[3] ?? '')?.[1];
      pending.reject(new Error(message ? decodeMiString(message) : `GDB command ${token} failed.`));
      this.pending.delete(token);
      return;
    }
    pending.resolve(result[2] ?? 'done');
    this.pending.delete(token);
  }

  private waitForStop(): Promise<string> {
    const queued = this.stopQueue.shift();
    if (queued) return Promise.resolve(queued);
    return new Promise((resolve, reject) => {
      const waiter: StopWaiter = {
        resolve,
        reject,
        timer: setTimeout(() => {
          const index = this.stopWaiters.indexOf(waiter);
          if (index >= 0) this.stopWaiters.splice(index, 1);
          reject(new Error('GDB did not report a stopped program before the timeout.'));
        }, this.timeoutMs)
      };
      this.stopWaiters.push(waiter);
    });
  }

  private failAll(error: Error): void {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    for (const waiter of this.stopWaiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.stopWaiters.length = 0;
  }

  private async programOutput(): Promise<string> {
    return this.externalOutput ? this.externalOutput() : this.targetOutput.join('');
  }
}

export function stopReason(record: string): string {
  const reason = /reason="([^"]+)"/.exec(record)?.[1];
  switch (reason) {
    case 'breakpoint-hit': return 'Breakpoint reached in actual machine code';
    case 'end-stepping-range': return 'Instruction step completed';
    case 'exited-normally': return 'Program exited normally';
    case 'exited': {
      const code = /exit-code="([^"]+)"/.exec(record)?.[1];
      return code ? `Program exited with code ${code}` : 'Program exited';
    }
    case 'signal-received': {
      const signal = /signal-name="([^"]+)"/.exec(record)?.[1];
      return signal ? `Program stopped on ${signal}` : 'Program stopped on a signal';
    }
    default: return reason ? `Program stopped: ${reason}` : 'Stopped in actual machine code';
  }
}

export function parseRegisters(text: string): GdbRegister[] {
  const result: GdbRegister[] = [];
  for (const line of text.split(/\r?\n/)) {
    const match = /^([a-z][a-z0-9]*)\s+(0x[0-9a-f]+)\b/i.exec(line.trim());
    const name = match?.[1];
    const hex = match?.[2];
    if (!name || !hex || !REGISTERS.includes(name.toLowerCase() as typeof REGISTERS[number])) continue;
    result.push({ name: name.toUpperCase(), hex: hex.toLowerCase(), unsigned: Number.parseInt(hex.slice(2), 16) >>> 0 });
  }
  return result;
}

export function parseFlags(line: string): string[] {
  const bracket = /\[([^\]]*)\]/.exec(line)?.[1];
  return bracket ? bracket.trim().split(/\s+/).filter(Boolean) : [];
}

export function parseMemoryRows(text: string): GdbMemoryRow[] {
  return text.split(/\r?\n/).flatMap((line) => {
    const match = /^\s*(0x[0-9a-f]+)(?:\s+<[^>]+>)?:\s+(.+)$/i.exec(line);
    const address = match?.[1];
    const values = match?.[2];
    if (!address || !values) return [];
    return [{ address: address.toLowerCase(), values: values.trim().split(/\s+/).filter((value) => /^0x[0-9a-f]+$/i.test(value)) }];
  });
}

export function parseDisassembly(text: string): GdbInstruction[] {
  return text.split(/\r?\n/).flatMap((line) => {
    const match = /^\s*(=>)?\s*(0x[0-9a-f]+)(?:\s+<([^>]+)>)?:\s*(.+)$/i.exec(line);
    const address = match?.[2];
    const instruction = match?.[4];
    if (!address || !instruction) return [];
    return [{ current: Boolean(match[1]), address: address.toLowerCase(), symbol: match[3], instruction: instruction.trim() }];
  });
}

export function validateBreakpoint(value: string): string {
  const trimmed = value.trim();
  if (/^[A-Za-z_.$][A-Za-z0-9_.$]*$/.test(trimmed) || /^\*0x[0-9a-f]+$/i.test(trimmed)) return trimmed;
  throw new Error('Use a NASM label such as loop_start or an address such as *0x08049000.');
}

export function validateMemoryExpression(value: string): string {
  const trimmed = value.trim();
  if (/^\$(?:e(?:ax|bx|cx|dx|si|di|bp|sp|ip))$/i.test(trimmed)) return trimmed.toLowerCase();
  if (/^0x[0-9a-f]+$/i.test(trimmed)) return trimmed.toLowerCase();
  if (/^[A-Za-z_.$][A-Za-z0-9_.$]*$/.test(trimmed)) return trimmed;
  throw new Error('Use a register such as $esp, a hexadecimal address, or a NASM symbol.');
}

export function miQuote(value: string): string {
  return JSON.stringify(value).replace(/\u2028|\u2029/g, (character) => character === '\u2028' ? '\\u2028' : '\\u2029');
}

export function decodeMiString(value: string): string {
  try {
    return JSON.parse(value) as string;
  } catch {
    return value.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => { timer = setTimeout(() => reject(new Error(message)), timeoutMs); })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
