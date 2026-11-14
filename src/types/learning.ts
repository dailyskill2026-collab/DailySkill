// src/types/learning.ts
export interface LearningContent {
  id: string;
  technology: string; // e.g. "salesforce"
  category: "update" | "practice" | "revision";
  title: string;
  summary: string;
  contentType: "article" | "video";
  difficulty: "easy" | "medium" | "hard";
  applicableRoles: string[]; // role identifiers from profile (e.g. "salesforce_dev")
  estimatedMinutes: number;
  learningObjectives?: string[];
  explanation?: string;
  realWorldExample?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourcePublishedAt?: string; // ISO date
  lastVerifiedAt?: string; // ISO date
  releaseVersion?: string;
  verificationStatus?: "verified" | "sample";
  contentStatus?: "active" | "coming_soon";
}

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  contentId: string; // ties to LearningContent.id
  questionType: "scenario_mcq";
  scenario: string;
  question: string;
  options: QuizOption[];
  correctAnswerId: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface DailyLearningPlan {
  id: string;
  localDate: string; // YYYY-MM-DD (local)
  userProfileKey: string;
  durationPreference: number; // minutes (2|5|10)
  activityIds: string[]; // LearningContent.id (max 3)
  createdAt: string; // ISO timestamp
}

export interface LearningProgress {
  activityId: string;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: string; // ISO timestamp
  selectedAnswerId?: string; // for MCQ activities
  isCorrect?: boolean;
}
