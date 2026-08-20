import * as esbuild from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import * as path from 'node:path';

const coursePackSource = path.resolve('../course-packs/cis310-fall2026');
const coursePackDestination = path.resolve('course-packs/cis310-fall2026');
const noVncSource = path.resolve('node_modules/@novnc/novnc');
const noVncDestination = path.resolve('media/vendor/novnc');

async function stageCoursePack() {
  await rm(path.dirname(coursePackDestination), { recursive: true, force: true });
  await mkdir(path.dirname(coursePackDestination), { recursive: true });
  await cp(coursePackSource, coursePackDestination, { recursive: true });
}

async function stageNoVnc() {
  await rm(noVncDestination, { recursive: true, force: true });
  await mkdir(noVncDestination, { recursive: true });
  await cp(path.join(noVncSource, 'core'), path.join(noVncDestination, 'core'), { recursive: true });
  await cp(path.join(noVncSource, 'vendor'), path.join(noVncDestination, 'vendor'), { recursive: true });
  await cp(path.join(noVncSource, 'LICENSE.txt'), path.join(noVncDestination, 'LICENSE.txt'));
}

await stageCoursePack();
await stageNoVnc();

const watch = process.argv.includes('--watch');
const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  outfile: 'dist/extension.js',
  logLevel: 'info'
};

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  await esbuild.build(options);
}
