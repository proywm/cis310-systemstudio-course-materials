import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';

const extensionRoot = process.cwd();
const require = createRequire(import.meta.url);

async function loadExports(entry) {
  const result = await build({
    entryPoints: [path.join(extensionRoot, entry)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    write: false,
    logLevel: 'silent',
    plugins: [{
      name: 'vscode-test-stub',
      setup(buildApi) {
        buildApi.onResolve({ filter: /^vscode$/ }, () => ({ path: 'vscode', namespace: 'vscode-test-stub' }));
        buildApi.onLoad({ filter: /.*/, namespace: 'vscode-test-stub' }, () => ({ contents: 'module.exports = {};', loader: 'js' }));
      }
    }]
  });
  const compiled = result.outputFiles[0]?.text;
  assert.ok(compiled, `${entry} did not compile for the generated-webview check`);
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', '__filename', '__dirname', compiled)(
    require,
    loaded,
    loaded.exports,
    path.join(extensionRoot, entry),
    path.dirname(path.join(extensionRoot, entry))
  );
  return loaded.exports;
}

function embeddedScript(html, label) {
  const match = html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/);
  assert.ok(match?.[1], `${label} did not contain a nonce-protected script`);
  assert.doesNotThrow(() => new vm.Script(match[1], { filename: `${label}.webview.js` }));
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(absolute));
    else if (entry.name.endsWith('.ts')) files.push(absolute);
  }
  return files;
}

const coursework = await loadExports('src/courseworkPanel.ts');
const nasm = await loadExports('src/nasmWorkbenchPanel.ts');
assert.equal(typeof coursework.buildCourseworkHtmlForTesting, 'function');
assert.equal(typeof nasm.buildNasmWorkbenchHtmlForTesting, 'function');
embeddedScript(coursework.buildCourseworkHtmlForTesting(), 'coursework');
embeddedScript(nasm.buildNasmWorkbenchHtmlForTesting(), 'nasm-workbench');

for (const file of await sourceFiles(path.join(extensionRoot, 'src'))) {
  const source = await readFile(file, 'utf8');
  assert.doesNotMatch(source, /\b(?:confirm|alert|prompt)\s*\(/, `${path.relative(extensionRoot, file)} uses a browser modal blocked by the VS Code webview sandbox`);
}

process.stdout.write('Coursework and NASM generated JavaScript parsed; no blocked browser modal calls remain.\n');
