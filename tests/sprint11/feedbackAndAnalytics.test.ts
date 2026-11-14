// tests/sprint11/feedbackAndAnalytics.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { feedbackService } from '@/services/feedbackService';
import { analytics } from '@/services/analyticsService';
import { metricsService } from '@/services/metricsService';
import { journeyFunnelService } from '@/services/journeyFunnelService';
import { backlogService } from '@/services/backlogService';
import { betaSimulationService, BETA_PROFILES } from '@/services/betaSimulationService';
import { exportService } from '@/services/exportService';
import {
  isAnalyticsOptedOut,
  setAnalyticsOptOut,
  clearLocalAnalyticsHistory,
  clearAllLocalFeedback,
  resetAllLocalData,
} from '@/services/privacyService';
import { repositories } from '@/repositories';

describe('Sprint 11: Feedback, Beta Testing Simulation & Product Analytics', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    setAnalyticsOptOut(false);
    await resetAllLocalData();
  });

  afterEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    setAnalyticsOptOut(false);
    await resetAllLocalData();
  });

  // -------------------------------------------------------------
  // 1-3: Feedback Submission, Validation & Content Quality
  // -------------------------------------------------------------
  describe('1-3. User Feedback & Content Quality Reporting', () => {
    it('1. Feedback submission: successfully submits and persists user feedback', async () => {
      const fb = await feedbackService.submitFeedback({
        category: 'feature_suggestion',
        description: 'Provide an offline mode for flashcards.',
        rating: 5,
        mockUserId: 'test-user-1',
      });

      expect(fb).toBeDefined();
      expect(fb.id).toMatch(/^fb-/);
      expect(fb.category).toBe('feature_suggestion');
      expect(fb.description).toBe('Provide an offline mode for flashcards.');
      expect(fb.rating).toBe(5);
      expect(fb.status).toBe('new');
      expect(fb.auditTrail).toHaveLength(1);

      const all = await feedbackService.getAllFeedback();
      expect(all.some((item) => item.id === fb.id)).toBe(true);
    });

    it('2. Feedback validation: throws an error when required fields are missing or empty', async () => {
      await expect(
        feedbackService.submitFeedback({
          category: '' as any,
          description: 'Valid description',
        })
      ).rejects.toThrow('Category and feedback description are required.');

      await expect(
        feedbackService.submitFeedback({
          category: 'bug_report',
          description: '   ',
        })
      ).rejects.toThrow('Category and feedback description are required.');
    });

    it('3. Content issue reporting: flags content for review without auto-deletion', async () => {
      const fb = await feedbackService.submitContentQualityFeedback({
        contentId: 'sf-update-2024-07-queueable',
        issueType: 'confusing_explanation',
        comment: 'Step 3 in the queueable chaining example is unclear.',
        vote: 'not_helpful',
        mockUserId: 'test-user-dev',
      });

      expect(fb.relatedContentId).toBe('sf-update-2024-07-queueable');
      expect(fb.contentIssueType).toBe('confusing_explanation');
      expect(fb.helpfulnessVote).toBe('not_helpful');

      const summaries = await feedbackService.getContentQualitySummaries();
      const targetSummary = summaries.find(
        (s) => s.contentId === 'sf-update-2024-07-queueable'
      );
      expect(targetSummary).toBeDefined();
      expect(targetSummary?.issueCount).toBeGreaterThanOrEqual(1);
      expect(targetSummary?.needsReview).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 4-6: Local Analytics Event System, Deduplication & Schema
  // -------------------------------------------------------------
  describe('4-6. Local Analytics Event System & Validation', () => {
    it('4. Analytics event recording: records typed event with session and metadata', async () => {
      const evt = await analytics.trackLessonStarted('sf-test-lesson', 'today');

      expect(evt).toBeDefined();
      expect(evt?.eventType).toBe('lesson_started');
      expect(evt?.relatedContentId).toBe('sf-test-lesson');
      expect(evt?.schemaVersion).toBe(1);
      expect(evt?.timestamp).toBeDefined();

      const events = await analytics.getEvents();
      expect(events.some((e) => e.eventId === evt?.eventId)).toBe(true);
    });

    it('5. Duplicate event prevention: ignores identical events fired within 3 seconds', async () => {
      const evt1 = await analytics.trackEvent('lesson_started', {
        relatedContentId: 'duplicate-check-content',
        mockUserId: 'same-user',
      });
      const evt2 = await analytics.trackEvent('lesson_started', {
        relatedContentId: 'duplicate-check-content',
        mockUserId: 'same-user',
      });

      expect(evt1).toBeDefined();
      expect(evt2).toBeNull(); // Deduplicated!

      const all = await analytics.getEvents();
      const matches = all.filter(
        (e) =>
          e.eventType === 'lesson_started' &&
          e.relatedContentId === 'duplicate-check-content'
      );
      expect(matches).toHaveLength(1);
    });

    it('6. Event schema validation & PII guard: strips sensitive fields from metadata', async () => {
      const evt = await analytics.trackEvent('quiz_completed', {
        mockUserId: 'user-with-secret',
        relevantMetadata: {
          score: 100,
          isCorrect: true,
          password: 'should_be_stripped',
          authToken: 'should_be_stripped',
        },
      });

      expect(evt?.relevantMetadata?.score).toBe(100);
      expect(evt?.relevantMetadata?.isCorrect).toBe(true);
      expect((evt?.relevantMetadata as any)?.password).toBeUndefined();
      expect((evt?.relevantMetadata as any)?.authToken).toBeUndefined();
    });
  });

  // -------------------------------------------------------------
  // 7-10: Learning Engagement Metrics (DAU, WAU, Completion, Quiz)
  // -------------------------------------------------------------
  describe('7-10. Engagement & Accuracy Metrics', () => {
    it('7. Lesson completion metrics: calculates completion rate correctly', async () => {
      // 4 lessons started, 3 completed -> 75%
      await analytics.trackEvent('lesson_started', {
        mockUserId: 'u1',
        relatedContentId: 'l1',
      });
      await analytics.trackEvent('lesson_completed', {
        mockUserId: 'u1',
        relatedContentId: 'l1',
      });

      await analytics.trackEvent('lesson_started', {
        mockUserId: 'u2',
        relatedContentId: 'l2',
      });
      await analytics.trackEvent('lesson_completed', {
        mockUserId: 'u2',
        relatedContentId: 'l2',
      });

      await analytics.trackEvent('lesson_started', {
        mockUserId: 'u3',
        relatedContentId: 'l3',
      });
      await analytics.trackEvent('lesson_completed', {
        mockUserId: 'u3',
        relatedContentId: 'l3',
      });

      await analytics.trackEvent('lesson_started', {
        mockUserId: 'u4',
        relatedContentId: 'l4',
      });

      const summary = await metricsService.getEngagementSummary();
      expect(summary.lessonsStarted).toBe(4);
      expect(summary.lessonsCompleted).toBe(3);
      expect(summary.lessonCompletionRate).toBe(75);
    });

    it('8. Quiz accuracy calculation: correctly computes accuracy % across attempts', async () => {
      // 3 correct, 1 incorrect -> 75%
      await analytics.trackEvent('quiz_completed', {
        mockUserId: 'u1',
        relatedContentId: 'q1',
        relevantMetadata: { isCorrect: true },
      });
      await analytics.trackEvent('quiz_completed', {
        mockUserId: 'u2',
        relatedContentId: 'q2',
        relevantMetadata: { isCorrect: true },
      });
      await analytics.trackEvent('quiz_completed', {
        mockUserId: 'u3',
        relatedContentId: 'q3',
        relevantMetadata: { isCorrect: true },
      });
      await analytics.trackEvent('quiz_completed', {
        mockUserId: 'u4',
        relatedContentId: 'q4',
        relevantMetadata: { isCorrect: false },
      });

      const summary = await metricsService.getEngagementSummary();
      expect(summary.quizAttempts).toBe(4);
      expect(summary.quizAccuracy).toBe(75);
    });

    it('9. Daily active learners (DAU): counts distinct users active on current calendar day', async () => {
      await analytics.trackEvent('lesson_completed', { mockUserId: 'learner-alpha' });
      await analytics.trackEvent('quiz_completed', { mockUserId: 'learner-alpha' }); // duplicate user today
      await analytics.trackEvent('revision_completed', { mockUserId: 'learner-beta' });

      const summary = await metricsService.getEngagementSummary();
      expect(summary.dau).toBe(2);
    });

    it('10. Weekly active learners (WAU): aggregates distinct active users over 7 days', async () => {
      const now = Date.now();
      const threeDaysAgo = new Date(now - 3 * 86400000).toISOString();

      await repositories.analytics.recordEvent({
        eventType: 'lesson_completed',
        mockUserId: 'historical-user-1',
        sessionId: 's-hist',
        timestamp: threeDaysAgo,
      });

      await analytics.trackEvent('lesson_completed', { mockUserId: 'today-user-2' });

      const summary = await metricsService.getEngagementSummary();
      expect(summary.wau).toBe(2);
    });
  });

  // -------------------------------------------------------------
  // 11-13: Retention Metrics & Incomplete Cohorts
  // -------------------------------------------------------------
  describe('11-13. Retention Cohorts & Handling Incomplete Windows', () => {
    it('11. Day 1 retention: accurately identifies returning users on Day 1', async () => {
      const refDate = new Date('2026-11-10T12:00:00Z');
      const d0 = '2026-11-05T08:00:00Z';
      const d1 = '2026-11-06T09:00:00Z';

      // 2 users in cohort: u1 returns on d1, u2 does not
      await repositories.analytics.recordEvent({
        eventType: 'app_opened',
        mockUserId: 'ret-u1',
        sessionId: 's1',
        timestamp: d0,
      });
      await repositories.analytics.recordEvent({
        eventType: 'app_opened',
        mockUserId: 'ret-u2',
        sessionId: 's2',
        timestamp: d0,
      });

      await repositories.analytics.recordEvent({
        eventType: 'lesson_completed',
        mockUserId: 'ret-u1',
        sessionId: 's1-next',
        timestamp: d1,
      });

      const cohorts = await metricsService.getRetentionCohorts(true, refDate);
      const cohort = cohorts.find((c) => c.cohortDate === '2026-11-05');
      expect(cohort).toBeDefined();
      expect(cohort?.userCount).toBe(2);
      expect(cohort?.day1RetainedCount).toBe(1);
      expect(cohort?.day1RetentionRate).toBe(50);
    });

    it('12. Day 7 retention: accurately calculates Day 7 retention for mature cohort', async () => {
      const refDate = new Date('2026-11-16T12:00:00Z');
      const d0 = '2026-11-01T08:00:00Z';
      const d7 = '2026-11-08T09:00:00Z';

      await repositories.analytics.recordEvent({
        eventType: 'app_opened',
        mockUserId: 'week-u1',
        sessionId: 's-w1',
        timestamp: d0,
      });
      await repositories.analytics.recordEvent({
        eventType: 'app_opened',
        mockUserId: 'week-u1',
        sessionId: 's-w1-7',
        timestamp: d7,
      });

      const cohorts = await metricsService.getRetentionCohorts(true, refDate);
      const cohort = cohorts.find((c) => c.cohortDate === '2026-11-01');
      expect(cohort?.day7RetentionRate).toBe(100);
      expect(cohort?.isComplete).toBe(true);
    });

    it('13. Incomplete cohort handling: returns null (Insufficient Data) for unelapsed observation windows', async () => {
      // Cohort started today (0 elapsed days)
      const now = new Date();
      await analytics.trackEvent('app_opened', { mockUserId: 'brand-new-learner' });

      const cohorts = await metricsService.getRetentionCohorts(true, now);
      const todayCohort = cohorts[0];
      expect(todayCohort.day1RetentionRate).toBeNull();
      expect(todayCohort.day7RetentionRate).toBeNull();
      expect(todayCohort.isComplete).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 14-15: Funnel & Dashboard Filters
  // -------------------------------------------------------------
  describe('14-15. User Journey Funnel & Filters', () => {
    it('14. Funnel calculations: tracks progression and drop-offs across all 8 stages', async () => {
      // User 1 goes all the way through
      await analytics.trackEvent('app_opened', { mockUserId: 'f-u1' });
      await analytics.trackEvent('onboarding_completed', { mockUserId: 'f-u1' });
      await analytics.trackEvent('lesson_started', { mockUserId: 'f-u1', relatedContentId: 'l1' });
      await analytics.trackEvent('lesson_completed', { mockUserId: 'f-u1', relatedContentId: 'l1' });
      await analytics.trackEvent('quiz_completed', { mockUserId: 'f-u1', relatedContentId: 'l1' });
      await analytics.trackEvent('revision_completed', { mockUserId: 'f-u1' });
      await analytics.trackEvent('learning_goal_completed', { mockUserId: 'f-u1' });

      // User 2 drops off after lesson started
      await analytics.trackEvent('app_opened', { mockUserId: 'f-u2' });
      await analytics.trackEvent('onboarding_completed', { mockUserId: 'f-u2' });
      await analytics.trackEvent('lesson_started', { mockUserId: 'f-u2', relatedContentId: 'l2' });

      const stages = await journeyFunnelService.getFunnelStages();
      expect(stages).toHaveLength(8);

      const appOpen = stages.find((s) => s.stageId === 'app_open');
      const lessonStarted = stages.find((s) => s.stageId === 'lesson_started');
      const lessonCompleted = stages.find((s) => s.stageId === 'lesson_completed');

      expect(appOpen?.userCount).toBe(2);
      expect(lessonStarted?.userCount).toBe(2);
      expect(lessonCompleted?.userCount).toBe(1);
      expect(lessonStarted?.dropOffCount).toBe(1);
    });

    it('15. Admin dashboard filters: correctly filters by start and end dates', async () => {
      const now = Date.now();
      const tenDaysAgo = new Date(now - 10 * 86400000).toISOString();
      const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();

      await repositories.analytics.recordEvent({
        eventType: 'lesson_completed',
        mockUserId: 'old-u',
        sessionId: 's-old',
        timestamp: tenDaysAgo,
      });

      await repositories.analytics.recordEvent({
        eventType: 'lesson_completed',
        mockUserId: 'recent-u',
        sessionId: 's-recent',
        timestamp: twoDaysAgo,
      });

      // Filter for last 7 days
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString();
      const filteredEvents = await analytics.getEvents({ startDate: sevenDaysAgo });

      expect(filteredEvents).toHaveLength(1);
      expect(filteredEvents[0].mockUserId).toBe('recent-u');
    });
  });

  // -------------------------------------------------------------
  // 16-18: Feedback Status & Product Backlog
  // -------------------------------------------------------------
  describe('16-18. Feedback Status & Product Backlog Tasks', () => {
    it('16. Feedback status updates: updates status and records audit trail', async () => {
      const fb = await feedbackService.submitFeedback({
        category: 'bug_report',
        description: 'Code snippet indentation error.',
        mockUserId: 'tester',
      });

      const updated = await feedbackService.updateStatus(
        fb.id,
        'under_review',
        'Investigating in dev environment'
      );

      expect(updated.status).toBe('under_review');
      expect(updated.auditTrail).toHaveLength(2);
      expect(updated.auditTrail[1].newStatus).toBe('under_review');
      expect(updated.auditTrail[1].note).toBe('Investigating in dev environment');
    });

    it('17. Product backlog creation: creates a backlog task and links source feedback', async () => {
      const fb = await feedbackService.submitFeedback({
        category: 'feature_suggestion',
        description: 'Support audio playback for daily summaries.',
        mockUserId: 'auditory-learner',
      });

      const task = await backlogService.createTask({
        title: 'Audio playback for summaries',
        description: 'Provide text-to-speech for daily updates.',
        category: 'feature_suggestion',
        priority: 'high',
        sourceFeedbackIds: [fb.id],
      });

      expect(task.taskId).toMatch(/^task-/);
      expect(task.title).toBe('Audio playback for summaries');
      expect(task.sourceFeedbackIds).toContain(fb.id);

      const allFeedback = await feedbackService.getAllFeedback();
      const updatedFb = allFeedback.find((f) => f.id === fb.id);
      expect(updatedFb?.linkedBacklogTaskId).toBe(task.taskId);
      expect(updatedFb?.status).toBe('planned');
    });

    it('18. Duplicate backlog prevention: rejects tasks with duplicate titles', async () => {
      await backlogService.createTask({
        title: 'Dark Mode Syntax Highlighting',
        description: 'Improve contrast.',
        category: 'bug_report',
      });

      await expect(
        backlogService.createTask({
          title: 'Dark Mode Syntax Highlighting',
          description: 'A duplicate task.',
          category: 'bug_report',
        })
      ).rejects.toThrow('already exists');
    });
  });

  // -------------------------------------------------------------
  // 19-20: Beta User Simulation & Reset
  // -------------------------------------------------------------
  describe('19-20. Beta User Simulation & Reset', () => {
    it('19. Beta user simulation: simulates 5 realistic persona profiles over multi-day timeline', async () => {
      const res = await betaSimulationService.runBetaSimulation(8);

      expect(res.profilesSimulated).toBe(5);
      expect(res.eventsGenerated).toBeGreaterThan(20);
      expect(res.feedbackGenerated).toBeGreaterThan(0);

      const events = await analytics.getEvents({ includeSimulated: true });
      const simulatedEvents = events.filter((e) => e.isSimulated);
      expect(simulatedEvents.length).toBe(res.eventsGenerated);

      // Verify specific persona was simulated
      const devEvents = events.filter((e) => e.mockUserId === 'sim-user-dev-2');
      expect(devEvents.length).toBeGreaterThan(0);
    });

    it('20. Simulation reset: clears simulated data while preserving genuine user data', async () => {
      // 1. Create real user activity
      await analytics.trackEvent('lesson_completed', {
        mockUserId: 'genuine-local-user',
        isSimulated: false,
      });
      await feedbackService.submitFeedback({
        category: 'general_feedback',
        description: 'Genuine local feedback',
        mockUserId: 'genuine-local-user',
        isSimulated: false,
      });

      // 2. Run simulation
      await betaSimulationService.runBetaSimulation(8);

      // 3. Reset simulation data
      await betaSimulationService.resetSimulationData();

      // Verify only genuine data remains (lesson_completed + feedback_submitted)
      const remainingEvents = await analytics.getEvents({ includeSimulated: true });
      expect(remainingEvents.length).toBe(2);
      expect(remainingEvents.every((e) => e.mockUserId === 'genuine-local-user' && !e.isSimulated)).toBe(true);

      const remainingFeedback = await feedbackService.getAllFeedback(true);
      expect(remainingFeedback).toHaveLength(1);
      expect(remainingFeedback[0].mockUserId).toBe('genuine-local-user');
    });
  });

  // -------------------------------------------------------------
  // 21-22: Local Export (CSV / JSON)
  // -------------------------------------------------------------
  describe('21-22. Local Data Export', () => {
    it('21. CSV export: generates valid CSV format with proper headers and escaping', async () => {
      await feedbackService.submitFeedback({
        category: 'bug_report',
        description: 'Broken link, please fix: "quote check".',
        mockUserId: 'exporter',
      });

      const csv = await exportService.exportFeedbackAsCsv();
      expect(csv).toContain('ID,Category,Rating,Description');
      expect(csv).toContain('bug_report');
      expect(csv).toContain('Broken link');
    });

    it('22. JSON export: generates valid parseable JSON schema', async () => {
      await analytics.trackEvent('app_opened', { mockUserId: 'json-tester' });

      const jsonStr = await exportService.exportAnalyticsEventsAsJson();
      const parsed = JSON.parse(jsonStr);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].mockUserId).toBe('json-tester');
    });
  });

  // -------------------------------------------------------------
  // 23-24: Privacy Controls (Opt-out & Deletion)
  // -------------------------------------------------------------
  describe('23-24. Privacy Controls & Data Deletion', () => {
    it('23. Analytics opt-out: halts event recording immediately when opted out', async () => {
      setAnalyticsOptOut(true);
      expect(isAnalyticsOptedOut()).toBe(true);

      const evt = await analytics.trackEvent('lesson_started', {
        mockUserId: 'opted-out-user',
      });
      expect(evt).toBeNull();

      const events = await analytics.getEvents();
      expect(events).toHaveLength(0);
    });

    it('24. Analytics data deletion: completely wipes local analytics history', async () => {
      await analytics.trackEvent('lesson_completed', { mockUserId: 'user-to-clear' });
      expect(await analytics.getEvents()).toHaveLength(1);

      await clearLocalAnalyticsHistory();
      expect(await analytics.getEvents()).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------
  // 25. Large Dataset Performance Benchmarking
  // -------------------------------------------------------------
  describe('25. Scalability & Performance Benchmarks', () => {
    it('25. High-volume benchmark: processes 10,000 analytics events across 1,000 mock users in under 100ms', async () => {
      // Generate 10,000 in-memory events across 1,000 mock users
      const mockEvents = [];
      const userCount = 1000;
      const eventCount = 10000;
      const now = Date.now();

      for (let i = 0; i < eventCount; i++) {
        const uId = `bench-user-${i % userCount}`;
        const dayOffset = (i % 7) * 86400000;
        mockEvents.push({
          eventId: `evt-bench-${i}`,
          eventType:
            i % 4 === 0
              ? 'lesson_completed'
              : i % 4 === 1
              ? 'quiz_completed'
              : i % 4 === 2
              ? 'app_opened'
              : 'revision_completed',
          mockUserId: uId,
          sessionId: `sess-${uId}-${i % 3}`,
          timestamp: new Date(now - dayOffset).toISOString(),
          schemaVersion: 1,
          relevantMetadata: { isCorrect: i % 2 === 0 },
        });
      }

      // Mock repository returning this large batch
      vi.spyOn(repositories.analytics, 'getEvents').mockResolvedValue(mockEvents as any);

      const startTime = performance.now();
      const summary = await metricsService.getEngagementSummary();
      const funnel = await journeyFunnelService.getFunnelStages();
      const elapsedMs = performance.now() - startTime;

      console.log(`[Sprint 11 Performance Benchmark] Aggregated 10,000 events in ${elapsedMs.toFixed(2)}ms`);

      expect(summary.totalEventsCount).toBe(10000);
      expect(summary.lessonsCompleted).toBeGreaterThan(0);
      expect(funnel.length).toBe(8);
      // Hard requirement: must finish in under 100ms
      expect(elapsedMs).toBeLessThan(100);

      vi.restoreAllMocks();
    });
  });
});
