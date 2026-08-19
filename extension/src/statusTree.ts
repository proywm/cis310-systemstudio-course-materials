import * as vscode from 'vscode';
import { DIGITAL_RELEASE, MINIMUM_JAVA_MAJOR } from './core/digitalRelease';
import { isHeadlessRemote } from './core/runtimeEnvironment';
import type { DigitalManager } from './digitalManager';

export class StatusTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly changeEmitter = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  constructor(private readonly manager: DigitalManager) {}

  refresh(): void {
    this.changeEmitter.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const status = await this.manager.getStatus();
    const headlessRemote = isHeadlessRemote(vscode.env.remoteName);
    const digital = new vscode.TreeItem(
      status.integrityVerified
        ? `Digital ${DIGITAL_RELEASE.displayVersion}: installed`
        : status.installed
          ? `Digital ${DIGITAL_RELEASE.displayVersion}: integrity failure`
          : `Digital ${DIGITAL_RELEASE.displayVersion}: not installed`,
      vscode.TreeItemCollapsibleState.None
    );
    digital.iconPath = new vscode.ThemeIcon(
      status.integrityVerified ? 'verified-filled' : status.installed ? 'error' : 'cloud-download'
    );
    digital.description = status.integrityVerified
      ? headlessRemote ? 'preview/tests ready' : 'ready'
      : 'setup required';
    digital.command = {
      command: 'systemstudioCis310.setupDigital',
      title: 'Install or verify Digital'
    };

    const java = new vscode.TreeItem(
      status.java.supported
        ? `Java ${status.java.version?.raw ?? ''}: ready`
        : status.java.available
          ? `Java ${status.java.version?.raw ?? 'unknown'}: unsupported`
          : 'Java: not found',
      vscode.TreeItemCollapsibleState.None
    );
    java.iconPath = new vscode.ThemeIcon(status.java.supported ? 'pass-filled' : 'warning');
    java.description = status.java.supported ? status.java.executable : `requires Java ${MINIMUM_JAVA_MAJOR}+`;
    java.command = {
      command: 'systemstudioCis310.checkEnvironment',
      title: 'Check CIS 310 environment'
    };

    const trust = new vscode.TreeItem(
      vscode.workspace.isTrusted ? 'Workspace: trusted' : 'Workspace: restricted',
      vscode.TreeItemCollapsibleState.None
    );
    trust.iconPath = new vscode.ThemeIcon(vscode.workspace.isTrusted ? 'shield' : 'lock');
    trust.description = vscode.workspace.isTrusted ? 'simulation enabled' : 'execution disabled';

    const starter = actionItem(
      'Create CIS 310 starter workspace',
      'systemstudioCis310.createStarterWorkspace',
      'new-folder'
    );
    const materials = actionItem('Open course-material guide', 'systemstudioCis310.openMaterialsIndex', 'library');
    const open = headlessRemote
      ? informationItem(
          'Digital GUI: use local desktop VS Code',
          `${vscode.env.remoteName} has no graphical display`,
          'remote'
        )
      : actionItem('Open circuit in Digital', 'systemstudioCis310.openDigital', 'open-preview');
    const docs = actionItem('Open extension documentation', 'systemstudioCis310.openDocumentation', 'book');

    return [digital, java, trust, starter, materials, open, docs];
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}

function informationItem(label: string, description: string, icon: string): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.description = description;
  item.tooltip = 'Remote SSH is optional. Use local desktop VS Code for the full Digital graphical editing workflow.';
  return item;
}

function actionItem(label: string, command: string, icon: string): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.command = { command, title: label };
  return item;
}
