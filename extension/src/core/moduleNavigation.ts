import { GUIDED_LABS } from './guidedLabs';
import type { LearningPathModule } from './learningResources';

export type ModuleNavigationItemKind =
  | 'reading'
  | 'toggle-read'
  | 'video'
  | 'toggle-watched'
  | 'lecture'
  | 'practice'
  | 'lab';

export interface ModuleNavigationItem {
  kind: ModuleNavigationItemKind;
  label: string;
  description: string;
  resourceId: string;
  index?: number;
  labId?: string;
}

export interface CourseModuleNavigation {
  resourceId: string;
  label: string;
  description: string;
  tooltip: string;
  complete: boolean;
  next: boolean;
  expanded: boolean;
  items: ModuleNavigationItem[];
}

/** Builds the sequential, Canvas-style module outline shown in the sidebar. */
export function buildCourseModuleNavigation(
  modules: readonly LearningPathModule[]
): CourseModuleNavigation[] {
  const nextResourceId = modules.find((module) => !module.complete)?.resourceId;
  return modules.map((module, index) => ({
    resourceId: module.resourceId,
    label: `Module ${index + 1}: ${module.title}`,
    description: module.complete
      ? 'complete'
      : `${module.resourceId === nextResourceId ? 'next · ' : ''}${moduleStatus(module)}`,
    tooltip: `${module.lectureLabel}\n${module.focus}\nReadiness question: ${module.readinessPrompt}`,
    complete: module.complete,
    next: module.resourceId === nextResourceId,
    expanded: false,
    items: [
      ...module.readings.map((reading, sourceIndex): ModuleNavigationItem => ({
        kind: 'reading',
        label: `Read ${sourceIndex + 1}: ${reading.title}`,
        description: sourceDescription(module.readinessSources.readingIndexes, sourceIndex, reading.focus),
        resourceId: module.resourceId,
        index: sourceIndex
      })),
      {
        kind: 'toggle-read',
        label: module.read ? 'Reading step completed' : 'Mark reading step completed',
        description: module.read ? 'local checkmark · select to undo' : 'after completing the mapped reading',
        resourceId: module.resourceId
      },
      ...module.authorVideos.map((video, sourceIndex): ModuleNavigationItem => ({
        kind: 'video',
        label: `Watch ${sourceIndex + 1}: ${video.title}`,
        description: sourceDescription(module.readinessSources.videoIndexes, sourceIndex, video.focus),
        resourceId: module.resourceId,
        index: sourceIndex
      })),
      {
        kind: 'toggle-watched',
        label: module.watched ? 'Video step completed' : 'Mark video step completed',
        description: module.watched ? 'local checkmark · select to undo' : 'after completing the mapped video',
        resourceId: module.resourceId
      },
      {
        kind: 'lecture',
        label: `Open ${module.lectureLabel} presentation`,
        description: 'packaged offline PDF',
        resourceId: module.resourceId
      },
      {
        kind: 'practice',
        label: 'Try the 3-question readiness check',
        description: `${Math.min(module.practiceQuestionsAttempted, 3)}/3 distinct questions tried`,
        resourceId: module.resourceId
      },
      ...GUIDED_LABS.filter((lab) => lab.resourceId === module.resourceId).map((lab): ModuleNavigationItem => ({
        kind: 'lab',
        label: `${lab.kind === 'circuit' ? 'Build' : 'Trace'}: ${lab.title}`,
        description: 'guided · formative · self-paced',
        resourceId: module.resourceId,
        labId: lab.id
      }))
    ]
  }));
}

function moduleStatus(module: LearningPathModule): string {
  return `read ${module.read ? '✓' : '○'} · video ${module.watched ? '✓' : '○'} · questions ${Math.min(module.practiceQuestionsAttempted, 3)}/3`;
}

function sourceDescription(readinessIndexes: readonly number[], index: number, focus: string): string {
  return `${readinessIndexes.includes(index) ? 'readiness source' : 'additional reference'} · ${focus}`;
}
