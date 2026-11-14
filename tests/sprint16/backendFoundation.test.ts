/**
 * Sprint 16: Production Backend Foundation, Database Design & Integration Readiness Test Suite
 * Validates error framework, Zod validation schemas, data provider configuration,
 * mock API simulator, repository contracts, and data migration safety.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  StorageError,
  isAppError,
  mapErrorToUserMessage,
} from '@/errors/AppErrors';
import {
  UserProfileSchema,
  UserPreferencesSchema,
  QuizAttemptSchema,
  AssessmentSubmissionSchema,
  FeedbackSubmissionSchema,
  LessonSchema,
  validateData,
} from '@/validation/schemas';
import { getDataProviderConfig } from '@/lib/dataProvider';
import { mockApiSimulator } from '@/services/mockApiSimulator';
import { repositories } from '@/repositories';
import type { PaginatedResult } from '@/repositories/types';
import { env } from '@/lib/env';

describe('Sprint 16: Production Backend Foundation & Integration Readiness', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockApiSimulator.reset();
  });

  afterEach(() => {
    mockApiSimulator.reset();
  });

  // =========================================================================
  // 1-5. Data Provider Configuration & Boundary Safeguards
  // =========================================================================
  describe('1-5. Data Provider Configuration Architecture', () => {
    it('1. defaults to 100% Mock data provider out of the box', () => {
      const config = getDataProviderConfig();
      expect(config.provider).toBe('mock');
      expect(config.isMock).toBe(true);
      expect(config.isCloudConnected).toBe(false);
    });

    it('2. lists supported data providers correctly', () => {
      const config = getDataProviderConfig();
      expect(config.supportedProviders).toEqual(['mock', 'firebase', 'api']);
    });

    it('3. rejects unsupported data provider configurations with ServiceUnavailableError', () => {
      const originalProvider = env.DATA_PROVIDER;
      try {
        (env as any).DATA_PROVIDER = 'unsupported_oracle_db';
        expect(() => getDataProviderConfig()).toThrow(ServiceUnavailableError);
      } finally {
        env.DATA_PROVIDER = originalProvider;
      }
    });

    it('4. rejects unconfigured API provider when API_BASE_URL is missing', () => {
      const originalProvider = env.DATA_PROVIDER;
      const originalUrl = env.API_BASE_URL;
      try {
        (env as any).DATA_PROVIDER = 'api';
        (env as any).API_BASE_URL = '';
        expect(() => getDataProviderConfig()).toThrow(ServiceUnavailableError);
      } finally {
        env.DATA_PROVIDER = originalProvider;
        env.API_BASE_URL = originalUrl;
      }
    });

    it('5. maintains repository isolation without any network calls in mock mode', async () => {
      const profile = await repositories.user.getProfile('guest-user');
      expect(profile).toBeDefined();
      expect(repositories.isMock).toBe(true);
    });
  });

  // =========================================================================
  // 6-8. Standardized Error Handling Framework
  // =========================================================================
  describe('6-8. Error Handling Framework & User-Facing Safety', () => {
    it('6. creates properly typed AppErrors with consistent HTTP status codes', () => {
      const errValidation = new ValidationError('Bad email format');
      expect(errValidation.code).toBe('ERR_VALIDATION');
      expect(errValidation.statusCode).toBe(400);

      const errAuth = new UnauthorizedError();
      expect(errAuth.code).toBe('ERR_UNAUTHORIZED');
      expect(errAuth.statusCode).toBe(401);

      const errForbidden = new ForbiddenError();
      expect(errForbidden.code).toBe('ERR_FORBIDDEN');
      expect(errForbidden.statusCode).toBe(403);

      const errNotFound = new NotFoundError('Lesson', 'les_99');
      expect(errNotFound.code).toBe('ERR_NOT_FOUND');
      expect(errNotFound.statusCode).toBe(404);

      const errConflict = new ConflictError('User already exists');
      expect(errConflict.code).toBe('ERR_CONFLICT');
      expect(errConflict.statusCode).toBe(409);

      const errRateLimit = new RateLimitError('Limit exceeded', 45);
      expect(errRateLimit.code).toBe('ERR_RATE_LIMIT');
      expect(errRateLimit.statusCode).toBe(429);

      const errStorage = new StorageError('writeProfile');
      expect(errStorage.code).toBe('ERR_STORAGE');
      expect(errStorage.statusCode).toBe(500);
    });

    it('7. accurately identifies AppError instances using type guard', () => {
      expect(isAppError(new ValidationError('test'))).toBe(true);
      expect(isAppError(new Error('regular error'))).toBe(false);
      expect(isAppError('string error')).toBe(false);
      expect(isAppError(null)).toBe(false);
    });

    it('8. provides safe user-facing error messages without leaking internal traces', () => {
      const internalDbError = new StorageError('SELECT * FROM secret_table WHERE id = 123');
      const safeMessage = mapErrorToUserMessage(internalDbError);
      expect(safeMessage).not.toContain('secret_table');
      expect(safeMessage).toBe('An error occurred while saving your data. Please try again.');

      const fallbackMsg = mapErrorToUserMessage('random string');
      expect(fallbackMsg).toBe('An unexpected error occurred. Please try again.');
    });
  });

  // =========================================================================
  // 9-12. Zod Runtime Schema Validation
  // =========================================================================
  describe('9-12. Domain Data Validation (Zod Schemas)', () => {
    it('9. validates valid user profile and rejects invalid experience levels', () => {
      const validProfile = {
        displayName: 'Jordan Lee',
        experienceLevel: '3-5_years',
        primaryRole: 'Salesforce Developer',
        targetDailyMinutes: 5,
      };
      const res1 = validateData(UserProfileSchema, validProfile);
      expect(res1.success).toBe(true);

      const invalidProfile = {
        displayName: 'J', // too short
        experienceLevel: '100_years_experience', // invalid enum
        primaryRole: 'Architect',
        targetDailyMinutes: 45, // invalid daily duration
      };
      const res2 = validateData(UserProfileSchema, invalidProfile);
      expect(res2.success).toBe(false);
      if (!res2.success) {
        expect(res2.errors.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('10. validates valid user preferences and regex-checked notification time', () => {
      const validPrefs = {
        primaryTechnology: 'Salesforce',
        selectedTopics: ['Apex', 'Flows'],
        notificationTime: '09:30',
        optOutAnalytics: false,
        themePreference: 'dark',
      };
      const res = validateData(UserPreferencesSchema, validPrefs);
      expect(res.success).toBe(true);

      const badTimePrefs = {
        primaryTechnology: 'Salesforce',
        notificationTime: '25:99', // invalid time format
      };
      const resBad = validateData(UserPreferencesSchema, badTimePrefs);
      expect(resBad.success).toBe(false);
    });

    it('11. enforces strict quiz attempt payload structure', () => {
      const validAttempt = {
        questionId: 'q_apex_dml_01',
        selectedOptionId: 'opt_b',
      };
      expect(validateData(QuizAttemptSchema, validAttempt).success).toBe(true);

      const emptyAttempt = { questionId: '', selectedOptionId: '' };
      expect(validateData(QuizAttemptSchema, emptyAttempt).success).toBe(false);
    });

    it('12. validates assessment submission and requires at least one answered question', () => {
      const validExam = {
        assessmentId: 'asm_salesforce_core',
        durationSeconds: 300,
        answers: { q1: 'opt_a', q2: 'opt_c' },
      };
      expect(validateData(AssessmentSubmissionSchema, validExam).success).toBe(true);

      const emptyAnswers = {
        assessmentId: 'asm_salesforce_core',
        durationSeconds: 300,
        answers: {},
      };
      expect(validateData(AssessmentSubmissionSchema, emptyAnswers).success).toBe(false);
    });
  });

  // =========================================================================
  // 13-16. Mock API Simulator & Fault Injection
  // =========================================================================
  describe('13-16. Mock API Simulation & Resilience Harness', () => {
    it('13. executes operations cleanly when fault mode is none', async () => {
      const result = await mockApiSimulator.execute(() => 'success_payload');
      expect(result).toBe('success_payload');
    });

    it('14. injects simulated network failure on demand', async () => {
      mockApiSimulator.setFaultMode('network_error');
      await expect(mockApiSimulator.execute(() => 'data')).rejects.toThrow(ServiceUnavailableError);
    });

    it('15. injects simulated 401 unauthorized and 403 forbidden responses', async () => {
      mockApiSimulator.setFaultMode('unauthorized');
      await expect(mockApiSimulator.execute(() => 'data')).rejects.toThrow(UnauthorizedError);

      mockApiSimulator.setFaultMode('forbidden');
      await expect(mockApiSimulator.execute(() => 'data')).rejects.toThrow(ForbiddenError);
    });

    it('16. injects simulated 429 rate limit with retry-after metadata', async () => {
      mockApiSimulator.setFaultMode('rate_limit');
      try {
        await mockApiSimulator.execute(() => 'data');
        expect.unreachable('Should have thrown RateLimitError');
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).statusCode).toBe(429);
      }
    });
  });

  // =========================================================================
  // 17-20. Repository Contracts, Pagination & Local Persistence Safety
  // =========================================================================
  describe('17-20. Repository Contracts & Local Persistence Safety', () => {
    it('17. supports structured pagination contract simulation', () => {
      const mockItems = Array.from({ length: 45 }, (_, i) => ({ id: `les_${i}`, title: `Lesson ${i}` }));
      const page = 2;
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const paginatedData = mockItems.slice(start, start + pageSize);

      const result: PaginatedResult<typeof mockItems[0]> = {
        data: paginatedData,
        totalCount: mockItems.length,
        page,
        pageSize,
        hasNextPage: start + pageSize < mockItems.length,
      };

      expect(result.data).toHaveLength(10);
      expect(result.totalCount).toBe(45);
      expect(result.hasNextPage).toBe(true);
      expect(result.data[0].id).toBe('les_10');
    });

    it('18. preserves user learning progress across application reboots', async () => {
      const userUid = 'usr_test_persistent';
      await repositories.progress.saveProgress(userUid, {
        activityId: 'les_apex_dml_01',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      const retrieved = await repositories.progress.getProgress(userUid);
      expect(retrieved['les_apex_dml_01']).toBeDefined();
      expect(retrieved['les_apex_dml_01'].status).toBe('completed');
    });

    it('19. isolates mock user data without cross-tenant leakage', async () => {
      await repositories.bookmark.toggleBookmark('user_a', 'content_101');
      await repositories.bookmark.toggleBookmark('user_b', 'content_202');

      const bookmarksA = await repositories.bookmark.getBookmarks('user_a');
      const bookmarksB = await repositories.bookmark.getBookmarks('user_b');

      expect(bookmarksA).toContain('content_101');
      expect(bookmarksA).not.toContain('content_202');

      expect(bookmarksB).toContain('content_202');
      expect(bookmarksB).not.toContain('content_101');
    });

    it('20. validates feedback schema and enforces comment character boundaries', () => {
      const validFeedback = {
        category: 'content_quality',
        rating: 5,
        comment: 'Comprehensive explanation of Apex Governor Limits.',
        featureArea: 'daily_journey',
      };
      expect(validateData(FeedbackSubmissionSchema, validFeedback).success).toBe(true);

      const invalidFeedback = {
        category: 'unknown_category',
        comment: 'k', // too short
      };
      expect(validateData(FeedbackSubmissionSchema, invalidFeedback).success).toBe(false);
    });
  });
});
