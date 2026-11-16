// src/screens/Today/RevisionCard.tsx
import React, { useState } from 'react';
import { LearningContent } from '@/types/learning';
import { useProgressStore } from '@/store/progressStore';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import { analytics } from '@/services/analyticsService';
import { updateSRSAttempt } from '@/services/spacedRepetition';
import { Brain, Eye, CheckCircle2, RotateCcw, ThumbsUp, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  content: LearningContent & {
    recallQuestion?: string;
    keyPoints?: string[];
  };
}

/**
 * Interactive Spaced Repetition Revision Activity.
 * Prompts active memory recall first, then reveals production key takeaways
 * with quick SRS confidence rating (Easy, Medium, Hard).
 */
const RevisionCard: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { setProgress, dailyProgress } = useProgressStore();

  const progress = dailyProgress[content.id];
  const [showAnswer, setShowAnswer] = useState<boolean>(!!progress && progress.status === 'completed');
  const [confidenceRated, setConfidenceRated] = useState<string | null>(null);

  const handleReveal = () => {
    setProgress({
      activityId: content.id,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    analytics.trackRevisionCompleted(content.id, 'today');
    setShowAnswer(true);
  };

  const handleRateConfidence = (level: 'easy' | 'medium' | 'hard') => {
    setConfidenceRated(level);
    const isSuccess = level !== 'hard';
    updateSRSAttempt(content.id, content.title, content.category || 'general', isSuccess);
  };

  const handleClose = () => {
    navigate('/');
  };

  const isSample = content.verificationStatus === 'sample';
  const recallQuestion =
    content.recallQuestion ||
    `Can you recall the core architectural principles and governor rules of ${content.title}?`;

  const keyPoints = content.keyPoints || [
    content.explanation || 'Recall key syntax and execution lifecycles.',
    content.realWorldExample || 'Apply defensive design patterns to prevent production governor exceptions.',
    'Always design for bulk volume and test with 200+ records in unit tests.',
  ];

  return (
    <div className="card p-5 space-y-4 shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Remember
          </span>
          <h3 className="text-lg font-bold text-primary">Quick Revision</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Brain size={12} /> Spaced Recall
          </span>
          {isSample && <Badge label="Sample" variant="sample" />}
        </div>
      </div>

      {/* Target Concept Name */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <p className="text-xs text-muted uppercase font-semibold">Previous Topic Recall</p>
        <p className="text-base font-bold text-primary">{content.title}</p>
      </div>

      {/* Flashcard Body */}
      {!showAnswer ? (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <Brain size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Active Memory Test
              </p>
              <p className="text-sm font-medium text-amber-950 dark:text-amber-100 leading-snug">
                {recallQuestion}
              </p>
            </div>
          </div>

          <p className="text-2xs text-amber-800/80 dark:text-amber-400/80 italic">
            💡 Take 10 seconds to answer mentally before revealing the answer.
          </p>

          <button
            onClick={handleReveal}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <Eye size={15} />
            <span>Reveal Answer & Key Insights</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Revealed Answer Card */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-primary flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Key Architectural Rules to Remember</span>
            </p>
            <ul className="space-y-2">
              {keyPoints.map((pt, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-secondary flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Confidence Self-Rating */}
          <div className="space-y-2">
            <p className="text-2xs uppercase font-bold tracking-wider text-muted">
              How well did you remember this?
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRateConfidence('hard')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  confidenceRated === 'hard'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-secondary'
                }`}
              >
                <RotateCcw size={13} className="text-rose-500" />
                <span>Need Review</span>
              </button>

              <button
                onClick={() => handleRateConfidence('medium')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  confidenceRated === 'medium'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-secondary'
                }`}
              >
                <ThumbsUp size={13} className="text-amber-500" />
                <span>Good</span>
              </button>

              <button
                onClick={() => handleRateConfidence('easy')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  confidenceRated === 'easy'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-secondary'
                }`}
              >
                <Sparkles size={13} className="text-emerald-500" />
                <span>Easy Recall</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-secondary hover:text-primary rounded-lg text-xs font-semibold transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionCard;
