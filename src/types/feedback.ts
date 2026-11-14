// src/types/feedback.ts

export type FeedbackCategory =
  | 'bug_report'
  | 'feature_suggestion'
  | 'content_issue'
  | 'learning_experience'
  | 'general_feedback';

export type FeedbackStatus = 'new' | 'under_review' | 'planned' | 'resolved' | 'closed';
export type FeedbackPriority = 'critical' | 'high' | 'medium' | 'low';

export type ContentIssueType =
  | 'incorrect_information'
  | 'outdated_content'
  | 'confusing_explanation'
  | 'wrong_mcq_answer'
  | 'broken_reference'
  | 'other';

export interface FeedbackAuditEntry {
  timestamp: string;
  oldStatus: FeedbackStatus;
  newStatus: FeedbackStatus;
  note?: string;
  changedBy: string;
}

export interface UserFeedback {
  id: string;
  category: FeedbackCategory;
  rating?: number; // 1 to 5
  description: string;
  relatedScreen?: string;
  relatedContentId?: string;
  contentVersion?: string;
  contentIssueType?: ContentIssueType;
  helpfulnessVote?: 'helpful' | 'not_helpful';
  createdAt: string;
  mockUserId: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  internalNotes?: string;
  linkedBacklogTaskId?: string;
  auditTrail: FeedbackAuditEntry[];
  isSimulated?: boolean;
}

export interface ContentQualitySummary {
  contentId: string;
  title: string;
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulnessRatio: number; // 0-100%
  issueCount: number;
  needsReview: boolean;
  issues: ContentIssueType[];
}
