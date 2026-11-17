// src/screens/Today/QuizCard.tsx
import React, { useState } from 'react';
import { QuizQuestion } from '@/types/learning';
import { useProgressStore } from '@/store/progressStore';
import { useNavigate } from 'react-router-dom';
import { sampleQuizQuestions } from '@/data/sampleQuiz';
import { getQuizByContentId } from '@/data/dailyReleaseFeed';
import Badge from '@/components/common/Badge';
import { analytics } from '@/services/analyticsService';
import MCQExplanationModal from '@/components/assistant/MCQExplanationModal';
import LearningAssistantModal from '@/components/assistant/LearningAssistantModal';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Building2 } from 'lucide-react';

interface Props {
  contentId: string; // the LearningContent.id this quiz is linked to
}

const QuizCard: React.FC<Props> = ({ contentId }) => {
  const navigate = useNavigate();
  const { setProgress, dailyProgress } = useProgressStore();
  const quiz = getQuizByContentId(contentId) || sampleQuizQuestions.find((q) => q.contentId === contentId);

  const progress = dailyProgress[contentId];

  const [selected, setSelected] = useState<string | null>(progress?.selectedAnswerId || null);
  const [submitted, setSubmitted] = useState<boolean>(!!progress && progress.status === 'completed');
  const [isCorrect, setIsCorrect] = useState<boolean>(progress?.isCorrect ?? false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  if (!quiz) {
    return (
      <div className="card p-4 space-y-2">
        <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Step 2 • Hands-on Check
        </span>
        <h3 className="text-lg font-semibold text-primary">Practice</h3>
        <p className="text-sm text-muted">Scenario quiz loading or completed.</p>
      </div>
    );
  }

  const handleOptionClick = (id: string) => {
    if (submitted) return; // prevent changes after submit
    setSelected(id);
  };

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === quiz.correctAnswerId;
    setIsCorrect(correct);
    setSubmitted(true);
    // Persist progress
    setProgress({
      activityId: contentId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      selectedAnswerId: selected,
      isCorrect: correct,
    });
    analytics.trackQuizCompleted(contentId, correct, 'today');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="card p-5 sm:p-6 space-y-4 shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Step 2 • Real-World Challenge
          </span>
          <h3 className="text-xl font-bold text-primary">Practice</h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
          <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" /> +10 XP
        </span>
      </div>

      {/* Enterprise Scenario Box */}
      {quiz.scenario && (
        <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>Scenario</span>
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">{quiz.scenario}</p>
        </div>
      )}

      {/* Question */}
      <p className="font-bold text-base sm:text-lg text-primary leading-snug">
        {quiz.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {quiz.options.map((opt) => {
          const isSelected = selected === opt.id;
          let borderClass = 'border-slate-200 dark:border-slate-800 bg-card hover:border-emerald-400 dark:hover:border-emerald-700';
          let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-secondary';

          if (isSelected) {
            borderClass = 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/30';
            badgeClass = 'bg-emerald-600 text-white';
          }

          if (submitted) {
            if (opt.id === quiz.correctAnswerId) {
              borderClass = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40';
              badgeClass = 'bg-emerald-600 text-white';
            } else if (isSelected && !isCorrect) {
              borderClass = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40';
              badgeClass = 'bg-rose-600 text-white';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              disabled={submitted}
              className={`p-3.5 border-2 rounded-2xl text-left transition-all flex items-start gap-3.5 ${borderClass} ${
                submitted ? 'cursor-default' : 'hover:scale-[1.005]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${badgeClass}`}
              >
                {opt.id}
              </span>
              <span className="text-sm sm:text-base text-primary leading-snug pt-0.5">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm sm:text-base transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Submit Answer</span>
          <span className="text-sm">→</span>
        </button>
      )}

      {/* Feedback upon submission */}
      {submitted && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
          {isCorrect ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Correct! 🎉 Spot-on architecture decision.
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                  {quiz.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5">
              <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                  Not quite, but great try!
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 leading-relaxed">
                  {quiz.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsExplanationOpen(true)}
              className="px-3.5 py-1.5 bg-brand-50 dark:bg-brand-950/60 border border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold rounded-lg flex items-center gap-1.5 text-xs hover:bg-brand-100 dark:hover:bg-brand-900/60 transition"
            >
              <HelpCircle size={14} />
              <span>Explain Answer</span>
            </button>
            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-secondary hover:text-primary rounded-lg text-xs font-semibold transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* MCQ Explanation Modal */}
      {quiz && (
        <MCQExplanationModal
          isOpen={isExplanationOpen}
          onClose={() => setIsExplanationOpen(false)}
          quiz={quiz}
          selectedAnswerId={selected}
          onAskMore={() => setIsAssistantOpen(true)}
        />
      )}

      {/* AI Learning Assistant */}
      <LearningAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        context={{
          topicId: 'salesforce_mcq',
          topicTitle: quiz.question,
          lessonId: contentId,
        }}
      />
    </div>
  );
};

export default QuizCard;
