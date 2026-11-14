// src/services/reminderService.ts
/**
 * In-App Contextual Reminder Engine.
 * Generates local, non-intrusive reminder messages without external push services.
 */

import { getDueSRSTopics } from './spacedRepetition';
import { useProgressStore } from '@/store/progressStore';
import { useProfileStore } from '@/store/profileStore';

export interface InAppReminder {
  id: string;
  type: 'plan' | 'revision' | 'continue' | 'streak';
  title: string;
  message: string;
  actionPath: string;
  actionLabel: string;
  dismissible: boolean;
}

const DISMISSED_KEY = 'it-daily-dismissed-reminders';

export function getDismissedReminderIds(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function dismissReminder(id: string): void {
  try {
    const dismissed = getDismissedReminderIds();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // ignore
  }
}

export function getActiveInAppReminders(): InAppReminder[] {
  const profile = useProfileStore.getState();
  const progress = useProgressStore.getState().dailyProgress;
  const dismissed = new Set(getDismissedReminderIds());
  const reminders: InAppReminder[] = [];

  const today = new Date().toLocaleDateString('en-CA');
  const duration = profile.dailyDuration || 5;

  // 1. Daily plan reminder if incomplete
  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length;
  const planReminderId = `plan-${today}`;

  if (completedCount === 0 && !dismissed.has(planReminderId)) {
    reminders.push({
      id: planReminderId,
      type: 'plan',
      title: 'Daily Plan Ready',
      message: `Your ${duration}-minute microlearning plan is waiting for you today.`,
      actionPath: '/',
      actionLabel: 'Start Now',
      dismissible: true,
    });
  }

  // 2. Revision due reminder
  const dueTopics = getDueSRSTopics();
  const revisionReminderId = `revision-${today}`;

  if (dueTopics.length > 0 && !dismissed.has(revisionReminderId)) {
    reminders.push({
      id: revisionReminderId,
      type: 'revision',
      title: 'Revision Due',
      message: `You have ${dueTopics.length} topic${dueTopics.length > 1 ? 's' : ''} ready for quick spaced review.`,
      actionPath: '/revise',
      actionLabel: 'Review Topics',
      dismissible: true,
    });
  }

  return reminders;
}
