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

const PACK_DIRECTORY = ['course-packs', 'cis310-fall2025'] as const;

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
      const item = new vscode.TreeItem('Fall 2025 reference: review required', vscode.TreeItemCollapsibleState.None);
      item.description = 'Canvas is authoritative';
      item.tooltip = 'Historical materials require instructor review before student release.';
      item.iconPath = new vscode.ThemeIcon('warning');
      item.command = { command: 'systemstudioCis310.openMaterialsIndex', title: 'Open course-material guide' };
      return item;
    }
    if (element.type === 'section') {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon(element.section === 'presentation' ? 'preview' : element.section === 'homework' ? 'checklist' : 'notebook');
      return item;
    }
    const item = new vscode.TreeItem(element.resource.title, vscode.TreeItemCollapsibleState.None);
    item.description = element.resource.kind === 'presentation' ? 'included PDF' : 'local reference';
    item.tooltip = element.resource.kind === 'presentation'
      ? `${element.resource.sourceTitle}\nPackaged for offline viewing; no Drive access required.`
      : `${element.resource.sourceTitle}\nHistorical policy and deadlines require instructor review.` +
        (element.resource.circuitStarter ? `\nHover and select “${element.resource.circuitStarter.label}” to create a blank .dig file.` : '');
    item.iconPath = new vscode.ThemeIcon(element.resource.kind === 'presentation' ? 'file-media' : 'markdown');
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
        { type: 'section', section: 'presentation', label: `Presentations (${this.materials.getResources('presentation').length})` },
        { type: 'section', section: 'homework', label: `Homework (${this.materials.getAssignments('homework').length})` },
        { type: 'section', section: 'project', label: `Project Assignments (${this.materials.getAssignments('project').length})` }
      ];
    }
    if (element.type !== 'section') {
      return [];
    }
    const resources = element.section === 'presentation'
      ? this.materials.getResources('presentation')
      : this.materials.getAssignments(element.section);
    return resources.map((resource) => ({ type: 'resource', resource }));
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}

type MaterialsNode =
  | { type: 'notice' }
  | { type: 'section'; section: 'presentation' | AssignmentCategory; label: string }
  | { type: 'resource'; resource: CourseMaterialResource };
