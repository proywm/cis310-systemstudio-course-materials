import { readFile, readdir } from 'node:fs/promises';
import * as path from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';

const explicit = process.argv[2];
const vsix = explicit
  ? path.resolve(explicit)
  : path.resolve((await readdir('.')).find((name) => /^systemstudio-cis310.*\.vsix$/.test(name)) || 'systemstudio-cis310.vsix');
const archive = unzipSync(new Uint8Array(await readFile(vsix)));
const names = new Set(Object.keys(archive));
const required = [
  'extension/package.json',
  'extension/dist/extension.js',
  'extension/GETTING_STARTED.html',
  'extension/media/orbit-anime-v1.png',
  'extension/media/full-digital-container/Dockerfile',
  'extension/media/nasm-container/Dockerfile',
  'extension/assembly-starter/nasm-elf32/StudentUnitTest.test.asm',
  'extension/course-packs/cis310-fall2026/materials-manifest.json'
];
for (const name of required) {
  if (!names.has(name)) throw new Error(`VSIX is missing required release file: ${name}`);
}
const forbidden = [
  /^extension\/(?:test|scripts|src)\//,
  /(?:^|\/)internal-fixtures(?:\/|$)/i,
  /(?:^|\/)(?:solutions?|answer[-_ ]?keys?)(?:\/|$)/i,
  /(?:^|\/)\.env(?:\.|$)/,
  /(?:^|\/)student-data(?:\/|$)/i
];
for (const name of names) {
  for (const pattern of forbidden) {
    if (pattern.test(name)) throw new Error(`VSIX contains forbidden development/private path: ${name}`);
  }
}
const manifest = JSON.parse(strFromU8(archive['extension/package.json']));
if (manifest.name !== 'systemstudio-cis310' || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  throw new Error('Packaged extension manifest identity/version is invalid.');
}
process.stdout.write(`VSIX boundary audit passed: ${path.basename(vsix)} (${names.size} entries, version ${manifest.version}).\n`);
