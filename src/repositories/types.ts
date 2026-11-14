// src/repositories/types.ts
import type { Profile } from '@/store/profileStore';
import type { LearningContent, LearningProgress } from '@/types/learning';
import type { Draft } from '@/ai/schemas';
import type { AnalyticsEvent, AnalyticsEventType } from '@/types/analytics';
import type { UserFeedback, FeedbackStatus, FeedbackPriority } from '@/types/feedback';
import type { BacklogTask } from '@/types/backlog';
import type { AssessmentAttempt, InProgressAssessment, PersonalizedImprovementPlan } from '@/types/assessment';
import type { LearningChallenge, UserAchievement } from '@/types/challenge';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  isAdmin?: boolean;
}

export interface GuestSnapshot {
  profile: Profile;
  dailyProgress: Record<string, LearningProgress>;
  bookmarks: string[];
  history: Record<string, string>;
}

export interface IAuthRepository {
  getCurrentUser(): AuthUser | null;
  signUp(email: string, password: string, displayName?: string): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  checkIsAdmin(): Promise<boolean>;
}

export interface IUserRepository {
  getProfile(uid: string): Promise<Profile | null>;
  saveProfile(uid: string, profile: Partial<Profile>): Promise<void>;
  migrateGuestData(uid: string, guestData: GuestSnapshot): Promise<void>;
}

export interface IProgressRepository {
  getProgress(uid: string): Promise<Record<string, LearningProgress>>;
  saveProgress(uid: string, progress: LearningProgress): Promise<void>;
  resetDaily(uid: string): Promise<void>;
}

export interface IBookmarkRepository {
  getBookmarks(uid: string): Promise<string[]>;
  toggleBookmark(uid: string, contentId: string): Promise<boolean>;
  isBookmarked(uid: string, contentId: string): Promise<boolean>;
}

export interface RevisionRecord {
  topicId: string;
  strengthPercent: number;
  dueCount: number;
  lastReviewedAt: string;
}

export interface IRevisionRepository {
  getRevisions(uid: string): Promise<Record<string, RevisionRecord>>;
  saveRevision(uid: string, record: RevisionRecord): Promise<void>;
}

export interface ContentFilter {
  technology?: string;
  category?: string;
  difficulty?: string;
  search?: string;
}

export interface IContentRepository {
  getPublishedFeed(filters?: ContentFilter): Promise<LearningContent[]>;
  getContentById(id: string): Promise<LearningContent | null>;
  getDrafts(adminUid: string): Promise<Draft[]>;
  updatePublicationStatus(
    adminUid: string,
    draftId: string,
    status: 'draft' | 'pending_verification' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'unpublished'
  ): Promise<void>;
}

export interface AuditLogEntry {
  id?: string;
  contentId: string;
  action: 'create' | 'verify' | 'approve' | 'reject' | 'publish' | 'unpublish';
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IAuditRepository {
  logAction(entry: AuditLogEntry): Promise<void>;
  getLogs(contentId?: string): Promise<AuditLogEntry[]>;
}

export interface IFeedbackRepository {
  submitFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'auditTrail'>): Promise<UserFeedback>;
  getAllFeedback(includeSimulated?: boolean): Promise<UserFeedback[]>;
  getFeedbackByUser(userId: string): Promise<UserFeedback[]>;
  getFeedbackByContent(contentId: string): Promise<UserFeedback[]>;
  updateFeedbackStatus(feedbackId: string, newStatus: FeedbackStatus, changedBy: string, note?: string): Promise<UserFeedback>;
  updateFeedbackPriority(feedbackId: string, priority: FeedbackPriority): Promise<UserFeedback>;
  linkToBacklogTask(feedbackId: string, taskId: string): Promise<void>;
  clearFeedback(onlySimulated?: boolean): Promise<void>;
}

export interface IAnalyticsRepository {
  recordEvent(event: Omit<AnalyticsEvent, 'eventId' | 'timestamp' | 'schemaVersion'>): Promise<AnalyticsEvent | null>;
  getEvents(options?: { includeSimulated?: boolean; startDate?: string; endDate?: string }): Promise<AnalyticsEvent[]>;
  clearEvents(onlySimulated?: boolean): Promise<void>;
  isAnalyticsOptedOut(): boolean;
  setAnalyticsOptOut(optOut: boolean): void;
}

export interface IBacklogRepository {
  createTask(task: Omit<BacklogTask, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<BacklogTask>;
  getAllTasks(): Promise<BacklogTask[]>;
  updateTask(taskId: string, updates: Partial<BacklogTask>): Promise<BacklogTask>;
  deleteTask(taskId: string): Promise<boolean>;
  clearBacklog(): Promise<void>;
}

export interface IAssessmentRepository {
  saveAttempt(attempt: AssessmentAttempt): Promise<void>;
  getAttempts(userId: string): Promise<AssessmentAttempt[]>;
  getInProgress(userId: string): Promise<InProgressAssessment | null>;
  saveInProgress(assessment: InProgressAssessment): Promise<void>;
  clearInProgress(userId: string): Promise<void>;
  saveImprovementPlan(plan: PersonalizedImprovementPlan): Promise<void>;
  getImprovementPlans(userId: string): Promise<PersonalizedImprovementPlan[]>;
  getLatestImprovementPlan(userId: string): Promise<PersonalizedImprovementPlan | null>;
}

export interface IChallengeRepository {
  getChallenges(userId: string, period: 'daily' | 'weekly', periodKey: string): Promise<LearningChallenge[]>;
  saveChallenges(userId: string, challenges: LearningChallenge[]): Promise<void>;
  updateChallenge(userId: string, challengeId: string, updates: Partial<LearningChallenge>): Promise<LearningChallenge>;
}

export interface IAchievementRepository {
  getAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  resetAchievements(userId: string): Promise<void>;
}

export interface Repositories {
  auth: IAuthRepository;
  user: IUserRepository;
  progress: IProgressRepository;
  bookmark: IBookmarkRepository;
  revision: IRevisionRepository;
  content: IContentRepository;
  audit: IAuditRepository;
  feedback: IFeedbackRepository;
  analytics: IAnalyticsRepository;
  backlog: IBacklogRepository;
  assessment: IAssessmentRepository;
  challenge: IChallengeRepository;
  achievement: IAchievementRepository;
  isMock: boolean;
}
