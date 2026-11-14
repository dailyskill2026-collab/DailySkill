import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BookmarkState = {
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: new Set(),
      toggleBookmark: (id: string) => {
        const current = new Set(get().bookmarks);
        if (current.has(id)) {
          current.delete(id);
        } else {
          current.add(id);
        }
        set({ bookmarks: current });
      },
      isBookmarked: (id: string) => get().bookmarks.has(id),
    }),
    {
      name: 'it-daily-bookmarks', // localStorage key
      // because Set is not serializable, we store as array and revive
      serialize: (state) => JSON.stringify({ ...state, bookmarks: Array.from(state.bookmarks) }),
      deserialize: (str) => {
        const obj = JSON.parse(str);
        return { ...obj, bookmarks: new Set(obj.bookmarks) };
      },
    },
  ),
);
