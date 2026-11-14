// src/screens/Admin/GenerationScreen.tsx
import React, { useState } from 'react';
import { runGeneration } from '@/ai/pipeline';
import type { Draft } from '@/ai/schemas';
import { env } from '@/lib/env';

// Load mock document fixture directly (typed as any for simplicity)
// Mock fixture (replace with actual mock data as needed)
const fixture = {} as any;

export default function GenerationScreen() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [usage, setUsage] = useState<{ totalTokens: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple dev‑only guard – can be expanded to real auth later.
  const isAllowed = env.ADMIN_ONLY_DEV !== 'true' || process.env.NODE_ENV === 'development';

  if (!isAllowed) {
    return (
      <div className="p-4">
        <p className="text-red-600">Admin UI is disabled in production.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runGeneration(fixture as any);
      setDraft(result.draft);
      if (result.usage) setUsage(result.usage);
    } catch (e: any) {
      setError(e.message ?? 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4" aria-busy={loading}>
      <h1 className="text-2xl font-bold">AI Draft Generation (Admin)</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Draft (Mock)'}
      </button>

      {error && <p className="text-red-600">Error: {error}</p>}

      {draft && (
        <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96 text-sm">
{JSON.stringify(draft, null, 2)}
        </pre>
      )}

      {usage && (
        <p className="text-gray-600">
          Tokens used: {usage.totalTokens}
        </p>
      )}
    </div>
  );
}
