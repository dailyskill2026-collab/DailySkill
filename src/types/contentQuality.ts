// src/types/contentQuality.ts
import type { SkillCategory } from './assessment';

export type ContentSourceOrigin =
  | 'sample_content'
  | 'explore_feed'
  | 'knowledge_base'
  | 'assessment_bank'
  | 'quiz_bank';

export type TechnicalVerificationStatus = 'verified' | 'sample' | 'unreviewed';
export type PublicationStatus = 'published' | 'draft' | 'archived';

export interface ContentInventoryItem {
  contentId: string;
  title: string;
  technology: string;
  category: SkillCategory | string;
  topicId: string;
  topicTitle: string;
  contentType: 'article' | 'scenario_mcq' | 'knowledge_qa' | 'update' | 'revision';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedLearningPath?: string;
  sourceOrigin: ContentSourceOrigin;
  sourceDocumentName?: string;
  sourceUrl?: string;
  evidenceStatus: 'verified' | 'sample' | 'missing';
  reviewStatus: TechnicalVerificationStatus;
  publicationStatus: PublicationStatus;
  contentVersion: string;
  estimatedMinutes?: number;
  hasExample: boolean;
  hasExplanation: boolean;
  hasCodeSnippet: boolean;
  lastUpdatedDate: string;
  structuralQualityScore: number; // 0 - 100
}

export interface RuleCheckResult {
  ruleId: string;
  name: string;
  dimension: 'completeness' | 'readability' | 'evidence' | 'examples' | 'mcq_structure';
  passed: boolean;
  scoreContribution: number;
  maxScore: number;
  details: string;
}

export interface ContentQualityScore {
  contentId: string;
  title: string;
  totalScore: number; // 0 - 100
  rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  isFactuallyVerified: boolean;
  verificationBadge: TechnicalVerificationStatus;
  checks: RuleCheckResult[];
}

export type TopicCoverageStatus = 'available' | 'partially_covered' | 'missing' | 'needs_review';

export interface TopicCoverageItem {
  topicId: string;
  title: string;
  category: SkillCategory;
  coverageStatus: TopicCoverageStatus;
  lessonsCount: number;
  mcqsCount: number;
  knowledgeEntriesCount: number;
  relatedContentIds: string[];
}

export interface CategoryCoverageSummary {
  category: SkillCategory;
  categoryLabel: string;
  totalTopics: number;
  availableTopics: number;
  partiallyCoveredTopics: number;
  missingTopics: number;
  coveragePercentage: number;
  topics: TopicCoverageItem[];
}

export interface OverallCoverageReport {
  totalTopics: number;
  availableTopics: number;
  partiallyCoveredTopics: number;
  missingTopics: number;
  needsReviewTopics: number;
  overallCoveragePercentage: number;
  categories: CategoryCoverageSummary[];
  unmappedInventoryCount: number;
}

export interface BetaReadinessItem {
  id: string;
  dimension: string;
  title: string;
  status: 'complete' | 'partially_complete' | 'not_started' | 'blocked';
  notes: string;
  isMockOnly: boolean;
}

export interface MVPScopeFeature {
  featureId: string;
  name: string;
  category: 'must_have' | 'should_have' | 'later';
  description: string;
  status: 'ready' | 'in_progress' | 'deferred';
  targetRelease: string;
}
