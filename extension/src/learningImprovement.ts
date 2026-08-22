import * as vscode from 'vscode';
import {
  LEARNING_IMPROVEMENT_NOTICE_VERSION,
  LEARNING_IMPROVEMENT_PROGRAM,
  appendImprovementEvent,
  approvedUmichEndpoint,
  buildImprovementEvent,
  buildImprovementPayload,
  consentAllows,
  emptyImprovementConsent,
  fall2026CourseWeek,
  normalizeImprovementConsent,
  normalizeImprovementEvents,
  type ImprovementCategory,
  type ImprovementConsent,
  type ImprovementEventInput
} from './core/learningImprovement';

const CONSENT_KEY = 'learningImprovement.consent.v1';
const EVENTS_KEY = 'learningImprovement.events.v1';

export class LearningImprovementManager {
  constructor(private readonly context: vscode.ExtensionContext) {}

  get active(): boolean {
    return LEARNING_IMPROVEMENT_PROGRAM.enabled && vscode.env.isTelemetryEnabled;
  }

  get consent(): ImprovementConsent {
    return normalizeImprovementConsent(this.context.globalState.get(CONSENT_KEY));
  }

  get queuedEventCount(): number {
    return this.events().length;
  }

  async record(input: ImprovementEventInput): Promise<boolean> {
    if (!this.active || !consentAllows(this.consent, input.category)) return false;
    try {
      const event = buildImprovementEvent(input, {
        courseWeek: fall2026CourseWeek(new Date()),
        extensionVersion: String(this.context.extension.packageJSON.version ?? 'unknown'),
        platform: process.platform,
        architecture: process.arch
      });
      if (!event) return false;
      await this.context.globalState.update(EVENTS_KEY, appendImprovementEvent(this.events(), event));
      return true;
    } catch {
      // Optional research data must never interrupt a course workflow.
      return false;
    }
  }

  async openPrivacyCenter(): Promise<void> {
    if (!LEARNING_IMPROVEMENT_PROGRAM.enabled) {
      await vscode.window.showInformationMessage(
        'Learning-improvement data collection is dormant in this release.',
        {
          modal: true,
          detail: 'The institutional gate is OFF and no approved endpoint is configured. The extension cannot collect or transmit learning-improvement events. After an IRB determination, a later reviewed release may enable the gate; students will still have to opt in separately.'
        },
        'Delete Any Local Draft Data'
      ).then(async (choice) => {
        if (choice === 'Delete Any Local Draft Data') await this.deleteAll(false);
      });
      return;
    }
    const action = await vscode.window.showQuickPick([
      { label: '$(shield) Review or change consent', value: 'consent', description: consentSummary(this.consent) },
      { label: '$(preview) Preview queued data', value: 'preview', description: `${this.queuedEventCount} bounded events` },
      { label: '$(save-as) Export a private copy', value: 'export', description: 'You choose the destination' },
      { label: '$(cloud-upload) Send a reviewed batch', value: 'send', description: 'Only to the configured approved U-M endpoint' },
      { label: '$(trash) Withdraw and delete', value: 'withdraw', description: 'Stops collection and removes the local queue' }
    ], { title: 'CIS 310 learning-improvement privacy controls', placeHolder: 'Nothing is sent automatically' });
    if (!action) return;
    if (action.value === 'consent') await this.configureConsent();
    if (action.value === 'preview') await this.preview();
    if (action.value === 'export') await this.exportData();
    if (action.value === 'send') await this.sendReviewedBatch();
    if (action.value === 'withdraw') await this.deleteAll(true);
  }

  async askHelpfulness(activityId: string): Promise<void> {
    if (!this.active || !this.consent.survey) return;
    const rating = await vscode.window.showQuickPick([
      { label: 'Yes', value: 2 },
      { label: 'Partly', value: 1 },
      { label: 'No', value: 0 }
    ], { title: 'Did this tutorial help you take the next step?', placeHolder: 'Optional learning-improvement feedback' });
    if (!rating) return;
    const reason = await vscode.window.showQuickPick([
      { label: 'Clear and useful', value: 'clear' },
      { label: 'Instructions were unclear', value: 'unclear' },
      { label: 'Too much text', value: 'too-much-text' },
      { label: 'Too advanced', value: 'too-advanced' },
      { label: 'Too easy', value: 'too-easy' },
      { label: 'A course tool failed', value: 'tool-failed' },
      { label: 'I needed more prior knowledge', value: 'prior-knowledge-gap' },
      { label: 'Another reason', value: 'other' }
    ], { title: 'What most influenced your rating?', placeHolder: 'No free text is collected' });
    if (!reason) return;
    await this.record({ category: 'survey', name: 'helpfulness-rating', activityId, value: rating.value, reason: reason.value });
  }

  private events() {
    return normalizeImprovementEvents(this.context.globalState.get(EVENTS_KEY));
  }

  private async configureConsent(): Promise<void> {
    const proceed = await vscode.window.showInformationMessage(
      'Optional learning-improvement participation',
      {
        modal: true,
        detail: 'Participation has no effect on tutorials, AI help, course access, grades, or instructor evaluation. The extension payload contains no names, emails, UMIDs, IP addresses, Canvas identifiers or grades, grade-planner values, files, code, circuits, paths, terminal output, logs, Codex/FAQ conversations, credentials, or exact timestamps. You can preview, export, withdraw, and delete at any time.'
      },
      'Choose Categories',
      'Decline and Delete'
    );
    if (proceed === 'Decline and Delete') {
      await this.deleteAll(true);
      return;
    }
    if (proceed !== 'Choose Categories') return;
    const categories = await vscode.window.showQuickPick([
      { label: 'Technical setup outcomes', value: 'technical' as ImprovementCategory, description: 'platform family, extension version, standardized setup result' },
      { label: 'Ungraded learning activity', value: 'learning' as ImprovementCategory, description: 'bounded practice, tutorial, preparation, and lab events' },
      { label: 'Optional helpfulness surveys', value: 'survey' as ImprovementCategory, description: 'fixed-choice rating and reason; no free text' }
    ], { canPickMany: true, title: 'Choose what may be stored locally for reviewed sharing', placeHolder: 'Select any combination; all are optional' });
    if (!categories) return;
    const selected = new Set(categories.map((item) => item.value));
    const consent: ImprovementConsent = {
      noticeVersion: LEARNING_IMPROVEMENT_NOTICE_VERSION,
      technical: selected.has('technical'),
      learning: selected.has('learning'),
      survey: selected.has('survey')
    };
    const confirmation = await vscode.window.showWarningMessage(
      'Save these optional consent choices on this device?',
      { modal: true, detail: `${consentSummary(consent)} Nothing will be transmitted automatically; each batch requires preview and confirmation.` },
      'Save Consent Choices'
    );
    if (confirmation !== 'Save Consent Choices') return;
    await this.context.globalState.update(CONSENT_KEY, consent);
  }

  private payload() {
    return buildImprovementPayload(
      this.events(),
      fall2026CourseWeek(new Date()),
      LEARNING_IMPROVEMENT_PROGRAM.protocolId
    );
  }

  private async preview(): Promise<boolean> {
    const payload = this.payload();
    const content = payload
      ? JSON.stringify(payload, null, 2)
      : JSON.stringify({ status: 'No shareable data', reason: 'No queued events or no approved protocol ID.' }, null, 2);
    const document = await vscode.workspace.openTextDocument({ language: 'json', content });
    await vscode.window.showTextDocument(document, { preview: true });
    return Boolean(payload);
  }

  private async exportData(): Promise<void> {
    const payload = this.payload();
    if (!payload) {
      await vscode.window.showInformationMessage('There is no approved, queued learning-improvement batch to export.');
      return;
    }
    await this.preview();
    const destination = await vscode.window.showSaveDialog({
      title: 'Export the reviewed learning-improvement batch',
      defaultUri: vscode.Uri.file('cis310-learning-improvement-preview.json'),
      filters: { JSON: ['json'] }
    });
    if (!destination) return;
    await vscode.workspace.fs.writeFile(destination, Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, 'utf8'));
  }

  private async sendReviewedBatch(): Promise<void> {
    const endpoint = approvedUmichEndpoint(LEARNING_IMPROVEMENT_PROGRAM.endpoint);
    const payload = this.payload();
    if (!endpoint || !payload) {
      await vscode.window.showInformationMessage('No approved U-M collection endpoint/protocol and reviewed event batch are available. Nothing was sent.');
      return;
    }
    await this.preview();
    const decision = await vscode.window.showWarningMessage(
      `Send these ${payload.events.length} reviewed events to ${endpoint.hostname}?`,
      { modal: true, detail: 'This sends exactly the previewed JSON. It contains no stable student/device identifier and no files, code, grades, prompts, credentials, logs, or exact timestamps.' },
      'Send Reviewed Batch'
    );
    if (decision !== 'Send Reviewed Batch') return;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'error',
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw new Error(`The approved collection endpoint returned HTTP ${response.status}. The local queue was kept.`);
    await this.context.globalState.update(EVENTS_KEY, []);
    await vscode.window.showInformationMessage('The reviewed learning-improvement batch was accepted. Its local queued copy was deleted.');
  }

  private async deleteAll(confirm: boolean): Promise<void> {
    if (confirm) {
      const decision = await vscode.window.showWarningMessage(
        'Withdraw optional participation and delete all locally queued learning-improvement events?',
        { modal: true },
        'Withdraw and Delete'
      );
      if (decision !== 'Withdraw and Delete') return;
    }
    await Promise.all([
      this.context.globalState.update(CONSENT_KEY, emptyImprovementConsent()),
      this.context.globalState.update(EVENTS_KEY, [])
    ]);
    await vscode.window.showInformationMessage('Optional participation is off and the local learning-improvement queue is empty.');
  }
}

function consentSummary(consent: ImprovementConsent): string {
  const enabled = (['technical', 'learning', 'survey'] as const).filter((category) => consent[category]);
  return enabled.length ? `Opted in locally: ${enabled.join(', ')}.` : 'No categories are enabled.';
}
