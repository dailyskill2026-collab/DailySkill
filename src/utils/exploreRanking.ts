/**
 * Simple rule‑based ranking for the Explore feed.
 * It takes a user profile and a list of LearningContent items and returns a sorted array.
 * The algorithm boosts items that match the user's primary technology, role, and interests.
 * No external dependencies – pure TypeScript.
 */

import type { LearningContent } from '@/data/exploreContent';

interface UserProfile {
  technology?: string; // primary technology selected in onboarding
  role?: string; // e.g., "Developer", "Admin"
  interests?: string[]; // list of topics the user selected
  experienceYears?: number;
}

/**
 * Compute a relevance score for a single content item.
 */
function computeScore(profile: UserProfile, item: LearningContent): number {
  let score = 0;

  // Match primary technology – strong boost
  if (profile.technology && item.technology === profile.technology) {
    score += 30;
  }

  // Match any of the user's interests (topic) – medium boost
  if (profile.interests && profile.interests.length > 0) {
    const lowered = profile.interests.map(i => i.toLowerCase());
    if (lowered.includes(item.topic.toLowerCase())) {
      score += 20;
    }
  }

  // Experience based boost: higher experience prefers higher difficulty
  if (profile.experienceYears !== undefined) {
    const difficultyWeight = { Beginner: 5, Intermediate: 15, Advanced: 25 } as const;
    score += difficultyWeight[item.difficulty] * (profile.experienceYears / 10);
  }

  // Newer version (if present) – slight boost
  if (item.version) {
    score += 5;
  }

  return score;
}

/**
 * Generate the ordered feed.
 */
export function generateExploreFeed(
  profile: UserProfile,
  contentList: LearningContent[],
): LearningContent[] {
  // Filter only published or sample items – already ensured by source data.
  const filtered = contentList.filter(
    c => c.verificationStatus === 'published' || c.verificationStatus === 'sample',
  );

  const withScore = filtered.map(item => ({ item, score: computeScore(profile, item) }));

  // Sort descending by score, then by readingTimeMinutes ascending for variety.
  withScore.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.readingTimeMinutes - b.item.readingTimeMinutes;
  });

  return withScore.map(entry => entry.item);
}
