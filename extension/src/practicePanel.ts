import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import {
  PRACTICE_TOPICS,
  parsePracticePanelRequest,
  type PracticeAnswerResult,
  type PracticeQuestion,
  type PracticeSelectionOptions
} from './core/practice';
import { preparationModule, preparationUrl } from './core/learningResources';
import type { CourseMaterials } from './courseMaterials';
import type { PracticeStore } from './practiceStore';

interface PracticeSession {
  options: PracticeSelectionOptions;
  questions: PracticeQuestion[];
  index: number;
  answered: boolean;
  results: PracticeAnswerResult[];
}

export class PracticePanel implements vscode.Disposable {
  private static current: PracticePanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private session: PracticeSession | undefined;
  private ready = false;
  private pendingStart: PracticeSelectionOptions | undefined;

  static async show(
    context: vscode.ExtensionContext,
    store: PracticeStore,
    materials: CourseMaterials,
    startOptions?: PracticeSelectionOptions
  ): Promise<void> {
    if (PracticePanel.current) {
      PracticePanel.current.panel.reveal(vscode.ViewColumn.One, false);
      if (startOptions) await PracticePanel.current.start(startOptions);
      else await PracticePanel.current.showHome();
      return;
    }
    const panel = new PracticePanel(context, store, materials);
    PracticePanel.current = panel;
    if (startOptions) await panel.start(startOptions);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(
    context: vscode.ExtensionContext,
    private readonly store: PracticeStore,
    private readonly materials: CourseMaterials
  ) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.practice',
      'CIS 310 Learning',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = practiceHtml(this.panel.webview, this.store.getDashboard(), this.store.getLearningPath());
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (message: unknown) => {
      const request = parsePracticePanelRequest(message);
      if (!request) return;
      try {
        switch (request.type) {
          case 'ready':
            this.ready = true;
            if (this.pendingStart) {
              const pending = this.pendingStart;
              this.pendingStart = undefined;
              await this.start(pending);
            }
            break;
          case 'start':
            await this.start(request);
            break;
          case 'answer':
            await this.answer(request);
            break;
          case 'next':
            await this.next();
            break;
          case 'toggle-save': {
            const saved = await this.store.toggleSaved(request.questionId);
            await this.panel.webview.postMessage({ type: 'saved', questionId: request.questionId, saved });
            break;
          }
          case 'reflect':
            await this.store.reflect(request.questionId, request.reflection);
            await this.panel.webview.postMessage({ type: 'reflected', questionId: request.questionId, reflection: request.reflection });
            break;
          case 'open-resource':
            await vscode.commands.executeCommand('systemstudioCis310.openCourseMaterial', request.resourceId);
            break;
          case 'open-preparation': {
            if (request.target === 'lecture') {
              await vscode.commands.executeCommand('systemstudioCis310.openCourseMaterial', request.resourceId);
              break;
            }
            const url = preparationUrl(request.resourceId, request.target, request.readingIndex);
            if (url) await vscode.env.openExternal(vscode.Uri.parse(url));
            break;
          }
          case 'toggle-preparation':
            await this.store.togglePreparation(request.resourceId, request.field);
            await this.showHome(false);
            break;
          case 'open-help':
            await vscode.commands.executeCommand(
              request.destination === 'faq'
                ? 'systemstudioCis310.openStudentHelper'
                : request.destination === 'ai-tutor'
                  ? 'systemstudioCis310.openAiTutor'
                  : 'systemstudioCis310.openPreClassQuestion'
            );
            break;
          case 'home':
            await this.showHome();
            break;
          case 'reset':
            await this.confirmReset();
            break;
        }
      } catch (error) {
        await vscode.window.showErrorMessage(`CIS 310 Learning: ${errorMessage(error)}`);
      }
    }, undefined, this.disposables);
  }

  dispose(): void {
    PracticePanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }

  private async start(options: PracticeSelectionOptions): Promise<void> {
    if (!this.ready) {
      this.pendingStart = options;
      return;
    }
    const questions = this.store.select(options);
    if (questions.length === 0) {
      await this.panel.webview.postMessage({
        type: 'notice',
        message: options.focus === 'saved'
          ? 'No questions are saved yet. Save any practice question and it will appear here.'
          : 'Nothing is due yet. Start a recommended session or choose a topic.'
      });
      await this.showHome(false);
      return;
    }
    this.session = { options, questions, index: 0, answered: false, results: [] };
    await this.postCurrentQuestion();
  }

  private async answer(input: Extract<ReturnType<typeof parsePracticePanelRequest>, { type: 'answer' }>): Promise<void> {
    if (!input || !this.session || this.session.answered) return;
    const question = this.session.questions[this.session.index];
    if (!question || question.id !== input.questionId) return;
    const result = await this.store.answer(input);
    this.session.results.push(result);
    this.session.answered = true;
    await this.panel.webview.postMessage({
      type: 'answer-result',
      mode: this.session.options.mode,
      result: this.session.options.mode === 'practice' ? enrichResult(result, this.materials) : undefined,
      position: this.session.index + 1,
      total: this.session.questions.length,
      isLast: this.session.index === this.session.questions.length - 1
    });
  }

  private async next(): Promise<void> {
    if (!this.session || !this.session.answered) return;
    if (this.session.index >= this.session.questions.length - 1) {
      await this.finishSession();
      return;
    }
    this.session.index += 1;
    this.session.answered = false;
    await this.postCurrentQuestion();
  }

  private async postCurrentQuestion(): Promise<void> {
    if (!this.session) return;
    const question = this.session.questions[this.session.index];
    if (!question) return;
    const progress = this.store.getProgress().questions[question.id];
    await this.panel.webview.postMessage({
      type: 'question',
      mode: this.session.options.mode,
      question: {
        id: question.id,
        topicId: question.topicId,
        topicTitle: PRACTICE_TOPICS.find((topic) => topic.id === question.topicId)?.title ?? question.topicId,
        difficulty: question.difficulty,
        prompt: question.prompt,
        options: question.options,
        hint: this.session.options.mode === 'practice' ? question.hint : undefined,
        relatedTitle: this.materials.getResource(question.resourceId)?.title ?? 'Related course material',
        resourceId: question.resourceId,
        saved: progress?.flagged ?? false
      },
      position: this.session.index + 1,
      total: this.session.questions.length
    });
  }

  private async finishSession(): Promise<void> {
    if (!this.session) return;
    const completed = this.session;
    const correct = completed.results.filter((result) => result.correct).length;
    const confidentMisses = completed.results.filter((result) => !result.correct && result.confidence === 'high').length;
    const uncertainWins = completed.results.filter((result) => result.correct && result.confidence === 'low').length;
    this.session = undefined;
    await this.panel.webview.postMessage({
      type: 'summary',
      mode: completed.options.mode,
      correct,
      total: completed.results.length,
      confidentMisses,
      uncertainWins,
      results: completed.options.mode === 'quiz'
        ? completed.results.map((result) => enrichResult(result, this.materials))
        : [],
      dashboard: this.store.getDashboard()
    });
  }

  private async showHome(clearSession = true): Promise<void> {
    if (clearSession) this.session = undefined;
    await this.panel.webview.postMessage({
      type: 'home', dashboard: this.store.getDashboard(), learningPath: this.store.getLearningPath()
    });
  }

  private async confirmReset(): Promise<void> {
    const decision = await vscode.window.showWarningMessage(
      'Reset all local CIS 310 reading/video checkmarks, practice history, saved questions, confidence checks, and review dates?',
      { modal: true },
      'Reset Local Progress'
    );
    if (decision !== 'Reset Local Progress') return;
    await this.store.reset();
    this.session = undefined;
    await this.panel.webview.postMessage({
      type: 'home', dashboard: this.store.getDashboard(), learningPath: this.store.getLearningPath(), reset: true
    });
  }
}

function enrichResult(result: PracticeAnswerResult, materials: CourseMaterials): object {
  const preparation = preparationModule(result.question.resourceId);
  return {
    ...result,
    relatedTitle: materials.getResource(result.question.resourceId)?.title ?? 'Related course material',
    preparation: preparation ? {
      readings: result.question.sourceMap.readingIndexes.map((index) => ({
        index,
        title: preparation.readings[index]?.title,
        focus: preparation.readings[index]?.focus
      })),
      videos: result.question.sourceMap.videoIndexes.map((index) => ({
        index,
        title: preparation.authorVideos[index]?.title,
        focus: preparation.authorVideos[index]?.focus
      }))
    } : undefined
  };
}

function practiceHtml(
  webview: vscode.Webview,
  dashboard: ReturnType<PracticeStore['getDashboard']>,
  learningPath: ReturnType<PracticeStore['getLearningPath']>
): string {
  const nonce = randomBytes(16).toString('base64');
  const initialDashboard = JSON.stringify(dashboard).replaceAll('<', '\\u003c');
  const initialLearningPath = JSON.stringify(learningPath).replaceAll('<', '\\u003c');
  const topics = JSON.stringify(PRACTICE_TOPICS).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>CIS 310 Learning</title><style>
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family);font-size:14px}.shell{width:min(960px,calc(100% - 32px));margin:0 auto;padding:24px 0 52px}button,select{font:inherit}.topbar{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:22px}.eyebrow{color:var(--vscode-descriptionForeground);font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;font-weight:700}.topbar h1{margin:3px 0 5px;font-size:1.75rem}.subtitle{margin:0;color:var(--vscode-descriptionForeground);line-height:1.45}.privacy{white-space:nowrap;border:1px solid var(--vscode-testing-iconPassed);border-radius:999px;padding:6px 10px;color:var(--vscode-testing-iconPassed);font-size:.78rem}.hero{border:1px solid var(--vscode-focusBorder);border-radius:12px;padding:22px;background:linear-gradient(135deg,color-mix(in srgb,var(--vscode-focusBorder) 13%,var(--vscode-sideBar-background)),var(--vscode-sideBar-background));box-shadow:0 8px 28px color-mix(in srgb,var(--vscode-widget-shadow) 35%,transparent)}.hero h2{margin:0 0 8px;font-size:1.35rem}.hero p{line-height:1.5;max-width:760px}.actions{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-top:16px}.primary,.secondary,.quiet,.topic-button,.choice,.confidence,.reflection{cursor:pointer;border-radius:6px;padding:9px 13px}.primary{border:0;color:var(--vscode-button-foreground);background:var(--vscode-button-background);font-weight:650}.primary:hover{background:var(--vscode-button-hoverBackground)}.primary:disabled{cursor:not-allowed;opacity:.45}.secondary{border:0;color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}.quiet{border:1px solid var(--vscode-panel-border);color:var(--vscode-foreground);background:transparent}.section{margin-top:25px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:12px}.section h2{margin:0;font-size:1.18rem}.section-note{color:var(--vscode-descriptionForeground);font-size:.83rem}.metrics{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:10px}.metric{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:14px;background:var(--vscode-sideBar-background)}.metric strong{display:block;font-size:1.45rem}.metric span{color:var(--vscode-descriptionForeground);font-size:.82rem}.insight{border-left:4px solid var(--vscode-charts-blue);padding:11px 13px;margin-top:12px;background:var(--vscode-textBlockQuote-background);line-height:1.5}.topics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.topic{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:15px;background:var(--vscode-sideBar-background)}.topic h3{font-size:1rem;margin:0 0 6px}.topic p{color:var(--vscode-descriptionForeground);line-height:1.4;min-height:39px}.topic-meta{display:flex;justify-content:space-between;color:var(--vscode-descriptionForeground);font-size:.8rem;margin:10px 0 5px}.bar{height:6px;border-radius:99px;overflow:hidden;background:var(--vscode-progressBar-background)}.bar div{height:100%;background:var(--vscode-testing-iconPassed)}.topic-button{margin-top:12px;border:1px solid var(--vscode-button-background);color:var(--vscode-button-background);background:transparent}.custom{display:flex;gap:10px;align-items:end;flex-wrap:wrap;border:1px solid var(--vscode-panel-border);border-radius:9px;padding:15px;background:var(--vscode-sideBar-background)}label{display:grid;gap:5px;color:var(--vscode-descriptionForeground);font-size:.82rem}select{min-width:145px;padding:7px;color:var(--vscode-dropdown-foreground);background:var(--vscode-dropdown-background);border:1px solid var(--vscode-dropdown-border)}.fine{font-size:.8rem;color:var(--vscode-descriptionForeground);line-height:1.45}.screen[hidden]{display:none!important}.session-head{display:grid;gap:8px;margin-bottom:18px}.session-line{display:flex;justify-content:space-between;gap:10px;color:var(--vscode-descriptionForeground);font-size:.84rem}.session-bar{height:7px;background:var(--vscode-progressBar-background);border-radius:99px;overflow:hidden}.session-bar div{height:100%;background:var(--vscode-focusBorder);transition:width .2s ease}.question-card{border:1px solid var(--vscode-panel-border);border-radius:12px;padding:22px;background:var(--vscode-sideBar-background)}.question-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:13px}.pill{border-radius:999px;padding:4px 8px;font-size:.75rem;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}.question-card h2{font-size:1.3rem;line-height:1.4;margin:0 0 18px}.choices{display:grid;gap:9px}.choice{text-align:left;border:1px solid var(--vscode-panel-border);color:var(--vscode-foreground);background:var(--vscode-editor-background);line-height:1.4;display:flex;gap:10px;align-items:flex-start}.choice:hover,.choice:focus-visible{border-color:var(--vscode-focusBorder);outline:2px solid var(--vscode-focusBorder);outline-offset:1px}.choice.selected{border-color:var(--vscode-focusBorder);box-shadow:inset 4px 0 var(--vscode-focusBorder)}.choice-letter{font-weight:700;color:var(--vscode-focusBorder)}.confidence-wrap{margin-top:20px;padding-top:16px;border-top:1px solid var(--vscode-panel-border)}.confidence-wrap h3{font-size:.95rem;margin:0 0 9px}.confidence{border:1px solid var(--vscode-panel-border);color:var(--vscode-foreground);background:transparent}.confidence.selected{border-color:var(--vscode-testing-iconPassed);box-shadow:inset 0 -3px var(--vscode-testing-iconPassed)}.hint-box{margin-top:12px;border-left:4px solid var(--vscode-charts-yellow);padding:10px 12px;background:var(--vscode-textBlockQuote-background);line-height:1.45}.feedback{margin-top:16px;border-radius:9px;padding:16px;background:var(--vscode-textBlockQuote-background);border-left:5px solid var(--vscode-testing-iconPassed)}.feedback.incorrect{border-left-color:var(--vscode-testing-iconFailed)}.feedback h3{margin:0 0 7px}.feedback p{line-height:1.5}.takeaway{font-weight:650}.reflection-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.reflection{border:1px solid var(--vscode-panel-border);color:var(--vscode-foreground);background:transparent;padding:6px 9px}.reflection.recorded{border-color:var(--vscode-testing-iconPassed);color:var(--vscode-testing-iconPassed)}.summary-score{font-size:2.6rem;font-weight:750;margin:5px 0}.review-list{display:grid;gap:12px;margin-top:18px}.review{border:1px solid var(--vscode-panel-border);border-radius:8px;padding:15px}.review.correct{border-left:4px solid var(--vscode-testing-iconPassed)}.review.incorrect{border-left:4px solid var(--vscode-testing-iconFailed)}.review h3{font-size:1rem;margin:0 0 7px}.notice-toast{position:fixed;right:18px;bottom:18px;max-width:420px;padding:11px 14px;border-radius:7px;color:var(--vscode-notifications-foreground);background:var(--vscode-notifications-background);border:1px solid var(--vscode-notifications-border);box-shadow:0 4px 16px var(--vscode-widget-shadow);z-index:2}.footer-links{margin-top:28px;padding-top:14px;border-top:1px solid var(--vscode-panel-border);display:flex;justify-content:space-between;gap:12px;align-items:center}.danger{color:var(--vscode-errorForeground);border:0;background:transparent;cursor:pointer}.sr-only{position:absolute;left:-10000px}@media(max-width:700px){.metrics{grid-template-columns:repeat(2,1fr)}.topics{grid-template-columns:1fr}.privacy{white-space:normal}.topbar{flex-direction:column}}@media(prefers-reduced-motion:reduce){.session-bar div{transition:none}}
.prep-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px}.prep-step{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:13px;background:color-mix(in srgb,var(--vscode-editor-background) 72%,transparent)}.prep-step strong{display:block;margin-bottom:6px}.prep-step p{font-size:.82rem;color:var(--vscode-descriptionForeground);margin:7px 0;line-height:1.4}.prep-step .actions{margin-top:10px}.source-tag{display:inline-block;border:1px solid var(--vscode-panel-border);border-radius:999px;padding:1px 6px;margin-right:4px;color:var(--vscode-foreground);font-size:.72rem}.source-tag.core{border-color:var(--vscode-testing-iconPassed);color:var(--vscode-testing-iconPassed)}.source-item{padding:6px 0;border-top:1px solid var(--vscode-panel-border)}.source-item:first-of-type{border-top:0}.source-item button{margin-top:4px}.completion{border:0;background:transparent;color:var(--vscode-foreground);cursor:pointer;padding:5px 0}.completion.done{color:var(--vscode-testing-iconPassed);font-weight:650}.practice-next{border:1px solid var(--vscode-panel-border);border-radius:10px;padding:18px;background:var(--vscode-sideBar-background)}details.section{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:0 14px 14px}details.section summary{cursor:pointer;font-weight:650;padding:14px 0}.prep-list{display:grid;gap:9px}.prep-row{border-top:1px solid var(--vscode-panel-border);padding:12px 0}.prep-row:first-child{border-top:0}.prep-row-head{display:flex;justify-content:space-between;gap:12px}.prep-row h3{font-size:.95rem;margin:0}.prep-row p{margin:5px 0;color:var(--vscode-descriptionForeground);line-height:1.4}.prep-status{white-space:nowrap;font-size:.78rem;color:var(--vscode-descriptionForeground)}.source-links{display:flex;gap:12px;flex-wrap:wrap}.source-links button{border:0;background:transparent;color:var(--vscode-textLink-foreground);cursor:pointer;padding:0}.help-widget{position:fixed;right:22px;bottom:20px;z-index:4;display:grid;justify-items:end;gap:10px}.help-card{width:min(330px,calc(100vw - 44px));border:1px solid var(--vscode-panel-border);border-radius:12px;padding:15px;background:var(--vscode-editorWidget-background);box-shadow:0 8px 28px var(--vscode-widget-shadow)}.help-card[hidden]{display:none}.help-card-head{display:flex;justify-content:space-between;gap:12px;align-items:start}.help-card h2{font-size:1.05rem;margin:0 0 6px}.help-card p{margin:0;color:var(--vscode-descriptionForeground);line-height:1.4}.help-card .actions{margin-top:12px}.help-close{border:0;background:transparent;color:var(--vscode-foreground);cursor:pointer;font-size:1.15rem}.help-bubble{width:58px;height:58px;border:0;border-radius:50%;display:grid;place-items:center;color:var(--vscode-button-foreground);background:var(--vscode-button-background);box-shadow:0 6px 20px var(--vscode-widget-shadow);font-size:1.5rem;cursor:pointer}.help-bubble:focus-visible{outline:3px solid var(--vscode-focusBorder);outline-offset:3px}@media(max-width:700px){.prep-steps{grid-template-columns:1fr}.prep-row-head{display:block}.prep-status{margin-top:4px}}
</style></head><body><main class="shell">
<header class="topbar"><div><div class="eyebrow">Fall 2026 · preparation and formative practice</div><h1>CIS 310 Learning</h1><p class="subtitle">Read → watch → retrieve → explain → review. A self-paced path you can leave and resume.</p></div><div class="privacy">Private on this device · not graded</div></header>
<section id="home" class="screen"></section><section id="session" class="screen" hidden></section><section id="summary" class="screen" hidden></section><div id="toast" class="notice-toast" role="status" aria-live="polite" hidden></div>
<aside class="help-widget" aria-label="CIS 310 help"><section id="helpCard" class="help-card"><div class="help-card-head"><div><h2>Questions? Start here.</h2><p>Use a local FAQ, ask the U-M course tutor, or send a focused question before class.</p></div><button id="helpClose" class="help-close" aria-label="Close help message">×</button></div><div class="actions"><button class="secondary" data-help="faq">FAQ chat</button><button class="secondary" data-help="ai-tutor">AI tutor</button><button class="quiet" data-help="before-class">Ask before class</button></div></section><button id="helpBubble" class="help-bubble" aria-label="Open CIS 310 help" aria-expanded="true">💬</button></aside>
</main><script nonce="${nonce}">
const vscode=acquireVsCodeApi();const TOPICS=${topics};let dashboard=${initialDashboard};let learningPath=${initialLearningPath};let currentQuestion=null;let selectedIndex=null;let confidence=null;let usedHint=false;let startedAt=Date.now();let answered=false;
const home=document.getElementById('home'),session=document.getElementById('session'),summary=document.getElementById('summary'),toast=document.getElementById('toast');
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));const pct=value=>value===undefined?'—':Math.round(value*100)+'%';
function showScreen(target){[home,session,summary].forEach(item=>item.hidden=item!==target);const heading=target.querySelector('h2');if(heading){heading.setAttribute('tabindex','-1');heading.focus()}else target.querySelector('button')?.focus()}
function notify(message){toast.textContent=message;toast.hidden=false;setTimeout(()=>toast.hidden=true,3500)}
function start(mode,focus,topicId,length,resourceId){vscode.postMessage({type:'start',mode,focus,topicId:topicId||undefined,resourceId:resourceId||undefined,length:Number(length)})}
function prepOpen(resourceId,target,readingIndex=0){vscode.postMessage({type:'open-preparation',resourceId,target,readingIndex})}
const helpCard=document.getElementById('helpCard'),helpBubble=document.getElementById('helpBubble');function setHelp(open){helpCard.hidden=!open;helpBubble.setAttribute('aria-expanded',String(open))}helpBubble.onclick=()=>setHelp(helpCard.hidden);document.getElementById('helpClose').onclick=()=>setHelp(false);document.querySelectorAll('[data-help]').forEach(button=>button.onclick=()=>vscode.postMessage({type:'open-help',destination:button.dataset.help}));
function prepStatus(module){if(module.complete)return 'Read · watched · 3/3 questions';const tried=Math.min(module.practiceQuestionsAttempted||0,3);const done=[module.read?'read':null,module.watched?'watched':null,tried?tried+'/3 questions':null].filter(Boolean);return done.length?done.join(' · ')+' done':'Not started'}
function sourceRole(module,type,index){const indexes=type==='reading'?module.readinessSources.readingIndexes:module.readinessSources.videoIndexes;return indexes.includes(index)?'Readiness source':'Additional reference'}
function sourceTag(module,type,index){const role=sourceRole(module,type,index);return '<span class="source-tag '+(role==='Readiness source'?'core':'')+'">'+role+'</span>'}
function bindPreparation(scope){scope.querySelectorAll('[data-prep-open]').forEach(button=>button.onclick=()=>prepOpen(button.dataset.resource,button.dataset.prepOpen,Number(button.dataset.index||0)));scope.querySelectorAll('[data-prep-toggle]').forEach(button=>button.onclick=()=>vscode.postMessage({type:'toggle-preparation',resourceId:button.dataset.resource,field:button.dataset.prepToggle}));scope.querySelectorAll('[data-prep-check]').forEach(button=>button.onclick=()=>start('practice','recommended',undefined,3,button.dataset.resource))}
function renderHome(data,path=learningPath){dashboard=data;learningPath=path||learningPath;const dueLabel=data.due?data.due+' due':'Nothing due';const next=learningPath.find(module=>!module.complete);const completed=learningPath.filter(module=>module.complete).length;home.innerHTML=\`
\${next?\`<section class="hero"><div class="eyebrow">Before class · next preparation</div><h2>\${esc(next.lectureLabel)}: \${esc(next.title)}</h2><p>\${esc(next.focus)}</p><p class="fine">Self-paced: begin with the readiness-tagged sources, use additional references when useful, then try three distinct questions. Feedback opens the mapped source and shows its relevant focus. Your progress stays on this device.</p><div class="prep-steps"><div class="prep-step"><strong>1 · Read for readiness</strong>\${next.readings.map((reading,index)=>\`<div class="source-item"><p>\${sourceTag(next,'reading',index)} \${esc(reading.title)} · \${esc(reading.focus)}</p><button class="quiet" data-prep-open="reading" data-resource="\${next.resourceId}" data-index="\${index}">Open this reading</button></div>\`).join('')}<div><button class="completion \${next.read?'done':''}" data-prep-toggle="read" data-resource="\${next.resourceId}">\${next.read?'✓ Reading step completed':'□ Mark reading step completed'}</button></div></div><div class="prep-step"><strong>2 · Watch for readiness</strong>\${next.authorVideos.map((video,index)=>\`<div class="source-item"><p>\${sourceTag(next,'video',index)} \${esc(video.title)} · \${esc(video.focus)}</p><button class="quiet" data-prep-open="video" data-resource="\${next.resourceId}" data-index="\${index}">Open this video</button></div>\`).join('')}<div><button class="completion \${next.watched?'done':''}" data-prep-toggle="watched" data-resource="\${next.resourceId}">\${next.watched?'✓ Video step completed':'□ Mark video step completed'}</button></div></div><div class="prep-step"><strong>3 · Check readiness</strong><p>\${esc(next.readinessPrompt)}</p><button class="primary" data-prep-check data-resource="\${next.resourceId}">Try 3 questions</button><p><strong>\${Math.min(next.practiceQuestionsAttempted||0,3)} of 3 distinct questions tried.</strong> \${next.practiceAttempts} total local attempt\${next.practiceAttempts===1?'':'s'}.</p></div></div></section>\`:\`<section class="hero"><div class="eyebrow">Preparation path complete</div><h2>All 13 modules are read, watched, and checked</h2><p>Choose spaced review, saved questions, or any lecture preparation below. The dashboard will not send you back to Lecture 1 unless you select it.</p></section>\`}
<section class="section practice-next"><div class="section-head"><h2>Practice and review</h2><div class="section-note">Recommended from your local attempts</div></div><p>\${esc(data.recommendation)}</p><div class="actions"><button id="quick" class="primary">Start 5-question practice</button><button id="due" class="secondary" \${data.due?'':'disabled'}>Review \${esc(dueLabel)}</button><button id="quiz" class="quiet">Take a 10-question quiz</button></div></section>
<section class="section"><div class="section-head"><h2>Your practice evidence</h2><div class="section-note">No grade prediction and no peer comparison</div></div><div class="metrics"><div class="metric"><strong>\${data.attemptedQuestions}/\${data.totalQuestions}</strong><span>questions encountered</span></div><div class="metric"><strong>\${pct(data.accuracy)}</strong><span>practice accuracy</span></div><div class="metric"><strong>\${data.due}</strong><span>ready for review</span></div><div class="metric"><strong>\${data.practiceDays}</strong><span>practice days</span></div></div><div class="insight"><strong>Confidence check:</strong> \${esc(data.confidenceInsight)}</div></section>
<details class="section"><summary>All lecture preparation · \${completed}/\${learningPath.length} read, watched, and checked</summary><div class="prep-list">\${learningPath.map(module=>\`<article class="prep-row"><div class="prep-row-head"><h3>\${esc(module.lectureLabel)} · \${esc(module.title)}</h3><span class="prep-status">\${esc(prepStatus(module))}</span></div><p>\${esc(module.focus)}</p><div class="actions">\${module.readings.map((reading,index)=>\`<button class="quiet" data-prep-open="reading" data-resource="\${module.resourceId}" data-index="\${index}">Read · \${esc(sourceRole(module,'reading',index))} · \${esc(reading.focus)}</button>\`).join('')}\${module.authorVideos.map((video,index)=>\`<button class="quiet" data-prep-open="video" data-resource="\${module.resourceId}" data-index="\${index}">Watch · \${esc(sourceRole(module,'video',index))} · \${esc(video.focus)}</button>\`).join('')}<button class="quiet" data-prep-open="lecture" data-resource="\${module.resourceId}">Open course lecture</button><button class="topic-button" data-prep-check data-resource="\${module.resourceId}">Try 3 questions (\${Math.min(module.practiceQuestionsAttempted||0,3)}/3 tried)</button></div><div class="actions"><button class="completion \${module.read?'done':''}" data-prep-toggle="read" data-resource="\${module.resourceId}">\${module.read?'✓ Reading step':'□ Reading step'}</button><button class="completion \${module.watched?'done':''}" data-prep-toggle="watched" data-resource="\${module.resourceId}">\${module.watched?'✓ Video step':'□ Video step'}</button></div></article>\`).join('')}</div></details>
<section class="section"><div class="section-head"><h2>Practice by topic</h2><div class="section-note">Choose only when you want control</div></div><div class="topics">\${data.topics.map(item=>{const topic=TOPICS.find(t=>t.id===item.id);return \`<article class="topic"><h3>\${esc(item.title)}</h3><p>\${esc(topic?.description||'')}</p><div class="topic-meta"><span>\${item.attemptedQuestions}/\${item.totalQuestions} seen</span><span>\${esc(item.statusLabel)}</span></div><div class="bar" aria-label="\${item.attemptedQuestions} of \${item.totalQuestions} questions encountered"><div style="width:\${item.totalQuestions?item.attemptedQuestions/item.totalQuestions*100:0}%"></div></div><button class="topic-button" data-topic="\${item.id}">Practice this topic</button></article>\`}).join('')}</div></section>
<section class="section"><div class="section-head"><h2>Build a custom session</h2><div class="section-note">Practice shows explanations now; quiz waits until the end</div></div><div class="custom"><label>Topic<select id="topic"><option value="">Mixed topics</option>\${TOPICS.map(t=>\`<option value="\${t.id}">\${esc(t.shortTitle)}</option>\`).join('')}</select></label><label>Session size<select id="length"><option value="5">5 questions</option><option value="10">10 questions</option><option value="15">15 questions</option></select></label><label>Feedback<select id="mode"><option value="practice">Practice · explain now</option><option value="quiz">Quiz · explain at end</option></select></label><button id="customStart" class="primary">Start session</button><button id="saved" class="quiet" \${data.saved?'':'disabled'}>Saved questions (\${data.saved})</button></div><p class="fine">Coverage and accuracy summarize only this local question bank. “Steady practice” is not a mastery certification. Canvas remains authoritative for course requirements and grades.</p></section>
<div class="footer-links"><div><span class="fine">Practice and preparation progress is stored in VS Code extension storage on this device.</span><div class="source-links"><button data-prep-open="book-home" data-resource="lecture-01">Official open-book home</button><button data-prep-open="oer-series" data-resource="lecture-01">ETSU author-video series</button><button data-prep-open="author-channel" data-resource="lecture-01">Author YouTube channel</button></div><p class="fine">Book and video buttons open official external sites, which have their own privacy practices. No Google Drive is used.</p></div><button id="reset" class="danger">Reset local learning progress</button></div>\`;
document.getElementById('quick').onclick=()=>start('practice','recommended',undefined,5);document.getElementById('due').onclick=()=>start('practice','due',undefined,5);document.getElementById('quiz').onclick=()=>start('quiz','recommended',undefined,10);document.querySelectorAll('[data-topic]').forEach(button=>button.onclick=()=>start('practice','recommended',button.dataset.topic,5));document.getElementById('customStart').onclick=()=>start(document.getElementById('mode').value,'recommended',document.getElementById('topic').value,document.getElementById('length').value);document.getElementById('saved').onclick=()=>start('practice','saved',undefined,10);document.getElementById('reset').onclick=()=>vscode.postMessage({type:'reset'});bindPreparation(home);showScreen(home)}
function renderQuestion(message){currentQuestion=message.question;selectedIndex=null;confidence=null;usedHint=false;answered=false;startedAt=Date.now();const q=message.question;session.innerHTML=\`<div class="session-head"><div class="session-line"><span>\${message.mode==='practice'?'Practice · explanation after each answer':'Quiz · explanations at the end'}</span><span>Question \${message.position} of \${message.total}</span></div><div class="session-bar"><div style="width:\${message.position/message.total*100}%"></div></div></div><article class="question-card"><div class="question-meta"><span class="pill">\${esc(q.topicTitle)}</span><span class="pill">\${esc(q.difficulty)}</span><button id="save" class="quiet">\${q.saved?'★ Saved':'☆ Save for review'}</button></div><h2 tabindex="-1">\${esc(q.prompt)}</h2><div class="choices" role="radiogroup" aria-label="Answer choices">\${q.options.map((option,index)=>\`<button class="choice" role="radio" aria-checked="false" data-index="\${index}"><span class="choice-letter">\${String.fromCharCode(65+index)}.</span><span>\${esc(option)}</span></button>\`).join('')}</div>\${q.hint?\`<div class="actions"><button id="hint" class="quiet">Show one hint</button></div><div id="hintBox" class="hint-box" hidden><strong>Hint:</strong> \${esc(q.hint)}</div>\`:''}<div class="confidence-wrap"><h3>Before feedback, how sure are you?</h3><div class="actions"><button class="confidence" data-confidence="low">Not sure yet</button><button class="confidence" data-confidence="medium">Somewhat sure</button><button class="confidence" data-confidence="high">Confident</button></div></div><div class="actions"><button id="submit" class="primary" disabled>Submit answer</button><button id="lesson" class="quiet">Open related lesson</button><button id="leave" class="quiet">End session</button></div><div id="result" aria-live="polite"></div></article>\`;
session.querySelectorAll('[data-index]').forEach(button=>button.onclick=()=>{if(answered)return;selectedIndex=Number(button.dataset.index);session.querySelectorAll('[data-index]').forEach(item=>{const chosen=Number(item.dataset.index)===selectedIndex;item.classList.toggle('selected',chosen);item.setAttribute('aria-checked',String(chosen))});enableSubmit()});session.querySelectorAll('[data-confidence]').forEach(button=>button.onclick=()=>{if(answered)return;confidence=button.dataset.confidence;session.querySelectorAll('[data-confidence]').forEach(item=>item.classList.toggle('selected',item.dataset.confidence===confidence));enableSubmit()});document.getElementById('hint')?.addEventListener('click',()=>{usedHint=true;document.getElementById('hintBox').hidden=false;document.getElementById('hint').disabled=true});document.getElementById('submit').onclick=()=>{if(selectedIndex===null||!confidence)return;answered=true;document.getElementById('submit').disabled=true;vscode.postMessage({type:'answer',questionId:q.id,selectedIndex,confidence,usedHint,durationMs:Date.now()-startedAt})};document.getElementById('save').onclick=()=>vscode.postMessage({type:'toggle-save',questionId:q.id});document.getElementById('lesson').onclick=()=>vscode.postMessage({type:'open-resource',resourceId:q.resourceId});document.getElementById('leave').onclick=()=>{if(confirm('End this session? Answered questions are already saved, and you can continue this module later.'))vscode.postMessage({type:'home'})};showScreen(session)}
function enableSubmit(){document.getElementById('submit').disabled=selectedIndex===null||!confidence}
function renderAnswer(message){const resultBox=document.getElementById('result');if(message.mode==='quiz'){resultBox.innerHTML=\`<div class="feedback"><h3>Answer saved</h3><p>Feedback is hidden until this quiz ends. Your confidence choice is saved with the answer.</p><div class="actions"><button id="next" class="primary">\${message.isLast?'Finish and review':'Next question'}</button></div></div>\`;document.getElementById('next').onclick=()=>vscode.postMessage({type:'next'});return}const r=message.result,q=r.question;resultBox.innerHTML=\`<div class="feedback \${r.correct?'':'incorrect'}"><h3>\${r.correct?'Correct':'Not yet'} · \${esc(r.reviewLabel)}</h3><p><strong>Answer:</strong> \${String.fromCharCode(65+q.correctIndex)}. \${esc(q.options[q.correctIndex])}</p><p>\${esc(q.explanation)}</p><p class="takeaway">Keep: \${esc(q.takeaway)}</p><p class="fine">Related: \${esc(r.relatedTitle)} · Next spaced review: \${new Date(r.nextReviewAt).toLocaleDateString()}</p><div class="actions"><button id="next" class="primary">\${message.isLast?'Finish session':'Next question'}</button><button id="openRelated" class="secondary">Open related lecture</button>\${r.preparation?\`\${r.preparation.readings.map(source=>\`<button class="quiet" data-answer-prep="reading" data-index="\${source.index}">Read: \${esc(source.focus)} · \${esc(source.title)}</button>\`).join('')}\${r.preparation.videos.map(source=>\`<button class="quiet" data-answer-prep="video" data-index="\${source.index}">Watch: \${esc(source.focus)} · \${esc(source.title)}</button>\`).join('')}\`:''}</div>\${(!r.correct||r.confidence==='low')?\`<div><p class="fine">Optional error log — what made this one difficult?</p><div class="reflection-row"><button class="reflection" data-reflect="concept">Concept gap</button><button class="reflection" data-reflect="careless">Careless slip</button><button class="reflection" data-reflect="guessed">Guessed</button><button class="reflection" data-reflect="need-help">Need human help</button></div></div>\`:''}</div>\`;document.getElementById('next').onclick=()=>vscode.postMessage({type:'next'});document.getElementById('openRelated').onclick=()=>vscode.postMessage({type:'open-resource',resourceId:q.resourceId});resultBox.querySelectorAll('[data-answer-prep]').forEach(button=>button.onclick=()=>prepOpen(q.resourceId,button.dataset.answerPrep,Number(button.dataset.index||0)));resultBox.querySelectorAll('[data-reflect]').forEach(button=>button.onclick=()=>vscode.postMessage({type:'reflect',questionId:q.id,reflection:button.dataset.reflect}))}
function renderSummary(message){const score=Math.round(message.correct/message.total*100);summary.innerHTML=\`<section class="hero"><div class="eyebrow">Session complete · formative only</div><h2 tabindex="-1">You finished \${message.total} retrievals</h2><div class="summary-score">\${message.correct}/\${message.total}</div><p>\${score}% in this session. This is practice evidence, not a course grade or a mastery estimate.</p><p>\${message.confidentMisses?message.confidentMisses+' confident '+(message.confidentMisses===1?'miss':'misses')+' should be reviewed first. ':''}\${message.uncertainWins?message.uncertainWins+' correct '+(message.uncertainWins===1?'answer was':'answers were')+' marked uncertain—those are useful review targets.':''}</p><div class="actions"><button id="again" class="primary">Practice five more</button><button id="reviewDue" class="secondary">Review due questions</button><button id="summaryHome" class="quiet">Dashboard</button></div></section>\${message.results.length?\`<section class="section"><h2>Quiz review</h2><div class="review-list">\${message.results.map(r=>\`<article class="review \${r.correct?'correct':'incorrect'}"><h3>\${r.correct?'✓':'Review'} \${esc(r.question.prompt)}</h3><p><strong>Your answer:</strong> \${esc(r.question.options[r.selectedIndex])}</p><p><strong>Correct answer:</strong> \${esc(r.question.options[r.question.correctIndex])}</p><p>\${esc(r.question.explanation)}</p><p class="takeaway">Keep: \${esc(r.question.takeaway)}</p><div class="actions"><button class="topic-button" data-resource="\${r.question.resourceId}">Open \${esc(r.relatedTitle)}</button>\${r.preparation?\`\${r.preparation.readings.map(source=>\`<button class="quiet" data-quiz-prep="reading" data-resource-id="\${r.question.resourceId}" data-index="\${source.index}">Read: \${esc(source.focus)} · \${esc(source.title)}</button>\`).join('')}\${r.preparation.videos.map(source=>\`<button class="quiet" data-quiz-prep="video" data-resource-id="\${r.question.resourceId}" data-index="\${source.index}">Watch: \${esc(source.focus)} · \${esc(source.title)}</button>\`).join('')}\`:''}</div></article>\`).join('')}</div></section>\`:''}\`;
document.getElementById('again').onclick=()=>start('practice','recommended',undefined,5);document.getElementById('reviewDue').onclick=()=>start('practice','due',undefined,5);document.getElementById('summaryHome').onclick=()=>vscode.postMessage({type:'home'});summary.querySelectorAll('[data-resource]').forEach(button=>button.onclick=()=>vscode.postMessage({type:'open-resource',resourceId:button.dataset.resource}));summary.querySelectorAll('[data-quiz-prep]').forEach(button=>button.onclick=()=>prepOpen(button.dataset.resourceId,button.dataset.quizPrep,Number(button.dataset.index||0)));showScreen(summary)}
window.addEventListener('message',event=>{const message=event.data;if(message.type==='home')renderHome(message.dashboard,message.learningPath);else if(message.type==='question')renderQuestion(message);else if(message.type==='answer-result')renderAnswer(message);else if(message.type==='summary')renderSummary(message);else if(message.type==='notice')notify(message.message);else if(message.type==='saved'&&currentQuestion?.id===message.questionId){currentQuestion.saved=message.saved;document.getElementById('save').textContent=message.saved?'★ Saved':'☆ Save for review';notify(message.saved?'Saved for later review':'Removed from saved questions')}else if(message.type==='reflected'){document.querySelector('[data-reflect="'+message.reflection+'"]')?.classList.add('recorded');notify('Added to your local error log')}});renderHome(dashboard,learningPath);vscode.postMessage({type:'ready'});
</script></body></html>`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
