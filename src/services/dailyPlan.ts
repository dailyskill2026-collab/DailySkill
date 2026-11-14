// src/services/dailyPlan.ts
import { LearningContent, DailyLearningPlan } from '@/types/learning';
import { sampleLearningContent } from '@/data/sampleContent';
import { useProfileStore } from '@/store/profileStore';
import { getWeakTopicsList } from './weakTopicService';
import { getDueSRSTopics } from './spacedRepetition';

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

/**
 * Generate (or retrieve) the daily learning plan for the given user profile.
 * Tailors activity count to the user's selected time budget (3, 5, or 10 min).
 * Prioritizes weak topics and due spaced repetition tasks.
 */
export function generateDailyPlan(): DailyLearningPlan {
  const profile = useProfileStore.getState();
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const profileKey = getProfileKey(profile);
  const storageKey = `daily-plan-${today}-${profileKey}`;

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

  // Filter content by technology
  let candidates = sampleLearningContent.filter(
    (c) => c.technology === profile.technology && c.verificationStatus !== undefined
  );

  // Match role if available
  const roleMatches = candidates.filter((c) => c.applicableRoles.includes(profile.role));
  if (roleMatches.length) candidates = roleMatches;

  // Retrieve weak topics & due SRS topics
  const weakTopics = new Set(getWeakTopicsList().map((t) => t.toLowerCase()));
  const dueSRSTopics = new Set(getDueSRSTopics().map((s) => s.topicTitle.toLowerCase()));

  // Prioritize items that match weak or due topics
  candidates.sort((a, b) => {
    const aWeak = weakTopics.has(a.title.toLowerCase()) || dueSRSTopics.has(a.title.toLowerCase());
    const bWeak = weakTopics.has(b.title.toLowerCase()) || dueSRSTopics.has(b.title.toLowerCase());
    if (aWeak && !bWeak) return -1;
    if (!aWeak && bWeak) return 1;
    return a.id.localeCompare(b.id);
  });

  const durationBudget = profile.dailyDuration ?? 5;
  const categories: ('update' | 'practice' | 'revision')[] =
    durationBudget === 3
      ? ['update', 'practice']
      : ['update', 'practice', 'revision'];

  const activityIds: string[] = [];
  let accumulatedMinutes = 0;

  for (const cat of categories) {
    const perCat = candidates.filter((c) => c.category === cat && !activityIds.includes(c.id));
    if (perCat.length) {
      const selected = perCat[0];
      activityIds.push(selected.id);
      accumulatedMinutes += selected.estimatedMinutes || 2;
    } else {
      const fallback = sampleLearningContent.find((c) => c.category === cat && !activityIds.includes(c.id));
      if (fallback) {
        activityIds.push(fallback.id);
        accumulatedMinutes += fallback.estimatedMinutes || 2;
      }
    }

    // For 3-minute budgets, stop once we have enough
    if (durationBudget === 3 && accumulatedMinutes >= 3) break;
  }

  // Fallback safe minimum
  if (activityIds.length === 0 && sampleLearningContent.length > 0) {
    activityIds.push(sampleLearningContent[0].id);
  }

  const plan: DailyLearningPlan = {
    id: `${today}-${profileKey}`,
    localDate: today,
    userProfileKey: profileKey,
    durationPreference: durationBudget,
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
  return sampleLearningContent.find((c) => c.id === id);
}
