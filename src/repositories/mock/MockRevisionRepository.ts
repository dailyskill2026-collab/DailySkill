// src/repositories/mock/MockRevisionRepository.ts
import type { IRevisionRepository, RevisionRecord } from '../types';

export class MockRevisionRepository implements IRevisionRepository {
  private storageKey = 'it-daily-revisions';

  async getRevisions(_uid: string): Promise<Record<string, RevisionRecord>> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {};
  }

  async saveRevision(uid: string, record: RevisionRecord): Promise<void> {
    const revisions = await this.getRevisions(uid);
    revisions[record.topicId] = record;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(revisions));
    } catch {
      // ignore
    }
  }
}
