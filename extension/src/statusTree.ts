import * as vscode from 'vscode';
import type { AssemblyManager } from './assemblyManager';
import { DIGITAL_RELEASE, MINIMUM_JAVA_MAJOR } from './core/digitalRelease';
import type { DockerEngineStatus } from './core/dockerReadiness';
import {
  buildCourseModuleNavigation,
  type CourseModuleNavigation,
  type ModuleNavigationItem
} from './core/moduleNavigation';
import { CIS310_GSI, CIS310_INSTRUCTOR } from './core/courseContacts';
import {
  FALL_2026_CLASS_LOCATION,
  FALL_2026_CLASS_TIME_LABEL,
  FALL_2026_OFFICE_HOURS_LABEL,
  FALL_2026_OFFICE_LOCATION
} from './core/courseCalendar';
import type { DigitalManager } from './digitalManager';
import type { NativeAssemblyManager } from './nativeAssemblyManager';
import type { PracticeStore } from './practiceStore';

type StatusGroup = 'start' | 'modules' | 'coursework' | 'learn' | 'hands-on' | 'support' | 'advanced';
type StatusNode = vscode.TreeItem & { groupId?: StatusGroup; module?: CourseModuleNavigation };
type DockerStatusProvider = () => Promise<DockerEngineStatus>;

export class StatusTreeProvider implements vscode.TreeDataProvider<StatusNode> {
  private readonly changeEmitter = new vscode.EventEmitter<StatusNode | undefined>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  constructor(
    private readonly manager: DigitalManager,
    private readonly assemblyManager: AssemblyManager,
    private readonly nativeAssemblyManager: NativeAssemblyManager,
    private readonly practiceStore: PracticeStore,
    private readonly dockerStatus: DockerStatusProvider
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
      const learningPath = this.practiceStore.getLearningPath();
      const complete = learningPath.filter((module) => module.complete).length;
      return [
        groupItem('start', 'Start Here', 'home', true),
        groupItem('modules', `Course Modules (${complete}/${learningPath.length})`, 'list-tree', true),
        groupItem('learn', 'Practice and Progress', 'mortar-board', false),
        groupItem('coursework', 'Coursework and Final Presentation', 'checklist', false),
        groupItem('hands-on', 'Hands-on Labs', 'tools', false),
        groupItem('support', 'Help, Staff, and Canvas', 'comment-discussion', false),
        groupItem('advanced', 'Advanced Setup and Diagnostics', 'settings-gear', false)
      ];
    }

    if (element.module) {
      return element.module.items.map(moduleActionItem);
    }

    switch (element.groupId) {
      case 'start': {
        const dashboard = this.practiceStore.getDashboard();
        const nextPreparation = this.practiceStore.getLearningPath().find((module) => !module.complete);
        return [
          describedActionItem(
            'Set up or repair my course environment',
            'one guided Digital + Docker + NASM workflow · verified before ready',
            'systemstudioCis310.setupCourseEnvironment',
            'tools'
          ),
          describedActionItem(
            nextPreparation ? `Prepare ${nextPreparation.lectureLabel}` : 'Review my completed preparation path',
            nextPreparation ? 'open book · author video · 8-question bank · hands-on where assigned' : '13 lecture modules checked',
            'systemstudioCis310.openPracticeCenter',
            'book'
          ),
          describedActionItem(
	            dashboard.attempts > 0 ? 'Continue with 5-question practice' : 'Start a 5-question preparation check',
            dashboard.due > 0 ? `${dashboard.due} due for review` : 'recommended · explanations included',
            'systemstudioCis310.startQuickPractice',
            'sparkle'
          ),
          describedActionItem(
            'Ask Orbit AI learning coach',
            'U-M Codex CLI · private offline Orbit · attempt-first help',
            'systemstudioCis310.openAiTutor',
            'sparkle'
          ),
          describedActionItem(
            'Open Canvas — submit coursework here',
            'Fall 2026 authority',
            'systemstudioCis310.openCanvas',
            'cloud'
          ),
          describedActionItem('Open coursework roadmap', 'assignments · preflights · final · grade estimate', 'systemstudioCis310.openCourseworkCenter', 'checklist')
        ];
      }
      case 'modules':
        return buildCourseModuleNavigation(this.practiceStore.getLearningPath()).map(moduleItem);
      case 'coursework':
        return [
          describedActionItem(
            'Open Assignment Mission Control',
            'local planning and validation · Canvas remains authoritative',
            'systemstudioCis310.openCourseworkCenter',
            'checklist'
          ),
          describedActionItem(
            'Final: cumulative 4-bit processor + assembly program',
            'presentation during final examination week · exact logistics TBA in Canvas',
            'systemstudioCis310.openCourseworkCenter',
            'circuit-board'
          ),
          describedActionItem(
            'Open Canvas for official evaluation',
            'instructor grades and submission receipts',
            'systemstudioCis310.openCanvas',
            'cloud'
          )
        ];
      case 'learn':
        return [
          describedActionItem(
            'Prepare before class',
	            'accessible lesson · open book · author videos · preparation check',
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
            'Build with guided labs',
            '7 circuits · 7 actual NASM labs · self-paced',
            'systemstudioCis310.openGuidedLabs',
            'tools'
          ),
          describedActionItem(
            'Review due and saved questions',
            'spaced local review',
            'systemstudioCis310.reviewPractice',
            'history'
          ),
          describedActionItem(
            'Open Fall 2026 syllabus',
            'primary accessible HTML · Canvas current',
            'systemstudioCis310.openSyllabus',
            'file-code'
          ),
          describedActionItem(
            'Open bundled course-material guide',
            'open-book map · 3 homework · 3 milestones + final · 13 PDFs',
            'systemstudioCis310.openMaterialsIndex',
            'library'
          )
        ];
      case 'hands-on':
        return [
          describedActionItem('Open guided circuit and assembly labs', '7 circuits · 7 actual NASM labs · self-paced', 'systemstudioCis310.openGuidedLabs', 'map'),
          describedActionItem('Create a circuit in Full Digital', 'complete upstream simulator · embedded tab', 'systemstudioCis310.createCircuit', 'circuit-board'),
          describedActionItem('Open actual NASM debug workbench', 'registers · flags · stack · memory · disassembly', 'systemstudioCis310.openNasmWorkbench', 'debug-alt'),
          describedActionItem('Open Student Unit Test Center', 'Digital Testcases · NASM self-tests · assignment preflights', 'systemstudioCis310.openUnitTestCenter', 'beaker')
        ];
      case 'support':
        return [
          describedActionItem(
            'Ask Orbit AI learning coach',
            'U-M Codex CLI · private offline Orbit',
            'systemstudioCis310.openAiTutor',
            'sparkle'
          ),
          describedActionItem(
            'Configure or check U-M Codex',
            'U-M Codex CLI · private offline Orbit',
            'systemstudioCis310.configureAiAssistance',
            'settings-gear'
          ),
          describedActionItem(
            'Ask a question before class',
            'named or Canvas-enabled anonymous post',
            'systemstudioCis310.openPreClassQuestion',
            'send'
          ),
          describedActionItem(
            'Open local FAQ chat',
            'animated Orbit · private FAQ · topics · tools · Canvas routing',
            'systemstudioCis310.openStudentHelper',
            'comment-discussion'
          ),
          describedInfoItem(`Instructor: ${CIS310_INSTRUCTOR.name}`, `${CIS310_INSTRUCTOR.email} · ${CIS310_INSTRUCTOR.office}`, 'person'),
          describedInfoItem(CIS310_GSI.label, CIS310_GSI.detail, 'account'),
          describedInfoItem(`Class: M/W ${FALL_2026_CLASS_TIME_LABEL}`, FALL_2026_CLASS_LOCATION, 'calendar'),
          describedInfoItem('Instructor office hours: M/W', `${FALL_2026_OFFICE_HOURS_LABEL} · ${FALL_2026_OFFICE_LOCATION}`, 'clock'),
          describedActionItem('Open Fall 2026 course calendar', 'M/W 10:00–11:45 a.m. · ELB 1329', 'systemstudioCis310.openCourseCalendar', 'calendar'),
          describedActionItem('Open Fall 2026 syllabus', 'primary accessible HTML · Canvas current', 'systemstudioCis310.openSyllabus', 'file-code'),
          actionItem('Start or rerun guided tutorial', 'systemstudioCis310.startTutorial', 'lightbulb'),
          actionItem('Open Canvas', 'systemstudioCis310.openCanvas', 'cloud')
        ];
      case 'advanced': {
        const digital = await this.manager.getStatus();
        const assembly = await this.nativeAssemblyManager.status();
        const docker = await this.dockerStatus();
        return [
          describedActionItem('Run complete setup or repair', 'prepares every safe course-managed requirement', 'systemstudioCis310.setupCourseEnvironment', 'tools'),
          describedActionItem('Run detailed environment check', 'Digital · Docker · Java · trust', 'systemstudioCis310.checkEnvironment', 'pulse'),
          describedInfoItem(`Digital ${DIGITAL_RELEASE.displayVersion}`, digital.integrityVerified ? 'verified and installed' : 'setup required', digital.integrityVerified ? 'verified-filled' : 'warning'),
          describedInfoItem('Embedded Docker runtime', docker.state === 'ready' ? `ready · ${docker.serverVersion ?? ''}` : docker.detail, docker.state === 'ready' ? 'pass-filled' : 'warning'),
          describedInfoItem('Actual NASM/GDB workbench', assembly.available ? `ready via ${assembly.runtime}` : assembly.detail, assembly.available ? 'pass-filled' : 'warning'),
          actionItem('Create full CIS 310 starter workspace', 'systemstudioCis310.createStarterWorkspace', 'new-folder'),
          actionItem('Open setup and first-task guide', 'systemstudioCis310.openSetupGuide', 'question'),
          actionItem('Open extension documentation', 'systemstudioCis310.openDocumentation', 'book')
        ];
      }
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
      ? 'full upstream simulator ready'
      : 'setup required';
    digital.command = { command: 'systemstudioCis310.setupDigital', title: 'Install or verify Digital' };

    return [
      digital,
      actionItem('Open guided circuit labs', 'systemstudioCis310.openGuidedLabs', 'map', ['circuit-half-adder']),
      actionItem('Create a circuit in Full Digital', 'systemstudioCis310.createCircuit', 'new-file'),
      actionItem('Open an existing circuit in Full Digital', 'systemstudioCis310.openDigital', 'circuit-board'),
      actionItem('Open Student Unit Test Center', 'systemstudioCis310.openUnitTestCenter', 'beaker'),
      actionItem('Create full CIS 310 starter workspace', 'systemstudioCis310.createStarterWorkspace', 'new-folder')
    ];
  }

  private async assemblyItems(): Promise<StatusNode[]> {
    const trace = await this.assemblyManager.getStatus();
    const real = await this.nativeAssemblyManager.status();
    const status = new vscode.TreeItem('NASM 32-bit workbench', vscode.TreeItemCollapsibleState.None);
    status.iconPath = new vscode.ThemeIcon(real.available ? 'verified-filled' : 'tools');
    status.description = `${toolchainStateLabel(real.state)}${real.runtime ? ` · ${real.runtime === 'native-linux' ? 'native' : 'course container'}` : ''}`;
    status.tooltip = real.detail;
    status.command = {
      command: 'systemstudioCis310.checkAssemblyEnvironment',
      title: 'Check NASM workbench environment'
    };
    const tutor = new vscode.TreeItem('Instruction trace tutor', vscode.TreeItemCollapsibleState.None);
    tutor.iconPath = new vscode.ThemeIcon(trace.embeddedReady ? 'debug-alt' : 'warning');
    tutor.description = 'learning simulator — not an assembler';
    tutor.tooltip = trace.detail;
    return [
      status,
      actionItem('Open actual NASM debug workbench', 'systemstudioCis310.openNasmWorkbench', 'debug-alt'),
      actionItem('Build and run actual NASM code', 'systemstudioCis310.buildRunAssembly', 'run'),
      actionItem('Open NASM self-tests', 'systemstudioCis310.openUnitTestCenter', 'beaker'),
      tutor,
      actionItem('Open guided assembly labs', 'systemstudioCis310.openGuidedLabs', 'map', ['assembly-register-arithmetic']),
      actionItem('Create NASM lab workspace', 'systemstudioCis310.createAssemblyLab', 'new-folder'),
      actionItem('Open optional instruction trace tutor', 'systemstudioCis310.openAssemblyLab', 'symbol-event'),
      actionItem('Open NASM workbench guide', 'systemstudioCis310.openNasmGuide', 'book')
    ];
  }

  private async environmentItems(): Promise<StatusNode[]> {
    const status = await this.manager.getStatus();
    const containerPlatform = process.platform === 'win32' || process.platform === 'darwin';
    const docker = await this.dockerStatus();
    const java = new vscode.TreeItem(
      status.java.supported
        ? `Java ${status.java.version?.raw ?? ''}: ready`
        : status.java.available
          ? `Java ${status.java.version?.raw ?? 'unknown'}: unsupported`
          : containerPlatform
            ? 'Host Java: not found (embedded Digital still available)'
            : 'Java: not found',
      vscode.TreeItemCollapsibleState.None
    );
    java.iconPath = new vscode.ThemeIcon(status.java.supported ? 'pass-filled' : containerPlatform ? 'info' : 'warning');
    java.description = status.java.supported
      ? status.java.executable
      : containerPlatform
        ? 'container supplies Java · host Java for CLI/fallback'
        : `requires Java ${MINIMUM_JAVA_MAJOR}+`;
    java.command = { command: 'systemstudioCis310.checkEnvironment', title: 'Check CIS 310 environment' };

    const trust = new vscode.TreeItem(
      vscode.workspace.isTrusted ? 'Workspace: trusted' : 'Workspace: restricted',
      vscode.TreeItemCollapsibleState.None
    );
    trust.iconPath = new vscode.ThemeIcon(vscode.workspace.isTrusted ? 'shield' : 'lock');
    trust.description = vscode.workspace.isTrusted ? 'simulation enabled' : 'execution disabled';

    const dockerItem = new vscode.TreeItem(
      docker.state === 'ready'
        ? `Docker engine ${docker.serverVersion ?? ''}: ready`
        : docker.state === 'not-required'
          ? 'Docker: not required on this host'
          : 'Docker engine: not ready',
      vscode.TreeItemCollapsibleState.None
    );
    dockerItem.iconPath = new vscode.ThemeIcon(docker.state === 'ready' ? 'pass-filled' : docker.state === 'not-required' ? 'info' : 'warning');
	    dockerItem.description = docker.state === 'ready'
	      ? containerPlatform
	        ? 'in-tab Digital enabled'
	        : 'available for other course containers · Digital uses host Java'
	      : docker.detail;
    dockerItem.tooltip = docker.detail;
    dockerItem.command = { command: 'systemstudioCis310.checkEnvironment', title: 'Check Docker and Digital environment' };

    return [
      actionItem('Run complete environment check', 'systemstudioCis310.checkEnvironment', 'pulse'),
      actionItem('Open setup and first-task guide', 'systemstudioCis310.openSetupGuide', 'question'),
      dockerItem,
      java,
      trust
    ];
  }
}

function toolchainStateLabel(state: 'ready' | 'setup' | 'missing-debugger' | 'unsupported'): string {
  switch (state) {
    case 'ready': return 'ready';
    case 'setup': return 'setup needed';
    case 'missing-debugger': return 'missing GDB';
    case 'unsupported': return 'unsupported host';
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

function moduleItem(module: CourseModuleNavigation): StatusNode {
  const item: StatusNode = new vscode.TreeItem(
    module.label,
    module.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed
  );
  item.id = `systemstudioCis310.module.${module.resourceId}`;
  item.module = module;
  item.description = module.description;
  item.tooltip = module.tooltip;
  item.iconPath = new vscode.ThemeIcon(module.complete ? 'pass-filled' : module.next ? 'arrow-circle-right' : 'circle-outline');
  return item;
}

function moduleActionItem(action: ModuleNavigationItem): StatusNode {
  switch (action.kind) {
    case 'lesson':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.openLessonText', 'book-open', [action.resourceId]
      );
    case 'reading':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.openModuleSource', 'book-open',
        [action.resourceId, 'reading', action.index]
      );
    case 'toggle-read':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.toggleModuleStep',
        action.label.startsWith('Reading step completed') ? 'pass-filled' : 'circle-outline',
        [action.resourceId, 'read']
      );
    case 'video':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.openModuleSource', 'play-circle',
        [action.resourceId, 'video', action.index]
      );
    case 'toggle-watched':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.toggleModuleStep',
        action.label.startsWith('Video step completed') ? 'pass-filled' : 'circle-outline',
        [action.resourceId, 'watched']
      );
    case 'lecture':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.openCourseMaterial', 'file-pdf', [action.resourceId]
      );
    case 'practice':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.startModulePractice', 'beaker', [action.resourceId]
      );
    case 'lab':
      return describedActionItem(
        action.label, action.description, 'systemstudioCis310.openGuidedLabs', 'tools', [action.labId]
      );
  }
}

function actionItem(label: string, command: string, icon: string, args?: unknown[]): StatusNode {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.command = { command, title: label, ...(args ? { arguments: args } : {}) };
  return item;
}

function describedActionItem(
  label: string,
  description: string,
  command: string,
  icon: string,
  args?: unknown[]
): StatusNode {
  const item = actionItem(label, command, icon, args);
  item.description = description;
  item.tooltip = `${label}\n${description}`;
  return item;
}

function describedInfoItem(label: string, description: string, icon: string): StatusNode {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.description = description;
  item.tooltip = `${label}\n${description}`;
  return item;
}
