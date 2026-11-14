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

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`Gemini generation failed: ${errJson?.error?.message || res.statusText}`);
      }

      const resData = await res.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini returned an empty response.');

      const parsed = JSON.parse(rawText);
      const validated = DraftSchema.parse(parsed);
      return { draft: validated, usage: { totalTokens: 350 } };
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
