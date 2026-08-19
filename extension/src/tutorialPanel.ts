import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import {
  parseTutorialRequest,
  resumeTutorialStep,
  TUTORIAL_STEP_IDS,
  tutorialProgress,
  type TutorialAction,
  type TutorialProgress
} from './core/tutorial';

const PROGRESS_KEY = 'guidedTutorial.progress';
const WALKTHROUGH_ID = 'probir-roy.systemstudio-cis310#systemstudioCis310.gettingStarted';

export class TutorialPanel implements vscode.Disposable {
  private static current: TutorialPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private step: number;

  static async show(context: vscode.ExtensionContext, restart = false): Promise<void> {
    const saved = context.globalState.get<TutorialProgress>(PROGRESS_KEY);
    const initialStep = restart ? 0 : resumeTutorialStep(saved);
    if (TutorialPanel.current) {
      TutorialPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      if (restart) await TutorialPanel.current.restart();
      return;
    }
    TutorialPanel.current = new TutorialPanel(context, initialStep);
    await context.globalState.update(PROGRESS_KEY, tutorialProgress('in-progress', initialStep));
  }

  static async promptOnFirstRun(context: vscode.ExtensionContext): Promise<boolean> {
    if (context.extensionMode !== vscode.ExtensionMode.Production) return false;
    if (context.globalState.get<TutorialProgress>(PROGRESS_KEY)) return false;
    const action = await vscode.window.showInformationMessage(
      'Welcome to Fall 2026 CIS 310. Start the clickable tour of Canvas, bundled materials, Digital circuits, embedded assembly, and help?',
      'Start Guided Tutorial',
      'Skip for now'
    );
    if (action === 'Start Guided Tutorial') {
      await TutorialPanel.show(context, true);
    } else {
      await context.globalState.update(PROGRESS_KEY, tutorialProgress('skipped', 0));
      if (action === 'Skip for now') {
        await vscode.window.showInformationMessage(
          'Tutorial skipped. Run “CIS 310: Start or Rerun Guided Tutorial” whenever you want it.'
        );
      }
    }
    return true;
  }

  static async openNativeWalkthrough(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openWalkthrough', WALKTHROUGH_ID, false);
  }

  private constructor(
    private readonly context: vscode.ExtensionContext,
    initialStep: number
  ) {
    this.step = initialStep;
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.guidedTutorial',
      'SystemStudio CIS 310 Guided Tutorial',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = tutorialHtml(this.panel.webview, initialStep);
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      async (message: unknown) => {
        const request = parseTutorialRequest(message);
        if (!request) return;
        switch (request.type) {
          case 'navigate':
            this.step = request.step;
            await this.context.globalState.update(PROGRESS_KEY, tutorialProgress('in-progress', this.step));
            break;
          case 'action':
            await executeTutorialAction(request.action);
            break;
          case 'restart':
            await this.restart();
            break;
          case 'skip':
            await this.context.globalState.update(PROGRESS_KEY, tutorialProgress('skipped', this.step));
            this.panel.dispose();
            await vscode.window.showInformationMessage(
              'Tutorial skipped. Use the SystemStudio sidebar or Command Palette to run it again.'
            );
            break;
          case 'complete':
            this.step = TUTORIAL_STEP_IDS.length - 1;
            await this.context.globalState.update(PROGRESS_KEY, tutorialProgress('completed', this.step));
            await vscode.window.showInformationMessage(
              'SystemStudio tutorial completed. You can rerun it at any time from the sidebar.'
            );
            break;
        }
      },
      undefined,
      this.disposables
    );
  }

  private readonly panel: vscode.WebviewPanel;

  dispose(): void {
    TutorialPanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }

  private async restart(): Promise<void> {
    this.step = 0;
    await this.context.globalState.update(PROGRESS_KEY, tutorialProgress('in-progress', 0));
    await this.panel.webview.postMessage({ type: 'restart', step: 0 });
  }
}

async function executeTutorialAction(action: TutorialAction): Promise<void> {
  const command: Record<TutorialAction, string> = {
    'show-tools': 'workbench.view.extension.systemstudioCis310',
    'show-materials': 'systemstudioCis310.openMaterialsIndex',
    'open-canvas': 'systemstudioCis310.openCanvas',
    'open-calendar': 'systemstudioCis310.openCourseCalendar',
    'open-syllabus': 'systemstudioCis310.openSyllabus',
    'open-helper': 'systemstudioCis310.openStudentHelper',
    'check-digital': 'systemstudioCis310.checkEnvironment',
    'setup-digital': 'systemstudioCis310.setupDigital',
    'create-circuit': 'systemstudioCis310.createCircuit',
    'create-workspace': 'systemstudioCis310.createStarterWorkspace',
    'create-assembly-lab': 'systemstudioCis310.createAssemblyLab',
    'assembly-guide': 'systemstudioCis310.openMasmGuide',
    'native-walkthrough': 'systemstudioCis310.openGettingStarted'
  };
  await vscode.commands.executeCommand(command[action]);
}

function tutorialHtml(webview: vscode.Webview, initialStep: number): string {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>SystemStudio CIS 310 Guided Tutorial</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); }
    button { font: inherit; }
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto auto 1fr auto; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--vscode-panel-border); }
    h1 { margin: 0; font-size: 1.35rem; }
    .header-actions, .nav { display: flex; flex-wrap: wrap; gap: 8px; }
    .progress-wrap { padding: 14px 24px 0; }
    .progress-label { display: flex; justify-content: space-between; color: var(--vscode-descriptionForeground); font-size: .82rem; margin-bottom: 7px; }
    .progress { height: 7px; border-radius: 999px; overflow: hidden; background: var(--vscode-progressBar-background, var(--vscode-panel-border)); }
    .progress > div { height: 100%; background: var(--vscode-testing-iconPassed); transition: width .2s ease; }
    main { width: min(980px, calc(100% - 48px)); margin: 22px auto; }
    .step { display: none; }
    .step.active { display: block; animation: enter .18s ease-out; }
    @keyframes enter { from { opacity: .35; transform: translateY(5px); } }
    .focus-card { border: 2px solid var(--vscode-focusBorder); border-radius: 8px; padding: 22px; background: var(--vscode-sideBar-background); box-shadow: 0 0 0 4px color-mix(in srgb, var(--vscode-focusBorder) 18%, transparent); }
    h2 { margin: 0 0 8px; font-size: 1.45rem; }
    p { line-height: 1.5; }
    .instruction { border-left: 4px solid var(--vscode-focusBorder); padding: 9px 12px; margin: 17px 0; background: var(--vscode-textBlockQuote-background); }
    .choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-top: 16px; }
    .choice { min-height: 112px; cursor: pointer; text-align: left; padding: 14px; color: var(--vscode-foreground); background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 6px; }
    .choice:hover, .choice:focus-visible { border-color: var(--vscode-focusBorder); outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
    .choice.selected { border-color: var(--vscode-testing-iconPassed); box-shadow: inset 4px 0 var(--vscode-testing-iconPassed); }
    .choice strong, .choice span { display: block; }
    .choice span { color: var(--vscode-descriptionForeground); margin-top: 6px; line-height: 1.35; }
    .choice .checked { color: var(--vscode-testing-iconPassed); font-size: .8rem; margin-top: 9px; }
    .actions { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--vscode-panel-border); display: flex; gap: 9px; flex-wrap: wrap; align-items: center; }
    .primary, .secondary, .quiet { cursor: pointer; border-radius: 3px; padding: 7px 13px; }
    .primary { border: 0; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
    .primary:hover { background: var(--vscode-button-hoverBackground); }
    .secondary { border: 0; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
    .quiet { border: 1px solid var(--vscode-panel-border); color: var(--vscode-foreground); background: transparent; }
    .primary:disabled { cursor: not-allowed; opacity: .5; }
    .status { color: var(--vscode-descriptionForeground); }
    footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 24px; border-top: 1px solid var(--vscode-panel-border); background: var(--vscode-sideBar-background); }
    .completion { text-align: center; padding: 42px 20px; }
    .completion .mark { font-size: 3rem; color: var(--vscode-testing-iconPassed); }
    code { font-family: var(--vscode-editor-font-family); background: var(--vscode-textCodeBlock-background); padding: 1px 4px; }
    @media (prefers-reduced-motion: reduce) { .step.active { animation: none; } .progress > div { transition: none; } }
  </style>
</head>
<body>
<div class="shell">
  <header>
    <div><h1>SystemStudio CIS 310 Guided Tutorial</h1><div class="status">Clickable practice—no telemetry and no automatic installation</div></div>
    <div class="header-actions"><button id="restart" class="quiet">Restart</button><button id="skip" class="quiet">Skip tutorial</button></div>
  </header>
  <div class="progress-wrap">
    <div class="progress-label"><span id="stepLabel"></span><span id="requirement"></span></div>
    <div class="progress" role="progressbar" aria-label="Tutorial progress" aria-valuemin="1" aria-valuemax="8"><div id="progressBar"></div></div>
  </div>
  <main>
    ${tutorialStepsHtml()}
    <section id="completion" class="step completion" aria-labelledby="completeTitle">
      <div class="mark">✓</div><h2 id="completeTitle">You have explored the complete student workflow</h2>
      <p>You can return from the SystemStudio sidebar, the Command Palette, or VS Code’s Getting Started page.</p>
      <div class="actions" style="justify-content:center"><button id="runAgain" class="primary">Run tutorial again</button><button data-action="show-tools" class="secondary">Open SystemStudio tools</button><button data-action="native-walkthrough" class="secondary">Open Getting Started</button></div>
    </section>
  </main>
  <footer id="footer">
    <button id="back" class="secondary">Back</button>
    <div class="nav"><span id="liveStatus" class="status" role="status" aria-live="polite"></span><button id="next" class="primary" disabled>Next</button></div>
  </footer>
</div>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const steps = [...document.querySelectorAll('.step[data-step]')];
  const visited = steps.map(() => new Set());
  let current = ${initialStep};
  const stepLabel = document.getElementById('stepLabel');
  const requirement = document.getElementById('requirement');
  const progressBar = document.getElementById('progressBar');
  const progress = document.querySelector('.progress');
  const next = document.getElementById('next');
  const back = document.getElementById('back');
  const footer = document.getElementById('footer');
  const liveStatus = document.getElementById('liveStatus');
  const completion = document.getElementById('completion');

  function requirementMet(step) {
    const choices = [...step.querySelectorAll('[data-choice]')];
    return step.dataset.require === 'all' ? visited[current].size === choices.length : visited[current].size > 0;
  }
  function render() {
    completion.classList.remove('active');
    footer.hidden = false;
    steps.forEach((step, index) => step.classList.toggle('active', index === current));
    const step = steps[current];
    const choices = [...step.querySelectorAll('[data-choice]')];
    const complete = requirementMet(step);
    choices.forEach(choice => {
      const selected = visited[current].has(choice.dataset.choice);
      choice.classList.toggle('selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
      choice.querySelector('.checked').textContent = selected ? '✓ Reviewed' : 'Click to review';
    });
    stepLabel.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;
    requirement.textContent = step.dataset.require === 'all'
      ? visited[current].size + ' of ' + choices.length + ' choices reviewed'
      : complete ? 'Choice made' : 'Make one choice to continue';
    progressBar.style.width = ((current + 1) / steps.length * 100) + '%';
    progress.setAttribute('aria-valuenow', String(current + 1));
    next.disabled = !complete;
    next.textContent = current === steps.length - 1 ? 'Finish tutorial' : 'Next';
    back.disabled = current === 0;
    liveStatus.textContent = complete ? 'Ready to continue' : 'Review the highlighted choice' + (step.dataset.require === 'all' ? 's' : '');
    vscode.postMessage({ type: 'navigate', step: current });
  }
  document.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]');
    if (choice) {
      const key = choice.dataset.choice;
      if (steps[current].dataset.require === 'single') visited[current].clear();
      visited[current].add(key);
      render();
      return;
    }
    const action = event.target.closest('[data-action]');
    if (action) vscode.postMessage({ type: 'action', action: action.dataset.action });
  });
  next.addEventListener('click', () => {
    if (!requirementMet(steps[current])) return;
    if (current < steps.length - 1) { current += 1; render(); steps[current].querySelector('h2').focus(); }
    else {
      steps[current].classList.remove('active'); footer.hidden = true; completion.classList.add('active');
      stepLabel.textContent = 'Tutorial complete'; requirement.textContent = 'Run it again whenever needed';
      progressBar.style.width = '100%'; vscode.postMessage({ type: 'complete' });
    }
  });
  back.addEventListener('click', () => { if (current > 0) { current -= 1; render(); } });
  document.getElementById('skip').addEventListener('click', () => vscode.postMessage({ type: 'skip' }));
  document.getElementById('restart').addEventListener('click', () => { vscode.postMessage({ type: 'restart' }); });
  document.getElementById('runAgain').addEventListener('click', () => { vscode.postMessage({ type: 'restart' }); });
  window.addEventListener('message', event => {
    if (event.data?.type === 'restart') {
      visited.forEach(set => set.clear()); current = 0; completion.classList.remove('active'); render();
    }
  });
  render();
</script>
</body>
</html>`;
}

function tutorialStepsHtml(): string {
  return `
  <section class="step" data-step="0" data-require="single"><div class="focus-card">
    <h2 tabindex="-1">What are you trying to do today?</h2>
    <p>Start from your task, not from a list of tools. This practice choice does not change configuration.</p>
    <div class="instruction"><strong>Choose one:</strong> the path that best matches your immediate need.</div>
    <div class="choices">
      ${choice('requirements', 'Find requirements or submit', 'Go to the current Fall 2026 Canvas course; SystemStudio never submits for you.')}
      ${choice('circuit', 'Design or debug a circuit', 'Move from a lecture concept to a small circuit, prediction, preview, and test.')}
      ${choice('assembly', 'Write or trace assembly', 'Use the embedded Irvine32/NASM teaching lab without separate compiler setup.')}
      ${choice('confusion', 'I am not sure what is wrong', 'Separate concept, requirement, and environment questions before changing work.')}
    </div>
    <div class="actions"><button data-action="show-tools" class="secondary">Show the real SystemStudio sidebar</button></div>
  </div></section>
  <section class="step" data-step="1" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Know where to learn and where to submit</h2>
    <p>The Fall 2026 workspace separates bundled study references from the authoritative Canvas course.</p>
    <div class="instruction"><strong>Review all six:</strong> this prevents a packaged study reference from being mistaken for a live deadline or submission.</div>
    <div class="choices">
      ${choice('canvas', 'Fall 2026 Canvas', 'Authoritative deadlines, grading rules, required files, announcements, and submission.')}
      ${choice('syllabus', 'Fall 2026 syllabus PDF', 'Active course structure, outcomes, tools, policies, and Canvas-controlled details open as a packaged PDF.')}
      ${choice('calendar', 'Monday/Wednesday calendar', '27 verified regular meetings starting August 26, with holidays and recess identified.')}
      ${choice('presentations', '13 bundled presentations', 'Local, integrity-checked PDFs open inside VS Code without an external document-hosting account.')}
      ${choice('homework', 'Three homework items', 'HW1 Logic Foundations; HW2 Sequential Logic; HW3 Memory and Assembly.')}
      ${choice('projects', 'Three project assignments', 'Registers/DRAM, Register File/ALU, and the integrated processor.')}
    </div>
    <div class="actions"><button data-action="open-canvas" class="primary">Open Fall 2026 Canvas</button><button data-action="open-syllabus" class="secondary">Open syllabus PDF</button><button data-action="open-calendar" class="secondary">Open course calendar</button><button data-action="show-materials" class="secondary">Open bundled material guide</button></div>
  </div></section>
  <section class="step" data-step="2" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Is it my setup or my work?</h2>
    <p>Check the environment before rewriting a circuit. Digital, Java, workspace trust, and local-vs-remote GUI access are separate signals.</p>
    <div class="instruction"><strong>Review all three:</strong> identify the evidence that distinguishes each case.</div>
    <div class="choices">
      ${choice('check', 'Run the environment check', 'Reports Digital checksum, Java version, and workspace trust without changing the machine.')}
      ${choice('install', 'Install or verify Digital', 'After consent, installs the pinned release in extension storage and verifies its checksum.')}
      ${choice('remote', 'Recognize Remote SSH limits', 'Preview/tests work remotely, but the native Digital graphical window needs local desktop VS Code.')}
    </div>
    <div class="actions"><button data-action="check-digital" class="secondary">Try: Check environment</button><button data-action="setup-digital" class="secondary">Try: Install / verify</button></div>
  </div></section>
  <section class="step" data-step="3" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Bridge a concept to a circuit</h2>
    <p>Use smaller, scaffolded practice and an explicit concept-to-implementation loop for homework and projects.</p>
    <div class="instruction"><strong>Review every stage:</strong> each should produce evidence before you continue.</div>
    <div class="choices">
      ${choice('read', 'Read the mapped concept', 'Open the bundled PDF and matching homework/project reference.')}
      ${choice('predict', 'Predict a small behavior', 'Write inputs, expected outputs, states, or transitions before simulating.')}
      ${choice('build', 'Create and build one component', 'Use the assignment button or create a blank `.dig`; existing work is never overwritten.')}
      ${choice('evidence', 'Preview and test', 'Compare visible output or a deterministic testcase with your prediction.')}
      ${choice('integrate', 'Integrate only after it works', 'Keep subcircuits small so an error has a clear location.')}
    </div>
    <div class="actions"><button data-action="show-materials" class="secondary">Open mapped materials</button><button data-action="create-circuit" class="secondary">Create a blank circuit</button></div>
  </div></section>
  <section class="step" data-step="4" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Bridge a concept to assembly</h2>
    <p>The embedded lab uses one consistent source-level IA-32 teaching machine across Windows, macOS, Linux, and Remote SSH.</p>
    <div class="instruction"><strong>Review all four:</strong> profile choice and observable state are part of the learning workflow.</div>
    <div class="choices">
      ${choice('predict', 'Predict register or memory state', 'Write what should change before executing the instruction.')}
      ${choice('auto', 'Auto-detect', 'Select Irvine32 Classroom or NASM IA-32 from the source wrappers.')}
      ${choice('irvine', 'Irvine32 Classroom', 'Use documented MASM-style syntax and selected Irvine procedure contracts.')}
      ${choice('nasm', 'NASM IA-32', 'Use documented NASM-style 32-bit classroom syntax on the same teaching machine.')}
    </div>
    <div class="actions"><button data-action="create-assembly-lab" class="secondary">Try: Create assembly lab</button><button data-action="assembly-guide" class="secondary">Open compatibility guide</button></div>
  </div></section>
  <section class="step" data-step="5" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Inspect evidence, not just “it ran”</h2>
    <p>Use the evidence that fits the task. This is where tool output becomes feedback you can explain.</p>
    <div class="instruction"><strong>Review all five:</strong> identify what each form of evidence can tell you.</div>
    <div class="choices">
      ${choice('truth', 'Truth-table or state row', 'Compare a chosen input/state with the circuit’s observed output/next state.')}
      ${choice('preview', 'Circuit preview', 'Inspect structure inside VS Code, including on Remote SSH.')}
      ${choice('tests', 'Circuit tests', 'Use instructor-approved embedded testcases as repeatable evidence.')}
      ${choice('machine', 'Registers, flags, memory, and stack', 'Step assembly and compare each visible change with your prediction.')}
      ${choice('trace', 'Output, trace, and diagnostics', 'Locate the exact instruction, input, unsupported form, or safety stop.')}
    </div>
  </div></section>
  <section class="step" data-step="6" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Ask for help safely and specifically</h2>
    <p>The local helper supports private help-seeking and routes questions without sending course data to an external AI service.</p>
    <div class="instruction"><strong>Review every prompt:</strong> these turn “I’m stuck” into an answerable question.</div>
    <div class="choices">
      ${choice('expected', 'Expected', 'What output, state, register value, or requirement did you expect?')}
      ${choice('observed', 'Observed', 'What happened instead?')}
      ${choice('evidence', 'Evidence', 'Give the exact line, diagnostic, truth-table row, trace value, or screenshot location.')}
      ${choice('attempt', 'Attempt', 'What one change did you try, and what changed afterward?')}
      ${choice('privacy', 'Privacy and escalation', 'Do not paste credentials, private grades, or another student’s work; contact the instructor when needed.')}
    </div>
    <div class="actions"><button data-action="open-helper" class="primary">Open the Student Helper</button></div>
  </div></section>
  <section class="step" data-step="7" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Recover, verify, and continue</h2>
    <p>Common failures have different next steps. SystemStudio points to evidence and stops safely instead of guessing.</p>
    <div class="instruction"><strong>Review all five:</strong> know the recovery path before beginning graded work.</div>
    <div class="choices">
      ${choice('syntax', 'Unsupported assembly syntax', 'Use the exact source-line diagnostic and compatibility guide.')}
      ${choice('input', 'Missing virtual input', 'Add one response per line, rebuild, and step again.')}
      ${choice('loop', 'Possible infinite loop', 'Use the 10,000-step safety stop and inspect the recent trace and branch condition.')}
      ${choice('remote', 'Digital GUI over Remote SSH', 'Keep using preview/tests remotely; use local desktop VS Code for graphical editing.')}
      ${choice('canvas', 'Unclear or changing requirement', 'Open Fall 2026 Canvas. Never infer a deadline from a study reference.')}
    </div>
    <div class="actions"><button data-action="open-canvas" class="primary">Open Canvas</button><button data-action="show-tools" class="secondary">Open grouped tools</button><button data-action="native-walkthrough" class="secondary">Open Getting Started</button></div>
  </div></section>`;
}

function choice(id: string, title: string, description: string): string {
  return `<button class="choice" data-choice="${id}" aria-pressed="false"><strong>${title}</strong><span>${description}</span><span class="checked">Click to review</span></button>`;
}
