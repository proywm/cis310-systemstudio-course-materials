import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import {
  buildFall2026CourseCalendar,
  FALL_2026_ACADEMIC_CALENDAR_URL,
  FALL_2026_ACADEMIC_EVENTS,
  FALL_2026_CLASS_LOCATION,
  FALL_2026_CLASS_TIME_LABEL,
  FALL_2026_OFFICE_HOURS_LABEL,
  FALL_2026_OFFICE_LOCATION,
  fall2026CourseMeetings,
  type CourseMeeting
} from './core/courseCalendar';
import { CIS310_GSI, CIS310_INSTRUCTOR } from './core/courseContacts';

type CalendarAction = 'open-canvas' | 'open-syllabus' | 'open-official-calendar' | 'export-calendar';

const CALENDAR_ACTIONS = new Set<CalendarAction>([
  'open-canvas',
  'open-syllabus',
  'open-official-calendar',
  'export-calendar'
]);

export class CourseCalendarPanel implements vscode.Disposable {
  private static current: CourseCalendarPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  static show(context: vscode.ExtensionContext): void {
    if (CourseCalendarPanel.current) {
      CourseCalendarPanel.current.panel.reveal(vscode.ViewColumn.One, false);
      return;
    }
    CourseCalendarPanel.current = new CourseCalendarPanel(context);
  }

  private readonly panel: vscode.WebviewPanel;

  private constructor(context: vscode.ExtensionContext) {
    this.panel = vscode.window.createWebviewPanel(
      'systemstudioCis310.courseCalendar',
      'CIS 310 Fall 2026 Calendar',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'chip.svg');
    this.panel.webview.html = calendarHtml(this.panel.webview);
    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    this.panel.webview.onDidReceiveMessage(async (message: unknown) => {
      const action = parseCalendarAction(message);
      if (!action) return;
      const commands: Record<CalendarAction, string> = {
        'open-canvas': 'systemstudioCis310.openCanvas',
        'open-syllabus': 'systemstudioCis310.openSyllabus',
        'open-official-calendar': 'systemstudioCis310.openAcademicCalendar',
        'export-calendar': 'systemstudioCis310.exportCourseCalendar'
      };
      await vscode.commands.executeCommand(commands[action]);
    }, undefined, this.disposables);
  }

  dispose(): void {
    CourseCalendarPanel.current = undefined;
    while (this.disposables.length > 0) this.disposables.pop()?.dispose();
  }
}

export async function exportFall2026CourseCalendar(): Promise<void> {
  const workspace = vscode.workspace.workspaceFolders?.find((folder) => folder.uri.scheme === 'file');
  const target = await vscode.window.showSaveDialog({
    title: 'Export the CIS 310 Fall 2026 calendar',
    saveLabel: 'Export Calendar',
    defaultUri: workspace
      ? vscode.Uri.joinPath(workspace.uri, 'CIS310-Fall-2026-MW.ics')
      : undefined,
    filters: { 'iCalendar files': ['ics'] }
  });
  if (!target) return;

  const content = buildFall2026CourseCalendar();
  await vscode.workspace.fs.writeFile(target, Buffer.from(content, 'utf8'));
  const action = await vscode.window.showInformationMessage(
    `Exported 27 confirmed Monday/Wednesday class meetings, ${FALL_2026_CLASS_TIME_LABEL}, ${FALL_2026_CLASS_LOCATION}, plus official term milestones. Assignment deadlines and the final-exam slot are not inferred.`,
    'Open File'
  );
  if (action === 'Open File') {
    await vscode.commands.executeCommand('vscode.open', target);
  }
}

export async function openOfficialAcademicCalendar(): Promise<void> {
  await vscode.env.openExternal(vscode.Uri.parse(FALL_2026_ACADEMIC_CALENDAR_URL));
}

function parseCalendarAction(value: unknown): CalendarAction | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const action = (value as { action?: unknown }).action;
  return typeof action === 'string' && CALENDAR_ACTIONS.has(action as CalendarAction)
    ? action as CalendarAction
    : undefined;
}

function calendarHtml(webview: vscode.Webview): string {
  const nonce = randomBytes(16).toString('base64');
  const meetings = fall2026CourseMeetings();
  const months = ['August', 'September', 'October', 'November', 'December'] as const;
  const monthSections = months.map((month) => {
    const monthMeetings = meetings.filter((meeting) => meeting.month === month);
    return `<section class="month"><h2>${month} <span>${monthMeetings.length} meeting${monthMeetings.length === 1 ? '' : 's'}</span></h2><div class="meeting-grid">${monthMeetings.map(meetingCard).join('')}</div></section>`;
  }).join('');
  const milestones = FALL_2026_ACADEMIC_EVENTS.map((event) =>
    `<tr><td>${formatDateRange(event.start, event.endExclusive)}</td><td><strong>${escapeHtml(event.title)}</strong><br><span>${escapeHtml(event.note)}</span></td></tr>`
  ).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>CIS 310 Fall 2026 Calendar</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); }
  main { width: min(1040px, calc(100% - 40px)); margin: 0 auto; padding: 28px 0 48px; }
  header { padding: 24px; border: 1px solid var(--vscode-panel-border); border-radius: 10px; background: var(--vscode-sideBar-background); }
  h1 { margin: 0 0 6px; font-size: 1.75rem; } h2 { margin: 0 0 13px; font-size: 1.2rem; }
  h2 span { color: var(--vscode-descriptionForeground); font-size: .8rem; font-weight: 400; margin-left: 6px; }
  p { line-height: 1.55; } .summary { color: var(--vscode-descriptionForeground); margin: 0; }
  .notice { border-left: 4px solid var(--vscode-editorWarning-foreground); padding: 10px 13px; margin: 18px 0 0; background: var(--vscode-textBlockQuote-background); }
  .schedule-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-top: 16px; }
  .schedule-detail { border: 1px solid var(--vscode-panel-border); border-radius: 7px; padding: 12px; }
  .schedule-detail h2 { margin-bottom: 6px; font-size: 1rem; } .schedule-detail p { margin: 0; }
  .actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; }
  button { cursor: pointer; border: 0; border-radius: 4px; padding: 8px 13px; font: inherit; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
  button:hover { background: var(--vscode-button-hoverBackground); } button.secondary { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
  .month { margin-top: 30px; } .meeting-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .meeting { border: 1px solid var(--vscode-panel-border); border-radius: 7px; padding: 12px; background: var(--vscode-sideBar-background); }
  .meeting .date { display: block; font-weight: 650; font-size: 1.02rem; } .meeting .number { display: block; color: var(--vscode-descriptionForeground); margin-top: 5px; font-size: .82rem; }
  .milestones { margin-top: 34px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 11px; border-bottom: 1px solid var(--vscode-panel-border); text-align: left; vertical-align: top; } th { color: var(--vscode-descriptionForeground); } td:first-child { width: 180px; white-space: nowrap; } td span { color: var(--vscode-descriptionForeground); }
  footer { margin-top: 28px; color: var(--vscode-descriptionForeground); font-size: .84rem; }
  @media (max-width: 620px) { td:first-child { width: auto; white-space: normal; } }
</style></head><body><main>
  <header><h1>CIS 310 · Fall 2026</h1><p class="summary">Computer Organization and Assembly Language · Section 001 · 27 regular meetings</p>
  <div class="schedule-details"><section class="schedule-detail"><h2>Class meetings</h2><p>Mondays and Wednesdays, <strong>${FALL_2026_CLASS_TIME_LABEL}</strong><br><strong>${FALL_2026_CLASS_LOCATION}</strong></p></section><section class="schedule-detail"><h2>Instructor</h2><p><strong>${CIS310_INSTRUCTOR.name}</strong>, ${CIS310_INSTRUCTOR.title}<br>${CIS310_INSTRUCTOR.email} · ${CIS310_INSTRUCTOR.phone}<br>${FALL_2026_OFFICE_LOCATION}</p></section><section class="schedule-detail"><h2>Graduate Student Instructor</h2><p><strong>${CIS310_GSI.name} (${CIS310_GSI.preferredName})</strong><br>${CIS310_GSI.email}</p></section><section class="schedule-detail"><h2>Instructor office hours</h2><p>${FALL_2026_OFFICE_HOURS_LABEL}<br><strong>${FALL_2026_OFFICE_LOCATION}</strong></p></section></div>
  <div class="notice"><strong>Starts Wednesday, August 26.</strong> The department's August 14, 2026 schedule confirms the class time and room. Canvas remains authoritative for announced changes, topics, deadlines, and the final-exam slot.</div>
  <div class="actions"><button data-action="open-canvas">Open Canvas</button><button data-action="open-syllabus">Open syllabus PDF</button><button class="secondary" data-action="export-calendar">Export .ics</button><button class="secondary" data-action="open-official-calendar">Official academic calendar</button></div></header>
  ${monthSections}
  <section class="milestones"><h2>Official term milestones</h2><table><thead><tr><th>Date</th><th>Event</th></tr></thead><tbody>${milestones}</tbody></table></section>
  <footer>Sources: the CIS department Fall 2026 class schedule generated August 14, 2026 supplies the class time and room; the University of Michigan-Dearborn 2026–2027 Academic Calendar supplies term dates. Check Canvas for announced changes.</footer>
</main><script nonce="${nonce}">const vscode=acquireVsCodeApi();document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>vscode.postMessage({action:button.dataset.action})));</script></body></html>`;
}

function meetingCard(meeting: CourseMeeting): string {
  return `<article class="meeting"><span class="date">${meeting.day}, ${meeting.month} ${meeting.dayOfMonth}</span><span class="number">${FALL_2026_CLASS_TIME_LABEL} · ${FALL_2026_CLASS_LOCATION}<br>Meeting ${meeting.number} of 27</span></article>`;
}

function formatDateRange(start: string, endExclusive: string): string {
  const startDate = dateFromIso(start);
  const endDate = dateFromIso(endExclusive);
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  if (start === endDate.toISOString().slice(0, 10)) return formatDate(startDate);
  if (startDate.getUTCMonth() === endDate.getUTCMonth()) {
    return `${monthName(startDate)} ${startDate.getUTCDate()}–${endDate.getUTCDate()}`;
  }
  return `${formatDate(startDate)}–${formatDate(endDate)}`;
}

function formatDate(date: Date): string {
  return `${monthName(date)} ${date.getUTCDate()}`;
}

function monthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
}

function dateFromIso(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
