import { spawn, type ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import type { Server as HttpServer } from 'node:http';
import { createConnection, createServer as createNetServer } from 'node:net';
import { access, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { WebSocket } from 'ws';
import type { DigitalManager } from './digitalManager';
import { probeDockerEngine } from './core/dockerReadiness';
import { runProcess } from './core/processRunner';
import { createVncWebSocketBridge } from './core/vncWebSocketBridge';

const DISPLAY_WIDTH = 1440;
const DISPLAY_HEIGHT = 900;
const START_TIMEOUT_MS = 15_000;
const CONTAINER_START_TIMEOUT_MS = 60_000;
const CONTAINER_IMAGE = 'systemstudio-cis310-full-digital:0.31';

export interface FullDigitalSession {
  readonly id: string;
  readonly circuitPath: string;
  readonly websocketUri: vscode.Uri;
  readonly display: string;
  readonly transport: 'local-linux' | 'docker';
  readonly digital: ChildProcess;
}

interface DisplayTools {
  xvfb: string;
  x11vnc: string;
  environment: NodeJS.ProcessEnv;
  source: 'system' | 'managed-debian';
}

interface OwnedSession extends FullDigitalSession {
  xvfb?: ChildProcess;
  vnc?: ChildProcess;
  containerName?: string;
  dockerExecutable?: string;
  bridge: HttpServer;
  sockets: Set<WebSocket>;
}

/**
 * Runs the unmodified upstream Digital Swing application on a private X11
 * display and transports that display to a VS Code webview with VNC. Linux
 * uses host/private display tools; Windows and macOS use an extension-managed
 * Docker Desktop image containing Java and those display tools. The circuit
 * editor itself is Digital; SystemStudio does not reinterpret the circuit
 * model or replace Digital controls.
 */
export class FullDigitalRuntime implements vscode.Disposable {
  private readonly sessions = new Map<string, Promise<OwnedSession>>();
  private disposed = false;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly digitalManager: DigitalManager,
    private readonly output: vscode.OutputChannel
  ) {}

  get supported(): boolean {
    return process.platform === 'linux' || process.platform === 'win32' || process.platform === 'darwin';
  }

  async open(circuitPath: string): Promise<FullDigitalSession> {
    if (!this.supported) {
      throw new Error('The in-editor Full Digital desktop requires a desktop Linux, Windows, or macOS extension host.');
    }
    if (this.disposed) throw new Error('The Full Digital runtime has already stopped.');
    const key = path.resolve(circuitPath);
    let pending = this.sessions.get(key);
    if (!pending) {
      pending = this.start(key).catch((error) => {
        this.sessions.delete(key);
        throw error;
      });
      this.sessions.set(key, pending);
    }
    return pending;
  }

  async disposeSession(circuitPath: string): Promise<void> {
    const key = path.resolve(circuitPath);
    const pending = this.sessions.get(key);
    this.sessions.delete(key);
    if (!pending) return;
    try {
      await stopSession(await pending);
    } catch (error) {
      this.output.appendLine(`Could not stop Full Digital session: ${errorText(error)}`);
    }
  }

  dispose(): void {
    this.disposed = true;
    const pending = [...this.sessions.values()];
    this.sessions.clear();
    for (const session of pending) {
      void session.then(stopSession, () => undefined);
    }
  }

  private async start(circuitPath: string): Promise<OwnedSession> {
    return process.platform === 'linux'
      ? this.startLinux(circuitPath)
      : this.startContainer(circuitPath);
  }

  private async startLinux(circuitPath: string): Promise<OwnedSession> {
    await access(circuitPath, fsConstants.R_OK | fsConstants.W_OK);
    const tools = await this.ensureDisplayTools();
    const displayNumber = await availableDisplayNumber();
    const display = `:${displayNumber}`;
    const vncPort = await availableTcpPort();
    const token = randomBytes(24).toString('hex');

    const xvfb = spawn(tools.xvfb, [
      display,
      '-screen', '0', `${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x24`,
      '-nolisten', 'tcp',
      '-noreset'
    ], {
      env: tools.environment,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    logProcess(xvfb, 'Xvfb', this.output);

    let vnc: ChildProcess | undefined;
    let bridge: HttpServer | undefined;
    let digital: ChildProcess | undefined;
    try {
      await waitForPath(`/tmp/.X11-unix/X${displayNumber}`, xvfb, START_TIMEOUT_MS);
      vnc = spawn(tools.x11vnc, [
        '-display', display,
        '-localhost',
        '-forever',
        '-shared',
        '-nopw',
        '-rfbport', String(vncPort),
        '-noxdamage',
        '-xkb'
      ], {
        env: { ...tools.environment, DISPLAY: display },
        shell: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      logProcess(vnc, 'x11vnc', this.output);
      await waitForTcp(vncPort, vnc, START_TIMEOUT_MS);

      const proxy = await createVncWebSocketBridge(vncPort, token, this.output);
      bridge = proxy.server;
      const tunnel = await vscode.env.asExternalUri(vscode.Uri.parse(`http://127.0.0.1:${proxy.port}/${token}`));
      const websocketUri = tunnel.with({ scheme: tunnel.scheme === 'https' ? 'wss' : 'ws' });

      digital = await this.digitalManager.launchAttached(circuitPath, {
        DISPLAY: display,
        GDK_BACKEND: 'x11',
        _JAVA_AWT_WM_NONREPARENTING: '1'
      });

      const id = randomBytes(12).toString('hex');
      const session: OwnedSession = {
        id,
        circuitPath,
        websocketUri,
        display,
        transport: 'local-linux',
        digital,
        xvfb,
        vnc,
        bridge,
        sockets: proxy.sockets
      };
      digital.once('exit', () => {
        const current = this.sessions.get(circuitPath);
        if (current) {
          void current.then(async (resolved) => {
            if (resolved.id === id) {
              this.sessions.delete(circuitPath);
              await stopSession(resolved, false);
            }
          }, () => undefined);
        }
      });
      this.output.appendLine(
        `Full Digital session ${id} ready on ${display} through ${tools.source} display tools.`
      );
      return session;
    } catch (error) {
      if (digital) terminate(digital);
      if (bridge) await closeServer(bridge);
      if (vnc) terminate(vnc);
      terminate(xvfb);
      throw error;
    }
  }

  private async startContainer(circuitPath: string): Promise<OwnedSession> {
    await access(circuitPath, fsConstants.R_OK | fsConstants.W_OK);
    const docker = await this.ensureContainerImage();
    const vncPort = await availableTcpPort();
    const token = randomBytes(24).toString('hex');
    const containerName = `systemstudio-digital-${randomBytes(8).toString('hex')}`;
    const circuitDirectory = path.dirname(circuitPath);
    const circuitName = path.basename(circuitPath);
    const args = [
      'run', '--rm', '--name', containerName,
      '--cap-drop=ALL', '--security-opt', 'no-new-privileges',
      '--pids-limit', '256', '--memory', '1g',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=256m',
      '--tmpfs', '/home/digital:rw,nosuid,size=64m',
      '-p', `127.0.0.1:${vncPort}:5900`,
      '-v', `${this.digitalManager.digitalHome}:/opt/digital:ro`,
      '-v', `${circuitDirectory}:/workspace:rw`,
      CONTAINER_IMAGE,
      `/workspace/${circuitName}`
    ];
    const container = spawn(docker, args, {
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    logProcess(container, 'Full Digital container', this.output);

    let bridge: HttpServer | undefined;
    try {
      await waitForSpawn(container, 'Docker');
      await waitForTcp(vncPort, container, CONTAINER_START_TIMEOUT_MS, 'Full Digital container');
      const proxy = await createVncWebSocketBridge(vncPort, token, this.output);
      bridge = proxy.server;
      const tunnel = await vscode.env.asExternalUri(vscode.Uri.parse(`http://127.0.0.1:${proxy.port}/${token}`));
      const websocketUri = tunnel.with({ scheme: tunnel.scheme === 'https' ? 'wss' : 'ws' });
      const id = randomBytes(12).toString('hex');
      const session: OwnedSession = {
        id,
        circuitPath,
        websocketUri,
        display: 'container desktop',
        transport: 'docker',
        digital: container,
        containerName,
        dockerExecutable: docker,
        bridge,
        sockets: proxy.sockets
      };
      this.registerExitCleanup(session);
      this.output.appendLine(`Full Digital session ${id} ready in extension-managed container ${containerName}.`);
      return session;
    } catch (error) {
      if (bridge) await closeServer(bridge);
      terminate(container);
      await removeContainer(docker, containerName);
      throw error;
    }
  }

  private registerExitCleanup(session: OwnedSession): void {
    session.digital.once('exit', () => {
      const current = this.sessions.get(session.circuitPath);
      if (current) {
        void current.then(async (resolved) => {
          if (resolved.id === session.id) {
            this.sessions.delete(session.circuitPath);
            await stopSession(resolved, false);
          }
        }, () => undefined);
      }
    });
  }

  private async ensureContainerImage(): Promise<string> {
    const dockerStatus = await probeDockerEngine();
    if (dockerStatus.state !== 'ready' || !dockerStatus.executable) {
      throw new Error(`${dockerStatus.detail} Native Digital remains available as an explicit fallback when host Java is ready.`);
    }
    const docker = dockerStatus.executable;
    const existing = await runProcess(docker, ['image', 'inspect', CONTAINER_IMAGE], {
      timeoutMs: 20_000,
      maxOutputBytes: 256 * 1024
    });
    if (existing.code === 0) return docker;

    const buildContext = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'full-digital-container').fsPath;
    await access(path.join(buildContext, 'Dockerfile'), fsConstants.R_OK);
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Preparing embedded Full Digital (one-time container setup)',
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: 'Building the pinned Java/X11 runtime with Docker Desktop…' });
        const build = await runProcess(docker, ['build', '--pull', '-t', CONTAINER_IMAGE, buildContext], {
          timeoutMs: 10 * 60_000,
          maxOutputBytes: 4 * 1024 * 1024
        });
        if (build.code !== 0 || build.timedOut) {
          throw new Error(`Could not build the Full Digital container.\n${build.stderr || build.stdout}`);
        }
      }
    );
    return docker;
  }

  private async ensureDisplayTools(): Promise<DisplayTools> {
    const systemXvfb = await findExecutable('Xvfb');
    const systemVnc = await findExecutable('x11vnc');
    if (systemXvfb && systemVnc) {
      return { xvfb: systemXvfb, x11vnc: systemVnc, environment: process.env, source: 'system' };
    }

    if (process.arch !== 'x64' || !(await isDebianFamily())) {
      const fallback = process.env.DISPLAY || process.env.WAYLAND_DISPLAY
        ? 'Use the Native window action on this graphical Linux host.'
        : 'Ask the system administrator to install Xvfb and x11vnc.';
      throw new Error(
        `The in-editor Full Digital desktop needs Xvfb and x11vnc on this Linux host. ${fallback}`
      );
    }

    const runtimeRoot = path.join(this.context.globalStorageUri.fsPath, 'full-digital-display', 'debian-amd64');
    const xvfb = path.join(runtimeRoot, 'usr', 'bin', 'Xvfb');
    const x11vnc = path.join(runtimeRoot, 'usr', 'bin', 'x11vnc');
    if (!(await executable(xvfb)) || !(await executable(x11vnc))) {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Preparing the Full Digital in-editor display',
          cancellable: false
        },
        async (progress) => {
          progress.report({ message: 'Downloading signed Debian/Ubuntu Xvfb and x11vnc packages…' });
          await this.installDebianDisplayTools(runtimeRoot);
        }
      );
    }

    const libraryDirectories = [
      path.join(runtimeRoot, 'usr', 'lib', 'x86_64-linux-gnu'),
      path.join(runtimeRoot, 'lib', 'x86_64-linux-gnu')
    ];
    const environment = {
      ...process.env,
      LD_LIBRARY_PATH: [...libraryDirectories, process.env.LD_LIBRARY_PATH].filter(Boolean).join(path.delimiter)
    };
    await assertLinked(xvfb, environment);
    await assertLinked(x11vnc, environment);
    return { xvfb, x11vnc, environment, source: 'managed-debian' };
  }

  private async installDebianDisplayTools(runtimeRoot: string): Promise<void> {
    const aptGet = await findExecutable('apt-get');
    const dpkgDeb = await findExecutable('dpkg-deb');
    if (!aptGet || !dpkgDeb) {
      throw new Error('The managed headless display requires apt-get and dpkg-deb. Install Xvfb and x11vnc with this host’s package manager instead.');
    }
    const staging = `${runtimeRoot}.staging-${process.pid}-${Date.now()}`;
    const downloads = path.join(staging, 'downloads');
    await rm(staging, { recursive: true, force: true });
    await mkdir(downloads, { recursive: true });
    try {
      const download = await runProcess(aptGet, ['download', 'xvfb', 'x11vnc'], {
        cwd: downloads,
        timeoutMs: 180_000,
        maxOutputBytes: 2 * 1024 * 1024
      });
      if (download.code !== 0 || download.timedOut) {
        throw new Error(`Could not download the host display packages.\n${download.stderr || download.stdout}`);
      }
      const packages = (await readdir(downloads)).filter((name) => name.endsWith('.deb')).sort();
      if (packages.length < 2) throw new Error('apt-get did not produce both required display packages.');
      for (const packageName of packages) {
        const extraction = await runProcess(dpkgDeb, ['-x', path.join(downloads, packageName), staging], {
          timeoutMs: 60_000,
          maxOutputBytes: 1024 * 1024
        });
        if (extraction.code !== 0 || extraction.timedOut) {
          throw new Error(`Could not extract ${packageName}.\n${extraction.stderr || extraction.stdout}`);
        }
      }
      await rm(downloads, { recursive: true, force: true });
      await rm(runtimeRoot, { recursive: true, force: true });
      await mkdir(path.dirname(runtimeRoot), { recursive: true });
      const { rename } = await import('node:fs/promises');
      await rename(staging, runtimeRoot);
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  }
}

async function stopSession(session: OwnedSession, stopDigital = true): Promise<void> {
  for (const socket of session.sockets) socket.close();
  await closeServer(session.bridge);
  if (stopDigital) terminate(session.digital);
  if (session.vnc) terminate(session.vnc);
  if (session.xvfb) terminate(session.xvfb);
  if (session.containerName && session.dockerExecutable) {
    await removeContainer(session.dockerExecutable, session.containerName);
  }
}

async function removeContainer(docker: string, name: string): Promise<void> {
  try {
    await runProcess(docker, ['rm', '-f', name], { timeoutMs: 15_000, maxOutputBytes: 128 * 1024 });
  } catch {
    // The --rm container may already have stopped and removed itself.
  }
}

function terminate(child: ChildProcess): void {
  if (!child.killed && child.exitCode === null) child.kill('SIGTERM');
}

function closeServer(server: HttpServer): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function logProcess(child: ChildProcess, label: string, output: vscode.OutputChannel): void {
  child.stdout?.on('data', (chunk) => output.appendLine(`[${label}] ${String(chunk).trimEnd()}`));
  child.stderr?.on('data', (chunk) => output.appendLine(`[${label}] ${String(chunk).trimEnd()}`));
}

function waitForSpawn(child: ChildProcess, label: string): Promise<void> {
  if (child.pid) return Promise.resolve();
  return new Promise((resolve, reject) => {
    child.once('spawn', resolve);
    child.once('error', (error) => reject(new Error(`${label} could not start: ${error.message}`)));
  });
}

async function availableDisplayNumber(): Promise<number> {
  for (let display = 90; display <= 199; display += 1) {
    if (!(await exists(`/tmp/.X11-unix/X${display}`)) && !(await exists(`/tmp/.X${display}-lock`))) return display;
  }
  throw new Error('No private X11 display number is available for Full Digital.');
}

function availableTcpPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a private VNC port.'));
        return;
      }
      const port = address.port;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForPath(target: string, process: ChildProcess, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`Xvfb exited before creating ${target}.`);
    if (await exists(target)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for the private X11 display (${target}).`);
}

async function waitForTcp(port: number, process: ChildProcess, timeoutMs: number, label = 'x11vnc'): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`${label} exited before accepting connections.`);
    const connected = await new Promise<boolean>((resolve) => {
      const socket = createConnection({ host: '127.0.0.1', port });
      socket.once('connect', () => { socket.destroy(); resolve(true); });
      socket.once('error', () => resolve(false));
      socket.setTimeout(250, () => { socket.destroy(); resolve(false); });
    });
    if (connected) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label} on port ${port}.`);
}

async function findExecutable(name: string): Promise<string | undefined> {
  if (name.includes(path.sep)) return await executable(name) ? name : undefined;
  const candidates = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
  for (const directory of candidates) {
    const names = process.platform === 'win32' && !path.extname(name) ? [`${name}.exe`, `${name}.cmd`, name] : [name];
    for (const executableName of names) {
      const candidate = path.join(directory, executableName);
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

async function exists(candidate: string): Promise<boolean> {
  try {
    await access(candidate);
    return true;
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

async function assertLinked(executablePath: string, environment: NodeJS.ProcessEnv): Promise<void> {
  const ldd = await findExecutable('ldd');
  if (!ldd) return;
  const result = await runProcess(ldd, [executablePath], {
    env: environment,
    timeoutMs: 10_000,
    maxOutputBytes: 512 * 1024
  });
  const missing = `${result.stdout}\n${result.stderr}`.split(/\r?\n/).filter((line) => line.includes('not found'));
  if (missing.length > 0) {
    throw new Error(
      `The host is missing libraries required by ${path.basename(executablePath)}:\n${missing.join('\n')}\n` +
      (process.env.DISPLAY || process.env.WAYLAND_DISPLAY
        ? 'Use the Native window action, or ask the system administrator to install Xvfb and x11vnc.'
        : 'Ask the system administrator to install Xvfb and x11vnc.')
    );
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
