import { access } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { AssemblyLabPanel } from './assemblyLabPanel';
import { AssemblyManager } from './assemblyManager';
import { CircuitPreviewProvider } from './circuitPreview';
import { CopilotCoachPanel } from './copilotCoachPanel';
import { AI_TUTOR_PREFLIGHT } from './core/aiTutorGuardrails';
import { classifyTutorDestination } from './core/aiCoach';
import { prepareSaveParent } from './core/circuitSave';
import { circuitTutorPrompt } from './core/circuitPreflight';
import { DIGITAL_RELEASE, MINIMUM_JAVA_MAJOR } from './core/digitalRelease';
import { probeDockerEngine } from './core/dockerReadiness';
import { guidedAssemblyTutorPrompt, guidedLab } from './core/guidedLabs';
import { lessonTutorPrompt } from './core/lessonNarratives';
import {
  MODULE_CONFIDENCE_QUESTION_TARGET,
  preparationModule,
  preparationUrl,
  type PreparationField
} from './core/learningResources';
import { CourseMaterials, CourseMaterialsTreeProvider } from './courseMaterials';
import { CourseworkPanel } from './courseworkPanel';
import {
  CourseCalendarPanel,
  exportFall2026CourseCalendar,
  openOfficialAcademicCalendar
} from './courseCalendarPanel';
import { DigitalManager } from './digitalManager';
import { FullDigitalEditorProvider } from './fullDigitalEditor';
import { FullDigitalRuntime } from './fullDigitalRuntime';
import { DigitalTestController } from './digitalTests';
import { GuidedLabPanel } from './guidedLabPanel';
import { LessonTextPanel } from './lessonTextPanel';
import { NativeAssemblyManager } from './nativeAssemblyManager';
import { NasmTestController } from './nasmTests';
import { NasmWorkbenchPanel } from './nasmWorkbenchPanel';
import { PracticePanel } from './practicePanel';
import { PracticeStore } from './practiceStore';
import { PreClassQuestionPanel } from './preClassQuestionPanel';
import { StatusTreeProvider } from './statusTree';
import { StudentHelperPanel } from './studentHelperPanel';
import { SetupGuidePanel } from './setupGuidePanel';
import { TutorialPanel } from './tutorialPanel';
import { UnitTestCenterPanel } from './unitTestCenterPanel';

const JAVA_DOWNLOAD = vscode.Uri.parse('https://adoptium.net/temurin/releases/');
const DEFAULT_CANVAS_COURSE = 'https://canvas.umd.umich.edu/courses/552144';
const EMBEDDED_CONTAINER_PLATFORM = process.platform === 'win32' || process.platform === 'darwin';
const CONTEXTUAL_TUTOR_OPEN_LABEL = 'Choose Learning Coach';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel('SystemStudio CIS 310', { log: true });
  const manager = new DigitalManager(context, output);
  const fullDigitalRuntime = new FullDigitalRuntime(context, manager, output);
  const assemblyManager = new AssemblyManager(context, output);
  const nativeAssemblyManager = new NativeAssemblyManager(context, output);
  const courseMaterials = await CourseMaterials.load(context);
  const practiceStore = new PracticeStore(context.globalState);
  const materialsTree = new CourseMaterialsTreeProvider(courseMaterials);
  const statusTree = new StatusTreeProvider(
    manager,
    assemblyManager,
    nativeAssemblyManager,
    practiceStore,
    () => probeDockerEngine()
  );
  const tests = new DigitalTestController(manager);
  const nasmTests = new NasmTestController(nativeAssemblyManager);
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 60);
  statusBar.command = 'systemstudioCis310.checkEnvironment';
  statusBar.show();

  const updateStatus = async (): Promise<void> => {
    const status = await manager.getStatus();
    const docker = await probeDockerEngine();
    const dockerReady = docker.state === 'ready';
    if (status.integrityVerified && (status.java.supported || dockerReady)) {
      statusBar.text = `$(circuit-board) CIS 310: Digital ${status.version}`;
      statusBar.tooltip = dockerReady
        ? `Digital is installed; Docker engine ${docker.serverVersion ?? ''} is ready for the in-tab simulator.`
        : `Digital and host Java are ready for the native simulator. ${docker.detail}`;
      statusBar.backgroundColor = undefined;
    } else {
      statusBar.text = '$(warning) CIS 310: setup required';
      statusBar.tooltip = !status.integrityVerified
        ? `Install Digital ${status.version}`
        : EMBEDDED_CONTAINER_PLATFORM
          ? `${docker.detail} Alternatively install Java ${MINIMUM_JAVA_MAJOR}+ for the native simulator.`
          : `Java ${MINIMUM_JAVA_MAJOR}+ is required on this host`;
      statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
  };

  const setupDigital = async (): Promise<boolean> => {
    const existing = await manager.getStatus();
    if (existing.integrityVerified) {
      const action = await vscode.window.showInformationMessage(
        `Digital ${existing.version} is installed and its checksum is valid.`,
        'Verify host Java',
        'Reinstall'
      );
      if (action === 'Verify host Java') {
        await checkEnvironment(manager, output);
        return existing.java.supported || (await probeDockerEngine()).state === 'ready';
      }
      if (action !== 'Reinstall') {
        return existing.java.supported || (await probeDockerEngine()).state === 'ready';
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
      if (!status.java.supported && EMBEDDED_CONTAINER_PLATFORM) {
        const docker = await probeDockerEngine();
        if (docker.state === 'ready') {
          await vscode.window.showInformationMessage(
            `Digital ${DIGITAL_RELEASE.displayVersion} is installed. Docker engine ${docker.serverVersion} is ready for the in-tab simulator; host Java is needed only for native fallback and CLI tools.`
          );
        } else {
          const action = await vscode.window.showWarningMessage(
            `Digital ${DIGITAL_RELEASE.displayVersion} is installed, but it cannot run yet. ${docker.detail}`,
            'Open setup guide'
          );
          if (action === 'Open setup guide') {
            await vscode.commands.executeCommand('systemstudioCis310.openSetupGuide');
          }
        }
      } else if (!status.java.supported) {
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
      return status.integrityVerified && (
        status.java.supported || (await probeDockerEngine()).state === 'ready'
      );
    } catch (error) {
      output.appendLine(errorMessage(error));
      output.show(true);
      await vscode.window.showErrorMessage(`Digital installation failed: ${errorMessage(error)}`);
      return false;
    }
  };

  context.subscriptions.push(
    output,
    fullDigitalRuntime,
    assemblyManager,
    practiceStore,
    statusTree,
    materialsTree,
    tests,
    nasmTests,
    statusBar,
    vscode.window.registerTreeDataProvider('systemstudioCis310.explorer', statusTree),
    vscode.window.registerTreeDataProvider('systemstudioCis310.materials', materialsTree),
    vscode.window.registerCustomEditorProvider(
      FullDigitalEditorProvider.viewType,
      new FullDigitalEditorProvider(
        context,
        manager,
        fullDigitalRuntime,
        () => ensureReady(manager, output, setupDigital, EMBEDDED_CONTAINER_PLATFORM),
        output
      ),
      { webviewOptions: { retainContextWhenHidden: true }, supportsMultipleEditorsPerDocument: false }
    ),
    vscode.window.registerCustomEditorProvider(
      CircuitPreviewProvider.viewType,
      new CircuitPreviewProvider(context, manager),
      { webviewOptions: { retainContextWhenHidden: false }, supportsMultipleEditorsPerDocument: false }
    ),
    vscode.commands.registerCommand('systemstudioCis310.startTutorial', async () => {
      await TutorialPanel.show(context, true);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openGettingStarted', async () => {
      await TutorialPanel.openNativeWalkthrough();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openStudentHelper', async () => {
      await StudentHelperPanel.show(context);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openUnitTestCenter', async () => {
      await tests.refresh();
      await nasmTests.refresh();
      UnitTestCenterPanel.show();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openCopilotCoach', async (starterPrompt?: unknown) => {
      await CopilotCoachPanel.show(typeof starterPrompt === 'string' ? starterPrompt : undefined);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openAiTutor', async (launchContext?: unknown) => {
      const starterPrompt = contextualTutorPrompt(launchContext);
      const openLabel = starterPrompt ? CONTEXTUAL_TUTOR_OPEN_LABEL : AI_TUTOR_PREFLIGHT.openLabel;
      const decision = await vscode.window.showInformationMessage(
        starterPrompt ? 'Use this lesson prompt with a CIS 310 learning coach?' : AI_TUTOR_PREFLIGHT.message,
        {
          modal: true,
          detail: starterPrompt
            ? `For Maizey, the source-bounded prompt is copied to the clipboard; for the optional Copilot coach, it is placed in the local prompt box for review before sending. ${AI_TUTOR_PREFLIGHT.detail}`
            : AI_TUTOR_PREFLIGHT.detail
        },
        openLabel,
        AI_TUTOR_PREFLIGHT.syllabusLabel
      );
      if (decision === AI_TUTOR_PREFLIGHT.syllabusLabel) {
        await vscode.commands.executeCommand('systemstudioCis310.openSyllabus');
        return;
      }
      if (decision !== openLabel) return;
      const provider = await vscode.window.showQuickPick([
        {
          label: '$(mortar-board) U-M Maizey in Canvas (Recommended)',
          description: 'course-grounded after the instructor publishes and indexes the tutor',
          provider: 'maizey' as const
        },
        {
          label: '$(github) GitHub Copilot in VS Code',
          description: 'optional fallback using the student’s signed-in VS Code account',
          provider: 'copilot' as const
        },
        {
          label: '$(info) How the two choices differ',
          description: 'Maizey uses indexed course sources; Copilot receives only what the student types',
          provider: 'explain' as const
        }
      ], { placeHolder: 'Choose the learning coach for this question' });
      if (!provider) return;
      if (provider.provider === 'explain') {
        await vscode.window.showInformationMessage(
          'Maizey is the preferred course-grounded tutor after its student App is published and its Canvas sources are indexed. The optional Copilot coach uses a model available to the student’s VS Code account, sends only the typed prompt, and has no automatic access to Canvas, grades, files, or private course data.'
        );
        return;
      }
      if (provider.provider === 'copilot') {
        await CopilotCoachPanel.show(starterPrompt);
        return;
      }
      if (starterPrompt) await vscode.env.clipboard.writeText(starterPrompt);
      const configured = vscode.workspace.getConfiguration('systemstudioCis310')
        .get<string>('maizeyTutorUrl', DEFAULT_CANVAS_COURSE);
      const destination = classifyTutorDestination(configured);
      if (destination.kind === 'maizey-management') {
        const action = await vscode.window.showWarningMessage(
          'That URL is a Maizey project-management page, not a student chat App. It will not be opened. Publish an App after indexing course data, then configure its student-facing share URL.',
          'Open Canvas Course',
          'Configure Student App URL'
        );
        if (action === 'Configure Student App URL') {
          await vscode.commands.executeCommand('workbench.action.openSettings', 'systemstudioCis310.maizeyTutorUrl');
          return;
        }
        if (action !== 'Open Canvas Course') return;
        await vscode.env.openExternal(vscode.Uri.parse(DEFAULT_CANVAS_COURSE));
      } else if (destination.kind === 'maizey-app') {
        await vscode.env.openExternal(vscode.Uri.parse(destination.url));
      } else {
        await vscode.window.showInformationMessage(
          'A published student Maizey App URL is not configured yet. Opening the CIS 310 Canvas course; use the Maizey course-navigation item after the instructor enables it.'
        );
        await vscode.env.openExternal(vscode.Uri.parse(DEFAULT_CANVAS_COURSE));
      }
      if (starterPrompt) {
        await vscode.window.showInformationMessage(
          'The lesson prompt is on your clipboard. Paste it into the U-M tutor, make an attempt, and ask for one hint at a time.'
        );
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.openPreClassQuestion', async () => {
      PreClassQuestionPanel.show(context);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openPracticeCenter', async () => {
      await PracticePanel.show(context, practiceStore, courseMaterials);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openCourseworkCenter', async () => {
      CourseworkPanel.show(context, practiceStore, courseMaterials, manager);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openLessonText', async (resourceId: unknown) => {
      if (typeof resourceId !== 'string' || !preparationModule(resourceId)) {
        await vscode.window.showErrorMessage('The selected accessible HTML lecture is invalid.');
        return;
      }
      await LessonTextPanel.show(courseMaterials, resourceId);
    }),
    vscode.commands.registerCommand(
      'systemstudioCis310.openModuleSource',
      async (resourceId: unknown, target: unknown, sourceIndex: unknown) => {
        if (typeof resourceId !== 'string' || !preparationModule(resourceId)
          || (target !== 'reading' && target !== 'video')
          || typeof sourceIndex !== 'number' || !Number.isInteger(sourceIndex) || sourceIndex < 0) {
          await vscode.window.showErrorMessage('The selected course-module source is invalid.');
          return;
        }
        const url = preparationUrl(resourceId, target, sourceIndex);
        if (!url) {
          await vscode.window.showErrorMessage('The selected course-module source is unavailable.');
          return;
        }
        await vscode.env.openExternal(vscode.Uri.parse(url));
      }
    ),
    vscode.commands.registerCommand(
      'systemstudioCis310.toggleModuleStep',
      async (resourceId: unknown, field: unknown) => {
        if (typeof resourceId !== 'string' || !preparationModule(resourceId)
          || (field !== 'read' && field !== 'watched')) {
          await vscode.window.showErrorMessage('The selected course-module progress step is invalid.');
          return;
        }
        await practiceStore.togglePreparation(resourceId, field as PreparationField);
      }
    ),
    vscode.commands.registerCommand('systemstudioCis310.startModulePractice', async (resourceId: unknown) => {
      if (typeof resourceId !== 'string' || !preparationModule(resourceId)) {
        await vscode.window.showErrorMessage('The selected course module is invalid.');
        return;
      }
      await PracticePanel.show(context, practiceStore, courseMaterials, {
        mode: 'practice', focus: 'recommended', resourceId, length: MODULE_CONFIDENCE_QUESTION_TARGET
      });
    }),
    vscode.commands.registerCommand('systemstudioCis310.openGuidedLabs', async (labId?: unknown) => {
      await GuidedLabPanel.show(context, practiceStore, typeof labId === 'string' ? labId : undefined);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openGuidedLabArtifact', async (labId: unknown) => {
      const lab = typeof labId === 'string' ? guidedLab(labId) : undefined;
      if (!lab) {
        await vscode.window.showErrorMessage('The selected guided lab is invalid.');
        return;
      }
      const workspaceFolder = await chooseWorkspaceFolder(`Choose a workspace for “${lab.title}”`);
      if (!workspaceFolder) {
        await vscode.window.showErrorMessage('Open a local folder before creating or opening a guided lab artifact.');
        return;
      }
      if (lab.artifact.kind === 'circuit') {
        try {
          const target = await createUniqueCircuit(
            manager,
            path.join(workspaceFolder.uri.fsPath, 'circuits', 'guided'),
            lab.artifact.fileName
          );
          await offerToOpenCircuit(vscode.Uri.file(target), `Created a fresh circuit for “${lab.title}”`);
        } catch (error) {
          await showFailure('Could not create the guided circuit', error, output);
        }
        return;
      }
      try {
        const assemblyRoot = path.join(workspaceFolder.uri.fsPath, 'assembly');
        const guide = path.join(assemblyRoot, 'README.md');
        let assemblyLabExists = false;
        try {
          await access(guide);
          assemblyLabExists = true;
        } catch {
          assemblyLabExists = false;
        }
        if (assemblyLabExists) {
          await assemblyManager.upgradeLab(workspaceFolder.uri.fsPath);
        } else {
          await assemblyManager.createLab(workspaceFolder.uri.fsPath);
        }
        const target = path.join(assemblyRoot, ...lab.artifact.relativePath.split('/'));
        await access(target);
        const uri = vscode.Uri.file(target);
        await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.One, preview: false });
        await NasmWorkbenchPanel.show(context, nativeAssemblyManager, uri);
      } catch (error) {
        await showFailure('Could not open the guided assembly lab', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.startQuickPractice', async () => {
      await PracticePanel.show(context, practiceStore, courseMaterials, {
        mode: 'practice', focus: 'recommended', length: 5
      });
    }),
    vscode.commands.registerCommand('systemstudioCis310.reviewPractice', async () => {
      const dashboard = practiceStore.getDashboard();
      await PracticePanel.show(context, practiceStore, courseMaterials, {
        mode: 'practice', focus: dashboard.due > 0 ? 'due' : dashboard.saved > 0 ? 'saved' : 'recommended', length: 5
      });
    }),
    vscode.commands.registerCommand('systemstudioCis310.openCanvas', async () => {
      const configured = vscode.workspace.getConfiguration('systemstudioCis310')
        .get<string>('canvasCourseUrl', DEFAULT_CANVAS_COURSE);
      const uri = safeHttpsUri(configured) ?? vscode.Uri.parse(DEFAULT_CANVAS_COURSE);
      if (!safeHttpsUri(configured)) {
        await vscode.window.showWarningMessage(
          'The configured Canvas course URL is invalid. Opening the default Fall 2026 CIS 310 course instead.'
        );
      }
      await vscode.env.openExternal(uri);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openCourseCalendar', async () => {
      CourseCalendarPanel.show(context);
    }),
    vscode.commands.registerCommand('systemstudioCis310.exportCourseCalendar', async () => {
      await exportFall2026CourseCalendar();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openAcademicCalendar', async () => {
      await openOfficialAcademicCalendar();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openSyllabus', async () => {
      const syllabus = courseMaterials.getResource('syllabus-fall-2026');
      if (!syllabus) {
        await vscode.window.showErrorMessage('The packaged Fall 2026 syllabus is unavailable.');
        return;
      }
      await courseMaterials.openResource(syllabus);
    }),
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
        await vscode.commands.executeCommand('vscode.openWith', uri, FullDigitalEditorProvider.viewType);
      } catch (error) {
        await showFailure('Could not launch Digital', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.createCircuit', async () => {
      const workspaceFolder = await chooseWorkspaceFolder('Choose a workspace for the new Digital circuit');
      let defaultUri: vscode.Uri | undefined;
      if (workspaceFolder) {
        const preferred = vscode.Uri.joinPath(workspaceFolder.uri, 'circuits', 'work');
        const prepared = await prepareSaveParent(
          preferred,
          workspaceFolder.uri,
          (target) => vscode.workspace.fs.createDirectory(target)
        );
        defaultUri = vscode.Uri.joinPath(prepared.parent, 'new-circuit.dig');
        if (prepared.usedFallback) {
          void vscode.window.showWarningMessage(
            `SystemStudio could not prepare circuits/work, so the save dialog will start at the workspace root. ${prepared.reason ?? ''}`.trim()
          );
        }
      }
      const uri = await vscode.window.showSaveDialog({
        title: 'Create a new Digital circuit',
        defaultUri,
        saveLabel: 'Create Circuit',
        filters: { 'Digital circuits': ['dig'] }
      });
      if (!uri || uri.scheme !== 'file') {
        return;
      }
      const target = uri.fsPath.toLowerCase().endsWith('.dig') ? uri.fsPath : `${uri.fsPath}.dig`;
      try {
        const created = await createUniqueCircuit(manager, path.dirname(target), path.basename(target));
        const label = created === target
          ? 'Created a blank Digital circuit'
          : `The selected filename already existed, so SystemStudio safely created ${path.basename(created)}`;
        await offerToOpenCircuit(vscode.Uri.file(created), label);
      } catch (error) {
        await showFailure('Could not create the Digital circuit', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.createAssignmentCircuit', async (candidate: unknown) => {
      const resourceId = courseResourceId(candidate);
      const resource = resourceId ? courseMaterials.getResource(resourceId) : undefined;
      if (!resource?.circuitStarter) {
        await vscode.window.showErrorMessage('This course-material entry does not define a circuit starter.');
        return;
      }
      const workspaceFolder = await chooseWorkspaceFolder('Choose a workspace for the assignment circuit');
      if (!workspaceFolder) {
        await vscode.window.showErrorMessage('Open a local folder before creating an assignment circuit.');
        return;
      }
      try {
        const target = await createUniqueCircuit(
          manager,
          path.join(workspaceFolder.uri.fsPath, 'circuits', 'work'),
          resource.circuitStarter.fileName
        );
        await offerToOpenCircuit(
          vscode.Uri.file(target),
          `Created ${path.basename(target)} for ${resource.title}`
        );
      } catch (error) {
        await showFailure('Could not create the assignment circuit', error, output);
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
    vscode.commands.registerCommand('systemstudioCis310.createAssemblyLab', async () => {
      const workspaceFolder = await chooseWorkspaceFolder('Choose a workspace for the assembly examples');
      if (!workspaceFolder) {
        await vscode.window.showErrorMessage('Open a local folder before creating the assembly examples.');
        return;
      }
      const existingGuide = path.join(workspaceFolder.uri.fsPath, 'assembly', 'README.md');
      let labExists = false;
      try {
        await access(existingGuide);
        labExists = true;
      } catch {
        // Expected when the lab has not been created yet.
      }
      if (labExists) {
        try {
          const upgraded = await assemblyManager.upgradeLab(workspaceFolder.uri.fsPath);
          const action = await vscode.window.showInformationMessage(
            upgraded.addedFiles
              ? 'Added current NASM workbench and trace-practice resources without overwriting student .asm files. Older generated guides were archived before replacement.'
              : `The assembly workspace already exists at ${path.dirname(existingGuide)}.`,
            'Open Guide',
            'Open NASM Workbench'
          );
          if (action === 'Open Guide') {
            await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(upgraded.guidePath));
          } else if (action === 'Open NASM Workbench') {
            const uri = vscode.Uri.file(upgraded.entryPath);
            await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.One, preview: false });
            await NasmWorkbenchPanel.show(context, nativeAssemblyManager, uri);
          }
        } catch (error) {
          await showFailure('Could not update the assembly workspace', error, output);
        }
        return;
      }
      try {
        const created = await assemblyManager.createLab(workspaceFolder.uri.fsPath);
        const action = await vscode.window.showInformationMessage(
          `Created the NASM 32-bit workspace and optional instruction-trace practice at ${created}.`,
          'Open Guide',
          'Open NASM Workbench'
        );
        if (action === 'Open Guide') {
          await vscode.commands.executeCommand(
            'markdown.showPreview',
            vscode.Uri.file(path.join(created, 'README.md'))
          );
        } else if (action === 'Open NASM Workbench') {
          const uri = vscode.Uri.file(path.join(created, 'nasm-elf32', 'RegisterArithmetic.asm'));
          await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.One, preview: false });
          await NasmWorkbenchPanel.show(context, nativeAssemblyManager, uri);
        }
      } catch (error) {
        await showFailure('Could not create the assembly workspace', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.checkAssemblyEnvironment', async () => {
      const trace = await assemblyManager.getStatus();
      const real = await nativeAssemblyManager.status();
      output.appendLine([
        'CIS 310 Assembly Environment',
        `Actual NASM/ELF32: ${real.available ? `ready via ${real.runtime}` : 'setup needed'}`,
        `Runtime detail: ${real.detail}`,
        `Trace tutor bundled: ${trace.embeddedReady ? 'yes' : 'no'} (not an assembler)`,
        `Trace detail: ${trace.detail}`
      ].join('\n'));
      output.show(true);
      const action = await vscode.window.showInformationMessage(
        `NASM 32-bit: ${real.available ? `ready via ${real.runtime}` : 'setup needed'}. ${real.detail}`,
        real.available ? 'Open Output' : 'Prepare Environment'
      );
      if (action === 'Prepare Environment') {
        try {
          await nativeAssemblyManager.prepare();
          statusTree.refresh();
        } catch (error) {
          await showFailure('Could not prepare the NASM environment', error, output);
        }
      } else if (action === 'Open Output') {
        output.show(true);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.buildRunAssembly', async (candidate?: vscode.Uri) => {
      if (!requireTrustedWorkspace()) return;
      const uri = await resolveAssemblyUri(candidate);
      if (!uri) return;
      try {
        const result = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'Building and running actual NASM/ELF32 code', cancellable: false },
          () => nativeAssemblyManager.buildAndRun(uri)
        );
        output.show(true);
        const programOutput = [result.execution.stdout.trim(), result.execution.stderr.trim()].filter(Boolean).join('\n');
        const message = `NASM via ${result.runtime} produced ${path.basename(result.executablePath)} and executed actual IA-32 machine code (exit ${result.execution.code}).`;
        if (result.execution.timedOut || result.execution.code !== 0) {
          await vscode.window.showWarningMessage(`${message}${programOutput ? ` Output: ${programOutput}` : ''}`);
        } else {
          await vscode.window.showInformationMessage(`${message}${programOutput ? ` Output: ${programOutput}` : ''}`);
        }
      } catch (error) {
        await showFailure('Real assembly build/run failed', error, output);
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.openNasmWorkbench', async (candidate?: vscode.Uri) => {
      if (!requireTrustedWorkspace()) return;
      const uri = await resolveAssemblyUri(candidate);
      if (uri) await NasmWorkbenchPanel.show(context, nativeAssemblyManager, uri);
    }),
    vscode.commands.registerCommand('systemstudioCis310.openAssemblyLab', async (candidate?: vscode.Uri) => {
      const uri = await resolveAssemblyUri(candidate);
      if (uri) {
        await AssemblyLabPanel.show(context, assemblyManager, uri, 'assemble');
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.runAssembly', async (candidate?: vscode.Uri) => {
      const uri = await resolveAssemblyUri(candidate);
      if (!uri) {
        return;
      }
      await AssemblyLabPanel.show(context, assemblyManager, uri, 'run');
    }),
    vscode.commands.registerCommand('systemstudioCis310.stepAssembly', async (candidate?: vscode.Uri) => {
      const uri = await resolveAssemblyUri(candidate);
      if (uri) {
        await AssemblyLabPanel.show(context, assemblyManager, uri, 'step');
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.resetAssembly', async (candidate?: vscode.Uri) => {
      const uri = await resolveAssemblyUri(candidate);
      if (uri) {
        await AssemblyLabPanel.show(context, assemblyManager, uri, 'reset');
      }
    }),
    vscode.commands.registerCommand('systemstudioCis310.openNasmGuide', async () => {
      await vscode.commands.executeCommand('markdown.showPreview', assemblyManager.compatibilityGuideUri);
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
      await nasmTests.refresh();
      await updateStatus();
    }),
    vscode.commands.registerCommand('systemstudioCis310.openDocumentation', async () => {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(context.extensionUri, 'README.md'));
      await vscode.window.showTextDocument(document, { preview: true });
    }),
    vscode.commands.registerCommand('systemstudioCis310.openSetupGuide', async () => {
      await SetupGuidePanel.show(context);
    }),
    vscode.workspace.onDidGrantWorkspaceTrust(() => {
      statusTree.refresh();
      void tests.refresh();
      void updateStatus();
    })
  );

  void (async () => {
    await updateStatus();
    const tutorialPromptHandled = await TutorialPanel.promptOnFirstRun(context);
    if (!tutorialPromptHandled) {
      await maybePromptForInstall(context, manager, setupDigital);
    }
  })();
}

async function browseCourseMaterials(
  courseMaterials: CourseMaterials,
  kind: 'presentation' | 'assignment',
  placeHolder: string
): Promise<void> {
  const entries = courseMaterials.getResources(kind).map((resource) => ({
    label: resource.title,
    description: kind === 'presentation' ? 'packaged offline PDF' : 'packaged reference',
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
  const docker = await probeDockerEngine();
  const dockerReady = docker.state === 'ready';
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
    `Embedded Docker runtime: ${docker.state}`,
    `Docker detail: ${docker.detail}`,
    `Workspace trusted: ${vscode.workspace.isTrusted ? 'yes' : 'no'}`
  ];
  output.appendLine(lines.join('\n'));
  output.show(true);

  if (status.integrityVerified && (status.java.supported || dockerReady)) {
    await vscode.window.showInformationMessage(
      dockerReady
        ? `CIS 310 environment ready: Digital ${status.version}, Docker engine ${docker.serverVersion}.`
        : `Digital ${status.version} and Java ${status.java.version?.raw} are ready for the native simulator. The in-tab simulator is unavailable: ${docker.detail}`
    );
    return;
  }
  const suggestedAction = !status.integrityVerified
    ? 'Install Digital'
    : EMBEDDED_CONTAINER_PLATFORM
      ? 'Open setup guide'
      : 'Download Java';
  const action = await vscode.window.showWarningMessage(
    `The CIS 310 environment needs attention. ${docker.detail} See the SystemStudio output for details.`,
    suggestedAction
  );
  if (action === 'Install Digital') {
    await vscode.commands.executeCommand('systemstudioCis310.setupDigital');
  } else if (action === 'Download Java') {
    await vscode.env.openExternal(JAVA_DOWNLOAD);
  } else if (action === 'Open setup guide') {
    await vscode.commands.executeCommand('systemstudioCis310.openSetupGuide');
  }
}

async function ensureReady(
  manager: DigitalManager,
  output: vscode.OutputChannel,
  setup: () => Promise<boolean>,
  containerProvidesJava = false
): Promise<boolean> {
  let status = await manager.getStatus();
  if (!status.integrityVerified) {
    await setup();
    status = await manager.getStatus();
    if (!status.integrityVerified) return false;
  }
  if (!status.java.supported && !containerProvidesJava) {
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

function safeHttpsUri(value: string): vscode.Uri | undefined {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? vscode.Uri.parse(parsed.toString()) : undefined;
  } catch {
    return undefined;
  }
}

function contextualTutorPrompt(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.circuitPreflightId === 'string') {
    const mode = candidate.tutorMode === 'failed-preflight' ? 'failed-preflight' : 'design';
    return circuitTutorPrompt(candidate.circuitPreflightId, mode);
  }
  if (typeof candidate.guidedAssemblyLabId === 'string') {
    return guidedAssemblyTutorPrompt(candidate.guidedAssemblyLabId);
  }
  if (typeof candidate.nasmWorkbenchSource === 'string') {
    return [
      `I am debugging the formative NASM 32-bit source “${candidate.nasmWorkbenchSource}” in the CIS 310 workbench.`,
      'First ask for my prediction, the earliest instruction where observed state differs, the relevant register/flag/stack/memory values, and any NASM/GDB diagnostic.',
      'Then give one diagnostic question or a small analogous example at a time. Explain the evidence and ask me to make the next edit.',
      'Do not write or repair the graded program, provide a submission-ready solution, or claim that the trace tutor is actual NASM.',
      'Remind me that the 32-bit IA-32 NASM environment is separate from the course 4-bit instructional processor.'
    ].join('\n');
  }
  if (typeof candidate.resourceId !== 'string'
    || typeof candidate.promptIndex !== 'number'
    || !Number.isInteger(candidate.promptIndex)) return undefined;
  return lessonTutorPrompt(candidate.resourceId, candidate.promptIndex);
}

async function chooseWorkspaceFolder(placeHolder: string): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders?.filter((folder) => folder.uri.scheme === 'file') ?? [];
  if (folders.length <= 1) {
    return folders[0];
  }
  const selected = await vscode.window.showQuickPick(
    folders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath, folder })),
    { placeHolder }
  );
  return selected?.folder;
}

async function createUniqueCircuit(manager: DigitalManager, directory: string, requestedFileName: string): Promise<string> {
  const extension = path.extname(requestedFileName);
  const stem = path.basename(requestedFileName, extension);
  for (let attempt = 1; attempt <= 999; attempt += 1) {
    const fileName = attempt === 1 ? requestedFileName : `${stem}-${attempt}${extension}`;
    const target = path.join(directory, fileName);
    try {
      await manager.createBlankCircuit(target);
      return target;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }
  throw new Error(`Could not choose an unused circuit filename under ${directory}.`);
}

async function offerToOpenCircuit(uri: vscode.Uri, label = 'Created a blank Digital circuit'): Promise<void> {
  await vscode.commands.executeCommand('vscode.openWith', uri, FullDigitalEditorProvider.viewType);
  const action = await vscode.window.showInformationMessage(`${label}. Opened in the full Digital simulator: ${uri.fsPath}`, 'Reveal File');
  if (action === 'Reveal File') {
    await vscode.commands.executeCommand('revealInExplorer', uri);
  }
}

function courseResourceId(candidate: unknown): string | undefined {
  if (typeof candidate === 'string') {
    return candidate;
  }
  if (typeof candidate !== 'object' || candidate === null) {
    return undefined;
  }
  const resource = (candidate as { resource?: unknown }).resource;
  if (typeof resource !== 'object' || resource === null) {
    return undefined;
  }
  const id = (resource as { id?: unknown }).id;
  return typeof id === 'string' ? id : undefined;
}

async function resolveAssemblyUri(candidate?: vscode.Uri): Promise<vscode.Uri | undefined> {
  let uri = candidate;
  if (!uri && vscode.window.activeTextEditor?.document.uri.path.toLowerCase().endsWith('.asm')) {
    uri = vscode.window.activeTextEditor.document.uri;
  }
  if (!uri) {
    const selected = await vscode.window.showOpenDialog({
      title: 'Select an x86 assembly source file',
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: { 'x86 assembly': ['asm'] }
    });
    uri = selected?.[0];
  }
  if (!uri) {
    return undefined;
  }
  if (uri.scheme !== 'file' || !uri.fsPath.toLowerCase().endsWith('.asm')) {
    await vscode.window.showErrorMessage('Select a local x86 assembly source file with the .asm extension.');
    return undefined;
  }
  return uri;
}
