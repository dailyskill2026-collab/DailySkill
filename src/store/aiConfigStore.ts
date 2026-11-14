/**
 * AI Configuration Store
 * Allows users and administrators to switch between Mock mode and Live AI providers (Gemini 1.5 Flash, OpenAI)
 * and safely store their API key in browser localStorage for live testing.
 */

export type AIProviderType = 'mock' | 'gemini' | 'openai';

export interface AIConfig {
  provider: AIProviderType;
  geminiApiKey: string;
  openaiApiKey: string;
  model: string;
}

const STORAGE_KEY = 'it-daily-ai-config';

export function getAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider || 'mock',
        geminiApiKey: parsed.geminiApiKey || '',
        openaiApiKey: parsed.openaiApiKey || '',
        model: parsed.model || 'gemini-1.5-flash',
      };
    }
  } catch {
    // fallback
  }

  return {
    provider: (import.meta.env.VITE_AI_PROVIDER as AIProviderType) || 'mock',
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gemini-1.5-flash',
  };
}

export function saveAIConfig(config: Partial<AIConfig>): AIConfig {
  const current = getAIConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
