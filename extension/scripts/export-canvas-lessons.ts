import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCanvasLessonExports, buildStoredZip, type StoredZipEntry } from './canvasLessonExport';

async function main(): Promise<void> {
const extensionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coursePack = path.resolve(extensionRoot, '..', 'course-packs', 'cis310-fall2026');
const canvasRoot = path.join(coursePack, 'canvas');
const outputRoot = path.join(canvasRoot, 'accessible-lectures');
const bodyRoot = path.join(outputRoot, 'canvas-page-bodies');
const standaloneRoot = path.join(outputRoot, 'standalone');
const bundlePath = path.join(canvasRoot, 'CIS310_Fall2026_Accessible_HTML_Lectures.zip');

if (!outputRoot.startsWith(coursePack + path.sep)) throw new Error('Refusing to write outside the CIS 310 course pack.');
await rm(outputRoot, { recursive: true, force: true });
await mkdir(bodyRoot, { recursive: true });
await mkdir(standaloneRoot, { recursive: true });

const pages = buildCanvasLessonExports();
for (const page of pages) {
  await writeFile(path.join(bodyRoot, page.fileName), page.canvasBody + '\n', 'utf8');
  await writeFile(path.join(standaloneRoot, page.fileName), page.standaloneHtml + '\n', 'utf8');
}

const csv = [
  'module,resource_id,canvas_page_title,canvas_body_file,standalone_file',
  ...pages.map((page) => [
    page.moduleNumber,
    csvCell(page.resourceId),
    csvCell(page.pageTitle),
    csvCell(`canvas-page-bodies/${page.fileName}`),
    csvCell(`standalone/${page.fileName}`)
  ].join(','))
].join('\n') + '\n';

const readme = `# CIS 310 Fall 2026 accessible HTML lectures

These 13 pages replace the legacy PDFs as the primary lecture format designed for digital accessibility. The PDF files may remain available as optional visual archives, but they are not represented as independently remediated or certified.

## Put a page into Canvas

1. In the Fall 2026 CIS 310 course, open **Pages** and create a new page using the exact title in \`page-map.csv\`.
2. In the Rich Content Editor, choose **HTML Editor**.
3. Copy the complete contents of the matching file under \`canvas-page-bodies/\` and paste it into the editor.
4. Save the page as unpublished while reviewing it.
5. Add the page as the first lecture item in the matching Canvas module. Keep the legacy PDF only as **Optional visual archive — accessible HTML lecture above**.
6. Open Panorama for the new page, correct any reported issue, and manually check headings, links, keyboard navigation, zoom/reflow, equations, and complex descriptions before publishing.

The Canvas page body intentionally begins with \`h2\` because Canvas supplies the page title as its \`h1\`. It contains no script, stylesheet, image, layout table, iframe, or color-dependent instruction.

The \`standalone/\` directory contains complete HTML documents with one \`h1\`, a skip link, previous/next navigation, responsive styling, and the same lecture content. These are suitable for local review or an alternative web host, but the Canvas page-body version is preferred inside the LMS.

Canvas course 552144 remains authoritative for deadlines, assignments, accommodations, and submission. Review AI-generated or AI-assisted descriptions against the actual course concept before publishing.
`;

const manifest = {
  schemaVersion: '1.0',
  course: 'CIS 310',
  term: 'Fall 2026',
  primaryFormat: 'Canvas Page HTML',
  legacyPdfRole: 'optional visual archive',
  pages: pages.map((page) => ({
    resourceId: page.resourceId,
    moduleNumber: page.moduleNumber,
    pageTitle: page.pageTitle,
    canvasBody: `canvas-page-bodies/${page.fileName}`,
    standalone: `standalone/${page.fileName}`,
    canvasBodySha256: page.canvasBodySha256,
    standaloneSha256: page.standaloneSha256
  }))
};

await writeFile(path.join(outputRoot, 'README.md'), readme, 'utf8');
await writeFile(path.join(outputRoot, 'page-map.csv'), csv, 'utf8');
await writeFile(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const zipEntries: StoredZipEntry[] = [];
for (const page of pages) {
  zipEntries.push(
    { name: `canvas-page-bodies/${page.fileName}`, data: Buffer.from(page.canvasBody + '\n', 'utf8') },
    { name: `standalone/${page.fileName}`, data: Buffer.from(page.standaloneHtml + '\n', 'utf8') }
  );
}
zipEntries.push(
  { name: 'README.md', data: Buffer.from(readme, 'utf8') },
  { name: 'page-map.csv', data: Buffer.from(csv, 'utf8') },
  { name: 'manifest.json', data: Buffer.from(JSON.stringify(manifest, null, 2) + '\n', 'utf8') }
);
const bundle = buildStoredZip(zipEntries);
await writeFile(bundlePath, bundle);

console.log(`Generated ${pages.length} Canvas Page bodies and standalone HTML lectures.`);
console.log(`Bundle: ${bundlePath}`);
console.log(`Bundle SHA-256: ${createHash('sha256').update(bundle).digest('hex')}`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
