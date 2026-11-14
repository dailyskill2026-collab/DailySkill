// src/services/metricsService.ts
import { repositories } from '@/repositories';
import type { AnalyticsEvent, EngagementSummary, RetentionCohort } from '@/types/analytics';

export class MetricsService {
  private static instance: MetricsService;

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  async getEngagementSummary(options?: {
    includeSimulated?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<EngagementSummary> {
    const events = await repositories.analytics.getEvents(options);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    // DAU: users with active learning events today
    const dauUsers = new Set<string>();
    // WAU: users with active learning events in last 7 days
    const wauUsers = new Set<string>();

    let lessonsStarted = 0;
    let lessonsCompleted = 0;
    let quizAttempts = 0;
    let quizCorrect = 0;
    let revisionsCompleted = 0;

    const userSessions: Record<string, Set<string>> = {};
    const userGoalsCompleted = new Set<string>();
    const totalDistinctUsers = new Set<string>();

    for (const evt of events) {
      const uId = evt.mockUserId;
      totalDistinctUsers.add(uId);

      // Track sessions
      if (!userSessions[uId]) userSessions[uId] = new Set();
      userSessions[uId].add(evt.sessionId);

      const evtDate = evt.timestamp.split('T')[0];
      const evtTime = new Date(evt.timestamp).getTime();

      const isActiveEvent =
        evt.eventType === 'lesson_completed' ||
        evt.eventType === 'quiz_completed' ||
        evt.eventType === 'revision_completed' ||
        evt.eventType === 'lesson_started' ||
        evt.eventType === 'app_opened';

      if (isActiveEvent) {
        if (evtDate === todayStr) {
          dauUsers.add(uId);
        }
        if (evtTime >= sevenDaysAgoMs) {
          wauUsers.add(uId);
        }
      }

      if (evt.eventType === 'lesson_started') lessonsStarted++;
      if (evt.eventType === 'lesson_completed') lessonsCompleted++;

      if (evt.eventType === 'quiz_completed') {
        quizAttempts++;
        if (evt.relevantMetadata?.isCorrect === true) {
          quizCorrect++;
        }
      }

      if (evt.eventType === 'revision_completed') {
        revisionsCompleted++;
      }

      if (evt.eventType === 'learning_goal_completed') {
        userGoalsCompleted.add(uId);
      }
    }

    const lessonCompletionRate =
      lessonsStarted > 0 ? Math.round((lessonsCompleted / lessonsStarted) * 100) : 0;

    const quizAccuracy =
      quizAttempts > 0 ? Math.round((quizCorrect / quizAttempts) * 100) : 0;

    let totalSessions = 0;
    for (const sessSet of Object.values(userSessions)) {
      totalSessions += sessSet.size;
    }
    const averageSessionsPerUser =
      totalDistinctUsers.size > 0
        ? Math.round((totalSessions / totalDistinctUsers.size) * 10) / 10
        : 0;

    const weeklyGoalCompletionRate =
      totalDistinctUsers.size > 0
        ? Math.round((userGoalsCompleted.size / totalDistinctUsers.size) * 100)
        : 0;

    return {
      dau: dauUsers.size,
      wau: wauUsers.size,
      lessonsStarted,
      lessonsCompleted,
      lessonCompletionRate,
      quizAttempts,
      quizAccuracy,
      revisionsCompleted,
      averageSessionsPerUser,
      weeklyGoalCompletionRate,
      totalEventsCount: events.length,
      isSimulatedIncluded: options?.includeSimulated ?? true,
    };
  }

  async getRetentionCohorts(
    includeSimulated = true,
    referenceDate = new Date()
  ): Promise<RetentionCohort[]> {
    const events = await repositories.analytics.getEvents({ includeSimulated });

    // Group user activity by date
    const userFirstActiveDate: Record<string, string> = {};
    const userActiveDates: Record<string, Set<string>> = {};

    // Sort events chronologically
    const sorted = [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const evt of sorted) {
      const dateStr = evt.timestamp.split('T')[0];
      const uId = evt.mockUserId;

      if (!userFirstActiveDate[uId]) {
        userFirstActiveDate[uId] = dateStr;
      }
      if (!userActiveDates[uId]) {
        userActiveDates[uId] = new Set();
      }
      userActiveDates[uId].add(dateStr);
    }

    // Cohorts grouped by first active date
    const cohortUsers: Record<string, Set<string>> = {};
    for (const [uId, firstDate] of Object.entries(userFirstActiveDate)) {
      if (!cohortUsers[firstDate]) {
        cohortUsers[firstDate] = new Set();
      }
      cohortUsers[firstDate].add(uId);
    }

    const refTime = referenceDate.getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const cohorts: RetentionCohort[] = [];

    // Sort cohort dates descending
    const sortedDates = Object.keys(cohortUsers).sort().reverse();

    for (const cDate of sortedDates) {
      const usersInCohort = Array.from(cohortUsers[cDate]);
      const cohortTime = new Date(cDate + 'T00:00:00Z').getTime();
      const elapsedDays = Math.floor((refTime - cohortTime) / MS_PER_DAY);

      // Day 1 check (cDate + 1 day)
      const day1Target = new Date(cohortTime + 1 * MS_PER_DAY).toISOString().split('T')[0];
      let day1RetainedCount: number | null = null;
      let day1RetentionRate: number | null = null;

      if (elapsedDays >= 1) {
        const retained1 = usersInCohort.filter((u) => userActiveDates[u]?.has(day1Target)).length;
        day1RetainedCount = retained1;
        day1RetentionRate =
          usersInCohort.length > 0 ? Math.round((retained1 / usersInCohort.length) * 100) : 0;
      }

      // Day 7 check (cDate + 7 days)
      const day7Target = new Date(cohortTime + 7 * MS_PER_DAY).toISOString().split('T')[0];
      let day7RetainedCount: number | null = null;
      let day7RetentionRate: number | null = null;

      if (elapsedDays >= 7) {
        const retained7 = usersInCohort.filter((u) => userActiveDates[u]?.has(day7Target)).length;
        day7RetainedCount = retained7;
        day7RetentionRate =
          usersInCohort.length > 0 ? Math.round((retained7 / usersInCohort.length) * 100) : 0;
      }

      cohorts.push({
        cohortDate: cDate,
        userCount: usersInCohort.length,
        day1RetainedCount,
        day1RetentionRate,
        day7RetainedCount,
        day7RetentionRate,
        isComplete: elapsedDays >= 7,
      });
    }

    return cohorts;
  }
}

export const metricsService = MetricsService.getInstance();
