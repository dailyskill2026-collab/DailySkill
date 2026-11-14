// src/services/feedbackService.ts
import { repositories } from '@/repositories';
import { analytics } from './analyticsService';
import type {
  UserFeedback,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackPriority,
  ContentIssueType,
  ContentQualitySummary,
} from '@/types/feedback';
import { sampleLearningContent } from '@/data/sampleContent';

export class FeedbackService {
  private static instance: FeedbackService;

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  async submitFeedback(data: {
    category: FeedbackCategory;
    description: string;
    rating?: number;
    relatedScreen?: string;
    relatedContentId?: string;
    mockUserId?: string;
    isSimulated?: boolean;
  }): Promise<UserFeedback> {
    const user = repositories.auth.getCurrentUser();
    const userId = data.mockUserId || user?.uid || 'guest-user';

    const feedback = await repositories.feedback.submitFeedback({
      category: data.category,
      description: data.description,
      rating: data.rating,
      relatedScreen: data.relatedScreen,
      relatedContentId: data.relatedContentId,
      mockUserId: userId,
      status: 'new',
      priority: 'medium',
      isSimulated: data.isSimulated ?? false,
    });

    // Automatically record analytics event
    await analytics.trackFeedbackSubmitted(data.category, data.relatedContentId, {
      mockUserId: userId,
      isSimulated: data.isSimulated,
    });

    return feedback;
  }

  async submitContentQualityFeedback(data: {
    contentId: string;
    vote?: 'helpful' | 'not_helpful';
    issueType?: ContentIssueType;
    comment?: string;
    contentVersion?: string;
    mockUserId?: string;
    isSimulated?: boolean;
  }): Promise<UserFeedback> {
    const user = repositories.auth.getCurrentUser();
    const userId = data.mockUserId || user?.uid || 'guest-user';

    const description =
      data.comment?.trim() ||
      (data.vote ? `User voted: ${data.vote}` : `Content issue reported: ${data.issueType}`);

    const feedback = await repositories.feedback.submitFeedback({
      category: 'content_issue',
      description,
      relatedContentId: data.contentId,
      contentVersion: data.contentVersion || 'v1.0',
      contentIssueType: data.issueType,
      helpfulnessVote: data.vote,
      mockUserId: userId,
      status: 'new',
      priority: data.issueType === 'incorrect_information' ? 'high' : 'medium',
      isSimulated: data.isSimulated ?? false,
    });

    await analytics.trackFeedbackSubmitted('content_issue', data.contentId, {
      mockUserId: userId,
      isSimulated: data.isSimulated,
    });
    return feedback;
  }

  async getAllFeedback(includeSimulated = true): Promise<UserFeedback[]> {
    return repositories.feedback.getAllFeedback(includeSimulated);
  }

  async getFeedbackByUser(userId: string): Promise<UserFeedback[]> {
    return repositories.feedback.getFeedbackByUser(userId);
  }

  async getFeedbackByContent(contentId: string): Promise<UserFeedback[]> {
    return repositories.feedback.getFeedbackByContent(contentId);
  }

  async updateStatus(
    feedbackId: string,
    newStatus: FeedbackStatus,
    note?: string
  ): Promise<UserFeedback> {
    const user = repositories.auth.getCurrentUser();
    const changedBy = user?.displayName || user?.email || 'admin';
    return repositories.feedback.updateFeedbackStatus(feedbackId, newStatus, changedBy, note);
  }

  async updatePriority(feedbackId: string, priority: FeedbackPriority): Promise<UserFeedback> {
    return repositories.feedback.updateFeedbackPriority(feedbackId, priority);
  }

  async getContentQualitySummaries(includeSimulated = true): Promise<ContentQualitySummary[]> {
    const all = await repositories.feedback.getAllFeedback(includeSimulated);
    const contentFeedbacks = all.filter((f) => f.relatedContentId);

    const summariesMap: Record<string, ContentQualitySummary> = {};

    // Initialize with known sample content
    sampleLearningContent.forEach((c) => {
      summariesMap[c.id] = {
        contentId: c.id,
        title: c.title,
        helpfulCount: 0,
        notHelpfulCount: 0,
        helpfulnessRatio: 100,
        issueCount: 0,
        needsReview: false,
        issues: [],
      };
    });

    for (const fb of contentFeedbacks) {
      const cid = fb.relatedContentId!;
      if (!summariesMap[cid]) {
        summariesMap[cid] = {
          contentId: cid,
          title: `Content (${cid})`,
          helpfulCount: 0,
          notHelpfulCount: 0,
          helpfulnessRatio: 100,
          issueCount: 0,
          needsReview: false,
          issues: [],
        };
      }

      const summary = summariesMap[cid];
      if (fb.helpfulnessVote === 'helpful') {
        summary.helpfulCount += 1;
      } else if (fb.helpfulnessVote === 'not_helpful') {
        summary.notHelpfulCount += 1;
      }

      if (fb.contentIssueType) {
        summary.issueCount += 1;
        summary.issues.push(fb.contentIssueType);
      }
    }

    return Object.values(summariesMap).map((s) => {
      const totalVotes = s.helpfulCount + s.notHelpfulCount;
      const ratio = totalVotes > 0 ? Math.round((s.helpfulCount / totalVotes) * 100) : 100;
      return {
        ...s,
        helpfulnessRatio: ratio,
        needsReview: s.issueCount > 0 || (totalVotes >= 2 && ratio < 60),
      };
    });
  }
}

export const feedbackService = FeedbackService.getInstance();
