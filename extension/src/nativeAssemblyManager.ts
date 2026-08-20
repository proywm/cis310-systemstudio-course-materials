import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { access, chmod, copyFile, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { detectAssemblySyntax } from './core/assemblySyntax';
import { GdbMiSession } from './core/gdbMi';
import { runProcess, type ProcessResult } from './core/processRunner';

const NASM_CONTAINER_IMAGE = 'systemstudio-cis310-nasm:0.20.0';

export type NasmRuntime = 'native-linux' | 'course-container';
export type NasmState = 'ready' | 'setup' | 'missing-debugger' | 'unsupported';

export interface NasmStatus {
  available: boolean;
  state: NasmState;
  runtime?: NasmRuntime;
  detail: string;
  nasm?: string;
  linker?: string;
  gdb?: string;
  docker?: string;
}

export interface NasmBuildResult {
  runtime: NasmRuntime;
  sourcePath: string;
  buildDirectory: string;
  objectPath: string;
  executablePath: string;
  assembler: ProcessResult;
  linker: ProcessResult;
}

export interface NasmRunResult extends NasmBuildResult {
  execution: ProcessResult;
}

export interface NasmDebugHandle {
  build: NasmBuildResult;
  session: GdbMiSession;
}

/** Builds, runs, and debugs actual NASM ELF32 code. No MASM emulation is used. */
export class NativeAssemblyManager {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly output: vscode.OutputChannel
  ) {}

  async status(): Promise<NasmStatus> {
    const native = await this.nativeTools(false);
    if (native?.nasm && native.linker && native.gdb) {
      return {
        available: true,
        state: 'ready',
        runtime: 'native-linux',
        detail: 'Actual NASM, GNU ld, and GDB are ready on this x86 Linux host.',
        ...native
      };
    }
    const docker = await findExecutable(configured('nasmDockerPath', 'docker'));
    if (docker && await dockerDaemonReady(docker)) {
      const imageReady = await this.containerImageReady(docker);
      return {
        available: imageReady,
        state: imageReady ? 'ready' : 'setup',
        runtime: 'course-container',
        docker,
        detail: imageReady
          ? 'The pinned NASM/ELF32 course container is ready. It supplies NASM, GNU ld, GDB, and QEMU-i386.'
          : 'Docker is ready; build the pinned NASM/ELF32 course image once before using the workbench.'
      };
    }
    if (native?.nasm && native.linker && !native.gdb) {
      return { available: false, state: 'missing-debugger', detail: 'NASM and GNU ld are present, but GDB is required for the integrated workbench.', ...native };
    }
    const installable = process.platform === 'linux' && (process.arch === 'x64' || process.arch === 'ia32') && await isDebianFamily();
    return {
      available: false,
      state: installable || Boolean(docker) ? 'setup' : 'unsupported',
      docker,
      detail: installable
        ? 'Prepare NASM privately on this Debian/Ubuntu host, or enable Docker for the portable course environment.'
        : docker
          ? 'The Docker command exists, but the Docker service is unavailable. Start Docker Desktop or restore Docker access.'
          : 'Use Docker Desktop on Windows/macOS, or NASM + GNU ld + GDB on x86 Linux.'
    };
  }

  async prepare(): Promise<NasmStatus> {
    let status = await this.status();
    if (status.available) return status;
    const nativeInstallable = process.platform === 'linux' && (process.arch === 'x64' || process.arch === 'ia32') && await isDebianFamily();
    if (nativeInstallable) {
      const choice = await vscode.window.showInformationMessage(
        'Prepare the actual NASM package in private extension storage? GNU ld and GDB remain host tools. No administrator access or system modification is used.',
        { modal: true },
        'Prepare NASM',
        'Use Course Container'
      );
      if (choice === 'Prepare NASM') {
        await this.resolveNasm(true);
        status = await this.status();
        if (status.available) return status;
      } else if (choice !== 'Use Course Container') {
        return status;
      }
    }
    const docker = await findExecutable(configured('nasmDockerPath', 'docker'));
    if (!docker || !(await dockerDaemonReady(docker))) {
      throw new Error('Docker is not ready. Start Docker Desktop, or install NASM, GNU ld, and GDB on x86 Linux.');
    }
    await this.ensureContainerImage(docker, true);
    return this.status();
  }

  async build(uri: vscode.Uri): Promise<NasmBuildResult> {
    await validateNasmSource(uri);
    let status = await this.status();
    if (!status.available) status = await this.prepare();
    if (!status.available || !status.runtime) throw new Error(status.detail);
    return status.runtime === 'native-linux'
      ? this.buildNative(uri, status)
      : this.buildContainer(uri, status);
  }

  async buildAndRun(uri: vscode.Uri): Promise<NasmRunResult> {
    const build = await this.build(uri);
    const execution = build.runtime === 'native-linux'
      ? await runProcess(build.executablePath, [], { cwd: build.buildDirectory, timeoutMs: 10_000, maxOutputBytes: 2 * 1024 * 1024 })
      : await this.runContainer(build);
    this.logBuild(build, execution);
    return { ...build, execution };
  }

  async startDebug(uri: vscode.Uri): Promise<NasmDebugHandle> {
    const build = await this.build(uri);
    if (build.runtime === 'native-linux') {
      const status = await this.status();
      if (!status.gdb) throw new Error('GDB is not available for the NASM workbench.');
      const child = spawn(status.gdb, ['--quiet', '--interpreter=mi2'], {
        cwd: build.buildDirectory,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const session = new GdbMiSession(child);
      await session.initialize(build.executablePath, 'native');
      return { build, session };
    }
    const docker = await findExecutable(configured('nasmDockerPath', 'docker'));
    if (!docker) throw new Error('Docker is unavailable for the NASM workbench.');
    const child = spawn(docker, [
      'run', '--rm', '-i', '--platform', 'linux/amd64', '--network', 'none',
      '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
      ...containerUserArgs(), '-v', `${build.buildDirectory}:/work:rw`,
      NASM_CONTAINER_IMAGE, '/opt/systemstudio/debug-nasm.sh', '/work/program'
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
    const session = new GdbMiSession(child, 25_000, async () => readOptional(path.join(build.buildDirectory, 'program.stdout')));
    await session.initialize('/work/program', 'qemu-remote');
    return { build, session };
  }

  private async buildNative(uri: vscode.Uri, status: NasmStatus): Promise<NasmBuildResult> {
    if (!status.nasm || !status.linker) throw new Error('The native NASM toolchain is incomplete.');
    const buildDirectoryPath = await createBuildDirectory(this.context, uri.fsPath, 'nasm-native');
    const objectPath = path.join(buildDirectoryPath, 'program.o');
    const executablePath = path.join(buildDirectoryPath, 'program');
    const assembler = await runProcess(status.nasm, ['-f', 'elf32', '-g', '-F', 'dwarf', '-o', objectPath, uri.fsPath], {
      cwd: path.dirname(uri.fsPath), timeoutMs: 30_000, maxOutputBytes: 2 * 1024 * 1024
    });
    assertSuccess('NASM assembly', assembler);
    const linker = await runProcess(status.linker, ['-m', 'elf_i386', '-o', executablePath, objectPath], {
      cwd: buildDirectoryPath, timeoutMs: 30_000, maxOutputBytes: 2 * 1024 * 1024
    });
    assertSuccess('ELF32 link', linker);
    await chmod(executablePath, 0o700);
    return { runtime: 'native-linux', sourcePath: uri.fsPath, buildDirectory: buildDirectoryPath, objectPath, executablePath, assembler, linker };
  }

  private async buildContainer(uri: vscode.Uri, status: NasmStatus): Promise<NasmBuildResult> {
    if (!status.docker) throw new Error('Docker is unavailable for the course container.');
    await this.ensureContainerImage(status.docker, false);
    const buildDirectoryPath = await createBuildDirectory(this.context, uri.fsPath, 'nasm-container');
    const sourcePath = path.join(buildDirectoryPath, 'program.asm');
    const objectPath = path.join(buildDirectoryPath, 'program.o');
    const executablePath = path.join(buildDirectoryPath, 'program');
    await copyFile(uri.fsPath, sourcePath);
    const base = containerRunArgs(buildDirectoryPath);
    const assembler = await runProcess(status.docker, [...base, NASM_CONTAINER_IMAGE, 'nasm', '-f', 'elf32', '-g', '-F', 'dwarf', '-o', '/work/program.o', '/work/program.asm'], {
      timeoutMs: 60_000, maxOutputBytes: 2 * 1024 * 1024
    });
    assertSuccess('Container NASM assembly', assembler);
    const linker = await runProcess(status.docker, [...base, NASM_CONTAINER_IMAGE, 'ld', '-m', 'elf_i386', '-o', '/work/program', '/work/program.o'], {
      timeoutMs: 60_000, maxOutputBytes: 2 * 1024 * 1024
    });
    assertSuccess('Container ELF32 link', linker);
    return { runtime: 'course-container', sourcePath: uri.fsPath, buildDirectory: buildDirectoryPath, objectPath, executablePath, assembler, linker };
  }

  private async runContainer(build: NasmBuildResult): Promise<ProcessResult> {
    const docker = await findExecutable(configured('nasmDockerPath', 'docker'));
    if (!docker) throw new Error('Docker is unavailable for the course container.');
    return runProcess(docker, [...containerRunArgs(build.buildDirectory), NASM_CONTAINER_IMAGE, 'qemu-i386', '/work/program'], {
      timeoutMs: 15_000, maxOutputBytes: 2 * 1024 * 1024
    });
  }

  private async nativeTools(installNasm: boolean): Promise<{ nasm?: string; linker?: string; gdb?: string } | undefined> {
    if (process.platform !== 'linux' || (process.arch !== 'x64' && process.arch !== 'ia32')) return undefined;
    const [nasm, linker, gdb] = await Promise.all([
      this.resolveNasm(installNasm),
      findExecutable(configured('nasmLinkerPath', 'ld')),
      findExecutable(configured('nasmGdbPath', 'gdb'))
    ]);
    return { nasm, linker, gdb };
  }

  private async resolveNasm(install: boolean): Promise<string | undefined> {
    const configuredPath = configured('nasmPath', 'nasm');
    const system = await findExecutable(configuredPath);
    if (system) return system;
    const managedRoot = path.join(this.context.globalStorageUri.fsPath, 'assembly-toolchains', 'nasm-debian-amd64');
    const managed = path.join(managedRoot, 'usr', 'bin', 'nasm');
    if (await executable(managed)) return managed;
    if (!install || !(await isDebianFamily())) return undefined;
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Preparing actual NASM', cancellable: false },
      async () => this.installDebianPackage('nasm', managedRoot)
    );
    return await executable(managed) ? managed : undefined;
  }

  private async installDebianPackage(packageName: string, runtimeRoot: string): Promise<void> {
    const aptGet = await findExecutable('apt-get');
    const dpkgDeb = await findExecutable('dpkg-deb');
    if (!aptGet || !dpkgDeb) throw new Error('apt-get and dpkg-deb are required for the private NASM preparation.');
    const staging = `${runtimeRoot}.staging-${process.pid}-${Date.now()}`;
    const downloads = path.join(staging, 'downloads');
    await rm(staging, { recursive: true, force: true });
    await mkdir(downloads, { recursive: true });
    try {
      const download = await runProcess(aptGet, ['download', packageName], { cwd: downloads, timeoutMs: 180_000, maxOutputBytes: 2 * 1024 * 1024 });
      assertSuccess(`Download ${packageName}`, download);
      const packageFile = (await readdir(downloads)).find((name) => name.endsWith('.deb'));
      if (!packageFile) throw new Error(`No ${packageName} package was downloaded.`);
      const extraction = await runProcess(dpkgDeb, ['-x', path.join(downloads, packageFile), staging], { timeoutMs: 60_000, maxOutputBytes: 1024 * 1024 });
      assertSuccess(`Extract ${packageName}`, extraction);
      await rm(downloads, { recursive: true, force: true });
      await rm(runtimeRoot, { recursive: true, force: true });
      await mkdir(path.dirname(runtimeRoot), { recursive: true });
      const { rename } = await import('node:fs/promises');
      await rename(staging, runtimeRoot);
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  }

  private async containerImageReady(docker: string): Promise<boolean> {
    const result = await runProcess(docker, ['image', 'inspect', NASM_CONTAINER_IMAGE], { timeoutMs: 15_000, maxOutputBytes: 128 * 1024 });
    return result.code === 0 && !result.timedOut;
  }

  private async ensureContainerImage(docker: string, prompt: boolean): Promise<void> {
    if (await this.containerImageReady(docker)) return;
    if (prompt) {
      const choice = await vscode.window.showInformationMessage(
        'Build the pinned CIS 310 NASM course image? It contains NASM, GNU ld, GDB, and QEMU-i386 and is used without network access when student programs run.',
        { modal: true },
        'Build Course Image'
      );
      if (choice !== 'Build Course Image') throw new Error('The NASM course-image setup was cancelled.');
    }
    const contextDirectory = path.join(this.context.extensionUri.fsPath, 'media', 'nasm-container');
    const build = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Building CIS 310 NASM course image', cancellable: false },
      () => runProcess(docker, ['build', '--platform', 'linux/amd64', '--tag', NASM_CONTAINER_IMAGE, contextDirectory], {
        timeoutMs: 10 * 60_000, maxOutputBytes: 4 * 1024 * 1024
      })
    );
    assertSuccess('NASM course-image build', build);
  }

  private logBuild(build: NasmBuildResult, execution: ProcessResult): void {
    this.output.appendLine(`Actual NASM runtime: ${build.runtime}`);
    this.output.appendLine(`Source: ${build.sourcePath}`);
    this.output.appendLine(`ELF32 executable: ${build.executablePath}`);
    appendStage(this.output, 'assembler', build.assembler);
    appendStage(this.output, 'linker', build.linker);
    appendStage(this.output, 'program', execution);
  }
}

async function validateNasmSource(uri: vscode.Uri): Promise<void> {
  if (uri.scheme !== 'file' || path.extname(uri.fsPath).toLowerCase() !== '.asm') throw new Error('Choose a local .asm source file.');
  await access(uri.fsPath, fsConstants.R_OK);
  const syntax = detectAssemblySyntax(await readFile(uri.fsPath, 'utf8'));
  if (syntax === 'masm') throw new Error('This is MASM/Irvine syntax. Fall 2026 uses NASM 32-bit; create a NASM lab or translate the source before building.');
}

async function dockerDaemonReady(docker: string): Promise<boolean> {
  const result = await runProcess(docker, ['info', '--format', '{{.ServerVersion}}'], { timeoutMs: 10_000, maxOutputBytes: 128 * 1024 });
  return result.code === 0 && !result.timedOut && Boolean(result.stdout.trim());
}

function containerRunArgs(buildDirectory: string): string[] {
  return [
    'run', '--rm', '--platform', 'linux/amd64', '--network', 'none',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--read-only',
    '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
    ...containerUserArgs(), '-v', `${buildDirectory}:/work:rw`
  ];
}

function containerUserArgs(): string[] {
  return process.platform === 'linux' && process.getuid && process.getgid
    ? ['--user', `${process.getuid()}:${process.getgid()}`]
    : [];
}

async function createBuildDirectory(context: vscode.ExtensionContext, sourcePath: string, runtime: string): Promise<string> {
  const hash = createHash('sha256').update(`${runtime}\0${path.resolve(sourcePath)}`).digest('hex').slice(0, 16);
  const directory = path.join(context.globalStorageUri.fsPath, 'assembly-builds', hash);
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  return directory;
}

function configured(name: string, fallback: string): string {
  return vscode.workspace.getConfiguration('systemstudioCis310').get<string>(name, fallback).trim() || fallback;
}

async function findExecutable(name: string): Promise<string | undefined> {
  const hasSeparator = name.includes('/') || name.includes('\\');
  if (hasSeparator) return await executable(name) ? name : undefined;
  const extensions = process.platform === 'win32' ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT').split(';') : [''];
  for (const directory of (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, process.platform === 'win32' && !path.extname(name) ? `${name}${extension}` : name);
      if (await executable(candidate)) return candidate;
    }
  }
  return undefined;
}

async function executable(candidate: string): Promise<boolean> {
  try {
    await access(candidate, fsConstants.X_OK);
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
}

async function isDebianFamily(): Promise<boolean> {
  try {
    return /(?:^|\n)ID(?:_LIKE)?=.*(?:debian|ubuntu)/i.test(await readFile('/etc/os-release', 'utf8'));
  } catch {
    return false;
  }
}

function assertSuccess(stage: string, result: ProcessResult): void {
  if (result.code === 0 && !result.timedOut && !result.cancelled) return;
  const detail = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join('\n');
  throw new Error(`${stage} failed${result.timedOut ? ' (timed out)' : ''}.\n${detail || `Exit code ${result.code}`}`);
}

function appendStage(output: vscode.OutputChannel, stage: string, result: ProcessResult): void {
  output.appendLine(`[${stage}] exit=${result.code} timedOut=${result.timedOut}`);
  if (result.stdout.trim()) output.appendLine(result.stdout.trimEnd());
  if (result.stderr.trim()) output.appendLine(result.stderr.trimEnd());
}

async function readOptional(file: string): Promise<string> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}
