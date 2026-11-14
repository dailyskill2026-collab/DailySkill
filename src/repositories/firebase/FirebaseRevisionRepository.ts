// src/repositories/firebase/FirebaseRevisionRepository.ts
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import type { IRevisionRepository, RevisionRecord } from '../types';
import { getFirebaseServices } from '@/lib/firebase';

export class FirebaseRevisionRepository implements IRevisionRepository {
  private getDb() {
    const services = getFirebaseServices();
    if (!services) throw new Error('Firestore is not configured.');
    return services.db;
  }

  async getRevisions(uid: string): Promise<Record<string, RevisionRecord>> {
    const db = this.getDb();
    const colRef = collection(db, 'users', uid, 'revisions');
    const snap = await getDocs(colRef);
    const records: Record<string, RevisionRecord> = {};
    snap.forEach((d) => {
      records[d.id] = d.data() as RevisionRecord;
    });
    return records;
  }

  async saveRevision(uid: string, record: RevisionRecord): Promise<void> {
    const db = this.getDb();
    const docRef = doc(db, 'users', uid, 'revisions', record.topicId);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}
