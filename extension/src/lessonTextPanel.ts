import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import { GUIDED_LABS } from './core/guidedLabs';
import { preparationModule } from './core/learningResources';
import { LESSON_NARRATIVES, lessonNarrative, type LessonNarrative } from './core/lessonNarratives';
import type { CourseMaterials } from './courseMaterials';

type LessonPanelRequest =
  | { action: 'navigate'; resourceId: string }
  | { action: 'presentation' }
  | { action: 'source'; target: 'reading' | 'video'; index: number }
  | { action: 'practice' }
  | { action: 'lab'; labId: string }
  | { action: 'tutor'; promptIndex: number };

/** Accessible HTML alternative to the visual lecture PDF sequence. */
export class LessonTextPanel {
  private static current: LessonTextPanel | undefined;

  static async show(
    materials: CourseMaterials,
    resourceId: string
  ): Promise<void> {
    const lesson = lessonNarrative(resourceId);
    if (!lesson || !preparationModule(resourceId)) {
      await vscode.window.showErrorMessage('The selected lesson text is unavailable.');
      return;
    }
    if (LessonTextPanel.current) {
      LessonTextPanel.current.materials = materials;
      LessonTextPanel.current.showLesson(resourceId);
      LessonTextPanel.current.panel.reveal(vscode.ViewColumn.Active, false);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.lessonText',
      `${lesson.lectureLabel} · Accessible lesson text`,
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    LessonTextPanel.current = new LessonTextPanel(materials, panel, resourceId);
  }

  private readonly disposables: vscode.Disposable[] = [];

  private constructor(
    private materials: CourseMaterials,
    private readonly panel: vscode.WebviewPanel,
    private resourceId: string
  ) {
    this.disposables.push(
      panel.onDidDispose(() => this.dispose()),
      panel.webview.onDidReceiveMessage((value: unknown) => this.handleMessage(value))
    );
    this.showLesson(resourceId);
  }

  private showLesson(resourceId: string): void {
    const lesson = lessonNarrative(resourceId);
    if (!lesson) return;
    this.resourceId = resourceId;
    this.panel.title = `${lesson.lectureLabel} · Accessible lesson text`;
    this.panel.webview.html = renderLessonHtml(lesson);
  }

  private async handleMessage(value: unknown): Promise<void> {
    const request = parseLessonPanelRequest(value);
    const lesson = lessonNarrative(this.resourceId);
    const module = preparationModule(this.resourceId);
    if (!request || !lesson || !module) return;

    switch (request.action) {
      case 'navigate':
        if (lessonNarrative(request.resourceId)) this.showLesson(request.resourceId);
        return;
      case 'presentation': {
        const presentation = this.materials.getResource(this.resourceId);
        if (presentation) await this.materials.openResource(presentation);
        return;
      }
      case 'source':
        if (request.target === 'reading' && request.index >= module.readings.length) return;
        if (request.target === 'video' && request.index >= module.authorVideos.length) return;
        await vscode.commands.executeCommand(
          'systemstudioCis310.openModuleSource', this.resourceId, request.target, request.index
        );
        return;
      case 'practice':
        await vscode.commands.executeCommand('systemstudioCis310.startModulePractice', this.resourceId);
        return;
      case 'lab':
        if (GUIDED_LABS.some((lab) => lab.id === request.labId && lab.resourceId === this.resourceId)) {
          await vscode.commands.executeCommand('systemstudioCis310.openGuidedLabs', request.labId);
        }
        return;
      case 'tutor':
        if (request.promptIndex < lesson.tutorPrompts.length) {
          await vscode.commands.executeCommand('systemstudioCis310.openAiTutor', {
            resourceId: this.resourceId,
            promptIndex: request.promptIndex
          });
        }
    }
  }

  private dispose(): void {
    LessonTextPanel.current = undefined;
    for (const disposable of this.disposables) disposable.dispose();
  }
}

export function renderLessonHtml(lesson: LessonNarrative): string {
  const nonce = randomBytes(16).toString('base64');
  const module = preparationModule(lesson.resourceId);
  if (!module) return '';
  const currentIndex = LESSON_NARRATIVES.findIndex((candidate) => candidate.resourceId === lesson.resourceId);
  const previous = currentIndex > 0 ? LESSON_NARRATIVES[currentIndex - 1] : undefined;
  const next = currentIndex < LESSON_NARRATIVES.length - 1 ? LESSON_NARRATIVES[currentIndex + 1] : undefined;
  const labs = GUIDED_LABS.filter((lab) => lab.resourceId === lesson.resourceId);
  const sourceButtons = [
    ...module.readings.map((reading, index) =>
      actionButton('source', `Open reading ${index + 1}: ${reading.title}`, { target: 'reading', index })
    ),
    ...module.authorVideos.map((video, index) =>
      actionButton('source', `Open video ${index + 1}: ${video.title}`, { target: 'video', index })
    )
  ].join('');
  const labButtons = labs.map((lab) =>
    actionButton('lab', `${lab.requiredForModule ? 'Required' : 'Optional'} ${lab.kind} activity: ${lab.title}`, { labId: lab.id })
  ).join('');
  const tutorButtons = lesson.tutorPrompts.map((prompt, index) =>
    `<li><p>${escapeHtml(prompt)}</p>${actionButton('tutor', `Copy this prompt and open the U-M AI tutor`, { promptIndex: index })}</li>`
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>${escapeHtml(lesson.lectureLabel)}: ${escapeHtml(lesson.title)} — accessible lesson text</title>
  <style nonce="${nonce}">
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    html { font-size: 100%; scroll-behavior: smooth; }
    body { margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); font: 1rem/1.65 var(--vscode-font-family); }
    .skip-link { position: fixed; left: 1rem; top: -5rem; z-index: 10; padding: .65rem 1rem; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
    .skip-link:focus { top: 1rem; }
    header, main, footer { width: min(100% - 2rem, 78ch); margin-inline: auto; }
    header { padding-block: 2rem 1rem; border-bottom: .125rem solid var(--vscode-panel-border); }
    main { padding-block: 1rem 3rem; }
    footer { padding-block: 1rem 2rem; border-top: .0625rem solid var(--vscode-panel-border); }
    h1, h2, h3 { line-height: 1.25; text-wrap: balance; }
    h1 { margin: .25rem 0 .75rem; font-size: clamp(1.8rem, 5vw, 2.5rem); }
    h2 { margin-top: 2.25rem; font-size: 1.45rem; }
    h3 { margin-top: 1.5rem; font-size: 1.15rem; }
    p, li, dd { max-width: 72ch; }
    .eyebrow { margin: 0; font-weight: 700; }
    .summary { font-size: 1.08rem; }
    .notice, .example, .tutor, .sources { margin-block: 1.25rem; padding: 1rem 1.1rem; border: .0625rem solid var(--vscode-panel-border); border-left-width: .35rem; border-radius: .35rem; background: var(--vscode-editorWidget-background); }
    .notice strong { display: block; margin-bottom: .25rem; }
    dl { display: grid; gap: .75rem; }
    dt { font-weight: 700; }
    dd { margin: .15rem 0 0; }
    ol, ul { padding-left: 1.4rem; }
    li + li { margin-top: .45rem; }
    .actions, nav { display: flex; flex-wrap: wrap; gap: .65rem; margin-block: 1rem; }
    button { min-height: 2.75rem; max-width: 100%; padding: .55rem .85rem; border: .0625rem solid var(--vscode-button-border, transparent); border-radius: .25rem; color: var(--vscode-button-foreground); background: var(--vscode-button-background); font: inherit; text-align: left; cursor: pointer; overflow-wrap: anywhere; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary { color: var(--vscode-secondaryButton-foreground); background: var(--vscode-secondaryButton-background); }
    button.secondary:hover { background: var(--vscode-secondaryButton-hoverBackground); }
    a:focus-visible, button:focus-visible, summary:focus-visible, main:focus-visible { outline: .2rem solid var(--vscode-focusBorder); outline-offset: .2rem; }
    .source-note { color: var(--vscode-descriptionForeground); }
    code { padding: .08rem .25rem; border-radius: .2rem; font-family: var(--vscode-editor-font-family); background: var(--vscode-textCodeBlock-background); }
    @media (max-width: 34rem) { header, main, footer { width: min(100% - 1rem, 78ch); } button { width: 100%; } }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
    @media (forced-colors: active) { .notice, .example, .tutor, .sources, button { border: .125rem solid ButtonText; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#lesson-main">Skip to lesson content</a>
  <header>
    <p class="eyebrow">Module ${currentIndex + 1} of ${LESSON_NARRATIVES.length} · Accessible HTML lesson</p>
    <h1>${escapeHtml(lesson.lectureLabel)}: ${escapeHtml(lesson.title)}</h1>
    <p class="summary">${escapeHtml(lesson.overview)}</p>
    <nav aria-label="Lesson navigation">
      ${previous ? actionButton('navigate', `Previous: ${previous.lectureLabel} — ${previous.title}`, { resourceId: previous.resourceId }, true) : ''}
      ${next ? actionButton('navigate', `Next: ${next.lectureLabel} — ${next.title}`, { resourceId: next.resourceId }, true) : ''}
    </nav>
  </header>
  <main id="lesson-main" tabindex="-1">
    <aside class="notice" aria-labelledby="scope-heading">
      <strong id="scope-heading">What this lesson covers</strong>
      <span>${escapeHtml(lesson.scopeBoundary)}</span>
    </aside>

    <section aria-labelledby="objectives-heading">
      <h2 id="objectives-heading">Learning objectives</h2>
      <p>After studying the lesson and attempting its examples, you should be able to:</p>
      <ul>${lesson.objectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join('')}</ul>
    </section>

    <section aria-labelledby="terms-heading">
      <h2 id="terms-heading">Key terms in plain language</h2>
      <dl>${lesson.terms.map((entry) => `<div><dt>${escapeHtml(entry.term)}</dt><dd>${escapeHtml(entry.definition)}</dd></div>`).join('')}</dl>
    </section>

    ${lesson.sections.map((section, index) => `<section aria-labelledby="concept-${index}"><h2 id="concept-${index}">${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.points ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</section>`).join('')}

    <section aria-labelledby="examples-heading">
      <h2 id="examples-heading">Worked examples</h2>
      ${lesson.examples.map((example, index) => `<article class="example" aria-labelledby="example-${index}"><h3 id="example-${index}">${escapeHtml(example.title)}</h3><p>${escapeHtml(example.setup)}</p><ol>${example.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol><p><strong>Conclusion:</strong> ${escapeHtml(example.conclusion)}</p></article>`).join('')}
    </section>

    <section aria-labelledby="check-heading">
      <h2 id="check-heading">Check your understanding</h2>
      <p>Answer these in your own words before opening the practice set.</p>
      <ol>${lesson.selfChecks.map((question) => `<li>${escapeHtml(question)}</li>`).join('')}</ol>
      <div class="actions">${actionButton('practice', 'Open this module’s eight-question practice set')}</div>
    </section>

    ${labs.length > 0 ? `<section aria-labelledby="hands-on-heading"><h2 id="hands-on-heading">Apply it hands-on</h2><p>Use the guided activity after making your own prediction. Required and optional status is written in each button label and is not communicated by color alone.</p><div class="actions">${labButtons}</div></section>` : ''}

    <aside class="tutor" aria-labelledby="tutor-heading">
      <h2 id="tutor-heading">Ask the U-M AI tutor</h2>
      <p>Choose a source-bounded prompt. SystemStudio will copy it to your clipboard and open the configured U-M tutor. The tutor should ask for your attempt, use hints and analogous examples, and avoid producing graded work.</p>
      <ol>${tutorButtons}</ol>
    </aside>

    <section class="sources" aria-labelledby="sources-heading">
      <h2 id="sources-heading">Source basis and further study</h2>
      <p><strong>Presentation evidence:</strong> ${escapeHtml(lesson.slideEvidence)}</p>
      <p class="source-note">This text is an accessible explanatory alternative, not a claim that the original PDF itself has been remediated. Open the named sources to verify details.</p>
      <div class="actions">
        ${actionButton('presentation', `Open ${lesson.lectureLabel} presentation PDF`)}
        ${sourceButtons}
      </div>
    </section>
  </main>
  <footer><p>Canvas remains authoritative for graded work, deadlines, and accommodations. If this lesson format presents a barrier, contact the instructor or the UM-Dearborn Digital Accessibility team.</p></footer>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-request]');
      if (!button) return;
      try { vscode.postMessage(JSON.parse(button.dataset.request)); } catch { /* Ignore invalid local markup. */ }
    });
  </script>
</body>
</html>`;
}

function actionButton(
  action: LessonPanelRequest['action'],
  label: string,
  detail: Record<string, string | number> = {},
  secondary = false
): string {
  const request = escapeHtml(JSON.stringify({ action, ...detail }));
  return `<button type="button"${secondary ? ' class="secondary"' : ''} data-request="${request}">${escapeHtml(label)}</button>`;
}

export function parseLessonPanelRequest(value: unknown): LessonPanelRequest | undefined {
  if (!isRecord(value) || typeof value.action !== 'string') return undefined;
  switch (value.action) {
    case 'navigate':
      return typeof value.resourceId === 'string' && Boolean(lessonNarrative(value.resourceId))
        ? { action: 'navigate', resourceId: value.resourceId }
        : undefined;
    case 'presentation': return { action: 'presentation' };
    case 'practice': return { action: 'practice' };
    case 'source':
      return (value.target === 'reading' || value.target === 'video') && validIndex(value.index)
        ? { action: 'source', target: value.target, index: value.index }
        : undefined;
    case 'lab':
      return typeof value.labId === 'string' ? { action: 'lab', labId: value.labId } : undefined;
    case 'tutor':
      return validIndex(value.promptIndex) ? { action: 'tutor', promptIndex: value.promptIndex } : undefined;
    default: return undefined;
  }
}

function validIndex(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 100;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
}
