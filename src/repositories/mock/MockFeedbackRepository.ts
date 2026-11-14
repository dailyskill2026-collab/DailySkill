// src/repositories/mock/MockFeedbackRepository.ts
import type { IFeedbackRepository } from '../types';
import type { UserFeedback, FeedbackStatus, FeedbackPriority } from '@/types/feedback';

const STORAGE_KEY = 'ds_feedback_items';

export class MockFeedbackRepository implements IFeedbackRepository {
  private items: UserFeedback[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.items = JSON.parse(raw);
      }
    } catch {
      this.items = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // ignore storage full
    }
  }

  async submitFeedback(
    feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'auditTrail'>
  ): Promise<UserFeedback> {
    if (!feedback.category || !feedback.description?.trim()) {
      throw new Error('Category and feedback description are required.');
    }

    // Check for accidental duplicate submission within the last 5 seconds
    const now = Date.now();
    const isDuplicate = this.items.some((item) => {
      const itemTime = new Date(item.createdAt).getTime();
      return (
        item.mockUserId === feedback.mockUserId &&
        item.category === feedback.category &&
        item.description.trim().toLowerCase() === feedback.description.trim().toLowerCase() &&
        now - itemTime < 5000
      );
    });

    if (isDuplicate) {
      throw new Error('Duplicate feedback detected. Please wait before submitting identical feedback.');
    }

    const newFeedback: UserFeedback = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: feedback.status || 'new',
      priority: feedback.priority || 'medium',
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          oldStatus: 'new',
          newStatus: feedback.status || 'new',
          note: 'Feedback initially submitted',
          changedBy: feedback.mockUserId,
        },
      ],
    };

    this.items.unshift(newFeedback);
    this.saveToStorage();
    return newFeedback;
  }

  async getAllFeedback(includeSimulated = true): Promise<UserFeedback[]> {
    this.loadFromStorage();
    if (!includeSimulated) {
      return this.items.filter((item) => !item.isSimulated);
    }
    return [...this.items];
  }

  async getFeedbackByUser(userId: string): Promise<UserFeedback[]> {
    this.loadFromStorage();
    return this.items.filter((item) => item.mockUserId === userId);
  }

  async getFeedbackByContent(contentId: string): Promise<UserFeedback[]> {
    this.loadFromStorage();
    return this.items.filter((item) => item.relatedContentId === contentId);
  }

  async updateFeedbackStatus(
    feedbackId: string,
    newStatus: FeedbackStatus,
    changedBy: string,
    note?: string
  ): Promise<UserFeedback> {
    this.loadFromStorage();
    const item = this.items.find((f) => f.id === feedbackId);
    if (!item) {
      throw new Error(`Feedback with id ${feedbackId} not found.`);
    }

    const oldStatus = item.status;
    item.status = newStatus;
    if (!item.auditTrail) {
      item.auditTrail = [];
    }
    item.auditTrail.push({
      timestamp: new Date().toISOString(),
      oldStatus,
      newStatus,
      note,
      changedBy,
    });

    this.saveToStorage();
    return { ...item };
  }

  async updateFeedbackPriority(
    feedbackId: string,
    priority: FeedbackPriority
  ): Promise<UserFeedback> {
    this.loadFromStorage();
    const item = this.items.find((f) => f.id === feedbackId);
    if (!item) {
      throw new Error(`Feedback with id ${feedbackId} not found.`);
    }
    item.priority = priority;
    this.saveToStorage();
    return { ...item };
  }

  async linkToBacklogTask(feedbackId: string, taskId: string): Promise<void> {
    this.loadFromStorage();
    const item = this.items.find((f) => f.id === feedbackId);
    if (item) {
      item.linkedBacklogTaskId = taskId;
      this.saveToStorage();
    }
  }

  async clearFeedback(onlySimulated = false): Promise<void> {
    if (onlySimulated) {
      this.items = this.items.filter((item) => !item.isSimulated);
    } else {
      this.items = [];
    }
    this.saveToStorage();
  }
}
