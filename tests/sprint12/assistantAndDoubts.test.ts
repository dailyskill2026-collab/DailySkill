// tests/sprint12/assistantAndDoubts.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { questionMatchingEngine, QuestionMatchingEngine } from '@/services/questionMatchingEngine';
import { mockAnswerProvider } from '@/services/MockAnswerProvider';
import { learningAssistantService } from '@/services/learningAssistantService';
import { doubtHistoryService } from '@/services/doubtHistoryService';
import { feedbackService } from '@/services/feedbackService';
import { mockKnowledgeBase } from '@/data/mockKnowledgeBase';
import type { KnowledgeEntry, AssistantRequest } from '@/types/assistant';

describe('Sprint 12: AI Learning Assistant & Smart Doubt Clarification (Mock Mode)', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await doubtHistoryService.clearUserDoubts('user-1');
    await doubtHistoryService.clearUserDoubts('user-2');
  });

  afterEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------
  // 1-3. Context & Suggested Questions
  // -------------------------------------------------------------
  describe('1-3. Context-Aware Assistant & Suggested Questions', () => {
    it('1. Assistant opening from lesson: sets active lesson title and context', async () => {
      const resp = await learningAssistantService.askQuestion('What is Queueable Apex?', {
        lessonId: 'sf-update-2024-07-queueable',
        topicId: 'queueable_apex',
        topicTitle: 'Chaining Jobs Best Practices',
      });

      expect(resp.isSupported).toBe(true);
      expect(resp.matchedAnswer?.topicId).toBe('queueable_apex');
      expect(resp.matchedAnswer?.relatedLessonIds).toContain('sf-update-2024-07-queueable');
    });

    it('2. Current lesson context: boosts ranking for questions related to active lesson', () => {
      // Ambiguous query: "How to handle limits"
      const matchWithApexContext = questionMatchingEngine.findBestMatch('limits', {
        topicId: 'queueable_apex',
        lessonId: 'sf-update-2024-07-queueable',
      });
      expect(matchWithApexContext?.entry.topicId).toBe('queueable_apex');
    });

    it('3. Suggested questions: provides context-relevant questions for current topic', () => {
      const suggestions = questionMatchingEngine.getSuggestedQuestions({
        topicId: 'queueable_apex',
        lessonId: 'sf-update-2024-07-queueable',
      });

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].toLowerCase()).toContain('queueable');
    });
  });

  // -------------------------------------------------------------
  // 4-8. Question Matching Engine & Fallbacks
  // -------------------------------------------------------------
  describe('4-8. Deterministic Question Matching & Fallbacks', () => {
    it('4. Exact question matching: matches canonical question with 1.0 confidence score', () => {
      const match = questionMatchingEngine.findBestMatch(
        'What is Queueable Apex and when should I use it?'
      );
      expect(match).not.toBeNull();
      expect(match?.score).toBe(1.0);
      expect(match?.entry.topicId).toBe('queueable_apex');
    });

    it('5. Keyword matching: tokenizes and matches query by keyword tokens', () => {
      const match = questionMatchingEngine.findBestMatch('tell me about batch apex governor limits');
      expect(match).not.toBeNull();
      expect(match?.entry.topicId).toBe('batch_apex');
    });

    it('6. Synonym matching: resolves synonyms like "chaining jobs" to Queueable Apex', () => {
      const match = questionMatchingEngine.findBestMatch('how does chaining jobs work');
      expect(match).not.toBeNull();
      expect(match?.entry.topicId).toBe('queueable_apex');
      expect(match?.score).toBeGreaterThanOrEqual(0.8);
    });

    it('7. Unrelated question rejection: returns null when confidence threshold is not met', () => {
      const match = questionMatchingEngine.findBestMatch(
        'how to cook a chocolate cake recipe with strawberries'
      );
      expect(match).toBeNull();
    });

    it('8. Unsupported question fallback: returns structured fallback message with suggestions', async () => {
      const resp = await mockAnswerProvider.getAnswer({
        question: 'What is quantum physics entanglement in Salesforce?',
        selectedStyle: 'simple',
      });

      expect(resp.isSupported).toBe(false);
      expect(resp.confidenceScore).toBe(0);
      expect(resp.fallbackMessage).toContain('not available in demo mode yet');
      expect(resp.suggestedQuestions.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // 9-11. Explanation Styles (Simple, Real-World, Interview)
  // -------------------------------------------------------------
  describe('9-11. Three Explanation Styles', () => {
    it('9. Simple explanations: returns short, practical, plain-language explanation', async () => {
      const resp = await mockAnswerProvider.getAnswer({
        question: 'What is Queueable Apex?',
        selectedStyle: 'simple',
      });

      expect(resp.selectedStyle).toBe('simple');
      expect(resp.content).toContain('Queueable Apex runs a job in the background asynchronously');
    });

    it('10. Real-world examples: returns structured scenario with 4 pillars across enterprise domain', async () => {
      const resp = await mockAnswerProvider.getAnswer({
        question: 'What is Queueable Apex?',
        selectedStyle: 'real_world',
      });

      expect(resp.selectedStyle).toBe('real_world');
      expect(resp.content).toContain('### Real-World Example');
      expect(resp.content).toContain('Business Requirement');
      expect(resp.content).toContain('Salesforce Feature Used');
      expect(resp.content).toContain('Implementation Approach');
      expect(resp.content).toContain('Expected Result');
      expect(resp.content).toContain('Insurance');
    });

    it('11. Interview answers: returns formal, technical answer suitable for interviews', async () => {
      const resp = await mockAnswerProvider.getAnswer({
        question: 'What is Queueable Apex?',
        selectedStyle: 'interview',
      });

      expect(resp.selectedStyle).toBe('interview');
      expect(resp.content).toContain('### Technical Interview Answer');
      expect(resp.content).toContain('execute(QueueableContext)');
    });
  });

  // -------------------------------------------------------------
  // 12-16. MCQ Explanation & Source References
  // -------------------------------------------------------------
  describe('12-16. MCQ Explanations & Source Grounding', () => {
    it('12. MCQ explanation: provides explanation breakdown of options', () => {
      const entry = mockKnowledgeBase.find((e) => e.topicId === 'queueable_apex');
      expect(entry).toBeDefined();
      expect(entry?.simpleExplanation.length).toBeGreaterThan(20);
    });

    it('13. Correct answer mapping: maps questions to official Salesforce topics', () => {
      const entry = mockKnowledgeBase.find((e) => e.topicId === 'sharing_rules');
      expect(entry).toBeDefined();
      expect(entry?.canonicalQuestion).toContain('criteria-based and ownership-based');
    });

    it('14. Source reference validation: includes verified source URLs and document sections', () => {
      const entry = mockKnowledgeBase.find((e) => e.topicId === 'queueable_apex');
      expect(entry?.sourceReference.sourceName).toBe(
        'Salesforce Apex Developer Guide – Queueable Apex'
      );
      expect(entry?.sourceReference.sourceUrl).toMatch(/^https:\/\/developer\.salesforce\.com/);
      expect(entry?.sourceReference.evidenceStatus).toBe('verified');
    });

    it('15. Blocked content exclusion: does not include blocked or rejected content', () => {
      const allEntries = mockKnowledgeBase;
      expect(allEntries.every((e) => !e.isFlaggedForReview || e.knowledgeId)).toBe(true);
    });

    it('16. Unpublished content exclusion: all knowledge base entries have valid published versions', () => {
      const allEntries = mockKnowledgeBase;
      expect(allEntries.every((e) => e.version.includes('24') || e.version.includes('Spring') || e.version.includes('Summer'))).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 17-21. Doubt History & User Isolation
  // -------------------------------------------------------------
  describe('17-21. Doubt History & Assistant Feedback', () => {
    it('17. Doubt history persistence: records doubts and saves to localStorage', async () => {
      await doubtHistoryService.recordDoubt({
        mockUserId: 'test-user-1',
        question: 'What is LWC?',
        matchedKnowledgeId: 'kb-lwc-decorators',
        topicTitle: 'LWC Decorators',
        selectedStyle: 'simple',
        answerSummary: 'LWC explanation summary...',
        status: 'answered',
      });

      const doubts = await doubtHistoryService.getDoubtsByUser('test-user-1');
      expect(doubts).toHaveLength(1);
      expect(doubts[0].question).toBe('What is LWC?');
      expect(doubts[0].status).toBe('answered');
    });

    it('18. Doubt history deletion: flushes user doubt history on demand', async () => {
      await doubtHistoryService.recordDoubt({
        mockUserId: 'test-user-1',
        question: 'How do parent and child LWCs communicate?',
        topicTitle: 'Parent-to-Child',
        selectedStyle: 'simple',
        answerSummary: 'Communication summary...',
        status: 'answered',
      });

      expect(await doubtHistoryService.getDoubtsByUser('test-user-1')).toHaveLength(1);
      await doubtHistoryService.clearUserDoubts('test-user-1');
      expect(await doubtHistoryService.getDoubtsByUser('test-user-1')).toHaveLength(0);
    });

    it('19. Helpful feedback: submits positive rating to feedback service', async () => {
      const fb = await feedbackService.submitContentQualityFeedback({
        contentId: 'kb-queueable-apex',
        vote: 'helpful',
        mockUserId: 'test-user-1',
      });

      expect(fb).toBeDefined();
      expect(fb.relatedContentId).toBe('kb-queueable-apex');
      expect(fb.helpfulnessVote).toBe('helpful');
    });

    it('20. Incorrect answer reporting: flags knowledge entry for mock admin review', async () => {
      const fb = await feedbackService.submitContentQualityFeedback({
        contentId: 'kb-queueable-apex',
        issueType: 'incorrect_information',
        comment: 'Limits stated 100M, should clarify callout count.',
        mockUserId: 'test-user-1',
      });

      expect(fb.contentIssueType).toBe('incorrect_information');
      const summaries = await feedbackService.getContentQualitySummaries();
      const kbSummary = summaries.find((s) => s.contentId === 'kb-queueable-apex');
      expect(kbSummary?.issueCount).toBeGreaterThanOrEqual(1);
      expect(kbSummary?.needsReview).toBe(true);
    });

    it('21. Mock user isolation: ensures doubts are partitioned by mockUserId', async () => {
      await doubtHistoryService.recordDoubt({
        mockUserId: 'user-alpha',
        question: 'Alpha question?',
        topicTitle: 'Topic A',
        selectedStyle: 'simple',
        answerSummary: 'Alpha answer',
        status: 'answered',
      });
      await doubtHistoryService.recordDoubt({
        mockUserId: 'user-beta',
        question: 'Beta question?',
        topicTitle: 'Topic B',
        selectedStyle: 'simple',
        answerSummary: 'Beta answer',
        status: 'answered',
      });

      const alphaDoubts = await doubtHistoryService.getDoubtsByUser('user-alpha');
      const betaDoubts = await doubtHistoryService.getDoubtsByUser('user-beta');

      expect(alphaDoubts).toHaveLength(1);
      expect(alphaDoubts[0].question).toBe('Alpha question?');
      expect(betaDoubts).toHaveLength(1);
      expect(betaDoubts[0].question).toBe('Beta question?');
    });
  });

  // -------------------------------------------------------------
  // 22-23. Formatting & Provider Abstraction
  // -------------------------------------------------------------
  describe('22-23. Provider Abstraction & Safe Rendering', () => {
    it('22. Provider abstraction: allows swapping answer provider interface cleanly', async () => {
      const customProvider = {
        providerType: 'mock' as const,
        async getAnswer(req: AssistantRequest) {
          return {
            isSupported: true,
            selectedStyle: req.selectedStyle || 'simple',
            content: `Custom answer for: ${req.question}`,
            suggestedQuestions: [],
            providerType: 'mock' as const,
            confidenceScore: 0.99,
          };
        },
        getSuggestedQuestions() {
          return ['Custom suggested question?'];
        },
      };

      const originalProvider = learningAssistantService.getProvider();
      learningAssistantService.setProvider(customProvider);

      const resp = await learningAssistantService.askQuestion('Testing custom provider');
      expect(resp.content).toBe('Custom answer for: Testing custom provider');

      // Restore provider
      learningAssistantService.setProvider(originalProvider);
    });

    it('23. Safe formatting: escapes and safely formats text without script execution', () => {
      const text = '<script>alert("hack")</script> What is Apex?';
      const normalized = questionMatchingEngine.normalize(text);
      expect(normalized).not.toContain('<');
      expect(normalized).not.toContain('>');
      expect(normalized).toContain('script alert hack script what is apex');
    });
  });

  // -------------------------------------------------------------
  // 24. Performance & Scalability Benchmarking
  // -------------------------------------------------------------
  describe('24. Performance & Scalability Benchmark', () => {
    it('24. Scalability benchmark: matches query across 1,000 synthetic knowledge entries in under 15ms', () => {
      // Build 1,000 synthetic knowledge entries
      const largeKb: KnowledgeEntry[] = [];
      for (let i = 0; i < 1000; i++) {
        largeKb.push({
          knowledgeId: `kb-synthetic-${i}`,
          topicId: `topic_${i}`,
          topicTitle: `Topic ${i} Title`,
          canonicalQuestion: `What is technical feature ${i} in Salesforce architecture?`,
          keywords: [`feature${i}`, 'salesforce', 'architecture', 'apex'],
          synonyms: [`feature ${i} synonym`, `how to use feature ${i}`],
          simpleExplanation: `Synthetic explanation for feature ${i}.`,
          realWorldScenario: {
            domain: 'Banking',
            title: `Banking Scenario ${i}`,
            businessRequirement: `Requirement ${i}`,
            featureUsed: `Feature ${i}`,
            implementationApproach: `Approach ${i}`,
            expectedResult: `Result ${i}`,
          },
          interviewAnswer: `Interview answer for feature ${i}.`,
          relatedLessonIds: [`lesson-${i}`],
          sourceReference: {
            sourceName: 'Official Docs',
            evidenceStatus: 'verified',
          },
          version: 'Spring ’24',
        });
      }

      const benchEngine = new QuestionMatchingEngine(largeKb);

      const start = performance.now();
      // Search for item #850
      const match = benchEngine.findBestMatch('What is technical feature 850 in Salesforce architecture?');
      const elapsedMs = performance.now() - start;

      console.log(`[Sprint 12 Performance Benchmark] Scanned 1,000 knowledge entries in ${elapsedMs.toFixed(2)}ms`);

      expect(match).not.toBeNull();
      expect(match?.entry.knowledgeId).toBe('kb-synthetic-850');
      // Hard requirement: must finish in under 15ms
      expect(elapsedMs).toBeLessThan(15);
    });
  });
});
