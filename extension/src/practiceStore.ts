import * as vscode from 'vscode';
import {
  PRE_CLASS_MODULES,
  emptyPreparationProgress,
  normalizePreparationProgress,
  preparationModuleComplete,
  togglePreparation,
  type LearningPathModule,
  type PreparationField,
  type PreparationProgress
} from './core/learningResources';
import {
  GUIDED_LABS,
  GUIDED_LAB_PROGRESS_KEY,
  emptyGuidedLabProgress,
  normalizeGuidedLabProgress
} from './core/guidedLabs';
import {
  buildPracticeDashboard,
  attemptedPracticeQuestionsForResource,
  emptyPracticeProgress,
  normalizePracticeProgress,
  practiceQuestion,
  recordPracticeAnswer,
  recordPracticeReflection,
  selectPracticeQuestions,
  toggleSavedQuestion,
  type PracticeAnswerInput,
  type PracticeAnswerResult,
  type PracticeDashboard,
  type PracticeProgress,
  type PracticeQuestion,
  type PracticeReflection,
  type PracticeSelectionOptions
} from './core/practice';
import {
  createCourseworkProgress,
  normalizeCourseworkProgress,
  replaceCanvasEvents,
  toggleCourseworkCheck,
  updateCourseworkStatus,
  updateFinalProjectSelfEvaluation,
  type CanvasCalendarEvent,
  type CourseworkId,
  type CourseworkProgress,
  type CourseworkStatus,
  type FinalSelfEvaluationDimension
} from './core/coursework';
import type { LearningImprovementManager } from './learningImprovement';

const PRACTICE_PROGRESS_KEY = 'practice.progress.v1';
const PREPARATION_PROGRESS_KEY = 'preparation.progress.v1';
const COURSEWORK_PROGRESS_KEY = 'coursework.progress.v1';

export class PracticeStore implements vscode.Disposable {
  private readonly changeEmitter = new vscode.EventEmitter<void>();
  readonly onDidChange = this.changeEmitter.event;

  constructor(
    private readonly state: vscode.Memento,
    private readonly learningImprovement?: LearningImprovementManager
  ) {}

  getProgress(): PracticeProgress {
    return normalizePracticeProgress(this.state.get<unknown>(PRACTICE_PROGRESS_KEY));
  }

  getDashboard(now = new Date()): PracticeDashboard {
    return buildPracticeDashboard(this.getProgress(), now);
  }

  getPreparation(): PreparationProgress {
    return normalizePreparationProgress(this.state.get<unknown>(PREPARATION_PROGRESS_KEY));
  }

  getLearningPath(): LearningPathModule[] {
    const preparation = this.getPreparation();
    const practice = this.getProgress();
    const guided = normalizeGuidedLabProgress(this.state.get<unknown>(GUIDED_LAB_PROGRESS_KEY));
    return PRE_CLASS_MODULES.map((module) => {
      const state = preparation.modules[module.resourceId];
      const practiceAttempts = Object.entries(practice.questions)
        .filter(([questionId]) => practiceQuestion(questionId)?.resourceId === module.resourceId)
        .reduce((sum, [, progress]) => sum + progress.attempts, 0);
      const practiceQuestionsAttempted = attemptedPracticeQuestionsForResource(practice, module.resourceId);
      const read = state?.read ?? false;
      const watched = state?.watched ?? false;
      const labs = GUIDED_LABS.filter((lab) => lab.resourceId === module.resourceId);
      const completedLabs = labs.filter((lab) =>
        lab.steps.every((step) => guided.labs[lab.id]?.completedStepIds.includes(step.id))
      );
      const requiredLabs = labs.filter((lab) => lab.requiredForModule);
      const completedRequiredLabs = requiredLabs.filter((lab) => completedLabs.some((item) => item.id === lab.id));
      const handsOnComplete = completedRequiredLabs.length === requiredLabs.length;
      return {
        ...module,
        read,
        watched,
        practiceAttempts,
        practiceQuestionsAttempted,
        handsOnRequired: requiredLabs.length > 0,
        handsOnComplete,
        handsOnCompletedLabs: completedRequiredLabs.length,
        handsOnTotalLabs: requiredLabs.length,
        complete: preparationModuleComplete(read, watched, practiceQuestionsAttempted) && handsOnComplete
      };
    });
  }

  getCourseworkProgress(): CourseworkProgress {
    return normalizeCourseworkProgress(this.state.get<unknown>(COURSEWORK_PROGRESS_KEY));
  }

  async setCourseworkStatus(id: CourseworkId, status: CourseworkStatus): Promise<void> {
    await this.saveCoursework(updateCourseworkStatus(this.getCourseworkProgress(), id, status));
  }

  async toggleCourseworkCheck(id: CourseworkId, checkId: string): Promise<void> {
    await this.saveCoursework(toggleCourseworkCheck(this.getCourseworkProgress(), id, checkId));
  }

  async setFinalProjectSelfEvaluation(dimension: FinalSelfEvaluationDimension, rating: number): Promise<void> {
    await this.saveCoursework(updateFinalProjectSelfEvaluation(this.getCourseworkProgress(), dimension, rating));
  }

  async setCanvasEvents(events: readonly CanvasCalendarEvent[]): Promise<void> {
    await this.saveCoursework(replaceCanvasEvents(this.getCourseworkProgress(), events));
  }

  async resetCoursework(): Promise<void> {
    await this.saveCoursework(createCourseworkProgress());
  }

  select(options: PracticeSelectionOptions, now = new Date()): PracticeQuestion[] {
    return selectPracticeQuestions(this.getProgress(), options, now);
  }

  async answer(input: PracticeAnswerInput, now = new Date()): Promise<PracticeAnswerResult> {
    const updated = recordPracticeAnswer(this.getProgress(), input, now);
    await this.save(updated.progress);
    await this.learningImprovement?.record({
      category: 'learning',
      name: 'practice-attempt',
      moduleId: updated.result.question.resourceId,
      activityId: updated.result.question.id,
      selectedOption: updated.result.selectedIndex,
      correct: updated.result.correct,
      confidence: updated.result.confidence,
      usedHint: updated.result.usedHint,
      durationMs: input.durationMs,
      attemptNumber: updated.progress.questions[updated.result.question.id]?.attempts
    });
    return updated.result;
  }

  async toggleSaved(questionId: string): Promise<boolean> {
    const updated = toggleSavedQuestion(this.getProgress(), questionId);
    await this.save(updated);
    return Boolean(updated.questions[questionId]?.flagged);
  }

  async reflect(questionId: string, reflection: PracticeReflection): Promise<void> {
    await this.save(recordPracticeReflection(this.getProgress(), questionId, reflection));
  }

  async togglePreparation(resourceId: string, field: PreparationField): Promise<void> {
    const updated = togglePreparation(this.getPreparation(), resourceId, field);
    await this.state.update(PREPARATION_PROGRESS_KEY, updated);
    this.changeEmitter.fire();
    await this.learningImprovement?.record({
      category: 'learning',
      name: 'preparation-step',
      moduleId: resourceId,
      activityId: field,
      outcome: updated.modules[resourceId]?.[field] ? 'checked' : 'unchecked'
    });
  }

  async recordGuidedLabStep(labId: string, moduleId: string, completed: boolean): Promise<void> {
    await this.learningImprovement?.record({
      category: 'learning',
      name: 'guided-lab-step',
      moduleId,
      activityId: labId,
      outcome: completed ? 'checked' : 'unchecked'
    });
  }

  async reset(): Promise<void> {
    await Promise.all([
      this.state.update(PRACTICE_PROGRESS_KEY, emptyPracticeProgress()),
      this.state.update(PREPARATION_PROGRESS_KEY, emptyPreparationProgress()),
      this.state.update(GUIDED_LAB_PROGRESS_KEY, emptyGuidedLabProgress()),
      this.state.update(COURSEWORK_PROGRESS_KEY, createCourseworkProgress())
    ]);
    this.changeEmitter.fire();
  }

  notifyExternalProgressChange(): void {
    this.changeEmitter.fire();
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }

  private async save(progress: PracticeProgress): Promise<void> {
    await this.state.update(PRACTICE_PROGRESS_KEY, progress);
    this.changeEmitter.fire();
  }

  private async saveCoursework(progress: CourseworkProgress): Promise<void> {
    await this.state.update(COURSEWORK_PROGRESS_KEY, progress);
    this.changeEmitter.fire();
  }
}
