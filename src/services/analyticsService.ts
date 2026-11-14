// src/services/analyticsService.ts
import { repositories } from '@/repositories';
import type { AnalyticsEvent, AnalyticsEventType } from '@/types/analytics';

const SESSION_KEY = 'ds_analytics_session_id';

function getSessionId(): string {
  try {
    let sId = sessionStorage.getItem(SESSION_KEY);
    if (!sId) {
      sId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(SESSION_KEY, sId);
    }
    return sId;
  } catch {
    return 'sess-default';
  }
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async trackEvent(
    eventType: AnalyticsEventType,
    options?: {
      screen?: string;
      relatedContentId?: string;
      relevantMetadata?: Record<string, string | number | boolean>;
      mockUserId?: string;
      isSimulated?: boolean;
    }
  ): Promise<AnalyticsEvent | null> {
    const user = repositories.auth.getCurrentUser();
    const userId = options?.mockUserId || user?.uid || 'guest-user';
    const sessionId = getSessionId();

    return repositories.analytics.recordEvent({
      eventType,
      mockUserId: userId,
      sessionId,
      screen: options?.screen,
      relatedContentId: options?.relatedContentId,
      relevantMetadata: options?.relevantMetadata,
      isSimulated: options?.isSimulated ?? false,
    });
  }

  async trackAppOpened(screen = 'today'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('app_opened', { screen });
  }

  async trackOnboardingStarted(): Promise<AnalyticsEvent | null> {
    return this.trackEvent('onboarding_started', { screen: 'onboarding' });
  }

  async trackOnboardingCompleted(): Promise<AnalyticsEvent | null> {
    return this.trackEvent('onboarding_completed', { screen: 'onboarding' });
  }

  async trackLessonStarted(contentId: string, screen = 'today'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('lesson_started', { screen, relatedContentId: contentId });
  }

  async trackLessonCompleted(contentId: string, screen = 'today'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('lesson_completed', { screen, relatedContentId: contentId });
  }

  async trackQuizStarted(contentId: string, screen = 'today'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('quiz_started', { screen, relatedContentId: contentId });
  }

  async trackQuizCompleted(
    contentId: string,
    isCorrect: boolean,
    screen = 'today'
  ): Promise<AnalyticsEvent | null> {
    return this.trackEvent('quiz_completed', {
      screen,
      relatedContentId: contentId,
      relevantMetadata: { isCorrect },
    });
  }

  async trackRevisionStarted(contentId: string, screen = 'revise'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('revision_started', { screen, relatedContentId: contentId });
  }

  async trackRevisionCompleted(contentId: string, screen = 'revise'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('revision_completed', { screen, relatedContentId: contentId });
  }

  async trackContentBookmarked(contentId: string, screen = 'explore'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('content_bookmarked', { screen, relatedContentId: contentId });
  }

  async trackContentOpened(contentId: string, screen = 'explore'): Promise<AnalyticsEvent | null> {
    return this.trackEvent('content_opened', { screen, relatedContentId: contentId });
  }

  async trackSearchPerformed(query: string, resultCount: number): Promise<AnalyticsEvent | null> {
    return this.trackEvent('search_performed', {
      screen: 'explore',
      relevantMetadata: { queryLength: query.length, resultCount },
    });
  }

  async trackLearningGoalCompleted(goalDays: number): Promise<AnalyticsEvent | null> {
    return this.trackEvent('learning_goal_completed', {
      screen: 'today',
      relevantMetadata: { targetDays: goalDays },
    });
  }

  async trackFeedbackSubmitted(
    category: string,
    contentId?: string,
    options?: { mockUserId?: string; isSimulated?: boolean }
  ): Promise<AnalyticsEvent | null> {
    return this.trackEvent('feedback_submitted', {
      screen: contentId ? 'detail' : 'me',
      relatedContentId: contentId,
      relevantMetadata: { category },
      mockUserId: options?.mockUserId,
      isSimulated: options?.isSimulated,
    });
  }

  async getEvents(options?: {
    includeSimulated?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsEvent[]> {
    return repositories.analytics.getEvents(options);
  }

  async clearEvents(onlySimulated = false): Promise<void> {
    return repositories.analytics.clearEvents(onlySimulated);
  }
}

export const analytics = AnalyticsService.getInstance();
