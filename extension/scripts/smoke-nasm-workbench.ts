import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, readdir, rm } from 'node:fs/promises';
import * as path from 'node:path';
import { GdbMiSession } from '../src/core/gdbMi';
import { runProcess } from '../src/core/processRunner';

const root = path.resolve(process.cwd());
const starterDirectory = path.join(root, 'assembly-starter', 'nasm-elf32');
const buildDirectory = path.resolve(process.env.SYSTEMSTUDIO_NASM_SMOKE_BUILD ?? '/tmp/systemstudio-cis310-nasm-smoke');
const nasm = process.env.SYSTEMSTUDIO_NASM_SMOKE_PATH ?? 'nasm';
const linker = process.env.SYSTEMSTUDIO_LD_SMOKE_PATH ?? 'ld';
const gdb = process.env.SYSTEMSTUDIO_GDB_SMOKE_PATH ?? 'gdb';

async function main(): Promise<void> {
  await requireExecutable(nasm, 'NASM');
  await requireExecutable(linker, 'GNU ld');
  await requireExecutable(gdb, 'GDB');
  await rm(buildDirectory, { recursive: true, force: true });
  await mkdir(buildDirectory, { recursive: true });

  const sources = (await readdir(starterDirectory)).filter((name) => name.endsWith('.asm')).sort();
  assert.equal(sources.length, 8, 'Release smoke expects seven actual NASM lab programs plus one student unit-test template.');

  for (const name of sources) {
    const stem = name.slice(0, -4);
    const source = path.join(starterDirectory, name);
    const object = path.join(buildDirectory, `${stem}.o`);
    const executable = path.join(buildDirectory, stem);
    await mustRun(nasm, ['-f', 'elf32', '-g', '-F', 'dwarf', '-o', object, source], `${name}: assemble`);
    await mustRun(linker, ['-m', 'elf_i386', '-o', executable, object], `${name}: link`);
    const run = await mustRun(executable, [], `${name}: execute`);
    if (name === 'StudentUnitTest.test.asm') {
      assert.equal(run.stdout, '', `${name}: passes through exit status without invented output`);
    } else {
      assert.match(run.stdout, /PASS|Sum = 15/, `${name}: self-check output`);
    }
  }

  const debugExecutable = path.join(buildDirectory, 'RegisterArithmetic');
  const child = spawn(gdb, ['--quiet', '--interpreter=mi2'], {
    cwd: buildDirectory,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const session = new GdbMiSession(child);
  try {
    await session.initialize(debugExecutable, 'native');
    const entry = await session.snapshot('$esp');
    assert.equal(entry.stopped, true);
    assert.ok(entry.registers.some((register) => register.name === 'EIP'));
    assert.ok(entry.stack.length > 0);
    assert.ok(entry.disassembly.some((instruction) => instruction.current));

    const afterAdd = await session.continueTo('inspect_after_add');
    assert.equal(afterAdd.registers.find((register) => register.name === 'EAX')?.unsigned, 12);
    assert.match(afterAdd.stopReason, /Breakpoint/);
    assert.ok(afterAdd.disassembly.some((instruction) => /cmp\s+eax,0xc/i.test(instruction.instruction)));

    const afterCompare = await session.stepInstruction();
    assert.ok(afterCompare.flags.length > 0);
    assert.ok(afterCompare.sourceLocation.length > 0);

    const finished = await session.continueTo();
    assert.equal(finished.stopped, false);
    assert.match(finished.programOutput, /register arithmetic: PASS/);
  } finally {
    await session.close();
  }

  process.stdout.write(`NASM/GDB workbench smoke passed: seven retained programs plus one unit-test template, register, flag, stack, memory, disassembly, breakpoint, step, and output inspection.\n`);
}

void main();

async function mustRun(command: string, args: string[], label: string) {
  const result = await runProcess(command, args, { timeoutMs: 30_000, maxOutputBytes: 2 * 1024 * 1024 });
  assert.equal(result.timedOut, false, `${label}: timed out`);
  assert.equal(result.code, 0, `${label}: ${result.stderr || result.stdout}`);
  return result;
}

async function requireExecutable(command: string, label: string): Promise<void> {
  if (command.includes('/') || command.includes('\\')) {
    await access(command);
    return;
  }
  const probe = await runProcess(command, ['--version'], { timeoutMs: 5_000, maxOutputBytes: 128 * 1024 });
  assert.equal(probe.code, 0, `${label} is required. Set the corresponding SYSTEMSTUDIO_*_SMOKE_PATH variable.`);
}
