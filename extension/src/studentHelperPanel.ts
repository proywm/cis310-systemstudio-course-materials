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
      'CIS 310 Student Helper',
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
    'open-calendar': 'systemstudioCis310.openCourseCalendar',
    'open-syllabus': 'systemstudioCis310.openSyllabus',
    'open-materials': 'systemstudioCis310.openMaterialsIndex',
    'open-learning': 'systemstudioCis310.openPracticeCenter',
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
<title>CIS 310 Student Helper</title><style>
:root{color-scheme:light dark}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}
.shell{max-width:900px;margin:0 auto;padding:24px}h1{margin:0 0 6px}.notice{border-left:4px solid var(--vscode-editorWarning-foreground);padding:10px 13px;background:var(--vscode-textBlockQuote-background);line-height:1.45}
.quick{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.quick button,.actions button{cursor:pointer;border:1px solid var(--vscode-panel-border);border-radius:4px;padding:7px 11px;color:var(--vscode-foreground);background:var(--vscode-button-secondaryBackground)}
#history{display:grid;gap:14px;margin:18px 0}.message{border:1px solid var(--vscode-panel-border);border-radius:7px;padding:14px;background:var(--vscode-sideBar-background)}.student{border-left:4px solid var(--vscode-focusBorder)}.helper{border-left:4px solid var(--vscode-testing-iconPassed)}
.message h2{font-size:1.05rem;margin:0 0 8px}.message p,.message li{line-height:1.45}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0}
form{display:flex;gap:8px;position:sticky;bottom:0;padding:14px 0;background:var(--vscode-editor-background)}input{flex:1;padding:9px 10px;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border)}form button{border:0;padding:8px 15px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);cursor:pointer}
</style></head><body><main class="shell"><h1>CIS 310 Student Helper</h1><p class="notice"><strong>Evidence and routing assistant:</strong> this local helper does not call an external AI service, know current deadlines, grade work, or submit to Canvas. Verify requirements and submit in Fall 2026 Canvas.</p>
<div class="quick" aria-label="Common questions"><button data-question="What should I read and watch before class?">Prepare before class</button><button data-question="How can I practice and track my learning?">Practice & progress</button><button data-question="What is due and where do I submit?">Due dates & submission</button><button data-question="What are the three homework topics?">Three homework items</button><button data-question="Digital will not open over SSH">Digital / SSH</button><button data-question="Which assembly profile should I use?">MASM / NASM</button><button data-question="I am stuck and need help">I’m stuck</button></div>
<section id="history" aria-live="polite"></section><form id="form"><label for="question" style="position:absolute;left:-10000px">Ask a question</label><input id="question" maxlength="2000" placeholder="Ask about a topic, tool, deadline, or confusion…" autocomplete="off"><button type="submit">Ask</button></form></main>
<script nonce="${nonce}">const vscode=acquireVsCodeApi();const history=document.getElementById('history');const input=document.getElementById('question');
function addStudent(text){const box=document.createElement('article');box.className='message student';const h=document.createElement('h2');h.textContent='You';const p=document.createElement('p');p.textContent=text;box.append(h,p);history.append(box)}
function addReply(reply){const box=document.createElement('article');box.className='message helper';const h=document.createElement('h2');h.textContent=reply.title;box.append(h);reply.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;box.append(p)});if(reply.checklist.length){const ul=document.createElement('ul');reply.checklist.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li)});box.append(ul)}const actions=document.createElement('div');actions.className='actions';reply.actions.forEach(action=>{const button=document.createElement('button');button.type='button';button.textContent=action.label;button.addEventListener('click',()=>vscode.postMessage({type:'action',action:action.id}));actions.append(button)});box.append(actions);history.append(box);box.scrollIntoView({behavior:'smooth',block:'end'})}
function ask(text){const clean=text.trim();if(!clean)return;addStudent(clean);vscode.postMessage({type:'ask',question:clean});input.value=''}
document.getElementById('form').addEventListener('submit',event=>{event.preventDefault();ask(input.value)});document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));window.addEventListener('message',event=>{if(event.data?.type==='reply')addReply(event.data.reply)});input.focus();</script></body></html>`;
}
