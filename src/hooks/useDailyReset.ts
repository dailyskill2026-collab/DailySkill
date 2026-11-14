// src/hooks/useDailyReset.ts
import { useEffect } from 'react';
import { useProgressStore } from '@/store/progressStore';
import { generateDailyPlan } from '@/services/dailyPlan';

/**
 * Hook that checks the local calendar date on component mount.
 * If the date has changed since the last render, it clears the
 * progress store and forces a fresh daily plan generation.
 */
export const useDailyReset = () => {
  const { resetDay } = useProgressStore();

  useEffect(() => {
    const todayKey = new Date().toLocaleDateString('en-CA'); // YYYY‑MM‑DD
    const storedKey = localStorage.getItem('daily-last-date');
    if (storedKey !== todayKey) {
      // New day – clear progress and cached plan
      resetDay();
      // Remove any cached plan entries
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('daily-plan-')) localStorage.removeItem(k);
      });
      localStorage.setItem('daily-last-date', todayKey);
    }
    // also ensure a plan exists for today (generate will cache)
    generateDailyPlan();
  }, []);
};
