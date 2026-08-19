import * as path from 'node:path';

export function assemblySourceRelativePath(workspaceRoot: string, sourcePath: string): string {
  const root = path.resolve(workspaceRoot);
  const source = path.resolve(sourcePath);
  const relative = path.relative(root, source);
  if (
    relative.length === 0 ||
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error('Select an assembly source file inside the current workspace.');
  }
  if (path.extname(relative) !== '.asm') {
    throw new Error('Select a NASM source file with the .asm extension.');
  }
  const normalized = relative.split(path.sep).join('/');
  if (normalized.split('/').some((segment) => !/^[A-Za-z0-9_][A-Za-z0-9._-]*$/.test(segment))) {
    throw new Error('Assembly paths may contain letters, numbers, underscores, dots, and non-leading hyphens.');
  }
  return normalized;
}
