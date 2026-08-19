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
      const command = path.extname(uri.fsPath).toLowerCase() === '.md' ? 'markdown.showPreview' : 'vscode.open';
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
      item.description = 'open book · author videos · readiness checks';
      item.tooltip = 'Open the Read → Watch → Try 3 questions path, plus ungraded practice, explanations, saved questions, and spaced review.';
      item.iconPath = new vscode.ThemeIcon('book');
      item.command = { command: 'systemstudioCis310.openPracticeCenter', title: 'Open CIS 310 Learning' };
      return item;
    }
    if (element.type === 'section') {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon(
        element.section === 'syllabus'
          ? 'book'
          : element.section === 'presentation'
            ? 'preview'
            : element.section === 'homework'
              ? 'checklist'
              : 'notebook'
      );
      return item;
    }
    const item = new vscode.TreeItem(element.resource.title, vscode.TreeItemCollapsibleState.None);
    item.description = element.resource.kind === 'syllabus'
      ? 'Fall 2026 PDF · Canvas current'
      : element.resource.kind === 'presentation'
        ? 'bundled offline PDF'
        : 'packaged reference';
    item.tooltip = element.resource.kind === 'syllabus'
      ? 'Active Fall 2026 syllabus with the verified Monday/Wednesday calendar. Canvas provides live section details and submission.'
      : element.resource.kind === 'presentation'
      ? `${element.resource.sourceTitle}\nPackaged for offline viewing; no external document-hosting account required.`
      : `${element.resource.sourceTitle}\nUse this study reference with the current Canvas assignment.` +
        (element.resource.circuitStarter ? `\nHover and select “${element.resource.circuitStarter.label}” to create a blank .dig file.` : '');
    item.iconPath = new vscode.ThemeIcon(
      element.resource.kind === 'syllabus' ? 'file-pdf' : element.resource.kind === 'presentation' ? 'file-media' : 'markdown'
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
        { type: 'section', section: 'presentation', label: `Presentations (${this.materials.getResources('presentation').length})` },
        { type: 'section', section: 'homework', label: `Homework (${this.materials.getAssignments('homework').length})` },
        { type: 'section', section: 'project', label: `Project Assignments (${this.materials.getAssignments('project').length})` }
      ];
    }
    if (element.type !== 'section') {
      return [];
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
  | { type: 'section'; section: 'syllabus' | 'presentation' | AssignmentCategory; label: string }
  | { type: 'resource'; resource: CourseMaterialResource };
