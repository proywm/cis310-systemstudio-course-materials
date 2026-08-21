import { createHash } from 'node:crypto';
import { GUIDED_LABS } from '../src/core/guidedLabs';
import { PRE_CLASS_MODULES } from '../src/core/learningResources';
import { LESSON_NARRATIVES, type LessonNarrative } from '../src/core/lessonNarratives';

export interface ExportedCanvasLesson {
  resourceId: string;
  moduleNumber: number;
  pageTitle: string;
  fileName: string;
  canvasBody: string;
  standaloneHtml: string;
  canvasBodySha256: string;
  standaloneSha256: string;
}

/** Builds Canvas-safe page bodies and standalone HTML from the verified lesson source. */
export function buildCanvasLessonExports(): ExportedCanvasLesson[] {
  return LESSON_NARRATIVES.map((lesson, index) => {
    const module = PRE_CLASS_MODULES.find((candidate) => candidate.resourceId === lesson.resourceId);
    if (!module) throw new Error(`No preparation module exists for ${lesson.resourceId}.`);
    const pageTitle = `${lesson.lectureLabel}: ${lesson.title} — Accessible Lecture`;
    const fileName = `${lesson.resourceId}.html`;
    const canvasBody = renderCanvasBody(lesson, index);
    const standaloneHtml = renderStandalone(lesson, index, pageTitle, canvasBody);
    return {
      resourceId: lesson.resourceId,
      moduleNumber: index + 1,
      pageTitle,
      fileName,
      canvasBody,
      standaloneHtml,
      canvasBodySha256: sha256(canvasBody),
      standaloneSha256: sha256(standaloneHtml)
    };
  });
}

function renderCanvasBody(lesson: LessonNarrative, index: number): string {
  const module = PRE_CLASS_MODULES[index];
  if (!module || module.resourceId !== lesson.resourceId) {
    throw new Error(`Lecture order mismatch for ${lesson.resourceId}.`);
  }
  const labs = GUIDED_LABS.filter((lab) => lab.resourceId === lesson.resourceId);
  const readingItems = module.readings.map((reading, sourceIndex) =>
    `<li><a href="${escapeAttribute(reading.url)}">Open reading ${sourceIndex + 1}: ${escapeHtml(reading.title)}</a>. Focus: ${escapeHtml(reading.focus)}</li>`
  ).join('\n');
  const videoItems = module.authorVideos.map((video, sourceIndex) =>
    `<li><a href="${escapeAttribute(video.url)}">Open author video ${sourceIndex + 1}: ${escapeHtml(video.title)}</a>. Focus: ${escapeHtml(video.focus)}</li>`
  ).join('\n');
  const labSection = labs.length > 0 ? `
<h2>Apply the concept hands-on</h2>
<p>Make a prediction before opening SystemStudio. These activities are formative and do not provide a completed graded artifact.</p>
<ul>
${labs.map((lab) => `<li><strong>${lab.requiredForModule ? 'Required' : 'Optional'} ${escapeHtml(lab.kind)} activity:</strong> ${escapeHtml(lab.title)}. Open the matching activity in SystemStudio’s Hands-on Lab Center.</li>`).join('\n')}
</ul>` : '';

  return `<!-- Canvas Page title: ${escapeHtml(`${lesson.lectureLabel}: ${lesson.title} — Accessible Lecture`)} -->
<p><strong>Module ${index + 1} of ${LESSON_NARRATIVES.length}</strong></p>
<p><strong>Overview:</strong> ${escapeHtml(lesson.overview)}</p>

<h2>Scope and boundaries</h2>
<p>${escapeHtml(lesson.scopeBoundary)}</p>

<h2>Learning objectives</h2>
<p>After studying this page and attempting its examples, you should be able to:</p>
<ul>
${lesson.objectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join('\n')}
</ul>

<h2>Key terms in plain language</h2>
<dl>
${lesson.terms.map((entry) => `<dt><strong>${escapeHtml(entry.term)}</strong></dt>\n<dd>${escapeHtml(entry.definition)}</dd>`).join('\n')}
</dl>

${lesson.sections.map((section) => `<h2>${escapeHtml(section.heading)}</h2>
${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
${section.points ? `<ul>\n${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('\n')}\n</ul>` : ''}`).join('\n\n')}

<h2>Worked examples</h2>
${lesson.examples.map((example, exampleIndex) => `<h3>Example ${exampleIndex + 1}: ${escapeHtml(example.title)}</h3>
<p>${escapeHtml(example.setup)}</p>
<ol>
${example.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('\n')}
</ol>
<p><strong>Conclusion:</strong> ${escapeHtml(example.conclusion)}</p>`).join('\n\n')}

<h2>Check your understanding</h2>
<p>Answer these questions in your own words before opening the SystemStudio practice set.</p>
<ol>
${lesson.selfChecks.map((question) => `<li>${escapeHtml(question)}</li>`).join('\n')}
</ol>
<p>Then complete the module’s five-question preparation checkpoint and continue through all eight questions for broader practice. The attempt threshold is not a readiness or mastery claim.</p>
${labSection}

<h2>Ask the approved U-M course tutor</h2>
<p>Attempt the concept first. If you still need help, copy one prompt into the U-M course tutor. Ask for one hint or analogous example at a time, verify the response against the mapped sources, and do not request completed graded work.</p>
<ol>
${lesson.tutorPrompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('\n')}
</ol>

<h2>Mapped readings and videos</h2>
<h3>Readings</h3>
<ul>
${readingItems}
</ul>
<h3>Author videos</h3>
<ul>
${videoItems}
</ul>

<h2>Source evidence and format note</h2>
<p><strong>Presentation evidence used to prepare this page:</strong> ${escapeHtml(lesson.slideEvidence)}</p>
<p>This Canvas Page is the primary lecture format designed for digital accessibility. The legacy presentation PDF may be retained in Canvas Files as an optional visual archive, but it should not be the only way to obtain the lecture content.</p>
<p>Canvas remains authoritative for graded work, deadlines, accommodations, and submission requirements. If any diagram, equation, video, or simulator interaction presents an access barrier, contact the instructor promptly for an equivalent format or activity.</p>`;
}

function renderStandalone(
  lesson: LessonNarrative,
  index: number,
  pageTitle: string,
  canvasBody: string
): string {
  const previous = index > 0 ? LESSON_NARRATIVES[index - 1] : undefined;
  const next = index < LESSON_NARRATIVES.length - 1 ? LESSON_NARRATIVES[index + 1] : undefined;
  const navigation = [
    previous ? `<a href="${previous.resourceId}.html">Previous lecture: ${escapeHtml(previous.title)}</a>` : '',
    next ? `<a href="${next.resourceId}.html">Next lecture: ${escapeHtml(next.title)}</a>` : ''
  ].filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    html { font-size: 100%; }
    body { max-width: 76ch; margin: 0 auto; padding: 1rem; font: 1rem/1.65 system-ui, sans-serif; color: CanvasText; background: Canvas; }
    h1, h2, h3 { line-height: 1.25; }
    h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); }
    h2 { margin-top: 2.25rem; }
    h3 { margin-top: 1.5rem; }
    a { color: LinkText; text-decoration-thickness: .12em; text-underline-offset: .15em; }
    a:focus-visible { outline: .2rem solid Highlight; outline-offset: .2rem; }
    .skip-link { position: absolute; left: -10000px; top: auto; }
    .skip-link:focus { left: 1rem; top: 1rem; padding: .5rem; color: ButtonText; background: ButtonFace; }
    nav { display: flex; flex-wrap: wrap; gap: 1rem; padding-block: 1rem; border-block: .0625rem solid GrayText; }
    dt { margin-top: .75rem; }
    dd { margin-left: 1.25rem; }
    li + li { margin-top: .4rem; }
    @media (max-width: 32rem) { body { padding: .75rem; } nav { display: block; } nav a { display: block; margin-block: .75rem; } }
    @media (forced-colors: active) { a:focus-visible { outline-color: Highlight; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#lecture-content">Skip to lecture content</a>
  <header>
    <h1>${escapeHtml(pageTitle)}</h1>
    <nav aria-label="Lecture navigation">
      ${navigation}
    </nav>
  </header>
  <main id="lecture-content" tabindex="-1">
${canvasBody}
  </main>
</body>
</html>`;
}

export interface StoredZipEntry {
  name: string;
  data: Buffer;
}

/** Creates a deterministic, uncompressed ZIP so the Canvas bundle has no platform-specific build dependency. */
export function buildStoredZip(entries: readonly StoredZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name.replaceAll('\\', '/'), 'utf8');
    const checksum = crc32(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, entry.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + entry.data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] ?? character);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
