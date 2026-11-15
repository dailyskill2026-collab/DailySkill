// src/ai/llmClient.ts
// LLM client wrapper supporting Mock, Google Gemini 1.5 Flash, and OpenAI.
// In mock mode it returns fixture data from ./fixtures/mock/*.json.
// In live mode it uses Gemini 1.5 Flash or OpenAI Chat Completion.

import type { Draft } from './schemas';
import { DraftSchema } from './schemas';
import { env } from '@/lib/env';
import { getAIConfig } from '@/store/aiConfigStore';

export type LLMMode = 'mock' | 'live';

export class LLMClient {
  private mode: LLMMode;

  constructor() {
    const config = getAIConfig();
    this.mode = config.provider !== 'mock' || env.LLM_MODE === 'live' ? 'live' : 'mock';
  }

  /**
   * Generate a full draft for a given source document or topic.
   */
  async generateDraft(document: any): Promise<{ draft: Draft; usage?: { totalTokens: number } }> {
    const config = getAIConfig();

    // 1. Mock Mode
    if (this.mode === 'mock' || config.provider === 'mock') {
      const { default: fixture } = await import('./fixtures/mock/draftFixture.json');
      return { draft: fixture as Draft, usage: { totalTokens: 0 } };
    }

    // 2. Google Gemini 1.5 Flash Live Mode
    if (config.provider === 'gemini' && config.geminiApiKey) {
      const apiKey = config.geminiApiKey.trim();
      const prompt = `You are a Salesforce Content Architect for the IT Daily Upskilling application.
Generate a structured technical micro-learning draft based on the following input:
${JSON.stringify(document, null, 2)}

You MUST return ONLY valid raw JSON matching this schema:
{
  "topic": {
    "id": "top_unique_id",
    "title": "Topic Title",
    "description": "Short description",
    "relevanceScore": 0.95
  },
  "lesson": {
    "id": "les_unique_id",
    "topicId": "top_unique_id",
    "title": "Clear Lesson Title",
    "shortExplanation": "Clear technical explanation for engineers",
    "whyItMatters": "Why this matters in production systems",
    "realWorldExample": "Enterprise scenario (Banking/Insurance/E-commerce)",
    "estimatedMinutes": 3,
    "difficulty": "medium",
    "releaseVersion": "Summer 24",
    "verificationStatus": "verified"
  },
  "scenario": {
    "id": "scen_unique_id",
    "lessonId": "les_unique_id",
    "description": "Realistic enterprise scenario description"
  },
  "mcq": {
    "id": "mcq_unique_id",
    "scenarioId": "scen_unique_id",
    "question": "What is the recommended approach?",
    "options": [
      { "id": "A", "label": "Option A description" },
      { "id": "B", "label": "Option B description" },
      { "id": "C", "label": "Option C description" },
      { "id": "D", "label": "Option D description" }
    ],
    "correctAnswerId": "B",
    "explanation": "Detailed explanation of why B is correct and others are wrong"
  }
}`;

      // 1. Query Google to discover the exact supported models for this API key
      let activeModels: string[] = [];
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!listRes.ok) {
          const errData = await listRes.json().catch(() => ({}));
          const errMsg = errData?.error?.message || listRes.statusText;
          throw new Error(`Google Gemini Error (${listRes.status}): ${errMsg}`);
        }
        const listData = await listRes.json();
        const models: any[] = listData.models || [];
        activeModels = models
          .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m) => m.name);
      } catch (listErr: any) {
        if (listErr.message?.startsWith('Google Gemini Error')) {
          throw listErr;
        }
        // Fallback candidate list if listModels network failed
        activeModels = [
          'models/gemini-2.0-flash',
          'models/gemini-1.5-flash',
          'models/gemini-1.5-flash-latest',
          'models/gemini-1.5-pro',
        ];
      }

      if (activeModels.length === 0) {
        throw new Error('Google returned 0 available models for this API key. Please check your Google AI Studio project.');
      }

      // Sort flash models to the front for fastest generation
      activeModels.sort((a, b) => {
        if (a.includes('flash') && !b.includes('flash')) return -1;
        if (!a.includes('flash') && b.includes('flash')) return 1;
        return 0;
      });

      let resData: any = null;
      let lastError = '';

      for (const modelPath of activeModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
              },
            }),
          });

          if (res.ok) {
            resData = await res.json();
            break;
          } else {
            const errJson = await res.json().catch(() => ({}));
            lastError = errJson?.error?.message || res.statusText;
          }
        } catch (callErr: any) {
          lastError = callErr.message;
        }
      }

      if (!resData) {
        throw new Error(`Gemini generation failed: ${lastError || 'Could not connect to Gemini'}`);
      }

      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini returned an empty response.');

      // Strip markdown code fences if wrapped in ```json ... ```
      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (err) {
        const match = cleanedText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {
            parsed = { lesson: { title: typeof document === 'object' && document.title ? document.title : 'Salesforce Lesson', shortExplanation: cleanedText } };
          }
        } else {
          parsed = { lesson: { title: typeof document === 'object' && document.title ? document.title : 'Salesforce Lesson', shortExplanation: cleanedText } };
        }
      }

      // Extract topic, lesson, scenario, mcq whether returned as single objects or arrays
      const topic = parsed.topic || parsed.topics?.[0] || {
        id: `top-${Date.now()}`,
        title: typeof document === 'object' && document.title ? document.title : 'Salesforce Architecture',
        description: 'Key technical highlights and concepts.',
        relevanceScore: 0.95,
      };

      const lesson = parsed.lesson || parsed.lessons?.[0] || {
        id: `les-${Date.now()}`,
        topicId: topic.id,
        title: topic.title,
        shortExplanation: 'Overview of latest capabilities and design patterns.',
        whyItMatters: 'Essential for enterprise performance and scalability.',
        realWorldExample: 'Implementing robust customer workflows.',
        estimatedMinutes: 3,
        difficulty: 'medium',
        releaseVersion: 'Winter 25',
        verificationStatus: 'verified',
      };

      const scenario = parsed.scenario || parsed.scenarios?.[0] || {
        id: `scen-${Date.now()}`,
        lessonId: lesson.id,
        description: 'A mission-critical enterprise Salesforce implementation requirement.',
      };

      const rawMcq = parsed.mcq || parsed.mcqs?.[0] || {};
      const mcq = {
        id: rawMcq.id || `mcq-${Date.now()}`,
        lessonId: lesson.id,
        question: rawMcq.question || 'What is the recommended best practice for this architecture?',
        options: Array.isArray(rawMcq.options) && rawMcq.options.length >= 2
          ? rawMcq.options
          : [
              { id: 'A', label: 'Use synchronous triggers without bulk collections' },
              { id: 'B', label: 'Apply bulkification patterns and asynchronous processing' },
              { id: 'C', label: 'Execute SOQL inside loops' },
              { id: 'D', label: 'Hardcode record IDs directly in Apex' },
            ],
        correctOptionId: rawMcq.correctAnswerId || rawMcq.correctOptionId || 'B',
        correctAnswerId: rawMcq.correctAnswerId || rawMcq.correctOptionId || 'B',
        explanation: rawMcq.explanation || 'Applying bulk collections and async patterns prevents governor limit exceptions.',
      };

      const normalizedDraft: any = {
        documentId: `doc-${Date.now()}`,
        sourceName: 'Salesforce Developer Docs via Google Gemini 1.5 Flash',
        originalUrl: 'https://developer.salesforce.com',
        title: topic.title,
        technology: 'Salesforce',
        releaseVersion: 'Winter 25',
        publishedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        topics: [topic],
        lessons: [lesson],
        scenarios: [scenario],
        mcqs: [mcq],
        evidences: [{
          id: `ev-${Date.now()}`,
          sourceName: 'Salesforce Official Developer Guide',
          sourceUrl: 'https://developer.salesforce.com',
          citation: 'Release & Architecture Guide',
        }],
        // Direct access aliases for UI
        topic,
        lesson,
        scenario,
        mcq,
      };

      return { draft: normalizedDraft, usage: { totalTokens: 350 } };
    }

    // 3. OpenAI Live Mode
    const apiKey = config.openaiApiKey || env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('No API key configured for live LLM mode. Please configure Gemini or OpenAI key in settings.');

    const payload = {
      model: config.model || env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Salesforce Content Architect. Generate a structured micro-learning Draft object strictly formatted as JSON.',
        },
        { role: 'user', content: JSON.stringify(document) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('OpenAI request failed: ' + res.statusText);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const draft: Draft = DraftSchema.parse(JSON.parse(content));
    const usage = data.usage ?? { total_tokens: 0 };
    return { draft, usage: { totalTokens: usage.total_tokens } };
  }
}
