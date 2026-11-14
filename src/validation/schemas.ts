/**
 * Sprint 16: Centralized Domain Data Validation Schemas
 * Powered by Zod for robust runtime validation at service boundaries.
 */

import { z } from 'zod';

// ==========================================
// 1. User & Profile Schemas
// ==========================================

export const ExperienceLevelSchema = z.enum([
  'fresher',
  '1-3_years',
  '3-5_years',
  '5+_years',
]);

export const UserProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name cannot exceed 100 characters'),
  experienceLevel: ExperienceLevelSchema,
  primaryRole: z.string().trim().min(2, 'Primary role is required'),
  targetDailyMinutes: z
    .number()
    .int()
    .refine((val) => [2, 5, 10].includes(val), {
      message: 'Target daily minutes must be 2, 5, or 10',
    }),
});

export const UserPreferencesSchema = z.object({
  primaryTechnology: z.string().trim().min(1, 'Primary technology is required'),
  selectedTopics: z.array(z.string()).default([]),
  notificationTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  optOutAnalytics: z.boolean().default(false),
  themePreference: z.enum(['light', 'dark', 'system']).default('system'),
});

// ==========================================
// 2. Content & MCQ Schemas
// ==========================================

export const QuizOptionSchema = z.object({
  id: z.string().min(1, 'Option ID required'),
  label: z.string().min(1, 'Option label required'),
});

export const MCQQuestionSchema = z.object({
  id: z.string().min(1, 'Question ID required'),
  lessonId: z.string().min(1, 'Lesson ID required'),
  scenario: z.string().min(10, 'Scenario description must be at least 10 characters'),
  question: z.string().min(5, 'Question prompt required'),
  options: z.array(QuizOptionSchema).min(2, 'At least 2 options required'),
  correctAnswerId: z.string().min(1, 'Correct answer ID required'),
  explanation: z.string().min(10, 'Explanation must be at least 10 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const SourceCitationSchema = z.object({
  sourceName: z.string().min(1, 'Source name required'),
  sourceUrl: z.string().url('Must be a valid URL').optional(),
  evidenceStatus: z.enum(['verified', 'sample', 'flagged']).default('verified'),
});

export const LessonSchema = z.object({
  id: z.string().min(1, 'Lesson ID required'),
  topicId: z.string().min(1, 'Topic ID required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  contentMarkdown: z.string().min(20, 'Content markdown must be at least 20 characters'),
  estimatedMinutes: z.number().int().min(1).max(15),
  releaseVersion: z.string().optional(),
  status: z.enum(['draft', 'staged', 'verified', 'published', 'archived']).default('draft'),
  citations: z.array(SourceCitationSchema).min(1, 'At least one verified source citation is required'),
});

export const ContentPublishingSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID required'),
  reviewerId: z.string().min(1, 'Reviewer ID required'),
  approved: z.boolean(),
  notes: z.string().max(500).optional(),
});

// ==========================================
// 3. Learning Progress & Quiz Attempts
// ==========================================

export const LearningProgressSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID required'),
  durationSeconds: z.number().int().nonnegative('Duration must be positive or zero'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
});

export const QuizAttemptSchema = z.object({
  questionId: z.string().min(1, 'Question ID required'),
  selectedOptionId: z.string().min(1, 'Selected option ID required'),
});

// ==========================================
// 4. Assessment Attempts & Submissions
// ==========================================

export const AssessmentSubmissionSchema = z.object({
  assessmentId: z.string().min(1, 'Assessment ID required'),
  durationSeconds: z.number().int().positive('Assessment duration must be greater than zero'),
  answers: z.record(z.string(), z.string()).refine((ans) => Object.keys(ans).length > 0, {
    message: 'Assessment submission must contain at least one answered question',
  }),
});

// ==========================================
// 5. Feedback & Analytics Schemas
// ==========================================

export const FeedbackSubmissionSchema = z.object({
  category: z.enum([
    'content_quality',
    'bug_report',
    'feature_request',
    'app_experience',
    'general_feedback',
  ]),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z
    .string()
    .trim()
    .min(3, 'Feedback must be at least 3 characters')
    .max(1000, 'Feedback cannot exceed 1000 characters'),
  featureArea: z.string().optional(),
});

export const AnalyticsEventSchema = z.object({
  eventName: z.string().min(2, 'Event name required'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

// Helper validation functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map((e) => `${e.path.join('.') || 'root'}: ${e.message}`);
  return { success: false, errors };
}
