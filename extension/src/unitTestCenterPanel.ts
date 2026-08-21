import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';

type UnitTestAction = 'testing-view' | 'digital-current' | 'nasm-current' | 'preflights' | 'environment' | 'create-lab';

export class UnitTestCenterPanel {
  private static current: vscode.WebviewPanel | undefined;

  static show(): void {
    if (this.current) {
      this.current.reveal(vscode.ViewColumn.One, false);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.unitTestCenter',
      'CIS 310 · Student Unit Test Center',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.current = panel;
    panel.webview.html = unitTestHtml();
    panel.onDidDispose(() => { if (this.current === panel) this.current = undefined; });
    panel.webview.onDidReceiveMessage(async (value: unknown) => {
      const action = parseAction(value);
      if (!action) return;
      const commands: Record<UnitTestAction, string> = {
        'testing-view': 'workbench.view.testing.focus',
        'digital-current': 'systemstudioCis310.testCircuit',
        'nasm-current': 'systemstudioCis310.buildRunAssembly',
        preflights: 'systemstudioCis310.openCourseworkCenter',
        environment: 'systemstudioCis310.checkEnvironment',
        'create-lab': 'systemstudioCis310.createAssemblyLab'
      };
      await vscode.commands.executeCommand(commands[action]);
    });
  }
}

function parseAction(value: unknown): UnitTestAction | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const action = (value as { action?: unknown }).action;
  return typeof action === 'string' && [
    'testing-view', 'digital-current', 'nasm-current', 'preflights', 'environment', 'create-lab'
  ].includes(action) ? action as UnitTestAction : undefined;
}

function unitTestHtml(): string {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'nonce-${nonce}';script-src 'nonce-${nonce}';"><title>CIS 310 Student Unit Test Center</title><style nonce="${nonce}">
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font:1rem/1.55 var(--vscode-font-family)}main{width:min(100% - 2rem,82ch);margin:auto;padding:24px 0 50px}.boundary{border-left:5px solid var(--vscode-testing-iconPassed);padding:12px 15px;background:var(--vscode-editorWidget-background)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:20px}.card{border:1px solid var(--vscode-panel-border);border-radius:8px;padding:16px;background:var(--vscode-sideBar-background)}h2{font-size:1.15rem}.steps{padding-left:1.3rem}button{min-height:42px;border:0;border-radius:4px;padding:8px 12px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);font:inherit;cursor:pointer}button.secondary{color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}button:focus-visible{outline:3px solid var(--vscode-focusBorder);outline-offset:2px}@media(max-width:42rem){.grid{grid-template-columns:1fr}}
</style></head><body><main><h1>Student Unit Test Center</h1><p class="boundary"><strong>Private formative evidence:</strong> these tests run on this device and do not submit, grade, or certify an assignment. Canvas and instructor evaluation remain official. A passing public contract is a starting point; add boundary and failure-case tests of your own.</p><section class="grid">
<article class="card"><h2>Digital embedded tests</h2><p>Digital’s own <code>Testcase</code> components are discovered from every <code>.dig</code> file in the workspace. Use VS Code’s Testing view to run one or all suites with pass/fail evidence.</p><button data-action="testing-view">Open Testing view</button></article>
<article class="card"><h2>Current Digital circuit</h2><p>Run the upstream Digital CLI against the active or selected <code>.dig</code> file. The file must contain an embedded Testcase component.</p><button data-action="digital-current">Test current circuit</button></article>
<article class="card"><h2>Assignment public contracts</h2><p>Mission Control contains the published register, PC, instruction-register/memory, data-memory, register-file, ALU, and integrated-processor preflights. Choose your file; expected and observed values are retained as evidence.</p><button data-action="preflights">Open assignment preflights</button></article>
<article class="card"><h2>NASM self-tests</h2><p>Files named <code>*.test.asm</code> appear in the Testing view. They are assembled and linked as actual ELF32 programs; exit code 0 passes and any other code fails. The starter workspace includes an example.</p><button data-action="testing-view">Open NASM tests</button> <button class="secondary" data-action="nasm-current">Build/run current ASM</button></article>
<article class="card"><h2>Portable toolchain check</h2><p>Verify pinned Digital, Java or the Digital container path, and workspace trust. The NASM workbench reports its actual native or course-container runtime separately.</p><button data-action="environment">Check environment</button></article>
<article class="card"><h2>Create a testable assembly lab</h2><p>Create the NASM workspace with runnable examples, a <code>StudentUnitTest.test.asm</code> template, workbench guidance, and the real toolchain boundary.</p><button data-action="create-lab">Create NASM lab</button></article>
</section><h2>Recommended test loop</h2><ol class="steps"><li>Predict the result and write one normal case plus one boundary/failure case.</li><li>Run the smallest relevant test and fix the earliest mismatch.</li><li>Record expected versus observed evidence.</li><li>Run the full public suite, then review the current Canvas rubric before submitting.</li></ol></main><script nonce="${nonce}">const vscode=acquireVsCodeApi();document.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(button)vscode.postMessage({action:button.dataset.action})});</script></body></html>`;
}
