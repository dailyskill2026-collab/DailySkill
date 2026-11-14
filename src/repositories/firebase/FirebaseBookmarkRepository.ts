// src/repositories/firebase/FirebaseBookmarkRepository.ts
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { IBookmarkRepository } from '../types';
import { getFirebaseServices } from '@/lib/firebase';

export class FirebaseBookmarkRepository implements IBookmarkRepository {
  private getDb() {
    const services = getFirebaseServices();
    if (!services) throw new Error('Firestore is not configured.');
    return services.db;
  }

  async getBookmarks(uid: string): Promise<string[]> {
    const db = this.getDb();
    const colRef = collection(db, 'users', uid, 'bookmarks');
    const snap = await getDocs(colRef);
    const bookmarks: string[] = [];
    snap.forEach((d) => bookmarks.push(d.id));
    return bookmarks;
  }

  async toggleBookmark(uid: string, contentId: string): Promise<boolean> {
    const db = this.getDb();
    const docRef = doc(db, 'users', uid, 'bookmarks', contentId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await deleteDoc(docRef);
      return false;
    } else {
      await setDoc(docRef, {
        contentId,
        savedAt: new Date().toISOString(),
      });
      return true;
    }
  }

  async isBookmarked(uid: string, contentId: string): Promise<boolean> {
    const db = this.getDb();
    const docRef = doc(db, 'users', uid, 'bookmarks', contentId);
    const snap = await getDoc(docRef);
    return snap.exists();
  }
}
