import * as vscode from 'vscode';
import type { AssemblyManager } from './assemblyManager';
import { DIGITAL_RELEASE, MINIMUM_JAVA_MAJOR } from './core/digitalRelease';
import { isHeadlessRemote } from './core/runtimeEnvironment';
import type { DigitalManager } from './digitalManager';
import type { PracticeStore } from './practiceStore';

type StatusGroup = 'start' | 'learn' | 'digital' | 'assembly' | 'environment' | 'help';
type StatusNode = vscode.TreeItem & { groupId?: StatusGroup };

export class StatusTreeProvider implements vscode.TreeDataProvider<StatusNode> {
  private readonly changeEmitter = new vscode.EventEmitter<StatusNode | undefined>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  constructor(
    private readonly manager: DigitalManager,
    private readonly assemblyManager: AssemblyManager,
    private readonly practiceStore: PracticeStore
  ) {
    this.practiceSubscription = practiceStore.onDidChange(() => this.refresh());
  }

  private readonly practiceSubscription: vscode.Disposable;

  refresh(): void {
    this.changeEmitter.fire(undefined);
  }

  getTreeItem(element: StatusNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: StatusNode): Promise<StatusNode[]> {
    if (!element) {
      return [
        groupItem('start', 'Start Here', 'home', true),
        groupItem('learn', 'Learn and Practice', 'mortar-board', false),
        groupItem('digital', 'Build Digital Circuits', 'circuit-board', false),
        groupItem('assembly', 'Assembly Programming', 'terminal', false),
        groupItem('environment', 'Environment and Setup', 'tools', false),
        groupItem('help', 'Tutor, Questions, and Help', 'comment-discussion', false)
      ];
    }

    switch (element.groupId) {
      case 'start': {
        const dashboard = this.practiceStore.getDashboard();
        const nextPreparation = this.practiceStore.getLearningPath().find((module) => !module.complete);
        return [
          describedActionItem(
            nextPreparation ? `Prepare ${nextPreparation.lectureLabel}` : 'Review my completed preparation path',
            nextPreparation ? 'open book · author video · 3 questions' : '13 lecture modules checked',
            'systemstudioCis310.openPracticeCenter',
            'book'
          ),
          describedActionItem(
            dashboard.attempts > 0 ? 'Continue with 5-question practice' : 'Start a 5-question readiness check',
            dashboard.due > 0 ? `${dashboard.due} due for review` : 'recommended · explanations included',
            'systemstudioCis310.startQuickPractice',
            'sparkle'
          ),
          describedActionItem(
            'Open Canvas — submit coursework here',
            'Fall 2026 authority',
            'systemstudioCis310.openCanvas',
            'cloud'
          ),
          describedActionItem(
            'Open Fall 2026 course calendar',
            '27 M/W meetings · starts Aug 26',
            'systemstudioCis310.openCourseCalendar',
            'calendar'
          )
        ];
      }
      case 'learn':
        return [
          describedActionItem(
            'Prepare before class',
            'mapped open book · author videos · readiness check',
            'systemstudioCis310.openPracticeCenter',
            'book'
          ),
          describedActionItem(
            'Practice by topic or take a quiz',
            'short sessions · confidence check · explanations',
            'systemstudioCis310.openPracticeCenter',
            'beaker'
          ),
          describedActionItem(
            'Review due and saved questions',
            'spaced local review',
            'systemstudioCis310.reviewPractice',
            'history'
          ),
          describedActionItem(
            'Open Fall 2026 syllabus',
            'active PDF · Canvas current',
            'systemstudioCis310.openSyllabus',
            'file-pdf'
          ),
          describedActionItem(
            'Open bundled course-material guide',
            'open-book map · 3 homework · 3 projects · 13 PDFs',
            'systemstudioCis310.openMaterialsIndex',
            'library'
          )
        ];
      case 'digital':
        return this.digitalItems();
      case 'assembly':
        return this.assemblyItems();
      case 'environment':
        return this.environmentItems();
      case 'help':
        return [
          describedActionItem(
            'Open U-M Maizey AI course tutor',
            'attempt first · hints, not deliverables',
            'systemstudioCis310.openAiTutor',
            'sparkle'
          ),
          describedActionItem(
            'Ask a question before class',
            'named or Canvas-enabled anonymous post',
            'systemstudioCis310.openPreClassQuestion',
            'send'
          ),
          describedActionItem(
            'Open local FAQ chat',
            'private · topics · tools · Canvas routing',
            'systemstudioCis310.openStudentHelper',
            'comment-discussion'
          ),
          actionItem('Start or rerun guided tutorial', 'systemstudioCis310.startTutorial', 'lightbulb'),
          actionItem('Open native Getting Started', 'systemstudioCis310.openGettingStarted', 'map'),
          actionItem('Open extension documentation', 'systemstudioCis310.openDocumentation', 'book')
        ];
      default:
        return [];
    }
  }

  dispose(): void {
    this.practiceSubscription.dispose();
    this.changeEmitter.dispose();
  }

  private async digitalItems(): Promise<StatusNode[]> {
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
      ? headlessRemote ? 'preview/tests ready; GUI local' : 'ready'
      : 'setup required';
    digital.command = { command: 'systemstudioCis310.setupDigital', title: 'Install or verify Digital' };

    const open = headlessRemote
      ? informationItem('Digital GUI: use local desktop VS Code', `${vscode.env.remoteName} has no graphical display`, 'remote')
      : actionItem('Open an existing circuit in Digital', 'systemstudioCis310.openDigital', 'open-preview');

    return [
      digital,
      actionItem('Create a new blank Digital circuit', 'systemstudioCis310.createCircuit', 'new-file'),
      open,
      actionItem('Create full CIS 310 starter workspace', 'systemstudioCis310.createStarterWorkspace', 'new-folder')
    ];
  }

  private async assemblyItems(): Promise<StatusNode[]> {
    const assembly = await this.assemblyManager.getStatus();
    const status = new vscode.TreeItem('Embedded IA-32 teaching lab', vscode.TreeItemCollapsibleState.None);
    status.iconPath = new vscode.ThemeIcon(assembly.embeddedReady ? 'verified-filled' : 'terminal');
    status.description = 'Irvine32 Classroom + NASM IA-32';
    status.tooltip = assembly.detail;
    status.command = {
      command: 'systemstudioCis310.checkAssemblyEnvironment',
      title: 'Check embedded assembly engine'
    };
    return [
      status,
      actionItem('Create Irvine32 / NASM assembly lab', 'systemstudioCis310.createAssemblyLab', 'new-folder'),
      actionItem('Open assembly lab', 'systemstudioCis310.openAssemblyLab', 'debug-alt'),
      actionItem('Run assembly file', 'systemstudioCis310.runAssembly', 'run'),
      actionItem('Open assembly compatibility guide', 'systemstudioCis310.openMasmGuide', 'book')
    ];
  }

  private async environmentItems(): Promise<StatusNode[]> {
    const status = await this.manager.getStatus();
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
    java.command = { command: 'systemstudioCis310.checkEnvironment', title: 'Check CIS 310 environment' };

    const trust = new vscode.TreeItem(
      vscode.workspace.isTrusted ? 'Workspace: trusted' : 'Workspace: restricted',
      vscode.TreeItemCollapsibleState.None
    );
    trust.iconPath = new vscode.ThemeIcon(vscode.workspace.isTrusted ? 'shield' : 'lock');
    trust.description = vscode.workspace.isTrusted ? 'simulation enabled' : 'execution disabled';

    return [
      actionItem('Run complete environment check', 'systemstudioCis310.checkEnvironment', 'pulse'),
      java,
      trust
    ];
  }
}

function groupItem(id: StatusGroup, label: string, icon: string, expanded: boolean): StatusNode {
  const item: StatusNode = new vscode.TreeItem(
    label,
    expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed
  );
  item.id = `systemstudioCis310.group.${id}`;
  item.groupId = id;
  item.iconPath = new vscode.ThemeIcon(icon);
  return item;
}

function informationItem(label: string, description: string, icon: string): StatusNode {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.description = description;
  item.tooltip = 'Remote SSH is optional. Use local desktop VS Code for the full Digital graphical editing workflow.';
  return item;
}

function actionItem(label: string, command: string, icon: string): StatusNode {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.command = { command, title: label };
  return item;
}

function describedActionItem(label: string, description: string, command: string, icon: string): StatusNode {
  const item = actionItem(label, command, icon);
  item.description = description;
  return item;
}
