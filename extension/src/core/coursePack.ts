import * as path from 'node:path';

export type CourseMaterialKind = 'presentation' | 'assignment';

export interface CourseMaterialResource {
  id: string;
  kind: CourseMaterialKind;
  order: number;
  title: string;
  sourceTitle: string;
  sourceUrl: string;
  modifiedAt: string;
  concepts: string[];
  localPath?: string;
  sha256?: string;
  relatedAssignmentIds?: string[];
  relatedPresentationIds?: string[];
}

export interface CourseMaterialsManifest {
  schemaVersion: '0.1.0';
  id: string;
  version: string;
  course: {
    code: string;
    title: string;
    sourceTerm: string;
  };
  status: 'instructor-review-required' | 'student-release';
  sourceFolder: string;
  studentIndexPath: string;
  resources: CourseMaterialResource[];
}

export function parseCourseMaterialsManifest(value: unknown): CourseMaterialsManifest {
  const manifest = requireRecord(value, 'course-material manifest');
  if (manifest.schemaVersion !== '0.1.0') {
    throw new Error('Unsupported course-material schema version.');
  }
  const id = requireString(manifest.id, 'id');
  const version = requireString(manifest.version, 'version');
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('Course-material version must use semantic versioning.');
  }
  const courseValue = requireRecord(manifest.course, 'course');
  const status = manifest.status;
  if (status !== 'instructor-review-required' && status !== 'student-release') {
    throw new Error('Course-material status is invalid.');
  }
  const resourcesValue = manifest.resources;
  if (!Array.isArray(resourcesValue) || resourcesValue.length === 0) {
    throw new Error('Course-material manifest must contain resources.');
  }

  const resources = resourcesValue.map((entry, index) => parseResource(entry, index));
  const ids = new Set<string>();
  for (const resource of resources) {
    if (ids.has(resource.id)) {
      throw new Error(`Duplicate course-material resource id: ${resource.id}.`);
    }
    ids.add(resource.id);
  }
  const resourcesById = new Map(resources.map((resource) => [resource.id, resource]));
  for (const resource of resources) {
    for (const relatedId of [...(resource.relatedAssignmentIds ?? []), ...(resource.relatedPresentationIds ?? [])]) {
      if (!ids.has(relatedId)) {
        throw new Error(`Resource ${resource.id} references unknown resource ${relatedId}.`);
      }
    }
    for (const assignmentId of resource.relatedAssignmentIds ?? []) {
      const assignment = resourcesById.get(assignmentId);
      if (resource.kind !== 'presentation' || assignment?.kind !== 'assignment') {
        throw new Error(`Resource ${resource.id} has an invalid assignment relationship to ${assignmentId}.`);
      }
      if (!assignment.relatedPresentationIds?.includes(resource.id)) {
        throw new Error(`Relationship between ${resource.id} and ${assignmentId} is not reciprocal.`);
      }
    }
    for (const presentationId of resource.relatedPresentationIds ?? []) {
      const presentation = resourcesById.get(presentationId);
      if (resource.kind !== 'assignment' || presentation?.kind !== 'presentation') {
        throw new Error(`Resource ${resource.id} has an invalid presentation relationship to ${presentationId}.`);
      }
      if (!presentation.relatedAssignmentIds?.includes(resource.id)) {
        throw new Error(`Relationship between ${resource.id} and ${presentationId} is not reciprocal.`);
      }
    }
  }

  return {
    schemaVersion: '0.1.0',
    id,
    version,
    course: {
      code: requireString(courseValue.code, 'course.code'),
      title: requireString(courseValue.title, 'course.title'),
      sourceTerm: requireString(courseValue.sourceTerm, 'course.sourceTerm')
    },
    status,
    sourceFolder: requireHttpsUrl(manifest.sourceFolder, 'sourceFolder'),
    studentIndexPath: requireSafeRelativePath(manifest.studentIndexPath, 'studentIndexPath'),
    resources: resources.sort((left, right) => left.order - right.order)
  };
}

export function resolveCoursePackPath(packRoot: string, relativePath: string): string {
  const safePath = requireSafeRelativePath(relativePath, 'course-pack path');
  const root = path.resolve(packRoot);
  const resolved = path.resolve(root, safePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Course-pack path escapes the pack root: ${relativePath}.`);
  }
  return resolved;
}

function parseResource(value: unknown, index: number): CourseMaterialResource {
  const resource = requireRecord(value, `resources[${index}]`);
  const kind = resource.kind;
  if (kind !== 'presentation' && kind !== 'assignment') {
    throw new Error(`resources[${index}].kind is invalid.`);
  }
  if (typeof resource.order !== 'number' || !Number.isFinite(resource.order)) {
    throw new Error(`resources[${index}].order must be a number.`);
  }
  const localPath = resource.localPath === undefined
    ? undefined
    : requireSafeRelativePath(resource.localPath, `resources[${index}].localPath`);
  const sha256 = resource.sha256 === undefined ? undefined : requireString(resource.sha256, `resources[${index}].sha256`);
  if ((localPath === undefined) !== (sha256 === undefined)) {
    throw new Error(`resources[${index}] must provide localPath and sha256 together.`);
  }
  if (sha256 && !/^[a-f0-9]{64}$/i.test(sha256)) {
    throw new Error(`resources[${index}].sha256 is invalid.`);
  }

  return {
    id: requireString(resource.id, `resources[${index}].id`),
    kind,
    order: resource.order,
    title: requireString(resource.title, `resources[${index}].title`),
    sourceTitle: requireString(resource.sourceTitle, `resources[${index}].sourceTitle`),
    sourceUrl: requireHttpsUrl(resource.sourceUrl, `resources[${index}].sourceUrl`),
    modifiedAt: requireString(resource.modifiedAt, `resources[${index}].modifiedAt`),
    concepts: requireStringArray(resource.concepts, `resources[${index}].concepts`),
    localPath,
    sha256,
    relatedAssignmentIds: optionalStringArray(resource.relatedAssignmentIds, `resources[${index}].relatedAssignmentIds`),
    relatedPresentationIds: optionalStringArray(resource.relatedPresentationIds, `resources[${index}].relatedPresentationIds`)
  };
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function requireHttpsUrl(value: unknown, label: string): string {
  const text = requireString(value, label);
  const parsed = new URL(text);
  if (parsed.protocol !== 'https:') {
    throw new Error(`${label} must use HTTPS.`);
  }
  return text;
}

function requireSafeRelativePath(value: unknown, label: string): string {
  const text = requireString(value, label).replaceAll('\\', '/');
  if (text.startsWith('/') || /^[A-Za-z]:\//.test(text)) {
    throw new Error(`${label} must be relative.`);
  }
  const segments = text.split('/');
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..')) {
    throw new Error(`${label} contains an unsafe segment.`);
  }
  return segments.join(path.sep);
}

function requireStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty string array.`);
  }
  return value.map((entry, index) => requireString(entry, `${label}[${index}]`));
}

function optionalStringArray(value: unknown, label: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be a string array.`);
  }
  return value.map((entry, index) => requireString(entry, `${label}[${index}]`));
}
