// src/services/questionMatchingEngine.ts
import { mockKnowledgeBase } from '@/data/mockKnowledgeBase';
import type { KnowledgeEntry } from '@/types/assistant';

const STOPWORDS = new Set([
  'what',
  'is',
  'a',
  'an',
  'the',
  'how',
  'do',
  'i',
  'can',
  'explain',
  'tell',
  'me',
  'about',
  'when',
  'should',
  'use',
  'which',
  'difference',
  'between',
  'in',
  'for',
  'of',
  'to',
  'with',
  'and',
  'or',
  'vs',
]);

export interface MatchResult {
  entry: KnowledgeEntry;
  score: number;
}

interface IndexedEntry {
  entry: KnowledgeEntry;
  normCanonical: string;
  normSynonyms: string[];
  normKeywords: string[];
  normTopicTitle: string;
}

export class QuestionMatchingEngine {
  private entries: KnowledgeEntry[] = [];
  private indexedEntries: IndexedEntry[] = [];
  private canonicalMap: Map<string, KnowledgeEntry> = new Map();

  constructor(entries: KnowledgeEntry[] = mockKnowledgeBase) {
    this.setEntries(entries);
  }

  setEntries(entries: KnowledgeEntry[]) {
    this.entries = entries;
    this.canonicalMap = new Map();
    this.indexedEntries = entries.map((entry) => {
      const normCanonical = this.normalize(entry.canonicalQuestion);
      this.canonicalMap.set(normCanonical, entry);
      return {
        entry,
        normCanonical,
        normSynonyms: entry.synonyms.map((s) => this.normalize(s)),
        normKeywords: entry.keywords.map((k) => k.toLowerCase()),
        normTopicTitle: entry.topicTitle.toLowerCase(),
      };
    });
  }

  /**
   * Normalizes a text string: lowercases, removes punctuation and angle brackets, trims spaces.
   */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[?!.,'"`()_\-\/\\:;<>{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extracts meaningful keyword tokens, filtering common stopwords.
   */
  tokenize(text: string): string[] {
    const norm = this.normalize(text);
    return norm
      .split(' ')
      .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  }

  /**
   * Deterministically finds the best matching knowledge entry for a user question.
   */
  findBestMatch(
    userQuestion: string,
    context?: { topicId?: string; lessonId?: string }
  ): MatchResult | null {
    if (!userQuestion || !userQuestion.trim()) return null;

    const normQ = this.normalize(userQuestion);

    // Fast O(1) canonical question lookup
    const exact = this.canonicalMap.get(normQ);
    if (exact) {
      return { entry: exact, score: 1.0 };
    }

    const tokens = this.tokenize(userQuestion);

    let bestMatch: MatchResult | null = null;
    let highestScore = 0;

    for (const item of this.indexedEntries) {
      const { entry, normCanonical, normSynonyms, normKeywords, normTopicTitle } = item;

      // 1. Exact Canonical Match (1.0)
      if (normQ === normCanonical) {
        return { entry, score: 1.0 };
      }

      // 2. Exact Synonym Match (0.95)
      for (const normSyn of normSynonyms) {
        if (normQ === normSyn || normQ.includes(normSyn) || normSyn.includes(normQ)) {
          const synScore = 0.95;
          if (synScore > highestScore) {
            highestScore = synScore;
            bestMatch = { entry, score: synScore };
          }
        }
      }

      // 3. Keyword Token Overlap (0.0 to 0.85)
      let keywordMatches = 0;
      for (const token of tokens) {
        if (normKeywords.some((kw) => kw.includes(token) || token.includes(kw))) {
          keywordMatches++;
        }
        if (normTopicTitle.includes(token)) {
          keywordMatches += 1.5;
        }
      }

      const totalTokens = Math.max(tokens.length, 1);
      let score = Math.min(0.85, (keywordMatches / totalTokens) * 0.8);

      // 4. Context Boost (+0.25) if current lesson or topic matches
      if (context) {
        if (context.topicId && entry.topicId.toLowerCase() === context.topicId.toLowerCase()) {
          score += 0.25;
        }
        if (context.lessonId && entry.relatedLessonIds.includes(context.lessonId)) {
          score += 0.25;
        }
      }

      // Tie-breaking: score DESC, knowledgeId ASC
      if (
        score > highestScore ||
        (Math.abs(score - highestScore) < 0.001 &&
          bestMatch &&
          entry.knowledgeId.localeCompare(bestMatch.entry.knowledgeId) < 0)
      ) {
        highestScore = score;
        bestMatch = { entry, score };
      }
    }

    // Minimum acceptable threshold for demo mode is 0.35
    if (bestMatch && bestMatch.score >= 0.35) {
      return bestMatch;
    }

    return null;
  }

  /**
   * Returns context-aware suggested questions for the user.
   */
  getSuggestedQuestions(context?: { topicId?: string; lessonId?: string }): string[] {
    if (!context || (!context.topicId && !context.lessonId)) {
      return this.entries.slice(0, 4).map((e) => e.canonicalQuestion);
    }

    // Prioritize entries matching the context
    const contextual = this.entries.filter(
      (e) =>
        (context.topicId && e.topicId.toLowerCase().includes(context.topicId.toLowerCase())) ||
        (context.lessonId && e.relatedLessonIds.includes(context.lessonId))
    );

    if (contextual.length > 0) {
      const suggestions = contextual.map((e) => e.canonicalQuestion);
      // Fill up to 3 with others if needed
      for (const e of this.entries) {
        if (suggestions.length >= 4) break;
        if (!suggestions.includes(e.canonicalQuestion)) {
          suggestions.push(e.canonicalQuestion);
        }
      }
      return suggestions.slice(0, 4);
    }

    return this.entries.slice(0, 4).map((e) => e.canonicalQuestion);
  }
}

export const questionMatchingEngine = new QuestionMatchingEngine();
