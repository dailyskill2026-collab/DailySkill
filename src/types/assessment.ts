// src/types/assessment.ts

export type SkillCategory =
  | 'admin'
  | 'apex'
  | 'lwc'
  | 'integrations'
  | 'security'
  | 'flows'
  | 'async_apex'
  | 'devops';

export type AssessmentType = 'quick' | 'topic' | 'skill_check';

export interface AssessmentQuestion {
  questionId: string;
  technologyId: 'salesforce';
  category: SkillCategory;
  topicId: string;
  topicTitle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionType: 'single_choice';
  questionText: string;
  codeSnippet?: string;
  options: Array<{ id: string; label: string }>; // Exactly 4 options (A, B, C, D)
  correctAnswerId: string;
  explanation: string;
  relatedLessonId?: string;
  sourceEvidenceIds?: string[];
  contentVersion: string;
  verificationStatus: 'verified' | 'sample';
  publicationStatus: 'published';
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export type SkillClassification =
  | 'strong' // >= 80% with >= 3 questions
  | 'developing' // 50% - 79% with >= 3 questions
  | 'needs_practice' // < 50% with >= 3 questions
  | 'insufficient_evidence'; // < 3 questions attempted

export interface TopicPerformance {
  topicId: string;
  topicTitle: string;
  category: SkillCategory;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number; // 0 - 100%
  classification: SkillClassification;
  recommendedAction: string;
}

export interface AssessmentAttempt {
  attemptId: string;
  mockUserId: string;
  assessmentType: AssessmentType;
  category?: SkillCategory;
  title: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  percentageScore: number; // 0 - 100%
  answers: UserAnswer[];
  topicPerformances: TopicPerformance[];
  startedAt: string; // ISO 8601
  completedAt: string; // ISO 8601
  durationSeconds: number;
  improvementPlanId?: string;
}

export interface InProgressAssessment {
  attemptId: string;
  mockUserId: string;
  assessmentType: AssessmentType;
  category?: SkillCategory;
  title: string;
  questions: AssessmentQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string | null>; // questionId -> optionId
  startedAt: string;
  timeSpentSeconds: number;
}

export interface ImprovementAction {
  actionId: string;
  actionType: 'revise_topic' | 'complete_lesson' | 'practice_mcq' | 'retake_assessment';
  title: string;
  description: string;
  relatedId?: string;
  isCompleted: boolean;
}

export interface PersonalizedImprovementPlan {
  planId: string;
  mockUserId: string;
  sourceAttemptId: string;
  generatedAt: string;
  targetCategory: SkillCategory | 'multi';
  overallScore: number;
  weakTopics: string[];
  actions: ImprovementAction[];
}
