import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import { DIGITAL_RELEASE } from './core/digitalRelease';
import type { DigitalManager } from './digitalManager';

export class CircuitPreviewProvider implements vscode.CustomTextEditorProvider {
  static readonly viewType = 'systemstudioCis310.circuitPreview';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly manager: DigitalManager
  ) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.globalStorageUri]
    };
    let lastResult = '';
    let updateSequence = 0;

    const render = async (): Promise<void> => {
      const sequence = ++updateSequence;
      panel.webview.html = this.loadingHtml(panel.webview, document.fileName);

      if (!vscode.workspace.isTrusted) {
        panel.webview.html = this.messageHtml(
          panel.webview,
          document.fileName,
          'Workspace trust required',
          'SystemStudio will not execute Digital or parse the circuit until this workspace is trusted.',
          'refresh',
          'Try again'
        );
        return;
      }

      const status = await this.manager.getStatus();
      if (!status.integrityVerified) {
        panel.webview.html = this.messageHtml(
          panel.webview,
          document.fileName,
          `Digital ${DIGITAL_RELEASE.displayVersion} is not installed`,
          'Install the pinned, checksum-verified release into VS Code extension storage.',
          'install',
          'Install Digital'
        );
        return;
      }
      if (!status.java.supported) {
        panel.webview.html = this.messageHtml(
          panel.webview,
          document.fileName,
          'Java is not ready',
          status.java.detail || 'Install Java 8 or newer, or configure the Java executable path.',
          'checkEnvironment',
          'Check environment'
        );
        return;
      }
      if (document.isDirty) {
        panel.webview.html = this.messageHtml(
          panel.webview,
          document.fileName,
          'Save before previewing',
          'Digital exports the SVG from the saved .dig file.',
          'refresh',
          'Refresh after saving'
        );
        return;
      }

      try {
        const svgPath = await this.manager.exportSvg(document.uri.fsPath);
        if (sequence !== updateSequence) {
          return;
        }
        const svgUri = panel.webview.asWebviewUri(vscode.Uri.file(svgPath));
        panel.webview.html = this.previewHtml(panel.webview, document.fileName, svgUri, lastResult);
      } catch (error) {
        if (sequence !== updateSequence) {
          return;
        }
        panel.webview.html = this.messageHtml(
          panel.webview,
          document.fileName,
          'Preview failed',
          errorMessage(error),
          'refresh',
          'Retry'
        );
      }
    };
    let refreshTimer: NodeJS.Timeout | undefined;
    const scheduleRender = (): void => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      refreshTimer = setTimeout(() => void render(), 250);
    };

    const documentChange = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.toString() === document.uri.toString()) {
        scheduleRender();
      }
    });
    const documentSave = vscode.workspace.onDidSaveTextDocument((saved) => {
      if (saved.uri.toString() === document.uri.toString()) {
        void render();
      }
    });
    const messages = panel.webview.onDidReceiveMessage(async (message: unknown) => {
      const action = isWebviewMessage(message) ? message.action : undefined;
      switch (action) {
        case 'install':
          await vscode.commands.executeCommand('systemstudioCis310.setupDigital');
          await render();
          break;
        case 'checkEnvironment':
          await vscode.commands.executeCommand('systemstudioCis310.checkEnvironment');
          break;
        case 'openDigital':
          await vscode.commands.executeCommand('systemstudioCis310.openDigital', document.uri);
          break;
        case 'test': {
          try {
            const result = await vscode.window.withProgress(
              { location: vscode.ProgressLocation.Notification, title: 'Running Digital circuit tests', cancellable: true },
              (_progress, token) => this.manager.runTests(document.uri.fsPath, token)
            );
            lastResult = `${result.passed ? 'PASS' : 'FAIL'}\n${result.output}`;
          } catch (error) {
            lastResult = `ERROR\n${errorMessage(error)}`;
          }
          await render();
          break;
        }
        case 'refresh':
          await render();
          break;
      }
    });

    panel.onDidDispose(() => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      documentChange.dispose();
      documentSave.dispose();
      messages.dispose();
    });
    await render();
  }

  private previewHtml(webview: vscode.Webview, fileName: string, svgUri: vscode.Uri, result: string): string {
    const nonce = randomBytes(16).toString('base64');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <style nonce="${nonce}">${styles()}</style>
</head>
<body>
  <header>
    <div><h1>${escapeHtml(baseName(fileName))}</h1><p>Digital ${DIGITAL_RELEASE.displayVersion} · checksum verified</p></div>
    <div class="actions">
      <button data-action="openDigital">Open in Digital</button>
      <button data-action="test">Run tests</button>
      <button data-action="refresh">Refresh</button>
    </div>
  </header>
  <main>
    <section class="canvas"><img src="${svgUri}" alt="Circuit diagram exported by Digital"></section>
    ${result ? `<section class="result"><h2>Latest deterministic test</h2><pre>${escapeHtml(result)}</pre></section>` : ''}
  </main>
  <footer>The native Digital window is used for graphical editing and interactive simulation. This VS Code view provides the integrated preview and test evidence.</footer>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => vscode.postMessage({ action: button.dataset.action })));
  </script>
</body>
</html>`;
  }

  private loadingHtml(webview: vscode.Webview, fileName: string): string {
    return this.messageHtml(webview, fileName, 'Preparing circuit preview…', 'Running Digital’s deterministic SVG exporter.');
  }

  private messageHtml(
    webview: vscode.Webview,
    fileName: string,
    title: string,
    detail: string,
    action?: string,
    actionLabel?: string
  ): string {
    const nonce = randomBytes(16).toString('base64');
    return `<!doctype html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <style nonce="${nonce}">${styles()}</style>
</head><body>
  <main class="message"><p class="eyebrow">${escapeHtml(baseName(fileName))}</p><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(detail)}</pre>
  ${action && actionLabel ? `<button id="action">${escapeHtml(actionLabel)}</button>` : ''}</main>
  ${action ? `<script nonce="${nonce}">const vscode=acquireVsCodeApi();document.getElementById('action')?.addEventListener('click',()=>vscode.postMessage({action:${JSON.stringify(action)}}));</script>` : ''}
</body></html>`;
  }
}

function styles(): string {
  return `
    :root { color-scheme: light dark; }
    body { padding: 0; margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); }
    header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--vscode-panel-border); }
    h1 { margin: 0; font-size: 1.25rem; } h2 { font-size: 1rem; } p { margin: .25rem 0 0; color: var(--vscode-descriptionForeground); }
    .actions { display: flex; flex-wrap: wrap; gap: .5rem; }
    button { color: var(--vscode-button-foreground); background: var(--vscode-button-background); border: 0; padding: .45rem .8rem; cursor: pointer; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    main { padding: 1rem; } .canvas { overflow: auto; min-height: 280px; background: white; border: 1px solid var(--vscode-panel-border); }
    .canvas img { display: block; max-width: none; min-width: 100%; height: auto; }
    .result { margin-top: 1rem; } pre { white-space: pre-wrap; overflow-wrap: anywhere; padding: .75rem; background: var(--vscode-textCodeBlock-background); }
    footer { padding: .75rem 1.25rem; border-top: 1px solid var(--vscode-panel-border); color: var(--vscode-descriptionForeground); }
    .message { max-width: 760px; margin: 8vh auto; } .message button { margin-top: .75rem; } .eyebrow { text-transform: uppercase; letter-spacing: .08em; }
  `;
}

function baseName(fileName: string): string {
  const parts = fileName.split(/[\\/]/);
  return parts[parts.length - 1] ?? fileName;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isWebviewMessage(value: unknown): value is { action: string } {
  return typeof value === 'object' && value !== null && 'action' in value && typeof (value as { action?: unknown }).action === 'string';
}
