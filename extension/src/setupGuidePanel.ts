import { readFile } from 'node:fs/promises';
import * as vscode from 'vscode';

export class SetupGuidePanel {
  private static current: vscode.WebviewPanel | undefined;

  static async show(context: vscode.ExtensionContext): Promise<void> {
    if (this.current) {
      this.current.reveal(vscode.ViewColumn.One, false);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.setupGuide',
      'CIS 310 · Setup and First Tasks',
      vscode.ViewColumn.One,
      { enableScripts: false }
    );
    this.current = panel;
    panel.webview.html = await readFile(vscode.Uri.joinPath(context.extensionUri, 'GETTING_STARTED.html').fsPath, 'utf8');
    panel.onDidDispose(() => { if (this.current === panel) this.current = undefined; });
  }
}
