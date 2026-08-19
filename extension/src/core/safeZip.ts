import { readFile, mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { unzipSync } from 'fflate';

const MAX_ARCHIVE_ENTRIES = 5_000;
const MAX_SINGLE_FILE_BYTES = 64 * 1024 * 1024;
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;

export async function extractZipSafely(archivePath: string, destination: string): Promise<void> {
  const archive = new Uint8Array(await readFile(archivePath));
  let entryCount = 0;
  let declaredTotalBytes = 0;
  const entries = unzipSync(archive, {
    filter: (entry) => {
      validateArchivePath(entry.name);
      entryCount += 1;
      if (entryCount > MAX_ARCHIVE_ENTRIES) {
        throw new Error(`Digital archive contains too many entries (more than ${MAX_ARCHIVE_ENTRIES}).`);
      }
      if (entry.originalSize > MAX_SINGLE_FILE_BYTES) {
        throw new Error(`Digital archive entry is too large: ${entry.name}.`);
      }
      declaredTotalBytes += entry.originalSize;
      if (declaredTotalBytes > MAX_TOTAL_BYTES) {
        throw new Error('Digital archive exceeds the uncompressed-size safety limit.');
      }
      return true;
    }
  });

  let totalBytes = 0;
  const outputPaths = new Set<string>();
  await mkdir(destination, { recursive: true });
  for (const [archiveName, data] of Object.entries(entries)) {
    const relativePath = validateArchivePath(archiveName);
    if (!relativePath || archiveName.endsWith('/')) {
      if (relativePath) {
        await mkdir(path.join(destination, relativePath), { recursive: true });
      }
      continue;
    }
    if (data.length > MAX_SINGLE_FILE_BYTES) {
      throw new Error(`Digital archive entry is too large: ${archiveName}.`);
    }
    totalBytes += data.length;
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error('Digital archive exceeds the uncompressed-size safety limit.');
    }
    const outputPath = path.resolve(destination, relativePath);
    const destinationRoot = `${path.resolve(destination)}${path.sep}`;
    if (!outputPath.startsWith(destinationRoot)) {
      throw new Error(`Digital archive entry escapes the installation directory: ${archiveName}.`);
    }
    const normalizedOutputPath = process.platform === 'win32' ? outputPath.toLowerCase() : outputPath;
    if (outputPaths.has(normalizedOutputPath)) {
      throw new Error(`Digital archive contains duplicate output paths: ${archiveName}.`);
    }
    outputPaths.add(normalizedOutputPath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, data, { flag: 'wx' });
  }
}

export function validateArchivePath(archiveName: string): string {
  if (archiveName.includes('\0')) {
    throw new Error('Digital archive contains a null byte in an entry path.');
  }
  const portable = archiveName.replaceAll('\\', '/');
  if (portable.startsWith('/') || /^[A-Za-z]:\//.test(portable)) {
    throw new Error(`Digital archive contains an absolute path: ${archiveName}.`);
  }
  const segments = portable.split('/').filter((segment) => segment.length > 0 && segment !== '.');
  if (segments.some((segment) => segment === '..')) {
    throw new Error(`Digital archive contains a parent-directory path: ${archiveName}.`);
  }
  return segments.join(path.sep);
}
