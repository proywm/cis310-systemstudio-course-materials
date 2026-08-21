import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import { COPILOT_COACH_SYSTEM_PROMPT, prepareCoachRequest } from './core/aiCoach';

interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
}

/** Optional learning coach backed by a model the student can access through VS Code. */
export class CopilotCoachPanel implements vscode.Disposable {
  private static current: CopilotCoachPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly turns: ConversationTurn[] = [];
  private requestCancellation: vscode.CancellationTokenSource | undefined;

  static async show(starterPrompt?: string): Promise<void> {
    if (CopilotCoachPanel.current) {
      CopilotCoachPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      if (starterPrompt) await CopilotCoachPanel.current.panel.webview.postMessage({ type: 'starter', text: starterPrompt });
      return;
    }
    CopilotCoachPanel.current = new CopilotCoachPanel(starterPrompt);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(starterPrompt?: string) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.copilotCoach',
      'CIS 310 · Optional GitHub Copilot Coach',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.webview.html = coachHtml(starterPrompt ?? '');
    this.disposables.push(
      this.panel.onDidDispose(() => this.dispose()),
      this.panel.webview.onDidReceiveMessage((value: unknown) => this.handleMessage(value))
    );
  }

  private async handleMessage(value: unknown): Promise<void> {
    if (!value || typeof value !== 'object') return;
    const message = value as { type?: unknown; text?: unknown };
    if (message.type === 'cancel') {
      this.requestCancellation?.cancel();
      return;
    }
    if (message.type !== 'ask' || typeof message.text !== 'string') return;
    const prepared = prepareCoachRequest(message.text);
    if (!prepared.allowed) {
      await this.panel.webview.postMessage({ type: 'boundary', text: prepared.explanation });
      return;
    }
    let models: readonly vscode.LanguageModelChat[];
    try {
      models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
    } catch (error) {
      await this.panel.webview.postMessage({
        type: 'unavailable',
        text: `GitHub Copilot model access was not authorized for this VS Code account: ${error instanceof Error ? error.message : String(error)}`
      });
      return;
    }
    const model = models[0];
    if (!model) {
      await this.panel.webview.postMessage({
        type: 'unavailable',
        text: 'No GitHub Copilot language model is available for this VS Code account. Sign in to an eligible account or use the U-M Maizey course tutor in Canvas.'
      });
      return;
    }

    this.requestCancellation?.dispose();
    this.requestCancellation = new vscode.CancellationTokenSource();
    this.turns.push({ role: 'user', text: message.text.trim() });
    const boundedHistory = this.turns.slice(-8);
    const messages = [
      vscode.LanguageModelChatMessage.User(COPILOT_COACH_SYSTEM_PROMPT),
      ...boundedHistory.map((turn) => turn.role === 'user'
        ? vscode.LanguageModelChatMessage.User(
          turn === boundedHistory.at(-1) ? prepared.prompt : turn.text
        )
        : vscode.LanguageModelChatMessage.Assistant(turn.text))
    ];
    await this.panel.webview.postMessage({ type: 'start', model: `${model.vendor} · ${model.family}` });
    let responseText = '';
    try {
      const response = await model.sendRequest(messages, {}, this.requestCancellation.token);
      for await (const fragment of response.text) {
        responseText += fragment;
        await this.panel.webview.postMessage({ type: 'delta', text: fragment });
      }
      if (responseText.trim()) this.turns.push({ role: 'assistant', text: responseText.trim() });
      await this.panel.webview.postMessage({ type: 'done' });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await this.panel.webview.postMessage({
        type: 'error',
        text: this.requestCancellation.token.isCancellationRequested ? 'Request stopped.' : `The Copilot coach could not respond: ${detail}`
      });
    } finally {
      this.requestCancellation.dispose();
      this.requestCancellation = undefined;
    }
  }

  dispose(): void {
    CopilotCoachPanel.current = undefined;
    this.requestCancellation?.cancel();
    this.requestCancellation?.dispose();
    while (this.disposables.length) this.disposables.pop()?.dispose();
  }
}

function coachHtml(starterPrompt: string): string {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<title>CIS 310 Optional GitHub Copilot Coach</title><style nonce="${nonce}">
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font:1rem/1.55 var(--vscode-font-family)}main{width:min(100% - 2rem,76ch);margin:auto;padding:24px 0 120px}h1{line-height:1.2}.notice{border-left:5px solid var(--vscode-focusBorder);padding:12px 15px;background:var(--vscode-editorWidget-background)}#history{display:grid;gap:12px;margin:20px 0}.message{white-space:pre-wrap;border:1px solid var(--vscode-panel-border);border-radius:7px;padding:13px;background:var(--vscode-sideBar-background)}.user{border-left:5px solid var(--vscode-focusBorder)}.coach{border-left:5px solid var(--vscode-testing-iconPassed)}.error{border-left:5px solid var(--vscode-testing-iconFailed)}form{position:fixed;left:0;right:0;bottom:0;display:flex;gap:8px;padding:13px max(1rem,calc((100vw - 76ch)/2));background:var(--vscode-editor-background);border-top:1px solid var(--vscode-panel-border)}textarea{flex:1;min-height:64px;resize:vertical;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);padding:8px;font:inherit}button{border:0;border-radius:4px;padding:8px 13px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);font:inherit;cursor:pointer}button.secondary{color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}button:focus-visible,textarea:focus-visible{outline:3px solid var(--vscode-focusBorder);outline-offset:2px}@media(max-width:36rem){form{flex-wrap:wrap}textarea{flex-basis:100%}}
</style></head><body><main><h1>Optional GitHub Copilot learning coach</h1><p class="notice"><strong>This is not Maizey and it is not automatic.</strong> It uses a GitHub Copilot model available to the student’s signed-in VS Code account only after the student submits a prompt. No instructor API key is used. The extension blocks direct-solution requests before sending and does not attach files, Canvas data, grades, or course records.</p><div id="history" aria-live="polite"></div></main><form id="form"><label for="question" style="position:absolute;left:-10000px">Question for the learning coach</label><textarea id="question" maxlength="6000" placeholder="Describe your attempt and the earliest step that is unclear…">${escapeHtml(starterPrompt)}</textarea><button id="ask" type="submit">Ask coach</button><button id="cancel" class="secondary" type="button" hidden>Stop</button></form>
<script nonce="${nonce}">const vscode=acquireVsCodeApi(),history=document.getElementById('history'),question=document.getElementById('question'),ask=document.getElementById('ask'),cancel=document.getElementById('cancel');let active;
function message(text,kind,label){const box=document.createElement('section');box.className='message '+kind;const strong=document.createElement('strong');strong.textContent=label;const body=document.createElement('div');body.textContent=text;box.append(strong,body);history.append(box);box.scrollIntoView({block:'end'});return body}
function setBusy(busy){ask.disabled=busy;cancel.hidden=!busy;question.disabled=busy}
document.getElementById('form').addEventListener('submit',event=>{event.preventDefault();const text=question.value.trim();if(!text)return;message(text,'user','You');vscode.postMessage({type:'ask',text});question.value='';setBusy(true)});cancel.addEventListener('click',()=>vscode.postMessage({type:'cancel'}));window.addEventListener('message',event=>{const data=event.data||{};if(data.type==='starter'){question.value=data.text;question.focus()}else if(data.type==='start'){active=message('','coach','Coach · '+data.model)}else if(data.type==='delta'&&active){active.textContent+=data.text}else if(data.type==='boundary'||data.type==='unavailable'||data.type==='error'){message(data.text,'error',data.type==='boundary'?'Learning boundary':'Coach status');active=undefined;setBusy(false);question.focus()}else if(data.type==='done'){active=undefined;setBusy(false);question.focus()}});question.focus();</script></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
}
