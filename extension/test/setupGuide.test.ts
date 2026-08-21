import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

const extensionRoot = path.resolve('.');

describe('packaged setup and first-task guide', () => {
  const html = readFileSync(path.join(extensionRoot, 'GETTING_STARTED.html'), 'utf8');
  const manifest = readFileSync(path.join(extensionRoot, 'package.json'), 'utf8');
  const extensionSource = readFileSync(path.join(extensionRoot, 'src', 'extension.ts'), 'utf8');
  const tutorialSource = readFileSync(path.join(extensionRoot, 'src', 'tutorialPanel.ts'), 'utf8');

  it('provides a semantic, reflowable guide for every supported desktop platform', () => {
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /<th scope="col">/);
    assert.match(html, /<th scope="row">Windows<\/th>/);
    assert.match(html, /<th scope="row">macOS<\/th>/);
    assert.match(html, /<th scope="row">x86 Linux<\/th>/);
  });

  it('explains the observed Docker error and walks through actual first tasks', () => {
    assert.match(html, /circuit is safe and was not changed/i);
    assert.match(html, /docker_engine/);
    assert.match(html, /Retry embedded Digital/);
    assert.match(html, /first circuit/i);
    assert.match(html, /half adder/i);
    assert.match(html, /first assembly lab/i);
    assert.match(html, /Student Unit Test Center/);
    assert.match(html, /verify the Canvas submission receipt/i);
  });

  it('registers the guide as an extension command', () => {
    assert.match(manifest, /systemstudioCis310\.openSetupGuide/);
  });

  it('surfaces the first setup error and describes one consistent Digital route', () => {
    assert.match(extensionSource, /guided setup stopped\. First error: \$\{firstError\}/);
    assert.match(tutorialSource, /primary path keeps the real Swing UI in a VS Code tab/);
    assert.match(tutorialSource, /verified native Digital window is an explicit fallback/);
    assert.doesNotMatch(tutorialSource, /on desktop hosts it opens the native window/);
  });
});
