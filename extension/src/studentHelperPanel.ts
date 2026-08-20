import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import {
  answerStudentQuestion,
  parseStudentHelperRequest,
  type StudentHelperAction,
  type StudentHelperReply
} from './core/studentHelper';

export class StudentHelperPanel implements vscode.Disposable {
  private static current: StudentHelperPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  static async show(context: vscode.ExtensionContext): Promise<void> {
    if (StudentHelperPanel.current) {
      StudentHelperPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      return;
    }
    StudentHelperPanel.current = new StudentHelperPanel(context);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(context: vscode.ExtensionContext) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.studentHelper',
      'CIS 310 Help Center',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = helperHtml(this.panel.webview);
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (message: unknown) => {
      const request = parseStudentHelperRequest(message);
      if (!request) return;
      if (request.type === 'action') {
        await executeStudentHelperAction(request.action);
        return;
      }
      await this.panel.webview.postMessage({ type: 'reply', reply: answerStudentQuestion(request.question) });
    }, undefined, this.disposables);
  }

  dispose(): void {
    StudentHelperPanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }
}

export async function executeStudentHelperAction(action: StudentHelperAction): Promise<void> {
  const commands: Record<StudentHelperAction, string> = {
    'open-canvas': 'systemstudioCis310.openCanvas',
    'open-ai-tutor': 'systemstudioCis310.openAiTutor',
    'ask-before-class': 'systemstudioCis310.openPreClassQuestion',
    'open-calendar': 'systemstudioCis310.openCourseCalendar',
    'open-syllabus': 'systemstudioCis310.openSyllabus',
    'open-materials': 'systemstudioCis310.openMaterialsIndex',
    'open-learning': 'systemstudioCis310.openPracticeCenter',
    'open-guided-labs': 'systemstudioCis310.openGuidedLabs',
    'practice-now': 'systemstudioCis310.startQuickPractice',
    'start-tutorial': 'systemstudioCis310.startTutorial',
    'check-environment': 'systemstudioCis310.checkEnvironment',
    'setup-digital': 'systemstudioCis310.setupDigital',
    'create-circuit': 'systemstudioCis310.createCircuit',
    'create-assembly-lab': 'systemstudioCis310.createAssemblyLab',
    'assembly-guide': 'systemstudioCis310.openMasmGuide'
  };
  await vscode.commands.executeCommand(commands[action]);
}

function helperHtml(webview: vscode.Webview): string {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>CIS 310 Help Center</title><style>
:root{color-scheme:light dark}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}
.shell{max-width:900px;margin:0 auto;padding:24px 24px 110px}h1{margin:0 0 6px}.notice{border-left:4px solid var(--vscode-editorWarning-foreground);padding:10px 13px;background:var(--vscode-textBlockQuote-background);line-height:1.45}.support-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}.support-card{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:14px;background:var(--vscode-sideBar-background)}.support-card h2{font-size:1.05rem;margin:0 0 7px}.support-card p{line-height:1.4;color:var(--vscode-descriptionForeground)}
.quick{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.quick button,.actions button{cursor:pointer;border:1px solid var(--vscode-panel-border);border-radius:4px;padding:7px 11px;color:var(--vscode-foreground);background:var(--vscode-button-secondaryBackground)}
#history{display:grid;gap:14px;margin:18px 0}.message{border:1px solid var(--vscode-panel-border);border-radius:7px;padding:14px;background:var(--vscode-sideBar-background)}.student{border-left:4px solid var(--vscode-focusBorder)}.helper{border-left:4px solid var(--vscode-testing-iconPassed)}
.message h2{font-size:1.05rem;margin:0 0 8px}.message p,.message li{line-height:1.45}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0}
form{display:flex;gap:8px;position:sticky;bottom:0;padding:14px 0;background:var(--vscode-editor-background)}input{flex:1;padding:9px 10px;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border)}form button,.support-card button{border:0;padding:8px 15px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);cursor:pointer}.chat-widget{position:fixed;right:22px;bottom:20px;z-index:4;display:grid;justify-items:end;gap:10px}.welcome{width:min(350px,calc(100vw - 44px));border:1px solid var(--vscode-panel-border);border-radius:12px;padding:16px;background:var(--vscode-editorWidget-background);box-shadow:0 8px 28px var(--vscode-widget-shadow)}.welcome[hidden]{display:none}.welcome-head{display:flex;justify-content:space-between;gap:12px}.welcome h2{margin:0 0 5px;font-size:1.08rem}.welcome p{margin:0;line-height:1.45}.welcome-close{border:0;background:transparent;color:var(--vscode-foreground);cursor:pointer;font-size:1.2rem}.chat-bubble{width:60px;height:60px;border:0;border-radius:50%;display:grid;place-items:center;background:var(--vscode-button-background);color:var(--vscode-button-foreground);box-shadow:0 6px 20px var(--vscode-widget-shadow);cursor:pointer;font-size:1.5rem}.chat-bubble:focus-visible{outline:3px solid var(--vscode-focusBorder);outline-offset:3px}@media(max-width:650px){.support-grid{grid-template-columns:1fr}}
</style></head><body><main class="shell"><h1>CIS 310 Help Center</h1><p class="notice"><strong>Two distinct helpers:</strong> this page’s FAQ chat is local and deterministic. U-M Maizey is the optional course-grounded AI tutor in Canvas. Attempt first and use the tutor for hints or reasoning feedback—not answers or submission-ready work. Neither helper controls deadlines, grades work, or submits coursework.</p>
<section class="support-grid"><article class="support-card"><h2>Ask the AI learning coach</h2><p>Open U-M Maizey with your own U-M login. Bring your attempt; request one hint, an analogous example, or feedback on your reasoning.</p><button type="button" data-action="open-ai-tutor">Open as learning coach</button></article><article class="support-card"><h2>Ask before class</h2><p>Structure a complex question for the Canvas discussion so the instructor can adapt the next lecture.</p><button type="button" data-action="ask-before-class">Draft a pre-class question</button></article></section>
<div class="quick" aria-label="Common FAQ questions"><button data-question="What should I read and watch before class?">Prepare before class</button><button data-question="How can I practice and track my learning?">Practice & progress</button><button data-question="Can the AI tutor give me an assignment answer or write my code?">AI-use boundary</button><button data-question="What is due and where do I submit?">Submission checklist</button><button data-question="How do I save multiple Digital circuits without overwriting?">Save multiple circuits</button><button data-question="Why does processor analysis say connected to the clock?">Clock analysis error</button><button data-question="I cannot see the assignment tab or lecture video">Missing Canvas item</button><button data-question="Which assembly profile should I use?">MASM / NASM</button><button data-question="What is an AI tutor?">What is the AI tutor?</button><button data-question="I am stuck and need help">I’m stuck</button></div>
<section id="history" aria-live="polite"></section><form id="form"><label for="question" style="position:absolute;left:-10000px">Ask a question</label><input id="question" maxlength="2000" placeholder="Ask about a topic, tool, deadline, or confusion…" autocomplete="off"><button type="submit">Ask</button></form></main>
<aside class="chat-widget" aria-label="CIS 310 FAQ chat"><section id="welcome" class="welcome"><div class="welcome-head"><div><h2>We’re here for your CIS 310 questions.</h2><p>Ask the local FAQ, open the AI tutor, or send a question before class.</p></div><button id="welcomeClose" class="welcome-close" aria-label="Close welcome message">×</button></div></section><button id="chatBubble" class="chat-bubble" aria-label="Open question chat" aria-expanded="true">💬</button></aside>
<script nonce="${nonce}">const vscode=acquireVsCodeApi();const history=document.getElementById('history');const input=document.getElementById('question');
function addStudent(text){const box=document.createElement('article');box.className='message student';const h=document.createElement('h2');h.textContent='You';const p=document.createElement('p');p.textContent=text;box.append(h,p);history.append(box)}
function addReply(reply){const box=document.createElement('article');box.className='message helper';const h=document.createElement('h2');h.textContent=reply.title;box.append(h);reply.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;box.append(p)});if(reply.checklist.length){const ul=document.createElement('ul');reply.checklist.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li)});box.append(ul)}const actions=document.createElement('div');actions.className='actions';reply.actions.forEach(action=>{const button=document.createElement('button');button.type='button';button.textContent=action.label;button.addEventListener('click',()=>vscode.postMessage({type:'action',action:action.id}));actions.append(button)});box.append(actions);history.append(box);box.scrollIntoView({behavior:'smooth',block:'end'})}
function ask(text){const clean=text.trim();if(!clean)return;addStudent(clean);vscode.postMessage({type:'ask',question:clean});input.value=''}
document.getElementById('form').addEventListener('submit',event=>{event.preventDefault();ask(input.value)});document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>vscode.postMessage({type:'action',action:button.dataset.action})));const welcome=document.getElementById('welcome'),bubble=document.getElementById('chatBubble');function setWelcome(open){welcome.hidden=!open;bubble.setAttribute('aria-expanded',String(open));if(open)input.focus()}bubble.addEventListener('click',()=>setWelcome(welcome.hidden));document.getElementById('welcomeClose').addEventListener('click',()=>setWelcome(false));window.addEventListener('message',event=>{if(event.data?.type==='reply')addReply(event.data.reply)});input.focus();</script></body></html>`;
}
