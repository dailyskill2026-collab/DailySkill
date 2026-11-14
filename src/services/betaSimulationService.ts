// src/services/betaSimulationService.ts
import { repositories } from '@/repositories';
import { sampleLearningContent } from '@/data/sampleContent';

export interface BetaProfile {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  interests: string[];
  dailyDurationBudget: number;
  expectedQuizAccuracy: number; // 0-1
  retentionPattern: number[]; // Day offsets on which the user is active, e.g. [0, 1, 3, 7]
  feedbackToSubmit?: {
    category: 'bug_report' | 'feature_suggestion' | 'content_issue';
    description: string;
    contentId?: string;
  };
}

export const BETA_PROFILES: BetaProfile[] = [
  {
    id: 'sim-user-fresher-1',
    name: 'Aarav Patel (Fresher)',
    role: 'salesforce_admin',
    experienceYears: 0.5,
    interests: ['Salesforce Admin', 'Apex Basics', 'Validation Rules'],
    dailyDurationBudget: 5,
    expectedQuizAccuracy: 0.6,
    retentionPattern: [0, 1, 2, 3, 4, 7], // highly engaged daily learner
    feedbackToSubmit: {
      category: 'feature_suggestion',
      description: 'Please add more beginner-friendly flashcards for SOQL queries.',
    },
  },
  {
    id: 'sim-user-dev-2',
    name: 'Pooja Sharma (Developer)',
    role: 'salesforce_developer',
    experienceYears: 3,
    interests: ['LWC', 'Queueable Apex', 'Integrations'],
    dailyDurationBudget: 5,
    expectedQuizAccuracy: 0.85,
    retentionPattern: [0, 1, 3, 5, 7],
    feedbackToSubmit: {
      category: 'content_issue',
      description: 'Queueable Apex limit explanation was clear but could mention Finalizer support.',
      contentId: 'sf-update-2024-07-queueable',
    },
  },
  {
    id: 'sim-user-senior-3',
    name: 'Vikram Joshi (Senior Dev)',
    role: 'salesforce_developer',
    experienceYears: 7,
    interests: ['Architecture', 'Enterprise Integrations', 'Core Releases'],
    dailyDurationBudget: 10,
    expectedQuizAccuracy: 0.95,
    retentionPattern: [0, 1, 2, 7],
    feedbackToSubmit: {
      category: 'bug_report',
      description: 'Dark mode contrast on code blocks in Explore screen could be improved.',
    },
  },
  {
    id: 'sim-user-admin-4',
    name: 'Sneha Kulkarni (Administrator)',
    role: 'salesforce_admin',
    experienceYears: 4,
    interests: ['Flows', 'Security', 'User Management'],
    dailyDurationBudget: 5,
    expectedQuizAccuracy: 0.75,
    retentionPattern: [0, 1, 4, 7],
    feedbackToSubmit: {
      category: 'content_issue',
      description: 'Flow trigger order documentation references Winter 23 instead of latest release.',
      contentId: 'sf-update-0000-stay-updated',
    },
  },
  {
    id: 'sim-user-busy-5',
    name: 'Rohan Mehta (Busy Pro)',
    role: 'salesforce_developer',
    experienceYears: 5,
    interests: ['Quick Updates', 'Release Highlights'],
    dailyDurationBudget: 3,
    expectedQuizAccuracy: 0.8,
    retentionPattern: [0, 1, 7], // 3-min budget, checks on day 1 & 7
  },
];

export class BetaSimulationService {
  private static instance: BetaSimulationService;

  static getInstance(): BetaSimulationService {
    if (!BetaSimulationService.instance) {
      BetaSimulationService.instance = new BetaSimulationService();
    }
    return BetaSimulationService.instance;
  }

  /**
   * Runs the simulation across all 5 profiles starting from a baseDate (default: 8 days ago)
   * so Day 1 and Day 7 retention windows are mature and fully calculable.
   */
  async runBetaSimulation(baseDateDaysAgo = 8): Promise<{
    profilesSimulated: number;
    eventsGenerated: number;
    feedbackGenerated: number;
  }> {
    const now = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const cohortStartTime = now - baseDateDaysAgo * MS_PER_DAY;

    let eventsCount = 0;
    let feedbackCount = 0;

    for (const profile of BETA_PROFILES) {
      // 1. Day 0 Onboarding
      const day0Time = new Date(cohortStartTime + Math.random() * 3600000).toISOString();
      await repositories.analytics.recordEvent({
        eventType: 'app_opened',
        mockUserId: profile.id,
        sessionId: `sim-sess-${profile.id}-0`,
        timestamp: day0Time,
        screen: 'onboarding',
        isSimulated: true,
      });
      await repositories.analytics.recordEvent({
        eventType: 'onboarding_completed',
        mockUserId: profile.id,
        sessionId: `sim-sess-${profile.id}-0`,
        timestamp: new Date(new Date(day0Time).getTime() + 60000).toISOString(),
        screen: 'onboarding',
        relevantMetadata: { role: profile.role, experience: profile.experienceYears },
        isSimulated: true,
      });
      eventsCount += 2;

      // 2. Multi-day retention pattern activities
      for (const dayOffset of profile.retentionPattern) {
        const dayTime = new Date(
          cohortStartTime + dayOffset * MS_PER_DAY + Math.random() * 7200000
        ).toISOString();
        const sessId = `sim-sess-${profile.id}-d${dayOffset}`;

        // App open
        await repositories.analytics.recordEvent({
          eventType: 'app_opened',
          mockUserId: profile.id,
          sessionId: sessId,
          timestamp: dayTime,
          screen: 'today',
          isSimulated: true,
        });
        eventsCount++;

        // Select sample content matching user role/interest
        const lesson = sampleLearningContent[dayOffset % sampleLearningContent.length];

        // Lesson started & completed
        await repositories.analytics.recordEvent({
          eventType: 'lesson_started',
          mockUserId: profile.id,
          sessionId: sessId,
          timestamp: new Date(new Date(dayTime).getTime() + 10000).toISOString(),
          screen: 'today',
          relatedContentId: lesson.id,
          isSimulated: true,
        });
        await repositories.analytics.recordEvent({
          eventType: 'lesson_completed',
          mockUserId: profile.id,
          sessionId: sessId,
          timestamp: new Date(new Date(dayTime).getTime() + 120000).toISOString(),
          screen: 'today',
          relatedContentId: lesson.id,
          isSimulated: true,
        });
        eventsCount += 2;

        // Quiz attempt
        const isCorrect = Math.random() < profile.expectedQuizAccuracy;
        await repositories.analytics.recordEvent({
          eventType: 'quiz_started',
          mockUserId: profile.id,
          sessionId: sessId,
          timestamp: new Date(new Date(dayTime).getTime() + 130000).toISOString(),
          screen: 'today',
          relatedContentId: lesson.id,
          isSimulated: true,
        });
        await repositories.analytics.recordEvent({
          eventType: 'quiz_completed',
          mockUserId: profile.id,
          sessionId: sessId,
          timestamp: new Date(new Date(dayTime).getTime() + 180000).toISOString(),
          screen: 'today',
          relatedContentId: lesson.id,
          relevantMetadata: { isCorrect },
          isSimulated: true,
        });
        eventsCount += 2;

        // Revision if profile allows
        if (profile.dailyDurationBudget >= 5) {
          await repositories.analytics.recordEvent({
            eventType: 'revision_completed',
            mockUserId: profile.id,
            sessionId: sessId,
            timestamp: new Date(new Date(dayTime).getTime() + 240000).toISOString(),
            screen: 'revise',
            relatedContentId: 'sf-revision-basic-object',
            isSimulated: true,
          });
          eventsCount++;
        }

        // Daily goal completed event
        await repositories.analytics.recordEvent({
          eventType: 'learning_goal_completed',
          mockUserId: profile.id,
          sessionId: sessId,
          timestamp: new Date(new Date(dayTime).getTime() + 300000).toISOString(),
          screen: 'today',
          relevantMetadata: { dayOffset },
          isSimulated: true,
        });
        eventsCount++;
      }

      // 3. Feedback submission
      if (profile.feedbackToSubmit) {
        await repositories.feedback.submitFeedback({
          category: profile.feedbackToSubmit.category,
          description: profile.feedbackToSubmit.description,
          relatedContentId: profile.feedbackToSubmit.contentId,
          mockUserId: profile.id,
          rating: 4,
          status: 'new',
          priority: profile.feedbackToSubmit.category === 'bug_report' ? 'high' : 'medium',
          isSimulated: true,
        });
        feedbackCount++;
      }
    }

    return {
      profilesSimulated: BETA_PROFILES.length,
      eventsGenerated: eventsCount,
      feedbackGenerated: feedbackCount,
    };
  }

  async resetSimulationData(): Promise<void> {
    await repositories.analytics.clearEvents(true);
    await repositories.feedback.clearFeedback(true);
  }
}

export const betaSimulationService = BetaSimulationService.getInstance();
