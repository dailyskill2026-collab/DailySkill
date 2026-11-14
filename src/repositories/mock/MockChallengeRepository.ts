// src/repositories/mock/MockChallengeRepository.ts
import type { IChallengeRepository } from '../types';
import type { LearningChallenge } from '@/types/challenge';

const CHALLENGES_KEY = 'ds_challenges';

export class MockChallengeRepository implements IChallengeRepository {
  private challengesMap: Record<string, LearningChallenge[]> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(CHALLENGES_KEY);
      if (raw) this.challengesMap = JSON.parse(raw);
    } catch {
      this.challengesMap = {};
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(this.challengesMap));
    } catch {}
  }

  private getUserKey(userId: string, period: string, periodKey: string): string {
    return `${userId}_${period}_${periodKey}`;
  }

  async getChallenges(
    userId: string,
    period: 'daily' | 'weekly',
    periodKey: string
  ): Promise<LearningChallenge[]> {
    this.loadFromStorage();
    const key = this.getUserKey(userId, period, periodKey);
    return this.challengesMap[key] || [];
  }

  async saveChallenges(userId: string, challenges: LearningChallenge[]): Promise<void> {
    if (!challenges.length) return;
    this.loadFromStorage();
    const first = challenges[0];
    const key = this.getUserKey(userId, first.type, first.periodKey);
    this.challengesMap[key] = challenges;
    this.saveToStorage();
  }

  async updateChallenge(
    userId: string,
    challengeId: string,
    updates: Partial<LearningChallenge>
  ): Promise<LearningChallenge> {
    this.loadFromStorage();
    for (const key of Object.keys(this.challengesMap)) {
      if (key.startsWith(userId)) {
        const list = this.challengesMap[key];
        const item = list.find((c) => c.challengeId === challengeId);
        if (item) {
          Object.assign(item, updates);
          if (item.currentCount >= item.targetCount) {
            item.isCompleted = true;
          }
          this.saveToStorage();
          return { ...item };
        }
      }
    }
    throw new Error(`Challenge ${challengeId} not found.`);
  }
}
