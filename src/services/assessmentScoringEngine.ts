// src/services/assessmentScoringEngine.ts
import type {
  AssessmentQuestion,
  UserAnswer,
  TopicPerformance,
  SkillClassification,
  SkillCategory,
} from '@/types/assessment';

export interface ScoringResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  percentageScore: number;
  answers: UserAnswer[];
  topicPerformances: TopicPerformance[];
}

export class AssessmentScoringEngine {
  calculateScore(
    questions: AssessmentQuestion[],
    selectedAnswers: Record<string, string | null>
  ): ScoringResult {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const userAnswers: UserAnswer[] = [];
    const topicMap: Record<
      string,
      {
        topicTitle: string;
        category: SkillCategory;
        attempted: number;
        correct: number;
      }
    > = {};

    for (const q of questions) {
      const selected = selectedAnswers[q.questionId] || null;
      const isCorrect = selected !== null && selected === q.correctAnswerId;

      if (selected === null) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      userAnswers.push({
        questionId: q.questionId,
        selectedOptionId: selected,
        isCorrect,
      });

      // Group by topic
      if (!topicMap[q.topicId]) {
        topicMap[q.topicId] = {
          topicTitle: q.topicTitle,
          category: q.category,
          attempted: 0,
          correct: 0,
        };
      }
      topicMap[q.topicId].attempted++;
      if (isCorrect) {
        topicMap[q.topicId].correct++;
      }
    }

    const total = questions.length;
    const percentageScore = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Calculate Topic-wise Performance
    const topicPerformances: TopicPerformance[] = Object.entries(topicMap).map(
      ([topicId, data]) => {
        const accuracy =
          data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;

        let classification: SkillClassification;
        let recommendedAction: string;

        if (data.attempted < 3) {
          classification = 'insufficient_evidence';
          recommendedAction = 'Attempt more questions in this topic to establish a confident baseline.';
        } else if (accuracy >= 80) {
          classification = 'strong';
          recommendedAction = 'Demonstrated mastery. Maintain knowledge with periodic spaced reviews.';
        } else if (accuracy >= 50) {
          classification = 'developing';
          recommendedAction = 'Good foundation. Practice scenario questions and review key edge cases.';
        } else {
          classification = 'needs_practice';
          recommendedAction = 'Skill gap detected. Priority: Revise core lesson concepts and retest.';
        }

        return {
          topicId,
          topicTitle: data.topicTitle,
          category: data.category,
          questionsAttempted: data.attempted,
          correctAnswers: data.correct,
          accuracy,
          classification,
          recommendedAction,
        };
      }
    );

    return {
      totalQuestions: total,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      percentageScore,
      answers: userAnswers,
      topicPerformances,
    };
  }
}

export const assessmentScoringEngine = new AssessmentScoringEngine();
