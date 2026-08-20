import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';

const root = process.cwd();

describe('full Digital and real assembly declarations', () => {
  it('makes the upstream Full Digital desktop the only default .dig editor', () => {
    const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      contributes: { customEditors: Array<{ viewType: string; priority: string }> };
    };
    const defaults = manifest.contributes.customEditors.filter((editor) => editor.priority === 'default');
    assert.deepEqual(defaults.map((editor) => editor.viewType), ['systemstudioCis310.fullDigitalEditor']);
    assert.equal(manifest.contributes.customEditors.some((editor) => editor.viewType.includes('embeddedCircuit')), false);
  });

  it('stages the complete noVNC client used to transport the real Swing application', () => {
    const rfb = readFileSync(path.join(root, 'media', 'vendor', 'novnc', 'core', 'rfb.js'), 'utf8');
    assert.match(rfb, /export default class RFB/);
    assert.match(rfb, /sendCtrlAltDel/);
  });

  it('ships a cross-platform container runtime for embedding upstream Digital on Windows and macOS', () => {
    const runtime = readFileSync(path.join(root, 'src', 'fullDigitalRuntime.ts'), 'utf8');
    const dockerfile = readFileSync(path.join(root, 'media', 'full-digital-container', 'Dockerfile'), 'utf8');
    const entrypoint = readFileSync(path.join(root, 'media', 'full-digital-container', 'entrypoint.sh'), 'utf8');
    assert.match(runtime, /process\.platform === 'win32'/);
    assert.match(runtime, /process\.platform === 'darwin'/);
    assert.match(runtime, /127\.0\.0\.1:\$\{vncPort\}:5900/);
    assert.match(runtime, /--cap-drop=ALL/);
    assert.match(dockerfile, /eclipse-temurin:17\.0\.16_8-jre-jammy/);
    assert.match(entrypoint, /-jar \/opt\/digital\/Digital\.jar/);
  });

  it('ships a NASM source that must assemble and execute as real ELF32 machine code', () => {
    const source = readFileSync(
      path.join(root, 'assembly-starter', 'nasm-elf32', 'LoopSum.asm'),
      'utf8'
    );
    assert.match(source, /^bits 32$/m);
    assert.match(source, /^global _start$/m);
    assert.match(source, /int 0x80/);
    assert.doesNotMatch(source, /WriteDec|DumpRegs|source-level teaching/);
  });

  it('labels the source-level assembly panel as a trace tutor rather than MASM or NASM', () => {
    const panel = readFileSync(path.join(root, 'src', 'assemblyLabPanel.ts'), 'utf8');
    assert.match(panel, /Learning simulator — not an assembler/);
    assert.match(panel, /Build and run real code/);
    assert.doesNotMatch(panel, /No Visual Studio • no Docker • every OS/);
  });

  it('offers one actual NASM/GDB path with a hardened cross-platform course container', () => {
    const extension = readFileSync(path.join(root, 'src', 'extension.ts'), 'utf8');
    const manager = readFileSync(path.join(root, 'src', 'nativeAssemblyManager.ts'), 'utf8');
    const manifest = readFileSync(path.join(root, 'package.json'), 'utf8');
    const dockerfile = readFileSync(path.join(root, 'media', 'nasm-container', 'Dockerfile'), 'utf8');
    const debuggerScript = readFileSync(path.join(root, 'media', 'nasm-container', 'debug-nasm.sh'), 'utf8');
    assert.match(manifest, /Open Actual NASM Debug Workbench/);
    assert.doesNotMatch(extension, /Exact Microsoft MASM \+ Irvine32|Auto-detect from source/);
    assert.match(manager, /systemstudio-cis310-nasm:0\.20\.0/);
    assert.match(manager, /--cap-drop/);
    assert.match(manager, /--network/);
    assert.match(dockerfile, /qemu-user/);
    assert.match(debuggerScript, /qemu-i386 -g 1234/);
  });

  it('discloses the streamed desktop screen-reader boundary', () => {
    const editor = readFileSync(path.join(root, 'src', 'fullDigitalEditor.ts'), 'utf8');
    assert.match(editor, /Accessibility boundary/);
    assert.match(editor, /component-level Swing semantics are not exposed/);
    assert.match(editor, /screen-reader-equivalent circuit editor/);
  });

  it('archives pre-0.20 assembly guides during a safe workspace upgrade', () => {
    const upgrader = readFileSync(path.join(root, 'src', 'core', 'assemblyGuideUpgrade.ts'), 'utf8');
    assert.match(upgrader, /systemstudio-assembly-guide: 0\.20/);
    assert.match(upgrader, /COMPATIBILITY-pre-0\.20\.md/);
    assert.match(upgrader, /LEGACY-IRVINE32_PROFILE\.md/);
    assert.match(upgrader, /await rename\(destination, archived\)/);
  });
});
