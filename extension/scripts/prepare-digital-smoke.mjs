import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { unzipSync } from 'fflate';

const DIGITAL = {
  url: 'https://github.com/hneemann/Digital/releases/download/v0.31/Digital.zip',
  archiveSha256: '12f014c8b99140554f8f7464ebc771bbe3de6af39c83c20463492bcb892afc69',
  jarSha256: '72199dd6200b4928a2d72dad7b19f0fa354e92cf0ce9bd6859c75f415b97e388'
};
const destination = path.resolve(process.argv[2] || '.digital-smoke');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

const response = await fetch(DIGITAL.url, { redirect: 'follow' });
if (!response.ok) throw new Error(`Digital download failed with HTTP ${response.status}.`);
const archive = Buffer.from(await response.arrayBuffer());
assertDigest(archive, DIGITAL.archiveSha256, 'Digital.zip');
const entries = unzipSync(new Uint8Array(archive));
for (const [name, value] of Object.entries(entries)) {
  const normalized = path.posix.normalize(name);
  if (normalized.startsWith('../') || path.posix.isAbsolute(normalized) || normalized.includes('/../')) {
    throw new Error(`Unsafe Digital archive entry: ${name}`);
  }
  if (name.endsWith('/')) continue;
  const target = path.join(destination, ...normalized.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, value, { flag: 'wx' });
}
const jar = path.join(destination, 'Digital', 'Digital.jar');
assertDigest(await readFile(jar), DIGITAL.jarSha256, 'Digital.jar');
await writeFile(path.join(destination, 'blank-smoke.dig'), '<?xml version="1.0" encoding="utf-8"?>\n<circuit>\n  <version>1</version>\n  <attributes/>\n  <visualElements/>\n  <wires/>\n</circuit>\n', { flag: 'wx' });
process.stdout.write(`Prepared checksum-verified Digital v0.31 smoke fixture at ${destination}\n`);

function assertDigest(bytes, expected, label) {
  const observed = createHash('sha256').update(bytes).digest('hex');
  if (observed !== expected) throw new Error(`${label} checksum mismatch: expected ${expected}, observed ${observed}.`);
}
