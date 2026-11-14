// ============================================================
// IT Daily Upskilling — Shared TypeScript Types
// ============================================================

export type UserRole = 'developer' | 'admin' | 'architect';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivityType = 'update' | 'practice' | 'revise';
export type ExploreCategory = 'for-you' | 'updates' | 'apex' | 'lwc' | 'integration' | 'agentforce';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  experienceLevel: ExperienceLevel;
  streak: number;
  totalLessons: number;
  totalRevisions: number;
  revisionScore: number; // 0–100
  pathsCompleted: number;
  interests: string[];
  joinedDate: string;
  weeklyActivity: number[]; // 7 values, Sun–Sat
}

export interface DailyActivity {
  id: string;
  type: ActivityType;
  icon: string;
  tag: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  color: string; // Tailwind bg color class for icon bg
}

export interface UpdateCard {
  id: string;
  category: ExploreCategory;
  title: string;
  summary: string;
  readTimeMinutes: number;
  sourceLabel: string;
  isSampleData: true; // always true in Sprint 1
  isBookmarked: boolean;
  publishedLabel: string;
  tags: string[];
}

export interface LearningPath {
  id: string;
  icon: string;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  durationMinutes: number;
  level: DifficultyLevel;
  color: string; // Tailwind gradient class
  accentColor: string; // Tailwind text color class
}

export interface RevisionTopic {
  id: string;
  title: string;
  tag: string;
  lastReviewedLabel: string;
  strengthPercent: number;
  dueCount: number;
  color: string;
}

export interface MockQuiz {
  id: string;
  topicTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NavTab {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export interface DailyGoal {
  totalActivities: number;
  completedActivities: number;
  targetMinutes: number;
}
