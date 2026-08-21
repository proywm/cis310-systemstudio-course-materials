import { spawn, type ChildProcess } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createConnection, createServer as createNetServer } from 'node:net';
import * as path from 'node:path';
import { createVncWebSocketBridge } from '../../src/core/vncWebSocketBridge';

interface Options {
  jar: string;
  circuit: string;
  xvfb: string;
  x11vnc: string;
  firefox: string;
  screenshot: string;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  for (const candidate of [options.jar, options.circuit, options.xvfb, options.x11vnc, options.firefox]) {
    await access(candidate, fsConstants.R_OK);
  }

  const displayNumber = await availableDisplayNumber();
  const display = `:${displayNumber}`;
  const vncPort = await availableTcpPort();
  const children: ChildProcess[] = [];
  let bridge: Awaited<ReturnType<typeof createVncWebSocketBridge>> | undefined;
  let webServer: ReturnType<typeof createServer> | undefined;
  let connected = false;
  let inputSent = false;
  try {
    const xvfb = spawn(options.xvfb, [
      display, '-screen', '0', '1440x900x24', '-nolisten', 'tcp', '-noreset'
    ], { stdio: 'ignore', shell: false });
    children.push(xvfb);
    await waitForPath(`/tmp/.X11-unix/X${displayNumber}`, xvfb, 15_000);

    const vnc = spawn(options.x11vnc, [
      '-display', display, '-localhost', '-forever', '-shared', '-nopw',
      '-rfbport', String(vncPort), '-noxdamage', '-xkb'
    ], { env: { ...process.env, DISPLAY: display }, stdio: 'ignore', shell: false });
    children.push(vnc);
    await waitForTcp(vncPort, vnc, 15_000);

    const digital = spawn('java', [
      '-Duser.home=/tmp/systemstudio-full-digital-smoke',
      '-jar', options.jar, options.circuit
    ], { env: { ...process.env, DISPLAY: display, _JAVA_AWT_WM_NONREPARENTING: '1' }, stdio: 'ignore', shell: false });
    children.push(digital);
    await delay(3_000);
    if (digital.exitCode !== null) throw new Error(`Digital exited early with code ${digital.exitCode}.`);

    bridge = await createVncWebSocketBridge(vncPort, 'manual-smoke', { appendLine: console.error });
    const noVncRoot = path.resolve('node_modules', '@novnc', 'novnc');
    webServer = createServer(async (request, response) => {
      try {
        if (request.url === '/') {
          const address = bridge?.port;
          response.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
          response.end(html(address ?? 0));
          return;
        }
        if (request.url === '/wait') {
          setTimeout(() => {
            response.writeHead(204, { 'Cache-Control': 'no-store' });
            response.end();
          }, 5_000);
          return;
        }
        if (request.method === 'POST' && request.url === '/connected') {
          connected = true;
          response.writeHead(204, { 'Cache-Control': 'no-store' });
          response.end();
          return;
        }
        if (request.method === 'POST' && request.url === '/input-sent') {
          inputSent = true;
          response.writeHead(204, { 'Cache-Control': 'no-store' });
          response.end();
          return;
        }
        const relative = request.url?.replace(/^\/novnc\//, '') ?? '';
        if (!/^(?:core|vendor)\/[A-Za-z0-9_./-]+$/.test(relative) || relative.includes('..')) {
          response.writeHead(404).end();
          return;
        }
        const content = await readFile(path.join(noVncRoot, relative));
        response.writeHead(200, { 'Content-Type': relative.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' });
        response.end(content);
      } catch (error) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end(error instanceof Error ? error.message : String(error));
      }
    });
    await new Promise<void>((resolve, reject) => {
      webServer?.once('error', reject);
      webServer?.listen(0, '127.0.0.1', () => resolve());
    });
    const address = webServer.address();
    if (!address || typeof address === 'string') throw new Error('Could not allocate the smoke-test web port.');

    await rm(options.screenshot, { force: true });
    const browserUrl = `http://127.0.0.1:${address.port}/`;
    const chromiumStyle = /(?:chromium|chrome|headless_shell)/i.test(path.basename(options.firefox));
    const browserArguments = chromiumStyle
      ? ['--headless', '--no-sandbox', '--window-size=1440,900', `--screenshot=${options.screenshot}`, browserUrl]
      : ['--headless', '--window-size=1440,900', '--screenshot', options.screenshot, browserUrl];
    const firefox = spawn(options.firefox, browserArguments, { stdio: 'inherit', shell: false });
    const firefoxCode = await childExit(firefox);
    if (firefoxCode !== 0) throw new Error(`Firefox screenshot exited with code ${firefoxCode}.`);
    const screenshot = await stat(options.screenshot);
    if (screenshot.size < 20_000) throw new Error(`Screenshot is unexpectedly small (${screenshot.size} bytes).`);
    if (!connected) throw new Error('The browser never completed the noVNC connection to upstream Digital.');
    if (!inputSent) throw new Error('The browser did not send the simulated pointer input through noVNC.');
    process.stdout.write(`Full Digital noVNC screenshot: ${options.screenshot} (${screenshot.size} bytes)\n`);
  } finally {
    if (webServer) await new Promise<void>((resolve) => webServer?.close(() => resolve()));
    if (bridge) {
      for (const socket of bridge.sockets) socket.terminate();
      await new Promise<void>((resolve) => bridge?.server.close(() => resolve()));
    }
    for (const child of children.reverse()) {
      if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
    }
  }
}

function html(websocketPort: number): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#screen{width:100%;height:100%;margin:0;overflow:hidden;background:#202020}#label{position:fixed;z-index:2;top:0;left:0;padding:6px 10px;background:#111;color:#fff;font:14px sans-serif}</style></head><body><div id="label">Connecting to actual upstream Digital…</div><div id="screen"></div><img src="/wait" hidden alt=""><script type="module">import RFB from '/novnc/core/rfb.js';const label=document.getElementById('label');const screen=document.getElementById('screen');const rfb=new RFB(screen,'ws://127.0.0.1:${websocketPort}/manual-smoke',{shared:true});rfb.scaleViewport=true;rfb.resizeSession=false;const mark=path=>fetch(path,{method:'POST'});const click=(canvas,x,y)=>{for(const type of ['mousemove','mousedown','mouseup'])canvas.dispatchEvent(new MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:0,buttons:type==='mousedown'?1:0}));};rfb.addEventListener('connect',()=>{void mark('/connected');label.textContent='CONNECTED — upstream Digital through noVNC';document.title='CONNECTED';setTimeout(()=>{const canvas=screen.querySelector('canvas');click(canvas,674,106);setTimeout(()=>{click(canvas,418,236);label.textContent='CONNECTED + SIMULATION INPUT SENT THROUGH noVNC';void mark('/input-sent');},500);},1500);});rfb.addEventListener('disconnect',()=>{label.textContent='DISCONNECTED';});</script></body></html>`;
}

function parseOptions(args: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, '');
    const value = args[index + 1];
    if (key && value) values.set(key, value);
  }
  const required = (key: string): string => {
    const value = values.get(key);
    if (!value) throw new Error(`Missing --${key}.`);
    return path.resolve(value);
  };
  return {
    jar: required('jar'), circuit: required('circuit'), xvfb: required('xvfb'),
    x11vnc: required('x11vnc'), firefox: required('firefox'), screenshot: required('screenshot')
  };
}

async function availableDisplayNumber(start = 120): Promise<number> {
  for (let value = start; value <= 190; value += 1) {
    try {
      await access(`/tmp/.X11-unix/X${value}`);
    } catch {
      return value;
    }
  }
  throw new Error('No display number is available.');
}

function childExit(child: ChildProcess): Promise<number | null> {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
}

function availableTcpPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') return reject(new Error('No TCP port.'));
      server.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

async function waitForPath(target: string, child: ChildProcess, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`${path.basename(target)} process exited early.`);
    try {
      await access(target);
      return;
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Timed out waiting for ${target}.`);
}

async function waitForTcp(port: number, child: ChildProcess, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('x11vnc exited early.');
    const ready = await new Promise<boolean>((resolve) => {
      const socket = createConnection({ host: '127.0.0.1', port });
      socket.once('connect', () => { socket.destroy(); resolve(true); });
      socket.once('error', () => resolve(false));
    });
    if (ready) return;
    await delay(100);
  }
  throw new Error('Timed out waiting for x11vnc.');
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
