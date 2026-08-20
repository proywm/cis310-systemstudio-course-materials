import { access, cp, readFile, rename } from 'node:fs/promises';
import * as path from 'node:path';

const GUIDES: Array<readonly [string, string, string]> = [
  ['README.md', 'systemstudio-assembly-guide: 0.11', 'README-pre-0.11.md'],
  ['COMPATIBILITY.md', 'systemstudio-assembly-compatibility: 0.11', 'COMPATIBILITY-pre-0.11.md'],
  ['IRVINE32_PROFILE.md', 'systemstudio-irvine-guide: 0.11', 'IRVINE32_PROFILE-pre-0.11.md']
];

/** Archives stale generated guides and installs current ones without touching assembly sources. */
export async function installCurrentAssemblyGuides(sourceRoot: string, targetRoot: string): Promise<boolean> {
  let changed = false;
  for (const [fileName, marker, archiveName] of GUIDES) {
    changed = await installCurrentGuide(
      path.join(sourceRoot, fileName),
      path.join(targetRoot, fileName),
      marker,
      path.join(targetRoot, archiveName)
    ) || changed;
  }
  return changed;
}

async function installCurrentGuide(
  source: string,
  destination: string,
  marker: string,
  preferredArchive: string
): Promise<boolean> {
  if (!(await existingPath(destination))) {
    await cp(source, destination, { force: false, errorOnExist: true });
    return true;
  }
  const content = await readFile(destination, 'utf8');
  if (content.includes(marker)) return false;
  const archived = await availableArchivePath(preferredArchive);
  await rename(destination, archived);
  try {
    await cp(source, destination, { force: false, errorOnExist: true });
  } catch (error) {
    await rename(archived, destination);
    throw error;
  }
  return true;
}

async function availableArchivePath(preferred: string): Promise<string> {
  if (!(await existingPath(preferred))) return preferred;
  const extension = path.extname(preferred);
  const stem = preferred.slice(0, -extension.length);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${stem}-${index}${extension}`;
    if (!(await existingPath(candidate))) return candidate;
  }
  throw new Error(`Could not allocate an archive filename beside ${preferred}.`);
}

async function existingPath(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}
