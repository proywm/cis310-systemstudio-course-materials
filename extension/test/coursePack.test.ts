import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { equalsSha256, sha256File } from '../src/core/checksum';
import { parseCourseMaterialsManifest, resolveCoursePackPath } from '../src/core/coursePack';

const validManifest = {
  schemaVersion: '0.1.0',
  id: 'cis310-test',
  version: '1.0.0',
  course: {
    code: 'CIS 310',
    title: 'Computer Organization',
    sourceTerm: 'Fall 2025',
    deliveryTerm: 'Fall 2026'
  },
  status: 'student-release',
  sourceFolder: 'https://github.com/example/cis310-course-materials/tree/main/course-packs/cis310-fall2026',
  studentIndexPath: 'STUDENT_MATERIALS.md',
  resources: [
    {
      id: 'lecture-01',
      kind: 'presentation',
      order: 1,
      title: 'Lecture 1',
      sourceTitle: 'lecture.pptx',
      sourceUrl: 'https://github.com/example/cis310-course-materials/blob/main/course-packs/cis310-fall2026/presentations/lecture-01.pdf',
      modifiedAt: '2025-08-26T00:00:00Z',
      concepts: ['binary'],
      localPath: 'presentations/lecture-01.pdf',
      sha256: 'b'.repeat(64),
      relatedAssignmentIds: ['assignment-01']
    },
    {
      id: 'assignment-01',
      kind: 'assignment',
      order: 2,
      title: 'Assignment 1',
      sourceTitle: 'assignment.md',
      sourceUrl: 'https://github.com/example/cis310-course-materials/blob/main/course-packs/cis310-fall2026/assignments/assignment-1.md',
      modifiedAt: '2025-08-26T00:00:00Z',
      concepts: ['binary'],
      assignmentCategory: 'homework',
      circuitStarter: { fileName: 'logic-foundations.dig', label: 'Create logic circuit' },
      localPath: 'assignments/assignment-1.md',
      sha256: 'a'.repeat(64),
      relatedPresentationIds: ['lecture-01']
    }
  ]
};

describe('course-material manifest', () => {
  it('parses a valid mapped manifest', () => {
    const parsed = parseCourseMaterialsManifest(validManifest);
    assert.equal(parsed.resources.length, 2);
    assert.equal(parsed.resources[1]?.localPath, ['assignments', 'assignment-1.md'].join(process.platform === 'win32' ? '\\' : '/'));
    assert.equal(parsed.resources[1]?.assignmentCategory, 'homework');
    assert.equal(parsed.resources[1]?.circuitStarter?.fileName, 'logic-foundations.dig');
  });

  it('rejects unsafe circuit-starter metadata', () => {
    const traversal = structuredClone(validManifest);
    traversal.resources[1]!.circuitStarter!.fileName = '../solution.dig';
    assert.throws(() => parseCourseMaterialsManifest(traversal), /safe .dig filename/);

    const presentationStarter = structuredClone(validManifest);
    presentationStarter.resources[0]!.circuitStarter = { fileName: 'lecture.dig', label: 'Create' };
    assert.throws(() => parseCourseMaterialsManifest(presentationStarter), /only valid for assignments/);
  });

  it('rejects unknown relationships and insecure URLs', () => {
    const unknown = structuredClone(validManifest);
    unknown.resources[0]!.relatedAssignmentIds = ['missing'];
    assert.throws(() => parseCourseMaterialsManifest(unknown), /unknown resource/);

    const insecure = structuredClone(validManifest);
    insecure.resources[0]!.sourceUrl = 'http://example.com/lecture';
    assert.throws(() => parseCourseMaterialsManifest(insecure), /HTTPS/);

    const oneWay = structuredClone(validManifest);
    oneWay.resources[1]!.relatedPresentationIds = [];
    assert.throws(() => parseCourseMaterialsManifest(oneWay), /not reciprocal/);
  });

  it('requires every presentation to be a packaged PDF', () => {
    const remoteOnly = structuredClone(validManifest);
    Reflect.deleteProperty(remoteOnly.resources[0]!, 'localPath');
    Reflect.deleteProperty(remoteOnly.resources[0]!, 'sha256');
    assert.throws(() => parseCourseMaterialsManifest(remoteOnly), /packaged PDF presentation/);

    const powerpoint = structuredClone(validManifest);
    powerpoint.resources[0]!.localPath = 'presentations/lecture-01.pptx';
    assert.throws(() => parseCourseMaterialsManifest(powerpoint), /packaged PDF presentation/);
  });

  it('prevents local course-pack path traversal', () => {
    assert.throws(() => resolveCoursePackPath('/course-pack', '../secret'));
    assert.throws(() => resolveCoursePackPath('/course-pack', '/absolute'));
    assert.equal(
      resolveCoursePackPath(path.resolve('/course-pack'), 'assignments/a.md'),
      path.resolve('/course-pack', 'assignments', 'a.md')
    );
  });

  it('verifies every packaged course resource', async () => {
    const packRoot = path.resolve('..', 'course-packs', 'cis310-fall2026');
    const manifest = parseCourseMaterialsManifest(
      JSON.parse(await readFile(path.join(packRoot, 'materials-manifest.json'), 'utf8')) as unknown
    );
    const extensionPackage = JSON.parse(await readFile(path.resolve('package.json'), 'utf8')) as { version: string };
    assert.equal(manifest.version, extensionPackage.version);
    assert.equal(manifest.resources.filter((resource) => resource.kind === 'presentation').length, 13);
    assert.equal(manifest.resources.filter((resource) => resource.kind === 'syllabus').length, 1);
    assert.equal(manifest.resources.filter((resource) => resource.kind === 'diagnostic').length, 1);
    assert.equal(manifest.course.deliveryTerm, 'Fall 2026');
    assert.equal(manifest.resources.filter((resource) => resource.kind === 'assignment').length, 7);
    assert.equal(manifest.resources.filter((resource) => resource.assignmentCategory === 'homework').length, 3);
    assert.equal(manifest.resources.filter((resource) => resource.assignmentCategory === 'project').length, 4);
    const syllabus = manifest.resources.find((resource) => resource.kind === 'syllabus');
    assert.ok(syllabus?.localPath);
    const syllabusHtml = await readFile(resolveCoursePackPath(packRoot, syllabus.localPath), 'utf8');
    assert.match(syllabusHtml, /<html[^>]+lang="en-US"/i);
    assert.match(syllabusHtml, /class="skip-link"[^>]+href="#main-content"/i);
    assert.match(syllabusHtml, /<main id="main-content">/i);
    assert.match(syllabusHtml, /<caption>Course contact and meeting information<\/caption>/i);
    assert.match(syllabusHtml, /<th scope="row"[^>]*><strong>Instructor<\/strong><\/th>/i);
    assert.match(syllabusHtml, /<th scope="row"[^>]*><strong>Canvas<\/strong><\/th>/i);
    assert.match(syllabusHtml, /<th scope="row"[^>]*><strong>Digital \(circuit simulator\)<\/strong><\/th>/i);
    assert.match(syllabusHtml, /<th scope="row"[^>]*><strong>NASM, GNU <code>ld<\/code>, and GDB<\/strong><\/th>/i);
    assert.match(syllabusHtml, /Participation quizzes and in-class evidence checks<\/td>\s*<td[^>]*>15%<\/td>/i);
    assert.match(syllabusHtml, /Three written homework assignments and three implementation assignments\/processor milestones<\/td>\s*<td[^>]*>65%<\/td>/i);
    assert.match(syllabusHtml, /Final processor project and demonstration<\/td>\s*<td[^>]*>20%<\/td>/i);
    assert.match(syllabusHtml, /<strong>Total<\/strong><\/td>\s*<td[^>]*><strong>100%<\/strong><\/td>/i);
    assert.match(syllabusHtml, /Final cumulative 4-bit processor presentation and demonstration/i);
    assert.match(syllabusHtml, /same 4-bit processor developed through the three implementation assignments/i);
    assert.doesNotMatch(syllabusHtml, /Final 8-bit processor|separate 8-bit/i);
    assert.doesNotMatch(syllabusHtml, /<script\b/i);
    const calendarHtml = syllabusHtml.split('id="tentative-fall-2026-course-calendar"')[1] ?? '';
    assert.equal((calendarHtml.match(/<td style="text-align: left;">(?:[1-9]|1\d|2[0-7])<\/td>/g) ?? []).length, 27);
    assert.match(await readFile(path.join(packRoot, 'syllabus', 'CIS310_Fall_2026_Syllabus.pdf'), 'utf8'), /^%PDF/);
    const pretest = manifest.resources.find((resource) => resource.kind === 'diagnostic');
    assert.ok(pretest?.localPath);
    const pretestHtml = await readFile(resolveCoursePackPath(packRoot, pretest.localPath), 'utf8');
    assert.match(pretestHtml, /0 points/i);
    assert.match(pretestHtml, /Do not use an AI assistant/i);
    assert.match(pretestHtml, /does not affect your course grade/i);
    const implementationOne = await readFile(path.join(packRoot, 'assignments', 'project-1-registers-dram.md'), 'utf8');
    const implementationThree = await readFile(path.join(packRoot, 'assignments', 'project-3-processor.md'), 'utf8');
    const finalPresentation = await readFile(path.join(packRoot, 'assignments', 'final-project-4-bit-processor.md'), 'utf8');
    assert.match(implementationOne, /16-address × 8-bit \*\*instruction memory\*\*/i);
    assert.match(implementationOne, /16-address × 4-bit \*\*data memory\*\*/i);
    assert.match(implementationThree, /R-type \| `00 dd ss ff`/);
    assert.match(implementationThree, /`LOAD` \| `01 dd aaaa`/);
    assert.match(implementationThree, /`LDI` \| `10 dd iiii`/);
    assert.match(implementationThree, /`STORE` \| `11 ss aaaa`/);
    for (const encodedInstruction of ['`95`', '`A3`', '`24`', '`EE`', '`7E`', '`35`']) {
      assert.match(implementationThree, new RegExp(`\\| ${encodedInstruction.replaceAll('`', '\\`')} \\|`));
    }
    assert.match(implementationThree, /After completion: `PC=6`, `R1=5`, `R2=8`, `R3=3`, and `DataMemory\[14\]=8`/);
    assert.match(finalPresentation, /same cumulative 4-bit processor/i);
    assert.doesNotMatch(finalPresentation, /final 8-bit processor|separate 8-bit processor/i);
    for (const resource of manifest.resources) {
      assert.ok(resource.localPath && resource.sha256);
      const digest = await sha256File(resolveCoursePackPath(packRoot, resource.localPath));
      assert.ok(
        equalsSha256(digest, resource.sha256),
        `${resource.localPath}: expected ${resource.sha256}, received ${digest}`
      );
      if (resource.kind === 'presentation') {
        assert.equal(path.extname(resource.localPath).toLowerCase(), '.pdf');
      } else if (resource.kind === 'syllabus') {
        assert.equal(path.extname(resource.localPath).toLowerCase(), '.html');
        assert.equal(resource.id, 'syllabus-fall-2026');
      } else if (resource.kind === 'diagnostic') {
        assert.equal(path.extname(resource.localPath).toLowerCase(), '.html');
        assert.equal(resource.id, 'pretest-fall-2026');
      } else {
        assert.ok(resource.relatedPresentationIds?.length);
        assert.ok(resource.assignmentCategory === 'homework' || resource.assignmentCategory === 'project');
        if (resource.circuitStarter) {
          assert.ok(resource.circuitStarter.fileName.endsWith('.dig'));
        }
      }
    }
  });
});
