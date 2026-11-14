// src/repositories/mock/MockProgressRepository.ts
import type { IProgressRepository } from '../types';
import type { LearningProgress } from '@/types/learning';

export class MockProgressRepository implements IProgressRepository {
  private storageKey = 'it-daily-progress';

  async getProgress(_uid: string): Promise<Record<string, LearningProgress>> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.state?.dailyProgress || parsed.dailyProgress || {};
      }
    } catch {
      // fallback
    }
    return {};
  }

  async saveProgress(_uid: string, progress: LearningProgress): Promise<void> {
    const current = await this.getProgress(_uid);
    current[progress.activityId] = progress;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({ state: { dailyProgress: current } }));
    } catch {
      // ignore
    }
  }

  async resetDaily(_uid: string): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({ state: { dailyProgress: {} } }));
    } catch {
      // ignore
    }
  }
}
