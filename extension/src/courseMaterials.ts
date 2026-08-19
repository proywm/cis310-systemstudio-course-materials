import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { equalsSha256, sha256File } from './core/checksum';
import {
  parseCourseMaterialsManifest,
  resolveCoursePackPath,
  type CourseMaterialKind,
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

  async openResource(resource: CourseMaterialResource): Promise<void> {
    if (resource.localPath) {
      const uri = vscode.Uri.file(resolveCoursePackPath(this.rootPath, resource.localPath));
      await vscode.commands.executeCommand('markdown.showPreview', uri);
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
      item.iconPath = new vscode.ThemeIcon(element.kind === 'presentation' ? 'preview' : 'notebook');
      return item;
    }
    const item = new vscode.TreeItem(element.resource.title, vscode.TreeItemCollapsibleState.None);
    item.description = element.resource.kind === 'presentation' ? 'Drive' : 'local reference';
    item.tooltip = element.resource.kind === 'presentation'
      ? `${element.resource.sourceTitle}\nInstructor must grant student access to this Drive file.`
      : `${element.resource.sourceTitle}\nHistorical policy and deadlines require instructor review.`;
    item.iconPath = new vscode.ThemeIcon(element.resource.kind === 'presentation' ? 'file-media' : 'markdown');
    item.command = {
      command: 'systemstudioCis310.openCourseMaterial',
      title: 'Open course material',
      arguments: [element.resource.id]
    };
    return item;
  }

  getChildren(element?: MaterialsNode): MaterialsNode[] {
    if (!element) {
      return [
        { type: 'notice' },
        { type: 'section', kind: 'presentation', label: `Presentations (${this.materials.getResources('presentation').length})` },
        { type: 'section', kind: 'assignment', label: `Assignments (${this.materials.getResources('assignment').length})` }
      ];
    }
    if (element.type !== 'section') {
      return [];
    }
    return this.materials.getResources(element.kind).map((resource) => ({ type: 'resource', resource }));
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}

type MaterialsNode =
  | { type: 'notice' }
  | { type: 'section'; kind: CourseMaterialKind; label: string }
  | { type: 'resource'; resource: CourseMaterialResource };
