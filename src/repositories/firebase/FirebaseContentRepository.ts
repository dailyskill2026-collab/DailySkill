// src/repositories/firebase/FirebaseContentRepository.ts
import { collection, doc, getDoc, getDocs, query, where, setDoc, limit } from 'firebase/firestore';
import type { IContentRepository, ContentFilter } from '../types';
import type { LearningContent } from '@/types/learning';
import type { Draft } from '@/ai/schemas';
import { getFirebaseServices } from '@/lib/firebase';
import { exploreContent } from '@/data/exploreContent';

export class FirebaseContentRepository implements IContentRepository {
  private getDb() {
    const services = getFirebaseServices();
    if (!services) throw new Error('Firestore is not configured.');
    return services.db;
  }

  async getPublishedFeed(filters?: ContentFilter): Promise<LearningContent[]> {
    try {
      const db = this.getDb();
      const colRef = collection(db, 'publishedContent');
      let q = query(colRef, limit(30));

      if (filters?.technology) {
        q = query(colRef, where('technology', '==', filters.technology), limit(30));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        const items: LearningContent[] = [];
        snap.forEach((d) => items.push(d.data() as LearningContent));
        return items;
      }
    } catch (err) {
      console.warn('[FirebaseContentRepository] Failed to query publishedContent, falling back to local dataset:', err);
    }

    // Graceful fallback to verified sample dataset if collection is not yet populated
    let items = [...exploreContent] as unknown as LearningContent[];
    if (filters?.technology) {
      items = items.filter(i => (i.technology || 'salesforce').toLowerCase() === filters.technology!.toLowerCase());
    }
    if (filters?.difficulty) {
      items = items.filter(i => i.difficulty === filters.difficulty);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(s) ||
        (i.summary && i.summary.toLowerCase().includes(s))
      );
    }
    return items;
  }

  async getContentById(id: string): Promise<LearningContent | null> {
    try {
      const db = this.getDb();
      const snap = await getDoc(doc(db, 'publishedContent', id));
      if (snap.exists()) {
        return snap.data() as LearningContent;
      }
    } catch {
      // fallback
    }

    const localItem = exploreContent.find(c => c.id === id);
    return (localItem as unknown as LearningContent) || null;
  }

  async getDrafts(_adminUid: string): Promise<Draft[]> {
    try {
      const db = this.getDb();
      const colRef = collection(db, 'generatedDrafts');
      const snap = await getDocs(colRef);
      const drafts: Draft[] = [];
      snap.forEach((d) => drafts.push(d.data() as Draft));
      return drafts;
    } catch {
      return [];
    }
  }

  async updatePublicationStatus(
    _adminUid: string,
    draftId: string,
    status: 'draft' | 'pending_verification' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'unpublished'
  ): Promise<void> {
    const db = this.getDb();
    const draftRef = doc(db, 'generatedDrafts', draftId);
    await setDoc(draftRef, {
      publicationStatus: status,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    if (status === 'published') {
      const snap = await getDoc(draftRef);
      if (snap.exists()) {
        const draft = snap.data() as Draft;
        const pubDocRef = doc(db, 'publishedContent', draftId);
        await setDoc(pubDocRef, {
          id: draftId,
          title: draft.topic.title,
          summary: draft.topic.summary,
          technology: 'salesforce',
          category: 'update',
          contentType: 'article',
          difficulty: 'medium',
          applicableRoles: ['salesforce_dev'],
          estimatedMinutes: 3,
          publishedAt: new Date().toISOString(),
          verificationStatus: 'verified',
          contentStatus: 'active',
        }, { merge: true });
      }
    }
  }
}
