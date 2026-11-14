// src/screens/Admin/GenerationScreen.tsx
import React, { useState } from 'react';
import { runGeneration } from '@/ai/pipeline';
import type { Draft } from '@/ai/schemas';
import { getAIConfig, saveAIConfig, AIProviderType } from '@/store/aiConfigStore';
import { Sparkles, Bot, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GenerationScreen() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [usage, setUsage] = useState<{ totalTokens: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicPrompt, setTopicPrompt] = useState('Salesforce Apex Governor Limits & Bulkification');

  const [aiConfig, setAiConfig] = useState(getAIConfig());
  const [tempKey, setTempKey] = useState(aiConfig.geminiApiKey || '');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(aiConfig.provider);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStatusNotice(null);

    // Save key before generating if entered
    if (selectedProvider === 'gemini' && tempKey) {
      const updated = saveAIConfig({ provider: 'gemini', geminiApiKey: tempKey });
      setAiConfig(updated);
    } else if (selectedProvider === 'mock') {
      const updated = saveAIConfig({ provider: 'mock' });
      setAiConfig(updated);
    }

    try {
      const documentInput = {
        title: topicPrompt,
        technology: 'Salesforce',
        sections: [
          {
            heading: topicPrompt,
            content: `Generate an enterprise micro-learning lesson and scenario question on ${topicPrompt}.`,
          },
        ],
      };

      const result = await runGeneration(documentInput);
      setDraft(result.draft);
      if (result.usage) setUsage(result.usage);
      setStatusNotice('Draft generated successfully!');
    } catch (e: any) {
      setError(e.message ?? 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6" aria-busy={loading}>
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="text-amber-500" />
            AI Content Generator & Live Tester
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate authentic Salesforce lessons and scenario MCQs using Google Gemini 1.5 Flash.
          </p>
        </div>
      </div>

      {/* Provider & Key Configuration Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          1. Select AI Engine
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedProvider('mock')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedProvider === 'mock'
                ? 'border-brand-600 bg-brand-50/50 dark:bg-gray-700 ring-2 ring-brand-500'
                : 'border-gray-200 dark:border-gray-700 opacity-70'
            }`}
          >
            <div className="font-bold text-gray-900 dark:text-white">Verified Fixture (Mock)</div>
            <div className="text-xs text-gray-500">Offline deterministic test data</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('gemini')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedProvider === 'gemini'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-gray-700 ring-2 ring-amber-400'
                : 'border-gray-200 dark:border-gray-700 opacity-70'
            }`}
          >
            <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>Google Gemini 1.5 Flash</span>
              <span className="text-2xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                LIVE AI
              </span>
            </div>
            <div className="text-xs text-gray-500">Generates fresh lessons from real Gemini API</div>
          </button>
        </div>

        {selectedProvider === 'gemini' && (
          <div className="space-y-2 pt-2 border-t dark:border-gray-700">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste your AIzaSy... key"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500">
              Get a free key instantly from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 underline font-semibold"
              >
                Google AI Studio
              </a>
              . Key stays locally in your browser.
            </p>
          </div>
        )}
      </div>

      {/* Topic Prompt Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          2. Enter Salesforce Topic to Generate
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="e.g. Asynchronous Apex, Flow Execution Order, LWC Wire..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              'Generating...'
            ) : (
              <>
                <Sparkles size={16} />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-700 dark:text-red-300 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {statusNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {statusNotice}
        </div>
      )}

      {/* Generated Result Preview */}
      {draft && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {draft.topic.title}
              </span>
              <span className="text-xs text-gray-500">
                Est. {draft.lesson.estimatedMinutes} Mins · {draft.lesson.difficulty.toUpperCase()}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {draft.lesson.title}
            </h3>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {draft.lesson.shortExplanation}
            </p>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase">
                Enterprise Scenario MCQ
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {draft.scenario.description}
              </p>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {draft.mcq.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {draft.mcq.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      opt.id === draft.mcq.correctAnswerId
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-2xs font-bold">
                      {opt.id}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t dark:border-gray-800">
                <strong>Correct: Option {draft.mcq.correctAnswerId}</strong> — {draft.mcq.explanation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
