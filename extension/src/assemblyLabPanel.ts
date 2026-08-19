import { randomBytes } from 'node:crypto';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { AssemblyExecutionOptions, AssemblyManager } from './assemblyManager';
import type { AssemblyProfile, MachineSnapshot } from './core/embeddedAssembly';

type AssemblyAction = 'assemble' | 'reset' | 'step' | 'run';

export class AssemblyLabPanel implements vscode.Disposable {
  private static readonly panels = new Map<string, AssemblyLabPanel>();
  private readonly disposables: vscode.Disposable[] = [];
  private profile: AssemblyProfile = 'auto';
  private input = '';

  static async show(
    context: vscode.ExtensionContext,
    manager: AssemblyManager,
    uri: vscode.Uri,
    action: AssemblyAction = 'assemble'
  ): Promise<void> {
    const key = uri.toString();
    let lab = AssemblyLabPanel.panels.get(key);
    if (!lab) {
      lab = new AssemblyLabPanel(context, manager, uri);
      AssemblyLabPanel.panels.set(key, lab);
    } else {
      lab.panel.reveal(vscode.ViewColumn.Beside, true);
    }
    await lab.perform(action);
  }

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly manager: AssemblyManager,
    private readonly uri: vscode.Uri
  ) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.assemblyLab',
      `Assembly Lab: ${path.basename(uri.fsPath)}`,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = this.html(this.panel.webview);
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      async (message: unknown) => {
        const request = requestFromMessage(message);
        if (request) {
          this.profile = request.profile;
          this.input = request.input;
          await this.perform(request.action, request);
        }
      },
      undefined,
      this.disposables
    );
  }

  private readonly panel: vscode.WebviewPanel;

  dispose(): void {
    AssemblyLabPanel.panels.delete(this.uri.toString());
    while (this.disposables.length > 0) {
      this.disposables.pop()?.dispose();
    }
  }

  private async perform(action: AssemblyAction, options: AssemblyExecutionOptions = {}): Promise<void> {
    const executionOptions: AssemblyExecutionOptions = {
      profile: options.profile ?? this.profile,
      input: options.input ?? this.input
    };
    await this.panel.webview.postMessage({ type: 'busy', action });
    try {
      let snapshot: MachineSnapshot;
      switch (action) {
        case 'assemble':
          snapshot = await this.manager.assemble(this.uri, executionOptions);
          break;
        case 'reset':
          snapshot = await this.manager.reset(this.uri, executionOptions);
          break;
        case 'step':
          snapshot = await this.manager.step(this.uri, executionOptions);
          break;
        case 'run':
          snapshot = await this.manager.run(this.uri, 10_000, executionOptions);
          break;
      }
      await this.panel.webview.postMessage({
        type: 'state',
        fileName: path.basename(this.uri.fsPath),
        state: snapshot
      });
      if (action === 'step' && snapshot.currentLine) {
        await this.revealLine(snapshot.currentLine);
      }
    } catch (error) {
      await this.panel.webview.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async revealLine(oneBasedLine: number): Promise<void> {
    const document = await vscode.workspace.openTextDocument(this.uri);
    const editor = await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.One,
      preserveFocus: true,
      preview: false
    });
    const line = Math.max(0, Math.min(document.lineCount - 1, oneBasedLine - 1));
    const range = document.lineAt(line).range;
    editor.selection = new vscode.Selection(range.start, range.start);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }

  private html(webview: vscode.Webview): string {
    const nonce = randomBytes(16).toString('base64');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>SystemStudio Embedded Assembly Lab</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; padding: 22px; color: var(--vscode-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); }
    header { display: flex; gap: 14px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 16px; }
    h1 { font-size: 1.45rem; margin: 0 0 5px; }
    h2 { font-size: 1.05rem; margin: 0 0 10px; }
    p { margin: 4px 0; line-height: 1.45; }
    .subtle { color: var(--vscode-descriptionForeground); }
    .badge { display: inline-block; padding: 3px 8px; border: 1px solid var(--vscode-testing-iconPassed); border-radius: 999px; color: var(--vscode-testing-iconPassed); font-size: .78rem; }
    .controls { display: flex; gap: 8px; align-items: end; flex-wrap: wrap; margin: 16px 0; }
    .field { display: grid; gap: 4px; }
    label { color: var(--vscode-descriptionForeground); font-size: .8rem; }
    select, textarea { box-sizing: border-box; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); padding: 6px 8px; font-family: var(--vscode-font-family); }
    textarea { width: 100%; min-height: 76px; resize: vertical; font-family: var(--vscode-editor-font-family); }
    button { color: var(--vscode-button-foreground); background: var(--vscode-button-background); border: 0; border-radius: 2px; padding: 7px 13px; cursor: pointer; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
    button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    button:disabled { opacity: .55; cursor: wait; }
    .message { min-height: 20px; padding: 8px 10px; border-left: 3px solid var(--vscode-focusBorder); background: var(--vscode-textBlockQuote-background); }
    .message.error { border-left-color: var(--vscode-errorForeground); color: var(--vscode-errorForeground); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-top: 14px; }
    section { border: 1px solid var(--vscode-panel-border); padding: 14px; min-width: 0; }
    table { width: 100%; border-collapse: collapse; font-family: var(--vscode-editor-font-family); font-size: .88rem; }
    th, td { text-align: left; border-bottom: 1px solid var(--vscode-panel-border); padding: 5px 6px; }
    th { color: var(--vscode-descriptionForeground); font-family: var(--vscode-font-family); font-weight: 600; }
    code, pre { font-family: var(--vscode-editor-font-family); }
    pre { box-sizing: border-box; overflow: auto; min-height: 52px; max-height: 220px; margin: 0; padding: 9px; white-space: pre-wrap; background: var(--vscode-textCodeBlock-background); }
    .current { border-left: 3px solid var(--vscode-debugIcon-startForeground); }
    .wide { grid-column: 1 / -1; }
    .flags { display: flex; gap: 7px; flex-wrap: wrap; }
    .flag { min-width: 32px; text-align: center; padding: 4px 6px; border: 1px solid var(--vscode-panel-border); }
    .flag.on { border-color: var(--vscode-testing-iconPassed); color: var(--vscode-testing-iconPassed); }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Embedded Irvine32 / IA-32 Assembly Lab</h1>
      <p id="filename" class="subtle">Loading source…</p>
    </div>
    <div><span class="badge">No Visual Studio • no Docker • every OS</span></div>
  </header>
  <div class="controls" role="toolbar" aria-label="Assembly controls">
    <div class="field">
      <label for="profile">Environment profile</label>
      <select id="profile">
        <option value="auto">Auto-detect</option>
        <option value="irvine32">Irvine32 Classroom (MASM)</option>
        <option value="nasm-ia32">NASM IA-32</option>
      </select>
    </div>
    <button data-action="assemble">Build</button>
    <button data-action="step">Step</button>
    <button data-action="run">Run</button>
    <button class="secondary" data-action="reset">Rebuild / Reset</button>
  </div>
  <section class="wide">
    <h2>Virtual console input</h2>
    <textarea id="consoleInput" aria-label="Virtual console input" placeholder="Enter one ReadInt/ReadString value per line, or characters for ReadChar…"></textarea>
    <p class="subtle">Input is isolated in memory. Changing it starts a fresh build on the next action.</p>
  </section>
  <div id="message" class="message" role="status">Preparing the embedded engine…</div>
  <div class="grid">
    <section class="wide current">
      <h2>Next source instruction</h2>
      <pre id="current">—</pre>
    </section>
    <section>
      <h2>Registers</h2>
      <table><thead><tr><th>Register</th><th>Hex</th><th>Unsigned</th><th>Signed</th></tr></thead><tbody id="registers"></tbody></table>
    </section>
    <section>
      <h2>Flags</h2>
      <div id="flags" class="flags"></div>
      <h2 style="margin-top:18px">Program output</h2>
      <pre id="output">(none)</pre>
      <h2 style="margin-top:18px">Input remaining</h2>
      <pre id="inputRemaining">(none)</pre>
    </section>
    <section>
      <h2>Stack (top eight DWORDs)</h2>
      <table><thead><tr><th>Address</th><th>Value</th></tr></thead><tbody id="stack"></tbody></table>
    </section>
    <section>
      <h2>Data symbols</h2>
      <table><thead><tr><th>Symbol</th><th>Address</th><th>Bytes</th><th>First value</th></tr></thead><tbody id="data"></tbody></table>
    </section>
    <section class="wide">
      <h2>Recent execution trace</h2>
      <pre id="trace">(no instructions executed)</pre>
    </section>
    <section class="wide">
      <h2>Compatibility boundary</h2>
      <p class="subtle">Irvine32 Classroom is a clean-room source-level compatibility profile; it does not copy Visual Studio, ml.exe, or the book library. EIP uses synthetic teaching addresses. The lab does not emit PE/ELF files or replace complete MASM/NASM, Windows APIs, x87, SIMD, or operating-system behavior.</p>
    </section>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const buttons = [...document.querySelectorAll('button[data-action]')];
    const profile = document.getElementById('profile');
    const consoleInput = document.getElementById('consoleInput');
    const message = document.getElementById('message');
    const hex = (value, digits = 8) => '0x' + (value >>> 0).toString(16).toUpperCase().padStart(digits, '0');
    const signed = value => value > 0x7fffffff ? value - 0x100000000 : value;
    const cell = text => { const td = document.createElement('td'); td.textContent = String(text); return td; };
    const row = values => { const tr = document.createElement('tr'); values.forEach(value => tr.appendChild(cell(value))); return tr; };
    buttons.forEach(button => button.addEventListener('click', () => vscode.postMessage({
      action: button.dataset.action,
      profile: profile.value,
      input: consoleInput.value
    })));
    window.addEventListener('message', event => {
      const payload = event.data;
      if (payload.type === 'busy') {
        buttons.forEach(button => button.disabled = true);
        message.className = 'message';
        message.textContent = payload.action === 'run' ? 'Running with a 10,000-instruction safety limit…' : payload.action + '…';
        return;
      }
      buttons.forEach(button => button.disabled = false);
      if (payload.type === 'error') {
        message.className = 'message error';
        message.textContent = payload.message;
        return;
      }
      if (payload.type !== 'state') return;
      const state = payload.state;
      const profileLabel = state.profile === 'irvine32' ? 'Irvine32 Classroom (MASM)'
        : state.profile === 'nasm-ia32' ? 'NASM IA-32' : 'Generic IA-32';
      document.getElementById('filename').textContent = payload.fileName + ' • ' + profileLabel;
      message.className = 'message';
      message.textContent = state.halted
        ? 'Stopped after ' + state.steps + ' step(s): ' + (state.reason || 'program complete')
        : 'Ready • ' + state.steps + ' step(s) executed';
      document.getElementById('current').textContent = state.halted
        ? '(program halted)'
        : 'Line ' + state.currentLine + ':  ' + state.currentInstruction;
      const registers = document.getElementById('registers');
      registers.replaceChildren(...Object.entries(state.registers).map(([name, value]) => row([name, hex(value), value >>> 0, signed(value)])));
      const flags = document.getElementById('flags');
      flags.replaceChildren(...Object.entries(state.flags).map(([name, enabled]) => {
        const span = document.createElement('span');
        span.className = 'flag' + (enabled ? ' on' : '');
        span.textContent = name + '=' + Number(enabled);
        return span;
      }));
      document.getElementById('output').textContent = state.output || '(none)';
      document.getElementById('inputRemaining').textContent = state.inputRemaining || '(none)';
      const stack = document.getElementById('stack');
      stack.replaceChildren(...state.stack.map(item => row([hex(item.address), hex(item.value)])));
      if (state.stack.length === 0) stack.appendChild(row(['(empty)', '—']));
      const data = document.getElementById('data');
      data.replaceChildren(...state.data.map(item => row([item.name, hex(item.address), item.size, hex(item.value)])));
      if (state.data.length === 0) data.appendChild(row(['(none)', '—', '—', '—']));
      document.getElementById('trace').textContent = state.trace.length
        ? state.trace.map(item => String(item.line).padStart(4, ' ') + '  ' + item.source).join('\n')
        : '(no instructions executed)';
    });
  </script>
</body>
</html>`;
  }
}

interface AssemblyRequest extends AssemblyExecutionOptions {
  action: AssemblyAction;
  profile: AssemblyProfile;
  input: string;
}

function requestFromMessage(message: unknown): AssemblyRequest | undefined {
  if (typeof message !== 'object' || message === null || !('action' in message)) {
    return undefined;
  }
  const request = message as { action?: unknown; profile?: unknown; input?: unknown };
  const action = request.action;
  const profile = request.profile;
  if (action !== 'assemble' && action !== 'reset' && action !== 'step' && action !== 'run') return undefined;
  if (profile !== 'auto' && profile !== 'irvine32' && profile !== 'nasm-ia32') return undefined;
  if (typeof request.input !== 'string' || request.input.length > 64 * 1024) return undefined;
  return { action, profile, input: request.input };
}
