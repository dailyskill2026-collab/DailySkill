import { UserAchievement } from '../types/challenge';
import { AssessmentAttempt } from '../types/assessment';
import { achievementRepository, assessmentRepository } from '../repositories';
import { getStreakState } from './streakService';

export class AchievementService {
  /**
   * Retrieves all achievements with earned status for a user.
   */
  public async getAchievements(userId: string = 'mock-user-1'): Promise<UserAchievement[]> {
    return achievementRepository.getAchievements(userId);
  }

  /**
   * Evaluates criteria across assessments, streaks, and learning history,
   * unlocks eligible achievements, and returns any that were newly awarded.
   */
  public async evaluateAchievements(
    userId: string = 'mock-user-1',
    latestAttempt?: AssessmentAttempt
  ): Promise<UserAchievement[]> {
    const existing = await achievementRepository.getAchievements(userId);
    const attempts = await assessmentRepository.getAttempts(userId);
    const streak = getStreakState();

    const newlyEarned: UserAchievement[] = [];

    // Calculate aggregate assessment stats
    const totalAttempts = attempts.length;
    let maxScore = 0;
    let totalCorrectAnswers = 0;

    for (const a of attempts) {
      if (a.percentageScore > maxScore) maxScore = a.percentageScore;
      totalCorrectAnswers += a.correctQuestions;
    }

    // Check improvement across attempts of the same assessment / category
    let has15PercentImprovement = false;
    const categoryAttemptsMap = new Map<string, number[]>();
    for (const a of attempts) {
      const key = a.assessmentId || a.category || 'all';
      if (!categoryAttemptsMap.has(key)) {
        categoryAttemptsMap.set(key, []);
      }
      categoryAttemptsMap.get(key)!.push(a.percentageScore);
    }

    categoryAttemptsMap.forEach((scores) => {
      if (scores.length >= 2) {
        for (let i = 0; i < scores.length - 1; i++) {
          for (let j = i + 1; j < scores.length; j++) {
            if (scores[j] - scores[i] >= 15) {
              has15PercentImprovement = true;
              break;
            }
          }
        }
      }
    });

    for (const ach of existing) {
      if (ach.earnedAt) continue; // Already unlocked

      let eligible = false;

      switch (ach.eligibilityRule) {
        case 'complete_1_assessment':
          eligible = totalAttempts >= 1;
          break;

        case 'score_80_percent':
          eligible = maxScore >= 80;
          break;

        case 'correct_10_questions':
          eligible = totalCorrectAnswers >= 10;
          break;

        case 'streak_3_days':
          eligible = streak.currentStreak >= 3 || streak.longestStreak >= 3;
          break;

        case 'improve_score_15_percent':
          eligible = has15PercentImprovement;
          break;

        case 'complete_5_lessons':
          // 5 active days or 5 total interactions
          eligible = streak.activeDates.length >= 5 || totalAttempts >= 3;
          break;
      }

      if (eligible) {
        const unlocked = await achievementRepository.unlockAchievement(userId, ach.achievementId);
        newlyEarned.push(unlocked);
      }
    }

    return newlyEarned;
  }
}

export const achievementService = new AchievementService();
