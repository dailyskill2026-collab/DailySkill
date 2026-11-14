// src/repositories/mock/MockBookmarkRepository.ts
import type { IBookmarkRepository } from '../types';

export class MockBookmarkRepository implements IBookmarkRepository {
  private storageKey = 'it-daily-bookmarks';

  private getStorageKey(uid?: string): string {
    if (!uid || uid === 'guest-user' || uid === 'default-user') {
      return this.storageKey;
    }
    return `${this.storageKey}-${uid}`;
  }

  async getBookmarks(uid: string): Promise<string[]> {
    try {
      const stored = localStorage.getItem(this.getStorageKey(uid));
      if (stored) {
        const parsed = JSON.parse(stored);
        const list = parsed.state?.bookmarks || parsed.bookmarks || [];
        return Array.isArray(list) ? list : Array.from(list);
      }
    } catch {
      // fallback
    }
    return [];
  }

  async toggleBookmark(uid: string, contentId: string): Promise<boolean> {
    const list = await this.getBookmarks(uid);
    const set = new Set(list);
    let bookmarked = false;
    if (set.has(contentId)) {
      set.delete(contentId);
      bookmarked = false;
    } else {
      set.add(contentId);
      bookmarked = true;
    }
    try {
      localStorage.setItem(
        this.getStorageKey(uid),
        JSON.stringify({ state: { bookmarks: Array.from(set) } })
      );
    } catch {
      // ignore
    }
    return bookmarked;
  }

  async isBookmarked(uid: string, contentId: string): Promise<boolean> {
    const list = await this.getBookmarks(uid);
    return list.includes(contentId);
  }
}
