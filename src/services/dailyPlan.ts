// src/services/dailyPlan.ts
import { LearningContent, DailyLearningPlan } from '@/types/learning';
import { sampleLearningContent } from '@/data/sampleContent';
import { useProfileStore } from '@/store/profileStore';
import { getWeakTopicsList } from './weakTopicService';
import { getDueSRSTopics } from './spacedRepetition';
import {
  dailyReleaseFeed,
  getDailyReleaseByDate,
  getAllDailyReleaseContents,
} from '@/data/dailyReleaseFeed';

// Helper to create a deterministic profile key for caching
function getProfileKey(profile: any): string {
  const { technology, role, interests = [], goals = [], experience, dailyDuration = 5 } = profile;
  const sortedInterests = [...interests].sort().join(',');
  const sortedGoals = [...goals].sort().join(',');
  return `${technology}|${role}|${sortedInterests}|${sortedGoals}|${experience}|${dailyDuration}`;
}

export interface DailyPlanMetrics {
  totalActivities: number;
  completedActivities: number;
  totalEstimatedMinutes: number;
  percentCompleted: number;
  hasWeakTopicIncluded: boolean;
}

export function getDailyTopicOffset(): number {
  try {
    const raw = localStorage.getItem('daily-topic-offset');
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setDailyTopicOffset(offset: number): void {
  try {
    localStorage.setItem('daily-topic-offset', String(offset));
  } catch {
    // ignore
  }
}

export function cycleNextDailyTopic(): number {
  const current = getDailyTopicOffset();
  const next = (current + 1) % dailyReleaseFeed.length;
  setDailyTopicOffset(next);
  return next;
}

/**
 * Generate (or retrieve) the daily learning plan for the given user profile.
 * Tailors activity count to the user's selected time budget (3, 5, or 10 min).
 * Delivers fresh, rotating Salesforce release innovations every single calendar day,
 * with on-demand topic rotation support so learners are never stuck on stale content.
 */
export function generateDailyPlan(customOffset?: number): DailyLearningPlan {
  const profile = useProfileStore.getState();
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const profileKey = getProfileKey(profile);
  const activeOffset = typeof customOffset === 'number' ? customOffset : getDailyTopicOffset();
  const storageKey = `daily-plan-${today}-${profileKey}-offset-${activeOffset}`;

  // Try to load existing plan from localStorage
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      const stored: DailyLearningPlan = JSON.parse(raw);
      if (stored && stored.activityIds?.length) {
        return stored;
      }
    } catch {
      // fall through to regenerate
    }
  }

  // Get current release item based on date, active offset, and profile tailoring
  const releaseItem = getDailyReleaseByDate(new Date(), activeOffset, profile);

  // If user tech is salesforce or default, serve the authentic daily release topic set
  const isSalesforce = !profile.technology || profile.technology === 'salesforce';

  let activityIds: string[] = [];

  if (isSalesforce && releaseItem) {
    const durationBudget = profile.dailyDuration ?? 5;
    if (durationBudget === 3) {
      activityIds = [releaseItem.update.id, releaseItem.practiceContent.id];
    } else {
      activityIds = [
        releaseItem.update.id,
        releaseItem.practiceContent.id,
        releaseItem.revision.id,
      ];
    }
  } else {
    // Non-salesforce or fallback
    let candidates = sampleLearningContent.filter(
      (c) => c.technology === profile.technology && c.verificationStatus !== undefined
    );
    const roleMatches = candidates.filter((c) => c.applicableRoles.includes(profile.role));
    if (roleMatches.length) candidates = roleMatches;

    const weakTopics = new Set(getWeakTopicsList().map((t) => t.toLowerCase()));
    const dueSRSTopics = new Set(getDueSRSTopics().map((s) => s.topicTitle.toLowerCase()));

    candidates.sort((a, b) => {
      const aWeak = weakTopics.has(a.title.toLowerCase()) || dueSRSTopics.has(a.title.toLowerCase());
      const bWeak = weakTopics.has(b.title.toLowerCase()) || dueSRSTopics.has(b.title.toLowerCase());
      if (aWeak && !bWeak) return -1;
      if (!aWeak && bWeak) return 1;
      return a.id.localeCompare(b.id);
    });

    const durationBudget = profile.dailyDuration ?? 5;
    const categories: ('update' | 'practice' | 'revision')[] =
      durationBudget === 3 ? ['update', 'practice'] : ['update', 'practice', 'revision'];

    for (const cat of categories) {
      const perCat = candidates.filter((c) => c.category === cat && !activityIds.includes(c.id));
      if (perCat.length) {
        activityIds.push(perCat[0].id);
      } else {
        const fallback = sampleLearningContent.find((c) => c.category === cat && !activityIds.includes(c.id));
        if (fallback) activityIds.push(fallback.id);
      }
    }
  }

  // Safe minimum fallback
  if (activityIds.length === 0 && releaseItem) {
    activityIds = [releaseItem.update.id, releaseItem.practiceContent.id, releaseItem.revision.id];
  } else if (activityIds.length === 0 && sampleLearningContent.length > 0) {
    activityIds = sampleLearningContent.slice(0, 3).map((c) => c.id);
  }

  const plan: DailyLearningPlan = {
    id: `${today}-${profileKey}-off${activeOffset}`,
    localDate: today,
    userProfileKey: profileKey,
    durationPreference: profile.dailyDuration ?? 5,
    activityIds,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(plan));
  } catch {
    // ignore
  }

  return plan;
}

export function getContentById(id: string): LearningContent | undefined {
  const fromRelease = getAllDailyReleaseContents().find((c) => c.id === id);
  if (fromRelease) return fromRelease;
  return sampleLearningContent.find((c) => c.id === id);
}
