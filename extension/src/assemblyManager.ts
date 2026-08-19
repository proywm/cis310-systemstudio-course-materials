import { access, cp, mkdir } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { assemblyRunArguments, type ContainerIdentity } from './core/assemblyContainer';
import { assemblySourceRelativePath } from './core/assemblyPath';
import { runProcess, type ProcessResult } from './core/processRunner';

const IMAGE_NAME = 'systemstudio-cis310-assembly:0.3.0';
const CONTAINER_PLATFORM = 'linux/amd64';

export interface AssemblyStatus {
  dockerAvailable: boolean;
  dockerVersion?: string;
  imageReady: boolean;
  detail: string;
}

export class AssemblyManager {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly output: vscode.OutputChannel
  ) {}

  get imageName(): string {
    return IMAGE_NAME;
  }

  get toolchainDirectory(): string {
    return path.join(this.context.extensionUri.fsPath, 'assembly-toolchain');
  }

  get masmGuideUri(): vscode.Uri {
    return vscode.Uri.joinPath(this.context.extensionUri, 'assembly-starter', 'MASM_WINDOWS.md');
  }

  async getStatus(): Promise<AssemblyStatus> {
    try {
      const docker = await runProcess('docker', ['version', '--format', '{{.Server.Version}}'], {
        timeoutMs: 10_000,
        maxOutputBytes: 128 * 1024
      });
      const detail = normalizeProcessOutput(docker);
      if (docker.code !== 0 || docker.timedOut) {
        return { dockerAvailable: false, imageReady: false, detail };
      }
      const image = await runProcess('docker', ['image', 'inspect', IMAGE_NAME], {
        timeoutMs: 10_000,
        maxOutputBytes: 128 * 1024
      });
      return {
        dockerAvailable: true,
        dockerVersion: docker.stdout.trim() || undefined,
        imageReady: image.code === 0 && !image.timedOut,
        detail
      };
    } catch (error) {
      return {
        dockerAvailable: false,
        imageReady: false,
        detail: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async buildImage(token?: vscode.CancellationToken): Promise<void> {
    const result = await runProcess(
      'docker',
      [
        'build',
        '--platform',
        CONTAINER_PLATFORM,
        '--tag',
        IMAGE_NAME,
        '--file',
        path.join(this.toolchainDirectory, 'Dockerfile'),
        this.toolchainDirectory
      ],
      { timeoutMs: 10 * 60_000, maxOutputBytes: 4 * 1024 * 1024, cancellation: token }
    );
    this.output.appendLine(`Portable Assembly Lab image build (${IMAGE_NAME})`);
    this.output.appendLine(normalizeProcessOutput(result));
    if (result.code !== 0 || result.timedOut || result.cancelled) {
      throw new Error(`The portable assembly toolchain image could not be built.\n${normalizeProcessOutput(result)}`);
    }
  }

  async run(sourcePath: string, workspaceRoot: string, token?: vscode.CancellationToken): Promise<ProcessResult> {
    const source = assemblySourceRelativePath(workspaceRoot, sourcePath);
    const resolvedWorkspace = path.resolve(workspaceRoot);
    const buildDirectory = path.join(resolvedWorkspace, 'build');
    await mkdir(buildDirectory, { recursive: true });
    let identity: ContainerIdentity | undefined;
    if (process.platform === 'linux' && typeof process.getuid === 'function' && typeof process.getgid === 'function') {
      identity = { uid: process.getuid(), gid: process.getgid() };
    }
    const args = assemblyRunArguments(IMAGE_NAME, resolvedWorkspace, buildDirectory, source, identity);
    const result = await runProcess(
      'docker',
      args,
      { timeoutMs: 60_000, maxOutputBytes: 2 * 1024 * 1024, cancellation: token }
    );
    this.output.appendLine(`Portable Assembly Lab: ${source}`);
    this.output.appendLine(normalizeProcessOutput(result));
    return result;
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
}

function normalizeProcessOutput(result: ProcessResult): string {
  const sections = [result.stdout.trim(), result.stderr.trim()].filter(Boolean);
  if (result.timedOut) {
    sections.push('Operation timed out.');
  }
  if (result.cancelled) {
    sections.push('Operation cancelled.');
  }
  if (result.truncated) {
    sections.push('Output truncated at the configured safety limit.');
  }
  if (sections.length === 0) {
    sections.push(`Process exited with code ${result.code ?? 'unknown'}.`);
  }
  return sections.join('\n');
}
