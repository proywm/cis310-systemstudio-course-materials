import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  assembleEmbeddedX86,
  AssemblyCompileError,
  AssemblyRuntimeError,
  EmbeddedX86Machine,
  type AssemblyProfile,
  type MachineSnapshot
} from './core/embeddedAssembly';
import { installCurrentAssemblyGuides } from './core/assemblyGuideUpgrade';
import { courseAgentsMd } from './core/aiCoach';

export interface AssemblyExecutionOptions {
  profile?: AssemblyProfile;
  input?: string;
}

export interface AssemblyStatus {
  embeddedReady: true;
  detail: string;
}

export interface AssemblyLabUpgrade {
  entryPath: string;
  guidePath: string;
  addedFiles: boolean;
}

interface AssemblySession {
  source: string;
  profile: AssemblyProfile;
  input: string;
  machine: EmbeddedX86Machine;
}

/**
 * Owns the extension-native, source-level IA-32 instruction-trace tutor.
 *
 * Source is modeled inside the extension's bounded teaching memory model.
 * No child process, native assembler, container, network request, or host binary
 * is used by this class.
 */
export class AssemblyManager implements vscode.Disposable {
  private readonly sessions = new Map<string, AssemblySession>();
  private readonly diagnostics = vscode.languages.createDiagnosticCollection('systemstudio-cis310-assembly');

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly output: vscode.OutputChannel
  ) {}

  get compatibilityGuideUri(): vscode.Uri {
    return vscode.Uri.joinPath(this.context.extensionUri, 'assembly-starter', 'COMPATIBILITY.md');
  }

  async getStatus(): Promise<AssemblyStatus> {
    return {
      embeddedReady: true,
      detail: 'The IA-32 Instruction Trace Tutor is bundled and needs no toolchain. It is a learning visualization, not an assembler.'
    };
  }

  async assemble(uri: vscode.Uri, options: AssemblyExecutionOptions = {}): Promise<MachineSnapshot> {
    return this.load(uri, true, undefined, options);
  }

  async reset(uri: vscode.Uri, options: AssemblyExecutionOptions = {}): Promise<MachineSnapshot> {
    return this.load(uri, true, undefined, options);
  }

  async snapshot(uri: vscode.Uri, options: AssemblyExecutionOptions = {}): Promise<MachineSnapshot> {
    return this.load(uri, false, undefined, options);
  }

  async step(uri: vscode.Uri, options: AssemblyExecutionOptions = {}): Promise<MachineSnapshot> {
    const session = await this.currentSession(uri, options);
    try {
      const snapshot = session.machine.step();
      this.diagnostics.delete(uri);
      this.logSnapshot('Step', uri, snapshot);
      return snapshot;
    } catch (error) {
      this.reportExecutionError(uri, error);
      throw error;
    }
  }

  async run(uri: vscode.Uri, maxSteps = 10_000, options: AssemblyExecutionOptions = {}): Promise<MachineSnapshot> {
    const session = await this.currentSession(uri, options);
    try {
      const snapshot = session.machine.run(maxSteps);
      this.diagnostics.delete(uri);
      this.logSnapshot('Run', uri, snapshot);
      return snapshot;
    } catch (error) {
      this.reportExecutionError(uri, error);
      throw error;
    }
  }

  async createLab(workspaceRoot: string): Promise<string> {
    const target = path.join(workspaceRoot, 'assembly');
    try {
      await access(target);
      throw new Error(`The assembly lab already exists: ${target}.`);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('The assembly lab already exists:')) {
        throw error;
      }
    }
    await mkdir(workspaceRoot, { recursive: true });
    await cp(path.join(this.context.extensionUri.fsPath, 'assembly-starter'), target, {
      recursive: true,
      force: false,
      errorOnExist: true
    });
    await writeCourseAgentsIfMissing(workspaceRoot);
    return target;
  }

  /** Adds current NASM workbench and trace-practice assets without overwriting student assembly. */
  async upgradeLab(workspaceRoot: string): Promise<AssemblyLabUpgrade> {
    const source = path.join(this.context.extensionUri.fsPath, 'assembly-starter');
    const target = path.join(workspaceRoot, 'assembly');
    let addedFiles = false;
    const starterFiles: Array<readonly [string, string]> = [
      ['nasm-elf32', 'RegisterArithmetic.asm'],
      ['nasm-elf32', 'FlagsBranch.asm'],
      ['nasm-elf32', 'LoopSum.asm'],
      ['nasm-elf32', 'StackCall.asm'],
      ['nasm-elf32', 'LinearSearch.asm'],
      ['nasm-elf32', 'BinarySearchIterative.asm'],
      ['nasm-elf32', 'BinarySearchRecursive.asm'],
      ['nasm-elf32', 'StudentUnitTest.test.asm'],
      ['trace-tutor-examples', 'RegisterArithmetic.asm'],
      ['trace-tutor-examples', 'FlagsBranch.asm'],
      ['trace-tutor-examples', 'LoopSum.asm'],
      ['trace-tutor-examples', 'StackCall.asm']
    ];
    for (const [directory, fileName] of starterFiles) {
      const destinationDirectory = path.join(target, directory);
      await mkdir(destinationDirectory, { recursive: true });
      addedFiles = await copyIfMissing(
        path.join(source, directory, fileName),
        path.join(destinationDirectory, fileName)
      ) || addedFiles;
    }
    const guidePath = path.join(target, 'README.md');
    addedFiles = await installCurrentAssemblyGuides(source, target) || addedFiles;
    await writeCourseAgentsIfMissing(workspaceRoot);

    return {
      entryPath: path.join(target, 'nasm-elf32', 'RegisterArithmetic.asm'),
      guidePath,
      addedFiles
    };
  }

  dispose(): void {
    this.sessions.clear();
    this.diagnostics.dispose();
  }

  private async currentSession(uri: vscode.Uri, options: AssemblyExecutionOptions): Promise<AssemblySession> {
    const document = await vscode.workspace.openTextDocument(uri);
    const source = document.getText();
    const profile = options.profile ?? 'auto';
    const input = options.input ?? '';
    const existing = this.sessions.get(uri.toString());
    if (existing?.source === source && existing.profile === profile && existing.input === input) {
      return existing;
    }
    await this.load(uri, true, document, options);
    return this.sessions.get(uri.toString())!;
  }

  private async load(
    uri: vscode.Uri,
    force: boolean,
    suppliedDocument?: vscode.TextDocument,
    options: AssemblyExecutionOptions = {}
  ): Promise<MachineSnapshot> {
    const document = suppliedDocument ?? await vscode.workspace.openTextDocument(uri);
    const source = document.getText();
    const profile = options.profile ?? 'auto';
    const input = options.input ?? '';
    const existing = this.sessions.get(uri.toString());
    if (!force && existing?.source === source && existing.profile === profile && existing.input === input) {
      return existing.machine.snapshot();
    }

    try {
      const program = assembleEmbeddedX86(source, { profile });
      const machine = new EmbeddedX86Machine(program, { input });
      this.sessions.set(uri.toString(), { source, profile, input, machine });
      this.diagnostics.delete(uri);
      const snapshot = machine.snapshot();
      this.output.appendLine(
        `Instruction trace loaded: ${path.basename(uri.fsPath)} (${program.profile}, ` +
        `${program.instructions.length} source-level instructions)`
      );
      return snapshot;
    } catch (error) {
      this.sessions.delete(uri.toString());
      this.reportCompileError(uri, document, error);
      throw error;
    }
  }

  private reportCompileError(uri: vscode.Uri, document: vscode.TextDocument, error: unknown): void {
    if (!(error instanceof AssemblyCompileError)) {
      this.output.appendLine(`Instruction-trace tutor error: ${errorText(error)}`);
      return;
    }
    const diagnostics = error.diagnostics.map((item) => {
      const lineIndex = Math.max(0, Math.min(document.lineCount - 1, item.line - 1));
      const line = document.lineAt(lineIndex);
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(lineIndex, 0, lineIndex, line.text.length),
        item.message,
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'SystemStudio IA-32 trace tutor';
      return diagnostic;
    });
    this.diagnostics.set(uri, diagnostics);
    this.output.appendLine(`Instruction trace could not load: ${path.basename(uri.fsPath)}\n${error.message}`);
  }

  private reportExecutionError(uri: vscode.Uri, error: unknown): void {
    if (error instanceof AssemblyRuntimeError) {
      const lineIndex = Math.max(0, error.line - 1);
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(lineIndex, 0, lineIndex, 0),
        error.message.replace(/^Line \d+:\s*/, ''),
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'SystemStudio IA-32 trace tutor';
      this.diagnostics.set(uri, [diagnostic]);
    }
    this.output.appendLine(`Instruction trace stopped: ${path.basename(uri.fsPath)}\n${errorText(error)}`);
  }

  private logSnapshot(action: string, uri: vscode.Uri, snapshot: MachineSnapshot): void {
    const reason = snapshot.reason ? ` — ${snapshot.reason}` : '';
    this.output.appendLine(
      `${action}: ${path.basename(uri.fsPath)} | steps=${snapshot.steps} | ` +
      `EAX=0x${snapshot.registers.EAX.toString(16).padStart(8, '0')} | ` +
      `${snapshot.halted ? 'halted' : `next line ${snapshot.currentLine ?? '?'}`}${reason}`
    );
    if (snapshot.output) {
      this.output.appendLine(`Program output:\n${snapshot.output}`);
    }
  }
}

async function writeCourseAgentsIfMissing(workspaceRoot: string): Promise<void> {
  const target = path.join(workspaceRoot, 'AGENTS.md');
  try {
    await access(target);
  } catch {
    await writeFile(target, courseAgentsMd(), { encoding: 'utf8', flag: 'wx' });
  }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function copyIfMissing(source: string, target: string): Promise<boolean> {
  if (await existingPath(target)) {
    return false;
  }
  await cp(source, target, { force: false, errorOnExist: true });
  return true;
}

async function existingPath(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}
