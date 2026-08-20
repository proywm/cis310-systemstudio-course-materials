import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import {
  parseDigitalCircuit,
  serializeDigitalCircuit,
  validateEmbeddedCircuit,
  type EmbeddedCircuitModel
} from './core/embeddedCircuit';

export class EmbeddedCircuitEditorProvider implements vscode.CustomTextEditorProvider {
  static readonly viewType = 'systemstudioCis310.embeddedCircuitEditor';

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    panel.webview.options = { enableScripts: true };
    let applyingEdit = false;

    const render = (): void => {
      const parsed = parseDigitalCircuit(document.getText());
      panel.webview.html = parsed.unsupported.length > 0
        ? unsupportedHtml(panel.webview, document.fileName, parsed.unsupported)
        : editorHtml(panel.webview, document.fileName, parsed.model);
    };

    const applyModel = async (modelValue: unknown, save: boolean): Promise<void> => {
      const model = validateEmbeddedCircuit(modelValue);
      if (!model) {
        await panel.webview.postMessage({ type: 'error', message: 'The circuit edit was rejected because its structure was invalid.' });
        return;
      }
      const xml = serializeDigitalCircuit(model);
      if (xml !== document.getText()) {
        applyingEdit = true;
        try {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(document.uri, fullDocumentRange(document), xml);
          if (!await vscode.workspace.applyEdit(edit)) throw new Error('VS Code did not apply the circuit edit.');
        } finally {
          applyingEdit = false;
        }
      }
      if (save) {
        const saved = await document.save();
        await panel.webview.postMessage(saved
          ? { type: 'saved', message: `Saved ${baseName(document.fileName)}` }
          : { type: 'error', message: 'VS Code could not save the circuit file.' });
      } else {
        await panel.webview.postMessage({ type: 'synced' });
      }
    };

    const changes = vscode.workspace.onDidChangeTextDocument((event) => {
      if (!applyingEdit && event.document.uri.toString() === document.uri.toString()) render();
    });
    const messages = panel.webview.onDidReceiveMessage(async (value: unknown) => {
      if (!isRecord(value) || typeof value.action !== 'string') return;
      switch (value.action) {
        case 'edit': await applyModel(value.model, false); break;
        case 'save': await applyModel(value.model, true); break;
        case 'openDigital': await vscode.commands.executeCommand('systemstudioCis310.openDigital', document.uri); break;
        case 'preview': await vscode.commands.executeCommand('vscode.openWith', document.uri, 'systemstudioCis310.circuitPreview', vscode.ViewColumn.Beside); break;
        case 'test': await vscode.commands.executeCommand('systemstudioCis310.testCircuit', document.uri); break;
        case 'raw': await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default'); break;
      }
    });
    panel.onDidDispose(() => { changes.dispose(); messages.dispose(); });
    render();
  }
}

function editorHtml(webview: vscode.Webview, fileName: string, model: EmbeddedCircuitModel): string {
  const nonce = randomBytes(16).toString('base64');
  const initial = JSON.stringify(model).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<style nonce="${nonce}">${editorStyles()}</style>
</head><body>
<header><div><p class="eyebrow">Embedded CIS 310 circuit workbench</p><h1>${escapeHtml(baseName(fileName))}</h1><p class="sub">Build and simulate the supported one-bit teaching components entirely inside VS Code. The saved file remains compatible with Digital.</p></div>
<div class="header-actions"><span id="saveState" class="pill">Saved source loaded</span><button id="save" class="primary">Save .dig</button><button id="preview">Digital preview</button><button id="native">Full Digital</button></div></header>
<div class="shell">
  <aside class="palette" aria-label="Circuit components"><h2>Components</h2><p>Choose a component, then click an empty grid location.</p>
    <button data-kind="In">Input switch</button><button data-kind="Out">Output probe</button><button data-kind="And">AND gate</button><button data-kind="Or">OR gate</button><button data-kind="XOr">XOR gate</button><button data-kind="Not">NOT gate</button><button data-kind="Clock">Manual clock</button><button data-kind="D_FF">D flip-flop</button>
    <hr><h2>Connect</h2><p>Click an output port, then an input port. A new connection replaces any existing driver on that input.</p>
    <button id="undo">Undo</button><button id="redo">Redo</button><button id="delete">Delete selected</button><button id="clear" class="danger">Clear circuit</button>
  </aside>
  <main><div class="canvas-head"><div><strong id="mode">Select, toggle, or drag a component</strong><span id="simulation">Simulation ready</span></div><div><button id="pulse">Pulse clock</button><button id="runTests">Run Digital tests</button></div></div>
    <svg id="canvas" viewBox="0 0 1200 720" role="application" aria-label="Interactive digital circuit canvas" tabindex="0"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="grid-line"/></pattern></defs><rect class="grid" width="1200" height="720" fill="url(#grid)"/><g id="wires"></g><g id="components"></g></svg>
    <p class="canvas-help">Inputs and clocks toggle from the inspector or by double-clicking them. Drag components to reorganize the circuit. Green means logic 1; gray means logic 0; amber means unresolved.</p>
  </main>
  <aside class="inspector"><h2>Inspector</h2><div id="inspector"><p>Select a component or wire.</p></div><h2>Accessible circuit list</h2><div id="componentList"></div><div class="boundary"><strong>Scope</strong><p>This editor supports inputs, outputs, AND/OR/XOR/NOT, a manual clock, and one-bit D flip-flops. Use Full Digital for buses, RAM, ROM, custom subcircuits, HDL, or advanced components.</p></div></aside>
</div>
<footer><span>Changes enter VS Code’s document undo history automatically. Use Save .dig or Ctrl/Cmd+S to write the file.</span><span id="message" aria-live="polite"></span></footer>
<script nonce="${nonce}">${embeddedCircuitEditorScript(initial)}</script>
</body></html>`;
}

function unsupportedHtml(webview: vscode.Webview, fileName: string, unsupported: readonly string[]): string {
  const nonce = randomBytes(16).toString('base64');
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';"><style nonce="${nonce}">${messageStyles()}</style></head><body><main><p class="eyebrow">${escapeHtml(baseName(fileName))}</p><h1>Open this advanced circuit without rewriting it</h1><p>The embedded course editor intentionally refuses to rewrite components it does not fully understand:</p><ul>${unsupported.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}</ul><p>Your file has not been changed. Use Digital for full editing, the integrated preview for a read-only diagram, or the XML source when diagnosing the file.</p><div><button data-action="openDigital">Open full Digital</button><button data-action="preview">Open preview</button><button data-action="raw">Open XML source</button></div></main><script nonce="${nonce}">const vscode=acquireVsCodeApi();document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>vscode.postMessage({action:b.dataset.action})));</script></body></html>`;
}

export function embeddedCircuitEditorScript(initial: string): string {
  return `
const vscode=acquireVsCodeApi();
let model=${initial};let inputs={};let ff={};let values={};let selected=null;let selectedWire=null;let pending=null;let addKind=null;let history=[];let future=[];let counter=Date.now();let syncTimer;let dragging=null;
const canvas=document.getElementById('canvas'),componentsLayer=document.getElementById('components'),wiresLayer=document.getElementById('wires'),mode=document.getElementById('mode'),message=document.getElementById('message'),saveState=document.getElementById('saveState');
const clone=v=>JSON.parse(JSON.stringify(v));const snap=v=>Math.max(20,Math.min(1160,Math.round(v/20)*20));
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
function ports(c){const i=[],o=[];if(c.kind==='In'||c.kind==='Clock')o.push({port:'out',x:c.x,y:c.y});if(c.kind==='Out'||c.kind==='Not')i.push({port:'in',x:c.x,y:c.y});if(['And','Or','XOr'].includes(c.kind)){i.push({port:'a',x:c.x,y:c.y},{port:'b',x:c.x,y:c.y+40});o.push({port:'out',x:c.x+60,y:c.y+20});}if(c.kind==='Not')o.push({port:'out',x:c.x+40,y:c.y});if(c.kind==='D_FF'){i.push({port:'d',x:c.x,y:c.y},{port:'clk',x:c.x-20,y:c.y+20});o.push({port:'q',x:c.x+60,y:c.y});}return {i,o};}
function inbound(){return new Map(model.connections.map(w=>[w.to.componentId+':'+w.to.port,w.from.componentId]));}
function simulate(){values={};for(const c of model.components){if(c.kind==='In'||c.kind==='Clock')values[c.id]=!!inputs[c.id];if(c.kind==='D_FF')values[c.id]=!!ff[c.id];}const ins=inbound();for(let pass=0;pass<model.components.length+2;pass++){let changed=false;for(const c of model.components){if(c.id in values||c.kind==='D_FF')continue;const read=p=>{const source=ins.get(c.id+':'+p);return source===undefined?undefined:values[source];};let next;if(c.kind==='Out'||c.kind==='Not'){const a=read('in');if(a!==undefined)next=c.kind==='Not'?!a:a;}else if(['And','Or','XOr'].includes(c.kind)){const a=read('a'),b=read('b');if(a!==undefined&&b!==undefined)next=c.kind==='And'?a&&b:c.kind==='Or'?a||b:a!==b;}if(next!==undefined){values[c.id]=next;changed=true;}}if(!changed)break;}const unresolved=model.components.filter(c=>!(c.id in values));document.getElementById('simulation').textContent=unresolved.length?unresolved.length+' unresolved component'+(unresolved.length===1?'':'s'):'All connected signals resolved';}
function point(c,port){return [...ports(c).i,...ports(c).o].find(p=>p.port===port);}
function componentSvg(c){const high=values[c.id]===true?' high':values[c.id]===false?' low':' unknown';const sel=selected===c.id?' selected':'';let shape='';if(c.kind==='In'||c.kind==='Clock'){shape='<rect x="'+(c.x-78)+'" y="'+(c.y-18)+'" width="68" height="36" rx="8"/><text x="'+(c.x-44)+'" y="'+(c.y+5)+'">'+esc(c.kind==='Clock'?'CLK':c.label)+'</text>';}else if(c.kind==='Out'){shape='<rect x="'+(c.x+10)+'" y="'+(c.y-18)+'" width="74" height="36" rx="8"/><text x="'+(c.x+47)+'" y="'+(c.y+5)+'">'+esc(c.label)+'='+((c.id in values)?(values[c.id]?1:0):'?')+'</text>';}else if(c.kind==='Not'){shape='<path d="M'+c.x+' '+(c.y-24)+' L'+c.x+' '+(c.y+24)+' L'+(c.x+34)+' '+c.y+' Z"/><circle cx="'+(c.x+38)+'" cy="'+c.y+'" r="4"/><text x="'+(c.x+14)+'" y="'+(c.y+5)+'">¬</text>';}else if(c.kind==='D_FF'){shape='<rect x="'+c.x+'" y="'+(c.y-28)+'" width="60" height="76" rx="5"/><text x="'+(c.x+30)+'" y="'+(c.y+3)+'">D Q</text><path d="M'+c.x+' '+(c.y+12)+' l10 8 -10 8"/><text x="'+(c.x+30)+'" y="'+(c.y+38)+'">'+(values[c.id]?1:0)+'</text>';}else{shape='<rect x="'+c.x+'" y="'+(c.y-8)+'" width="60" height="56" rx="18"/><text x="'+(c.x+30)+'" y="'+(c.y+25)+'">'+esc(c.kind==='XOr'?'XOR':c.kind.toUpperCase())+'</text>';}const ps=ports(c);const circles=[...ps.i.map(p=>'<circle class="port input-port" data-component="'+c.id+'" data-port="'+p.port+'" data-direction="input" cx="'+p.x+'" cy="'+p.y+'" r="7"><title>'+esc(c.label)+' '+p.port+' input</title></circle>'),...ps.o.map(p=>'<circle class="port output-port" data-component="'+c.id+'" data-port="'+p.port+'" data-direction="output" cx="'+p.x+'" cy="'+p.y+'" r="7"><title>'+esc(c.label)+' '+p.port+' output</title></circle>')].join('');return '<g class="component'+high+sel+'" data-id="'+c.id+'" tabindex="0" aria-label="'+esc(c.kind+' '+c.label)+'">'+shape+circles+'</g>';}
function render(){simulate();const byId=new Map(model.components.map(c=>[c.id,c]));wiresLayer.innerHTML=model.connections.map(w=>{const a=byId.get(w.from.componentId),b=byId.get(w.to.componentId);if(!a||!b)return '';const p1=point(a,w.from.port),p2=point(b,w.to.port);if(!p1||!p2)return '';const state=values[a.id]===true?' high':values[a.id]===false?' low':' unknown';return '<line class="wire'+state+(selectedWire===w.id?' selected':'')+'" data-wire="'+w.id+'" x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'"><title>'+esc(a.label)+' to '+esc(b.label)+'</title></line>';}).join('');componentsLayer.innerHTML=model.components.map(componentSvg).join('');renderInspector();renderList();mode.textContent=addKind?'Click the grid to place '+addKind:pending?'Choose an input port to finish the wire':'Select, toggle, or drag a component';}
function snapshot(){history.push(clone(model));if(history.length>60)history.shift();future=[];}
function changed(){saveState.textContent='Unsaved changes';saveState.classList.add('dirty');clearTimeout(syncTimer);syncTimer=setTimeout(()=>vscode.postMessage({action:'edit',model}),180);render();}
function addComponent(kind,x,y){snapshot();const label=['In','Out','Clock','D_FF'].includes(kind)?(prompt('Signal label',kind==='In'?'A':kind==='Out'?'Y':kind==='Clock'?'CLK':'Q')||'').trim().slice(0,32):kind.toUpperCase();if(!label&&['In','Out','Clock','D_FF'].includes(kind)){history.pop();return;}const id='c'+(++counter);model.components.push({id,kind,label,x:snap(x),y:snap(y)});inputs[id]=false;ff[id]=false;selected=id;addKind=null;changed();}
function connect(componentId,port,direction){if(direction==='output'){pending={componentId,port};selected=componentId;selectedWire=null;render();return;}if(!pending)return;if(pending.componentId===componentId){pending=null;render();return;}snapshot();model.connections=model.connections.filter(w=>!(w.to.componentId===componentId&&w.to.port===port));model.connections.push({id:'w'+(++counter),from:pending,to:{componentId,port}});pending=null;changed();}
function removeSelected(){if(selected){snapshot();model.components=model.components.filter(c=>c.id!==selected);model.connections=model.connections.filter(w=>w.from.componentId!==selected&&w.to.componentId!==selected);delete inputs[selected];delete ff[selected];selected=null;changed();}else if(selectedWire){snapshot();model.connections=model.connections.filter(w=>w.id!==selectedWire);selectedWire=null;changed();}}
function toggle(id){const c=model.components.find(x=>x.id===id);if(!c||!['In','Clock'].includes(c.kind))return;const before=!!inputs[id];inputs[id]=!before;if(c.kind==='Clock'&&!before&&inputs[id]){simulate();const ins=inbound();for(const d of model.components.filter(x=>x.kind==='D_FF')){if(ins.get(d.id+':clk')===id){const source=ins.get(d.id+':d');if(source)ff[d.id]=!!values[source];}}}render();}
function renderInspector(){const el=document.getElementById('inspector');const c=model.components.find(x=>x.id===selected);if(selectedWire){const w=model.connections.find(x=>x.id===selectedWire);el.innerHTML=w?'<p><strong>Selected wire</strong></p><p>'+esc(w.from.componentId+':'+w.from.port)+' → '+esc(w.to.componentId+':'+w.to.port)+'</p><button id="inspectorDelete">Delete wire</button>':'<p>Select a component or wire.</p>';document.getElementById('inspectorDelete')?.addEventListener('click',removeSelected);return;}if(!c){el.innerHTML='<p>Select a component or wire.</p>';return;}el.innerHTML='<p><strong>'+esc(c.kind)+'</strong> · '+esc(c.label)+'</p><p>Position '+c.x+', '+c.y+' · value '+((c.id in values)?(values[c.id]?1:0):'?')+'</p>'+(['In','Clock'].includes(c.kind)?'<button id="toggle">Toggle '+esc(c.label)+'</button>':'')+'<label>Label<input id="label" maxlength="32" value="'+esc(c.label)+'"></label><div class="nudge"><button data-dx="-20" data-dy="0">←</button><button data-dx="20" data-dy="0">→</button><button data-dx="0" data-dy="-20">↑</button><button data-dx="0" data-dy="20">↓</button></div><button id="inspectorDelete">Delete component</button>';document.getElementById('toggle')?.addEventListener('click',()=>toggle(c.id));document.getElementById('label')?.addEventListener('change',e=>{snapshot();c.label=e.target.value.trim().slice(0,32);changed();});document.querySelectorAll('.nudge button').forEach(b=>b.addEventListener('click',()=>{snapshot();c.x=snap(c.x+Number(b.dataset.dx));c.y=snap(c.y+Number(b.dataset.dy));changed();}));document.getElementById('inspectorDelete')?.addEventListener('click',removeSelected);}
function renderList(){document.getElementById('componentList').innerHTML=model.components.length?'<ul>'+model.components.map(c=>'<li><button data-select="'+c.id+'">'+esc(c.label||c.kind)+' · '+esc(c.kind)+' · '+((c.id in values)?(values[c.id]?1:0):'?')+'</button></li>').join('')+'</ul>':'<p>No components yet.</p>';document.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.select;selectedWire=null;render();}));}
function svgPoint(event){const p=canvas.createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform(canvas.getScreenCTM().inverse());}
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{addKind=b.dataset.kind;pending=null;render();}));
canvas.addEventListener('click',event=>{const port=event.target.closest?.('.port');if(port){connect(port.dataset.component,port.dataset.port,port.dataset.direction);return;}const wire=event.target.closest?.('[data-wire]');if(wire){selectedWire=wire.dataset.wire;selected=null;pending=null;render();return;}const group=event.target.closest?.('.component');if(group){selected=group.dataset.id;selectedWire=null;render();return;}if(addKind){const p=svgPoint(event);addComponent(addKind,p.x,p.y);}else{selected=null;selectedWire=null;pending=null;render();}});
canvas.addEventListener('dblclick',event=>{const group=event.target.closest?.('.component');if(group)toggle(group.dataset.id);});
canvas.addEventListener('pointerdown',event=>{if(event.target.closest?.('.port'))return;const group=event.target.closest?.('.component');if(!group)return;const c=model.components.find(x=>x.id===group.dataset.id);if(!c)return;const p=svgPoint(event);snapshot();dragging={c,startX:p.x,startY:p.y,x:c.x,y:c.y,moved:false};});
document.addEventListener('pointermove',event=>{if(!dragging)return;const p=svgPoint(event);const nx=snap(dragging.x+p.x-dragging.startX),ny=snap(dragging.y+p.y-dragging.startY);if(nx!==dragging.c.x||ny!==dragging.c.y){dragging.c.x=nx;dragging.c.y=ny;dragging.moved=true;render();}});
document.addEventListener('pointerup',()=>{if(!dragging)return;if(dragging.moved)changed();else history.pop();dragging=null;});
document.getElementById('undo').addEventListener('click',()=>{const prev=history.pop();if(prev){future.push(clone(model));model=prev;selected=null;selectedWire=null;changed();}});document.getElementById('redo').addEventListener('click',()=>{const next=future.pop();if(next){history.push(clone(model));model=next;selected=null;selectedWire=null;changed();}});document.getElementById('delete').addEventListener('click',removeSelected);document.getElementById('clear').addEventListener('click',()=>{if(model.components.length&&confirm('Clear every component and wire from this circuit?')){snapshot();model.components=[];model.connections=[];selected=null;selectedWire=null;changed();}});
document.getElementById('pulse').addEventListener('click',()=>{for(const c of model.components.filter(x=>x.kind==='Clock')){if(inputs[c.id])toggle(c.id);toggle(c.id);toggle(c.id);}render();});document.getElementById('save').addEventListener('click',()=>{clearTimeout(syncTimer);vscode.postMessage({action:'save',model});});document.getElementById('preview').addEventListener('click',()=>vscode.postMessage({action:'preview'}));document.getElementById('native').addEventListener('click',()=>vscode.postMessage({action:'openDigital'}));document.getElementById('runTests').addEventListener('click',()=>vscode.postMessage({action:'test'}));
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();clearTimeout(syncTimer);vscode.postMessage({action:'save',model});}else if(event.key==='Delete'||event.key==='Backspace'){if(event.target.tagName!=='INPUT')removeSelected();}else if(event.key==='Escape'){addKind=null;pending=null;render();}});
window.addEventListener('message',event=>{if(event.data.type==='saved'){saveState.textContent='Saved';saveState.classList.remove('dirty');message.textContent=event.data.message;}else if(event.data.type==='synced'){saveState.textContent='Unsaved in file';}else if(event.data.type==='error'){message.textContent=event.data.message;}});render();
`;
}

function editorStyles(): string {
  return `:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}header{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.9rem 1.1rem;border-bottom:1px solid var(--vscode-panel-border)}h1{margin:.05rem 0;font-size:1.35rem}.eyebrow{margin:0;text-transform:uppercase;letter-spacing:.09em;font-size:.72rem;color:var(--vscode-textLink-foreground)}.sub{margin:.15rem 0;color:var(--vscode-descriptionForeground)}button{border:1px solid var(--vscode-button-border,transparent);color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground);padding:.45rem .65rem;cursor:pointer;border-radius:4px}button:hover{background:var(--vscode-button-secondaryHoverBackground)}button.primary{color:var(--vscode-button-foreground);background:var(--vscode-button-background)}button.danger{color:var(--vscode-errorForeground)}.header-actions{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}.pill{padding:.3rem .55rem;border-radius:999px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground);font-size:.78rem}.pill.dirty{background:var(--vscode-inputValidation-warningBackground);color:var(--vscode-inputValidation-warningForeground)}.shell{display:grid;grid-template-columns:190px minmax(500px,1fr) 230px;min-height:calc(100vh - 125px)}aside{padding:.8rem;border-right:1px solid var(--vscode-panel-border);overflow:auto}aside.inspector{border-right:0;border-left:1px solid var(--vscode-panel-border)}aside h2{font-size:.92rem;margin:.45rem 0}aside p{font-size:.82rem;color:var(--vscode-descriptionForeground)}.palette>button{display:block;width:100%;margin:.28rem 0;text-align:left}hr{border:0;border-top:1px solid var(--vscode-panel-border);margin:.8rem 0}main{min-width:0}.canvas-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.55rem .75rem;border-bottom:1px solid var(--vscode-panel-border)}.canvas-head strong,.canvas-head span{display:block}.canvas-head span{font-size:.78rem;color:var(--vscode-descriptionForeground)}#canvas{display:block;width:100%;height:calc(100vh - 205px);min-height:480px;background:var(--vscode-editor-background);touch-action:none}.grid-line{stroke:var(--vscode-editorIndentGuide-background);stroke-width:1}.component{cursor:move}.component rect,.component path{fill:var(--vscode-editorWidget-background);stroke:var(--vscode-foreground);stroke-width:2}.component text{fill:var(--vscode-foreground);font:12px var(--vscode-font-family);text-anchor:middle;pointer-events:none}.component.high rect,.component.high path{stroke:var(--vscode-testing-iconPassed)}.component.unknown rect,.component.unknown path{stroke:var(--vscode-editorWarning-foreground)}.component.selected rect,.component.selected path{stroke:var(--vscode-focusBorder);stroke-width:4}.port{stroke:var(--vscode-editor-background);stroke-width:2;cursor:crosshair}.input-port{fill:var(--vscode-charts-orange)}.output-port{fill:var(--vscode-charts-blue)}.wire{stroke-width:5;stroke-linecap:round;cursor:pointer}.wire.low{stroke:var(--vscode-descriptionForeground)}.wire.high{stroke:var(--vscode-testing-iconPassed)}.wire.unknown{stroke:var(--vscode-editorWarning-foreground);stroke-dasharray:8 5}.wire.selected{stroke:var(--vscode-focusBorder);stroke-width:8}.canvas-help{margin:.35rem .75rem;color:var(--vscode-descriptionForeground);font-size:.78rem}.inspector label{display:block;font-size:.78rem;margin:.55rem 0}.inspector input{display:block;width:100%;margin-top:.2rem;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);padding:.35rem}.nudge{display:grid;grid-template-columns:repeat(4,1fr);gap:.2rem;margin:.5rem 0}.inspector ul{list-style:none;padding:0}.inspector li button{width:100%;margin:.18rem 0;text-align:left;font-size:.76rem}.boundary{margin-top:1rem;padding:.65rem;border-left:3px solid var(--vscode-textLink-foreground);background:var(--vscode-textBlockQuote-background)}footer{display:flex;justify-content:space-between;gap:1rem;padding:.55rem .9rem;border-top:1px solid var(--vscode-panel-border);font-size:.78rem;color:var(--vscode-descriptionForeground)}@media(max-width:900px){.shell{grid-template-columns:160px 1fr}.inspector{grid-column:1/-1;border-left:0!important;border-top:1px solid var(--vscode-panel-border)}#canvas{height:520px}}`;
}

function messageStyles(): string {
  return `:root{color-scheme:light dark}body{color:var(--vscode-foreground);background:var(--vscode-editor-background);font-family:var(--vscode-font-family)}main{max-width:760px;margin:8vh auto;padding:1rem}h1{font-size:1.6rem}.eyebrow{text-transform:uppercase;letter-spacing:.08em;color:var(--vscode-textLink-foreground)}li{margin:.3rem 0}button{margin:.8rem .4rem 0 0;padding:.5rem .8rem;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;cursor:pointer}`;
}

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
  return new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
}
function baseName(value: string): string { return value.split(/[\\/]/).pop() ?? value; }
function escapeHtml(value: string): string { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
