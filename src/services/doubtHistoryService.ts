// src/services/doubtHistoryService.ts
import type { DoubtRecord, ExplanationStyle } from '@/types/assistant';

const DOUBT_STORAGE_KEY = 'ds_doubt_history';

export class DoubtHistoryService {
  private static instance: DoubtHistoryService;

  static getInstance(): DoubtHistoryService {
    if (!DoubtHistoryService.instance) {
      DoubtHistoryService.instance = new DoubtHistoryService();
    }
    return DoubtHistoryService.instance;
  }

  private loadAll(): DoubtRecord[] {
    try {
      const raw = localStorage.getItem(DOUBT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveAll(records: DoubtRecord[]) {
    try {
      localStorage.setItem(DOUBT_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }

  async recordDoubt(data: {
    mockUserId: string;
    question: string;
    matchedKnowledgeId?: string;
    topicTitle: string;
    relatedLessonId?: string;
    selectedStyle: ExplanationStyle;
    answerSummary: string;
    status: 'answered' | 'unsupported';
  }): Promise<DoubtRecord> {
    const all = this.loadAll();
    const newRecord: DoubtRecord = {
      doubtId: `dbt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mockUserId: data.mockUserId,
      question: data.question,
      matchedKnowledgeId: data.matchedKnowledgeId,
      topicTitle: data.topicTitle,
      relatedLessonId: data.relatedLessonId,
      selectedStyle: data.selectedStyle,
      answerSummary: data.answerSummary,
      createdAt: new Date().toISOString(),
      status: data.status,
    };

    all.unshift(newRecord);
    this.saveAll(all);
    return newRecord;
  }

  async getDoubtsByUser(userId: string): Promise<DoubtRecord[]> {
    const all = this.loadAll();
    return all.filter((d) => d.mockUserId === userId);
  }

  async searchDoubts(userId: string, query: string): Promise<DoubtRecord[]> {
    const userDoubts = await this.getDoubtsByUser(userId);
    if (!query || !query.trim()) return userDoubts;
    const q = query.toLowerCase();
    return userDoubts.filter(
      (d) =>
        d.question.toLowerCase().includes(q) ||
        d.topicTitle.toLowerCase().includes(q) ||
        d.answerSummary.toLowerCase().includes(q)
    );
  }

  async clearUserDoubts(userId: string): Promise<void> {
    const all = this.loadAll();
    const remaining = all.filter((d) => d.mockUserId !== userId);
    this.saveAll(remaining);
  }
}

export const doubtHistoryService = DoubtHistoryService.getInstance();
