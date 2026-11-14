// src/repositories/mock/MockAchievementRepository.ts
import type { IAchievementRepository } from '../types';
import type { UserAchievement } from '@/types/challenge';

const ACHIEVEMENTS_KEY = 'ds_achievements';

const INITIAL_ACHIEVEMENTS: Omit<UserAchievement, 'earnedAt'>[] = [
  {
    achievementId: 'first_assessment',
    title: 'First Milestone',
    description: 'Completed your first technical skill assessment.',
    icon: '🏆',
    eligibilityRule: 'complete_1_assessment',
  },
  {
    achievementId: 'sharp_mind',
    title: 'Sharp Mind',
    description: 'Scored 80% or higher on an assessment.',
    icon: '🎯',
    eligibilityRule: 'score_80_percent',
  },
  {
    achievementId: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Completed 5 lessons in your learning journey.',
    icon: '📚',
    eligibilityRule: 'complete_5_lessons',
  },
  {
    achievementId: 'quiz_veteran',
    title: 'Quiz Veteran',
    description: 'Answered 10 assessment questions correctly.',
    icon: '🧠',
    eligibilityRule: 'correct_10_questions',
  },
  {
    achievementId: 'habit_builder',
    title: 'Habit Builder',
    description: 'Maintained a 3-day active learning streak.',
    icon: '🔥',
    eligibilityRule: 'streak_3_days',
  },
  {
    achievementId: 'skill_upgrader',
    title: 'Skill Upgrader',
    description: 'Retook an assessment and improved your score by 15% or more.',
    icon: '🚀',
    eligibilityRule: 'improve_score_15_percent',
  },
];

export class MockAchievementRepository implements IAchievementRepository {
  private userAchievements: Record<string, UserAchievement[]> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (raw) this.userAchievements = JSON.parse(raw);
    } catch {
      this.userAchievements = {};
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.userAchievements));
    } catch {}
  }

  async getAchievements(userId: string): Promise<UserAchievement[]> {
    this.loadFromStorage();
    if (!this.userAchievements[userId]) {
      // Initialize with unearned list
      this.userAchievements[userId] = INITIAL_ACHIEVEMENTS.map((a) => ({
        ...a,
        earnedAt: null,
      }));
      this.saveToStorage();
    }
    return [...this.userAchievements[userId]];
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const list = await this.getAchievements(userId);
    const item = list.find((a) => a.achievementId === achievementId);
    if (!item) {
      throw new Error(`Achievement ${achievementId} not found.`);
    }

    if (!item.earnedAt) {
      item.earnedAt = new Date().toISOString();
      this.saveToStorage();
    }
    return { ...item };
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    return this.awardAchievement(userId, achievementId);
  }

  async resetAchievements(userId: string): Promise<void> {
    this.loadFromStorage();
    delete this.userAchievements[userId];
    this.saveToStorage();
  }
}
