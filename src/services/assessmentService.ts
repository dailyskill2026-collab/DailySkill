import {
  AssessmentType,
  SkillCategory,
  AssessmentQuestion,
  InProgressAssessment,
  AssessmentAttempt,
  PersonalizedImprovementPlan
} from '../types/assessment';
import { UserAchievement, LearningChallenge } from '../types/challenge';
import { getQuestionsByCategory } from '../data/assessmentQuestionBank';
import { assessmentScoringEngine } from './assessmentScoringEngine';
import { skillGapAnalysisService, OverallGapReport } from './skillGapAnalysisService';
import { improvementPlanService } from './improvementPlanService';
import { challengeService } from './challengeService';
import { achievementService } from './achievementService';
import { recordQuizAttempt } from './weakTopicService';
import { updateSRSAttempt } from './spacedRepetition';
import { assessmentRepository } from '../repositories';

export interface SubmitAssessmentResult {
  attempt: AssessmentAttempt;
  gapReport: OverallGapReport;
  improvementPlan: PersonalizedImprovementPlan;
  newlyEarnedBadges: UserAchievement[];
  completedChallenges: LearningChallenge[];
}

export class AssessmentService {
  /**
   * Starts a new assessment session and persists in-progress state.
   */
  public async startAssessment(
    type: AssessmentType,
    category?: SkillCategory,
    mockUserId: string = 'mock-user-1'
  ): Promise<InProgressAssessment> {
    let questions: AssessmentQuestion[] = [];
    let title = '';

    if (type === 'quick') {
      if (category) {
        questions = getQuestionsByCategory(category).slice(0, 5);
        title = `Quick Diagnostic: ${category.toUpperCase()}`;
      } else {
        // Pick 5 from different categories
        const categories: SkillCategory[] = ['admin', 'apex', 'lwc', 'integrations', 'security'];
        questions = categories
          .map((cat) => {
            const catQs = getQuestionsByCategory(cat);
            return catQs[0];
          })
          .filter(Boolean);
        title = 'Quick Diagnostic (General Salesforce)';
      }
    } else if (type === 'topic') {
      const targetCat = category || 'apex';
      const catQs = getQuestionsByCategory(targetCat);

      // If we need 10 questions and have 5 in category, get 5 related category questions
      const relatedCategoryMap: Record<SkillCategory, SkillCategory> = {
        apex: 'async_apex',
        async_apex: 'apex',
        admin: 'flows',
        flows: 'admin',
        lwc: 'apex',
        integrations: 'async_apex',
        security: 'admin',
        devops: 'security'
      };

      const relatedCat = relatedCategoryMap[targetCat];
      const relatedQs = relatedCat ? getQuestionsByCategory(relatedCat) : [];
      questions = [...catQs, ...relatedQs].slice(0, 10);
      title = `Topic Assessment: ${targetCat.toUpperCase()}`;
    } else {
      // Skill Check: 20 questions, balanced across all 8 categories
      const allCategories: SkillCategory[] = [
        'admin',
        'apex',
        'lwc',
        'integrations',
        'security',
        'flows',
        'async_apex',
        'devops'
      ];

      const picked: AssessmentQuestion[] = [];
      for (const cat of allCategories) {
        const catQs = getQuestionsByCategory(cat);
        picked.push(...catQs.slice(0, 2)); // 8 * 2 = 16
      }
      // Pick 4 more to reach 20
      for (let i = 0; i < 4; i++) {
        const cat = allCategories[i];
        const catQs = getQuestionsByCategory(cat);
        if (catQs[2]) picked.push(catQs[2]);
      }
      questions = picked.slice(0, 20);
      title = 'Comprehensive Salesforce Skill Check';
    }

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const inProgress: InProgressAssessment = {
      attemptId,
      mockUserId,
      assessmentType: type,
      category,
      title,
      questions,
      currentQuestionIndex: 0,
      userAnswers: {},
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0
    };

    await assessmentRepository.saveInProgress(inProgress);
    return inProgress;
  }

  /**
   * Retrieves any existing in-progress assessment.
   */
  public async getInProgress(mockUserId: string = 'mock-user-1'): Promise<InProgressAssessment | null> {
    return assessmentRepository.getInProgress(mockUserId);
  }

  /**
   * Saves updated answer or progress for an in-progress assessment.
   */
  public async saveProgress(inProgress: InProgressAssessment): Promise<void> {
    await assessmentRepository.saveInProgress(inProgress);
  }

  /**
   * Clears/abandons an in-progress assessment.
   */
  public async clearInProgress(mockUserId: string = 'mock-user-1'): Promise<void> {
    await assessmentRepository.clearInProgress(mockUserId);
  }

  /**
   * Submits an assessment, evaluates score, analyzes gaps, updates challenges/achievements/SRS,
   * and creates a personalized improvement plan.
   */
  public async submitAssessment(
    inProgress: InProgressAssessment,
    timeSpentSeconds: number
  ): Promise<SubmitAssessmentResult> {
    const scored = assessmentScoringEngine.calculateScore(
      inProgress.questions,
      inProgress.userAnswers
    );

    const attempt: AssessmentAttempt = {
      attemptId: inProgress.attemptId,
      mockUserId: inProgress.mockUserId,
      assessmentType: inProgress.assessmentType,
      category: inProgress.category,
      title: inProgress.title,
      totalQuestions: scored.totalQuestions,
      correctAnswers: scored.correctAnswers,
      incorrectAnswers: scored.incorrectAnswers,
      unansweredQuestions: scored.unansweredQuestions,
      percentageScore: scored.percentageScore,
      answers: scored.answers,
      topicPerformances: scored.topicPerformances,
      startedAt: inProgress.startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds: timeSpentSeconds
    };

    // 1. Save attempt and clear in-progress
    await assessmentRepository.saveAttempt(attempt);
    await assessmentRepository.clearInProgress(inProgress.mockUserId);

    // 2. Fetch all historical attempts and analyze skill gaps
    const allAttempts = await assessmentRepository.getAttempts(inProgress.mockUserId);
    const gapReport = skillGapAnalysisService.analyzeSkillGaps(allAttempts);

    // 3. Generate personalized improvement plan
    const improvementPlan = improvementPlanService.generatePlan(attempt, gapReport);

    // 4. Update challenges progress
    const completedChallenges: LearningChallenge[] = [];
    const assessChallenges = await challengeService.recordProgress(
      'assessment',
      1,
      inProgress.mockUserId
    );
    completedChallenges.push(...assessChallenges);

    if (attempt.correctAnswers > 0) {
      const mcqChallenges = await challengeService.recordProgress(
        'mcq',
        attempt.correctAnswers,
        inProgress.mockUserId
      );
      completedChallenges.push(...mcqChallenges);
    }

    // 5. Evaluate achievements
    const newlyEarnedBadges = await achievementService.evaluateAchievements(
      inProgress.mockUserId,
      attempt
    );

    // 6. Record topic performance into weakTopicService and spacedRepetition
    for (const q of inProgress.questions) {
      const selected = inProgress.userAnswers[q.questionId];
      const isCorrect = selected === q.correctAnswerId;
      recordQuizAttempt(q.topicTitle, isCorrect);
      updateSRSAttempt(q.topicId, q.topicTitle, q.category, isCorrect);
    }

    return {
      attempt,
      gapReport,
      improvementPlan,
      newlyEarnedBadges,
      completedChallenges
    };
  }

  /**
   * Gets user's past assessment attempts.
   */
  public async getAttempts(mockUserId: string = 'mock-user-1'): Promise<AssessmentAttempt[]> {
    return assessmentRepository.getAttempts(mockUserId);
  }

  /**
   * Gets comprehensive skill gap report.
   */
  public async getGapReport(mockUserId: string = 'mock-user-1'): Promise<OverallGapReport> {
    const attempts = await assessmentRepository.getAttempts(mockUserId);
    return skillGapAnalysisService.analyzeSkillGaps(attempts);
  }
}

export const assessmentService = new AssessmentService();
