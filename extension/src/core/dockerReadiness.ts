import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import * as path from 'node:path';
import { runProcess, type ProcessResult } from './processRunner';

export const DOCKER_SERVER_VERSION_ARGS = ['version', '--format', '{{.Server.Version}}'] as const;

export type DockerEngineState = 'not-required' | 'cli-missing' | 'engine-unavailable' | 'ready';

export interface DockerEngineStatus {
  readonly state: DockerEngineState;
  readonly executable?: string;
  readonly serverVersion?: string;
  readonly detail: string;
}

type ProcessRunner = (
  command: string,
  args: readonly string[],
  options: { timeoutMs: number; maxOutputBytes: number }
) => Promise<ProcessResult>;

/**
 * Probes the Docker server, not merely the client. Docker Desktop may be
 * installed while its engine is stopped, which is not a runnable environment.
 */
export async function probeDockerEngine(
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
  runner: ProcessRunner = runProcess
): Promise<DockerEngineStatus> {
  if (platform !== 'win32' && platform !== 'darwin') {
    return { state: 'not-required', detail: 'The embedded Docker runtime is not used on this platform.' };
  }

  const executable = await findDockerExecutable(platform, environment);
  if (!executable) {
    return {
      state: 'cli-missing',
      detail: 'Docker Desktop was not found. Install and start Docker Desktop for in-tab Digital.'
    };
  }

  try {
    const result = await runner(executable, DOCKER_SERVER_VERSION_ARGS, {
      timeoutMs: 20_000,
      maxOutputBytes: 256 * 1024
    });
    const version = result.stdout.trim();
    if (result.code === 0 && !result.timedOut && version) {
      return {
        state: 'ready',
        executable,
        serverVersion: version,
        detail: `Docker engine ${version} is ready.`
      };
    }
    const reason = result.timedOut
      ? 'The Docker server check timed out.'
      : (result.stderr || result.stdout).trim() || `Docker exited with code ${String(result.code)}.`;
    return {
      state: 'engine-unavailable',
      executable,
      detail: `Docker Desktop is installed but its engine is not ready. Start Docker Desktop and retry. ${reason}`
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      state: 'engine-unavailable',
      executable,
      detail: `Docker Desktop is installed but its engine could not be reached. Start Docker Desktop and retry. ${reason}`
    };
  }
}

async function findDockerExecutable(platform: NodeJS.Platform, environment: NodeJS.ProcessEnv): Promise<string | undefined> {
  const names = platform === 'win32' ? ['docker.exe', 'docker.cmd', 'docker'] : ['docker'];
  for (const directory of (environment.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    for (const name of names) {
      const candidate = path.join(directory, name);
      try {
        await access(candidate, fsConstants.X_OK);
        return candidate;
      } catch {
        // Continue looking along PATH.
      }
    }
  }
  return undefined;
}
