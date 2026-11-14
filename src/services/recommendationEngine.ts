// src/services/recommendationEngine.ts
/**
 * Deterministic Recommendation Engine for IT Daily Upskilling.
 * Computes a normalized relevance score (0-100) and human-readable explanation
 * based on user profile, interests, job role, experience, weak topics, and completion status.
 */

import type { LearningContent } from '@/data/exploreContent';
import type { Profile } from '@/store/profileStore';

export interface ScoredRecommendation {
  content: LearningContent;
  score: number;
  explanation: string;
  isWeakTopicBoosted?: boolean;
}

export interface RecommendationContext {
  profile: Profile;
  completedIds?: Set<string>;
  weakTopics?: Set<string>;
  bookmarkedIds?: Set<string>;
}

export function scoreContentItem(
  item: LearningContent,
  ctx: RecommendationContext
): ScoredRecommendation {
  const { profile, completedIds = new Set(), weakTopics = new Set() } = ctx;
  let score = 0;
  const reasons: string[] = [];
  let isWeakTopicBoosted = false;

  // 1. Technology match (Max 30)
  const itemTech = (item.technology || '').toLowerCase();
  const userTech = (profile.technology || '').toLowerCase();
  if (itemTech && userTech && itemTech === userTech) {
    score += 30;
    reasons.push(`matches your primary technology (${profile.technology.toUpperCase()})`);
  }

  // 2. Role match (Max 20)
  const userRole = profile.role || 'salesforce_dev';
  const roleClean = userRole.replace('salesforce_', '').toLowerCase();
  const itemTopicLower = (item.topic || '').toLowerCase();
  const itemSummaryLower = (item.summary || '').toLowerCase();
  const itemTitleLower = (item.title || '').toLowerCase();

  // If role keywords or developer/admin cues match
  if (
    itemSummaryLower.includes(roleClean) ||
    itemTitleLower.includes(roleClean) ||
    (roleClean === 'dev' && (itemTopicLower.includes('apex') || itemTopicLower.includes('lwc'))) ||
    (roleClean === 'admin' && (itemTopicLower.includes('flow') || itemTopicLower.includes('admin')))
  ) {
    score += 20;
    reasons.push(`relevant to your role as ${profile.role.replace('_', ' ')}`);
  }

  // 3. Interest match (Max 25)
  const userInterests = (profile.interests || []).map((i) => i.toLowerCase());
  const matchedInterests = userInterests.filter(
    (interest) =>
      itemTopicLower.includes(interest) ||
      itemTitleLower.includes(interest) ||
      itemSummaryLower.includes(interest)
  );

  if (matchedInterests.length > 0) {
    const interestBoost = Math.min(25, matchedInterests.length * 15);
    score += interestBoost;
    reasons.push(`matches your interest in ${matchedInterests[0]}`);
  }

  // 4. Experience calibration (Max 10)
  const expLevel = profile.experience || '0-2';
  const isBeginnerExp = expLevel === 'fresher' || expLevel === '0-2';
  const isAdvancedExp = expLevel === '5-8' || expLevel === '8+';

  if (isBeginnerExp && item.difficulty === 'Beginner') {
    score += 10;
  } else if (isAdvancedExp && item.difficulty === 'Advanced') {
    score += 10;
  } else if (item.difficulty === 'Intermediate') {
    score += 8;
  }

  // 5. Weak topic reinforcement (+15 boost)
  for (const weak of weakTopics) {
    if (
      itemTopicLower.includes(weak.toLowerCase()) ||
      itemTitleLower.includes(weak.toLowerCase())
    ) {
      score += 15;
      isWeakTopicBoosted = true;
      reasons.unshift(`recommended to strengthen weak topic: ${weak}`);
      break;
    }
  }

  // 6. Content freshness boost (+5)
  if (item.version || item.lastVerified) {
    score += 5;
  }

  // 7. Completed item penalty (-50)
  if (completedIds.has(item.id)) {
    score = Math.max(0, score - 50);
  }

  // Normalize final score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Build human-friendly explanation
  const explanation =
    reasons.length > 0
      ? `Recommended because it ${reasons[0]}.`
      : 'Recommended based on your daily learning journey.';

  return {
    content: item,
    score: normalizedScore,
    explanation,
    isWeakTopicBoosted,
  };
}

/**
 * Filter and sort a content collection deterministically.
 */
export function getPersonalizedRecommendations(
  contentList: LearningContent[],
  ctx: RecommendationContext
): ScoredRecommendation[] {
  // Never recommend unpublished or non-sample content
  const eligible = contentList.filter(
    (c) => c.verificationStatus === 'published' || c.verificationStatus === 'sample'
  );

  const scored = eligible.map((item) => scoreContentItem(item, ctx));

  // Deterministic sort: descending by score, tie-break by ID
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.content.id.localeCompare(b.content.id);
  });

  return scored;
}
