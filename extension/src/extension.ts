import { access } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { CircuitPreviewProvider } from './circuitPreview';
import { DIGITAL_RELEASE, MINIMUM_JAVA_MAJOR } from './core/digitalRelease';
import { CourseMaterials, CourseMaterialsTreeProvider } from './courseMaterials';
import { DigitalManager } from './digitalManager';
import { DigitalTestController } from './digitalTests';
import { StatusTreeProvider } from './statusTree';

const JAVA_DOWNLOAD = vscode.Uri.parse('https://adoptium.net/temurin/releases/');

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel('SystemStudio CIS 310', { log: true });
  const manager = new DigitalManager(context, output);
  const courseMaterials = await CourseMaterials.load(context);
  const materialsTree = new CourseMaterialsTreeProvider(courseMaterials);
  const statusTree = new StatusTreeProvider(manager);
  const tests = new DigitalTestController(manager);
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 60);
  statusBar.command = 'systemstudioCis310.checkEnvironment';
  statusBar.show();

  const updateStatus = async (): Promise<void> => {
    const status = await manager.getStatus();
    if (status.integrityVerified && status.java.supported) {
      statusBar.text = `$(circuit-board) CIS 310: Digital ${status.version}`;
      statusBar.tooltip = 'Digital is installed and Java is ready.';
      statusBar.backgroundColor = undefined;
    } else {
      statusBar.text = '$(warning) CIS 310: setup required';
      statusBar.tooltip = !status.integrityVerified
        ? `Install Digital ${status.version}`
        : `Java ${MINIMUM_JAVA_MAJOR}+ is required`;
      statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
  };

  const setupDigital = async (): Promise<boolean> => {
    const existing = await manager.getStatus();
    if (existing.integrityVerified) {
      const action = await vscode.window.showInformationMessage(
        `Digital ${existing.version} is installed and its checksum is valid.`,
        'Verify Java',
        'Reinstall'
      );
      if (action === 'Verify Java') {
        await checkEnvironment(manager, output);
        return existing.java.supported;
      }
      if (action !== 'Reinstall') {
        return existing.java.supported;
      }
    }

    const decision = await vscode.window.showInformationMessage(
      `Install Digital ${DIGITAL_RELEASE.displayVersion} into VS Code extension storage? ` +
        `SystemStudio will download the pinned GPL-3.0 release and verify its SHA-256 before extraction.`,
      { modal: true },
      'Install Digital',
      'View license'
    );
    if (decision === 'View license') {
      await vscode.env.openExternal(vscode.Uri.parse(DIGITAL_RELEASE.licenseUrl));
      return false;
    }
    if (decision !== 'Install Digital') {
      return false;
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Installing Digital ${DIGITAL_RELEASE.displayVersion}`,
          cancellable: true
        },
        (progress, token) => manager.install(progress, token)
      );
      const status = await manager.getStatus();
      if (!status.java.supported) {
        const action = await vscode.window.showWarningMessage(
          `Digital is installed, but Java ${MINIMUM_JAVA_MAJOR}+ was not found.`,
          'Download Java',
          'Open settings'
        );
        if (action === 'Download Java') {
          await vscode.env.openExternal(JAVA_DOWNLOAD);
        } else if (action === 'Open settings') {
          await vscode.commands.executeCommand('workbench.action.openSettings', 'systemstudioCis310.javaPath');
        }
      } else {
        await vscode.window.showInformationMessage(
          `Digital ${DIGITAL_RELEASE.displayVersion} is installed and ready for CIS 310.`
        );
      }
      statusTree.refresh();
      await tests.refresh();
      await updateStatus();
      return status.integrityVerified && status.java.supported;
    } catch (error) {
      output.appendLine(errorMessage(error));
      output.show(true);
      await vscode.window.showErrorMessage(`Digital installation failed: ${errorMessage(error)}`);
      return false;
    }
  };

  context.subscriptions.push(
    output,
    statusTree,
    materialsTree,
    tests,
    statusBar,
    vscode.window.registerTreeDataProvider('systemstudioCis310.explorer', statusTree),
    vscode.window.registerTreeDataProvider('systemstudioCis310.materials', materialsTree),
    vscode.window.registerCustomEditorProvider(
      CircuitPreviewProvider.viewType,
      new CircuitPreviewProvider(context, manager),
      { webviewOptions: { retainContextWhenHidden: false }, supportsMultipleEditorsPerDocument: false }
    ),
    vscode.commands.registerCommand('systemstudioCis310.setupDigital', setupDigital),
    vscode.commands.registerCommand('systemstudioCis310.checkEnvironment', async () => {
      await checkEnvironment(manager, output);
      statusTree.refresh();
      await updateStatus();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openDigital', async (candidate?: vscode.Uri) => {
      if (!requireTrustedWorkspace()) {
        return;
      }
      const uri = await resolveCircuitUri(candidate);
      if (!uri) {
        return;
      }
      if (!(await ensureReady(manager, output, setupDigital))) {
        return;
      }
      try {
        await manager.launch(uri.fsPath);
        await vscode.window.showInformationMessage(`Opened ${path.basename(uri.fsPath)} in Digital.`);
      } catch (error) {
        await showFailure('Could not launch Digital', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.testCircuit', async (candidate?: vscode.Uri) => {
      if (!requireTrustedWorkspace()) {
        return;
      }
      const uri = await resolveCircuitUri(candidate);
      if (!uri || !(await ensureReady(manager, output, setupDigital))) {
        return;
      }
      try {
        const result = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'Running Digital circuit tests', cancellable: true },
          (_progress, token) => manager.runTests(uri.fsPath, token)
        );
        output.show(true);
        if (result.passed) {
          await vscode.window.showInformationMessage(`Digital tests passed: ${path.basename(uri.fsPath)}`);
        } else {
          await vscode.window.showErrorMessage(`Digital tests failed: ${path.basename(uri.fsPath)}. See output for evidence.`);
        }
      } catch (error) {
        await showFailure('Digital circuit test failed to run', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.exportSvg', async (candidate?: vscode.Uri) => {
      if (!requireTrustedWorkspace()) {
        return;
      }
      const uri = await resolveCircuitUri(candidate);
      if (!uri || !(await ensureReady(manager, output, setupDigital))) {
        return;
      }
      await vscode.commands.executeCommand('vscode.openWith', uri, CircuitPreviewProvider.viewType);
    }),
    vscode.commands.registerCommand('systemstudioCis310.createStarterWorkspace', async () => {
      if (!(await ensureReady(manager, output, setupDigital))) {
        return;
      }
      const selection = await vscode.window.showOpenDialog({
        title: 'Choose a parent folder for the CIS 310 starter workspace',
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: 'Create Starter Here'
      });
      const parent = selection?.[0];
      if (!parent || parent.scheme !== 'file') {
        return;
      }
      const target = path.join(parent.fsPath, 'SystemStudio-CIS310-Starter');
      try {
        await access(target);
        await vscode.window.showErrorMessage(`The starter folder already exists: ${target}. Choose a different parent folder.`);
        return;
      } catch {
        // Expected: the target must not already exist.
      }
      try {
        const created = await manager.createStarterWorkspace(parent.fsPath);
        const action = await vscode.window.showInformationMessage(
          `Created the CIS 310 starter workspace at ${created}.`,
          'Open Workspace'
        );
        if (action === 'Open Workspace') {
          await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(created), { forceNewWindow: false });
        }
      } catch (error) {
        await showFailure('Could not create the starter workspace', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.browseLectures', async () => {
      await browseCourseMaterials(courseMaterials, 'presentation', 'Choose a CIS 310 presentation');
    }),
    vscode.commands.registerCommand('systemstudioCis310.browseAssignments', async () => {
      await browseCourseMaterials(courseMaterials, 'assignment', 'Choose a CIS 310 assignment');
    }),
    vscode.commands.registerCommand('systemstudioCis310.openCourseMaterial', async (resourceId: unknown) => {
      if (typeof resourceId !== 'string') {
        await vscode.window.showErrorMessage('The selected course-material entry is invalid.');
        return;
      }
      const resource = courseMaterials.getResource(resourceId);
      if (!resource) {
        await vscode.window.showErrorMessage(`Course material not found: ${resourceId}.`);
        return;
      }
      await courseMaterials.openResource(resource);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openMaterialsIndex', async () => {
      await courseMaterials.openStudentIndex();
    }),
    vscode.commands.registerCommand('systemstudioCis310.refresh', async () => {
      statusTree.refresh();
      await tests.refresh();
      await updateStatus();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openDocumentation', async () => {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(context.extensionUri, 'README.md'));
      await vscode.window.showTextDocument(document, { preview: true });
    }),
    vscode.workspace.onDidGrantWorkspaceTrust(() => {
      statusTree.refresh();
      void tests.refresh();
      void updateStatus();
    })
  );

  void updateStatus();
  void maybePromptForInstall(context, manager, setupDigital);
}

async function browseCourseMaterials(
  courseMaterials: CourseMaterials,
  kind: 'presentation' | 'assignment',
  placeHolder: string
): Promise<void> {
  const entries = courseMaterials.getResources(kind).map((resource) => ({
    label: resource.title,
    description: kind === 'presentation' ? 'private Drive source' : 'packaged reference',
    detail: resource.concepts.join(', '),
    resource
  }));
  const selected = await vscode.window.showQuickPick(entries, { placeHolder, matchOnDescription: true, matchOnDetail: true });
  if (selected) {
    await courseMaterials.openResource(selected.resource);
  }
}

export function deactivate(): void {
  // Resources are disposed through ExtensionContext subscriptions.
}

async function checkEnvironment(manager: DigitalManager, output: vscode.OutputChannel): Promise<void> {
  const status = await manager.getStatus();
  const lines = [
    `SystemStudio CIS 310 environment check`,
    `Digital release: ${DIGITAL_RELEASE.displayVersion}`,
    `Digital location: ${status.jarPath}`,
    `Digital installed: ${status.installed ? 'yes' : 'no'}`,
    `Digital checksum valid: ${status.integrityVerified ? 'yes' : 'no'}`,
    `Java executable: ${status.java.executable}`,
    `Java available: ${status.java.available ? 'yes' : 'no'}`,
    `Java version: ${status.java.version?.raw ?? 'not detected'}`,
    `Java supported: ${status.java.supported ? 'yes' : `no (requires ${MINIMUM_JAVA_MAJOR}+)`}`,
    `Workspace trusted: ${vscode.workspace.isTrusted ? 'yes' : 'no'}`
  ];
  output.appendLine(lines.join('\n'));
  output.show(true);

  if (status.integrityVerified && status.java.supported) {
    await vscode.window.showInformationMessage(`CIS 310 environment ready: Digital ${status.version}, Java ${status.java.version?.raw}.`);
    return;
  }
  const action = await vscode.window.showWarningMessage(
    'The CIS 310 environment needs attention. See the SystemStudio output for details.',
    !status.integrityVerified ? 'Install Digital' : 'Download Java'
  );
  if (action === 'Install Digital') {
    await vscode.commands.executeCommand('systemstudioCis310.setupDigital');
  } else if (action === 'Download Java') {
    await vscode.env.openExternal(JAVA_DOWNLOAD);
  }
}

async function ensureReady(
  manager: DigitalManager,
  output: vscode.OutputChannel,
  setup: () => Promise<boolean>
): Promise<boolean> {
  const status = await manager.getStatus();
  if (!status.integrityVerified) {
    return setup();
  }
  if (!status.java.supported) {
    await checkEnvironment(manager, output);
    return false;
  }
  return true;
}

async function resolveCircuitUri(candidate?: vscode.Uri): Promise<vscode.Uri | undefined> {
  let uri = candidate;
  if (!uri && vscode.window.activeTextEditor?.document.uri.path.toLowerCase().endsWith('.dig')) {
    uri = vscode.window.activeTextEditor.document.uri;
  }
  if (!uri) {
    const selected = await vscode.window.showOpenDialog({
      title: 'Select a Digital circuit',
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: { 'Digital circuits': ['dig'] }
    });
    uri = selected?.[0];
  }
  if (!uri) {
    return undefined;
  }
  if (uri.scheme !== 'file') {
    await vscode.window.showErrorMessage('Digital desktop integration currently requires a local file workspace.');
    return undefined;
  }
  if (!uri.fsPath.toLowerCase().endsWith('.dig')) {
    await vscode.window.showErrorMessage('Select a .dig circuit file.');
    return undefined;
  }
  return uri;
}

function requireTrustedWorkspace(): boolean {
  if (vscode.workspace.isTrusted) {
    return true;
  }
  void vscode.window.showErrorMessage('Trust this workspace before launching Digital or running circuit files.');
  return false;
}

async function maybePromptForInstall(
  context: vscode.ExtensionContext,
  manager: DigitalManager,
  setup: () => Promise<boolean>
): Promise<void> {
  if (context.extensionMode !== vscode.ExtensionMode.Production) {
    return;
  }
  const configuration = vscode.workspace.getConfiguration('systemstudioCis310');
  if (!configuration.get<boolean>('promptToInstall', true)) {
    return;
  }
  const promptKey = `promptedForDigital.${DIGITAL_RELEASE.version}`;
  if (context.globalState.get<boolean>(promptKey, false)) {
    return;
  }
  const status = await manager.getStatus();
  if (status.integrityVerified) {
    await context.globalState.update(promptKey, true);
    return;
  }
  await context.globalState.update(promptKey, true);
  const action = await vscode.window.showInformationMessage(
    `SystemStudio CIS 310 can install the required Digital ${DIGITAL_RELEASE.displayVersion} simulator for you.`,
    'Install Digital',
    'Later'
  );
  if (action === 'Install Digital') {
    await setup();
  }
}

async function showFailure(title: string, error: unknown, output: vscode.OutputChannel): Promise<void> {
  const detail = errorMessage(error);
  output.appendLine(`${title}: ${detail}`);
  output.show(true);
  await vscode.window.showErrorMessage(`${title}: ${detail}`);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
