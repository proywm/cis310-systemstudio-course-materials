import { randomBytes } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { zipSync } from 'fflate';
import * as vscode from 'vscode';
import {
  CANVAS_INSTRUCTOR_GSI_GRADE_SOURCE,
  COURSEWORK_CATALOG,
  FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS,
  LOCAL_SELF_EVALUATION_SOURCE,
  MANUAL_CANVAS_GRADE_ESTIMATE_SOURCE,
  diagnoseDigitalErrors,
  estimateFinalGrade,
  isSafeCanvasUrl,
  parseCanvasIcsEvents,
  summarizeCourseworkProgress,
  summarizeFinalProjectSelfEvaluation,
  type CourseworkId,
  type CourseworkStatus,
  type FinalGradeEstimateInput,
  type FinalSelfEvaluationDimension
} from './core/coursework';
import {
  circuitPreflightById,
  circuitPreflightsForCoursework,
  externalTestCircuit
} from './core/circuitPreflight';
import { FALL_2026_CANVAS_URL, fall2026CourseMeetings } from './core/courseCalendar';
import type { CourseMaterials } from './courseMaterials';
import type { DigitalManager } from './digitalManager';
import type { PracticeStore } from './practiceStore';

const STATUS_VALUES = new Set<CourseworkStatus>(['not-started', 'in-progress', 'ready-to-submit', 'submitted', 'receipt-confirmed']);
const COURSEWORK_IDS = new Set(COURSEWORK_CATALOG.map((item) => item.id));
const SELF_DIMENSIONS = new Set(FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS.map((item) => item.id));
const MAX_BUNDLE_FILE_BYTES = 64 * 1024 * 1024;
const MAX_BUNDLE_TOTAL_BYTES = 192 * 1024 * 1024;
const MAX_ICS_BYTES = 5 * 1024 * 1024;

const MEETING_TOPICS = [
  ['Orientation; abstraction; data representation', 'lecture-01'],
  ['Binary and hexadecimal representation', 'lecture-01'],
  ['Signed data, two’s complement, and adders', 'lecture-02'],
  ['Boolean operations and truth tables', 'lecture-02'],
  ['Boolean algebra and circuit simplification', 'lecture-03'],
  ['Karnaugh-map method', 'lecture-04'],
  ['Karnaugh maps and don’t-care conditions', 'lecture-04'],
  ['Decoders, multiplexers, and data selection', 'lecture-05'],
  ['Combinational design and evidence-based testing', 'lecture-05'],
  ['Latches, clocks, and state', 'lecture-06'],
  ['Flip-flops, registers, and counters', 'lecture-06'],
  ['Sequential-circuit analysis and verification', 'lecture-06'],
  ['Memory organization and memory maps', 'lecture-07'],
  ['Buses and address decoding', 'lecture-07'],
  ['I/O protocols and polling', 'lecture-08'],
  ['Interrupts and asynchronous behavior', 'lecture-08'],
  ['Memory hierarchy and storage latency', 'lecture-09'],
  ['Cache and locality', 'lecture-09'],
  ['Register-transfer language and micro-operations', 'lecture-10'],
  ['Arithmetic units and ALU design', 'lecture-10'],
  ['Control unit and instruction cycle', 'lecture-10'],
  ['Datapath/control integration', 'lecture-10'],
  ['Processor components and pipelining', 'lecture-11'],
  ['Address spaces and x86 registers', 'lecture-12'],
  ['Assembly syntax, translation, and execution model', 'lecture-12'],
  ['Assembly trace: registers, flags, stack, and memory', 'lecture-12'],
  ['Integration, final-project planning, and review', 'lecture-10']
] as const;

export class CourseworkPanel implements vscode.Disposable {
  private static current: CourseworkPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly panel: vscode.WebviewPanel;

  static show(context: vscode.ExtensionContext, store: PracticeStore, materials: CourseMaterials, manager: DigitalManager): void {
    if (CourseworkPanel.current) {
      CourseworkPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      void CourseworkPanel.current.postState();
      return;
    }
    CourseworkPanel.current = new CourseworkPanel(context, store, materials, manager);
  }

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly store: PracticeStore,
    private readonly materials: CourseMaterials,
    private readonly manager: DigitalManager
  ) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.coursework',
      'CIS 310 Coursework and Final Presentation',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = courseworkHtml(this.panel.webview, this.statePayload());
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.store.onDidChange(() => void this.postState(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage((message) => void this.handleMessage(message), undefined, this.disposables);
  }

  dispose(): void {
    CourseworkPanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }

  private statePayload(): object {
    const progress = this.store.getCourseworkProgress();
    return {
      progress,
      summary: summarizeCourseworkProgress(progress),
      selfSummary: summarizeFinalProjectSelfEvaluation(progress.finalSelfEvaluation)
    };
  }

  private async postState(): Promise<void> {
    await this.panel.webview.postMessage({ type: 'state', state: this.statePayload() });
  }

  private async handleMessage(value: unknown): Promise<void> {
    if (!isRecord(value) || typeof value.type !== 'string') return;
    try {
      switch (value.type) {
        case 'set-status': {
          if (!isCourseworkId(value.id) || typeof value.status !== 'string' || !STATUS_VALUES.has(value.status as CourseworkStatus)) return;
          await this.store.setCourseworkStatus(value.id, value.status as CourseworkStatus);
          return;
        }
        case 'toggle-check':
          if (isCourseworkId(value.id) && typeof value.checkId === 'string') await this.store.toggleCourseworkCheck(value.id, value.checkId);
          return;
        case 'set-self':
          if (typeof value.dimension === 'string' && SELF_DIMENSIONS.has(value.dimension as FinalSelfEvaluationDimension) && typeof value.rating === 'number') {
            await this.store.setFinalProjectSelfEvaluation(value.dimension as FinalSelfEvaluationDimension, value.rating);
          }
          return;
        case 'open-resource': {
          if (!isCourseworkId(value.id)) return;
          const item = COURSEWORK_CATALOG.find((candidate) => candidate.id === value.id);
          const resource = item ? this.materials.getResource(item.resourceId) : undefined;
          if (resource) await this.materials.openResource(resource);
          else await vscode.commands.executeCommand('systemstudioCis310.openCanvas');
          return;
        }
        case 'command':
          await this.runAllowedCommand(value.command);
          return;
        case 'validate-files':
          if (isCourseworkId(value.id)) await this.validateFiles(value.id);
          return;
        case 'run-preflight':
          if (isCourseworkId(value.id)) await this.runCircuitPreflight(value.id);
          return;
        case 'export-bundle':
          if (isCourseworkId(value.id)) await this.exportBundle(value.id);
          return;
        case 'diagnose': {
          if (typeof value.text !== 'string') return;
          await this.panel.webview.postMessage({ type: 'diagnosis', diagnoses: diagnoseDigitalErrors(value.text) });
          return;
        }
        case 'import-ics':
          await this.importCanvasCalendar();
          return;
        case 'clear-ics':
          await this.store.setCanvasEvents([]);
          return;
        case 'open-canvas-event':
          if (typeof value.url === 'string' && isSafeCanvasUrl(value.url)) {
            await vscode.env.openExternal(vscode.Uri.parse(value.url));
          }
          return;
        case 'calculate-grade':
          await this.calculateGrade(value.input);
          return;
        case 'copy-review':
          if (typeof value.text === 'string') await this.copyReviewRequest(value.text);
          return;
        case 'open-recovery':
          if (typeof value.resourceId === 'string') await vscode.commands.executeCommand('systemstudioCis310.openLessonText', value.resourceId);
          return;
        case 'reset':
          await this.confirmReset();
          return;
      }
    } catch (error) {
      await this.panel.webview.postMessage({ type: 'error', message: errorMessage(error) });
    }
  }

  private async runAllowedCommand(command: unknown): Promise<void> {
    const commands = new Set([
      'systemstudioCis310.openCanvas', 'systemstudioCis310.openSyllabus', 'systemstudioCis310.openCourseCalendar',
      'systemstudioCis310.openPracticeCenter', 'systemstudioCis310.openGuidedLabs', 'systemstudioCis310.checkEnvironment',
      'systemstudioCis310.checkAssemblyEnvironment', 'systemstudioCis310.openStudentHelper', 'systemstudioCis310.openPreClassQuestion',
      'systemstudioCis310.testCircuit', 'systemstudioCis310.buildRunAssembly'
    ]);
    if (typeof command === 'string' && commands.has(command)) await vscode.commands.executeCommand(command);
  }

  private async chooseFiles(id: CourseworkId): Promise<vscode.Uri[] | undefined> {
    const item = COURSEWORK_CATALOG.find((candidate) => candidate.id === id);
    if (!item) return undefined;
    return vscode.window.showOpenDialog({
      title: `Choose files to check for ${item.title}`,
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: true,
      openLabel: 'Check Selected Files'
    });
  }

  private async validateFiles(id: CourseworkId): Promise<void> {
    const selected = await this.chooseFiles(id);
    if (!selected?.length) return;
    const item = COURSEWORK_CATALOG.find((candidate) => candidate.id === id)!;
    const result = await inspectSelectedFiles(item, selected);
    await this.panel.webview.postMessage({ type: 'validation', id, result });
  }

  private async runCircuitPreflight(id: CourseworkId): Promise<void> {
    if (!vscode.workspace.isTrusted) {
      throw new Error('Trust this workspace before running local circuit code. Reading course materials remains available without trust.');
    }
    const contracts = circuitPreflightsForCoursework(id);
    if (!contracts.length) throw new Error('This coursework item does not have a circuit preflight.');
    const choice = await vscode.window.showQuickPick(
      contracts.map((contract) => ({
        label: contract.label,
        description: contract.mode === 'external' ? `${contract.expectedVectors.toLocaleString()} public vectors` : 'circuit-owned test cases',
        detail: `${contract.detail} Interface: ${contract.interfaceSummary}`,
        contractId: contract.id
      })),
      { title: 'Choose a formative circuit preflight', placeHolder: 'Select the component or integrated processor you want to test' }
    );
    if (!choice) return;
    const contract = circuitPreflightById(choice.contractId);
    if (!contract || !contract.courseworkIds.includes(id)) throw new Error('The selected preflight is not valid for this coursework item.');

    const selected = await vscode.window.showOpenDialog({
      title: `Choose the .dig file for ${contract.label}`,
      openLabel: 'Run Local Preflight',
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: { 'Digital circuits': ['dig'] }
    });
    const circuit = selected?.[0];
    if (!circuit) return;

    let status = await this.manager.getStatus();
    if (!status.integrityVerified || !status.java.supported) {
      await vscode.commands.executeCommand('systemstudioCis310.setupDigital');
      status = await this.manager.getStatus();
    }
    if (!status.integrityVerified || !status.java.supported) {
      throw new Error('Digital and Java must be ready before a local circuit preflight can run.');
    }

    let testsPath: string | undefined;
    if (contract.mode === 'external') {
      const directory = path.join(this.context.globalStorageUri.fsPath, 'preflight-contracts', 'v1');
      await mkdir(directory, { recursive: true });
      testsPath = path.join(directory, `${contract.id}.dig`);
      await writeFile(testsPath, externalTestCircuit(contract), 'utf8');
    } else if (!(await this.manager.containsEmbeddedTests(circuit.fsPath))) {
      throw new Error('The selected integrated processor has no embedded Digital Testcase element. Add public tests for the released ISA/program, save the circuit, and rerun.');
    }

    const result = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: `Running ${contract.label}`, cancellable: true },
      (_progress, token) => testsPath
        ? this.manager.runExternalTests(circuit.fsPath, testsPath, token)
        : this.manager.runTests(circuit.fsPath, token)
    );
    await this.panel.webview.postMessage({
      type: 'preflight-result',
      id,
      result: {
        passed: result.passed,
        label: contract.label,
        vectors: contract.expectedVectors,
        output: boundedEvidence(result.output)
      }
    });
    if (result.passed) {
      await vscode.window.showInformationMessage(`${contract.label} passed its local formative preflight. Canvas evaluation remains authoritative.`);
    } else {
      await vscode.window.showErrorMessage(`${contract.label} did not pass. Review the first mismatch in Coursework and the SystemStudio output.`);
    }
  }

  private async exportBundle(id: CourseworkId): Promise<void> {
    const selected = await this.chooseFiles(id);
    if (!selected?.length) return;
    const item = COURSEWORK_CATALOG.find((candidate) => candidate.id === id)!;
    const validation = await inspectSelectedFiles(item, selected);
    let total = 0;
    const entries: Record<string, Uint8Array> = {};
    const used = new Set<string>();
    for (const uri of selected) {
      const info = await stat(uri.fsPath);
      if (!info.isFile() || info.size > MAX_BUNDLE_FILE_BYTES) throw new Error(`File is too large to package safely: ${path.basename(uri.fsPath)}.`);
      total += info.size;
      if (total > MAX_BUNDLE_TOTAL_BYTES) throw new Error('The selected files exceed the 192 MB local packaging limit.');
      const name = uniqueName(path.basename(uri.fsPath), used);
      entries[name] = new Uint8Array(await readFile(uri.fsPath));
    }
    const note = [
      'SYSTEMSTUDIO CIS 310 LOCAL PLANNING CHECK',
      `Coursework: ${item.title}`,
      `Created: ${new Date().toISOString()}`,
      '',
      'This ZIP is not a Canvas submission and does not prove that released requirements were met.',
      'Open the current Canvas assignment, submit the required files there, and confirm the Canvas receipt.',
      '',
      ...validation.lines
    ].join('\n');
    entries['SYSTEMSTUDIO-LOCAL-CHECK.txt'] = new TextEncoder().encode(note);
    const workspace = vscode.workspace.workspaceFolders?.find((folder) => folder.uri.scheme === 'file');
    const target = await vscode.window.showSaveDialog({
      title: `Save local planning bundle for ${item.title}`,
      saveLabel: 'Save Planning Bundle',
      defaultUri: workspace ? vscode.Uri.joinPath(workspace.uri, `${id}-planning-bundle.zip`) : undefined,
      filters: { 'ZIP archives': ['zip'] }
    });
    if (!target) return;
    await vscode.workspace.fs.writeFile(target, Buffer.from(zipSync(entries, { level: 6 })));
    await this.panel.webview.postMessage({ type: 'bundle', message: `Saved ${path.basename(target.fsPath)}. This is a local planning bundle—not a Canvas submission.` });
  }

  private async importCanvasCalendar(): Promise<void> {
    const selected = await vscode.window.showOpenDialog({
      title: 'Import a Canvas calendar export (.ics)', canSelectMany: false, canSelectFiles: true, canSelectFolders: false,
      openLabel: 'Import Locally', filters: { 'iCalendar files': ['ics'] }
    });
    const uri = selected?.[0];
    if (!uri) return;
    const info = await stat(uri.fsPath);
    if (!info.isFile() || info.size > MAX_ICS_BYTES) throw new Error('Choose a Canvas .ics file no larger than 5 MB.');
    const content = await readFile(uri.fsPath, 'utf8');
    const coursePath = new URL(FALL_2026_CANVAS_URL).pathname.replace(/\/$/, '');
    const events = parseCanvasIcsEvents(content).filter((event) => {
      const belongsToCourseUrl = event.url && new URL(event.url).pathname.startsWith(`${coursePath}/`);
      return belongsToCourseUrl || /\bcis\s*[- ]?310\b|computer organization and assembly/i.test(event.title);
    });
    await this.store.setCanvasEvents(events);
    await this.panel.webview.postMessage({
      type: 'notice',
      message: `Imported ${events.length} relevant event${events.length === 1 ? '' : 's'} locally. The extension does not verify publication, submission, or later Canvas changes; re-import after Canvas updates.`
    });
  }

  private async calculateGrade(value: unknown): Promise<void> {
    if (!isRecord(value) || !Array.isArray(value.participationQuizzes) || !isRecord(value.finalProject)) throw new Error('Complete the grade-estimate fields.');
    const input: FinalGradeEstimateInput = {
      participationQuizzes: value.participationQuizzes.map(parseScore),
      courseworkCategoryPercent: numberValue(value.courseworkCategoryPercent),
      finalProject: parseScore(value.finalProject)
    };
    const estimate = estimateFinalGrade(input);
    await this.panel.webview.postMessage({ type: 'grade-result', estimate });
  }

  private async copyReviewRequest(text: string): Promise<void> {
    const bounded = text.trim().slice(0, 8_000);
    if (!bounded) throw new Error('Complete the criterion, evidence, feedback, and question before copying.');
    await vscode.env.clipboard.writeText(bounded);
    const action = await vscode.window.showInformationMessage(
      'Copied the structured review request. Send private grade questions through Canvas Inbox or university email—not a public discussion.',
      'Open Canvas'
    );
    if (action === 'Open Canvas') await vscode.commands.executeCommand('systemstudioCis310.openCanvas');
  }

  private async confirmReset(): Promise<void> {
    const decision = await vscode.window.showWarningMessage(
      'Reset local coursework status, checklist items, final-project self-evaluation, and imported Canvas-calendar events? Practice-question history is not affected.',
      { modal: true }, 'Reset Coursework Planning'
    );
    if (decision === 'Reset Coursework Planning') await this.store.resetCoursework();
  }
}

async function inspectSelectedFiles(item: typeof COURSEWORK_CATALOG[number], selected: readonly vscode.Uri[]): Promise<{ lines: string[]; warnings: string[] }> {
  const lines: string[] = [];
  const warnings: string[] = [];
  const extensions = new Set<string>();
  for (const uri of selected) {
    const info = await stat(uri.fsPath);
    const extension = path.extname(uri.fsPath).slice(1).toLowerCase();
    if (!info.isFile()) warnings.push(`${path.basename(uri.fsPath)} is not a regular file.`);
    if (!extension || !item.expectedExtensions.includes(extension)) warnings.push(`${path.basename(uri.fsPath)} is not one of this planning guide’s expected file types (${item.expectedExtensions.join(', ')}).`);
    extensions.add(extension);
    lines.push(`${path.basename(uri.fsPath)} — ${formatBytes(info.size)} — .${extension || '(none)'}`);
  }
  if (item.kind === 'implementation' && !extensions.has('dig')) warnings.push('No .dig circuit was selected for this implementation planning check.');
  if (item.kind === 'final') {
    if (!extensions.has('dig')) warnings.push('No cumulative 4-bit processor .dig circuit was selected.');
    if (!extensions.has('asm')) warnings.push('No assembly source (.asm) was selected.');
    if (![...extensions].some((extension) => ['pdf', 'pptx', 'ppt', 'docx', 'md'].includes(extension))) warnings.push('No presentation/report file was selected.');
  }
  if (!warnings.length) lines.push('Local file-type planning checks passed. This does not validate the released Canvas requirements or the technical correctness of the work.');
  return { lines, warnings };
}

function courseworkHtml(webview: vscode.Webview, state: object): string {
  const nonce = randomBytes(16).toString('base64');
  const data = JSON.stringify({
    catalog: COURSEWORK_CATALOG,
    dimensions: FINAL_PROJECT_SELF_EVALUATION_DIMENSIONS,
    meetings: fall2026CourseMeetings().map((meeting, index) => ({ ...meeting, topic: MEETING_TOPICS[index]?.[0], resourceId: MEETING_TOPICS[index]?.[1] })),
    sources: { local: LOCAL_SELF_EVALUATION_SOURCE, estimate: MANUAL_CANVAS_GRADE_ESTIMATE_SOURCE, official: CANVAS_INSTRUCTOR_GSI_GRADE_SOURCE },
    state
  }).replaceAll('<', '\\u003c');
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>CIS 310 Coursework and Final Presentation</title><style>
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family);font-size:14px}.shell{width:min(1120px,calc(100% - 32px));margin:auto;padding:24px 0 56px}h1{margin:.2rem 0;font-size:1.8rem}h2{margin:0 0 12px;font-size:1.3rem}h3{margin:.2rem 0 .5rem}.muted{color:var(--vscode-descriptionForeground)}.banner{border:1px solid var(--vscode-focusBorder);border-left:5px solid var(--vscode-focusBorder);padding:16px;border-radius:9px;background:var(--vscode-sideBar-background);line-height:1.5}.boundary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}.boundary article,.card{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:15px;background:var(--vscode-sideBar-background)}.boundary .official{border-color:var(--vscode-testing-iconPassed)}.progress-wrap{margin:18px 0}.progress-head{display:flex;justify-content:space-between;font-weight:650;margin-bottom:6px}progress{width:100%;height:18px;accent-color:var(--vscode-progressBar-background)}.tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--vscode-panel-border);margin:22px 0 18px;padding-bottom:8px}.tab{border:1px solid var(--vscode-panel-border);background:transparent;color:var(--vscode-foreground);padding:9px 12px;border-radius:6px;cursor:pointer}.tab[aria-selected=true]{background:var(--vscode-button-background);color:var(--vscode-button-foreground);border-color:transparent}.panel[hidden]{display:none}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:12px}.course-card{border:1px solid var(--vscode-panel-border);border-radius:9px;background:var(--vscode-sideBar-background);overflow:hidden}.course-card header{padding:15px;border-bottom:1px solid var(--vscode-panel-border)}.course-card .body{padding:15px}.stage{font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--vscode-descriptionForeground)}select,input,textarea,button{font:inherit}select,input,textarea{color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);border-radius:4px;padding:7px}textarea{width:100%;min-height:100px;resize:vertical}.status-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}.checks{display:grid;gap:8px;margin:12px 0}.check{display:grid;grid-template-columns:auto 1fr;gap:8px;line-height:1.4}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}button{cursor:pointer;border:0;border-radius:4px;padding:8px 12px;color:var(--vscode-button-foreground);background:var(--vscode-button-background)}button:hover{background:var(--vscode-button-hoverBackground)}button.secondary{color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}button.quiet{color:var(--vscode-foreground);background:transparent;border:1px solid var(--vscode-panel-border)}.final{border:2px solid var(--vscode-focusBorder)}.callout{border-left:4px solid var(--vscode-editorWarning-foreground);padding:11px 13px;background:var(--vscode-textBlockQuote-background);line-height:1.5;margin:12px 0}.ratings{display:grid;gap:10px}.rating{display:grid;grid-template-columns:minmax(220px,1fr) 160px;align-items:center;gap:10px}.score-grid{display:grid;grid-template-columns:1fr 110px 110px 44px;gap:7px;align-items:center;margin:6px 0}.grade-result{font-size:1.1rem;border:2px solid var(--vscode-testing-iconPassed);border-radius:8px;padding:16px;margin-top:16px}.grade-number{font-size:2rem;font-weight:750}.diagnosis{border-left:4px solid var(--vscode-charts-blue);padding:12px;margin-top:10px;background:var(--vscode-textBlockQuote-background)}.diagnosis pre{max-height:22rem;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--vscode-editor-font-family);font-size:.9rem}.event{padding:9px 0;border-bottom:1px solid var(--vscode-panel-border)}.recover{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:end}.staff{margin-top:22px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}:focus-visible{outline:2px solid var(--vscode-focusBorder);outline-offset:2px}@media(max-width:700px){.boundary{grid-template-columns:1fr}.rating,.score-grid,.recover{grid-template-columns:1fr}.score-grid button{justify-self:start}}
</style></head><body><main class="shell"><div class="muted">SystemStudio CIS 310 · Fall 2026</div><h1>Coursework and Final Presentation</h1><p class="muted">Plan, build, test, package, submit in Canvas, and confirm the receipt.</p>
<section class="banner" aria-labelledby="final-banner"><h2 id="final-banner">Culminating presentation: the cumulative 4-bit processor + assembly program</h2><p>The presentation demonstrates the same processor built through Implementations 1–3 and occurs during <strong>final examination week</strong>. The exact date, time, room, presentation order, released requirements, and submission deadline are <strong>to be announced in Canvas</strong>.</p><button data-command="systemstudioCis310.openCanvas">Open Canvas for announcements</button></section>
<section class="boundary"><article><h2>My local evidence</h2><p>${escapeHtml(LOCAL_SELF_EVALUATION_SOURCE)}</p></article><article class="official"><h2>Official course evaluation</h2><p>${escapeHtml(CANVAS_INSTRUCTOR_GSI_GRADE_SOURCE)}</p><button data-command="systemstudioCis310.openCanvas">Open Canvas grades</button></article></section>
<section class="progress-wrap"><div class="progress-head"><span id="roadmap-heading">Local coursework roadmap</span><span id="progress-label">0%</span></div><progress id="roadmap-progress" aria-labelledby="roadmap-heading progress-label" max="100" value="0">0%</progress><p class="muted">A local planning indicator—not completion certified by the instructor or Canvas.</p></section>
<nav class="tabs" role="tablist" aria-label="Coursework tools"><button class="tab" role="tab" tabindex="0" aria-selected="true" aria-controls="roadmap" id="tab-roadmap" data-tab="roadmap">Roadmap</button><button class="tab" role="tab" tabindex="-1" aria-selected="false" aria-controls="capstone" id="tab-capstone" data-tab="capstone">Final presentation</button><button class="tab" role="tab" tabindex="-1" aria-selected="false" aria-controls="grade" id="tab-grade" data-tab="grade">Grade estimate</button><button class="tab" role="tab" tabindex="-1" aria-selected="false" aria-controls="recovery" id="tab-recovery" data-tab="recovery">Deadlines & recovery</button><button class="tab" role="tab" tabindex="-1" aria-selected="false" aria-controls="diagnostics" id="tab-diagnostics" data-tab="diagnostics">Diagnostics & feedback</button></nav>
<section class="panel" role="tabpanel" id="roadmap" aria-labelledby="tab-roadmap"><h2>Assignment Mission Control</h2><p>Requirements below are preparation aids. Open the current Canvas item before acting.</p><div id="coursework-grid" class="grid"></div></section>
<section class="panel" role="tabpanel" id="capstone" aria-labelledby="tab-capstone" hidden><h2>Final-presentation progression and self-evaluation</h2><div class="callout"><strong>One cumulative build:</strong> the registers/DRAM, register-file/ALU, and integrated 4-bit processor assignments build the processor demonstrated in the final presentation. This is not a separate processor redesign. Canvas will publish the exact ISA/program, artifacts, rubric, and presentation format.</div><div id="final-card"></div><section class="card"><h3>How ready do I feel today?</h3><p class="muted">Rate evidence, not optimism: 1 = I need guided help; 3 = I can do it with references; 5 = I can demonstrate and explain it independently.</p><div id="self-ratings" class="ratings"></div><p id="self-summary" class="muted"></p></section></section>
<section class="panel" role="tabpanel" id="grade" aria-labelledby="tab-grade" hidden><h2>Manual final-grade planning estimate</h2><div class="callout"><strong>Not an official grade.</strong> Copy scores from Canvas manually. This local calculator applies the published 15% participation-quiz, 65% homework/implementation, and 20% cumulative final-presentation weights. It identifies the two lowest participation-item percentages, drops those rows, and combines the retained earned/possible points. Canvas and instructor decisions remain authoritative.</div><form id="grade-form"><fieldset><legend>Participation quizzes and in-class evidence checks · 15%</legend><p class="muted">Enter at least three items. The two lowest percentages will be dropped; retained points are then combined so unequal point values remain unequal.</p><div id="quiz-scores"></div><button type="button" class="secondary" id="add-quiz">Add participation item</button></fieldset><fieldset><legend>Three homework + three implementation assignments · 65%</legend><label>Current or anticipated Canvas category percentage <input id="coursework-percent" type="number" min="0" max="100" step="0.01" required></label><p class="muted">Use the category percentage shown/calculated under the current Canvas rules; this avoids guessing how different point totals are normalized.</p></fieldset><fieldset><legend>Cumulative 4-bit processor final presentation · 20%</legend><div class="score-grid"><span>Final presentation</span><label><span class="sr-only">earned</span><input id="final-earned" type="number" min="0" step="0.01" placeholder="earned" value="" aria-label="Final presentation earned points" required></label><label><span class="sr-only">possible</span><input id="final-possible" type="number" min="0.01" step="0.01" placeholder="possible" value="" aria-label="Final presentation possible points" required></label><span></span></div></fieldset><button type="submit">Calculate planning estimate</button></form><div id="grade-result" aria-live="polite"></div></section>
<section class="panel" role="tabpanel" id="recovery" aria-labelledby="tab-recovery" hidden><h2>Canvas deadlines and missed-class recovery</h2><section class="card"><h3>Opt-in Canvas calendar import</h3><p>Export your Canvas calendar as an <code>.ics</code> file, then import it here. Events remain on this device. SystemStudio does not receive live updates and cannot verify that an assignment is published or submitted.</p><div class="actions"><button id="import-ics">Import Canvas .ics</button><button id="clear-ics" class="quiet">Clear imported events</button><button data-command="systemstudioCis310.openCanvas" class="secondary">Open Canvas</button></div><div id="canvas-events"></div></section><section class="card" style="margin-top:12px"><h3>I missed a class</h3><p>Select the meeting to reopen the mapped accessible lesson. Then check Canvas announcements, recordings, activities, and due work; the extension does not infer what changed in class.</p><div class="recover"><label>Meeting <select id="recovery-meeting"></select></label><button id="open-recovery">Open recovery lesson</button></div><div class="actions"><button data-command="systemstudioCis310.openCanvas" class="secondary">Check Canvas</button><button data-command="systemstudioCis310.openPreClassQuestion" class="secondary">Ask before the next class</button></div></section></section>
<section class="panel" role="tabpanel" id="diagnostics" aria-labelledby="tab-diagnostics" hidden><h2>Diagnostics, grading questions, and release checks</h2><section class="card"><h3>Digital Diagnostic Assistant</h3><p>Paste the exact Digital error. The assistant identifies recurring error families and inspection steps; it does not construct a graded circuit.</p><label for="digital-error">Digital error or symptom</label><textarea id="digital-error"></textarea><button id="diagnose">Diagnose the evidence</button><div id="diagnosis" aria-live="polite"></div></section><section class="card" style="margin-top:12px"><h3>Private rubric or grade-review request</h3><p>Build a focused request. Send private grade information through Canvas Inbox or university email, not a public discussion.</p><label>Rubric criterion or item<textarea id="review-criterion"></textarea></label><label>Evidence in my submitted work<textarea id="review-evidence"></textarea></label><label>Feedback or score currently shown<textarea id="review-feedback"></textarea></label><label>Specific clarification or review requested<textarea id="review-question"></textarea></label><button id="copy-review">Copy structured private request</button></section><details class="card staff"><summary><strong>Course staff: Canvas release check</strong></summary><p>Before publishing, verify: item published; submission enabled; rubric visible before work begins; due date/time; required files; collaboration and AI rule; links/recordings accessible; final-project date/time/room/order when announced; and a test student can see the item. This checklist is a release aid, not a Canvas API audit.</p></details><div class="actions"><button data-command="systemstudioCis310.checkEnvironment" class="secondary">Run environment check</button><button data-command="systemstudioCis310.checkAssemblyEnvironment" class="secondary">Check assembly toolchains</button><button data-command="systemstudioCis310.openStudentHelper" class="secondary">Open FAQ</button><button id="reset" class="quiet">Reset local coursework planning</button></div></section>
<p id="notice" class="callout" role="status" aria-live="polite" hidden></p></main><script nonce="${nonce}">
const vscode=acquireVsCodeApi();const data=${data};let state=data.state;const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function send(message){vscode.postMessage(message)}function showNotice(message){const el=document.getElementById('notice');el.textContent=message;el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'nearest'})}
function itemState(id){return state.progress.items[id]||{status:'not-started',completedCheckIds:[]}}function statusLabel(status){return {'not-started':'Not started','in-progress':'In progress','ready-to-submit':'Ready to submit','submitted':'Marked submitted (local only)','receipt-confirmed':'I confirmed the Canvas receipt'}[status]}
function courseCard(item,compact=false){const p=itemState(item.id),title=esc(item.title);const checks=item.checks.map(check=>'<label class="check"><input type="checkbox" data-check="'+esc(check.id)+'" data-id="'+esc(item.id)+'" '+(p.completedCheckIds.includes(check.id)?'checked':'')+'><span>'+esc(check.label)+'</span></label>').join('');const toolActions=(item.kind==='implementation'||item.kind==='final'?'<button class="secondary" data-preflight="'+esc(item.id)+'" aria-label="Run local circuit preflight for '+title+'">Run local circuit preflight</button>':'')+(item.expectedExtensions.includes('asm')?'<button class="secondary" data-command="systemstudioCis310.buildRunAssembly" aria-label="Build or run assembly for '+title+'">Build/run assembly</button>':'');return '<article class="course-card '+(item.kind==='final'?'final':'')+'"><header><div class="stage">'+esc(item.stage)+'</div><h3>'+title+'</h3><p>'+esc(item.summary)+'</p></header><div class="body"><p><strong>Prepare:</strong> '+item.preparation.map(esc).join(' · ')+'</p><div class="status-row"><label>Status <select data-status="'+esc(item.id)+'" aria-label="Local status for '+title+'">'+['not-started','in-progress','ready-to-submit','submitted','receipt-confirmed'].map(s=>'<option value="'+s+'" '+(p.status===s?'selected':'')+'>'+statusLabel(s)+'</option>').join('')+'</select></label></div><div class="checks">'+checks+'</div><div class="actions"><button data-resource="'+esc(item.id)+'" aria-label="Open planning reference for '+title+'">Open planning reference</button>'+toolActions+'<button class="secondary" data-validate="'+esc(item.id)+'" aria-label="Check selected files for '+title+'">Check selected files</button><button class="secondary" data-bundle="'+esc(item.id)+'" aria-label="Create planning ZIP for '+title+'">Create planning ZIP</button><button class="quiet" data-command="systemstudioCis310.openCanvas" aria-label="Open Canvas for '+title+'">Open Canvas</button></div><div class="validation" role="status" aria-live="polite" data-validation-id="'+esc(item.id)+'"></div></div></article>'}
function render(){document.getElementById('roadmap-progress').value=state.summary.percent;document.getElementById('roadmap-progress').textContent=state.summary.percent+'%';document.getElementById('progress-label').textContent=state.summary.percent+'% · '+state.summary.receiptConfirmed+'/'+state.summary.total+' receipts I marked confirmed';document.getElementById('coursework-grid').innerHTML=data.catalog.map(i=>courseCard(i)).join('');const final=data.catalog.find(i=>i.id==='final-project');document.getElementById('final-card').innerHTML=courseCard(final,true);document.getElementById('self-ratings').innerHTML=data.dimensions.map(d=>'<label class="rating"><span>'+esc(d.label)+'</span><select data-self="'+esc(d.id)+'"><option value="">Not rated</option>'+[1,2,3,4,5].map(v=>'<option value="'+v+'" '+(state.progress.finalSelfEvaluation[d.id]===v?'selected':'')+'>'+v+' / 5</option>').join('')+'</select></label>').join('');document.getElementById('self-summary').textContent=state.selfSummary.average===undefined?'No local self-evaluation yet.':state.selfSummary.completed+'/'+state.selfSummary.total+' dimensions rated · local average '+state.selfSummary.average.toFixed(1)+'/5. This is not an instructor grade.';renderEvents()}
function eventDate(event){const date=new Date(event.startsAt);return event.allDay?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeZone:'UTC'}).format(date)+' · all day':new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/Detroit',timeZoneName:'short'}).format(date)}
function renderEvents(){const root=document.getElementById('canvas-events');const events=state.progress.canvasEvents||[];root.innerHTML=events.length?'<h4>Imported CIS 310 events</h4>'+events.slice(0,30).map(e=>'<div class="event"><strong>'+esc(e.title)+'</strong><br><span class="muted">'+esc(eventDate(e))+'</span>'+(e.url?'<br><button class="quiet" data-event-url="'+esc(e.url)+'" aria-label="Open '+esc(e.title)+' in Canvas">Open this Canvas item</button>':'')+'</div>').join(''):'<p class="muted">No explicitly identified CIS 310 events were imported. Check Canvas directly if an event title or link does not identify the course.</p>'}
function relabelQuizzes(){document.querySelectorAll('.quiz-row').forEach((row,index)=>{const number=index+1;row.querySelector('.quiz-label').textContent='Participation item '+number;row.querySelector('.quiz-earned').setAttribute('aria-label','Participation item '+number+' earned points');row.querySelector('.quiz-possible').setAttribute('aria-label','Participation item '+number+' possible points');row.querySelector('.remove-quiz').setAttribute('aria-label','Remove participation item '+number)})}
function addQuiz(earned='',possible=''){const row=document.createElement('div');row.className='score-grid quiz-row';row.innerHTML='<span class="quiz-label">Participation item</span><label><span class="sr-only">Earned points</span><input class="quiz-earned" type="number" min="0" step="0.01" placeholder="earned" value="'+esc(earned)+'" required></label><label><span class="sr-only">Possible points</span><input class="quiz-possible" type="number" min="0.01" step="0.01" placeholder="possible" value="'+esc(possible)+'" required></label><button type="button" class="quiet remove-quiz">×</button>';document.getElementById('quiz-scores').append(row);relabelQuizzes()}
function captureDynamicFocus(){const el=document.activeElement,panel=el?.closest?.('.panel')?.id;if(!panel)return undefined;if(el.matches('[data-status]'))return{panel,selector:'[data-status="'+CSS.escape(el.dataset.status)+'"]'};if(el.matches('[data-check]'))return{panel,selector:'[data-id="'+CSS.escape(el.dataset.id)+'"][data-check="'+CSS.escape(el.dataset.check)+'"]'};if(el.matches('[data-self]'))return{panel,selector:'[data-self="'+CSS.escape(el.dataset.self)+'"]'};return undefined}
function restoreDynamicFocus(saved){if(!saved)return;document.getElementById(saved.panel)?.querySelector(saved.selector)?.focus()}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==button.dataset.tab)}));
document.querySelector('.tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=[...document.querySelectorAll('[data-tab]')],active=document.activeElement,index=tabs.indexOf(active);if(index<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click()});
document.addEventListener('change',event=>{const t=event.target;if(t.matches('[data-status]'))send({type:'set-status',id:t.dataset.status,status:t.value});if(t.matches('[data-check]'))send({type:'toggle-check',id:t.dataset.id,checkId:t.dataset.check});if(t.matches('[data-self]')&&t.value)send({type:'set-self',dimension:t.dataset.self,rating:Number(t.value)})});
document.addEventListener('click',event=>{const t=event.target.closest('button');if(!t)return;if(t.dataset.command)send({type:'command',command:t.dataset.command});if(t.dataset.resource)send({type:'open-resource',id:t.dataset.resource});if(t.dataset.preflight)send({type:'run-preflight',id:t.dataset.preflight});if(t.dataset.validate)send({type:'validate-files',id:t.dataset.validate});if(t.dataset.bundle)send({type:'export-bundle',id:t.dataset.bundle});if(t.dataset.eventUrl)send({type:'open-canvas-event',url:t.dataset.eventUrl});if(t.classList.contains('remove-quiz')){t.closest('.quiz-row').remove();relabelQuizzes()}});
document.getElementById('add-quiz').addEventListener('click',()=>addQuiz());for(let i=0;i<3;i++)addQuiz();document.getElementById('grade-form').addEventListener('submit',event=>{event.preventDefault();const quizzes=[...document.querySelectorAll('.quiz-row')].map(row=>({earned:Number(row.querySelector('.quiz-earned').value),possible:Number(row.querySelector('.quiz-possible').value)}));send({type:'calculate-grade',input:{participationQuizzes:quizzes,courseworkCategoryPercent:Number(document.getElementById('coursework-percent').value),finalProject:{earned:Number(document.getElementById('final-earned').value),possible:Number(document.getElementById('final-possible').value)}}})});
document.getElementById('import-ics').addEventListener('click',()=>send({type:'import-ics'}));document.getElementById('clear-ics').addEventListener('click',()=>send({type:'clear-ics'}));document.getElementById('diagnose').addEventListener('click',()=>send({type:'diagnose',text:document.getElementById('digital-error').value}));document.getElementById('copy-review').addEventListener('click',()=>{const parts=[['Criterion/item',document.getElementById('review-criterion').value],['Evidence in my submitted work',document.getElementById('review-evidence').value],['Feedback/score shown',document.getElementById('review-feedback').value],['Clarification or review requested',document.getElementById('review-question').value]];send({type:'copy-review',text:'CIS 310 private review request\n\n'+parts.map(p=>p[0]+':\n'+p[1].trim()).join('\n\n')})});document.getElementById('reset').addEventListener('click',()=>send({type:'reset'}));
const recovery=document.getElementById('recovery-meeting');recovery.innerHTML=data.meetings.map(m=>'<option value="'+esc(m.resourceId)+'">Meeting '+m.number+' · '+esc(m.isoDate)+' · '+esc(m.topic)+'</option>').join('');document.getElementById('open-recovery').addEventListener('click',()=>send({type:'open-recovery',resourceId:recovery.value}));
window.addEventListener('message',event=>{const m=event.data;if(m.type==='state'){const saved=captureDynamicFocus();state=m.state;render();restoreDynamicFocus(saved)}if(m.type==='error'||m.type==='notice'||m.type==='bundle')showNotice(m.message);if(m.type==='validation'){document.querySelectorAll('[data-validation-id="'+CSS.escape(m.id)+'"]').forEach(root=>{root.innerHTML='<div class="diagnosis"><strong>Local file check</strong><ul>'+m.result.lines.map(x=>'<li>'+esc(x)+'</li>').join('')+m.result.warnings.map(x=>'<li><strong>Review:</strong> '+esc(x)+'</li>').join('')+'</ul><p>This does not validate technical correctness or current Canvas requirements.</p></div>'})}if(m.type==='preflight-result'){document.querySelectorAll('[data-validation-id="'+CSS.escape(m.id)+'"]').forEach(root=>{const r=m.result;root.innerHTML='<div class="diagnosis"><strong>'+esc(r.passed?'Preflight passed':'Preflight needs attention')+': '+esc(r.label)+'</strong><p>'+(r.vectors?esc(r.vectors.toLocaleString())+' public test vectors were requested. ':'')+'This is formative local evidence, not a grade or Canvas submission.</p><pre>'+esc(r.output)+'</pre></div>'})}if(m.type==='diagnosis'){document.getElementById('diagnosis').innerHTML=m.diagnoses.map(d=>'<div class="diagnosis"><strong>'+esc(d.title)+'</strong><p>'+esc(d.explanation)+'</p><ul>'+d.checks.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul></div>').join('')}if(m.type==='grade-result'){const e=m.estimate;document.getElementById('grade-result').innerHTML='<div class="grade-result"><div class="grade-number">'+e.totalPercent.toFixed(2)+'% · '+esc(e.letter)+'</div><p>Participation after two drops: '+e.retainedQuizEarned.toFixed(2)+'/'+e.retainedQuizPossible.toFixed(2)+' retained points = '+e.quizCategoryPercent.toFixed(2)+'% × 15% = '+e.weightedQuizPoints.toFixed(2)+' points<br>Homework/implementation category: '+e.courseworkCategoryPercent.toFixed(2)+'% × 65% = '+e.weightedCourseworkPoints.toFixed(2)+' points<br>Final presentation: '+e.finalProjectPercent.toFixed(2)+'% × 20% = '+e.weightedFinalProjectPoints.toFixed(2)+' points</p><p><strong>Planning estimate only.</strong> Dropped participation rows: '+e.droppedQuizIndexes.map(i=>i+1).join(', ')+'. Canvas drop rules and handling of excused or extra-credit work can differ. Late penalties, missing/unreleased work, rubric decisions, and instructor adjustments can change the official result.</p></div>'}});render();
</script></body></html>`;
}

function parseScore(value: unknown): { earned: number; possible: number } {
  if (!isRecord(value)) throw new Error('Every score needs earned and possible points.');
  return { earned: numberValue(value.earned), possible: numberValue(value.possible) };
}

function numberValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Enter valid numeric scores.');
  return value;
}

function isCourseworkId(value: unknown): value is CourseworkId {
  return typeof value === 'string' && COURSEWORK_IDS.has(value as CourseworkId);
}

function uniqueName(name: string, used: Set<string>): string {
  let candidate = name;
  let index = 2;
  const extension = path.extname(name);
  const stem = path.basename(name, extension);
  while (used.has(candidate.toLowerCase())) candidate = `${stem}-${index++}${extension}`;
  used.add(candidate.toLowerCase());
  return candidate;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function boundedEvidence(value: string): string {
  const normalized = value.trim() || '(Digital returned no textual output.)';
  if (normalized.length <= 12_000) return normalized;
  return `${normalized.slice(0, 7_000)}\n\n… output shortened in this panel; see the SystemStudio CIS 310 output channel …\n\n${normalized.slice(-4_000)}`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
