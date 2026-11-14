// src/services/contentQualityService.ts
import type {
  ContentQualityScore,
  RuleCheckResult,
  TechnicalVerificationStatus
} from '@/types/contentQuality';

export class ContentQualityService {
  /**
   * Evaluates structural quality across 5 dimensions:
   * 1. Completeness (title, summary, explanation)
   * 2. Readability (sentence flow, text length)
   * 3. Source Evidence (HTTPS URL, official doc name, release version)
   * 4. Practical Examples (real-world scenario or code snippet)
   * 5. Assessment / MCQ Quality (if MCQ: exactly 4 options, single answer)
   */
  public evaluateContent(item: {
    id: string;
    title: string;
    summary?: string;
    explanation?: string;
    difficulty?: string;
    sourceUrl?: string;
    sourceName?: string;
    version?: string;
    realWorldExample?: string;
    codeSnippet?: string;
    options?: Array<{ id: string; label: string }>;
    correctAnswerId?: string;
    verificationStatus?: string;
  }): ContentQualityScore {
    const checks: RuleCheckResult[] = [];

    // --- 1. Completeness Checks (Max 25 pts) ---
    const hasValidTitle = Boolean(item.title && item.title.trim().length >= 5);
    checks.push({
      ruleId: 'comp-title',
      name: 'Descriptive Title',
      dimension: 'completeness',
      passed: hasValidTitle,
      scoreContribution: hasValidTitle ? 5 : 0,
      maxScore: 5,
      details: hasValidTitle ? 'Title is informative and clear.' : 'Title is missing or too short (< 5 chars).'
    });

    const summaryLen = item.summary ? item.summary.trim().length : 0;
    const hasValidSummary = summaryLen >= 25;
    checks.push({
      ruleId: 'comp-summary',
      name: 'Concise Learning Summary',
      dimension: 'completeness',
      passed: hasValidSummary,
      scoreContribution: hasValidSummary ? 10 : 0,
      maxScore: 10,
      details: hasValidSummary
        ? `Summary length (${summaryLen} chars) meets standards.`
        : 'Summary missing or shorter than 25 characters.'
    });

    const explanationLen = item.explanation ? item.explanation.trim().length : 0;
    const hasValidExplanation = explanationLen >= 50;
    checks.push({
      ruleId: 'comp-explanation',
      name: 'Technical Explanation',
      dimension: 'completeness',
      passed: hasValidExplanation,
      scoreContribution: hasValidExplanation ? 10 : 0,
      maxScore: 10,
      details: hasValidExplanation
        ? `Technical explanation (${explanationLen} chars) is detailed.`
        : 'Explanation is missing or too brief (< 50 chars).'
    });

    // --- 2. Readability (Max 20 pts) ---
    const totalChars = (item.title || '').length + summaryLen + explanationLen;
    const isReadableLength = totalChars >= 100 && totalChars <= 3000;
    checks.push({
      ruleId: 'read-length',
      name: 'Micro-Learning Length Target (2-5 min)',
      dimension: 'readability',
      passed: isReadableLength,
      scoreContribution: isReadableLength ? 10 : 5,
      maxScore: 10,
      details: isReadableLength
        ? 'Total text volume fits 2–5 minute daily learning target.'
        : 'Text volume is outside recommended micro-learning boundaries.'
    });

    const isClearStructure = Boolean(
      item.title && !item.title.includes('TODO') && !item.title.includes('Placeholder')
    );
    checks.push({
      ruleId: 'read-clarity',
      name: 'No Placeholder or Boilerplate Text',
      dimension: 'readability',
      passed: isClearStructure,
      scoreContribution: isClearStructure ? 10 : 0,
      maxScore: 10,
      details: isClearStructure ? 'Clean prose without placeholders.' : 'Contains placeholder markers.'
    });

    // --- 3. Source Evidence Completeness (Max 20 pts) ---
    const hasValidUrl = Boolean(item.sourceUrl && item.sourceUrl.startsWith('https://'));
    checks.push({
      ruleId: 'evid-url',
      name: 'Secure Official Source URL',
      dimension: 'evidence',
      passed: hasValidUrl,
      scoreContribution: hasValidUrl ? 10 : 0,
      maxScore: 10,
      details: hasValidUrl
        ? `Valid secure source link (${item.sourceUrl?.slice(0, 30)}...).`
        : 'Missing or non-HTTPS source documentation URL.'
    });

    const hasVersionOrSource = Boolean(item.version || item.sourceName);
    checks.push({
      ruleId: 'evid-metadata',
      name: 'Release Version / Source Citation',
      dimension: 'evidence',
      passed: hasVersionOrSource,
      scoreContribution: hasVersionOrSource ? 10 : 0,
      maxScore: 10,
      details: hasVersionOrSource
        ? `Referenced: ${item.version || item.sourceName}`
        : 'No specific release version or document name cited.'
    });

    // --- 4. Practical Examples & Scenarios (Max 15 pts) ---
    const hasExample = Boolean(
      (item.realWorldExample && item.realWorldExample.length > 20) ||
      (item.codeSnippet && item.codeSnippet.length > 10)
    );
    checks.push({
      ruleId: 'exam-practical',
      name: 'Real-World Example or Code Snippet',
      dimension: 'examples',
      passed: hasExample,
      scoreContribution: hasExample ? 15 : 0,
      maxScore: 15,
      details: hasExample
        ? 'Includes enterprise scenario or code example.'
        : 'Lacks practical code or real-world implementation scenario.'
    });

    // --- 5. Assessment / MCQ Quality (Max 20 pts) ---
    if (item.options) {
      const has4Options = item.options.length === 4;
      const hasUniqueLabels = new Set(item.options.map(o => o.label.trim())).size === 4;
      const hasCorrectAnswer = Boolean(
        item.correctAnswerId && item.options.some(o => o.id === item.correctAnswerId)
      );
      const isMcqValid = has4Options && hasUniqueLabels && hasCorrectAnswer;

      checks.push({
        ruleId: 'mcq-structure',
        name: '4 Options with Single Unambiguous Answer',
        dimension: 'mcq_structure',
        passed: isMcqValid,
        scoreContribution: isMcqValid ? 20 : 5,
        maxScore: 20,
        details: isMcqValid
          ? 'MCQ conforms strictly to 4 distinct options and 1 valid answer key.'
          : 'MCQ fails 4-option or answer key validation.'
      });
    } else {
      // Non-MCQ article gets full structural points for this slot if explanation is thorough
      const isArticleDetailed = hasValidExplanation;
      checks.push({
        ruleId: 'art-depth',
        name: 'Technical Depth (Article Mode)',
        dimension: 'completeness',
        passed: isArticleDetailed,
        scoreContribution: isArticleDetailed ? 20 : 10,
        maxScore: 20,
        details: isArticleDetailed ? 'Article depth is sufficient.' : 'Article depth could be expanded.'
      });
    }

    const totalScore = Math.min(
      100,
      checks.reduce((acc, c) => acc + c.scoreContribution, 0)
    );

    let rating: 'excellent' | 'good' | 'needs_improvement' | 'poor' = 'poor';
    if (totalScore >= 85) rating = 'excellent';
    else if (totalScore >= 70) rating = 'good';
    else if (totalScore >= 50) rating = 'needs_improvement';

    // Factual verification status is strictly separated from structural score
    const isFactuallyVerified = item.verificationStatus === 'verified';
    const verificationBadge: TechnicalVerificationStatus =
      item.verificationStatus === 'verified'
        ? 'verified'
        : item.verificationStatus === 'sample' || item.verificationStatus === 'published'
        ? 'sample'
        : 'unreviewed';

    return {
      contentId: item.id,
      title: item.title,
      totalScore,
      rating,
      isFactuallyVerified,
      verificationBadge,
      checks
    };
  }
}

export const contentQualityService = new ContentQualityService();
