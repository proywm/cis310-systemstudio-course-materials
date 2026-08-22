import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import {
  GUIDED_LABS,
  GUIDED_LAB_PROGRESS_KEY,
  guidedLab,
  normalizeGuidedLabProgress,
  parseGuidedLabRequest,
  resetGuidedLab,
  setGuidedLabStep,
  type GuidedLabProgress
} from './core/guidedLabs';
import { preparationModule, preparationUrl } from './core/learningResources';
import type { PracticeStore } from './practiceStore';

export class GuidedLabPanel implements vscode.Disposable {
  private static current: GuidedLabPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private progress: GuidedLabProgress;

  static async show(context: vscode.ExtensionContext, practiceStore: PracticeStore, initialLabId?: string): Promise<void> {
    const initialLab = initialLabId ? guidedLab(initialLabId) : undefined;
    if (GuidedLabPanel.current) {
      GuidedLabPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      if (initialLab) {
        await GuidedLabPanel.current.panel.webview.postMessage({ type: 'select', labId: initialLab.id });
      }
      return;
    }
    GuidedLabPanel.current = new GuidedLabPanel(context, practiceStore, initialLab?.id);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly practiceStore: PracticeStore,
    initialLabId?: string
  ) {
    this.progress = normalizeGuidedLabProgress(context.globalState.get(GUIDED_LAB_PROGRESS_KEY));
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.guidedLabs',
      'CIS 310 Hands-on Lab Center',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = guidedLabHtml(this.panel.webview, this.progress, initialLabId);
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (message: unknown) => {
      const request = parseGuidedLabRequest(message);
      if (!request) return;
      try {
        switch (request.type) {
          case 'select':
            break;
          case 'toggle-step':
            this.progress = setGuidedLabStep(
              this.progress,
              request.labId,
              request.stepId,
              request.completed
            );
            await this.saveAndPostProgress();
            break;
          case 'reset-lab':
            if (await vscode.window.showWarningMessage(
              'Reset the self-reported checkmarks for this guided lab?',
              { modal: true },
              'Reset Checkmarks'
            ) !== 'Reset Checkmarks') break;
            this.progress = resetGuidedLab(this.progress, request.labId);
            await this.saveAndPostProgress();
            break;
          case 'open-artifact':
            await vscode.commands.executeCommand('systemstudioCis310.openGuidedLabArtifact', request.labId);
            break;
          case 'open-tutor':
            await vscode.commands.executeCommand('systemstudioCis310.openAiTutor', { guidedAssemblyLabId: request.labId });
            break;
          case 'open-source':
            await this.openSource(request.labId, request.source);
            break;
        }
      } catch (error) {
        await vscode.window.showErrorMessage(`CIS 310 guided lab: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, undefined, this.disposables);
  }

  dispose(): void {
    GuidedLabPanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }

  private async saveAndPostProgress(): Promise<void> {
    await this.context.globalState.update(GUIDED_LAB_PROGRESS_KEY, this.progress);
    this.practiceStore.notifyExternalProgressChange();
    await this.panel.webview.postMessage({ type: 'progress', progress: this.progress });
  }

  private async openSource(labId: string, source: 'reading' | 'video' | 'lecture'): Promise<void> {
    const lab = guidedLab(labId);
    if (!lab) return;
    if (source === 'lecture') {
      await vscode.commands.executeCommand('systemstudioCis310.openLessonText', lab.resourceId);
      return;
    }
    const index = source === 'reading' ? lab.sourceReadingIndex : lab.sourceVideoIndex;
    const url = preparationUrl(lab.resourceId, source, index);
    if (!url) throw new Error(`The mapped ${source} is unavailable.`);
    await vscode.env.openExternal(vscode.Uri.parse(url));
  }
}

function guidedLabHtml(
  webview: vscode.Webview,
  progress: GuidedLabProgress,
  initialLabId?: string
): string {
  const nonce = randomBytes(16).toString('base64');
  const labs = GUIDED_LABS.map((lab) => {
    const module = preparationModule(lab.resourceId);
    return {
      ...lab,
      sourceReading: module?.readings[lab.sourceReadingIndex],
      sourceVideo: module?.authorVideos[lab.sourceVideoIndex]
    };
  });
  const safeLabs = JSON.stringify(labs).replaceAll('<', '\\u003c');
  const safeProgress = JSON.stringify(progress).replaceAll('<', '\\u003c');
  const firstLabId = guidedLab(initialLabId ?? '')?.id ?? GUIDED_LABS[0]!.id;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>CIS 310 Hands-on Lab Center</title><style>
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}button{font:inherit;cursor:pointer}.shell{min-height:100vh;display:grid;grid-template-rows:auto 1fr}header{padding:18px 24px;border-bottom:1px solid var(--vscode-panel-border);display:flex;justify-content:space-between;gap:16px;align-items:start}h1{font-size:1.5rem;margin:0 0 5px}h2{font-size:1.4rem;margin:0 0 8px}h3{font-size:1rem;margin:0}.subtle{color:var(--vscode-descriptionForeground);line-height:1.45}.privacy{font-size:.78rem;border:1px solid var(--vscode-testing-iconPassed);color:var(--vscode-testing-iconPassed);padding:5px 9px;border-radius:999px;white-space:nowrap}.layout{width:min(1320px,calc(100% - 40px));margin:20px auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px}.sidebar{border:1px solid var(--vscode-panel-border);border-radius:8px;background:var(--vscode-sideBar-background);padding:12px;align-self:start;position:sticky;top:16px}.filters{display:flex;gap:6px;margin-bottom:10px}.filter,.lab-link{border:1px solid transparent;color:var(--vscode-foreground);background:transparent;border-radius:5px}.filter{padding:5px 9px}.filter.active,.lab-link.active{border-color:var(--vscode-focusBorder);background:var(--vscode-list-activeSelectionBackground);color:var(--vscode-list-activeSelectionForeground)}.lab-list{display:grid;gap:5px}.lab-link{text-align:left;padding:10px;width:100%;display:grid;gap:4px}.lab-link:hover,.lab-link:focus-visible,.filter:hover,.filter:focus-visible{border-color:var(--vscode-focusBorder);outline:none}.lab-meta{font-size:.76rem;color:var(--vscode-descriptionForeground)}.lab-link.active .lab-meta{color:inherit}.card{border:1px solid var(--vscode-panel-border);border-radius:8px;padding:22px;background:var(--vscode-sideBar-background)}.tags,.actions{display:flex;gap:8px;flex-wrap:wrap}.tag{font-size:.78rem;padding:3px 8px;border-radius:999px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}.boundary{margin:16px 0;padding:10px 12px;border-left:4px solid var(--vscode-editorWarning-foreground);background:var(--vscode-textBlockQuote-background);line-height:1.45}.source-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:16px 0}.source{border:1px solid var(--vscode-panel-border);padding:12px;border-radius:6px}.source strong,.source span{display:block}.source span{margin-top:5px;font-size:.82rem;color:var(--vscode-descriptionForeground);line-height:1.4}.primary,.secondary,.quiet{border:0;border-radius:3px;padding:8px 13px}.primary{color:var(--vscode-button-foreground);background:var(--vscode-button-background)}.primary:hover{background:var(--vscode-button-hoverBackground)}.secondary{color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}.quiet{border:1px solid var(--vscode-panel-border);color:var(--vscode-foreground);background:transparent}.progress-row{display:flex;align-items:center;gap:10px;margin:20px 0 10px}.progress{height:8px;flex:1;background:var(--vscode-panel-border);border-radius:999px;overflow:hidden}.progress div{height:100%;background:var(--vscode-testing-iconPassed)}.steps{display:grid;gap:10px}.step{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;border:1px solid var(--vscode-panel-border);border-radius:6px;padding:13px;background:var(--vscode-editor-background)}.step.done{border-left:4px solid var(--vscode-testing-iconPassed)}.step input{width:18px;height:18px;margin-top:2px}.step p{margin:5px 0;line-height:1.45}.evidence{font-size:.83rem;color:var(--vscode-descriptionForeground)}.reflection{margin-top:16px;border:1px dashed var(--vscode-focusBorder);padding:12px;line-height:1.45}.artifact{margin-top:18px;padding-top:16px;border-top:1px solid var(--vscode-panel-border)}@media(max-width:800px){.layout{grid-template-columns:1fr}.sidebar{position:static}.privacy{white-space:normal}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style></head><body><div class="shell"><header><div><h1>CIS 310 Hands-on Lab Center</h1><div class="subtle">Read → predict → build or edit → run or simulate → inspect evidence → explain</div></div><div class="privacy">Self-paced · local checkmarks · not graded</div></header><div class="layout"><aside class="sidebar"><div class="filters"><button class="filter active" data-filter="all">All</button><button class="filter" data-filter="circuit">Circuits</button><button class="filter" data-filter="assembly">Assembly</button></div><nav id="labList" class="lab-list" aria-label="Guided labs"></nav></aside><main id="content"></main></div></div>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi(),labs=${safeLabs};let progress=${safeProgress},selected=${JSON.stringify(firstLabId)},filter='all';const list=document.getElementById('labList'),content=document.getElementById('content');
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function completedIds(lab){return new Set(progress.labs[lab.id]?.completedStepIds||[])}function labPct(lab){return Math.round(completedIds(lab).size/lab.steps.length*100)}
function renderList(){list.innerHTML=labs.filter(l=>filter==='all'||l.kind===filter).map(l=>'<button class="lab-link '+(l.id===selected?'active':'')+'" data-lab="'+esc(l.id)+'"><strong>'+esc(l.title)+'</strong><span class="lab-meta">'+esc(l.lectureLabel)+' · '+esc(l.kind)+' · '+labPct(l)+'%</span></button>').join('');list.querySelectorAll('[data-lab]').forEach(button=>button.onclick=()=>{selected=button.dataset.lab;vscode.postMessage({type:'select',labId:selected});render()})}
function renderContent(){const lab=labs.find(item=>item.id===selected)||labs[0],done=completedIds(lab),artifactLabel=lab.kind==='circuit'?'Create and open in Full Digital':'Open actual NASM Workbench';const tutorAction=lab.kind==='assembly'?'<button class="secondary" id="assembly-tutor">Ask tutor after my attempt</button>':'';content.innerHTML='<article class="card"><div class="tags"><span class="tag">'+esc(lab.lectureLabel)+'</span><span class="tag">'+esc(lab.kind==='circuit'?'Upstream Digital circuit':'Actual NASM/ELF32 + GDB')+'</span><span class="tag">Formative lab</span></div><h2>'+esc(lab.title)+'</h2><p>'+esc(lab.purpose)+'</p><div class="boundary"><strong>Boundary:</strong> '+esc(lab.boundary)+' Canvas still controls graded requirements and submission.</div><div class="source-grid"><div class="source"><strong>Read first</strong><span>'+esc(lab.sourceReading?.title)+' · '+esc(lab.sourceReading?.focus)+'</span><div class="actions"><button class="quiet" data-source="reading">Open mapped reading</button></div></div><div class="source"><strong>Watch first</strong><span>'+esc(lab.sourceVideo?.title)+' · '+esc(lab.sourceVideo?.focus)+'</span><div class="actions"><button class="quiet" data-source="video">Watch author video</button></div></div></div><div class="actions"><button class="quiet" data-source="lecture">Open accessible HTML lecture</button></div><div class="progress-row"><div class="progress" role="progressbar" aria-label="Lab checklist progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+labPct(lab)+'"><div style="width:'+labPct(lab)+'%"></div></div><strong>'+done.size+'/'+lab.steps.length+'</strong></div><section class="steps">'+lab.steps.map((step,index)=>'<label class="step '+(done.has(step.id)?'done':'')+'"><input type="checkbox" data-step="'+esc(step.id)+'" '+(done.has(step.id)?'checked':'')+'><div><h3>'+(index+1)+' · '+esc(step.title)+'</h3><p>'+esc(step.instruction)+'</p><p class="evidence"><strong>Evidence:</strong> '+esc(step.evidence)+'</p></div></label>').join('')+'</section><div class="reflection"><strong>Explain before leaving:</strong> '+esc(lab.reflection)+'</div><div class="artifact"><div class="actions"><button class="primary" id="artifact">'+artifactLabel+'</button>'+tutorAction+'<button class="quiet" id="reset">Reset these checkmarks</button></div><p class="subtle">Circuit labs create a fresh <code>.dig</code> file in Full Digital. Assembly labs open actual NASM/ELF32 code in the integrated GDB workbench; local evidence is formative, not a Canvas grade. The tutor asks for your attempt and gives one diagnostic hint at a time; it must not write graded code.</p></div></article>';
content.querySelectorAll('[data-source]').forEach(button=>button.onclick=()=>vscode.postMessage({type:'open-source',labId:lab.id,source:button.dataset.source}));content.querySelectorAll('[data-step]').forEach(input=>input.onchange=()=>vscode.postMessage({type:'toggle-step',labId:lab.id,stepId:input.dataset.step,completed:input.checked}));document.getElementById('artifact').onclick=()=>vscode.postMessage({type:'open-artifact',labId:lab.id});if(lab.kind==='assembly')document.getElementById('assembly-tutor').onclick=()=>vscode.postMessage({type:'open-tutor',labId:lab.id});document.getElementById('reset').onclick=()=>vscode.postMessage({type:'reset-lab',labId:lab.id})}
function render(){renderList();renderContent()}document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));const visible=labs.filter(l=>filter==='all'||l.kind===filter);if(!visible.some(l=>l.id===selected))selected=visible[0].id;render()});window.addEventListener('message',event=>{if(event.data?.type==='progress'){progress=event.data.progress;render()}else if(event.data?.type==='select'&&labs.some(l=>l.id===event.data.labId)){selected=event.data.labId;render()}});render();
</script></body></html>`;
}
