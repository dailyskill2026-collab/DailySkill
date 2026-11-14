import { Profile, Interest, Technology, Role, Goal } from '@/store/profileStore'

/** Simple rule‑based recommendation engine for Sprint 2 */
export interface Recommendations {
  todayActivities: typeof import('@/data').mockDailyActivities
  exploreCards: typeof import('@/data').mockExploreItems
  learnPaths: typeof import('@/data').mockLearnPaths
  reviseCards: typeof import('@/data').mockReviseItems
}

/**
 * For the MVP we keep the logic straightforward:
 * - Technology = 'salesforce' → use the existing mock data (all items are Salesforce‑centric).
 * - Role narrows the default interests (e.g., admin gets admin‑related topics).
 * - Goals and selected interests affect ordering (more relevant items appear first).
 * - Experience does not filter out items, only influences ordering weight.
 */
export function getRecommendations(profile: Profile): Recommendations {
  // Import mock data lazily to avoid circular deps
  const { mockDailyActivities, mockExploreItems, mockLearnPaths, mockReviseItems } =
    require('@/data') as typeof import('@/data')

  // Helper: rank items by how many of the user's interests appear in its tags
  const rankByInterests = <T extends { tags?: Interest[] }>(items: T[]): T[] => {
    const interestSet = new Set(profile.interests)
    return items
      .map((item) => ({ item, score: (item.tags?.filter((t) => interestSet.has(t)).length ?? 0) }))
      .sort((a, b) => b.score - a.score)
      .map((pair) => pair.item)
  }

  // Filter daily activities to those matching selected interests (or keep all if none)
  const todayActivities = profile.interests.length
    ? mockDailyActivities.filter((act) => profile.interests.includes(act.tag as Interest))
    : mockDailyActivities

  // Explore cards & learn paths are ranked by interest relevance
  const exploreCards = rankByInterests(mockExploreItems)
  const learnPaths = rankByInterests(mockLearnPaths)

  // Revise cards – simple filter by interests
  const reviseCards = profile.interests.length
    ? mockReviseItems.filter((item) => profile.interests.includes(item.tag as Interest))
    : mockReviseItems

  return {
    todayActivities,
    exploreCards,
    learnPaths,
    reviseCards,
  }
}
