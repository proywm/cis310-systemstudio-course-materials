import * as vscode from 'vscode';
import {
  buildGitHubIssueDraftUrl,
  ISSUE_REPORT_CATEGORIES,
  type IssueReportCategory
} from './core/issueReport';

const REPOSITORY = 'proywm/cis310-systemstudio-course-materials';

export async function reportCis310Issue(context: vscode.ExtensionContext): Promise<void> {
  const category = await vscode.window.showQuickPick(
    ISSUE_REPORT_CATEGORIES.map((entry) => ({ ...entry, description: categoryDescription(entry.value) })),
    {
      title: 'Report a CIS 310 extension problem',
      placeHolder: 'Choose the closest problem type',
      ignoreFocusOut: true
    }
  );
  if (!category) return;

  const summary = await vscode.window.showInputBox({
    title: 'What happened?',
    prompt: 'Give a short symptom. Do not include a name, grade, password, API key, assignment solution, or private course material.',
    placeHolder: 'Example: The NASM environment check never finishes',
    ignoreFocusOut: true,
    validateInput: (value) => value.trim().length < 8 ? 'Please describe the problem in at least eight characters.' : undefined
  });
  if (summary === undefined) return;

  const lastAction = await vscode.window.showInputBox({
    title: 'What did you do immediately before it happened?',
    prompt: 'Optional. Describe the button or course action; do not paste source code or private files.',
    placeHolder: 'Example: Opened Module 4 and selected Build and run',
    ignoreFocusOut: true
  });
  if (lastAction === undefined) return;

  const visibleError = await vscode.window.showInputBox({
    title: 'What error was visible?',
    prompt: 'Optional. Include only the short visible message. Remove usernames, paths, credentials, and private data.',
    placeHolder: 'Leave blank if no error appeared',
    ignoreFocusOut: true
  });
  if (visibleError === undefined) return;

  const url = buildGitHubIssueDraftUrl(REPOSITORY, {
    category: category.value,
    summary,
    lastAction,
    visibleError,
    environment: {
      extensionVersion: String(context.extension.packageJSON.version ?? 'unknown'),
      vscodeVersion: vscode.version,
      platform: process.platform,
      architecture: process.arch,
      remoteName: vscode.env.remoteName,
      uiKind: vscode.env.uiKind === vscode.UIKind.Web ? 'web' : 'desktop',
      workspaceTrusted: vscode.workspace.isTrusted
    }
  });

  const consent = await vscode.window.showWarningMessage(
    'Open a public GitHub issue draft?',
    {
      modal: true,
      detail: 'Included: your three short answers, extension/VS Code versions, OS/architecture, local-or-remote host type, and workspace-trust state. Excluded: files, code, grades, credentials, Canvas data, and logs. Nothing leaves VS Code before you approve this action. Opening the draft sends this prefilled text to GitHub; no issue is created until you review it and click “Submit new issue.”'
    },
    'Open GitHub Draft'
  );
  if (consent !== 'Open GitHub Draft') return;

  const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
  if (!opened) {
    await vscode.window.showErrorMessage('GitHub could not be opened. No issue was submitted.');
    return;
  }
  await vscode.window.showInformationMessage('GitHub opened with a prefilled draft. Review it and click “Submit new issue” when ready; SystemStudio did not submit it.');
}

function categoryDescription(category: IssueReportCategory): string {
  return ({
    setup: 'Digital, Docker, NASM, GDB, Java, or first-run setup',
    tool: 'a button, panel, simulator, test, or workbench',
    content: 'course material, link, date, room, or wording',
    accessibility: 'keyboard, screen reader, readability, motion, or navigation',
    other: 'a problem that does not fit the choices above'
  })[category];
}
