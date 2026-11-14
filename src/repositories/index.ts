// src/repositories/index.ts
import type { Repositories } from './types';
import { env } from '@/lib/env';
import { getFirebaseServices } from '@/lib/firebase';

// Mock Repositories
import { MockAuthRepository } from './mock/MockAuthRepository';
import { MockUserRepository } from './mock/MockUserRepository';
import { MockProgressRepository } from './mock/MockProgressRepository';
import { MockBookmarkRepository } from './mock/MockBookmarkRepository';
import { MockRevisionRepository } from './mock/MockRevisionRepository';
import { MockContentRepository } from './mock/MockContentRepository';
import { MockAuditRepository } from './mock/MockAuditRepository';
import { MockFeedbackRepository } from './mock/MockFeedbackRepository';
import { MockAnalyticsRepository } from './mock/MockAnalyticsRepository';
import { MockBacklogRepository } from './mock/MockBacklogRepository';

// Firebase Repositories
import { FirebaseAuthRepository } from './firebase/FirebaseAuthRepository';
import { FirebaseUserRepository } from './firebase/FirebaseUserRepository';
import { FirebaseProgressRepository } from './firebase/FirebaseProgressRepository';
import { FirebaseBookmarkRepository } from './firebase/FirebaseBookmarkRepository';
import { FirebaseRevisionRepository } from './firebase/FirebaseRevisionRepository';
import { FirebaseContentRepository } from './firebase/FirebaseContentRepository';
import { FirebaseAuditRepository } from './firebase/FirebaseAuditRepository';

function createMockRepositories(): Repositories {
  return {
    auth: new MockAuthRepository(),
    user: new MockUserRepository(),
    progress: new MockProgressRepository(),
    bookmark: new MockBookmarkRepository(),
    revision: new MockRevisionRepository(),
    content: new MockContentRepository(),
    audit: new MockAuditRepository(),
    feedback: new MockFeedbackRepository(),
    analytics: new MockAnalyticsRepository(),
    backlog: new MockBacklogRepository(),
    isMock: true,
  };
}

function createFirebaseRepositories(): Repositories {
  return {
    auth: new FirebaseAuthRepository(),
    user: new FirebaseUserRepository(),
    progress: new FirebaseProgressRepository(),
    bookmark: new FirebaseBookmarkRepository(),
    revision: new FirebaseRevisionRepository(),
    content: new FirebaseContentRepository(),
    audit: new FirebaseAuditRepository(),
    feedback: new MockFeedbackRepository(),
    analytics: new MockAnalyticsRepository(),
    backlog: new MockBacklogRepository(),
    isMock: false,
  };
}

export function getRepositories(): Repositories {
  const useFirebase = env.BACKEND_MODE === 'firebase' && getFirebaseServices() !== null;

  if (useFirebase) {
    try {
      return createFirebaseRepositories();
    } catch (err) {
      console.warn('[Repositories] Failed to initialize Firebase repositories, falling back to mock mode:', err);
      return createMockRepositories();
    }
  }

  return createMockRepositories();
}

export const repositories = getRepositories();
export * from './types';
