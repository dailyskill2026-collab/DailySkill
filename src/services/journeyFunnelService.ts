// src/services/journeyFunnelService.ts
import { repositories } from '@/repositories';
import type { FunnelStage } from '@/types/analytics';

export class JourneyFunnelService {
  private static instance: JourneyFunnelService;

  static getInstance(): JourneyFunnelService {
    if (!JourneyFunnelService.instance) {
      JourneyFunnelService.instance = new JourneyFunnelService();
    }
    return JourneyFunnelService.instance;
  }

  async getFunnelStages(options?: {
    includeSimulated?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<FunnelStage[]> {
    const events = await repositories.analytics.getEvents(options);

    const stageUsers: Record<string, Set<string>> = {
      app_open: new Set(),
      onboarding: new Set(),
      today_dashboard: new Set(),
      lesson_started: new Set(),
      lesson_completed: new Set(),
      mcq_attempted: new Set(),
      revision_completed: new Set(),
      goal_completed: new Set(),
    };

    for (const evt of events) {
      const uId = evt.mockUserId;

      if (evt.eventType === 'app_opened') {
        stageUsers.app_open.add(uId);
        if (evt.screen === 'today' || !evt.screen) {
          stageUsers.today_dashboard.add(uId);
        }
      }

      if (evt.eventType === 'onboarding_completed' || evt.eventType === 'onboarding_started') {
        stageUsers.app_open.add(uId);
        stageUsers.onboarding.add(uId);
      }

      if (evt.eventType === 'lesson_started') {
        stageUsers.app_open.add(uId);
        stageUsers.today_dashboard.add(uId);
        stageUsers.lesson_started.add(uId);
      }

      if (evt.eventType === 'lesson_completed') {
        stageUsers.app_open.add(uId);
        stageUsers.today_dashboard.add(uId);
        stageUsers.lesson_started.add(uId);
        stageUsers.lesson_completed.add(uId);
      }

      if (evt.eventType === 'quiz_started' || evt.eventType === 'quiz_completed') {
        stageUsers.app_open.add(uId);
        stageUsers.today_dashboard.add(uId);
        stageUsers.mcq_attempted.add(uId);
      }

      if (evt.eventType === 'revision_completed') {
        stageUsers.app_open.add(uId);
        stageUsers.today_dashboard.add(uId);
        stageUsers.revision_completed.add(uId);
      }

      if (evt.eventType === 'learning_goal_completed') {
        stageUsers.app_open.add(uId);
        stageUsers.today_dashboard.add(uId);
        stageUsers.goal_completed.add(uId);
      }
    }

    const stagesConfig = [
      { id: 'app_open', name: 'App Open' },
      { id: 'onboarding', name: 'Onboarding' },
      { id: 'today_dashboard', name: 'Today Dashboard' },
      { id: 'lesson_started', name: 'Lesson Started' },
      { id: 'lesson_completed', name: 'Lesson Completed' },
      { id: 'mcq_attempted', name: 'MCQ Attempted' },
      { id: 'revision_completed', name: 'Revision Completed' },
      { id: 'goal_completed', name: 'Daily Goal Completed' },
    ];

    const topOfFunnelCount = stageUsers.app_open.size;
    const stages: FunnelStage[] = [];

    for (let i = 0; i < stagesConfig.length; i++) {
      const cfg = stagesConfig[i];
      const count = stageUsers[cfg.id].size;
      const nextCount = i < stagesConfig.length - 1 ? stageUsers[stagesConfig[i + 1].id].size : 0;

      const dropOffCount = Math.max(0, count - nextCount);
      const dropOffRate = count > 0 && i < stagesConfig.length - 1
        ? Math.round((dropOffCount / count) * 100)
        : 0;

      const conversionRate = topOfFunnelCount > 0
        ? Math.round((count / topOfFunnelCount) * 100)
        : 0;

      stages.push({
        stageId: cfg.id,
        stageName: cfg.name,
        userCount: count,
        dropOffCount,
        dropOffRate,
        conversionRate,
      });
    }

    return stages;
  }
}

export const journeyFunnelService = JourneyFunnelService.getInstance();
