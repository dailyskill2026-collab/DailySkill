// tests/sprint13/skillAssessments.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  assessmentQuestionBank,
  getQuestionsByCategory,
  getQuestionsByTechnology
} from '@/data/assessmentQuestionBank';
import { assessmentScoringEngine } from '@/services/assessmentScoringEngine';
import { skillGapAnalysisService } from '@/services/skillGapAnalysisService';
import { improvementPlanService } from '@/services/improvementPlanService';
import { challengeService } from '@/services/challengeService';
import { achievementService } from '@/services/achievementService';
import { assessmentService } from '@/services/assessmentService';
import {
  assessmentRepository,
  challengeRepository,
  achievementRepository
} from '@/repositories';
import type { SkillCategory, AssessmentQuestion, AssessmentAttempt } from '@/types/assessment';

describe('Sprint 13: Skill Assessments, Learning Challenges & Personalized Skill Gap Analysis', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1-3. Question Bank Integrity & Metadata
  // =========================================================================
  describe('1-3. Question Bank Quality & Domain Coverage', () => {
    it('1. Question bank contains at least 40 questions across all 8 Salesforce categories', () => {
      expect(assessmentQuestionBank.length).toBeGreaterThanOrEqual(40);

      const categories: SkillCategory[] = [
        'admin',
        'apex',
        'lwc',
        'integrations',
        'security',
        'flows',
        'async_apex',
        'devops'
      ];

      for (const cat of categories) {
        const questions = getQuestionsByCategory(cat);
        expect(questions.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('2. Each question has exactly 4 options with valid ids and non-empty labels', () => {
      for (const q of assessmentQuestionBank) {
        expect(q.options.length).toBe(4);
        const optionIds = q.options.map((o) => o.id);
        expect(new Set(optionIds).size).toBe(4);
        expect(optionIds).toContain(q.correctAnswerId);

        for (const opt of q.options) {
          expect(opt.label.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it('3. Each question contains non-empty explanation and verified status', () => {
      for (const q of assessmentQuestionBank) {
        expect(q.explanation.trim().length).toBeGreaterThan(10);
        expect(q.verificationStatus).toBe('verified');
        expect(q.publicationStatus).toBe('published');
        expect(q.contentVersion).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // 4-8. Assessment Scoring Engine
  // =========================================================================
  describe('4-8. Assessment Scoring Engine Calculations', () => {
    it('4. Computes 100% score when all questions are answered correctly', () => {
      const sampleQs = assessmentQuestionBank.slice(0, 5);
      const userAnswers: Record<string, string | null> = {};
      sampleQs.forEach((q) => {
        userAnswers[q.questionId] = q.correctAnswerId;
      });

      const result = assessmentScoringEngine.calculateScore(sampleQs, userAnswers);
      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(5);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.unansweredQuestions).toBe(0);
      expect(result.percentageScore).toBe(100);
    });

    it('5. Computes partial score accurately (e.g. 3 of 5 correct = 60%)', () => {
      const sampleQs = assessmentQuestionBank.slice(0, 5);
      const userAnswers: Record<string, string | null> = {
        [sampleQs[0].questionId]: sampleQs[0].correctAnswerId,
        [sampleQs[1].questionId]: sampleQs[1].correctAnswerId,
        [sampleQs[2].questionId]: sampleQs[2].correctAnswerId,
        [sampleQs[3].questionId]: 'WRONG_CHOICE',
        [sampleQs[4].questionId]: 'WRONG_CHOICE'
      };

      const result = assessmentScoringEngine.calculateScore(sampleQs, userAnswers);
      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(3);
      expect(result.incorrectAnswers).toBe(2);
      expect(result.unansweredQuestions).toBe(0);
      expect(result.percentageScore).toBe(60);
    });

    it('6. Computes 0% score when all answers are wrong or omitted', () => {
      const sampleQs = assessmentQuestionBank.slice(0, 4);
      const userAnswers: Record<string, string | null> = {
        [sampleQs[0].questionId]: 'WRONG',
        [sampleQs[1].questionId]: 'WRONG',
        [sampleQs[2].questionId]: 'WRONG',
        [sampleQs[3].questionId]: 'WRONG'
      };

      const result = assessmentScoringEngine.calculateScore(sampleQs, userAnswers);
      expect(result.percentageScore).toBe(0);
      expect(result.correctAnswers).toBe(0);
      expect(result.incorrectAnswers).toBe(4);
    });

    it('7. Unanswered questions count as incorrect when computing percentageScore', () => {
      const sampleQs = assessmentQuestionBank.slice(0, 10);
      // User only answers 5 questions, all 5 correct. 5 questions are unanswered.
      const userAnswers: Record<string, string | null> = {};
      for (let i = 0; i < 5; i++) {
        userAnswers[sampleQs[i].questionId] = sampleQs[i].correctAnswerId;
      }

      const result = assessmentScoringEngine.calculateScore(sampleQs, userAnswers);
      expect(result.totalQuestions).toBe(10);
      expect(result.correctAnswers).toBe(5);
      expect(result.unansweredQuestions).toBe(5);
      // 5 correct out of 10 total = 50%
      expect(result.percentageScore).toBe(50);
    });

    it('8. Distinctly tracks unanswered count from incorrect count in report', () => {
      const sampleQs = assessmentQuestionBank.slice(0, 5);
      const userAnswers: Record<string, string | null> = {
        [sampleQs[0].questionId]: sampleQs[0].correctAnswerId,
        [sampleQs[1].questionId]: 'WRONG',
        // sampleQs[2], [3], [4] left null / undefined
      };

      const result = assessmentScoringEngine.calculateScore(sampleQs, userAnswers);
      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(1);
      expect(result.unansweredQuestions).toBe(3);
      expect(result.percentageScore).toBe(20);
    });
  });

  // =========================================================================
  // 9-12. Skill Classification & Conservative Baseline
  // =========================================================================
  describe('9-12. Skill Classification & Confidence Ratings', () => {
    it('9. Classifies as "insufficient_evidence" when fewer than 3 questions are attempted for a topic', () => {
      // 2 questions on same topic
      const topicQuestions = assessmentQuestionBank.filter((q) => q.topicId === 'owd_sharing').slice(0, 2);
      const userAnswers = {
        [topicQuestions[0].questionId]: topicQuestions[0].correctAnswerId
      };

      const result = assessmentScoringEngine.calculateScore(topicQuestions, userAnswers);
      const tp = result.topicPerformances.find((t) => t.topicId === 'owd_sharing');
      expect(tp?.classification).toBe('insufficient_evidence');
    });

    it('10. Classifies as "strong" when >= 80% accuracy with at least 3 attempts', () => {
      const mockQuestions: AssessmentQuestion[] = [
        { ...assessmentQuestionBank[0], questionId: 'q-s1', topicId: 'apex_gov' },
        { ...assessmentQuestionBank[0], questionId: 'q-s2', topicId: 'apex_gov' },
        { ...assessmentQuestionBank[0], questionId: 'q-s3', topicId: 'apex_gov' },
        { ...assessmentQuestionBank[0], questionId: 'q-s4', topicId: 'apex_gov' }
      ];
      // 4 out of 4 correct = 100% (>= 80%)
      const userAnswers = {
        'q-s1': mockQuestions[0].correctAnswerId,
        'q-s2': mockQuestions[1].correctAnswerId,
        'q-s3': mockQuestions[2].correctAnswerId,
        'q-s4': mockQuestions[3].correctAnswerId
      };

      const result = assessmentScoringEngine.calculateScore(mockQuestions, userAnswers);
      const tp = result.topicPerformances.find((t) => t.topicId === 'apex_gov');
      expect(tp?.classification).toBe('strong');
      expect(tp?.accuracy).toBe(100);
    });

    it('11. Classifies as "developing" when 50% - 79% accuracy with at least 3 attempts', () => {
      const mockQuestions: AssessmentQuestion[] = [
        { ...assessmentQuestionBank[0], questionId: 'q-d1', topicId: 'lwc_wire' },
        { ...assessmentQuestionBank[0], questionId: 'q-d2', topicId: 'lwc_wire' },
        { ...assessmentQuestionBank[0], questionId: 'q-d3', topicId: 'lwc_wire' },
        { ...assessmentQuestionBank[0], questionId: 'q-d4', topicId: 'lwc_wire' }
      ];
      // 2 out of 4 correct = 50%
      const userAnswers = {
        'q-d1': mockQuestions[0].correctAnswerId,
        'q-d2': mockQuestions[1].correctAnswerId,
        'q-d3': 'WRONG',
        'q-d4': 'WRONG'
      };

      const result = assessmentScoringEngine.calculateScore(mockQuestions, userAnswers);
      const tp = result.topicPerformances.find((t) => t.topicId === 'lwc_wire');
      expect(tp?.classification).toBe('developing');
      expect(tp?.accuracy).toBe(50);
    });

    it('12. Classifies as "needs_practice" when < 50% accuracy with at least 3 attempts', () => {
      const mockQuestions: AssessmentQuestion[] = [
        { ...assessmentQuestionBank[0], questionId: 'q-np1', topicId: 'security_fls' },
        { ...assessmentQuestionBank[0], questionId: 'q-np2', topicId: 'security_fls' },
        { ...assessmentQuestionBank[0], questionId: 'q-np3', topicId: 'security_fls' }
      ];
      // 1 out of 3 correct = 33% (< 50%)
      const userAnswers = {
        'q-np1': mockQuestions[0].correctAnswerId,
        'q-np2': 'WRONG',
        'q-np3': 'WRONG'
      };

      const result = assessmentScoringEngine.calculateScore(mockQuestions, userAnswers);
      const tp = result.topicPerformances.find((t) => t.topicId === 'security_fls');
      expect(tp?.classification).toBe('needs_practice');
      expect(tp?.accuracy).toBe(33);
    });
  });

  // =========================================================================
  // 13-18. Assessment Lifecycle & Service Operations
  // =========================================================================
  describe('13-18. Assessment Lifecycle & In-Progress Persistence', () => {
    it('13. Starts Quick Diagnostic with 5 questions', async () => {
      const assessment = await assessmentService.startAssessment('quick', 'admin');
      expect(assessment.assessmentType).toBe('quick');
      expect(assessment.questions.length).toBe(5);
      expect(assessment.category).toBe('admin');
    });

    it('14. Starts Topic Assessment with 10 questions', async () => {
      const assessment = await assessmentService.startAssessment('topic', 'apex');
      expect(assessment.assessmentType).toBe('topic');
      expect(assessment.questions.length).toBe(10);
      expect(assessment.category).toBe('apex');
    });

    it('15. Starts Comprehensive Skill Check with 20 questions balanced across domains', async () => {
      const assessment = await assessmentService.startAssessment('skill_check');
      expect(assessment.assessmentType).toBe('skill_check');
      expect(assessment.questions.length).toBe(20);

      // Verify domain diversity: at least 6 distinct categories included
      const cats = new Set(assessment.questions.map((q) => q.category));
      expect(cats.size).toBeGreaterThanOrEqual(6);
    });

    it('16. Saves and restores in-progress assessment across sessions', async () => {
      const inProgress = await assessmentService.startAssessment('quick', 'apex', 'test-user-a');
      inProgress.userAnswers[inProgress.questions[0].questionId] = inProgress.questions[0].correctAnswerId;
      inProgress.currentQuestionIndex = 2;
      inProgress.timeSpentSeconds = 45;

      await assessmentService.saveProgress(inProgress);

      const restored = await assessmentService.getInProgress('test-user-a');
      expect(restored).not.toBeNull();
      expect(restored?.currentQuestionIndex).toBe(2);
      expect(restored?.timeSpentSeconds).toBe(45);
      expect(Object.keys(restored?.userAnswers || {}).length).toBe(1);
    });

    it('17. Clears in-progress state when abandoned or submitted', async () => {
      await assessmentService.startAssessment('quick', 'security', 'test-user-b');
      expect(await assessmentService.getInProgress('test-user-b')).not.toBeNull();

      await assessmentService.clearInProgress('test-user-b');
      expect(await assessmentService.getInProgress('test-user-b')).toBeNull();
    });

    it('18. Submission creates completed attempt with score, clearing in-progress state', async () => {
      const inProgress = await assessmentService.startAssessment('quick', 'flows', 'test-user-c');
      inProgress.userAnswers[inProgress.questions[0].questionId] = inProgress.questions[0].correctAnswerId;

      const res = await assessmentService.submitAssessment(inProgress, 120);
      expect(res.attempt).toBeDefined();
      expect(res.attempt.totalQuestions).toBe(5);
      expect(res.attempt.durationSeconds).toBe(120);

      // Check in-progress is now cleared
      expect(await assessmentService.getInProgress('test-user-c')).toBeNull();

      // Check attempt is persisted in repository
      const attempts = await assessmentService.getAttempts('test-user-c');
      expect(attempts.length).toBe(1);
      expect(attempts[0].attemptId).toBe(res.attempt.attemptId);
    });
  });

  // =========================================================================
  // 19-21. Skill Gap Analysis & Trend Tracking
  // =========================================================================
  describe('19-21. Skill Gap Analysis Engine', () => {
    it('19. Identifies top weaknesses from historical attempts', () => {
      const mockAttempts: AssessmentAttempt[] = [
        {
          attemptId: 'att-1',
          mockUserId: 'u1',
          assessmentType: 'quick',
          title: 'Quick Test',
          totalQuestions: 6,
          correctAnswers: 2,
          incorrectAnswers: 4,
          unansweredQuestions: 0,
          percentageScore: 33,
          answers: [],
          topicPerformances: [
            {
              topicId: 'async_apex',
              topicTitle: 'Queueable Apex',
              category: 'async_apex',
              questionsAttempted: 3,
              correctAnswers: 0,
              accuracy: 0,
              classification: 'needs_practice',
              recommendedAction: 'Study queueable limits'
            },
            {
              topicId: 'admin_rules',
              topicTitle: 'Validation Rules',
              category: 'admin',
              questionsAttempted: 3,
              correctAnswers: 2,
              accuracy: 66,
              classification: 'developing',
              recommendedAction: 'Practice validation syntax'
            }
          ],
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date().toISOString(),
          durationSeconds: 150
        }
      ];

      const report = skillGapAnalysisService.analyzeSkillGaps(mockAttempts);
      expect(report.topWeaknesses.length).toBeGreaterThan(0);
      expect(report.topWeaknesses[0].topic).toBe('Queueable Apex');
      expect(report.needsPracticeTopics.length).toBe(1);
      expect(report.developingTopics.length).toBe(1);
    });

    it('20. Recommends focus category with the lowest overall accuracy', () => {
      const mockAttempts: AssessmentAttempt[] = [
        {
          attemptId: 'att-2',
          mockUserId: 'u1',
          assessmentType: 'quick',
          title: 'Topic Test',
          totalQuestions: 6,
          correctAnswers: 3,
          incorrectAnswers: 3,
          unansweredQuestions: 0,
          percentageScore: 50,
          answers: [],
          topicPerformances: [
            {
              topicId: 'integrations_rest',
              topicTitle: 'Apex Callouts',
              category: 'integrations',
              questionsAttempted: 3,
              correctAnswers: 1, // 33%
              accuracy: 33,
              classification: 'needs_practice',
              recommendedAction: 'Review named credentials'
            },
            {
              topicId: 'flows_screen',
              topicTitle: 'Screen Flows',
              category: 'flows',
              questionsAttempted: 3,
              correctAnswers: 2, // 66%
              accuracy: 66,
              classification: 'developing',
              recommendedAction: 'Practice flows'
            }
          ],
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date().toISOString(),
          durationSeconds: 180
        }
      ];

      const report = skillGapAnalysisService.analyzeSkillGaps(mockAttempts);
      expect(report.recommendedFocusCategory).toBe('integrations');
    });

    it('21. Accurately detects learning trends (improving vs declining)', () => {
      const attempt1: AssessmentAttempt = {
        attemptId: 'att-t1',
        mockUserId: 'u1',
        assessmentType: 'quick',
        title: 'Session 1',
        totalQuestions: 3,
        correctAnswers: 1,
        incorrectAnswers: 2,
        unansweredQuestions: 0,
        percentageScore: 33,
        answers: [],
        topicPerformances: [
          {
            topicId: 'lwc_reactivity',
            topicTitle: 'LWC Reactivity',
            category: 'lwc',
            questionsAttempted: 3,
            correctAnswers: 1,
            accuracy: 33,
            classification: 'needs_practice',
            recommendedAction: 'Revise @track vs getter'
          }
        ],
        startedAt: '2026-11-10T10:00:00Z',
        completedAt: '2026-11-10T10:05:00Z',
        durationSeconds: 120
      };

      const attempt2: AssessmentAttempt = {
        attemptId: 'att-t2',
        mockUserId: 'u1',
        assessmentType: 'quick',
        title: 'Session 2',
        totalQuestions: 3,
        correctAnswers: 3,
        incorrectAnswers: 0,
        unansweredQuestions: 0,
        percentageScore: 100,
        answers: [],
        topicPerformances: [
          {
            topicId: 'lwc_reactivity',
            topicTitle: 'LWC Reactivity',
            category: 'lwc',
            questionsAttempted: 3,
            correctAnswers: 3,
            accuracy: 100,
            classification: 'strong',
            recommendedAction: 'Mastered'
          }
        ],
        startedAt: '2026-11-12T10:00:00Z',
        completedAt: '2026-11-12T10:05:00Z',
        durationSeconds: 110
      };

      const report = skillGapAnalysisService.analyzeSkillGaps([attempt1, attempt2]);
      const lwcTopic =
        report.strongTopics.find((t) => t.topic === 'LWC Reactivity') ||
        report.developingTopics.find((t) => t.topic === 'LWC Reactivity');
      expect(lwcTopic?.trend).toBe('improving');
    });
  });

  // =========================================================================
  // 22-23. Personalized Improvement Plan Service
  // =========================================================================
  describe('22-23. Improvement Plan Generation & Action Progress', () => {
    it('22. Generates personalized action plan addressing weak topics', () => {
      const mockAttempt: AssessmentAttempt = {
        attemptId: 'att-plan-1',
        mockUserId: 'mock-user-1',
        assessmentType: 'quick',
        category: 'apex',
        title: 'Apex Diagnostic',
        totalQuestions: 5,
        correctAnswers: 2,
        incorrectAnswers: 3,
        unansweredQuestions: 0,
        percentageScore: 40,
        answers: [],
        topicPerformances: [
          {
            topicId: 'soql_injection',
            topicTitle: 'SOQL Injection Prevention',
            category: 'apex',
            questionsAttempted: 3,
            correctAnswers: 1,
            accuracy: 33,
            classification: 'needs_practice',
            recommendedAction: 'Revise string escape methods'
          }
        ],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 130
      };

      const plan = improvementPlanService.generatePlan(mockAttempt);
      expect(plan.weakTopics).toContain('SOQL Injection Prevention');
      expect(plan.actions.length).toBeGreaterThanOrEqual(3);
      expect(plan.actions.some((a) => a.actionType === 'revise_topic')).toBe(true);
      expect(plan.actions.some((a) => a.actionType === 'retake_assessment')).toBe(true);
    });

    it('23. Marks action completed and updates active improvement plan', async () => {
      const plan = await improvementPlanService.getActivePlan();
      expect(plan).not.toBeNull();
      const firstAction = plan!.actions[0];
      expect(firstAction.isCompleted).toBe(false);

      const updated = await improvementPlanService.completeAction(firstAction.actionId);
      expect(updated?.actions[0].isCompleted).toBe(true);
    });
  });

  // =========================================================================
  // 24-26. Daily & Weekly Learning Challenges
  // =========================================================================
  describe('24-26. Daily & Weekly Challenges Management', () => {
    it('24. Initializes daily challenges keyed to today\'s date (YYYY-MM-DD)', async () => {
      const daily = await challengeService.getDailyChallenges('user-c1');
      expect(daily.length).toBe(2);
      expect(daily[0].type).toBe('daily');
      expect(daily[0].periodKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('25. Initializes weekly challenges keyed to ISO calendar week (YYYY-Wxx)', async () => {
      const weekly = await challengeService.getWeeklyChallenges('user-c1');
      expect(weekly.length).toBe(2);
      expect(weekly[0].type).toBe('weekly');
      expect(weekly[0].periodKey).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('26. Records progress towards active challenges and completes them idempotently', async () => {
      // Record assessment completion
      const completed = await challengeService.recordProgress('assessment', 1, 'user-c2');
      expect(completed.length).toBeGreaterThanOrEqual(1);
      expect(completed[0].isCompleted).toBe(true);

      // Recording again should not double complete
      const secondCall = await challengeService.recordProgress('assessment', 1, 'user-c2');
      expect(secondCall.length).toBe(0);
    });
  });

  // =========================================================================
  // 27-28. Activity-Earned Achievements
  // =========================================================================
  describe('27-28. Activity-Earned Badges & Unlocking', () => {
    it('27. Unlocks "first_assessment" badge upon completing the first assessment', async () => {
      const inProgress = await assessmentService.startAssessment('quick', 'security', 'user-ach-1');
      const res = await assessmentService.submitAssessment(inProgress, 100);

      const badges = await achievementService.getAchievements('user-ach-1');
      const firstBadge = badges.find((b) => b.achievementId === 'first_assessment');
      expect(firstBadge?.earnedAt).toBeTruthy();
    });

    it('28. Unlocks "sharp_mind" badge when scoring >= 80% on an assessment', async () => {
      const inProgress = await assessmentService.startAssessment('quick', 'admin', 'user-ach-2');
      // Answer all 5 correctly
      for (const q of inProgress.questions) {
        inProgress.userAnswers[q.questionId] = q.correctAnswerId;
      }

      const res = await assessmentService.submitAssessment(inProgress, 150);
      expect(res.attempt.percentageScore).toBe(100);

      const badges = await achievementService.getAchievements('user-ach-2');
      const sharpMind = badges.find((b) => b.achievementId === 'sharp_mind');
      expect(sharpMind?.earnedAt).toBeTruthy();
    });
  });
});
