import * as path from 'node:path';
import * as vscode from 'vscode';
import type { GdbSnapshot } from './core/gdbMi';
import type { NasmDebugHandle, NativeAssemblyManager } from './nativeAssemblyManager';

type WorkbenchMessage =
  | { type: 'prepare' }
  | { type: 'build-run' }
  | { type: 'start-debug' }
  | { type: 'step' }
  | { type: 'continue'; breakpoint?: string }
  | { type: 'inspect-memory'; expression?: string }
  | { type: 'open-source' }
  | { type: 'open-guide' }
  | { type: 'ask-tutor' };

export class NasmWorkbenchPanel implements vscode.Disposable {
  private static readonly panels = new Map<string, NasmWorkbenchPanel>();
  private debug?: NasmDebugHandle;

  static async show(context: vscode.ExtensionContext, manager: NativeAssemblyManager, uri: vscode.Uri): Promise<void> {
    const key = uri.toString();
    const existing = this.panels.get(key);
    if (existing) {
      existing.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }
    const workbench = new NasmWorkbenchPanel(context, manager, uri);
    this.panels.set(key, workbench);
    await workbench.refreshEnvironment();
  }

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly manager: NativeAssemblyManager,
    private readonly uri: vscode.Uri,
    private readonly panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.nasmWorkbench',
      `NASM Workbench · ${path.basename(uri.fsPath)}`,
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    )
  ) {
    panel.webview.html = this.html();
    panel.webview.onDidReceiveMessage((value) => this.receive(value), undefined, context.subscriptions);
    panel.onDidDispose(() => this.dispose(), undefined, context.subscriptions);
  }

  dispose(): void {
    NasmWorkbenchPanel.panels.delete(this.uri.toString());
    void this.debug?.session.close();
    this.debug = undefined;
  }

  private async receive(value: unknown): Promise<void> {
    const request = parseMessage(value);
    if (!request) return;
    if (!vscode.workspace.isTrusted && !['open-source', 'open-guide'].includes(request.type)) {
      await vscode.window.showWarningMessage('Trust this workspace before assembling or executing code.');
      return;
    }
    try {
      switch (request.type) {
        case 'prepare':
          await this.busy('Preparing the NASM environment', async () => { await this.manager.prepare(); });
          await this.refreshEnvironment();
          break;
        case 'build-run':
          await this.busy('Building and running actual NASM code', async () => {
            const result = await this.manager.buildAndRun(this.uri);
            this.post({
              type: 'run-result',
              runtime: result.runtime,
              code: result.execution.code,
              timedOut: result.execution.timedOut,
              stdout: result.execution.stdout,
              stderr: result.execution.stderr
            });
          });
          break;
        case 'start-debug':
          await this.busy('Starting the actual GDB workbench', async () => {
            await this.debug?.session.close();
            this.debug = await this.manager.startDebug(this.uri);
            this.post({ type: 'snapshot', runtime: this.debug.build.runtime, snapshot: await this.debug.session.snapshot() });
          });
          break;
        case 'step':
          await this.withDebug(async (debug) => this.post({ type: 'snapshot', runtime: debug.build.runtime, snapshot: await debug.session.stepInstruction() }));
          break;
        case 'continue':
          await this.withDebug(async (debug) => this.post({ type: 'snapshot', runtime: debug.build.runtime, snapshot: await debug.session.continueTo(request.breakpoint) }));
          break;
        case 'inspect-memory':
          await this.withDebug(async (debug) => this.post({ type: 'snapshot', runtime: debug.build.runtime, snapshot: await debug.session.snapshot(request.expression) }));
          break;
        case 'open-source':
          await vscode.window.showTextDocument(this.uri, { preview: false, viewColumn: vscode.ViewColumn.One });
          break;
        case 'open-guide':
          await vscode.commands.executeCommand('systemstudioCis310.openNasmGuide');
          break;
        case 'ask-tutor':
          await vscode.commands.executeCommand('systemstudioCis310.openAiTutor', { nasmWorkbenchSource: path.basename(this.uri.fsPath) });
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.post({ type: 'error', message });
      await vscode.window.showErrorMessage(`NASM Workbench: ${message}`);
    }
  }

  private async refreshEnvironment(): Promise<void> {
    const status = await this.manager.status();
    this.post({ type: 'environment', status });
  }

  private async withDebug(action: (debug: NasmDebugHandle) => Promise<void>): Promise<void> {
    if (!this.debug) throw new Error('Select “Start or restart debugger” first.');
    await this.busy('Inspecting actual machine state', () => action(this.debug!));
  }

  private async busy(title: string, action: () => Promise<void>): Promise<void> {
    this.post({ type: 'busy', value: true, title });
    try {
      await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title, cancellable: false }, action);
    } finally {
      this.post({ type: 'busy', value: false });
    }
  }

  private post(message: unknown): void {
    void this.panel.webview.postMessage(message);
  }

  private html(): string {
    return buildNasmWorkbenchHtmlForTesting(path.basename(this.uri.fsPath));
  }
}

export function buildNasmWorkbenchHtmlForTesting(filename = 'RegisterArithmetic.asm'): string {
    const nonce = randomNonce();
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<title>NASM Workbench</title><style nonce="${nonce}">
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}button,input{font:inherit}button{cursor:pointer;padding:7px 11px;border:1px solid var(--vscode-button-border,transparent);border-radius:3px;color:var(--vscode-button-foreground);background:var(--vscode-button-background)}button:hover{background:var(--vscode-button-hoverBackground)}button.secondary{color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}button:disabled{opacity:.55;cursor:not-allowed}input{min-width:170px;padding:6px;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border)}header{padding:18px 22px;border-bottom:1px solid var(--vscode-panel-border);background:var(--vscode-sideBar-background)}h1{font-size:1.45rem;margin:0 0 5px}.subtitle,.muted{color:var(--vscode-descriptionForeground)}main{padding:18px 22px;display:grid;gap:16px}.boundary,.status,.error{padding:11px 13px;border-left:4px solid var(--vscode-focusBorder);background:var(--vscode-textBlockQuote-background)}.error{border-color:var(--vscode-testing-iconFailed);color:var(--vscode-errorForeground)}.toolbar,.field-row{display:flex;flex-wrap:wrap;gap:8px;align-items:end}.field{display:grid;gap:4px}.field label{font-weight:600}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.card{min-width:0;border:1px solid var(--vscode-panel-border);border-radius:6px;background:var(--vscode-sideBar-background);padding:14px}.wide{grid-column:1/-1}h2{font-size:1.05rem;margin:0 0 10px}table{border-collapse:collapse;width:100%;font-family:var(--vscode-editor-font-family);font-size:.9rem}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--vscode-panel-border);vertical-align:top}th{font-family:var(--vscode-font-family)}tr.current{outline:2px solid var(--vscode-focusBorder);outline-offset:-2px}code,pre{font-family:var(--vscode-editor-font-family)}pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;max-height:240px;overflow:auto}.flag{display:inline-block;margin:2px;padding:3px 7px;border:1px solid var(--vscode-panel-border);border-radius:999px}.empty{font-family:var(--vscode-font-family);color:var(--vscode-descriptionForeground)}#live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media(max-width:850px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style></head><body><header><h1>Actual NASM 32-bit Workbench</h1><div class="subtitle">${escapeHtml(filename)} · assemble → link → run/test → debug → inspect → explain</div></header><main>
<div class="boundary"><strong>Evidence boundary:</strong> this workbench invokes the real NASM assembler and GDB debugger. The separate Instruction Trace Tutor remains optional conceptual practice and is not build evidence. NASM IA-32 code is separate from the course’s 4-bit instructional processor.</div>
<div id="environment" class="status">Checking the assembly environment…</div><div id="error" class="error" hidden></div>
<div class="toolbar"><button id="prepare">Prepare environment</button><button id="source" class="secondary">Open source</button><button id="build">Build and run</button><button id="debug">Start or restart debugger</button><button id="step">Step one instruction</button><button id="tutor" class="secondary">Ask tutor after my attempt</button><button id="guide" class="secondary">Open NASM guide</button></div>
<div class="field-row"><div class="field"><label for="breakpoint">Continue to label/address</label><input id="breakpoint" placeholder="loop_start or *0x08049000"></div><button id="continue">Continue</button><div class="field"><label for="memory">Inspect memory at</label><input id="memory" value="$esp" aria-describedby="memory-help"><span id="memory-help" class="muted">Register, symbol, or hex address</span></div><button id="inspect">Inspect memory</button></div>
<div id="summary" class="status">Start the debugger to inspect actual machine state.</div>
<div class="grid"><section class="card"><h2>Registers</h2><div id="registers" class="empty">No debugger snapshot yet.</div></section><section class="card"><h2>Active EFLAGS</h2><div id="flags" class="empty">No debugger snapshot yet.</div></section><section class="card"><h2>Stack at ESP</h2><div id="stack" class="empty">No debugger snapshot yet.</div></section><section class="card"><h2>Memory watch</h2><div id="memoryView" class="empty">No debugger snapshot yet.</div></section><section class="card wide"><h2>Disassembly at EIP</h2><div id="disassembly" class="empty">No debugger snapshot yet.</div></section><section class="card wide"><h2>Program output and test evidence</h2><pre id="output">No program output yet.</pre></section></div><div id="live" role="status" aria-live="polite"></div>
</main><script nonce="${nonce}">
const vscode=acquireVsCodeApi(),buttons=[...document.querySelectorAll('button')],live=document.getElementById('live'),error=document.getElementById('error');
const post=(type,extra={})=>vscode.postMessage({type,...extra});
document.getElementById('prepare').onclick=()=>post('prepare');document.getElementById('source').onclick=()=>post('open-source');document.getElementById('build').onclick=()=>post('build-run');document.getElementById('debug').onclick=()=>post('start-debug');document.getElementById('step').onclick=()=>post('step');document.getElementById('continue').onclick=()=>post('continue',{breakpoint:document.getElementById('breakpoint').value.trim()||undefined});document.getElementById('inspect').onclick=()=>post('inspect-memory',{expression:document.getElementById('memory').value.trim()||'$esp'});document.getElementById('guide').onclick=()=>post('open-guide');document.getElementById('tutor').onclick=()=>post('ask-tutor');
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const table=(headers,rows)=>rows.length?'<table><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>':'<div class="empty">No values are available at the current program state.</div>';
function memory(rows){return table(['Address','Values'],rows.map(row=>'<tr><th scope="row">'+esc(row.address)+'</th><td>'+row.values.map(esc).join(' · ')+'</td></tr>'))}
function snapshot(s,runtime){document.getElementById('summary').innerHTML='<strong>'+esc(s.stopReason)+'</strong> · '+esc(s.sourceLocation)+' · '+esc(runtime);document.getElementById('registers').innerHTML=table(['Register','Hex','Unsigned'],s.registers.map(reg=>'<tr><th scope="row">'+esc(reg.name)+'</th><td>'+esc(reg.hex)+'</td><td>'+esc(reg.unsigned)+'</td></tr>'));document.getElementById('flags').innerHTML=s.flags.length?s.flags.map(flag=>'<span class="flag">'+esc(flag)+'</span>').join(''):'<div class="empty">No active named flags were reported.</div>';document.getElementById('stack').innerHTML=memory(s.stack);document.getElementById('memoryView').innerHTML=memory(s.memory);document.getElementById('disassembly').innerHTML=table(['Current','Address','Symbol','Instruction'],s.disassembly.map(ins=>'<tr class="'+(ins.current?'current':'')+'"><td>'+(ins.current?'Current instruction':'')+'</td><th scope="row">'+esc(ins.address)+'</th><td>'+esc(ins.symbol||'')+'</td><td>'+esc(ins.instruction)+'</td></tr>'));document.getElementById('output').textContent=s.programOutput||'The program has not written output.';live.textContent=s.stopReason}
window.addEventListener('message',event=>{const m=event.data;if(m.type==='busy'){buttons.forEach(b=>b.disabled=Boolean(m.value));if(m.value)live.textContent=m.title||'Working';return}if(m.type==='environment'){document.getElementById('environment').innerHTML='<strong>Environment:</strong> '+esc(m.status.detail);return}if(m.type==='error'){error.hidden=false;error.textContent=m.message;live.textContent='Error: '+m.message;return}error.hidden=true;if(m.type==='snapshot')snapshot(m.snapshot,m.runtime);if(m.type==='run-result'){document.getElementById('summary').innerHTML='<strong>Actual executable finished</strong> · '+esc(m.runtime)+' · exit '+esc(m.code)+(m.timedOut?' · timed out':'');document.getElementById('output').textContent=[m.stdout,m.stderr].filter(Boolean).join('\\n')||'The program produced no text output.';live.textContent='Build and run finished with exit code '+m.code}});
</script></body></html>`;
}

function parseMessage(value: unknown): WorkbenchMessage | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  switch (record.type) {
    case 'prepare': case 'build-run': case 'start-debug': case 'step': case 'open-source': case 'open-guide': case 'ask-tutor':
      return { type: record.type };
    case 'continue':
      return { type: 'continue', breakpoint: typeof record.breakpoint === 'string' ? record.breakpoint : undefined };
    case 'inspect-memory':
      return { type: 'inspect-memory', expression: typeof record.expression === 'string' ? record.expression : undefined };
    default: return undefined;
  }
}

function randomNonce(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
