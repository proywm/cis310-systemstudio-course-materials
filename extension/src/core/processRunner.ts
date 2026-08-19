import { spawn } from 'node:child_process';

export interface CancellationLike {
  readonly isCancellationRequested: boolean;
  onCancellationRequested(listener: () => void): { dispose(): void };
}

export interface ProcessOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  maxOutputBytes?: number;
  cancellation?: CancellationLike;
}

export interface ProcessResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  cancelled: boolean;
  truncated: boolean;
}

export function runProcess(command: string, args: readonly string[], options: ProcessOptions = {}): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const maxOutputBytes = options.maxOutputBytes ?? 2 * 1024 * 1024;
    let stdout = '';
    let stderr = '';
    let capturedBytes = 0;
    let truncated = false;
    let timedOut = false;
    let cancelled = false;
    let settled = false;

    const child = spawn(command, [...args], {
      cwd: options.cwd,
      env: options.env,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const append = (target: 'stdout' | 'stderr', chunk: Buffer): void => {
      const remaining = maxOutputBytes - capturedBytes;
      if (remaining <= 0) {
        truncated = true;
        return;
      }
      const slice = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
      capturedBytes += slice.length;
      if (slice.length < chunk.length) {
        truncated = true;
      }
      if (target === 'stdout') {
        stdout += slice.toString('utf8');
      } else {
        stderr += slice.toString('utf8');
      }
    };

    child.stdout?.on('data', (chunk: Buffer) => append('stdout', chunk));
    child.stderr?.on('data', (chunk: Buffer) => append('stderr', chunk));

    const timeout = options.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill();
        }, options.timeoutMs)
      : undefined;

    const cancellation = options.cancellation?.onCancellationRequested(() => {
      cancelled = true;
      child.kill();
    });

    if (options.cancellation?.isCancellationRequested) {
      cancelled = true;
      child.kill();
    }

    child.once('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      cancellation?.dispose();
      reject(error);
    });

    child.once('close', (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      cancellation?.dispose();
      resolve({ code, signal, stdout, stderr, timedOut, cancelled, truncated });
    });
  });
}
