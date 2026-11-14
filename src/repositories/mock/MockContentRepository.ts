// src/repositories/mock/MockContentRepository.ts
import type { IContentRepository, ContentFilter } from '../types';
import type { LearningContent } from '@/types/learning';
import type { Draft } from '@/ai/schemas';
import { exploreContent } from '@/data/exploreContent';

export class MockContentRepository implements IContentRepository {
  private inMemoryDrafts: Draft[] = [];

  async getPublishedFeed(filters?: ContentFilter): Promise<LearningContent[]> {
    let items = [...exploreContent] as unknown as LearningContent[];

    if (filters?.technology) {
      items = items.filter(i => (i.technology || 'salesforce').toLowerCase() === filters.technology!.toLowerCase());
    }
    if (filters?.difficulty) {
      items = items.filter(i => i.difficulty === filters.difficulty);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.summary && i.summary.toLowerCase().includes(q))
      );
    }
    return items;
  }

  async getContentById(id: string): Promise<LearningContent | null> {
    const item = exploreContent.find(c => c.id === id);
    return (item as unknown as LearningContent) || null;
  }

  async getDrafts(_adminUid: string): Promise<Draft[]> {
    return this.inMemoryDrafts;
  }

  async updatePublicationStatus(
    _adminUid: string,
    draftId: string,
    status: 'draft' | 'pending_verification' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'unpublished'
  ): Promise<void> {
    const draft = this.inMemoryDrafts.find(d => d.topic.id === draftId);
    if (draft) {
      (draft as any).publicationStatus = status;
    }
  }
}
