// src/services/learningInsightsService.ts
/**
 * Learning Insights Service.
 * Computes consolidated learning retention and performance analytics.
 */

import { getQuizAttempts, analyzeTopicPerformance } from './weakTopicService';
import { getStreakState, getWeeklyGoalProgress, WeeklyGoalSummary } from './streakService';
import { getAllSRSRecords } from './spacedRepetition';
import { useProgressStore } from '@/store/progressStore';
import { useProfileStore } from '@/store/profileStore';

export interface LearningInsights {
  lessonsCompleted: number;
  quizAccuracy: number;
  totalQuizAttempts: number;
  activeDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: WeeklyGoalSummary;
  strongTopics: string[];
  weakTopics: string[];
  totalMasteredTopics: number;
  isDemoData: boolean;
}

export function computeLearningInsights(): LearningInsights {
  const profile = useProfileStore.getState();
  const progress = useProgressStore.getState().dailyProgress;
  const attempts = getQuizAttempts();
  const streak = getStreakState();
  const srsRecords = getAllSRSRecords();
  const weekly = getWeeklyGoalProgress(profile.weeklyGoal || 5);

  const lessonsCompleted = Object.values(progress).filter((p) => p.status === 'completed').length;

  let totalAttempts = attempts.length;
  let correctCount = attempts.filter((a) => a.isCorrect).length;

  // Fallback demo data if user has no attempts yet
  let isDemoData = false;
  if (totalAttempts === 0 && profile.isGuest) {
    totalAttempts = 5;
    correctCount = 4;
    isDemoData = true;
  }

  const quizAccuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  const topicPerf = analyzeTopicPerformance(attempts);
  const strongTopics: string[] = [];
  const weakTopics: string[] = [];

  Object.values(topicPerf).forEach((p) => {
    if (p.attempts >= 2) {
      if (p.accuracy >= 70) strongTopics.push(p.topic);
      else if (p.accuracy < 60) weakTopics.push(p.topic);
    }
  });

  const totalMasteredTopics = Object.values(srsRecords).filter((r) => r.status === 'mastered').length;

  return {
    lessonsCompleted,
    quizAccuracy,
    totalQuizAttempts: totalAttempts,
    activeDaysCount: streak.activeDates.length,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    weeklyGoal: weekly,
    strongTopics,
    weakTopics,
    totalMasteredTopics,
    isDemoData,
  };
}
