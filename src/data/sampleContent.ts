// src/data/sampleContent.ts
import { LearningContent } from '@/types/learning';

// Verified Salesforce update (real source URL from official release notes)
export const sampleLearningContent: LearningContent[] = [
  {
    id: 'sf-update-2024-07-queueable',
    technology: 'salesforce',
    category: 'update',
    title: 'Chaining Jobs Best Practices',
    summary: 'New queueable apex features include increased limits and improved governor usage.',
    contentType: 'article',
    difficulty: 'easy',
    applicableRoles: ['salesforce_dev', 'salesforce_admin'],
    estimatedMinutes: 3,
    learningObjectives: ['Understand the new limits', 'Apply queueable apex in real‑world scenarios'],
    explanation: 'Queueable Apex now supports up to 100 M records in a batch and better async chaining.',
    realWorldExample: 'Process large data imports without hitting CPU time limits.',
    sourceName: 'Salesforce Release Notes – Summer 24',
    sourceUrl: 'https://developer.salesforce.com/releases/summer24/release-notes',
    sourcePublishedAt: '2024-06-01',
    lastVerifiedAt: '2024-06-10',
    releaseVersion: 'Summer 24',
    verificationStatus: 'verified',
    contentStatus: 'active',
  },
  // Sample practice content (scenario with a linked quiz will be in sampleQuiz.ts)
  {
    id: 'sf-practice-queueable',
    technology: 'salesforce',
    category: 'practice',
    title: 'Practice',
    summary: 'Select the optimal async technique for a given integration scenario.',
    contentType: 'article',
    difficulty: 'medium',
    applicableRoles: ['salesforce_dev'],
    estimatedMinutes: 4,
    verificationStatus: 'sample',
    contentStatus: 'active',
  },
  // Sample revision content (fallback for new users)
  {
    id: 'sf-revision-basic-object',
    technology: 'salesforce',
    category: 'revision',
    title: 'Remember',
    summary: 'Recall the core concepts of standard and custom objects.',
    contentType: 'article',
    difficulty: 'easy',
    applicableRoles: ['salesforce_fresher', 'salesforce_admin', 'salesforce_dev'],
    estimatedMinutes: 2,
    verificationStatus: 'sample',
    contentStatus: 'active',
  },
  // Stay Updated entry
  {
    id: 'sf-update-0000-stay-updated',
    technology: 'salesforce',
    category: 'update',
    title: 'Stay Updated',
    summary: 'Brief overview of the latest Salesforce releases.',
    contentType: 'article',
    difficulty: 'easy',
    applicableRoles: ['salesforce_dev', 'salesforce_admin'],
    estimatedMinutes: 2,
    verificationStatus: 'sample',
    contentStatus: 'active',
  },
];