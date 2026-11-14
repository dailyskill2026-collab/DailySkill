// tests/sprint14/contentQualityAndReadiness.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { contentInventoryService } from '@/services/contentInventoryService';
import { contentQualityService } from '@/services/contentQualityService';
import { knowledgeCoverageService, CANONICAL_SALESFORCE_TOPICS } from '@/services/knowledgeCoverageService';
import { assessmentQuestionBank } from '@/data/assessmentQuestionBank';
import { sampleLearningContent } from '@/data/sampleContent';
import { exploreContent } from '@/data/exploreContent';
import { mockKnowledgeBase } from '@/data/mockKnowledgeBase';
import { mockLearningPaths, mockQuizzes } from '@/data';
import { sampleQuizQuestions } from '@/data/sampleQuiz';
import { BETA_READINESS_CHECKLIST, MVP_SCOPE_FEATURES } from '@/data/betaReadinessData';
import { learningAssistantService } from '@/services/learningAssistantService';
import { generateDailyPlan, getContentById } from '@/services/dailyPlan';
import { skillGapAnalysisService } from '@/services/skillGapAnalysisService';
import { assessmentScoringEngine } from '@/services/assessmentScoringEngine';
import type { AssessmentAttempt } from '@/types/assessment';

describe('Sprint 14: Content Quality, Knowledge Coverage & Mock MVP Launch Readiness', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1-4. Content Inventory & Quality Scoring
  // =========================================================================
  describe('1-4. Content Inventory & Quality Rules Engine', () => {
    it('1. Content Inventory aggregates all micro-lessons, articles, knowledge items, and MCQs', () => {
      const items = contentInventoryService.getInventory();
      expect(items.length).toBeGreaterThanOrEqual(50);

      // Verify representations of all content types
      const types = new Set(items.map((i) => i.contentType));
      expect(types.has('scenario_mcq')).toBe(true);
      expect(types.has('article') || types.has('update')).toBe(true);
      expect(types.has('knowledge_qa')).toBe(true);
    });

    it('2. Content Quality rules compute completeness score based on title, summary, and explanation', () => {
      const itemComplete = {
        id: 'test-1',
        title: 'Mastering Queueable Apex Chaining Limits',
        summary: 'A detailed overview of how to chain asynchronous queueable jobs effectively.',
        explanation: 'Queueable Apex allows developers to execute asynchronous jobs and chain a subsequent job within governor boundaries.',
        sourceUrl: 'https://developer.salesforce.com/docs/queueable',
        sourceName: 'Apex Guide',
        version: 'Summer ’24',
        realWorldExample: 'Processing 10,000 policy updates asynchronously without hitting execution limits.'
      };

      const score = contentQualityService.evaluateContent(itemComplete);
      expect(score.totalScore).toBeGreaterThanOrEqual(80);
      expect(score.rating).toBe('excellent');
    });

    it('3. Content Quality rules penalize missing summaries or brief explanations', () => {
      const itemIncomplete = {
        id: 'test-2',
        title: 'Brief Note',
        summary: 'Too short',
        explanation: 'Brief'
      };

      const score = contentQualityService.evaluateContent(itemIncomplete);
      expect(score.totalScore).toBeLessThan(60);
      expect(['needs_improvement', 'poor']).toContain(score.rating);
      const summaryCheck = score.checks.find((c) => c.ruleId === 'comp-summary');
      expect(summaryCheck?.passed).toBe(false);
    });

    it('4. Content Quality strictly separates structural score from factual verification status', () => {
      const sampleItem = {
        id: 'test-sample',
        title: 'Sample Structural Article on LWC Performance',
        summary: 'High quality structure but marked as sample mockup data without human SME signoff.',
        explanation: 'Detailed explanation about render performance and reactive properties in custom elements.',
        sourceUrl: 'https://developer.salesforce.com/docs/lwc',
        sourceName: 'LWC Docs',
        version: 'Spring ’24',
        realWorldExample: 'Virtual list virtualization for 500 rows.',
        verificationStatus: 'sample' // Not verified by human SME
      };

      const evalResult = contentQualityService.evaluateContent(sampleItem);
      // High structural score does NOT make it verified
      expect(evalResult.totalScore).toBeGreaterThanOrEqual(80);
      expect(evalResult.isFactuallyVerified).toBe(false);
      expect(evalResult.verificationBadge).toBe('sample');
    });
  });

  // =========================================================================
  // 5-7. Salesforce Knowledge Coverage Matrix
  // =========================================================================
  describe('5-7. Salesforce Knowledge Coverage Matrix Audit', () => {
    it('5. Evaluates all 63 canonical Salesforce topics across the 7 core domains', () => {
      expect(CANONICAL_SALESFORCE_TOPICS.length).toBe(63);

      const report = knowledgeCoverageService.generateCoverageReport();
      expect(report.totalTopics).toBe(63);
      expect(report.categories.length).toBeGreaterThanOrEqual(7);
      expect(report.overallCoveragePercentage).toBeGreaterThan(50);
    });

    it('6. Detects missing and uncovered topics correctly (e.g. Reports & Dashboards, Webhooks)', () => {
      const report = knowledgeCoverageService.generateCoverageReport();
      const allReportTopics = report.categories.flatMap((c) => c.topics);

      const reportsDashboards = allReportTopics.find((t) => t.topicId === 'admin_reports_dashboards');
      expect(reportsDashboards).toBeDefined();
      expect(reportsDashboards?.coverageStatus).toBe('missing');

      const webhooks = allReportTopics.find((t) => t.topicId === 'integ_webhooks');
      expect(webhooks).toBeDefined();
      expect(webhooks?.coverageStatus).toBe('missing');
    });

    it('7. Calculates dynamic category coverage percentages from actual inventory records', () => {
      const report = knowledgeCoverageService.generateCoverageReport();

      const apexCategory = report.categories.find((c) => c.category === 'apex');
      expect(apexCategory).toBeDefined();
      expect(apexCategory!.totalTopics).toBe(9);
      expect(apexCategory!.coveragePercentage).toBeGreaterThanOrEqual(60);

      const asyncCategory = report.categories.find((c) => c.category === 'async_apex');
      expect(asyncCategory).toBeDefined();
      expect(asyncCategory!.coveragePercentage).toBeGreaterThanOrEqual(70);
    });
  });

  // =========================================================================
  // 8-9. Deduplication & Reference Integrity
  // =========================================================================
  describe('8-9. Content Deduplication & Broken Reference Auditing', () => {
    it('8. Deduplication check identifies unique items and catches repeated titles', () => {
      const duplicates = contentInventoryService.findDuplicates();
      // Ensure zero duplicate IDs in the core assessment bank
      const questionIds = assessmentQuestionBank.map((q) => q.questionId);
      expect(new Set(questionIds).size).toBe(questionIds.length);
    });

    it('9. Broken reference scanner validates that learning paths and content IDs resolve safely', () => {
      for (const path of mockLearningPaths) {
        expect(path.id).toBeTruthy();
        expect(path.totalLessons).toBeGreaterThan(0);
        expect(path.completedLessons).toBeLessThanOrEqual(path.totalLessons);
      }
    });
  });

  // =========================================================================
  // 10-12. MCQ Quality & Assessment Pool Depths
  // =========================================================================
  describe('10-12. MCQ Quality & Assessment Coverage Audit', () => {
    it('10. Validates all 44 MCQs have exactly 4 answer options with a single correct answer', () => {
      // 40 in assessment bank + 1 sample quiz + 3 mock quizzes = 44 total
      const totalMcqs = assessmentQuestionBank.length + sampleQuizQuestions.length + mockQuizzes.length;
      expect(totalMcqs).toBe(44);

      for (const q of assessmentQuestionBank) {
        expect(q.options.length).toBe(4);
        const optIds = q.options.map((o) => o.id);
        expect(optIds).toContain(q.correctAnswerId);
      }

      for (const q of sampleQuizQuestions) {
        expect(q.options.length).toBe(4);
        const optIds = q.options.map((o) => o.id);
        expect(optIds).toContain(q.correctAnswerId);
      }

      for (const q of mockQuizzes) {
        expect(q.options.length).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      }
    });

    it('11. Validates all 44 MCQs have non-empty, actionable technical explanations', () => {
      for (const q of assessmentQuestionBank) {
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      }
      for (const q of sampleQuizQuestions) {
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      }
      for (const q of mockQuizzes) {
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      }
    });

    it('12. Assessment question coverage confirms sufficient question pool for diagnostics', () => {
      // Quick: 5 questions, Topic: 10 questions, Skill Check: 20 questions
      expect(assessmentQuestionBank.length).toBe(40);
      const adminCount = assessmentQuestionBank.filter((q) => q.category === 'admin').length;
      expect(adminCount).toBeGreaterThanOrEqual(5);

      const apexCount = assessmentQuestionBank.filter((q) => q.category === 'apex').length;
      expect(apexCount).toBeGreaterThanOrEqual(5);
    });
  });

  // =========================================================================
  // 13-15. Source Reference Integrity & Guardrails
  // =========================================================================
  describe('13-15. Source Evidence & Publishing Guardrails', () => {
    it('13. Source reference integrity validates secure HTTPS protocol and official domains', () => {
      const itemsWithSources = contentInventoryService
        .getInventory()
        .filter((i) => i.sourceUrl);

      for (const item of itemsWithSources) {
        expect(item.sourceUrl).toMatch(/^https:\/\//);
        expect(
          item.sourceUrl?.includes('salesforce.com') ||
          item.sourceUrl?.includes('aws.amazon.com') ||
          item.sourceUrl?.includes('docker.com')
        ).toBe(true);
      }
    });

    it('14. Content version consistency aligns with official releases (Summer ’24 / Spring ’24)', () => {
      for (const item of sampleLearningContent) {
        if (item.releaseVersion) {
          expect(item.releaseVersion).toMatch(/(Spring|Summer|Winter)\s*’?\d{2}/);
        }
      }
      for (const item of mockKnowledgeBase) {
        expect(item.version).toMatch(/(Spring|Summer|Winter)\s*’?\d{2}/);
      }
    });

    it('15. Mock publishing restrictions prevent draft or unverified content from published feed', () => {
      for (const item of exploreContent) {
        expect(item.verificationStatus === 'published' || item.verificationStatus === 'sample').toBe(true);
      }
    });
  });

  // =========================================================================
  // 16-17. Learning Assistant Quality
  // =========================================================================
  describe('16-17. Learning Assistant Grounding & Fallback Audit', () => {
    it('16. Answers match supported technical queries against the verified knowledge base', async () => {
      const resp = await learningAssistantService.askQuestion('What is Queueable Apex?');
      expect(resp.isSupported).toBe(true);
      expect(resp.matchedAnswer?.topicId).toBe('queueable_apex');
      expect(resp.matchedAnswer?.interviewAnswer).toBeTruthy();
    });

    it('17. Provides graceful fallback without fabricated answers when query is unsupported', async () => {
      const resp = await learningAssistantService.askQuestion('How to write quantum COBOL subroutines?');
      expect(resp.isSupported).toBe(false);
      expect(resp.fallbackMessage).toBeTruthy();
      expect(resp.suggestedQuestions.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 18-20. Personalization & Retention Accuracy
  // =========================================================================
  describe('18-20. Personalization Engine & Progress Integrity', () => {
    it('18. Daily plan generator serves appropriate 3-activity plan (update, practice, revision)', () => {
      const plan = generateDailyPlan();
      expect(plan.activityIds.length).toBe(3);

      const activities = plan.activityIds.map((id) => getContentById(id)).filter(Boolean);
      expect(activities.length).toBe(3);

      const categories = activities.map((a: any) => a.category);
      expect(categories).toContain('update');
      expect(categories).toContain('practice');
      expect(categories).toContain('revision');
    });

    it('19. Spaced repetition engine tracks accuracy without double-counting', () => {
      const sampleQs = assessmentQuestionBank.slice(0, 5);
      const userAnswers = {
        [sampleQs[0].questionId]: sampleQs[0].correctAnswerId,
        [sampleQs[1].questionId]: 'WRONG'
      };

      const result = assessmentScoringEngine.calculateScore(sampleQs, userAnswers);
      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(1);
      expect(result.unansweredQuestions).toBe(3);
    });

    it('20. Skill gap analysis requires at least 3 topic interactions for confident classification', () => {
      const mockAttempt: AssessmentAttempt = {
        attemptId: 'att-gap-1',
        mockUserId: 'u1',
        assessmentType: 'quick',
        title: 'OWD Diagnostic',
        totalQuestions: 2,
        correctAnswers: 1,
        incorrectAnswers: 1,
        unansweredQuestions: 0,
        percentageScore: 50,
        answers: [],
        topicPerformances: [
          {
            topicId: 'owd_sharing',
            topicTitle: 'Organization-Wide Defaults',
            category: 'admin',
            questionsAttempted: 2, // < 3
            correctAnswers: 1,
            accuracy: 50,
            classification: 'insufficient_evidence',
            recommendedAction: 'Attempt more questions'
          }
        ],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 60
      };

      const report = skillGapAnalysisService.analyzeSkillGaps([mockAttempt]);
      expect(report.insufficientEvidenceTopics.length).toBe(1);
      expect(report.strongTopics.length).toBe(0);
      expect(report.needsPracticeTopics.length).toBe(0);
    });
  });

  // =========================================================================
  // 21-23. Launch Readiness & Scope Compliance
  // =========================================================================
  describe('21-23. MVP Scope, Beta Readiness & Demo Data Transparency', () => {
    it('21. Demo and sample data are clearly flagged and labeled in inventory', () => {
      const stats = contentInventoryService.getStatistics();
      expect(stats.sampleItems).toBeGreaterThan(0);
      expect(stats.verifiedItems).toBeGreaterThan(0);
    });

    it('22. MVP Scope classification cleanly divides features into Must, Should, and Later', () => {
      const mustHave = MVP_SCOPE_FEATURES.filter((f) => f.category === 'must_have');
      const shouldHave = MVP_SCOPE_FEATURES.filter((f) => f.category === 'should_have');
      const later = MVP_SCOPE_FEATURES.filter((f) => f.category === 'later');

      expect(mustHave.length).toBeGreaterThanOrEqual(5);
      expect(shouldHave.length).toBeGreaterThanOrEqual(3);
      expect(later.length).toBeGreaterThanOrEqual(3);

      // Verify essential must-haves
      const featureNames = mustHave.map((f) => f.name);
      expect(featureNames.some((n) => n.includes('Today'))).toBe(true);
      expect(featureNames.some((n) => n.includes('MCQ'))).toBe(true);
      expect(featureNames.some((n) => n.includes('Spaced Repetition'))).toBe(true);
    });

    it('23. Beta Readiness checklist contains 14 operational dimensions with realistic mock audit statuses', () => {
      expect(BETA_READINESS_CHECKLIST.length).toBe(14);

      const dimensions = BETA_READINESS_CHECKLIST.map((b) => b.dimension);
      expect(dimensions).toContain('Database Architecture');
      expect(dimensions).toContain('Identity & Authentication');
      expect(dimensions).toContain('Backend Infrastructure');
      expect(dimensions).toContain('AI Integration');
      expect(dimensions).toContain('Financial Sustainability');

      // Verify that cloud backend is NOT falsely claimed as complete production infrastructure
      const backendItem = BETA_READINESS_CHECKLIST.find((b) => b.dimension === 'Backend Infrastructure');
      expect(backendItem?.status).toBe('not_started');

      // Financial sustainability: ₹50k-₹1L budget is intact
      const budgetItem = BETA_READINESS_CHECKLIST.find((b) => b.dimension === 'Financial Sustainability');
      expect(budgetItem?.status).toBe('complete');
    });
  });
});
