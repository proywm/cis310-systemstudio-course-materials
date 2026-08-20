import { access, cp, mkdir, readFile, rename } from 'node:fs/promises';
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
 * Owns the extension-native, source-level IA-32 teaching engine.
 *
 * Student assembly is interpreted inside the extension's bounded memory model.
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
      detail: 'Embedded IA-32 teaching engine is bundled; no Docker, assembler, SDK, or administrator access is required.'
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
    return target;
  }

  /** Adds current embedded assets to an older generated lab without overwriting student assembly. */
  async upgradeLab(workspaceRoot: string): Promise<AssemblyLabUpgrade> {
    const source = path.join(this.context.extensionUri.fsPath, 'assembly-starter');
    const target = path.join(workspaceRoot, 'assembly');
    let addedFiles = false;
    const starterFiles: Array<readonly [string, string]> = [
      ['embedded', 'add-two.asm'],
      ['embedded', 'loop-sum.asm'],
      ['irvine32', 'AddTwo.asm'],
      ['irvine32', 'ConsoleInput.asm'],
      ['irvine32', 'FlagsBranch.asm'],
      ['irvine32', 'StackCall.asm'],
      ['nasm-ia32', 'LoopSum.asm']
    ];
    for (const [directory, fileName] of starterFiles) {
      const destinationDirectory = path.join(target, directory);
      await mkdir(destinationDirectory, { recursive: true });
      addedFiles = await copyIfMissing(
        path.join(source, directory, fileName),
        path.join(destinationDirectory, fileName)
      ) || addedFiles;
    }
    addedFiles = await copyIfMissing(
      path.join(source, 'COMPATIBILITY.md'),
      path.join(target, 'COMPATIBILITY.md')
    ) || addedFiles;
    addedFiles = await copyIfMissing(
      path.join(source, 'IRVINE32_PROFILE.md'),
      path.join(target, 'IRVINE32_PROFILE.md')
    ) || addedFiles;

    const guidePath = path.join(target, 'README.md');
    let resolvedGuidePath = guidePath;
    if (await existingPath(guidePath)) {
      const currentGuide = await readFile(guidePath, 'utf8');
      if (currentGuide.includes('# CIS 310 Assembly Paths') && currentGuide.includes('Portable Assembly Lab')) {
        const archivedGuide = path.join(target, 'README-v0.4-container-pilot.md');
        if (await existingPath(archivedGuide)) {
          resolvedGuidePath = path.join(target, 'README-EMBEDDED.md');
          addedFiles = await copyIfMissing(
            path.join(source, 'README.md'),
            resolvedGuidePath
          ) || addedFiles;
        } else {
          await rename(guidePath, archivedGuide);
          await cp(path.join(source, 'README.md'), guidePath, { force: false, errorOnExist: true });
          addedFiles = true;
        }
      } else if (!currentGuide.includes('FlagsBranch.asm')) {
        resolvedGuidePath = path.join(target, 'README-HANDS-ON.md');
        addedFiles = await copyIfMissing(
          path.join(source, 'README.md'),
          resolvedGuidePath
        ) || addedFiles;
      }
    } else {
      addedFiles = await copyIfMissing(path.join(source, 'README.md'), guidePath) || addedFiles;
    }

    return {
      entryPath: path.join(target, 'irvine32', 'AddTwo.asm'),
      guidePath: resolvedGuidePath,
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
        `Embedded assembly loaded: ${path.basename(uri.fsPath)} (${program.profile}, ` +
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
      this.output.appendLine(`Embedded assembly error: ${errorText(error)}`);
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
      diagnostic.source = 'SystemStudio embedded IA-32';
      return diagnostic;
    });
    this.diagnostics.set(uri, diagnostics);
    this.output.appendLine(`Embedded assembly could not load: ${path.basename(uri.fsPath)}\n${error.message}`);
  }

  private reportExecutionError(uri: vscode.Uri, error: unknown): void {
    if (error instanceof AssemblyRuntimeError) {
      const lineIndex = Math.max(0, error.line - 1);
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(lineIndex, 0, lineIndex, 0),
        error.message.replace(/^Line \d+:\s*/, ''),
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'SystemStudio embedded IA-32';
      this.diagnostics.set(uri, [diagnostic]);
    }
    this.output.appendLine(`Embedded assembly execution stopped: ${path.basename(uri.fsPath)}\n${errorText(error)}`);
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
