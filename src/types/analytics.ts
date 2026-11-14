// src/types/analytics.ts

export type AnalyticsEventType =
  | 'app_opened'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_started'
  | 'quiz_completed'
  | 'revision_started'
  | 'revision_completed'
  | 'content_bookmarked'
  | 'content_opened'
  | 'search_performed'
  | 'learning_goal_completed'
  | 'feedback_submitted';

export interface AnalyticsEvent {
  eventId: string;
  eventType: AnalyticsEventType;
  mockUserId: string;
  sessionId: string;
  timestamp: string; // ISO 8601
  screen?: string;
  relatedContentId?: string;
  relevantMetadata?: Record<string, string | number | boolean>;
  schemaVersion: number; // 1
  isSimulated?: boolean;
}

export interface RetentionCohort {
  cohortDate: string; // YYYY-MM-DD
  userCount: number;
  day1RetainedCount: number | null; // null if observation window < 1 day
  day1RetentionRate: number | null; // 0-100 or null
  day7RetainedCount: number | null; // null if observation window < 7 days
  day7RetentionRate: number | null; // 0-100 or null
  isComplete: boolean;
}

export interface FunnelStage {
  stageId: string;
  stageName: string;
  userCount: number;
  dropOffCount: number;
  dropOffRate: number; // %
  conversionRate: number; // % of total entrants
}

export interface EngagementSummary {
  dau: number;
  wau: number;
  lessonsStarted: number;
  lessonsCompleted: number;
  lessonCompletionRate: number; // %
  quizAttempts: number;
  quizAccuracy: number; // %
  revisionsCompleted: number;
  averageSessionsPerUser: number;
  weeklyGoalCompletionRate: number; // %
  totalEventsCount: number;
  isSimulatedIncluded: boolean;
}
