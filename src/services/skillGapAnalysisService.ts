import {
  AssessmentAttempt,
  TopicPerformance,
  SkillClassification,
  SkillCategory
} from '../types/assessment';

export interface TopicGapAnalysis {
  topic: string;
  category: SkillCategory;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPercentage: number;
  classification: SkillClassification;
  confidence: 'high' | 'medium' | 'low';
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  lastAssessedAt: string;
}

export interface OverallGapReport {
  totalAssessments: number;
  strongTopics: TopicGapAnalysis[];
  developingTopics: TopicGapAnalysis[];
  needsPracticeTopics: TopicGapAnalysis[];
  insufficientEvidenceTopics: TopicGapAnalysis[];
  topWeaknesses: TopicGapAnalysis[];
  recommendedFocusCategory?: SkillCategory;
}

export class SkillGapAnalysisService {
  /**
   * Analyzes a list of historical assessment attempts to produce
   * topic-level gap analysis with trend tracking and confidence ratings.
   */
  public analyzeSkillGaps(attempts: AssessmentAttempt[]): OverallGapReport {
    if (!attempts || attempts.length === 0) {
      return {
        totalAssessments: 0,
        strongTopics: [],
        developingTopics: [],
        needsPracticeTopics: [],
        insufficientEvidenceTopics: [],
        topWeaknesses: []
      };
    }

    // Sort attempts chronologically ascending
    const sortedAttempts = [...attempts].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    // Group topic performances across attempts
    const topicHistoryMap = new Map<string, { category: SkillCategory; performances: TopicPerformance[]; dates: string[] }>();

    for (const attempt of sortedAttempts) {
      const perfs = attempt.topicPerformances || [];
      for (const tp of perfs) {
        const topicName = tp.topicTitle || tp.topicId;
        if (!topicHistoryMap.has(topicName)) {
          topicHistoryMap.set(topicName, {
            category: tp.category,
            performances: [],
            dates: []
          });
        }
        const entry = topicHistoryMap.get(topicName)!;
        entry.performances.push(tp);
        entry.dates.push(attempt.completedAt);
      }
    }

    const topicAnalyses: TopicGapAnalysis[] = [];

    topicHistoryMap.forEach((entry, topic) => {
      const totalQuestions = entry.performances.reduce((acc, p) => acc + (p.questionsAttempted || 0), 0);
      const correctQuestions = entry.performances.reduce((acc, p) => acc + (p.correctAnswers || 0), 0);
      const accuracyPercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
      const lastAssessedAt = entry.dates[entry.dates.length - 1];

      // Conservative classification: requires >= 3 total questions / interactions before labeling as strong or needs_practice
      let classification: SkillClassification;
      let confidence: 'high' | 'medium' | 'low';

      if (totalQuestions < 3) {
        classification = 'insufficient_evidence';
        confidence = 'low';
      } else {
        if (accuracyPercentage >= 80) {
          classification = 'strong';
          confidence = totalQuestions >= 6 ? 'high' : 'medium';
        } else if (accuracyPercentage >= 50) {
          classification = 'developing';
          confidence = totalQuestions >= 6 ? 'high' : 'medium';
        } else {
          classification = 'needs_practice';
          confidence = totalQuestions >= 6 ? 'high' : 'medium';
        }
      }

      // Trend analysis
      let trend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data';
      if (entry.performances.length >= 2) {
        const mid = Math.floor(entry.performances.length / 2);
        const firstHalf = entry.performances.slice(0, mid);
        const secondHalf = entry.performances.slice(mid);

        const firstTotal = firstHalf.reduce((acc, p) => acc + (p.questionsAttempted || 0), 0);
        const firstCorrect = firstHalf.reduce((acc, p) => acc + (p.correctAnswers || 0), 0);
        const firstAcc = firstTotal > 0 ? (firstCorrect / firstTotal) * 100 : 0;

        const secondTotal = secondHalf.reduce((acc, p) => acc + (p.questionsAttempted || 0), 0);
        const secondCorrect = secondHalf.reduce((acc, p) => acc + (p.correctAnswers || 0), 0);
        const secondAcc = secondTotal > 0 ? (secondCorrect / secondTotal) * 100 : 0;

        const delta = secondAcc - firstAcc;
        if (delta >= 10) {
          trend = 'improving';
        } else if (delta <= -10) {
          trend = 'declining';
        } else {
          trend = 'stable';
        }
      }

      topicAnalyses.push({
        topic,
        category: entry.category,
        totalQuestions,
        correctQuestions,
        accuracyPercentage,
        classification,
        confidence,
        trend,
        lastAssessedAt
      });
    });

    const strongTopics = topicAnalyses.filter(t => t.classification === 'strong');
    const developingTopics = topicAnalyses.filter(t => t.classification === 'developing');
    const needsPracticeTopics = topicAnalyses.filter(t => t.classification === 'needs_practice');
    const insufficientEvidenceTopics = topicAnalyses.filter(t => t.classification === 'insufficient_evidence');

    // Top weaknesses: needsPractice sorted by lowest accuracy, then developing
    const topWeaknesses = [
      ...needsPracticeTopics.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage),
      ...developingTopics.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
    ].slice(0, 5);

    // Identify recommended focus category (category with the lowest avg accuracy among evaluated topics)
    const categoryAccMap = new Map<SkillCategory, { total: number; correct: number }>();
    for (const ta of topicAnalyses) {
      if (!categoryAccMap.has(ta.category)) {
        categoryAccMap.set(ta.category, { total: 0, correct: 0 });
      }
      const cat = categoryAccMap.get(ta.category)!;
      cat.total += ta.totalQuestions;
      cat.correct += ta.correctQuestions;
    }

    let lowestAcc = 101;
    let recommendedFocusCategory: SkillCategory | undefined;
    categoryAccMap.forEach((data, category) => {
      if (data.total >= 3) {
        const acc = (data.correct / data.total) * 100;
        if (acc < lowestAcc && acc < 80) {
          lowestAcc = acc;
          recommendedFocusCategory = category;
        }
      }
    });

    return {
      totalAssessments: attempts.length,
      strongTopics,
      developingTopics,
      needsPracticeTopics,
      insufficientEvidenceTopics,
      topWeaknesses,
      recommendedFocusCategory
    };
  }
}

export const skillGapAnalysisService = new SkillGapAnalysisService();
