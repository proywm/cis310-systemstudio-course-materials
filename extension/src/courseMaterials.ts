import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { equalsSha256, sha256File } from './core/checksum';
import {
  parseCourseMaterialsManifest,
  resolveCoursePackPath,
  type CourseMaterialKind,
  type AssignmentCategory,
  type CourseMaterialResource,
  type CourseMaterialsManifest
} from './core/coursePack';
import { LESSON_NARRATIVES, type LessonNarrative } from './core/lessonNarratives';

const PACK_DIRECTORY = ['course-packs', 'cis310-fall2026'] as const;

export class CourseMaterials {
  private constructor(
    readonly rootPath: string,
    readonly manifest: CourseMaterialsManifest
  ) {}

  static async load(context: vscode.ExtensionContext): Promise<CourseMaterials> {
    const rootPath = vscode.Uri.joinPath(context.extensionUri, ...PACK_DIRECTORY).fsPath;
    const manifestPath = path.join(rootPath, 'materials-manifest.json');
    const manifest = parseCourseMaterialsManifest(JSON.parse(await readFile(manifestPath, 'utf8')) as unknown);
    for (const resource of manifest.resources) {
      if (!resource.localPath || !resource.sha256) {
        continue;
      }
      const localPath = resolveCoursePackPath(rootPath, resource.localPath);
      const digest = await sha256File(localPath);
      if (!equalsSha256(digest, resource.sha256)) {
        throw new Error(`Course material failed its integrity check: ${resource.title}.`);
      }
    }
    await readFile(resolveCoursePackPath(rootPath, manifest.studentIndexPath), 'utf8');
    return new CourseMaterials(rootPath, manifest);
  }

  getResources(kind: CourseMaterialKind): readonly CourseMaterialResource[] {
    return this.manifest.resources.filter((resource) => resource.kind === kind);
  }

  getResource(id: string): CourseMaterialResource | undefined {
    return this.manifest.resources.find((resource) => resource.id === id);
  }

  getAssignments(category: AssignmentCategory): readonly CourseMaterialResource[] {
    return this.getResources('assignment').filter((resource) => resource.assignmentCategory === category);
  }

  async openResource(resource: CourseMaterialResource): Promise<void> {
    if (resource.localPath) {
      const uri = vscode.Uri.file(resolveCoursePackPath(this.rootPath, resource.localPath));
      const extension = path.extname(uri.fsPath).toLowerCase();
      if (extension === '.html') {
        const panel = vscode.window.createWebviewPanel(
          'systemstudioCis310.accessibleCourseMaterial',
          resource.title,
          vscode.ViewColumn.One,
          { enableScripts: false }
        );
        panel.webview.html = await readFile(uri.fsPath, 'utf8');
        return;
      }
      const command = extension === '.md' ? 'markdown.showPreview' : 'vscode.open';
      await vscode.commands.executeCommand(command, uri);
      return;
    }
    await vscode.env.openExternal(vscode.Uri.parse(resource.sourceUrl));
  }

  async openStudentIndex(): Promise<void> {
    const uri = vscode.Uri.file(resolveCoursePackPath(this.rootPath, this.manifest.studentIndexPath));
    await vscode.commands.executeCommand('markdown.showPreview', uri);
  }
}

export class CourseMaterialsTreeProvider implements vscode.TreeDataProvider<MaterialsNode>, vscode.Disposable {
  private readonly changeEmitter = new vscode.EventEmitter<MaterialsNode | undefined>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  constructor(private readonly materials: CourseMaterials) {}

  getTreeItem(element: MaterialsNode): vscode.TreeItem {
    if (element.type === 'notice') {
      const item = new vscode.TreeItem('Fall 2026 course: Canvas is authoritative', vscode.TreeItemCollapsibleState.None);
      item.description = 'active materials · Canvas current';
      item.tooltip = 'Active Fall 2026 course workspace. Use the packaged materials for study and Canvas for live requirements, deadlines, and submission.';
      item.iconPath = new vscode.ThemeIcon('verified-filled');
      item.command = { command: 'systemstudioCis310.openMaterialsIndex', title: 'Open course-material guide' };
      return item;
    }
    if (element.type === 'practice') {
      const item = new vscode.TreeItem('Prepare and practice', vscode.TreeItemCollapsibleState.None);
      item.description = 'accessible lessons · open book · videos · readiness checks';
      item.tooltip = 'Open the Accessible lesson → Read → Watch → Practice 8 questions → Build/trace path, plus explanations, source evidence, saved questions, and spaced review.';
      item.iconPath = new vscode.ThemeIcon('book');
      item.command = { command: 'systemstudioCis310.openPracticeCenter', title: 'Open CIS 310 Learning' };
      return item;
    }
    if (element.type === 'section') {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon(
        element.section === 'syllabus'
          ? 'book'
          : element.section === 'lesson'
            ? 'book-open'
          : element.section === 'presentation'
            ? 'preview'
            : element.section === 'homework'
              ? 'checklist'
              : 'notebook'
      );
      return item;
    }
    if (element.type === 'lesson') {
      const item = new vscode.TreeItem(
        `${element.lesson.lectureLabel}: ${element.lesson.title}`,
        vscode.TreeItemCollapsibleState.None
      );
      item.description = 'primary HTML lecture · examples · tutor prompts';
      item.tooltip = `${element.lesson.overview}\n${element.lesson.slideEvidence}`;
      item.iconPath = new vscode.ThemeIcon('book-open');
      item.command = {
        command: 'systemstudioCis310.openLessonText',
        title: 'Open accessible HTML lecture',
        arguments: [element.lesson.resourceId]
      };
      return item;
    }
    const item = new vscode.TreeItem(element.resource.title, vscode.TreeItemCollapsibleState.None);
    item.description = element.resource.kind === 'syllabus'
      ? 'primary accessible HTML · Canvas current'
      : element.resource.kind === 'presentation'
        ? 'optional visual PDF archive · HTML lecture is primary'
        : 'packaged reference';
    item.tooltip = element.resource.kind === 'syllabus'
      ? 'Primary accessible Fall 2026 HTML syllabus with the verified Monday/Wednesday calendar. Canvas provides live section details and submission. An optional print PDF is also packaged.'
      : element.resource.kind === 'presentation'
      ? `${element.resource.sourceTitle}\nOptional visual PDF archive paired with a primary responsive HTML lecture. The PDF is not represented as independently remediated.`
      : `${element.resource.sourceTitle}\nUse this study reference with the current Canvas assignment.` +
        (element.resource.circuitStarter ? `\nHover and select “${element.resource.circuitStarter.label}” to create a blank .dig file.` : '');
    item.iconPath = new vscode.ThemeIcon(
      element.resource.kind === 'syllabus' ? 'file-code' : element.resource.kind === 'presentation' ? 'file-media' : 'markdown'
    );
    item.command = {
      command: 'systemstudioCis310.openCourseMaterial',
      title: 'Open course material',
      arguments: [element.resource.id]
    };
    if (element.resource.circuitStarter) {
      item.contextValue = 'systemstudioCis310.assignmentWithCircuit';
    }
    return item;
  }

  getChildren(element?: MaterialsNode): MaterialsNode[] {
    if (!element) {
      return [
        { type: 'notice' },
        { type: 'practice' },
        { type: 'section', section: 'syllabus', label: `Syllabus (${this.materials.getResources('syllabus').length})` },
        { type: 'section', section: 'lesson', label: `Accessible HTML lectures (${LESSON_NARRATIVES.length}) — primary` },
        { type: 'section', section: 'presentation', label: `Visual PDF archives (${this.materials.getResources('presentation').length}) — optional` },
        { type: 'section', section: 'homework', label: `Homework (${this.materials.getAssignments('homework').length})` },
        { type: 'section', section: 'project', label: `Project Assignments (${this.materials.getAssignments('project').length})` }
      ];
    }
    if (element.type !== 'section') {
      return [];
    }
    if (element.section === 'lesson') {
      return LESSON_NARRATIVES.map((lesson) => ({ type: 'lesson', lesson }));
    }
    const resources = element.section === 'presentation' || element.section === 'syllabus'
      ? this.materials.getResources(element.section)
      : this.materials.getAssignments(element.section);
    return resources.map((resource) => ({ type: 'resource', resource }));
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}

type MaterialsNode =
  | { type: 'notice' }
  | { type: 'practice' }
  | { type: 'section'; section: 'syllabus' | 'lesson' | 'presentation' | AssignmentCategory; label: string }
  | { type: 'lesson'; lesson: LessonNarrative }
  | { type: 'resource'; resource: CourseMaterialResource };
