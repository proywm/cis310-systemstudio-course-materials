import { MINIMUM_JAVA_MAJOR } from './digitalRelease';

export interface ParsedJavaVersion {
  major: number;
  raw: string;
}

export function parseJavaVersion(output: string): ParsedJavaVersion | undefined {
  const quoted = output.match(/(?:java|openjdk)\s+version\s+"([^"]+)"/i);
  const unquoted = output.match(/(?:java|openjdk)\s+([0-9][^\s]*)/i);
  const raw = quoted?.[1] ?? unquoted?.[1];
  if (!raw) {
    return undefined;
  }

  const parts = raw.split(/[._+-]/);
  const first = Number.parseInt(parts[0] ?? '', 10);
  const second = Number.parseInt(parts[1] ?? '', 10);
  const major = first === 1 && Number.isFinite(second) ? second : first;
  if (!Number.isFinite(major)) {
    return undefined;
  }
  return { major, raw };
}

export function isSupportedJava(version: ParsedJavaVersion | undefined): boolean {
  return version !== undefined && version.major >= MINIMUM_JAVA_MAJOR;
}
