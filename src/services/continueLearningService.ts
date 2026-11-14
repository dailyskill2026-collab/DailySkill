// src/services/continueLearningService.ts
import { generateDailyPlan, getContentById } from './dailyPlan';
import { useProgressStore } from '@/store/progressStore';
import type { LearningContent } from '@/types/learning';

export interface ContinueLearningItem {
  content: LearningContent;
  status: 'not_started' | 'in_progress';
  estimatedMinutes: number;
  reason: string;
}

export function getContinueLearningAction(): ContinueLearningItem | null {
  const plan = generateDailyPlan();
  const progress = useProgressStore.getState().dailyProgress;

  for (const id of plan.activityIds) {
    const item = getContentById(id);
    if (!item) continue;

    const userProgress = progress[id];
    if (!userProgress || userProgress.status !== 'completed') {
      return {
        content: item,
        status: userProgress?.status || 'not_started',
        estimatedMinutes: item.estimatedMinutes || 2,
        reason: userProgress?.status === 'in_progress' ? 'Resume in-progress lesson' : 'Next up in your daily plan',
      };
    }
  }

  return null;
}
