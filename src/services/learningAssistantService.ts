// src/services/learningAssistantService.ts
import type { IAnswerProvider, AssistantRequest, AssistantResponse, ExplanationStyle } from '@/types/assistant';
import { mockAnswerProvider } from './MockAnswerProvider';
import { doubtHistoryService } from './doubtHistoryService';
import { repositories } from '@/repositories';
import { analytics } from './analyticsService';

export class LearningAssistantService {
  private static instance: LearningAssistantService;
  private provider: IAnswerProvider;

  constructor(provider: IAnswerProvider = mockAnswerProvider) {
    this.provider = provider;
  }

  static getInstance(): LearningAssistantService {
    if (!LearningAssistantService.instance) {
      LearningAssistantService.instance = new LearningAssistantService();
    }
    return LearningAssistantService.instance;
  }

  setProvider(provider: IAnswerProvider) {
    this.provider = provider;
  }

  getProvider(): IAnswerProvider {
    return this.provider;
  }

  async askQuestion(
    question: string,
    context?: {
      topicId?: string;
      topicTitle?: string;
      lessonId?: string;
      selectedStyle?: ExplanationStyle;
    }
  ): Promise<AssistantResponse> {
    const user = repositories.auth.getCurrentUser();
    const userId = user?.uid || 'guest-user';
    const style = context?.selectedStyle || 'simple';

    const req: AssistantRequest = {
      question,
      topicId: context?.topicId,
      lessonId: context?.lessonId,
      selectedStyle: style,
      mockUserId: userId,
    };

    const response = await this.provider.getAnswer(req);

    // Save to Doubt History
    await doubtHistoryService.recordDoubt({
      mockUserId: userId,
      question,
      matchedKnowledgeId: response.matchedAnswer?.knowledgeId,
      topicTitle: response.matchedAnswer?.topicTitle || context?.topicTitle || 'General Query',
      relatedLessonId: context?.lessonId,
      selectedStyle: style,
      answerSummary: response.content.substring(0, 120),
      status: response.isSupported ? 'answered' : 'unsupported',
    });

    // Record local analytics event
    await analytics.trackEvent('question_asked', {
      screen: context?.lessonId ? 'detail' : 'assistant',
      relatedContentId: context?.lessonId,
      relevantMetadata: {
        isSupported: response.isSupported,
        style,
        score: Math.round(response.confidenceScore * 100),
      },
    });

    return response;
  }

  getSuggestedQuestions(context?: { topicId?: string; lessonId?: string }): string[] {
    return this.provider.getSuggestedQuestions(context);
  }
}

export const learningAssistantService = LearningAssistantService.getInstance();
