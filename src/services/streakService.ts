// src/services/streakService.ts
/**
 * Learning Streak & Weekly Goal Tracker.
 * Manages daily consistency, prevents double counting, and calculates weekly goal progress.
 */

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  activeDates: string[]; // history of YYYY-MM-DD dates with completed activity
}

export interface WeeklyGoalSummary {
  targetDays: number;
  completedDays: number;
  remainingDays: number;
  completionPercent: number;
  isGoalMet: boolean;
}

const STREAK_STORAGE_KEY = 'it-daily-streak-state';

export function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
}

export function getStreakState(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    activeDates: [],
  };
}

export function saveStreakState(state: StreakState): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * Record a qualifying completed daily activity.
 * Idempotent for the current date.
 */
export function recordDailyActivityCompletion(): StreakState {
  const state = getStreakState();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // If already completed an activity today, return current state (no double counting)
  if (state.lastCompletedDate === today) {
    return state;
  }

  let newCurrentStreak = 1;

  if (state.lastCompletedDate === yesterday) {
    // Continued streak from yesterday
    newCurrentStreak = state.currentStreak + 1;
  } else if (state.lastCompletedDate === null) {
    // First ever completed activity
    newCurrentStreak = 1;
  } else {
    // Missed a day -> reset to 1
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(state.longestStreak, newCurrentStreak);
  const updatedActiveDates = state.activeDates.includes(today)
    ? state.activeDates
    : [...state.activeDates, today];

  const updatedState: StreakState = {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastCompletedDate: today,
    activeDates: updatedActiveDates,
  };

  saveStreakState(updatedState);
  return updatedState;
}

/**
 * Compute weekly goal metrics for the current calendar week (Sun-Sat or Mon-Sun).
 */
export function getWeeklyGoalProgress(targetDays = 5): WeeklyGoalSummary {
  const state = getStreakState();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday

  // Get current week start (Sunday)
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const sundayStr = sunday.toLocaleDateString('en-CA');

  // Count active days that fall within current week
  const activeThisWeek = state.activeDates.filter((dateStr) => dateStr >= sundayStr);
  const completedDays = Math.min(7, activeThisWeek.length);
  const remainingDays = Math.max(0, targetDays - completedDays);
  const completionPercent = Math.min(100, Math.round((completedDays / targetDays) * 100));

  return {
    targetDays,
    completedDays,
    remainingDays,
    completionPercent,
    isGoalMet: completedDays >= targetDays,
  };
}
