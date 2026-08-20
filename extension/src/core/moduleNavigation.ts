import { GUIDED_LABS } from './guidedLabs';
import {
  MODULE_CONFIDENCE_QUESTION_TARGET,
  MODULE_READINESS_QUESTION_TARGET,
  type LearningPathModule
} from './learningResources';

export type ModuleNavigationItemKind =
  | 'lesson'
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
    tooltip: `${module.lectureLabel}\n${module.focus}\nIncludes an accessible HTML explanation paired with the visual PDF.\nReadiness question: ${module.readinessPrompt}`,
    complete: module.complete,
    next: module.resourceId === nextResourceId,
    expanded: false,
    items: [
      {
        kind: 'lesson',
        label: 'Study the accessible lesson text',
        description: 'learning objectives · plain-language explanations · worked examples · AI tutor prompts',
        resourceId: module.resourceId
      },
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
        description: 'paired visual PDF · accessible HTML lesson listed above',
        resourceId: module.resourceId
      },
      {
        kind: 'practice',
        label: `Practice the ${MODULE_CONFIDENCE_QUESTION_TARGET}-question confidence set`,
        description: `${Math.min(module.practiceQuestionsAttempted, MODULE_CONFIDENCE_QUESTION_TARGET)}/${MODULE_CONFIDENCE_QUESTION_TARGET} tried · readiness after ${MODULE_READINESS_QUESTION_TARGET}`,
        resourceId: module.resourceId
      },
      ...GUIDED_LABS.filter((lab) => lab.resourceId === module.resourceId).map((lab): ModuleNavigationItem => ({
        kind: 'lab',
        label: `${lab.kind === 'circuit' ? 'Build' : 'Trace'}: ${lab.title}`,
        description: lab.requiredForModule
          ? `${module.handsOnComplete ? 'completed · ' : ''}required hands-on · guided · self-paced`
          : 'optional extension · guided · self-paced',
        resourceId: module.resourceId,
        labId: lab.id
      }))
    ]
  }));
}

function moduleStatus(module: LearningPathModule): string {
  const handsOn = module.handsOnRequired ? ` · hands-on ${module.handsOnComplete ? '✓' : '○'}` : '';
  return `read ${module.read ? '✓' : '○'} · video ${module.watched ? '✓' : '○'} · questions ${Math.min(module.practiceQuestionsAttempted, MODULE_CONFIDENCE_QUESTION_TARGET)}/${MODULE_CONFIDENCE_QUESTION_TARGET}${handsOn}`;
}

function sourceDescription(readinessIndexes: readonly number[], index: number, focus: string): string {
  return `${readinessIndexes.includes(index) ? 'readiness source' : 'additional reference'} · ${focus}`;
}
