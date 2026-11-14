// src/repositories/firebase/FirebaseUserRepository.ts
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import type { IUserRepository, GuestSnapshot } from '../types';
import { type Profile, defaultProfile } from '@/store/profileStore';
import { getFirebaseServices } from '@/lib/firebase';

export class FirebaseUserRepository implements IUserRepository {
  private getDb() {
    const services = getFirebaseServices();
    if (!services) {
      throw new Error('Firestore is not configured.');
    }
    return services.db;
  }

  async getProfile(uid: string): Promise<Profile | null> {
    const db = this.getDb();
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as Profile;
    }
    return defaultProfile;
  }

  async saveProfile(uid: string, profile: Partial<Profile>): Promise<void> {
    const db = this.getDb();
    const current = (await this.getProfile(uid)) || defaultProfile;
    const merged = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', uid), merged, { merge: true });
  }

  async migrateGuestData(uid: string, guestData: GuestSnapshot): Promise<void> {
    const db = this.getDb();
    const batch = writeBatch(db);

    // 1. Profile document
    const userRef = doc(db, 'users', uid);
    batch.set(userRef, {
      ...guestData.profile,
      isGuest: false,
      migratedFromGuestAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 2. Learning Progress subcollection
    Object.entries(guestData.dailyProgress).forEach(([activityId, progress]) => {
      const progressRef = doc(db, 'users', uid, 'progress', activityId);
      batch.set(progressRef, progress, { merge: true });
    });

    // 3. Bookmarks subcollection
    guestData.bookmarks.forEach((contentId) => {
      const bookmarkRef = doc(db, 'users', uid, 'bookmarks', contentId);
      batch.set(bookmarkRef, {
        contentId,
        savedAt: new Date().toISOString(),
      }, { merge: true });
    });

    // Commit atomic batch
    await batch.commit();
  }
}
