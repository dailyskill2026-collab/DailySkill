// src/repositories/mock/MockAssessmentRepository.ts
import type { IAssessmentRepository } from '../types';
import type {
  AssessmentAttempt,
  InProgressAssessment,
  PersonalizedImprovementPlan,
} from '@/types/assessment';

const ATTEMPTS_KEY = 'ds_assessments';
const IN_PROGRESS_KEY = 'ds_assessment_in_progress';
const PLANS_KEY = 'ds_improvement_plans';

export class MockAssessmentRepository implements IAssessmentRepository {
  private attempts: AssessmentAttempt[] = [];
  private inProgressMap: Record<string, InProgressAssessment> = {};
  private plans: PersonalizedImprovementPlan[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const rawAttempts = localStorage.getItem(ATTEMPTS_KEY);
      if (rawAttempts) this.attempts = JSON.parse(rawAttempts);

      const rawInProgress = localStorage.getItem(IN_PROGRESS_KEY);
      if (rawInProgress) this.inProgressMap = JSON.parse(rawInProgress);

      const rawPlans = localStorage.getItem(PLANS_KEY);
      if (rawPlans) this.plans = JSON.parse(rawPlans);
    } catch {
      // ignore
    }
  }

  private saveAttempts() {
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(this.attempts));
    } catch {}
  }

  private saveInProgressMap() {
    try {
      localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(this.inProgressMap));
    } catch {}
  }

  private savePlans() {
    try {
      localStorage.setItem(PLANS_KEY, JSON.stringify(this.plans));
    } catch {}
  }

  async saveAttempt(attempt: AssessmentAttempt): Promise<void> {
    this.loadFromStorage();
    this.attempts.unshift(attempt);
    this.saveAttempts();
    // Clear any in-progress attempt for this user
    await this.clearInProgress(attempt.mockUserId);
  }

  async getAttempts(userId: string): Promise<AssessmentAttempt[]> {
    this.loadFromStorage();
    return this.attempts.filter((a) => a.mockUserId === userId);
  }

  async getInProgress(userId: string): Promise<InProgressAssessment | null> {
    this.loadFromStorage();
    return this.inProgressMap[userId] || null;
  }

  async saveInProgress(assessment: InProgressAssessment): Promise<void> {
    this.loadFromStorage();
    this.inProgressMap[assessment.mockUserId] = assessment;
    this.saveInProgressMap();
  }

  async clearInProgress(userId: string): Promise<void> {
    this.loadFromStorage();
    delete this.inProgressMap[userId];
    this.saveInProgressMap();
  }

  async saveImprovementPlan(plan: PersonalizedImprovementPlan): Promise<void> {
    this.loadFromStorage();
    this.plans.unshift(plan);
    this.savePlans();
  }

  async getImprovementPlans(userId: string): Promise<PersonalizedImprovementPlan[]> {
    this.loadFromStorage();
    return this.plans.filter((p) => p.mockUserId === userId);
  }

  async getLatestImprovementPlan(userId: string): Promise<PersonalizedImprovementPlan | null> {
    const plans = await this.getImprovementPlans(userId);
    return plans.length > 0 ? plans[0] : null;
  }
}
