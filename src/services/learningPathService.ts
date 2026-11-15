import { mockLearningPaths } from '@/data';
import type { LearningPath } from '@/types';
import { recordDailyActivityCompletion } from './streakService';
import { useProgressStore } from '@/store/progressStore';

const STORAGE_KEY = 'it-daily-learning-paths-progress';

// Map of pathId -> array of completed lesson IDs
export type LearningPathProgressMap = Record<string, string[]>;

class LearningPathService {
  private getStore(): LearningPathProgressMap {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private saveStore(store: LearningPathProgressMap) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore local storage errors
    }
  }

  /**
   * Get all learning paths with dynamic real-time completed lesson counts.
   * For fresh users who have not completed lessons, counts start cleanly at 0.
   */
  public getPaths(): LearningPath[] {
    const store = this.getStore();

    return mockLearningPaths.map((p) => {
      const completedList = store[p.id] || [];
      const completedCount = completedList.length;
      return {
        ...p,
        completedLessons: Math.min(p.totalLessons, completedCount)
      };
    });
  }

  public getCompletedLessons(pathId: string): string[] {
    const store = this.getStore();
    return store[pathId] || [];
  }

  public isLessonCompleted(pathId: string, lessonId: string): boolean {
    const completed = this.getCompletedLessons(pathId);
    return completed.includes(lessonId);
  }

  /**
   * Mark a lesson inside a learning path as completed.
   * Updates local storage, activates today's streak, and registers progress.
   */
  public completeLesson(pathId: string, lessonId: string) {
    const store = this.getStore();
    const current = new Set(store[pathId] || []);
    const isNew = !current.has(lessonId);
    current.add(lessonId);
    store[pathId] = Array.from(current);
    this.saveStore(store);

    // Record streak activity & daily progress
    try {
      recordDailyActivityCompletion();
    } catch {
      // ignore streak errors
    }

    useProgressStore.getState().setProgress({
      activityId: `lp-${pathId}-${lessonId}`,
      status: 'completed',
      score: 100,
      timeSpentSeconds: 180,
      completedAt: new Date().toISOString()
    });

    const targetPath = mockLearningPaths.find((p) => p.id === pathId);
    const total = targetPath ? targetPath.totalLessons : 20;
    const newCount = store[pathId].length;

    return {
      isNewCompletion: isNew,
      newCount,
      total,
      pathCompleted: newCount >= total
    };
  }

  /**
   * Reset path progress (useful for testing or profile resets)
   */
  public resetProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  /**
   * Get overall aggregated progress across all paths.
   */
  public getOverallProgress() {
    const paths = this.getPaths();
    const totalCompleted = paths.reduce((sum, p) => sum + p.completedLessons, 0);
    const totalLessons = paths.reduce((sum, p) => sum + p.totalLessons, 0);
    const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

    const inProgress = paths.filter((p) => p.completedLessons > 0 && p.completedLessons < p.totalLessons);
    const completed = paths.filter((p) => p.completedLessons >= p.totalLessons && p.totalLessons > 0);

    return {
      totalCompleted,
      totalLessons,
      overallPercent,
      pathsInProgress: inProgress.length,
      pathsCompleted: completed.length,
      inProgressPaths: inProgress,
      allPaths: paths
    };
  }
}

export const learningPathService = new LearningPathService();
