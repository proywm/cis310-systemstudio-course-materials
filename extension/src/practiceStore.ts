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

const PRACTICE_PROGRESS_KEY = 'practice.progress.v1';
const PREPARATION_PROGRESS_KEY = 'preparation.progress.v1';

export class PracticeStore implements vscode.Disposable {
  private readonly changeEmitter = new vscode.EventEmitter<void>();
  readonly onDidChange = this.changeEmitter.event;

  constructor(private readonly state: vscode.Memento) {}

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
    return PRE_CLASS_MODULES.map((module) => {
      const state = preparation.modules[module.resourceId];
      const practiceAttempts = Object.entries(practice.questions)
        .filter(([questionId]) => practiceQuestion(questionId)?.resourceId === module.resourceId)
        .reduce((sum, [, progress]) => sum + progress.attempts, 0);
      const practiceQuestionsAttempted = attemptedPracticeQuestionsForResource(practice, module.resourceId);
      const read = state?.read ?? false;
      const watched = state?.watched ?? false;
      return {
        ...module,
        read,
        watched,
        practiceAttempts,
        practiceQuestionsAttempted,
        complete: preparationModuleComplete(read, watched, practiceQuestionsAttempted)
      };
    });
  }

  select(options: PracticeSelectionOptions, now = new Date()): PracticeQuestion[] {
    return selectPracticeQuestions(this.getProgress(), options, now);
  }

  async answer(input: PracticeAnswerInput, now = new Date()): Promise<PracticeAnswerResult> {
    const updated = recordPracticeAnswer(this.getProgress(), input, now);
    await this.save(updated.progress);
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
  }

  async reset(): Promise<void> {
    await Promise.all([
      this.state.update(PRACTICE_PROGRESS_KEY, emptyPracticeProgress()),
      this.state.update(PREPARATION_PROGRESS_KEY, emptyPreparationProgress())
    ]);
    this.changeEmitter.fire();
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }

  private async save(progress: PracticeProgress): Promise<void> {
    await this.state.update(PRACTICE_PROGRESS_KEY, progress);
    this.changeEmitter.fire();
  }
}
