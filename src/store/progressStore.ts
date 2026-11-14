// src/store/progressStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningProgress } from '@/types/learning';

export const useProgressStore = create<{
  dailyProgress: Record<string, LearningProgress>;
  setProgress: (progress: LearningProgress) => void;
  resetDay: () => void;
}>(
  persist(
    (set, get) => ({
      dailyProgress: {},
      setProgress: (p) => {
        const current = get().dailyProgress;
        set({ dailyProgress: { ...current, [p.activityId]: p } });
      },
      resetDay: () => set({ dailyProgress: {} }),
    }),
    { name: 'it-daily-progress' },
  ),
);
