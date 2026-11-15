// src/services/contentCatalogService.ts
/**
 * Content Catalog Service
 * Manages dynamically published AI lessons and merges them with pre-seeded content.
 */

import { exploreContent, LearningContent } from '@/data/exploreContent';

const PUBLISHED_KEY = 'it-daily-published-lessons';

export function getCustomPublishedLessons(): LearningContent[] {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function publishCustomLesson(lesson: LearningContent): void {
  try {
    const current = getCustomPublishedLessons();
    const updated = [lesson, ...current.filter((c) => c.id !== lesson.id)];
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getAllExploreContent(): LearningContent[] {
  const custom = getCustomPublishedLessons();
  return [...custom, ...exploreContent];
}
