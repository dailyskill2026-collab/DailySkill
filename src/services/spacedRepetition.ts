// src/services/spacedRepetition.ts
/**
 * Smart Spaced Repetition (SRS) Engine.
 * Dynamically schedules topic reviews based on consecutive correct/incorrect answers.
 */

export type SRSStatus = 'due' | 'learning' | 'reviewing' | 'mastered';

export interface SRSRecord {
  topicId: string;
  topicTitle: string;
  tag: string;
  lastReviewedDate: string; // ISO date
  nextReviewDate: string;   // YYYY-MM-DD
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  currentIntervalDays: number;
  status: SRSStatus;
}

const STORAGE_KEY = 'it-daily-srs-records';

const INTERVAL_LADDER = [1, 3, 7, 14, 30];

export function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA');
}

export function getAllSRSRecords(): Record<string, SRSRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return {};
}

export function saveSRSRecord(record: SRSRecord): void {
  try {
    const records = getAllSRSRecords();
    records[record.topicId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

/**
 * Update a topic's SRS schedule when an attempt is made.
 */
export function updateSRSAttempt(
  topicId: string,
  topicTitle: string,
  tag: string,
  isCorrect: boolean
): SRSRecord {
  const records = getAllSRSRecords();
  const existing = records[topicId];
  const today = getTodayDateString();

  let nextInterval = 1;
  let consecutiveCorrect = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  if (existing) {
    correctCount = existing.correctCount + (isCorrect ? 1 : 0);
    incorrectCount = existing.incorrectCount + (isCorrect ? 0 : 1);

    if (isCorrect) {
      consecutiveCorrect = existing.consecutiveCorrect + 1;
      const ladderIndex = Math.min(consecutiveCorrect, INTERVAL_LADDER.length - 1);
      nextInterval = INTERVAL_LADDER[ladderIndex];
    } else {
      consecutiveCorrect = 0;
      nextInterval = 1; // reset to 1 day on mistake
    }
  } else {
    correctCount = isCorrect ? 1 : 0;
    incorrectCount = isCorrect ? 0 : 1;
    consecutiveCorrect = isCorrect ? 1 : 0;
    nextInterval = isCorrect ? 3 : 1;
  }

  let status: SRSStatus = 'learning';
  if (consecutiveCorrect >= 4) {
    status = 'mastered';
  } else if (consecutiveCorrect >= 2) {
    status = 'reviewing';
  } else if (!isCorrect) {
    status = 'due';
  }

  const nextReviewDate = addDaysToDate(today, nextInterval);

  const updatedRecord: SRSRecord = {
    topicId,
    topicTitle,
    tag,
    lastReviewedDate: new Date().toISOString(),
    nextReviewDate,
    correctCount,
    incorrectCount,
    consecutiveCorrect,
    currentIntervalDays: nextInterval,
    status,
  };

  saveSRSRecord(updatedRecord);
  return updatedRecord;
}

/**
 * Returns all topics that are due for review as of today.
 */
export function getDueSRSTopics(): SRSRecord[] {
  const records = getAllSRSRecords();
  const today = getTodayDateString();

  return Object.values(records).filter((r) => r.nextReviewDate <= today);
}
