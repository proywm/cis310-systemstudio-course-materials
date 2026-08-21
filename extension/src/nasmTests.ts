import * as path from 'node:path';
import * as vscode from 'vscode';
import type { NativeAssemblyManager } from './nativeAssemblyManager';

/** Discovers self-checking *.test.asm programs and runs actual assembled IA-32 code. */
export class NasmTestController implements vscode.Disposable {
  private readonly controller: vscode.TestController;
  private readonly watcher: vscode.FileSystemWatcher;

  constructor(private readonly manager: NativeAssemblyManager) {
    this.controller = vscode.tests.createTestController(
      'systemstudioCis310.nasmTests',
      'SystemStudio NASM Self-Tests'
    );
    this.controller.createRunProfile(
      'Assemble, link, and run NASM self-tests',
      vscode.TestRunProfileKind.Run,
      (request, token) => this.run(request, token),
      true
    );
    this.watcher = vscode.workspace.createFileSystemWatcher('**/*.test.asm');
    this.watcher.onDidCreate(() => void this.refresh());
    this.watcher.onDidChange(() => void this.refresh());
    this.watcher.onDidDelete((uri) => this.controller.items.delete(uri.toString()));
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const files = await vscode.workspace.findFiles('**/*.test.asm', '**/{.git,node_modules}/**', 300);
    this.controller.items.replace(files.filter((uri) => uri.scheme === 'file').map((uri) => {
      const item = this.controller.createTestItem(uri.toString(), path.basename(uri.fsPath), uri);
      item.description = vscode.workspace.asRelativePath(uri, false);
      return item;
    }));
  }

  private async run(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
    const run = this.controller.createTestRun(request);
    const excluded = new Set((request.exclude ?? []).map((item) => item.id));
    const selected = request.include ?? collectionItems(this.controller.items);
    for (const item of selected) {
      if (token.isCancellationRequested || excluded.has(item.id) || !item.uri) continue;
      run.started(item);
      try {
        if (!vscode.workspace.isTrusted) throw new Error('Trust this workspace before running NASM self-tests.');
        const result = await this.manager.buildAndRun(item.uri);
        const evidence = [
          `Runtime: ${result.runtime}`,
          `Assembler exit: ${result.assembler.code}`,
          `Linker exit: ${result.linker.code}`,
          `Program exit: ${result.execution.code}`,
          result.execution.stdout,
          result.execution.stderr
        ].filter(Boolean).join('\r\n');
        run.appendOutput(`${evidence}\r\n`, undefined, item);
        if (!result.execution.timedOut && result.execution.code === 0) run.passed(item);
        else run.failed(item, new vscode.TestMessage(`Self-test returned ${result.execution.code}${result.execution.timedOut ? ' after timing out' : ''}.`));
      } catch (error) {
        run.errored(item, new vscode.TestMessage(error instanceof Error ? error.message : String(error)));
      }
    }
    run.end();
  }

  dispose(): void {
    this.watcher.dispose();
    this.controller.dispose();
  }
}

function collectionItems(collection: vscode.TestItemCollection): vscode.TestItem[] {
  const items: vscode.TestItem[] = [];
  collection.forEach((item) => items.push(item));
  return items;
}
