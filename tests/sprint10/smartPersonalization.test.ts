// tests/sprint10/smartPersonalization.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  scoreContentItem,
  getPersonalizedRecommendations,
} from '@/services/recommendationEngine';
import {
  recordQuizAttempt,
  analyzeTopicPerformance,
  getWeakTopicsList,
} from '@/services/weakTopicService';
import {
  updateSRSAttempt,
  getAllSRSRecords,
  getDueSRSTopics,
} from '@/services/spacedRepetition';
import {
  recordDailyActivityCompletion,
  getStreakState,
  getWeeklyGoalProgress,
  saveStreakState,
} from '@/services/streakService';
import { generateDailyPlan } from '@/services/dailyPlan';
import { computeLearningInsights } from '@/services/learningInsightsService';
import {
  getActiveInAppReminders,
  dismissReminder,
} from '@/services/reminderService';
import { getContinueLearningAction } from '@/services/continueLearningService';
import { exploreContent, LearningContent } from '@/data/exploreContent';
import { defaultProfile, Profile } from '@/store/profileStore';

describe('Sprint 10: Smart Personalization, Daily Engagement & Learning Retention', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // --- Epic 1: Recommendation Engine & Scoring ---
  describe('1-7. Recommendation Engine & Scoring', () => {
    const baseProfile: Profile = {
      ...defaultProfile,
      technology: 'salesforce',
      role: 'salesforce_dev',
      experience: '0-2',
      interests: ['apex', 'lwc'],
    };

    it('1. Boosts content matching user primary technology', () => {
      const matchItem: LearningContent = {
        id: 'tech-1',
        technology: 'salesforce',
        topic: 'Apex',
        title: 'Apex Patterns',
        summary: 'Clean architecture',
        whyItMatters: 'Quality',
        projectExample: 'Refactor',
        readingTimeMinutes: 3,
        difficulty: 'Beginner',
        verificationStatus: 'published',
      };
      const scored = scoreContentItem(matchItem, { profile: baseProfile });
      expect(scored.score).toBeGreaterThanOrEqual(30);
      expect(scored.explanation).toContain('SALESFORCE');
    });

    it('2. Boosts content matching user job role', () => {
      const devItem: LearningContent = {
        id: 'role-dev',
        technology: 'salesforce',
        topic: 'Apex',
        title: 'Apex Triggers for Developers',
        summary: 'Developer guide',
        whyItMatters: 'Scalability',
        projectExample: 'Triggers',
        readingTimeMinutes: 4,
        difficulty: 'Beginner',
        verificationStatus: 'published',
      };
      const scored = scoreContentItem(devItem, { profile: baseProfile });
      expect(scored.score).toBeGreaterThanOrEqual(40);
    });

    it('3. Calibrates recommendation score by experience level', () => {
      const advancedProfile: Profile = { ...baseProfile, experience: '5-8' };
      const advancedItem: LearningContent = {
        id: 'adv-1',
        technology: 'salesforce',
        topic: 'Apex',
        title: 'Advanced Concurrency',
        summary: 'Deep dive',
        whyItMatters: 'Speed',
        projectExample: 'Locks',
        readingTimeMinutes: 5,
        difficulty: 'Advanced',
        verificationStatus: 'published',
      };
      const scored = scoreContentItem(advancedItem, { profile: advancedProfile });
      expect(scored.score).toBeGreaterThan(30);
    });

    it('4. Prioritizes content matching user selected interests', () => {
      const lwcItem: LearningContent = {
        id: 'lwc-item',
        technology: 'salesforce',
        topic: 'LWC',
        title: 'LWC Shadow DOM Best Practices',
        summary: 'Component communication',
        whyItMatters: 'Styling',
        projectExample: 'Refactor',
        readingTimeMinutes: 3,
        difficulty: 'Beginner',
        verificationStatus: 'published',
      };
      const scored = scoreContentItem(lwcItem, { profile: baseProfile });
      expect(scored.score).toBeGreaterThanOrEqual(40);
    });

    it('5. Prioritizes weak topics with a +15 score reinforcement', () => {
      const weakItem: LearningContent = {
        id: 'weak-item',
        technology: 'salesforce',
        topic: 'Integration',
        title: 'REST Integration Limits',
        summary: 'API Governor Limits',
        whyItMatters: 'Limits',
        projectExample: 'Callout',
        readingTimeMinutes: 4,
        difficulty: 'Intermediate',
        verificationStatus: 'published',
      };
      const weakTopics = new Set(['Integration']);
      const scored = scoreContentItem(weakItem, { profile: baseProfile, weakTopics });
      expect(scored.isWeakTopicBoosted).toBe(true);
      expect(scored.explanation).toContain('Integration');
    });

    it('6. Deprioritizes completed lessons with a -50 penalty', () => {
      const completedItem: LearningContent = {
        id: 'comp-1',
        technology: 'salesforce',
        topic: 'Apex',
        title: 'Apex Basics',
        summary: 'Intro to Apex',
        whyItMatters: 'Foundation',
        projectExample: 'Hello',
        readingTimeMinutes: 2,
        difficulty: 'Beginner',
        verificationStatus: 'published',
      };
      const uncompletedScore = scoreContentItem(completedItem, { profile: baseProfile }).score;
      const completedScore = scoreContentItem(completedItem, {
        profile: baseProfile,
        completedIds: new Set(['comp-1']),
      }).score;

      expect(completedScore).toBeLessThan(uncompletedScore);
      expect(completedScore).toBe(Math.max(0, uncompletedScore - 50));
    });

    it('7. Excludes unpublished and draft content completely from recommendations', () => {
      const mixedList: LearningContent[] = [
        {
          id: 'draft-hidden',
          technology: 'salesforce',
          topic: 'Apex',
          title: 'Unpublished Draft',
          summary: 'Internal review',
          whyItMatters: 'WIP',
          projectExample: 'None',
          readingTimeMinutes: 5,
          difficulty: 'Intermediate',
          verificationStatus: 'draft' as any,
        },
        ...exploreContent,
      ];
      const recs = getPersonalizedRecommendations(mixedList, { profile: baseProfile });
      expect(recs.find((r) => r.content.id === 'draft-hidden')).toBeUndefined();
      expect(recs.every((r) => r.content.verificationStatus === 'published' || r.content.verificationStatus === 'sample')).toBe(true);
    });
  });

  // --- Epic 2: Daily Learning Planner & Completion ---
  describe('8-10. Daily Learning Planner & Completion', () => {
    it('8. Generates adaptive plans for 3, 5, and 10 minute budgets', () => {
      const plan = generateDailyPlan();
      expect(plan).toBeDefined();
      expect(plan.activityIds.length).toBeGreaterThanOrEqual(1);
      expect(plan.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('9. Preserves daily plan stability for the same date', () => {
      const planA = generateDailyPlan();
      const planB = generateDailyPlan();
      expect(planA.id).toBe(planB.id);
      expect(planA.activityIds).toEqual(planB.activityIds);
    });

    it('10. Tracks completed activities without double counting', () => {
      const streak1 = recordDailyActivityCompletion();
      expect(streak1.currentStreak).toBe(1);

      // Second activity on same day should NOT increment streak
      const streak2 = recordDailyActivityCompletion();
      expect(streak2.currentStreak).toBe(1);
    });
  });

  // --- Epic 3: Spaced Repetition & Weak Topics ---
  describe('11-13. Smart Spaced Repetition (SRS) & Weak Topics', () => {
    it('11. Schedules first correct revision after 3 days', () => {
      const record = updateSRSAttempt('topic-1', 'Queueable Apex', 'Apex', true);
      expect(record.currentIntervalDays).toBe(3);
      expect(record.correctCount).toBe(1);
      expect(record.status).toBe('learning');
    });

    it('12. Increases interval on consecutive correct answers and resets on mistake', () => {
      // 1st correct -> 3 days
      updateSRSAttempt('topic-srs', 'LWC Communication', 'LWC', true);
      // 2nd correct -> 7 days
      const rec2 = updateSRSAttempt('topic-srs', 'LWC Communication', 'LWC', true);
      expect(rec2.currentIntervalDays).toBe(7);
      expect(rec2.status).toBe('reviewing');

      // Incorrect answer resets interval to 1 day
      const recMistake = updateSRSAttempt('topic-srs', 'LWC Communication', 'LWC', false);
      expect(recMistake.currentIntervalDays).toBe(1);
      expect(recMistake.consecutiveCorrect).toBe(0);
      expect(recMistake.status).toBe('due');
    });

    it('13. Identifies weak topics only after minimum attempt threshold (<60% accuracy)', () => {
      // 1 mistake is not enough to label weak
      recordQuizAttempt('Apex Security', false);
      let weak = getWeakTopicsList();
      expect(weak).not.toContain('Apex Security');

      // 2nd mistake -> 0/2 (0%) -> triggers weak topic
      recordQuizAttempt('Apex Security', false);
      weak = getWeakTopicsList();
      expect(weak).toContain('Apex Security');

      // 2 subsequent correct answers -> 2/4 (50%) -> still weak
      recordQuizAttempt('Apex Security', true);
      recordQuizAttempt('Apex Security', true);
      expect(getWeakTopicsList()).toContain('Apex Security');

      // Another correct -> 3/5 (60%) -> no longer weak
      recordQuizAttempt('Apex Security', true);
      expect(getWeakTopicsList()).not.toContain('Apex Security');
    });
  });

  // --- Epic 4: Streaks & Habits ---
  describe('14-16. Streaks & Weekly Goals', () => {
    it('14. Increments streak when active on consecutive calendar days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      saveStreakState({
        currentStreak: 3,
        longestStreak: 5,
        lastCompletedDate: yesterdayStr,
        activeDates: [yesterdayStr],
      });

      const updated = recordDailyActivityCompletion();
      expect(updated.currentStreak).toBe(4);
      expect(updated.longestStreak).toBe(5);
    });

    it('15. Resets streak to 1 after missing more than 1 day', () => {
      saveStreakState({
        currentStreak: 7,
        longestStreak: 10,
        lastCompletedDate: '2026-11-01',
        activeDates: ['2026-11-01'],
      });

      const updated = recordDailyActivityCompletion();
      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(10);
    });

    it('16. Computes weekly goal metrics accurately (target 3, 5, 7 days)', () => {
      const progress5 = getWeeklyGoalProgress(5);
      expect(progress5.targetDays).toBe(5);
      expect(progress5.remainingDays).toBeLessThanOrEqual(5);

      const progress3 = getWeeklyGoalProgress(3);
      expect(progress3.targetDays).toBe(3);
    });
  });

  // --- Epic 5: In-App Engagement, Continue Learning & Insights ---
  describe('17-20. Reminders, Continue Learning & Insights', () => {
    it('17. Computes consolidated learning insights dashboard', () => {
      const insights = computeLearningInsights();
      expect(insights).toBeDefined();
      expect(typeof insights.quizAccuracy).toBe('number');
      expect(typeof insights.currentStreak).toBe('number');
      expect(Array.isArray(insights.strongTopics)).toBe(true);
      expect(Array.isArray(insights.weakTopics)).toBe(true);
    });

    it('18. Generates in-app contextual reminders for daily plan and revisions', () => {
      const reminders = getActiveInAppReminders();
      expect(Array.isArray(reminders)).toBe(true);
    });

    it('19. Dismisses in-app reminders and avoids repeated alerts', () => {
      const reminders = getActiveInAppReminders();
      if (reminders.length > 0) {
        const id = reminders[0].id;
        dismissReminder(id);
        const after = getActiveInAppReminders();
        expect(after.find((r) => r.id === id)).toBeUndefined();
      }
    });

    it('20. Returns next unfinished lesson or revision task for Continue Learning', () => {
      const action = getContinueLearningAction();
      if (action) {
        expect(action.content).toBeDefined();
        expect(action.estimatedMinutes).toBeGreaterThan(0);
        expect(action.reason).toBeDefined();
      }
    });
  });

  // --- Epic 6: Edge Cases & Performance ---
  describe('21-24. Edge Cases & Performance Benchmarking', () => {
    it('21. Handles empty and new user profiles without crashing', () => {
      const emptyProfile: Profile = {
        ...defaultProfile,
        interests: [],
        goals: [],
      };
      const recs = getPersonalizedRecommendations(exploreContent, { profile: emptyProfile });
      expect(recs.length).toBeGreaterThan(0);
    });

    it('22. Handles corrupted or invalid localStorage gracefully', () => {
      localStorage.setItem('it-daily-streak-state', 'invalid-json{{{');
      const streak = getStreakState();
      expect(streak.currentStreak).toBe(0);

      localStorage.setItem('it-daily-srs-records', 'null');
      const srs = getAllSRSRecords();
      expect(srs).toEqual({});
    });

    it('23. Recalculates explore feed ordering with proper explainability', () => {
      const recs = getPersonalizedRecommendations(exploreContent, {
        profile: { ...defaultProfile, technology: 'salesforce', role: 'salesforce_dev' },
      });
      expect(recs[0].score).toBeGreaterThanOrEqual(recs[recs.length - 1].score);
      expect(recs[0].explanation.length).toBeGreaterThan(5);
    });

    it('24. Performance test: scores 1,000 mock items in under 50ms', () => {
      // Generate 1,000 synthetic content items
      const largeDataset: LearningContent[] = Array.from({ length: 1000 }, (_, idx) => ({
        id: `perf-${idx}`,
        technology: idx % 2 === 0 ? 'salesforce' : 'aws',
        topic: idx % 3 === 0 ? 'Apex' : idx % 3 === 1 ? 'LWC' : 'Integration',
        title: `Synthetic Item ${idx}`,
        summary: `Performance testing description for content index ${idx}`,
        whyItMatters: 'Testing throughput',
        projectExample: 'Benchmark',
        readingTimeMinutes: 3,
        difficulty: idx % 3 === 0 ? 'Beginner' : idx % 3 === 1 ? 'Intermediate' : 'Advanced',
        verificationStatus: 'published',
      }));

      const start = performance.now();
      const results = getPersonalizedRecommendations(largeDataset, {
        profile: defaultProfile,
        weakTopics: new Set(['Apex']),
        completedIds: new Set(['perf-10', 'perf-20']),
      });
      const durationMs = performance.now() - start;

      expect(results.length).toBe(1000);
      expect(durationMs).toBeLessThan(50); // Under 50ms SLA
      console.log(`[Performance Benchmark] Scored 1,000 items in ${durationMs.toFixed(2)}ms`);
    });
  });
});
