// src/services/MockAnswerProvider.ts
import type { IAnswerProvider, AssistantRequest, AssistantResponse, ExplanationStyle, KnowledgeEntry } from '@/types/assistant';
import { questionMatchingEngine, QuestionMatchingEngine } from './questionMatchingEngine';

export class MockAnswerProvider implements IAnswerProvider {
  readonly providerType = 'mock' as const;
  private engine: QuestionMatchingEngine;

  constructor(engine: QuestionMatchingEngine = questionMatchingEngine) {
    this.engine = engine;
  }

  private formatContentByStyle(entry: KnowledgeEntry, style: ExplanationStyle): string {
    if (style === 'simple') {
      return entry.simpleExplanation;
    }

    if (style === 'real_world') {
      const s = entry.realWorldScenario;
      return `### Real-World Example: ${s.title} (${s.domain} Domain)
*(Illustrative enterprise scenario)*

- **Business Requirement**: ${s.businessRequirement}
- **Salesforce Feature Used**: ${s.featureUsed}
- **Implementation Approach**: ${s.implementationApproach}
- **Expected Result**: ${s.expectedResult}`;
    }

    if (style === 'interview') {
      return `### Technical Interview Answer
${entry.interviewAnswer}`;
    }

    return entry.simpleExplanation;
  }

  async getAnswer(request: AssistantRequest): Promise<AssistantResponse> {
    const style = request.selectedStyle || 'simple';
    const match = this.engine.findBestMatch(request.question, {
      topicId: request.topicId,
      lessonId: request.lessonId,
    });

    if (!match) {
      const suggested = this.engine.getSuggestedQuestions({
        topicId: request.topicId,
        lessonId: request.lessonId,
      });

      return {
        isSupported: false,
        selectedStyle: style,
        content:
          'This question is not available in demo mode yet. Try one of the suggested questions below.',
        fallbackMessage:
          'This question is not available in demo mode yet. Try one of the suggested questions.',
        suggestedQuestions: suggested,
        providerType: 'mock',
        confidenceScore: 0,
      };
    }

    const { entry, score } = match;
    const formattedContent = this.formatContentByStyle(entry, style);

    // Contextual suggestions: other questions excluding the current one
    const allSuggested = this.engine.getSuggestedQuestions({
      topicId: entry.topicId,
      lessonId: request.lessonId,
    });
    const suggested = allSuggested.filter(
      (q) => q.toLowerCase() !== entry.canonicalQuestion.toLowerCase()
    );

    return {
      isSupported: true,
      matchedAnswer: {
        knowledgeId: entry.knowledgeId,
        topicId: entry.topicId,
        topicTitle: entry.topicTitle,
        canonicalQuestion: entry.canonicalQuestion,
        simpleExplanation: entry.simpleExplanation,
        realWorldScenario: entry.realWorldScenario,
        interviewAnswer: entry.interviewAnswer,
        relatedLessonIds: entry.relatedLessonIds,
        sourceReference: entry.sourceReference,
        version: entry.version,
      },
      selectedStyle: style,
      content: formattedContent,
      suggestedQuestions: suggested.slice(0, 3),
      providerType: 'mock',
      confidenceScore: score,
    };
  }

  getSuggestedQuestions(context?: { topicId?: string; lessonId?: string }): string[] {
    return this.engine.getSuggestedQuestions(context);
  }
}

export const mockAnswerProvider = new MockAnswerProvider();
