// src/components/common/ContinueLearningBanner.tsx
import React from 'react';
import { getContinueLearningAction } from '@/services/continueLearningService';
import { PlayCircle, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContinueLearningBanner() {
  const nextItem = getContinueLearningAction();

  if (!nextItem) return null;

  return (
    <div className="card p-4 border border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={12} />
          {nextItem.reason}
        </span>
        <span className="text-2xs text-secondary flex items-center gap-1">
          <Clock size={11} />
          ~{nextItem.estimatedMinutes} min
        </span>
      </div>

      <h3 className="text-sm font-bold text-primary mb-2.5 line-clamp-1">
        Resume: {nextItem.content.title}
      </h3>

      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary line-clamp-1 max-w-[220px]">
          {nextItem.content.summary}
        </p>
        <Link
          to={`/explore/${nextItem.content.id}`}
          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <PlayCircle size={14} />
          <span>Resume</span>
        </Link>
      </div>
    </div>
  );
}
