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
import type { LearningImprovementManager } from './learningImprovement';

const PROGRESS_KEY = 'guidedTutorial.progress';
const WALKTHROUGH_ID = 'probir-roy.systemstudio-cis310#systemstudioCis310.gettingStarted';

export class TutorialPanel implements vscode.Disposable {
  private static current: TutorialPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private step: number;

  static async show(context: vscode.ExtensionContext, learningImprovement: LearningImprovementManager, restart = false): Promise<void> {
    const saved = context.globalState.get<TutorialProgress>(PROGRESS_KEY);
    const initialStep = restart ? 0 : resumeTutorialStep(saved);
    if (TutorialPanel.current) {
      TutorialPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      if (restart) await TutorialPanel.current.restart();
      return;
    }
    TutorialPanel.current = new TutorialPanel(context, learningImprovement, initialStep);
    await context.globalState.update(PROGRESS_KEY, tutorialProgress('in-progress', initialStep));
    await learningImprovement.record({ category: 'learning', name: 'tutorial-result', activityId: 'guided-tutorial', outcome: 'started' });
  }

  static async promptOnFirstRun(context: vscode.ExtensionContext, learningImprovement: LearningImprovementManager): Promise<boolean> {
    if (context.extensionMode !== vscode.ExtensionMode.Production) return false;
    if (context.globalState.get<TutorialProgress>(PROGRESS_KEY)) return false;
    const action = await vscode.window.showInformationMessage(
      'Welcome to Fall 2026 CIS 310. Start the clickable tour of preparation, coursework/final-project planning, Canvas, Full Digital, the actual NASM/GDB workbench, and help?',
      'Start Guided Tutorial',
      'Skip for now'
    );
    if (action === 'Start Guided Tutorial') {
      await TutorialPanel.show(context, learningImprovement, true);
    } else {
      await context.globalState.update(PROGRESS_KEY, tutorialProgress('skipped', 0));
      await learningImprovement.record({ category: 'learning', name: 'tutorial-result', activityId: 'guided-tutorial', outcome: 'skipped' });
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
    private readonly learningImprovement: LearningImprovementManager,
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
            await this.learningImprovement.record({ category: 'learning', name: 'tutorial-result', activityId: 'guided-tutorial', outcome: 'skipped' });
            this.panel.dispose();
            await vscode.window.showInformationMessage(
              'Tutorial skipped. Use the SystemStudio sidebar or Command Palette to run it again.'
            );
            break;
          case 'complete':
            this.step = TUTORIAL_STEP_IDS.length - 1;
            await this.context.globalState.update(PROGRESS_KEY, tutorialProgress('completed', this.step));
            await this.learningImprovement.record({ category: 'learning', name: 'tutorial-result', activityId: 'guided-tutorial', outcome: 'completed' });
            await vscode.window.showInformationMessage(
              'SystemStudio tutorial completed. You can rerun it at any time from the sidebar.'
            );
            await this.learningImprovement.askHelpfulness('guided-tutorial');
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
    await this.learningImprovement.record({ category: 'learning', name: 'tutorial-result', activityId: 'guided-tutorial', outcome: 'started' });
    await this.panel.webview.postMessage({ type: 'restart', step: 0 });
  }
}

async function executeTutorialAction(action: TutorialAction): Promise<void> {
  const command: Record<TutorialAction, { id: string; args?: unknown[] }> = {
    'show-tools': { id: 'workbench.view.extension.systemstudioCis310' },
    'show-materials': { id: 'systemstudioCis310.openMaterialsIndex' },
    'open-canvas': { id: 'systemstudioCis310.openCanvas' },
    'open-calendar': { id: 'systemstudioCis310.openCourseCalendar' },
    'open-syllabus': { id: 'systemstudioCis310.openSyllabus' },
    'open-helper': { id: 'systemstudioCis310.openStudentHelper' },
    'open-ai-tutor': { id: 'systemstudioCis310.openAiTutor' },
    'ask-before-class': { id: 'systemstudioCis310.openPreClassQuestion' },
    'open-learning': { id: 'systemstudioCis310.openPracticeCenter' },
    'open-coursework': { id: 'systemstudioCis310.openCourseworkCenter' },
    'practice-now': { id: 'systemstudioCis310.startQuickPractice' },
    'open-guided-labs': { id: 'systemstudioCis310.openGuidedLabs' },
    'open-half-adder-lab': { id: 'systemstudioCis310.openGuidedLabs', args: ['circuit-half-adder'] },
    'open-assembly-guided-labs': { id: 'systemstudioCis310.openGuidedLabs', args: ['assembly-register-arithmetic'] },
    'open-search-guided-lab': { id: 'systemstudioCis310.openGuidedLabs', args: ['assembly-linear-search'] },
    'check-digital': { id: 'systemstudioCis310.checkEnvironment' },
    'setup-digital': { id: 'systemstudioCis310.setupDigital' },
    'create-circuit': { id: 'systemstudioCis310.createCircuit' },
    'create-workspace': { id: 'systemstudioCis310.createStarterWorkspace' },
    'create-assembly-lab': { id: 'systemstudioCis310.createAssemblyLab' },
    'assembly-guide': { id: 'systemstudioCis310.openNasmGuide' },
    'native-walkthrough': { id: 'systemstudioCis310.openGettingStarted' }
  };
  const selected = command[action];
  await vscode.commands.executeCommand(selected.id, ...(selected.args ?? []));
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
    .tutorial-body { width: min(1240px, calc(100% - 48px)); margin: 22px auto; display: grid; grid-template-columns: minmax(210px, 250px) minmax(0, 1fr); gap: 20px; align-items: start; }
    main { min-width: 0; }
    .lesson-nav { position: sticky; top: 16px; display: grid; gap: 7px; border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 12px; background: var(--vscode-sideBar-background); }
    .lesson-nav h2 { margin: 0 0 4px; font-size: .98rem; }
    .lesson-nav p { margin: 0 0 7px; color: var(--vscode-descriptionForeground); font-size: .78rem; line-height: 1.35; }
    .lesson-link { width: 100%; display: grid; grid-template-columns: 25px minmax(0,1fr) 18px; gap: 7px; align-items: center; cursor: pointer; text-align: left; padding: 8px; color: var(--vscode-foreground); background: transparent; border: 1px solid transparent; border-radius: 5px; }
    .lesson-link:hover, .lesson-link:focus-visible { border-color: var(--vscode-focusBorder); outline: none; }
    .lesson-link.active { border-color: var(--vscode-focusBorder); background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
    .lesson-number { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); font-size: .75rem; font-weight: 700; }
    .lesson-title { line-height: 1.25; font-size: .82rem; }
    .lesson-state { color: var(--vscode-testing-iconPassed); text-align: center; }
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
    @media (max-width: 820px) { .tutorial-body { grid-template-columns: 1fr; } .lesson-nav { position: static; grid-template-columns: repeat(2, minmax(0,1fr)); } .lesson-nav h2, .lesson-nav p { grid-column: 1 / -1; } }
    @media (max-width: 520px) { .lesson-nav { grid-template-columns: 1fr; } header, footer { align-items: flex-start; flex-direction: column; } }
    @media (prefers-reduced-motion: reduce) { .step.active { animation: none; } .progress > div { transition: none; } }
  </style>
</head>
<body>
<div class="shell">
  <header>
    <div><h1>SystemStudio CIS 310 Guided Tutorial</h1><div class="status">Self-paced. Learning-improvement sharing is disabled in this release.</div></div>
    <div class="header-actions"><button id="restart" class="quiet">Restart</button><button id="skip" class="quiet">Skip tutorial</button></div>
  </header>
  <div class="progress-wrap">
    <div class="progress-label"><span id="stepLabel"></span><span id="requirement"></span></div>
    <div class="progress" role="progressbar" aria-label="Current tutorial position" aria-valuemin="1" aria-valuemax="9"><div id="progressBar"></div></div>
  </div>
  <div class="tutorial-body">
    <nav id="lessonNav" class="lesson-nav" aria-label="Tutorial lessons">
      <h2>Choose any lesson</h2>
      <p>Work in any order. You can leave, resume, skip a lesson, or rerun the tutorial.</p>
    </nav>
    <main>
      ${tutorialStepsHtml()}
      <section id="completion" class="step completion" aria-labelledby="completeTitle">
        <div class="mark">✓</div><h2 id="completeTitle">You reached the end of the tutorial</h2>
        <p>This is self-paced, so finishing does not claim that you reviewed every choice. Return to any lesson from the SystemStudio sidebar, the Command Palette, or VS Code’s Getting Started page.</p>
        <div class="actions" style="justify-content:center"><button id="runAgain" class="primary">Run tutorial again</button><button data-action="show-tools" class="secondary">Open SystemStudio tools</button><button data-action="native-walkthrough" class="secondary">Open Getting Started</button></div>
      </section>
    </main>
  </div>
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
  const lessonNav = document.getElementById('lessonNav');
  const lessonButtons = steps.map((step, index) => {
    const button = document.createElement('button');
    button.className = 'lesson-link';
    button.type = 'button';
    button.dataset.lesson = String(index);
    const number = document.createElement('span');
    number.className = 'lesson-number';
    number.textContent = String(index + 1);
    const title = document.createElement('span');
    title.className = 'lesson-title';
    title.textContent = step.querySelector('h2')?.textContent || ('Lesson ' + (index + 1));
    const state = document.createElement('span');
    state.className = 'lesson-state';
    state.setAttribute('aria-hidden', 'true');
    button.append(number, title, state);
    button.addEventListener('click', () => { current = index; render(); steps[current].querySelector('h2')?.focus(); });
    lessonNav.append(button);
    return button;
  });

  function requirementMet(step, index = current) {
    const choices = [...step.querySelectorAll('[data-choice]')];
    return step.dataset.require === 'all' ? visited[index].size === choices.length : visited[index].size > 0;
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
    lessonButtons.forEach((button, index) => {
      const completeLesson = requirementMet(steps[index], index);
      button.classList.toggle('active', index === current);
      button.setAttribute('aria-current', index === current ? 'step' : 'false');
      button.querySelector('.lesson-state').textContent = completeLesson ? '✓' : visited[index].size ? '•' : '';
    });
    stepLabel.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;
    requirement.textContent = step.dataset.require === 'all'
      ? visited[current].size + ' of ' + choices.length + ' choices explored · optional'
      : complete ? 'Choice explored' : 'Explore a choice or continue when ready';
    progressBar.style.width = ((current + 1) / steps.length * 100) + '%';
    progress.setAttribute('aria-valuenow', String(current + 1));
    next.disabled = false;
    next.textContent = current === steps.length - 1 ? 'Finish tutorial' : 'Next lesson';
    back.disabled = current === 0;
    liveStatus.textContent = complete ? 'Lesson reviewed' : 'Self-paced: continue now or review more choices';
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
	      ${choice('prepare', 'Prepare before class', 'Study the accessible lesson, read the mapped open-book section, watch the author video, then complete the five-question preparation checkpoint.')}
      ${choice('requirements', 'Find requirements or submit', 'Go to the current Fall 2026 Canvas course; SystemStudio never submits for you.')}
      ${choice('circuit', 'Design or debug a circuit', 'Move from a lecture concept to a small circuit, prediction, preview, and test.')}
      ${choice('assembly', 'Write, run, or trace assembly', 'Use an actual assembler for executable behavior and the separately labeled tutor for visualization.')}
      ${choice('confusion', 'I am not sure what is wrong', 'Separate concept, requirement, and environment questions before changing work.')}
    </div>
    <div class="actions"><button data-action="show-tools" class="secondary">Show the real SystemStudio sidebar</button></div>
  </div></section>
  <section class="step" data-step="1" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Know where to learn and where to submit</h2>
    <p>The Fall 2026 workspace separates bundled study references from the authoritative Canvas course.</p>
    <div class="instruction"><strong>Explore the resources you need:</strong> each has one clear job, and you can return to the others later.</div>
    <div class="choices">
      ${choice('canvas', 'Fall 2026 Canvas', 'Authoritative deadlines, grading rules, required files, announcements, and submission.')}
      ${choice('syllabus', 'Accessible Fall 2026 syllabus', 'Active course structure, outcomes, tools, policies, and Canvas-controlled details open as primary accessible HTML.')}
      ${choice('calendar', 'Monday/Wednesday calendar', '27 verified regular meetings starting August 26, with holidays and recess identified.')}
      ${choice('openbook', 'Required open book and author videos', 'Focused Tarnoff chapters and official author videos come before the related class and slides.')}
      ${choice('presentations', '13 accessible HTML lectures', 'Each primary lecture provides objectives, explanations, examples, self-checks, and source-bounded tutor prompts; the legacy PDF is an optional visual archive.')}
      ${choice('homework', 'Three homework items', 'HW1 Logic Foundations; HW2 Sequential Logic; HW3 Memory and Assembly.')}
      ${choice('projects', 'Three milestones + final presentation', 'Processor memories, Register File/ALU, and the integrated 4-bit processor build one cumulative processor for the final instructional-ISA program demonstration.')}
      ${choice('mission', 'Assignment Mission Control', 'Use local status, checklists, file inspection, receipt confirmation, final-project self-evaluation, and the manual grade estimate without confusing them with Canvas evaluation.')}
	      ${choice('practice', 'CIS 310 Learning', 'Accessible lesson → Read → Watch → Practice 8 questions → Build/debug, with a five-question preparation checkpoint, explanations, source evidence, and local spaced review.')}
    </div>
    <div class="actions"><button data-action="open-coursework" class="primary">Open coursework and final project</button><button data-action="open-learning" class="secondary">Open preparation path</button><button data-action="practice-now" class="secondary">Try 5-question practice</button><button data-action="open-canvas" class="secondary">Open Fall 2026 Canvas</button><button data-action="open-syllabus" class="secondary">Open accessible syllabus</button><button data-action="open-calendar" class="secondary">Open course calendar</button><button data-action="show-materials" class="secondary">Open bundled material guide</button></div>
  </div></section>
  <section class="step" data-step="2" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Is it my setup or my work?</h2>
	    <p>SystemStudio uses the complete upstream Digital application. Its primary path keeps the real Swing UI in a VS Code tab: a private display on Linux or the prepared Docker Desktop runtime on Windows/macOS. A verified native Digital window is an explicit fallback when that route is available; Remote SSH is not required.</p>
    <div class="instruction"><strong>Explore any case:</strong> identify the evidence that distinguishes it, then return for the others when relevant.</div>
    <div class="choices">
      ${choice('check', 'Run the environment check', 'Reports Digital checksum, Java version, and workspace trust without changing the machine.')}
      ${choice('install', 'Install or verify Digital', 'After consent, installs the pinned release in extension storage and verifies its checksum.')}
      ${choice('remote', 'Recognize the display modes', 'The default is upstream Digital embedded in the VS Code tab: a private Linux display locally/over SSH, or an extension-managed Docker Desktop runtime on Windows/macOS. Native Digital is an explicit fallback.')}
    </div>
    <div class="actions"><button data-action="check-digital" class="secondary">Try: Check environment</button><button data-action="setup-digital" class="secondary">Try: Install / verify</button></div>
  </div></section>
  <section class="step" data-step="3" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Build a half adder, then extend the pattern</h2>
    <p>The Hands-on Lab Center keeps the lecture source, prediction, Full Digital circuit build, evidence checks, and explanation together. It creates a fresh circuit and never fills in a graded assignment.</p>
    <div class="instruction"><strong>Start with Lecture 2:</strong> predict all four one-bit additions, build separate Sum and Carry paths, simulate every row, and explain the evidence.</div>
    <div class="choices">
      ${choice('read', 'Read §8.1 and watch binary addition', 'Use the mapped open-book section and author video before adding gates.')}
      ${choice('predict', 'Predict Sum and Carry', 'Record 00, 01, 10, and 11 before the simulator can influence the answer.')}
      ${choice('build', 'Build in Full Digital', 'The fresh `.dig` file opens in upstream Digital. Place A/B, Sum/Carry, XOR, and AND; connect them and toggle every input row using Digital’s original controls.')}
      ${choice('evidence', 'Simulate and record four rows', 'Compare each observed Carry·Sum pair with the prediction, then preview the saved structure in VS Code.')}
      ${choice('extend', 'Choose the next circuit lab', 'Continue with Boolean gates, a 2-to-1 selector, one stored bit, address decoding, or a small ALU slice.')}
    </div>
    <div class="actions"><button data-action="open-half-adder-lab" class="primary">Start the half-adder build</button><button data-action="open-guided-labs" class="secondary">Browse all circuit labs</button><button data-action="show-materials" class="secondary">Open mapped materials</button></div>
  </div></section>
  <section class="step" data-step="4" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Build and run one consistent NASM program</h2>
    <p>Fall 2026 uses NASM 32-bit for student-authored x86 work. The extension selects a native x86-Linux toolchain when it is complete; otherwise it uses the prepared course container. There is no MASM/NASM chooser.</p>
    <div class="instruction"><strong>Practice the complete first run:</strong> create the NASM workspace, read the source, predict, build, run its self-check, and interpret the actual exit status.</div>
    <div class="choices">
      ${choice('prepare', 'Prepare once', 'On x86 Linux, use actual NASM, GNU ld, and GDB. On Windows/macOS, start Docker Desktop and build the course image after the explicit prompt.')}
      ${choice('read', 'Read the actual source', 'Locate BITS 32, data/text sections, GLOBAL _start, labels, and the Linux IA-32 exit path before editing.')}
      ${choice('predict', 'Predict before execution', 'Write expected EAX and flags after MOV/MOV/ADD. Do not let the debugger become the prediction.')}
      ${choice('build', 'Assemble and link', 'Build and run invokes actual NASM and GNU ld. Resolve the first diagnostic rather than changing unrelated lines.')}
      ${choice('test', 'Interpret the self-check', 'PASS with exit code 0 is local formative evidence. It is neither a Canvas submission nor an instructor/GSI grade.')}
      ${choice('boundary', 'Keep the two processors separate', 'NASM targets IA-32 x86. It does not run on the Digital project’s 4-bit datapath and 8-bit instructional words.')}
    </div>
    <div class="actions"><button data-action="create-assembly-lab" class="primary">Create or update NASM workspace</button><button data-action="open-assembly-guided-labs" class="secondary">Open register-arithmetic lab</button><button data-action="assembly-guide" class="secondary">Open NASM guide</button></div>
  </div></section>
  <section class="step" data-step="5" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Debug actual machine state in the NASM Workbench</h2>
    <p>The workbench maintains an actual GDB session. Source location, EIP-aligned Intel disassembly, registers, EFLAGS, stack, memory, breakpoints, and program output come from the assembled executable—not the trace tutor.</p>
    <div class="instruction"><strong>Use predict → breakpoint → inspect → step → explain:</strong> begin with <code>inspect_after_add</code>, then repeat the workflow for a loop or search label.</div>
    <div class="choices">
      ${choice('start', 'Start or restart GDB', 'Starting rebuilds the current source with DWARF information and stops at the first actual instruction.')}
      ${choice('breakpoint', 'Continue to a safe label', 'Enter a NASM label such as inspect_after_add or an explicit hexadecimal address. Other GDB command text is rejected.')}
      ${choice('registers', 'Inspect registers and flags', 'Compare EAX–EDI, EBP, ESP, EIP, and named EFLAGS with the written prediction.')}
      ${choice('memory', 'Inspect stack and memory', 'Use $esp, another allowed register, a NASM symbol, or a hexadecimal address; connect each value to the code that produced it.')}
      ${choice('disassembly', 'Read actual disassembly', 'Relate the highlighted machine instruction and address to the NASM source without assuming one source line always means one instruction.')}
      ${choice('step', 'Step one actual instruction', 'Observe exactly what changed, identify the earliest mismatch, and explain the causal instruction.')}
      ${choice('tutor', 'Ask after attempting', 'Provide prediction, first mismatch, and evidence. The tutor gives one hint at a time and must not write graded code.')}
    </div>
    <div class="actions"><button data-action="open-assembly-guided-labs" class="primary">Open actual register-arithmetic workbench</button><button data-action="open-search-guided-lab" class="secondary">Open linear-search walkthrough</button><button data-action="open-guided-labs" class="secondary">Browse all hands-on labs</button></div>
  </div></section>
  <section class="step" data-step="6" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Inspect evidence, not just “it ran”</h2>
    <p>Use the evidence that fits the task. This is where tool output becomes feedback you can explain.</p>
    <div class="instruction"><strong>Explore the evidence relevant to your task:</strong> return later for the other forms.</div>
    <div class="choices">
      ${choice('truth', 'Truth-table or state row', 'Compare a chosen input/state with the circuit’s observed output/next state.')}
      ${choice('preview', 'Full Digital and official preview', 'Edit and simulate in upstream Digital; use its SVG exporter as separate read-only evidence.')}
      ${choice('tests', 'Circuit tests', 'Use instructor-approved embedded testcases as repeatable evidence.')}
      ${choice('machine', 'Registers, flags, memory, and stack', 'Step assembly and compare each visible change with your prediction.')}
      ${choice('trace', 'Output, trace, and diagnostics', 'Locate the exact instruction, input, unsupported form, or safety stop.')}
    </div>
  </div></section>
  <section class="step" data-step="7" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Choose the right kind of conversation</h2>
    <p>The chat bubble separates the private local FAQ, the U-M Codex CLI learning coach, and a Canvas question for the instructor.</p>
    <div class="instruction"><strong>Explore the support path that fits today:</strong> you do not need to open every service.</div>
    <div class="choices">
      ${choice('faq', 'Local FAQ chat', 'Use recurring setup, navigation, Digital, assembly, or submission-process checklists without calling an AI service.')}
      ${choice('tutor', 'U-M Codex learning coach', 'Codex runs in the VS Code terminal with your own U-M configuration and course guardrails. It receives only the prompt and workspace access you deliberately allow. Attempt first and request a hint—not a deliverable.')}
      ${choice('before', 'Questions Before Class', 'Send a complex concept or unclear decision point early so the instructor can adapt the next lecture.')}
      ${choice('anonymous', 'Canvas controls anonymity', 'Choose anonymous only when the Canvas discussion displays that option; SystemStudio cannot promise anonymity.')}
      ${choice('evidence', 'Make the question answerable', 'Include expected, observed, exact evidence, and what you already tried—never credentials, private grades, or another student’s work.')}
    </div>
    <div class="actions"><button data-action="open-helper" class="primary">Open local FAQ chat</button><button data-action="open-ai-tutor" class="secondary">Open U-M Codex coach</button><button data-action="ask-before-class" class="secondary">Ask before class</button></div>
  </div></section>
  <section class="step" data-step="8" data-require="all"><div class="focus-card">
    <h2 tabindex="-1">Recover, verify, and continue</h2>
    <p>Common failures have different next steps. SystemStudio points to evidence and stops safely instead of guessing.</p>
    <div class="instruction"><strong>Explore the recovery path you need:</strong> use the lesson list to return when a different problem occurs.</div>
    <div class="choices">
      ${choice('syntax', 'Unsupported assembly syntax', 'Use the exact source-line diagnostic and compatibility guide.')}
      ${choice('debugger', 'Debugger did not start', 'Confirm NASM, GNU ld, and GDB on x86 Linux, or start Docker Desktop and prepare the course image. Then restart the workbench.')}
      ${choice('loop', 'Possible infinite loop', 'Use the 10,000-step safety stop and inspect the recent trace and branch condition.')}
      ${choice('remote', 'Full Digital over Remote SSH', 'The extension transports the actual upstream Digital Swing desktop into the VS Code tab on supported Linux hosts.')}
      ${choice('canvas', 'Unclear or changing requirement', 'Open Fall 2026 Canvas. Never infer a deadline from a study reference.')}
    </div>
    <div class="actions"><button data-action="open-canvas" class="primary">Open Canvas</button><button data-action="show-tools" class="secondary">Open grouped tools</button><button data-action="native-walkthrough" class="secondary">Open Getting Started</button></div>
  </div></section>`;
}

function choice(id: string, title: string, description: string): string {
  return `<button class="choice" data-choice="${id}" aria-pressed="false"><strong>${title}</strong><span>${description}</span><span class="checked">Click to review</span></button>`;
}
