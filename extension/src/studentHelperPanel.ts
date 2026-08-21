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

  static async show(context: vscode.ExtensionContext, starterQuestion?: string): Promise<void> {
    if (StudentHelperPanel.current) {
      StudentHelperPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      if (starterQuestion) await StudentHelperPanel.current.panel.webview.postMessage({ type: 'starter', text: starterQuestion });
      return;
    }
    StudentHelperPanel.current = new StudentHelperPanel(context, starterQuestion);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(context: vscode.ExtensionContext, starterQuestion?: string) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.studentHelper',
      'CIS 310 Help Center',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    const companion = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'media', 'orbit-anime-v1.png')
    );
    this.panel.webview.html = helperHtml(this.panel.webview, companion, starterQuestion ?? '');
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
    'open-coursework': 'systemstudioCis310.openCourseworkCenter',
    'open-unit-tests': 'systemstudioCis310.openUnitTestCenter',
    'open-guided-labs': 'systemstudioCis310.openGuidedLabs',
    'practice-now': 'systemstudioCis310.startQuickPractice',
    'start-tutorial': 'systemstudioCis310.startTutorial',
    'open-setup-guide': 'systemstudioCis310.openSetupGuide',
    'check-environment': 'systemstudioCis310.checkEnvironment',
    'setup-digital': 'systemstudioCis310.setupDigital',
    'create-circuit': 'systemstudioCis310.createCircuit',
    'create-assembly-lab': 'systemstudioCis310.createAssemblyLab',
    'build-run-assembly': 'systemstudioCis310.buildRunAssembly',
    'assembly-guide': 'systemstudioCis310.openNasmGuide'
  };
  await vscode.commands.executeCommand(commands[action]);
}

function helperHtml(webview: vscode.Webview, companion: vscode.Uri, starterQuestion: string): string {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>CIS 310 Help Center</title><style>
:root{color-scheme:light dark}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}
.shell{max-width:900px;margin:0 auto;padding:24px 24px 110px}h1{margin:0 0 6px}.notice{border-left:4px solid var(--vscode-editorWarning-foreground);padding:10px 13px;background:var(--vscode-textBlockQuote-background);line-height:1.45}.support-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}.support-card{border:1px solid var(--vscode-panel-border);border-radius:9px;padding:14px;background:var(--vscode-sideBar-background)}.support-card h2{font-size:1.05rem;margin:0 0 7px}.support-card p{line-height:1.4;color:var(--vscode-descriptionForeground)}
.quick{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.quick button,.actions button{cursor:pointer;border:1px solid var(--vscode-panel-border);border-radius:4px;padding:7px 11px;color:var(--vscode-foreground);background:var(--vscode-button-secondaryBackground)}
#history{display:grid;gap:14px;margin:18px 0}.message{border:1px solid var(--vscode-panel-border);border-radius:7px;padding:14px;background:var(--vscode-sideBar-background)}.student{border-left:4px solid var(--vscode-focusBorder)}.helper{border-left:4px solid var(--vscode-testing-iconPassed)}
.message h2{font-size:1.05rem;margin:0 0 8px}.message p,.message li{line-height:1.45}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0}
form{display:flex;gap:8px;position:sticky;bottom:0;padding:14px 0;background:var(--vscode-editor-background)}input{flex:1;padding:9px 10px;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border)}form button,.support-card button{border:0;padding:8px 15px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);cursor:pointer}.chat-widget{position:fixed;right:22px;bottom:20px;z-index:4;display:grid;justify-items:end;gap:10px}.welcome{width:min(420px,calc(100vw - 44px));border:1px solid var(--vscode-panel-border);border-radius:12px;padding:14px;background:var(--vscode-editorWidget-background);box-shadow:0 8px 28px var(--vscode-widget-shadow)}.welcome[hidden]{display:none}.welcome-head{display:grid;grid-template-columns:92px minmax(0,1fr) auto;gap:12px;align-items:center}.welcome h2{margin:0 0 5px;font-size:1.08rem}.welcome p{margin:0;line-height:1.45}.welcome-close{align-self:start;border:0;background:transparent;color:var(--vscode-foreground);cursor:pointer;font-size:1.2rem}.companion{width:92px;height:92px;object-fit:contain;filter:drop-shadow(0 5px 8px rgba(0,0,0,.35));transform-origin:50% 90%;animation:companion-breathe 2.4s ease-in-out infinite}.chat-bubble{width:82px;height:82px;border:2px solid var(--vscode-focusBorder);border-radius:50%;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#ffcb70 0 23%,var(--vscode-button-background) 72%);box-shadow:0 6px 20px var(--vscode-widget-shadow);cursor:pointer;animation:bubble-float 3.2s ease-in-out infinite}.chat-bubble img{width:78px;height:78px;object-fit:contain;object-position:center bottom;animation:companion-wave 2.8s ease-in-out infinite}.chat-bubble:focus-visible{outline:3px solid var(--vscode-focusBorder);outline-offset:3px}.motion-control{margin:10px 0 0 104px;border:1px solid var(--vscode-panel-border);border-radius:4px;padding:4px 8px;color:var(--vscode-foreground);background:transparent;cursor:pointer;font-size:.78rem}.motion-paused .companion,.motion-paused .chat-bubble,.motion-paused .chat-bubble img{animation:none}@keyframes companion-breathe{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-6px) rotate(1deg)}}@keyframes companion-wave{0%,45%,100%{transform:translateY(0) rotate(0)}55%{transform:translateY(-3px) rotate(-3deg)}65%{transform:translateY(-4px) rotate(3deg)}75%{transform:translateY(-3px) rotate(-2deg)}}@keyframes bubble-float{0%,100%{transform:translateY(0);box-shadow:0 6px 20px var(--vscode-widget-shadow)}50%{transform:translateY(-7px);box-shadow:0 12px 26px var(--vscode-widget-shadow)}}@media(prefers-reduced-motion:reduce){.companion,.chat-bubble,.chat-bubble img{animation:none!important}.motion-control{display:none}}@media(max-width:650px){.support-grid{grid-template-columns:1fr}.welcome-head{grid-template-columns:70px minmax(0,1fr) auto}.companion{width:70px;height:70px}.motion-control{margin-left:82px}}
</style></head><body><main class="shell"><h1>CIS 310 Help Center</h1><p class="notice"><strong>Distinct helpers:</strong> this page’s FAQ chat is local and deterministic. U-M Maizey is the preferred course-grounded tutor after its student App is published and indexed. U-M GPT is the no-cost university general assistant for broader troubleshooting. Attempt first and request hints—not answers or submission-ready work. None controls deadlines, grades work, or submits coursework.</p>
<section class="support-grid"><article class="support-card"><h2>Ask the AI learning coach</h2><p>Choose the course-grounded U-M Maizey tutor, U-M GPT for general troubleshooting, or private offline Orbit. Bring your attempt and request one hint.</p><button type="button" data-action="open-ai-tutor">Choose a learning coach</button></article><article class="support-card"><h2>Run unit tests</h2><p>Discover Digital Testcase components, NASM <code>*.test.asm</code> programs, and public assignment preflights in one private formative center.</p><button type="button" data-action="open-unit-tests">Open Unit Test Center</button></article><article class="support-card"><h2>Ask before class</h2><p>Structure a complex question for the Canvas discussion so the instructor can adapt the next lecture.</p><button type="button" data-action="ask-before-class">Draft a pre-class question</button></article></section>
<div class="quick" aria-label="Common FAQ questions"><button data-question="What should I read and watch before class?">Prepare before class</button><button data-question="How can I practice and track my learning?">Practice & progress</button><button data-question="How do I prepare for the cumulative 4-bit processor final presentation?">Final presentation</button><button data-question="How do I run the local circuit preflight before Canvas?">Circuit preflight</button><button data-question="How does the grade calculator drop the two lowest quizzes?">Grade estimate</button><button data-question="Can the AI tutor give me an assignment answer or write my code?">AI-use boundary</button><button data-question="What is due and where do I submit?">Submission checklist</button><button data-question="How do I save multiple Digital circuits without overwriting?">Save multiple circuits</button><button data-question="Why does processor analysis say connected to the clock?">Clock analysis error</button><button data-question="I cannot see the assignment tab or lecture video">Missing Canvas item</button><button data-question="How do I use the NASM workbench?">NASM workbench</button><button data-question="What is an AI tutor?">What is the AI tutor?</button><button data-question="I am stuck and need help">I’m stuck</button></div>
<section id="history" aria-live="polite"></section><form id="form"><label for="question" style="position:absolute;left:-10000px">Ask a question</label><input id="question" maxlength="2000" placeholder="Ask about a topic, tool, deadline, or confusion…" autocomplete="off" value="${escapeHtml(starterQuestion)}"><button type="submit">Ask</button></form></main>
<aside id="chatWidget" class="chat-widget" aria-label="CIS 310 question assistant"><section id="welcome" class="welcome"><div class="welcome-head"><img class="companion" src="${companion}" alt="" aria-hidden="true"><div><h2>Orbit is ready for your CIS 310 questions.</h2><p>Ask the local FAQ, open the AI tutor, or send a question before class. The animated companion is only a visual guide; the learning and AI-use boundaries above still apply.</p></div><button id="welcomeClose" class="welcome-close" aria-label="Close welcome message">×</button></div><button id="motionControl" class="motion-control" type="button" aria-pressed="false">Pause companion motion</button></section><button id="chatBubble" class="chat-bubble" aria-label="Open CIS 310 question assistant" aria-expanded="true"><img src="${companion}" alt=""></button></aside>
<script nonce="${nonce}">const vscode=acquireVsCodeApi();const history=document.getElementById('history');const input=document.getElementById('question');
function addStudent(text){const box=document.createElement('article');box.className='message student';const h=document.createElement('h2');h.textContent='You';const p=document.createElement('p');p.textContent=text;box.append(h,p);history.append(box)}
function addReply(reply){const box=document.createElement('article');box.className='message helper';const h=document.createElement('h2');h.textContent=reply.title;box.append(h);reply.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;box.append(p)});if(reply.checklist.length){const ul=document.createElement('ul');reply.checklist.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li)});box.append(ul)}const actions=document.createElement('div');actions.className='actions';reply.actions.forEach(action=>{const button=document.createElement('button');button.type='button';button.textContent=action.label;button.addEventListener('click',()=>vscode.postMessage({type:'action',action:action.id}));actions.append(button)});box.append(actions);history.append(box);box.scrollIntoView({behavior:'smooth',block:'end'})}
function ask(text){const clean=text.trim();if(!clean)return;addStudent(clean);vscode.postMessage({type:'ask',question:clean});input.value=''}
document.getElementById('form').addEventListener('submit',event=>{event.preventDefault();ask(input.value)});document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>vscode.postMessage({type:'action',action:button.dataset.action})));const welcome=document.getElementById('welcome'),bubble=document.getElementById('chatBubble'),widget=document.getElementById('chatWidget'),motion=document.getElementById('motionControl');const saved=vscode.getState()||{};function setMotion(paused){widget.classList.toggle('motion-paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Resume companion motion':'Pause companion motion';vscode.setState({...saved,motionPaused:paused})}setMotion(Boolean(saved.motionPaused));motion.addEventListener('click',()=>setMotion(!widget.classList.contains('motion-paused')));function setWelcome(open){welcome.hidden=!open;bubble.setAttribute('aria-expanded',String(open));if(open)input.focus()}bubble.addEventListener('click',()=>setWelcome(welcome.hidden));document.getElementById('welcomeClose').addEventListener('click',()=>setWelcome(false));window.addEventListener('message',event=>{if(event.data?.type==='reply')addReply(event.data.reply);if(event.data?.type==='starter'&&typeof event.data.text==='string'){input.value=event.data.text;input.focus()}});input.focus();</script></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
}
