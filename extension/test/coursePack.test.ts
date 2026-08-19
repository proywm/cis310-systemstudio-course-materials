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
  course: { code: 'CIS 310', title: 'Computer Organization', sourceTerm: 'Fall 2025' },
  status: 'instructor-review-required',
  sourceFolder: 'https://drive.google.com/drive/folders/example',
  studentIndexPath: 'STUDENT_MATERIALS.md',
  resources: [
    {
      id: 'lecture-01',
      kind: 'presentation',
      order: 1,
      title: 'Lecture 1',
      sourceTitle: 'lecture.pptx',
      sourceUrl: 'https://drive.google.com/file/example',
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
      sourceUrl: 'https://drive.google.com/file/assignment',
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
    const packRoot = path.resolve('..', 'course-packs', 'cis310-fall2025');
    const manifest = parseCourseMaterialsManifest(
      JSON.parse(await readFile(path.join(packRoot, 'materials-manifest.json'), 'utf8')) as unknown
    );
    assert.equal(manifest.resources.filter((resource) => resource.kind === 'presentation').length, 13);
    assert.equal(manifest.resources.filter((resource) => resource.kind === 'assignment').length, 4);
    for (const resource of manifest.resources) {
      assert.ok(resource.localPath && resource.sha256);
      const digest = await sha256File(resolveCoursePackPath(packRoot, resource.localPath));
      assert.ok(equalsSha256(digest, resource.sha256));
      if (resource.kind === 'presentation') {
        assert.equal(path.extname(resource.localPath).toLowerCase(), '.pdf');
      } else {
        assert.ok(resource.relatedPresentationIds?.length);
        assert.ok(resource.assignmentCategory === 'homework' || resource.assignmentCategory === 'project');
        assert.ok(resource.circuitStarter?.fileName.endsWith('.dig'));
      }
    }
  });
});
