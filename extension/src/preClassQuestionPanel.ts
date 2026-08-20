import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import { PRE_CLASS_MODULES } from './core/learningResources';
import {
  canvasDiscussionUri,
  formatPreClassQuestion,
  parsePreClassQuestionRequest
} from './core/preClassQuestion';

const DEFAULT_DISCUSSION_URL = 'https://canvas.umd.umich.edu/courses/552144/discussion_topics';

export class PreClassQuestionPanel implements vscode.Disposable {
  private static current: PreClassQuestionPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  static show(context: vscode.ExtensionContext): void {
    if (PreClassQuestionPanel.current) {
      PreClassQuestionPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      return;
    }
    PreClassQuestionPanel.current = new PreClassQuestionPanel(context);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(context: vscode.ExtensionContext) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.preClassQuestion',
      'Ask Before Class',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = questionHtml(this.panel.webview);
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (rawMessage: unknown) => {
      const request = parsePreClassQuestionRequest(rawMessage);
      if (!request) {
        await this.panel.webview.postMessage({ type: 'error', message: 'Choose a topic and enter a specific question.' });
        return;
      }
      const configured = vscode.workspace.getConfiguration('systemstudioCis310')
        .get<string>('preClassDiscussionUrl', DEFAULT_DISCUSSION_URL);
      const discussion = canvasDiscussionUri(configured) ?? canvasDiscussionUri(DEFAULT_DISCUSSION_URL);
      if (!discussion) {
        await this.panel.webview.postMessage({ type: 'error', message: 'The Canvas discussion URL is invalid.' });
        return;
      }
      await vscode.env.clipboard.writeText(formatPreClassQuestion(request.draft));
      await vscode.env.openExternal(vscode.Uri.parse(discussion.toString()));
      const anonymous = request.draft.visibility === 'anonymous';
      const message = anonymous
        ? 'Draft copied and Canvas opened. Paste it into Questions Before Class, then choose the anonymous option in Canvas. If Canvas does not show that option, the post will not be anonymous.'
        : 'Draft copied and Canvas opened. Paste it into Questions Before Class and post with your name.';
      await this.panel.webview.postMessage({ type: 'prepared', message });
    }, undefined, this.disposables);
  }

  dispose(): void {
    PreClassQuestionPanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }
}

function questionHtml(webview: vscode.Webview): string {
  const nonce = randomBytes(16).toString('base64');
  const topics = PRE_CLASS_MODULES.map((module) =>
    `<option value="${escapeHtml(`${module.lectureLabel}: ${module.title}`)}">${escapeHtml(`${module.lectureLabel}: ${module.title}`)}</option>`
  ).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>Ask Before Class</title><style>
:root{color-scheme:light dark}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}
.shell{max-width:820px;margin:0 auto;padding:24px}h1{margin:0 0 6px}.lead{font-size:1.05rem;line-height:1.5}.notice{border-left:4px solid var(--vscode-editorWarning-foreground);padding:10px 13px;background:var(--vscode-textBlockQuote-background);line-height:1.45;margin:18px 0}
form{display:grid;gap:15px}.field{display:grid;gap:6px}label{font-weight:600}select,textarea{box-sizing:border-box;width:100%;padding:9px 10px;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);font:inherit}textarea{min-height:88px;resize:vertical}.required{color:var(--vscode-errorForeground)}
.choice{display:grid;gap:8px;border:1px solid var(--vscode-panel-border);padding:12px}.choice label{font-weight:400}.choice small{line-height:1.4;color:var(--vscode-descriptionForeground)}button{justify-self:start;border:0;border-radius:3px;padding:9px 15px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);cursor:pointer;font-weight:600}button:hover{background:var(--vscode-button-hoverBackground)}#status{min-height:24px;line-height:1.45}.success{color:var(--vscode-testing-iconPassed)}.error{color:var(--vscode-errorForeground)}
</style></head><body><main class="shell"><h1>Ask Before Class</h1><p class="lead">Send a focused concept or complex-question request before its scheduled class so the instructor can adjust examples, pacing, or review.</p>
<p class="notice"><strong>Canvas makes the post:</strong> SystemStudio copies your structured draft and opens the course discussion. It does not store the question or use an AI service. An anonymous post is anonymous only when Canvas displays and applies its anonymous option.</p>
<form id="form">
<div class="field"><label for="topic">Upcoming topic <span class="required">required</span></label><select id="topic" required><option value="">Choose the closest lecture…</option>${topics}<option value="Other CIS 310 topic">Other CIS 310 topic</option></select></div>
<div class="field"><label for="question">What should the instructor explain? <span class="required">required</span></label><textarea id="question" maxlength="2000" required placeholder="Ask one specific conceptual question or identify the decision that is unclear."></textarea></div>
<div class="field"><label for="understanding">What do you understand so far?</label><textarea id="understanding" maxlength="2000" placeholder="State the part that already makes sense or your current prediction."></textarea></div>
<div class="field"><label for="confusion">Where does your reasoning become unclear?</label><textarea id="confusion" maxlength="2000" placeholder="Name the step, connection, or assumption where you get lost."></textarea></div>
<div class="field"><label for="attempted">What did you already try or check?</label><textarea id="attempted" maxlength="2000" placeholder="For example: book section, lecture example, truth-table row, exact Digital error, or NASM/GDB evidence."></textarea></div>
<fieldset class="choice"><legend>How should your Canvas post appear?</legend><label><input type="radio" name="visibility" value="named" checked> Post with my name</label><label><input type="radio" name="visibility" value="anonymous"> I want to post anonymously</label><small>Anonymous posting must be enabled by the instructor for that Canvas discussion. You will confirm the actual choice in Canvas before posting.</small></fieldset>
<button type="submit">Copy draft and open Canvas</button><p id="status" role="status" aria-live="polite"></p></form></main>
<script nonce="${nonce}">const vscode=acquireVsCodeApi();const form=document.getElementById('form');const status=document.getElementById('status');form.addEventListener('submit',event=>{event.preventDefault();status.className='';status.textContent='Preparing your Canvas draft…';vscode.postMessage({type:'prepare-question',draft:{topic:document.getElementById('topic').value,question:document.getElementById('question').value,understanding:document.getElementById('understanding').value,confusion:document.getElementById('confusion').value,attempted:document.getElementById('attempted').value,visibility:document.querySelector('input[name="visibility"]:checked').value}})});window.addEventListener('message',event=>{if(event.data?.type==='prepared'){status.className='success';status.textContent=event.data.message}else if(event.data?.type==='error'){status.className='error';status.textContent=event.data.message}});</script></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
