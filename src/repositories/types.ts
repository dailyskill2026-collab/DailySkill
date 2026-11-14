// src/repositories/types.ts
import type { Profile } from '@/store/profileStore';
import type { LearningContent, LearningProgress } from '@/types/learning';
import type { Draft } from '@/ai/schemas';

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

export interface Repositories {
  auth: IAuthRepository;
  user: IUserRepository;
  progress: IProgressRepository;
  bookmark: IBookmarkRepository;
  revision: IRevisionRepository;
  content: IContentRepository;
  audit: IAuditRepository;
  isMock: boolean;
}
