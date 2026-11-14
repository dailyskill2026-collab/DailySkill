import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type HistoryState = {
  viewed: Record<string, string>; // id -> ISO timestamp
  addViewed: (id: string) => void;
  getViewed: (id: string) => string | undefined;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      viewed: {},
      addViewed: (id: string) => {
        const ts = new Date().toISOString();
        set(state => ({ viewed: { ...state.viewed, [id]: ts } }));
      },
      getViewed: (id: string) => get().viewed[id],
    }),
    {
      name: 'it-daily-history',
    },
  ),
);
