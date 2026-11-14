// src/lib/env.ts
// Simple environment helper exposing needed variables with defaults.
// In a Vite+React project, import.meta.env is populated from .env files.

export const env = {
  // LLM mode: 'mock' (default) or 'live'
  LLM_MODE: (import.meta.env.VITE_LLM_MODE ?? 'mock') as 'mock' | 'live',
  // OpenAI key for live mode
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  // Model name for live mode
  LLM_MODEL: import.meta.env.VITE_LLM_MODEL ?? 'gpt-4o-mini',
  // Toggle Supabase draft storage
  USE_SUPABASE_DRAFTS: import.meta.env.VITE_USE_SUPABASE_DRAFTS ?? 'false',
  // Simple dev‑only admin guard (set to "true" to restrict admin UI to dev builds)
  ADMIN_ONLY_DEV: import.meta.env.VITE_ADMIN_ONLY_DEV ?? 'true',
};
