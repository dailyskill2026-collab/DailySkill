// src/services/privacyService.ts
import { repositories } from '@/repositories';

export interface PrivacyPolicySummary {
  title: string;
  isLocalOnly: boolean;
  bullets: string[];
}

export function isAnalyticsOptedOut(): boolean {
  return repositories.analytics.isAnalyticsOptedOut();
}

export function setAnalyticsOptOut(optOut: boolean): void {
  repositories.analytics.setAnalyticsOptOut(optOut);
}

export async function clearLocalAnalyticsHistory(): Promise<void> {
  await repositories.analytics.clearEvents(false);
}

export async function clearAllLocalFeedback(): Promise<void> {
  await repositories.feedback.clearFeedback(false);
}

export async function resetAllLocalData(): Promise<void> {
  await repositories.analytics.clearEvents(false);
  await repositories.feedback.clearFeedback(false);
  await repositories.backlog.clearBacklog();
}

export function getPrivacyPolicySummary(): PrivacyPolicySummary {
  return {
    title: 'Local Privacy & Analytics Commitment',
    isLocalOnly: true,
    bullets: [
      'Zero Cloud Tracking: All learning metrics, progress, and analytics are stored 100% locally on your device.',
      'No External Analytics SDKs: We do not use Google Analytics, Mixpanel, Amplitude, or any third-party tracking pixels.',
      'PII Guard: No passwords, secrets, personal names, or free-text passwords are ever captured in event logs.',
      'Full Opt-Out Control: You can turn off local analytics recording at any time with a single toggle.',
      'One-Click Local Data Deletion: You can purge your entire locally stored analytics and feedback history whenever you wish.',
    ],
  };
}
