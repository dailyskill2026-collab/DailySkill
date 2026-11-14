// src/ai/schemas.ts
// Zod schemas for AI‑generated content drafts.
// These are used both in mock mode (fixtures) and live mode (LLM output validation).

import { z } from 'zod';

// ----- Topic ------------------------------------------------------------
export const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  relevanceScore: z.number().min(0).max(1),
});
export type Topic = z.infer<typeof TopicSchema>;

// ----- Lesson -----------------------------------------------------------
export const LessonSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  title: z.string(),
  shortExplanation: z.string(),
  whyItMatters: z.string(),
  realWorldExample: z.string().optional(),
  estimatedMinutes: z.number().int().positive(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  releaseVersion: z.string().optional(),
  verificationStatus: z.enum(['verified', 'sample']),
});
export type Lesson = z.infer<typeof LessonSchema>;

// ----- Scenario ----------------------------------------------------------
export const ScenarioSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  description: z.string(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

// ----- MCQ --------------------------------------------------------------
export const MCQOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});
export const MCQSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  question: z.string(),
  options: z.array(MCQOptionSchema).min(2),
  correctOptionId: z.string(),
  explanation: z.string().optional(),
});
export type MCQ = z.infer<typeof MCQSchema>;

// ----- Evidence ----------------------------------------------------------
export const EvidenceSchema = z.object({
  id: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  citation: z.string(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

// ----- Draft -------------------------------------------------------------
export const DraftSchema = z.object({
  documentId: z.string(),
  sourceName: z.string(),
  originalUrl: z.string().url(),
  title: z.string(),
  technology: z.string(),
  releaseVersion: z.string().optional(),
  publishedAt: z.string().optional(),
  fetchedAt: z.string().optional(),
  topics: z.array(TopicSchema),
  lessons: z.array(LessonSchema),
  scenarios: z.array(ScenarioSchema),
  mcqs: z.array(MCQSchema),
  evidences: z.array(EvidenceSchema),
});
export type Draft = z.infer<typeof DraftSchema>;
