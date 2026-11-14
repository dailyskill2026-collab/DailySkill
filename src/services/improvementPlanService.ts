import {
  AssessmentAttempt,
  PersonalizedImprovementPlan,
  ImprovementAction,
  SkillCategory
} from '../types/assessment';
import { OverallGapReport } from './skillGapAnalysisService';
import { assessmentRepository } from '../repositories';

export class ImprovementPlanService {
  /**
   * Generates a tailored improvement plan based on an assessment attempt and gap analysis.
   */
  public generatePlan(
    attempt: AssessmentAttempt,
    gapReport?: OverallGapReport
  ): PersonalizedImprovementPlan {
    const weakTopics: string[] = [];

    // Gather topics that need practice or developing from the attempt
    const perfs = attempt.topicPerformances || [];
    for (const tp of perfs) {
      const topicName = tp.topicTitle || tp.topicId;
      if (tp.classification === 'needs_practice' || tp.classification === 'developing' || tp.accuracy < 70) {
        weakTopics.push(topicName);
      }
    }

    // If gap report is provided, incorporate top weaknesses
    if (gapReport && gapReport.topWeaknesses.length > 0) {
      for (const w of gapReport.topWeaknesses) {
        if (!weakTopics.includes(w.topic)) {
          weakTopics.push(w.topic);
        }
      }
    }

    // If still empty (e.g. high score), target topics with any missed question
    if (weakTopics.length === 0) {
      for (const tp of perfs) {
        const topicName = tp.topicTitle || tp.topicId;
        if (tp.correctAnswers < tp.questionsAttempted) {
          weakTopics.push(topicName);
        }
      }
    }

    const actions: ImprovementAction[] = [];
    let actionCounter = 1;

    // 1. Revision actions for weak topics
    for (const topic of weakTopics.slice(0, 3)) {
      actions.push({
        actionId: `act-${attempt.attemptId}-${actionCounter++}`,
        actionType: 'revise_topic',
        title: `Revise ${topic} Fundamentals`,
        description: `Review key syntax, governor limits, and best practices for ${topic} in the revision tab.`,
        relatedId: topic,
        isCompleted: false
      });
    }

    // 2. Practice MCQ action
    if (weakTopics.length > 0) {
      actions.push({
        actionId: `act-${attempt.attemptId}-${actionCounter++}`,
        actionType: 'practice_mcq',
        title: `Targeted Practice: ${weakTopics[0]}`,
        description: `Take a 3-question quick drill specifically focusing on ${weakTopics[0]}.`,
        relatedId: weakTopics[0],
        isCompleted: false
      });
    }

    // 3. Recommended lesson
    actions.push({
      actionId: `act-${attempt.attemptId}-${actionCounter++}`,
      actionType: 'complete_lesson',
      title: `Daily Micro-Lesson: ${attempt.category ? attempt.category.toUpperCase() : 'Salesforce'} Best Practices`,
      description: `Complete today's 3-minute technical update to keep your skills sharp.`,
      relatedId: 'sf-update-2024-07-queueable',
      isCompleted: false
    });

    // 4. Retake assessment action
    actions.push({
      actionId: `act-${attempt.attemptId}-${actionCounter++}`,
      actionType: 'retake_assessment',
      title: `Retake ${attempt.title}`,
      description: `Target score $\\ge 80\\%$ after completing revision steps.`,
      relatedId: attempt.attemptId,
      isCompleted: false
    });

    const plan: PersonalizedImprovementPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mockUserId: attempt.mockUserId,
      sourceAttemptId: attempt.attemptId,
      generatedAt: new Date().toISOString(),
      targetCategory: attempt.category || 'multi',
      overallScore: attempt.percentageScore,
      weakTopics,
      actions
    };

    // Save to repository
    assessmentRepository.saveImprovementPlan(plan);

    return plan;
  }

  /**
   * Retrieves the latest active improvement plan.
   */
  public async getActivePlan(mockUserId: string = 'mock-user-1'): Promise<PersonalizedImprovementPlan | null> {
    return assessmentRepository.getLatestImprovementPlan(mockUserId);
  }

  /**
   * Marks a specific action as completed and updates storage.
   */
  public async completeAction(actionId: string, mockUserId: string = 'mock-user-1'): Promise<PersonalizedImprovementPlan | null> {
    const plan = await assessmentRepository.getLatestImprovementPlan(mockUserId);
    if (!plan) return null;

    let updated = false;
    for (const act of plan.actions) {
      if (act.actionId === actionId) {
        act.isCompleted = true;
        updated = true;
      }
    }

    if (updated) {
      await assessmentRepository.saveImprovementPlan(plan);
    }
    return plan;
  }
}

export const improvementPlanService = new ImprovementPlanService();
