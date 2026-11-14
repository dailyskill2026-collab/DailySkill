// src/services/dailyPlan.ts
import { LearningContent, DailyLearningPlan } from '@/types/learning';
import { sampleLearningContent } from '@/data/sampleContent';
import { useProfileStore } from '@/store/profileStore';

// Helper to create a deterministic profile key for caching
function getProfileKey(profile: any): string {
  const { technology, role, interests, goals, experience } = profile;
  // order keys to keep stable string
  return `${technology}|${role}|${interests.sort().join(',')}|${goals.sort().join(',')}|${experience}`;
}

/**
 * Generate (or retrieve) the daily learning plan for the given user profile.
 * The plan is stable for a given local date + profile key.
 */
export function generateDailyPlan(): DailyLearningPlan {
  // Get the full profile object from the store
  const profile = useProfileStore.getState();
  const today = new Date().toLocaleDateString('en-CA'); // YYYY‑MM‑DD (local)
  const profileKey = getProfileKey(profile);
  const storageKey = `daily-plan-${today}-${profileKey}`;

  // Try to load existing plan from localStorage
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      const stored: DailyLearningPlan = JSON.parse(raw);
      // Basic validation
      if (stored && stored.activityIds?.length) {
        return stored;
      }
    } catch (e) {
      // fall through to regenerate
    }
  }

  // Filter content by technology first
  let candidates = sampleLearningContent.filter(
    (c) => c.technology === profile.technology && c.verificationStatus !== undefined,
  );

  // Filter by role (applicableRoles) – if none match, keep all
  const roleMatches = candidates.filter((c) => c.applicableRoles.includes(profile.role));
  if (roleMatches.length) candidates = roleMatches;

  // Filter by interests (match title or summary keywords)
  if (profile.interests?.length) {
    const interestSet = new Set(profile.interests.map((i: string) => i.toLowerCase()));
    const interestFiltered = candidates.filter(
      (c) =>
        interestSet.has(c.title.toLowerCase()) ||
        interestSet.has(c.summary.toLowerCase()),
    );
    if (interestFiltered.length) candidates = interestFiltered;
  }

  // Pick one per category (update, practice, revision)
  const categories: ('update' | 'practice' | 'revision')[] = ['update', 'practice', 'revision'];
  const activityIds: string[] = [];
  for (const cat of categories) {
    const perCat = candidates.filter((c) => c.category === cat);
    if (perCat.length) {
      // Simple deterministic selection: first element after sorting by id
      perCat.sort((a, b) => a.id.localeCompare(b.id));
      activityIds.push(perCat[0].id);
    } else {
      // Fallback: pick any sample content of that category or leave empty
      const fallback = sampleLearningContent.find((c) => c.category === cat);
      if (fallback) activityIds.push(fallback.id);
    }
  }

  const plan: DailyLearningPlan = {
    id: `${today}-${profileKey}`,
    localDate: today,
    userProfileKey: profileKey,
    durationPreference: profile.dailyDuration ?? 5,
    activityIds,
    createdAt: new Date().toISOString(),
  };

  // Persist for the day
  try {
    localStorage.setItem(storageKey, JSON.stringify(plan));
  } catch (e) {
    // ignore storage failures – app will regenerate next load
  }
  return plan;
}

/** Utility to get LearningContent by id */
export function getContentById(id: string): LearningContent | undefined {
  return sampleLearningContent.find((c) => c.id === id);
}
