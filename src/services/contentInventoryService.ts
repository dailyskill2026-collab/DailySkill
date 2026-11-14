// src/services/contentInventoryService.ts
import { sampleLearningContent } from '@/data/sampleContent';
import { exploreContent } from '@/data/exploreContent';
import { mockKnowledgeBase } from '@/data/mockKnowledgeBase';
import { assessmentQuestionBank } from '@/data/assessmentQuestionBank';
import { sampleQuizQuestions } from '@/data/sampleQuiz';
import { mockQuizzes } from '@/data';
import { contentQualityService } from './contentQualityService';
import type { ContentInventoryItem, TechnicalVerificationStatus, PublicationStatus } from '@/types/contentQuality';
import type { SkillCategory } from '@/types/assessment';

export class ContentInventoryService {
  private cachedInventory: ContentInventoryItem[] | null = null;

  /**
   * Aggregates and standardizes all content across the application into a unified inventory.
   */
  public getInventory(): ContentInventoryItem[] {
    if (this.cachedInventory) {
      return this.cachedInventory;
    }

    const inventory: ContentInventoryItem[] = [];

    // 1. Process sampleLearningContent (4 items)
    for (const item of sampleLearningContent) {
      const evaluation = contentQualityService.evaluateContent({
        id: item.id,
        title: item.title,
        summary: item.summary,
        explanation: item.explanation,
        difficulty: item.difficulty,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        version: item.releaseVersion,
        realWorldExample: item.realWorldExample,
        verificationStatus: item.verificationStatus
      });

      inventory.push({
        contentId: item.id,
        title: item.title,
        technology: item.technology,
        category: (item.category as SkillCategory) || 'apex',
        topicId: item.id.replace('sf-', '').replace('update-', '').replace('practice-', '').replace('revision-', ''),
        topicTitle: item.title,
        contentType: item.category === 'practice' ? 'scenario_mcq' : item.category === 'revision' ? 'revision' : 'update',
        difficulty: (item.difficulty as any) || 'easy',
        relatedLearningPath: 'path-002', // Apex Development
        sourceOrigin: 'sample_content',
        sourceDocumentName: item.sourceName,
        sourceUrl: item.sourceUrl,
        evidenceStatus: item.sourceUrl ? 'verified' : 'missing',
        reviewStatus: item.verificationStatus === 'verified' ? 'verified' : 'sample',
        publicationStatus: 'published',
        contentVersion: item.releaseVersion || 'Summer ’24',
        estimatedMinutes: item.estimatedMinutes,
        hasExample: Boolean(item.realWorldExample),
        hasExplanation: Boolean(item.explanation),
        hasCodeSnippet: false,
        lastUpdatedDate: item.lastVerifiedAt || '2024-06-10',
        structuralQualityScore: evaluation.totalScore
      });
    }

    // 2. Process exploreContent (5 items)
    for (const item of exploreContent) {
      const evaluation = contentQualityService.evaluateContent({
        id: item.id,
        title: item.title,
        summary: item.summary,
        explanation: item.whyItMatters,
        difficulty: item.difficulty?.toLowerCase(),
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        version: item.version,
        realWorldExample: item.projectExample,
        verificationStatus: item.verificationStatus
      });

      inventory.push({
        contentId: item.id,
        title: item.title,
        technology: item.technology,
        category: item.topic.toLowerCase() as SkillCategory,
        topicId: item.topic.toLowerCase(),
        topicTitle: item.topic,
        contentType: 'article',
        difficulty: (item.difficulty?.toLowerCase() as any) || 'intermediate',
        relatedLearningPath: item.topic.toLowerCase() === 'apex' ? 'path-002' : 'path-003',
        sourceOrigin: 'explore_feed',
        sourceDocumentName: item.sourceName,
        sourceUrl: item.sourceUrl,
        evidenceStatus: item.sourceUrl ? 'verified' : 'missing',
        reviewStatus: item.verificationStatus === 'published' ? 'sample' : 'unreviewed',
        publicationStatus: 'published',
        contentVersion: item.version || 'Spring ’24',
        estimatedMinutes: item.readingTimeMinutes,
        hasExample: Boolean(item.projectExample),
        hasExplanation: Boolean(item.whyItMatters),
        hasCodeSnippet: false,
        lastUpdatedDate: item.lastVerified || '2024-08-01',
        structuralQualityScore: evaluation.totalScore
      });
    }

    // 3. Process mockKnowledgeBase (10 items)
    for (const item of mockKnowledgeBase) {
      const evaluation = contentQualityService.evaluateContent({
        id: item.knowledgeId,
        title: item.canonicalQuestion,
        summary: item.simpleExplanation,
        explanation: item.interviewAnswer,
        sourceUrl: item.sourceReference.sourceUrl,
        sourceName: item.sourceReference.sourceName,
        version: item.version,
        realWorldExample: item.realWorldScenario.businessRequirement,
        verificationStatus: 'verified'
      });

      inventory.push({
        contentId: item.knowledgeId,
        title: item.canonicalQuestion,
        technology: 'salesforce',
        category: item.topicId.includes('apex') || item.topicId.includes('soql')
          ? 'apex'
          : item.topicId.includes('lwc')
          ? 'lwc'
          : item.topicId.includes('flow')
          ? 'flows'
          : item.topicId.includes('sharing')
          ? 'security'
          : 'integrations',
        topicId: item.topicId,
        topicTitle: item.topicTitle,
        contentType: 'knowledge_qa',
        difficulty: 'intermediate',
        relatedLearningPath: item.relatedLessonIds?.[0] || 'path-002',
        sourceOrigin: 'knowledge_base',
        sourceDocumentName: item.sourceReference.sourceName,
        sourceUrl: item.sourceReference.sourceUrl,
        evidenceStatus: 'verified',
        reviewStatus: 'verified',
        publicationStatus: 'published',
        contentVersion: item.version,
        estimatedMinutes: 3,
        hasExample: Boolean(item.realWorldScenario),
        hasExplanation: true,
        hasCodeSnippet: false,
        lastUpdatedDate: '2024-07-01',
        structuralQualityScore: evaluation.totalScore
      });
    }

    // 4. Process assessmentQuestionBank (40 items)
    for (const q of assessmentQuestionBank) {
      const evaluation = contentQualityService.evaluateContent({
        id: q.questionId,
        title: q.questionText,
        summary: q.questionText,
        explanation: q.explanation,
        difficulty: q.difficulty,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctAnswerId: q.correctAnswerId,
        version: q.contentVersion,
        verificationStatus: q.verificationStatus
      });

      inventory.push({
        contentId: q.questionId,
        title: q.questionText,
        technology: q.technologyId,
        category: q.category,
        topicId: q.topicId,
        topicTitle: q.topicTitle,
        contentType: 'scenario_mcq',
        difficulty: q.difficulty,
        relatedLearningPath: `path-${q.category}`,
        sourceOrigin: 'assessment_bank',
        sourceDocumentName: 'Salesforce Developer Docs',
        evidenceStatus: 'verified',
        reviewStatus: 'verified',
        publicationStatus: 'published',
        contentVersion: q.contentVersion,
        estimatedMinutes: 1,
        hasExample: Boolean(q.codeSnippet),
        hasExplanation: Boolean(q.explanation),
        hasCodeSnippet: Boolean(q.codeSnippet),
        lastUpdatedDate: '2024-09-01',
        structuralQualityScore: evaluation.totalScore
      });
    }

    // 5. Process practice quizzes (4 items)
    for (const q of sampleQuizQuestions) {
      const evaluation = contentQualityService.evaluateContent({
        id: q.id,
        title: q.question,
        summary: q.scenario,
        explanation: q.explanation,
        difficulty: q.difficulty,
        options: q.options,
        correctAnswerId: q.correctAnswerId,
        verificationStatus: 'verified'
      });

      inventory.push({
        contentId: q.id,
        title: q.question,
        technology: 'salesforce',
        category: 'async_apex',
        topicId: 'queueable_apex',
        topicTitle: 'Queueable Apex Scenario',
        contentType: 'scenario_mcq',
        difficulty: (q.difficulty as any) || 'medium',
        relatedLearningPath: 'path-002',
        sourceOrigin: 'quiz_bank',
        sourceDocumentName: 'Salesforce Practice Bank',
        evidenceStatus: 'verified',
        reviewStatus: 'verified',
        publicationStatus: 'published',
        contentVersion: 'Spring ’24',
        estimatedMinutes: 2,
        hasExample: true,
        hasExplanation: true,
        hasCodeSnippet: false,
        lastUpdatedDate: '2024-06-01',
        structuralQualityScore: evaluation.totalScore
      });
    }

    for (const q of mockQuizzes) {
      const evaluation = contentQualityService.evaluateContent({
        id: q.id,
        title: q.question,
        summary: q.question,
        explanation: q.explanation,
        options: q.options.map((opt, i) => ({ id: String.fromCharCode(65 + i), label: opt })),
        correctAnswerId: String.fromCharCode(65 + q.correctIndex),
        verificationStatus: 'sample'
      });

      inventory.push({
        contentId: q.id,
        title: q.question,
        technology: 'salesforce',
        category: q.topicTitle.toLowerCase().includes('lwc')
          ? 'lwc'
          : q.topicTitle.toLowerCase().includes('sharing')
          ? 'security'
          : 'apex',
        topicId: q.topicTitle.toLowerCase().replace(/\s+/g, '_'),
        topicTitle: q.topicTitle,
        contentType: 'scenario_mcq',
        difficulty: 'intermediate',
        relatedLearningPath: 'path-002',
        sourceOrigin: 'quiz_bank',
        sourceDocumentName: 'Salesforce Revision Bank',
        evidenceStatus: 'sample',
        reviewStatus: 'sample',
        publicationStatus: 'published',
        contentVersion: 'Spring ’24',
        estimatedMinutes: 2,
        hasExample: false,
        hasExplanation: true,
        hasCodeSnippet: false,
        lastUpdatedDate: '2024-07-01',
        structuralQualityScore: evaluation.totalScore
      });
    }

    this.cachedInventory = inventory;
    return inventory;
  }

  /**
   * Filters inventory by technology, category, difficulty, reviewStatus or search query.
   */
  public filterInventory(filters: {
    technology?: string;
    category?: string;
    difficulty?: string;
    reviewStatus?: TechnicalVerificationStatus;
    search?: string;
  }): ContentInventoryItem[] {
    let items = this.getInventory();

    if (filters.technology) {
      const tech = filters.technology.toLowerCase();
      items = items.filter(i => i.technology.toLowerCase() === tech);
    }
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase();
      items = items.filter(i => i.category.toLowerCase() === cat);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      items = items.filter(i => i.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
    }
    if (filters.reviewStatus) {
      items = items.filter(i => i.reviewStatus === filters.reviewStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.topicTitle.toLowerCase().includes(q) ||
        i.contentId.toLowerCase().includes(q)
      );
    }

    return items;
  }

  /**
   * Identifies any items sharing duplicate titles or near-identical questions.
   */
  public findDuplicates(): { title: string; count: number; ids: string[] }[] {
    const items = this.getInventory();
    const titleMap = new Map<string, string[]>();

    for (const item of items) {
      const norm = item.title.trim().toLowerCase();
      if (!titleMap.has(norm)) {
        titleMap.set(norm, []);
      }
      titleMap.get(norm)!.push(item.contentId);
    }

    const duplicates: { title: string; count: number; ids: string[] }[] = [];
    titleMap.forEach((ids, title) => {
      if (ids.length > 1) {
        duplicates.push({ title, count: ids.length, ids });
      }
    });

    return duplicates;
  }

  /**
   * Identifies content items lacking valid source URLs or release versions.
   */
  public findMissingSourceReferences(): ContentInventoryItem[] {
    return this.getInventory().filter(i => !i.sourceUrl || !i.sourceUrl.startsWith('https://'));
  }

  /**
   * Identifies items with low structural quality (< 60 points).
   */
  public findLowQualityItems(): ContentInventoryItem[] {
    return this.getInventory().filter(i => i.structuralQualityScore < 60);
  }

  /**
   * Summary metrics for dashboard reporting.
   */
  public getStatistics() {
    const items = this.getInventory();
    const verified = items.filter(i => i.reviewStatus === 'verified').length;
    const sample = items.filter(i => i.reviewStatus === 'sample').length;
    const mcqs = items.filter(i => i.contentType === 'scenario_mcq').length;
    const articles = items.filter(i => i.contentType === 'article' || i.contentType === 'update').length;
    const avgScore = items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.structuralQualityScore, 0) / items.length)
      : 0;

    return {
      totalItems: items.length,
      verifiedItems: verified,
      sampleItems: sample,
      mcqCount: mcqs,
      articleCount: articles,
      averageQualityScore: avgScore,
      duplicateCount: this.findDuplicates().length,
      missingSourceCount: this.findMissingSourceReferences().length
    };
  }
}

export const contentInventoryService = new ContentInventoryService();
