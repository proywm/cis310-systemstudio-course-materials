import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { access, chmod, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { runProcess, type ProcessResult } from './core/processRunner';
import { downloadFile } from './core/download';
import { equalsSha256, sha256File } from './core/checksum';
import { extractZipSafely } from './core/safeZip';
import { detectAssemblySyntax, type AssemblySyntax } from './core/assemblySyntax';

const IRVINE_COMMIT = '35b0fb4f47cdd73d253a69c587f4e61a02a597b9';
const IRVINE_ARCHIVE_URL = `https://raw.githubusercontent.com/surferkip/asmbook/${IRVINE_COMMIT}/Irvine.zip`;
const IRVINE_ARCHIVE_SHA256 = '91f08e4dacf517cbe14b08f9af5ac3cdd676dbab8e452671baa81443b3c0d881';

export type RealAssemblyToolchain = 'nasm-linux' | 'masm-irvine-windows';
export type RealAssemblyChoice = 'auto' | RealAssemblyToolchain;
export type RealToolchainState = 'ready' | 'setup' | 'missing-linker' | 'unsupported';

export interface RealAssemblyStatus {
  nasm: { available: boolean; state: RealToolchainState; executable?: string; linker?: string; detail: string };
  masm: { available: boolean; state: RealToolchainState; executable?: string; linker?: string; irvineRoot?: string; detail: string };
}

export interface RealAssemblyResult {
  toolchain: RealAssemblyToolchain;
  executablePath: string;
  assembler: ProcessResult;
  linker: ProcessResult;
  execution: ProcessResult;
}

/** Invokes real assemblers, linkers, and executable machine code. */
export class NativeAssemblyManager {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly output: vscode.OutputChannel
  ) {}

  async status(): Promise<RealAssemblyStatus> {
    const nasmHostSupported = process.platform === 'linux' && (process.arch === 'x64' || process.arch === 'ia32');
    const nasm = nasmHostSupported ? await this.resolveNasm(false) : undefined;
    const nasmLinker = nasmHostSupported ? await findExecutable(configured('nasmLinkerPath', 'ld')) : undefined;
    const masm = await this.resolveMasm(false);
    return {
      nasm: nasm && nasmLinker
        ? { available: true, state: 'ready', executable: nasm, linker: nasmLinker, detail: `Actual NASM found at ${nasm}; GNU ld found at ${nasmLinker}.` }
        : { available: false, state: !nasmHostSupported ? 'unsupported' : nasm ? 'missing-linker' : 'setup', executable: nasm, linker: nasmLinker, detail: !nasmHostSupported
          ? `The verified NASM/ELF32 execution path is x86 Linux; this ${process.platform}/${process.arch} host is unsupported.`
          : nasm && !nasmLinker
            ? 'Actual NASM is installed, but GNU ld is missing. Install binutils or configure systemstudioCis310.nasmLinkerPath.'
            : 'Actual NASM is not prepared yet; the extension can install it without administrator access on Debian/Ubuntu.' },
      masm: masm
        ? { available: true, state: 'ready', ...masm, detail: 'Microsoft ml.exe, link.exe, and the Irvine32 library are configured.' }
        : { available: false, state: process.platform === 'win32' ? 'setup' : 'unsupported', detail: process.platform === 'win32'
          ? 'Configure Microsoft ml.exe, link.exe, and the official Irvine directory.'
          : 'Exact Microsoft MASM/Irvine32 execution is Windows-only and is not emulated or relabeled on this host.' }
    };
  }

  async detectSyntax(uri: vscode.Uri): Promise<AssemblySyntax> {
    if (uri.scheme !== 'file' || path.extname(uri.fsPath).toLowerCase() !== '.asm') {
      throw new Error('Choose a local .asm source file.');
    }
    return detectAssemblySyntax(await readFile(uri.fsPath, 'utf8'));
  }

  async buildAndRun(uri: vscode.Uri, requested: RealAssemblyChoice = 'auto'): Promise<RealAssemblyResult> {
    if (uri.scheme !== 'file' || path.extname(uri.fsPath).toLowerCase() !== '.asm') {
      throw new Error('Choose a local .asm source file.');
    }
    await access(uri.fsPath, fsConstants.R_OK);
    const source = await readFile(uri.fsPath, 'utf8');
    const syntax = detectAssemblySyntax(source);
    if (requested === 'auto' && syntax === 'ambiguous') {
      throw new Error('Auto-detect could not distinguish MASM from NASM syntax confidently. Run the command again and choose the real toolchain explicitly.');
    }
    const selected = requested === 'auto'
      ? syntax === 'masm' ? 'masm-irvine-windows' : 'nasm-linux'
      : requested;
    return selected === 'masm-irvine-windows'
      ? this.buildAndRunMasm(uri)
      : this.buildAndRunNasm(uri);
  }

  private async buildAndRunNasm(uri: vscode.Uri): Promise<RealAssemblyResult> {
    if (process.platform !== 'linux' || (process.arch !== 'x64' && process.arch !== 'ia32')) {
      throw new Error(
        `The verified NASM/ELF32 build-and-execute path runs on x86 Linux; this ${process.platform}/${process.arch} host is unsupported. This extension does not ship a Linux VM or container.`
      );
    }
    const nasm = await this.resolveNasm(true);
    if (!nasm) throw new Error('Actual NASM could not be prepared.');
    const linker = await findExecutable(configured('nasmLinkerPath', 'ld'));
    if (!linker) throw new Error('GNU ld was not found. Install binutils or configure systemstudioCis310.nasmLinkerPath.');
    const build = await buildDirectory(this.context, uri.fsPath, 'nasm-linux');
    const objectPath = path.join(build, 'program.o');
    const executablePath = path.join(build, 'program');
    const assembler = await runProcess(nasm, [
      '-f', 'elf32', '-g', '-F', 'dwarf', '-o', objectPath, uri.fsPath
    ], { cwd: path.dirname(uri.fsPath), timeoutMs: 30_000, maxOutputBytes: 2 * 1024 * 1024 });
    assertSuccess('NASM assembly', assembler);
    const linkerResult = await runProcess(linker, [
      '-m', 'elf_i386', '-o', executablePath, objectPath
    ], { cwd: build, timeoutMs: 30_000, maxOutputBytes: 2 * 1024 * 1024 });
    assertSuccess('ELF link', linkerResult);
    await chmod(executablePath, 0o700);
    const execution = await runProcess(executablePath, [], {
      cwd: build,
      timeoutMs: 10_000,
      maxOutputBytes: 2 * 1024 * 1024
    });
    this.logResult(uri.fsPath, 'nasm-linux', executablePath, assembler, linkerResult, execution);
    return { toolchain: 'nasm-linux', executablePath, assembler, linker: linkerResult, execution };
  }

  private async buildAndRunMasm(uri: vscode.Uri): Promise<RealAssemblyResult> {
    const tools = await this.resolveMasm(true);
    if (!tools) {
      throw new Error(
        process.platform === 'win32'
          ? 'Exact MASM/Irvine32 requires configured Microsoft ml.exe, link.exe, and the official Irvine directory. Open the Real Toolchain guide.'
          : 'This is MASM/Irvine32 source. Exact execution requires Windows with Microsoft ml.exe and the official Irvine32 library; SystemStudio will not call the trace simulator an assembler.'
      );
    }
    const build = await buildDirectory(this.context, uri.fsPath, 'masm-irvine-windows');
    const objectPath = path.join(build, 'program.obj');
    const executablePath = path.join(build, 'program.exe');
    const assembler = await runProcess(tools.executable, [
      '/nologo', '/c', '/coff', '/Zi', `/I${tools.irvineRoot}`, `/Fo${objectPath}`, uri.fsPath
    ], { cwd: path.dirname(uri.fsPath), timeoutMs: 60_000, maxOutputBytes: 2 * 1024 * 1024 });
    assertSuccess('Microsoft MASM assembly', assembler);
    const linkerResult = await runProcess(tools.linker, [
      '/NOLOGO', '/SUBSYSTEM:CONSOLE', '/DEBUG', `/OUT:${executablePath}`,
      objectPath,
      path.join(tools.irvineRoot, 'Irvine32.lib'),
      path.join(tools.irvineRoot, 'Kernel32.lib'),
      path.join(tools.irvineRoot, 'User32.lib')
    ], { cwd: build, timeoutMs: 60_000, maxOutputBytes: 2 * 1024 * 1024 });
    assertSuccess('Microsoft link', linkerResult);
    const execution = await runProcess(executablePath, [], {
      cwd: build,
      timeoutMs: 15_000,
      maxOutputBytes: 2 * 1024 * 1024
    });
    this.logResult(uri.fsPath, 'masm-irvine-windows', executablePath, assembler, linkerResult, execution);
    return { toolchain: 'masm-irvine-windows', executablePath, assembler, linker: linkerResult, execution };
  }

  private async resolveNasm(install: boolean): Promise<string | undefined> {
    const configuredPath = configured('nasmPath', 'nasm');
    const system = await findExecutable(configuredPath);
    if (system) return system;
    const managedRoot = path.join(this.context.globalStorageUri.fsPath, 'assembly-toolchains', 'nasm-debian-amd64');
    const managed = path.join(managedRoot, 'usr', 'bin', 'nasm');
    if (await executable(managed)) return managed;
    if (!install || process.platform !== 'linux' || (process.arch !== 'x64' && process.arch !== 'ia32') || !(await isDebianFamily())) return undefined;

    const choice = await vscode.window.showInformationMessage(
      'Install the distribution’s actual NASM package into private extension storage? No administrator access or system modification is required.',
      { modal: true },
      'Install Actual NASM'
    );
    if (choice !== 'Install Actual NASM') return undefined;
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Installing actual NASM', cancellable: false },
      async () => this.installDebianPackage('nasm', managedRoot)
    );
    return await executable(managed) ? managed : undefined;
  }

  private async resolveMasm(installIrvine: boolean): Promise<{ executable: string; linker: string; irvineRoot: string } | undefined> {
    if (process.platform !== 'win32') return undefined;
    const discovered = await discoverVisualStudioMasm();
    const executable = await findExecutable(configured('masmPath', 'ml.exe')) ?? discovered?.executable;
    const linker = await findExecutable(configured('masmLinkerPath', 'link.exe')) ?? discovered?.linker;
    if (!executable || !linker) return undefined;
    let irvineRoot = await validIrvineRoot(configured('irvineRoot', 'C:\\Irvine'));
    if (!irvineRoot) irvineRoot = await validIrvineRoot(this.managedIrvineRoot);
    if (!irvineRoot && installIrvine) irvineRoot = await this.installOfficialIrvine();
    if (!irvineRoot) return undefined;
    return { executable, linker, irvineRoot };
  }

  private get managedIrvineRoot(): string {
    return path.join(this.context.globalStorageUri.fsPath, 'assembly-toolchains', 'irvine32', IRVINE_COMMIT, 'Irvine');
  }

  private async installOfficialIrvine(): Promise<string | undefined> {
    const choice = await vscode.window.showInformationMessage(
      'Download the official Irvine.zip educational resources from Kip Irvine’s GitHub repository into private extension storage? The archive is pinned and SHA-256 verified.',
      { modal: true },
      'Download Official Irvine32'
    );
    if (choice !== 'Download Official Irvine32') return undefined;
    const root = path.dirname(this.managedIrvineRoot);
    const archive = path.join(root, 'Irvine.zip');
    const partial = `${archive}.part`;
    await mkdir(root, { recursive: true });
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Downloading official Irvine32 resources', cancellable: false },
      async () => {
        await downloadFile(IRVINE_ARCHIVE_URL, partial);
        const hash = await sha256File(partial);
        if (!equalsSha256(hash, IRVINE_ARCHIVE_SHA256)) {
          throw new Error(`Irvine.zip checksum mismatch. Expected ${IRVINE_ARCHIVE_SHA256}, received ${hash}.`);
        }
        await rm(archive, { force: true });
        const { rename } = await import('node:fs/promises');
        await rename(partial, archive);
        await extractZipSafely(archive, root);
      }
    );
    return validIrvineRoot(this.managedIrvineRoot);
  }

  private async installDebianPackage(packageName: string, runtimeRoot: string): Promise<void> {
    const aptGet = await findExecutable('apt-get');
    const dpkgDeb = await findExecutable('dpkg-deb');
    if (!aptGet || !dpkgDeb) throw new Error('apt-get and dpkg-deb are required for the private NASM installation.');
    const staging = `${runtimeRoot}.staging-${process.pid}-${Date.now()}`;
    const downloads = path.join(staging, 'downloads');
    await rm(staging, { recursive: true, force: true });
    await mkdir(downloads, { recursive: true });
    try {
      const download = await runProcess(aptGet, ['download', packageName], {
        cwd: downloads, timeoutMs: 180_000, maxOutputBytes: 2 * 1024 * 1024
      });
      assertSuccess(`Download ${packageName}`, download);
      const packageFile = (await readdir(downloads)).find((name) => name.endsWith('.deb'));
      if (!packageFile) throw new Error(`No ${packageName} package was downloaded.`);
      const extraction = await runProcess(dpkgDeb, ['-x', path.join(downloads, packageFile), staging], {
        timeoutMs: 60_000, maxOutputBytes: 1024 * 1024
      });
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

  private logResult(
    source: string,
    toolchain: RealAssemblyToolchain,
    executablePath: string,
    assembler: ProcessResult,
    linker: ProcessResult,
    execution: ProcessResult
  ): void {
    this.output.appendLine(`Real assembly toolchain: ${toolchain}`);
    this.output.appendLine(`Source: ${source}`);
    this.output.appendLine(`Executable: ${executablePath}`);
    appendStage(this.output, 'assembler', assembler);
    appendStage(this.output, 'linker', linker);
    appendStage(this.output, 'program', execution);
  }
}

async function discoverVisualStudioMasm(): Promise<{ executable: string; linker: string } | undefined> {
  if (process.platform !== 'win32') return undefined;
  const installerRoot = process.env['ProgramFiles(x86)'];
  const vswhere = installerRoot
    ? path.join(installerRoot, 'Microsoft Visual Studio', 'Installer', 'vswhere.exe')
    : undefined;
  if (!vswhere || !(await executable(vswhere))) return undefined;
  const result = await runProcess(vswhere, [
    '-latest', '-products', '*', '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-property', 'installationPath'
  ], { timeoutMs: 15_000, maxOutputBytes: 128 * 1024 });
  if (result.code !== 0) return undefined;
  const installation = result.stdout.trim();
  if (!installation) return undefined;
  try {
    const version = (await readFile(
      path.join(installation, 'VC', 'Auxiliary', 'Build', 'Microsoft.VCToolsVersion.default.txt'),
      'utf8'
    )).trim();
    const bin = path.join(installation, 'VC', 'Tools', 'MSVC', version, 'bin', 'Hostx64', 'x86');
    const executablePath = path.join(bin, 'ml.exe');
    const linkerPath = path.join(bin, 'link.exe');
    return await executable(executablePath) && await executable(linkerPath)
      ? { executable: executablePath, linker: linkerPath }
      : undefined;
  } catch {
    return undefined;
  }
}

async function validIrvineRoot(candidate: string): Promise<string | undefined> {
  for (const file of ['Irvine32.inc', 'Irvine32.lib', 'Kernel32.lib', 'User32.lib']) {
    try {
      await access(path.join(candidate, file), fsConstants.R_OK);
    } catch {
      return undefined;
    }
  }
  return candidate;
}

async function buildDirectory(context: vscode.ExtensionContext, sourcePath: string, toolchain: string): Promise<string> {
  const hash = createHash('sha256').update(`${toolchain}\0${path.resolve(sourcePath)}`).digest('hex').slice(0, 16);
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
  const extensions = process.platform === 'win32'
    ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT').split(';')
    : [''];
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
