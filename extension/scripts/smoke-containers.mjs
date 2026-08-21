import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

const digitalRoot = path.resolve(process.argv[2] || '.digital-smoke');
const temporary = await mkdtemp(path.join(tmpdir(), 'systemstudio-container-smoke-'));
const digitalName = `systemstudio-digital-ci-${process.pid}`;
try {
  await run('docker', ['build', '--pull', '-t', 'systemstudio-cis310-nasm:ci', 'media/nasm-container']);
  await run('docker', [
    'run', '--rm', '--platform', 'linux/amd64', '--network', 'none', '--cap-drop=ALL',
    '--security-opt', 'no-new-privileges', '--read-only', '--tmpfs', '/tmp:rw,exec,nosuid,size=128m',
    '-v', `${path.resolve('assembly-starter/nasm-elf32')}:/work:ro`, 'systemstudio-cis310-nasm:ci',
    'sh', '-lc', 'mkdir -p /tmp/build && for source in /work/*.asm; do stem=$(basename "$source" .asm); nasm -f elf32 -g -F dwarf -o "/tmp/build/$stem.o" "$source"; ld -m elf_i386 -o "/tmp/build/$stem" "/tmp/build/$stem.o"; "/tmp/build/$stem"; done'
  ]);

  await run('docker', ['build', '--pull', '-t', 'systemstudio-cis310-full-digital:ci', 'media/full-digital-container']);
  await run('docker', [
    'run', '--detach', '--rm', '--name', digitalName, '--cap-drop=ALL', '--security-opt', 'no-new-privileges',
    '--pids-limit', '256', '--memory', '1g', '--read-only',
    '--tmpfs', '/tmp:rw,noexec,nosuid,size=256m', '--tmpfs', '/home/digital:rw,nosuid,size=64m',
    '-p', '127.0.0.1::5900',
    '-v', `${path.join(digitalRoot, 'Digital')}:/opt/digital:ro`,
    '-v', `${digitalRoot}:/workspace:rw`, 'systemstudio-cis310-full-digital:ci', '/workspace/blank-smoke.dig'
  ]);
  const portResult = await run('docker', ['port', digitalName, '5900/tcp']);
  const match = /127\.0\.0\.1:(\d+)/.exec(portResult.stdout);
  assert.ok(match, `Could not parse Digital VNC port from: ${portResult.stdout}`);
  const greeting = await waitForRfb(Number(match[1]), 60_000);
  assert.match(greeting, /^RFB 003\./);
  const processes = await run('docker', ['top', digitalName]);
  assert.match(processes.stdout, /java\s+-Duser\.home=.*Digital\.jar/);
  process.stdout.write('Container smoke passed: all NASM starters assembled/linked/executed and Full Digital exposed a live RFB desktop.\n');
} finally {
  await run('docker', ['rm', '-f', digitalName], true);
  await rm(temporary, { recursive: true, force: true });
}

function run(command, args, allowFailure = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', (chunk) => { stderr += chunk; process.stderr.write(chunk); });
    child.once('error', allowFailure ? () => resolve({ code: -1, stdout, stderr }) : reject);
    child.once('close', (code) => {
      if (code !== 0 && !allowFailure) reject(new Error(`${command} ${args.join(' ')} failed (${code}): ${stderr || stdout}`));
      else resolve({ code, stdout, stderr });
    });
  });
}

async function waitForRfb(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return await new Promise((resolve, reject) => {
        const socket = createConnection({ host: '127.0.0.1', port });
        let settled = false;
        const finish = (callback) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          socket.destroy();
          callback();
        };
        const timer = setTimeout(() => finish(() => reject(new Error('timeout'))), 2_000);
        socket.once('data', (chunk) => finish(() => resolve(chunk.toString('ascii'))));
        socket.once('end', () => finish(() => reject(new Error('connection ended before RFB greeting'))));
        socket.once('close', () => finish(() => reject(new Error('connection closed before RFB greeting'))));
        socket.once('error', (error) => finish(() => reject(error)));
      });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Timed out waiting for Full Digital RFB on port ${port}.`);
}
