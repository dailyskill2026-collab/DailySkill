// src/repositories/mock/MockUserRepository.ts
import type { IUserRepository, GuestSnapshot } from '../types';
import { type Profile, defaultProfile } from '@/store/profileStore';

export class MockUserRepository implements IUserRepository {
  private storageKey = 'it-daily-profile';

  async getProfile(_uid: string): Promise<Profile | null> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.state || parsed;
      }
    } catch {
      // fallback
    }
    return defaultProfile;
  }

  async saveProfile(_uid: string, patch: Partial<Profile>): Promise<void> {
    try {
      const current = (await this.getProfile(_uid)) || defaultProfile;
      const updated = { ...current, ...patch };
      localStorage.setItem(this.storageKey, JSON.stringify({ state: updated, version: 0 }));
    } catch {
      // ignore
    }
  }

  async migrateGuestData(uid: string, guestData: GuestSnapshot): Promise<void> {
    await this.saveProfile(uid, guestData.profile);
  }
}
