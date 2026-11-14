// src/types/assistant.ts

export type ExplanationStyle = 'simple' | 'real_world' | 'interview';

export type EnterpriseDomain =
  | 'Insurance'
  | 'Banking'
  | 'Healthcare'
  | 'Customer Service'
  | 'Sales Automation';

export interface RealWorldScenario {
  domain: EnterpriseDomain;
  title: string;
  businessRequirement: string;
  featureUsed: string;
  implementationApproach: string;
  expectedResult: string;
}

export interface SourceReference {
  sourceName: string;
  sourceUrl?: string;
  section?: string;
  evidenceStatus: 'verified' | 'sample';
}

export interface KnowledgeEntry {
  knowledgeId: string;
  topicId: string;
  topicTitle: string;
  canonicalQuestion: string;
  keywords: string[];
  synonyms: string[];
  simpleExplanation: string;
  realWorldScenario: RealWorldScenario;
  interviewAnswer: string;
  relatedLessonIds: string[];
  sourceReference: SourceReference;
  version: string;
  isFlaggedForReview?: boolean;
}

export interface AssistantAnswer {
  knowledgeId: string;
  topicId: string;
  topicTitle: string;
  canonicalQuestion: string;
  simpleExplanation: string;
  realWorldScenario: RealWorldScenario;
  interviewAnswer: string;
  relatedLessonIds: string[];
  sourceReference: SourceReference;
  version: string;
}

export interface AssistantResponse {
  isSupported: boolean;
  matchedAnswer?: AssistantAnswer;
  selectedStyle: ExplanationStyle;
  content: string;
  suggestedQuestions: string[];
  fallbackMessage?: string;
  providerType: 'mock';
  confidenceScore: number;
}

export interface DoubtRecord {
  doubtId: string;
  mockUserId: string;
  question: string;
  matchedKnowledgeId?: string;
  topicTitle: string;
  relatedLessonId?: string;
  selectedStyle: ExplanationStyle;
  answerSummary: string;
  createdAt: string; // ISO 8601
  status: 'answered' | 'unsupported';
}

export interface AssistantRequest {
  question: string;
  topicId?: string;
  lessonId?: string;
  selectedStyle?: ExplanationStyle;
  mockUserId?: string;
}

export interface IAnswerProvider {
  readonly providerType: 'mock' | 'openai' | 'gemini' | 'claude';
  getAnswer(request: AssistantRequest): Promise<AssistantResponse>;
  getSuggestedQuestions(context?: { topicId?: string; lessonId?: string }): string[];
}
