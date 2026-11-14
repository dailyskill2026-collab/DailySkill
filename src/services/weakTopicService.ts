// src/services/weakTopicService.ts
/**
 * Weak Topic Identification Service.
 * Identifies areas needing revision based on quiz accuracy and attempt thresholds.
 */

export interface TopicPerformance {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number; // percentage 0-100
  isWeak: boolean;
  explanation: string;
}

export interface QuizAttemptRecord {
  topic: string;
  isCorrect: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'it-daily-quiz-attempts';
const MIN_ATTEMPTS_THRESHOLD = 2;
const WEAK_ACCURACY_THRESHOLD = 60; // below 60% is weak

export function recordQuizAttempt(topic: string, isCorrect: boolean): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: QuizAttemptRecord[] = raw ? JSON.parse(raw) : [];
    history.push({
      topic,
      isCorrect,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function getQuizAttempts(): QuizAttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function analyzeTopicPerformance(attempts: QuizAttemptRecord[]): Record<string, TopicPerformance> {
  const grouped: Record<string, { total: number; correct: number }> = {};

  attempts.forEach((a) => {
    const key = a.topic.trim();
    if (!grouped[key]) {
      grouped[key] = { total: 0, correct: 0 };
    }
    grouped[key].total += 1;
    if (a.isCorrect) grouped[key].correct += 1;
  });

  const performance: Record<string, TopicPerformance> = {};

  Object.entries(grouped).forEach(([topic, stats]) => {
    const accuracy = Math.round((stats.correct / stats.total) * 100);
    const isWeak = stats.total >= MIN_ATTEMPTS_THRESHOLD && accuracy < WEAK_ACCURACY_THRESHOLD;

    performance[topic] = {
      topic,
      attempts: stats.total,
      correct: stats.correct,
      accuracy,
      isWeak,
      explanation: isWeak
        ? `${accuracy}% accuracy over ${stats.total} attempts (below 60% threshold)`
        : `${accuracy}% accuracy over ${stats.total} attempts (solid progress)`,
    };
  });

  return performance;
}

export function getWeakTopicsList(): string[] {
  const attempts = getQuizAttempts();
  const perf = analyzeTopicPerformance(attempts);
  return Object.values(perf)
    .filter((p) => p.isWeak)
    .map((p) => p.topic);
}
