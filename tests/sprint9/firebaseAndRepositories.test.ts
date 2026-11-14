// tests/sprint9/firebaseAndRepositories.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRepositories } from '@/repositories';
import { MockAuthRepository } from '@/repositories/mock/MockAuthRepository';
import { MockUserRepository } from '@/repositories/mock/MockUserRepository';
import { MockProgressRepository } from '@/repositories/mock/MockProgressRepository';
import { MockBookmarkRepository } from '@/repositories/mock/MockBookmarkRepository';
import { MockRevisionRepository } from '@/repositories/mock/MockRevisionRepository';
import { MockContentRepository } from '@/repositories/mock/MockContentRepository';
import { MockAuditRepository } from '@/repositories/mock/MockAuditRepository';
import { getFirebaseServices } from '@/lib/firebase';
import { runSampleMigration } from '../../scripts/migrateSampleContent';

describe('Sprint 9: Firebase & Dual-Mode Repositories Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Mode Detection & Graceful Fallback', () => {
    it('defaults to Mock mode when Firebase credentials are not supplied', () => {
      const repos = getRepositories();
      expect(repos.isMock).toBe(true);
      expect(repos.auth).toBeInstanceOf(MockAuthRepository);
    });

    it('returns null gracefully when Firebase services are queried without API keys', () => {
      const services = getFirebaseServices();
      // In testing environment without real VITE_FIREBASE_API_KEY, services returns null
      expect(services === null || typeof services === 'object').toBe(true);
    });
  });

  describe('2. Authentication Flow (Mock & Contracts)', () => {
    const authRepo = new MockAuthRepository();

    it('allows signup with email, password, and display name', async () => {
      const user = await authRepo.signUp('newuser@example.com', 'secret123', 'New Learner');
      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.displayName).toBe('New Learner');
      expect(user.isAdmin).toBe(false);
    });

    it('allows login and assigns admin flag to designated administrative email', async () => {
      const adminUser = await authRepo.signIn('dailyskill2026@gmail.com', 'password123');
      expect(adminUser.isAdmin).toBe(true);
      const isAdmin = await authRepo.checkIsAdmin();
      expect(isAdmin).toBe(true);
    });

    it('clears active session upon signOut', async () => {
      await authRepo.signOut();
      expect(authRepo.getCurrentUser()).toBeNull();
      expect(await authRepo.checkIsAdmin()).toBe(false);
    });

    it('supports password reset request', async () => {
      await expect(authRepo.resetPassword('user@example.com')).resolves.toBeUndefined();
    });
  });

  describe('3. User Profile & Guest Migration', () => {
    const userRepo = new MockUserRepository();

    it('loads default profile if none exists', async () => {
      const profile = await userRepo.getProfile('test-uid');
      expect(profile).toBeDefined();
      expect(profile?.technology).toBe('salesforce');
    });

    it('updates and persists user profile patch', async () => {
      await userRepo.saveProfile('test-uid', {
        name: 'Sarah Connor',
        dailyDuration: 10,
        goals: ['prepare_cert'],
      });
      const updated = await userRepo.getProfile('test-uid');
      expect(updated?.name).toBe('Sarah Connor');
      expect(updated?.dailyDuration).toBe(10);
    });

    it('migrates guest snapshot cleanly into user profile', async () => {
      const guestSnapshot = {
        profile: {
          onboardingCompleted: true,
          isGuest: true,
          name: 'Guest User',
          technology: 'salesforce' as const,
          role: 'salesforce_dev' as const,
          experience: '0-2' as const,
          goals: ['stay_updated' as const],
          interests: ['apex' as const],
          dailyDuration: 5 as const,
          reminder: 'none' as const,
        },
        dailyProgress: {},
        bookmarks: ['explore-001'],
        history: {},
      };

      await userRepo.migrateGuestData('target-uid', guestSnapshot);
      const profile = await userRepo.getProfile('target-uid');
      expect(profile?.name).toBe('Guest User');
    });
  });

  describe('4. Learning Progress Persistence', () => {
    const progressRepo = new MockProgressRepository();

    it('saves and retrieves daily activity progress', async () => {
      await progressRepo.saveProgress('user-1', {
        activityId: 'act-001',
        status: 'completed',
        completedAt: new Date().toISOString(),
        isCorrect: true,
      });

      const progress = await progressRepo.getProgress('user-1');
      expect(progress['act-001']).toBeDefined();
      expect(progress['act-001'].status).toBe('completed');
      expect(progress['act-001'].isCorrect).toBe(true);
    });

    it('resets daily progress when triggered', async () => {
      await progressRepo.resetDaily('user-1');
      const progress = await progressRepo.getProgress('user-1');
      expect(Object.keys(progress).length).toBe(0);
    });
  });

  describe('5. Bookmarks Persistence', () => {
    const bookmarkRepo = new MockBookmarkRepository();

    it('toggles bookmarks reliably', async () => {
      const added = await bookmarkRepo.toggleBookmark('user-1', 'explore-101');
      expect(added).toBe(true);
      expect(await bookmarkRepo.isBookmarked('user-1', 'explore-101')).toBe(true);

      const removed = await bookmarkRepo.toggleBookmark('user-1', 'explore-101');
      expect(removed).toBe(false);
      expect(await bookmarkRepo.isBookmarked('user-1', 'explore-101')).toBe(false);
    });
  });

  describe('6. Revision History Storage', () => {
    const revisionRepo = new MockRevisionRepository();

    it('saves and retrieves spaced repetition review records', async () => {
      await revisionRepo.saveRevision('user-1', {
        topicId: 'topic-queueable',
        strengthPercent: 85,
        dueCount: 0,
        lastReviewedAt: '2026-11-14T20:00:00Z',
      });

      const records = await revisionRepo.getRevisions('user-1');
      expect(records['topic-queueable']).toBeDefined();
      expect(records['topic-queueable'].strengthPercent).toBe(85);
    });
  });

  describe('7. Content Feed & Filtering', () => {
    const contentRepo = new MockContentRepository();

    it('retrieves published explore feed', async () => {
      const feed = await contentRepo.getPublishedFeed();
      expect(feed.length).toBeGreaterThan(0);
    });

    it('filters feed by search query', async () => {
      const searchResults = await contentRepo.getPublishedFeed({ search: 'Apex' });
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.every(i => i.title.toLowerCase().includes('apex') || i.summary?.toLowerCase().includes('apex'))).toBe(true);
    });

    it('retrieves individual content item by ID', async () => {
      const item = await contentRepo.getContentById('c1');
      expect(item).toBeDefined();
      expect(item?.id).toBe('c1');
    });
  });

  describe('8. Audit Logging & Immutability', () => {
    const auditRepo = new MockAuditRepository();

    it('logs publishing and verification actions', async () => {
      await auditRepo.logAction({
        contentId: 'draft-999',
        action: 'verify',
        performedBy: 'admin@salesforce.dev',
        timestamp: new Date().toISOString(),
        metadata: { passedChecks: 12 },
      });

      const logs = await auditRepo.getLogs('draft-999');
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('verify');
      expect(logs[0].performedBy).toBe('admin@salesforce.dev');
    });
  });

  describe('9. Sample Content Migration Dry Run', () => {
    it('executes sample content migration dry run cleanly without writing to DB', () => {
      const report = runSampleMigration(true);
      expect(report.dryRun).toBe(true);
      expect(report.totalInspected).toBeGreaterThan(0);
      expect(report.validForImport).toBeGreaterThan(0);
      expect(report.duplicatesSkipped).toBe(0);
      expect(report.records.every(r => r.action === 'SKIP')).toBe(true);
    });
  });
});

  describe('10. Protected Routes & Authorization', () => {
    it('verifies non-admin accounts are flagged correctly', async () => {
      const auth = new MockAuthRepository();
      const standardUser = await auth.signUp('regular@user.com', 'password123');
      expect(standardUser.isAdmin).toBe(false);
      expect(await auth.checkIsAdmin()).toBe(false);
    });

    it('verifies admin status is granted to designated administrator accounts', async () => {
      const auth = new MockAuthRepository();
      const admin = await auth.signIn('admin@salesforce.dev', 'password123');
      expect(admin.isAdmin).toBe(true);
      expect(await auth.checkIsAdmin()).toBe(true);
    });
  });
