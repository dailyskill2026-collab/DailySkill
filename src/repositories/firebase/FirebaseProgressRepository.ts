// src/repositories/firebase/FirebaseProgressRepository.ts
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import type { IProgressRepository } from '../types';
import type { LearningProgress } from '@/types/learning';
import { getFirebaseServices } from '@/lib/firebase';

export class FirebaseProgressRepository implements IProgressRepository {
  private getDb() {
    const services = getFirebaseServices();
    if (!services) throw new Error('Firestore is not configured.');
    return services.db;
  }

  async getProgress(uid: string): Promise<Record<string, LearningProgress>> {
    const db = this.getDb();
    const colRef = collection(db, 'users', uid, 'progress');
    const snap = await getDocs(colRef);
    const result: Record<string, LearningProgress> = {};
    snap.forEach((d) => {
      result[d.id] = d.data() as LearningProgress;
    });
    return result;
  }

  async saveProgress(uid: string, progress: LearningProgress): Promise<void> {
    const db = this.getDb();
    const docRef = doc(db, 'users', uid, 'progress', progress.activityId);
    await setDoc(docRef, {
      ...progress,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  async resetDaily(_uid: string): Promise<void> {
    // In production Firestore, daily progress can be scoped by date partition or updated
  }
}
