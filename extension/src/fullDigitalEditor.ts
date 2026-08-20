import { randomBytes } from 'node:crypto';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { DigitalManager } from './digitalManager';
import type { FullDigitalRuntime, FullDigitalSession } from './fullDigitalRuntime';

type EnsureDigital = () => Promise<boolean>;

export class FullDigitalEditorProvider implements vscode.CustomTextEditorProvider {
  static readonly viewType = 'systemstudioCis310.fullDigitalEditor';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly manager: DigitalManager,
    private readonly runtime: FullDigitalRuntime,
    private readonly ensureDigital: EnsureDigital,
    private readonly output: vscode.OutputChannel
  ) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    panel.onDidDispose(() => {
      void this.runtime.disposeSession(document.uri.fsPath);
    });
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'novnc')]
    };
    panel.webview.onDidReceiveMessage(async (message: unknown) => {
      const action = webviewAction(message);
      if (action === 'stop') {
        await this.runtime.disposeSession(document.uri.fsPath);
        panel.webview.html = messageHtml(
          panel.webview,
          'Full Digital stopped',
          'Reopen this .dig file to start a new simulator session.'
        );
      } else if (action === 'native') {
        await this.runtime.disposeSession(document.uri.fsPath);
        await this.openNative(document.uri, panel);
      }
    });
    panel.webview.html = messageHtml(
      panel.webview,
      'Starting Full Digital…',
      'The extension is opening the unmodified upstream Digital application.'
    );

    if (!vscode.workspace.isTrusted) {
      panel.webview.html = messageHtml(
        panel.webview,
        'Workspace trust required',
        'Trust this workspace before an external simulator can read or write the circuit.'
      );
      return;
    }
    if (!(await this.ensureDigital())) {
      panel.webview.html = messageHtml(
        panel.webview,
        'Digital is not ready',
        'Run “CIS 310: Install/Verify Digital Simulator” and reopen this file.'
      );
      return;
    }

    if (!this.runtime.supported) {
      await this.openNative(document.uri, panel);
      return;
    }

    try {
      const session = await this.runtime.open(document.uri.fsPath);
      panel.webview.html = desktopHtml(this.context, panel.webview, session);
    } catch (error) {
      const detail = errorText(error);
      this.output.appendLine(`Full Digital editor failed: ${detail}`);
      panel.webview.html = messageHtml(panel.webview, 'Embedded Full Digital could not start', detail, true);
      await vscode.window.showErrorMessage(`Full Digital could not start: ${detail}`);
    }
  }

  private async openNative(uri: vscode.Uri, panel: vscode.WebviewPanel): Promise<void> {
    try {
      await this.manager.launch(uri.fsPath);
      panel.webview.html = messageHtml(
        panel.webview,
        'Full Digital opened in its native window',
        `The unmodified Digital application is editing ${path.basename(uri.fsPath)}. Return here after saving in Digital.`
      );
    } catch (error) {
      panel.webview.html = messageHtml(panel.webview, 'Full Digital could not start', errorText(error));
    }
  }
}

function desktopHtml(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  session: FullDigitalSession
): string {
  const nonce = randomBytes(16).toString('base64');
  const rfbUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'vendor', 'novnc', 'core', 'rfb.js')
  );
  const websocket = JSON.stringify(session.websocketUri.toString(true));
  const nativeButton = canOpenNativeWindow()
    ? '<button id="native" title="Stop the streamed session and open upstream Digital on this host display">Native window</button>'
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'nonce-${nonce}'; script-src ${webview.cspSource} 'nonce-${nonce}'; connect-src ${session.websocketUri.scheme}://${session.websocketUri.authority}; font-src ${webview.cspSource};">
  <title>Full Digital Simulator</title>
  <style nonce="${nonce}">
    :root { color-scheme: light dark; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #202020; font-family: var(--vscode-font-family); }
    body { display: grid; grid-template-rows: auto 1fr; position: relative; }
    header { min-height: 34px; display: flex; align-items: center; gap: 8px; padding: 5px 9px; color: var(--vscode-foreground); background: var(--vscode-editor-background); border-bottom: 1px solid var(--vscode-panel-border); }
    #status { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    button { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: 0; border-radius: 2px; padding: 5px 9px; cursor: pointer; }
    button:hover { background: var(--vscode-button-secondaryHoverBackground); }
    #screen { min-width: 0; min-height: 0; overflow: hidden; background: #202020; }
    #screen:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: -2px; }
    #accessibility-note { position: absolute; z-index: 3; top: 48px; right: 12px; width: min(520px, calc(100% - 48px)); padding: 16px; color: var(--vscode-foreground); background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); box-shadow: 0 8px 24px #0008; }
    #accessibility-note[hidden] { display: none; }
    #accessibility-note h2 { margin: 0 0 8px; font-size: 1rem; }
    #accessibility-note p { line-height: 1.45; }
  </style>
</head>
<body>
  <header>
    <strong>Full Digital · ${session.transport === 'docker' ? 'embedded container' : escapeHtml(session.display)}</strong>
    <span id="status" role="status">Connecting to the unmodified Digital application…</span>
    <button id="accessibility" aria-expanded="false" aria-controls="accessibility-note">Accessibility</button>
    ${nativeButton}
    <button id="cad" title="Send Ctrl+Alt+Delete">Ctrl+Alt+Del</button>
    <button id="stop" title="Stop this Digital process and private display">Stop</button>
  </header>
  <div id="screen" tabindex="0" role="application" aria-label="Streamed graphical desktop for the Full Digital simulator" aria-describedby="accessibility-note"></div>
  <aside id="accessibility-note" role="note" hidden>
    <h2>Accessibility boundary</h2>
    <p>This is Digital’s real Swing desktop transported as a graphical canvas. Keyboard and pointer input are forwarded, but component-level Swing semantics are not exposed to a VS Code screen reader. Do not rely on this view as a screen-reader-equivalent circuit editor. Ask the instructor for an accessible alternative and evaluate native desktop Digital with your platform’s assistive technology.</p>
    <button id="close-accessibility">Close</button>
  </aside>
  <script type="module" nonce="${nonce}">
    import RFB from ${JSON.stringify(rfbUri.toString(true))};
    const vscode = acquireVsCodeApi();
    const target = document.getElementById('screen');
    const status = document.getElementById('status');
    let rfb;
    const connect = () => {
      status.textContent = 'Connecting to the unmodified Digital application…';
      rfb = new RFB(target, ${websocket}, { shared: true });
      rfb.scaleViewport = true;
      rfb.resizeSession = false;
      rfb.showDotCursor = true;
      rfb.focusOnClick = true;
      rfb.background = '#202020';
      rfb.addEventListener('connect', () => {
        status.textContent = 'Connected — all menus, components, simulation controls, and dialogs are upstream Digital';
        target.focus();
      });
      rfb.addEventListener('disconnect', event => {
        status.textContent = event.detail.clean ? 'Digital session closed.' : 'Connection lost. Reopen the file to reconnect.';
      });
      rfb.addEventListener('securityfailure', event => {
        status.textContent = 'VNC security negotiation failed: ' + (event.detail.reason || event.detail.status);
      });
      rfb.addEventListener('credentialsrequired', () => rfb.sendCredentials({ password: '' }));
    };
    document.getElementById('cad').addEventListener('click', () => rfb && rfb.sendCtrlAltDel());
    document.getElementById('stop').addEventListener('click', () => vscode.postMessage({ action: 'stop' }));
    document.getElementById('native')?.addEventListener('click', () => vscode.postMessage({ action: 'native' }));
    const accessibilityButton = document.getElementById('accessibility');
    const accessibilityNote = document.getElementById('accessibility-note');
    const setAccessibilityOpen = open => {
      accessibilityNote.hidden = !open;
      accessibilityButton.setAttribute('aria-expanded', String(open));
      if (open) document.getElementById('close-accessibility').focus();
      else accessibilityButton.focus();
    };
    accessibilityButton.addEventListener('click', () => setAccessibilityOpen(accessibilityNote.hidden));
    document.getElementById('close-accessibility').addEventListener('click', () => setAccessibilityOpen(false));
    connect();
  </script>
</body>
</html>`;
}

function messageHtml(webview: vscode.Webview, title: string, detail: string, offerNativeFallback = false): string {
  const nonce = randomBytes(16).toString('base64');
  const button = offerNativeFallback && canOpenNativeWindow()
    ? '<button id="native">Open native Digital instead</button>'
    : '';
  const script = button
    ? `<script nonce="${nonce}">const vscode=acquireVsCodeApi();document.getElementById('native').addEventListener('click',()=>vscode.postMessage({action:'native'}));</script>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';"><style nonce="${nonce}">body{padding:28px;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}h1{font-size:1.35rem}p{line-height:1.55;max-width:760px;color:var(--vscode-descriptionForeground)}button{font:inherit;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;border-radius:3px;padding:8px 12px;cursor:pointer}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p>${button}${script}</body></html>`;
}

function webviewAction(message: unknown): 'stop' | 'native' | undefined {
  if (!message || typeof message !== 'object') return undefined;
  const action = (message as { action?: unknown }).action;
  return action === 'stop' || action === 'native' ? action : undefined;
}

function canOpenNativeWindow(): boolean {
  return process.platform === 'win32' || process.platform === 'darwin' || Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
