// src/ai/pipeline.ts
// Orchestrates AI content generation using LLMClient and DraftRepo.

import { LLMClient } from './llmClient';
import { createDraftRepo } from './draftRepo';
import type { Draft } from './schemas';

/**
 * Runs the generation pipeline for a given source document.
 *
 * @param document Structured source document (as produced by Sprint 5).
 * @returns The generated Draft and optional usage info.
 */
export async function runGeneration(document: any): Promise<{ draft: Draft; usage?: { totalTokens: number } }> {
  const client = new LLMClient();
  const repo = createDraftRepo();

  // Generate draft via LLM (mock or live).
  const { draft, usage } = await client.generateDraft(document);

  // Validate via Zod (already typed, but safety check)
  // Draft type is enforced by LLMClient; we just save it.
  await repo.saveDraft(draft);

  return { draft, usage };
}
