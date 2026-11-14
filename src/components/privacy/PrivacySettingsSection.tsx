// src/components/privacy/PrivacySettingsSection.tsx
import React, { useState } from 'react';
import { ShieldCheck, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';
import {
  isAnalyticsOptedOut,
  setAnalyticsOptOut,
  clearLocalAnalyticsHistory,
  clearAllLocalFeedback,
} from '@/services/privacyService';

export default function PrivacySettingsSection() {
  const [optedOut, setOptedOut] = useState<boolean>(isAnalyticsOptedOut());
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  const handleToggle = () => {
    const next = !optedOut;
    setOptedOut(next);
    setAnalyticsOptOut(next);
  };

  const handleClearData = async () => {
    if (window.confirm('Clear all locally recorded analytics events and feedback submissions? This will not affect your learning progress.')) {
      await clearLocalAnalyticsHistory();
      await clearAllLocalFeedback();
      setClearedNotice('Local analytics and feedback logs have been cleared.');
      setTimeout(() => setClearedNotice(null), 3000);
    }
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-emerald-500" size={18} />
        <h2 className="text-sm font-semibold text-primary">Local Privacy & Data Controls</h2>
      </div>

      <p className="text-xs text-secondary leading-relaxed">
        Your learning activity, metrics, and feedback remain <strong>100% on your device</strong>. No external tracking SDKs (Google Analytics, Mixpanel, etc.) or tracking pixels are ever loaded.
      </p>

      {clearedNotice && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>{clearedNotice}</span>
        </div>
      )}

      {/* Analytics Opt-Out Toggle */}
      <div className="flex items-center justify-between py-2 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2.5">
          <EyeOff size={16} className="text-muted" />
          <div>
            <p className="text-xs font-medium text-primary">Record Local Analytics</p>
            <p className="text-2xs text-secondary">
              {optedOut ? 'Event recording is paused' : 'Logging local learning journey events'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          role="switch"
          aria-checked={!optedOut}
          aria-label="Toggle local analytics recording"
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
            !optedOut ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              !optedOut ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Clear Local Analytics History */}
      <div className="pt-2 border-t border-border-light dark:border-border-dark flex justify-end">
        <button
          onClick={handleClearData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 size={13} />
          <span>Clear Local Analytics History</span>
        </button>
      </div>
    </div>
  );
}
