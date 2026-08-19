import * as path from 'node:path';
import * as vscode from 'vscode';
import type { DigitalManager } from './digitalManager';

export class DigitalTestController implements vscode.Disposable {
  private readonly controller: vscode.TestController;
  private readonly watcher: vscode.FileSystemWatcher;

  constructor(private readonly manager: DigitalManager) {
    this.controller = vscode.tests.createTestController(
      'systemstudioCis310.digitalTests',
      'SystemStudio Digital Circuits'
    );
    this.controller.createRunProfile(
      'Run Digital tests',
      vscode.TestRunProfileKind.Run,
      (request, token) => this.run(request, token),
      true
    );
    this.watcher = vscode.workspace.createFileSystemWatcher('**/*.dig');
    this.watcher.onDidCreate(() => void this.refresh());
    this.watcher.onDidChange(() => void this.refresh());
    this.watcher.onDidDelete((uri) => this.controller.items.delete(uri.toString()));
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const files = await vscode.workspace.findFiles('**/*.dig', '**/{.git,node_modules}/**', 300);
    const items: vscode.TestItem[] = [];
    for (const uri of files) {
      if (uri.scheme !== 'file') {
        continue;
      }
      try {
        if (!(await this.manager.containsEmbeddedTests(uri.fsPath))) {
          continue;
        }
      } catch {
        continue;
      }
      const item = this.controller.createTestItem(uri.toString(), path.basename(uri.fsPath), uri);
      item.description = vscode.workspace.asRelativePath(uri, false);
      items.push(item);
    }
    this.controller.items.replace(items);
  }

  private async run(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
    const run = this.controller.createTestRun(request);
    const excluded = new Set((request.exclude ?? []).map((item) => item.id));
    const selected = request.include ?? Array.from(iterateItems(this.controller.items));

    for (const item of selected) {
      if (token.isCancellationRequested || excluded.has(item.id) || !item.uri) {
        continue;
      }
      run.started(item);
      try {
        requireTrustedWorkspace();
        const result = await this.manager.runTests(item.uri.fsPath, token);
        run.appendOutput(`${result.output.replaceAll('\n', '\r\n')}\r\n`, undefined, item);
        if (result.passed) {
          run.passed(item);
        } else {
          run.failed(item, new vscode.TestMessage(result.output));
        }
      } catch (error) {
        run.errored(item, new vscode.TestMessage(errorMessage(error)));
      }
    }
    run.end();
  }

  dispose(): void {
    this.watcher.dispose();
    this.controller.dispose();
  }
}

function* iterateItems(collection: vscode.TestItemCollection): Iterable<vscode.TestItem> {
  const items: vscode.TestItem[] = [];
  collection.forEach((item) => items.push(item));
  yield* items;
}

function requireTrustedWorkspace(): void {
  if (!vscode.workspace.isTrusted) {
    throw new Error('Trust this workspace before running Digital circuit tests.');
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
