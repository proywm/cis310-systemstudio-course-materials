import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(extensionRoot, '..', 'course-packs', 'cis310-fall2026');
const destinationRoot = path.resolve(extensionRoot, 'course-packs');
const destination = path.join(destinationRoot, 'cis310-fall2026');

// This directory is a generated package input. The authoritative, tracked copy
// lives at the repository root so extension builds and course files cannot drift.
await rm(destination, { recursive: true, force: true });
await mkdir(destinationRoot, { recursive: true });
await cp(source, destination, { recursive: true });

console.log(`Staged course pack from ${source}`);
