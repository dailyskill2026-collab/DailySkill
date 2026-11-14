// src/types/challenge.ts

export type ChallengePeriod = 'daily' | 'weekly';
export type ChallengeCategory = 'lesson' | 'mcq' | 'revision' | 'assessment' | 'streak';

export interface LearningChallenge {
  challengeId: string;
  type: ChallengePeriod;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  periodKey: string; // 'YYYY-MM-DD' for daily, 'YYYY-Wxx' for weekly
  category: ChallengeCategory;
}

export interface UserAchievement {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  eligibilityRule: string;
}
