// src/ai/llmClient.ts
// Simple LLM client wrapper supporting mock and live modes.
// In mock mode it returns fixture data from ./fixtures/mock/*.json.
// In live mode it uses OpenAI Chat Completion with function calling.

import type { Draft } from './schemas';
import { env } from '@/lib/env';

export type LLMMode = 'mock' | 'live';

export class LLMClient {
  private mode: LLMMode;
  constructor() {
    this.mode = env.LLM_MODE === 'live' ? 'live' : 'mock';
  }

  /**
   * Generate a full draft for a given source document.
   * The `document` argument should contain the structured source data
   * (sections, metadata) produced by Sprint 5.
   */
  async generateDraft(document: any): Promise<{ draft: Draft; usage?: { totalTokens: number } }> {
    if (this.mode === 'mock') {
      // Load fixture JSON (small, deterministic).
      const { default: fixture } = await import('./fixtures/mock/draftFixture.json');
      return { draft: fixture as Draft, usage: { totalTokens: 0 } };
    }
    // Live mode – call OpenAI (or any configured LLM).
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set for live LLM mode');
    const payload = {
      model: env.LLM_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'Generate AI content draft.' }, { role: 'user', content: JSON.stringify(document) }],
      functions: [
        {
          name: 'outputDraft',
          description: 'Returns a structured Draft object.',
          parameters: DraftSchema.shape,
        },
      ],
      function_call: { name: 'outputDraft' },
    } as any;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('LLM request failed: ' + res.statusText);
    const data = await res.json();
    const fn = data.choices?.[0]?.message?.function_call?.arguments;
    const draft: Draft = JSON.parse(fn);
    const usage = data.usage ?? { total_tokens: 0 };
    return { draft, usage: { totalTokens: usage.total_tokens } };
  }
}
