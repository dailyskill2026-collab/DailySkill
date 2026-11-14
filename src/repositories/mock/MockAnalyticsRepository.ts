// src/repositories/mock/MockAnalyticsRepository.ts
import type { IAnalyticsRepository } from '../types';
import type { AnalyticsEvent } from '@/types/analytics';

const EVENTS_STORAGE_KEY = 'ds_analytics_events';
const OPT_OUT_STORAGE_KEY = 'ds_analytics_opt_out';
const MAX_LOCAL_EVENTS = 1000;

export class MockAnalyticsRepository implements IAnalyticsRepository {
  private events: AnalyticsEvent[] = [];
  private optedOut = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      this.optedOut = localStorage.getItem(OPT_OUT_STORAGE_KEY) === 'true';
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (raw) {
        this.events = JSON.parse(raw);
      }
    } catch {
      this.events = [];
    }
  }

  private saveToStorage() {
    try {
      // Keep most recent MAX_LOCAL_EVENTS to avoid overflowing localStorage
      const trimmed = this.events.slice(-MAX_LOCAL_EVENTS);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore storage quota errors
    }
  }

  isAnalyticsOptedOut(): boolean {
    try {
      return localStorage.getItem(OPT_OUT_STORAGE_KEY) === 'true';
    } catch {
      return this.optedOut;
    }
  }

  setAnalyticsOptOut(optOut: boolean): void {
    this.optedOut = optOut;
    try {
      localStorage.setItem(OPT_OUT_STORAGE_KEY, optOut ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  private sanitizeMetadata(
    meta?: Record<string, string | number | boolean>
  ): Record<string, string | number | boolean> | undefined {
    if (!meta) return undefined;
    const clean: Record<string, string | number | boolean> = {};
    const prohibitedWords = ['password', 'secret', 'token', 'auth', 'credit', 'email', 'phone'];

    for (const [key, val] of Object.entries(meta)) {
      const lower = key.toLowerCase();
      if (prohibitedWords.some((word) => lower.includes(word))) {
        continue; // strip potential PII
      }
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        clean[key] = val;
      }
    }
    return clean;
  }

  async recordEvent(
    event: Omit<AnalyticsEvent, 'eventId' | 'timestamp' | 'schemaVersion'>
  ): Promise<AnalyticsEvent | null> {
    if (this.isAnalyticsOptedOut()) {
      return null;
    }

    if (!event.eventType || !event.mockUserId) {
      throw new Error('eventType and mockUserId are required to record an analytics event.');
    }

    const eventTime = (event as any).timestamp
      ? new Date((event as any).timestamp).getTime()
      : Date.now();

    // Duplicate prevention: avoid recording identical event within 3 seconds of the event's timestamp
    const isDuplicate = this.events.slice(-20).some((e) => {
      const eTime = new Date(e.timestamp).getTime();
      return (
        e.eventType === event.eventType &&
        e.mockUserId === event.mockUserId &&
        e.relatedContentId === event.relatedContentId &&
        Math.abs(eventTime - eTime) < 3000
      );
    });

    if (isDuplicate) {
      return null;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: (event as any).timestamp || new Date().toISOString(),
      schemaVersion: 1,
      relevantMetadata: this.sanitizeMetadata(event.relevantMetadata),
    };

    this.events.push(fullEvent);
    this.saveToStorage();
    return fullEvent;
  }

  async getEvents(options?: {
    includeSimulated?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsEvent[]> {
    this.loadFromStorage();
    let result = [...this.events];

    if (options?.includeSimulated === false) {
      result = result.filter((e) => !e.isSimulated);
    }

    if (options?.startDate) {
      const startMs = new Date(options.startDate).getTime();
      result = result.filter((e) => new Date(e.timestamp).getTime() >= startMs);
    }

    if (options?.endDate) {
      const endMs = new Date(options.endDate).getTime();
      result = result.filter((e) => new Date(e.timestamp).getTime() <= endMs);
    }

    return result;
  }

  async clearEvents(onlySimulated = false): Promise<void> {
    if (onlySimulated) {
      this.events = this.events.filter((e) => !e.isSimulated);
    } else {
      this.events = [];
    }
    this.saveToStorage();
  }
}
