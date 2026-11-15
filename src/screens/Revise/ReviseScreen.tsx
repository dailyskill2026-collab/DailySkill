import React, { useState, useEffect } from 'react';
import { Brain, Target, Zap, ChevronRight, CheckCircle2, XCircle, Sparkles, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { mockQuizzes, MockQuiz } from '@/data';
import { recordQuizAttempt, getWeakTopicsList } from '@/services/weakTopicService';
import { updateSRSAttempt, getDueSRSTopics, getAllSRSRecords, SRSRecord } from '@/services/spacedRepetition';
import { recordDailyActivityCompletion } from '@/services/streakService';
import Badge from '@/components/common/Badge';
import { analytics } from '@/services/analyticsService';
import LearningAssistantModal from '@/components/assistant/LearningAssistantModal';
import { Bot } from 'lucide-react';

function StrengthBar({ percent }: { percent: number }) {
  const color =
    percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="strength-bar flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function QuizModal({
  quiz,
  onClose,
  onComplete,
}: {
  quiz: MockQuiz;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const isAnswered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
    const correct = index === quiz.correctIndex;

    // Record for Weak Topic Analysis and Spaced Repetition
    recordQuizAttempt(quiz.topicTitle, correct);
    updateSRSAttempt(quiz.id, quiz.topicTitle, quiz.topicTitle.split(' ')[0] || 'Salesforce', correct);
    try {
      recordDailyActivityCompletion();
    } catch {}
    analytics.trackRevisionCompleted(quiz.topicTitle, 'revise');
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="gradient-brand px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-200 font-medium">Interactive Spaced Review Drill</p>
              <h3 id="quiz-modal-title" className="text-lg font-bold text-white">{quiz.topicTitle}</h3>
            </div>
            <Badge label="Active Recall" variant="verified" />
          </div>
        </div>

        <div className="p-5">
          {/* Question */}
          <p className="text-sm font-semibold text-primary mb-4 leading-relaxed">{quiz.question}</p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {quiz.options.map((option, i) => {
              let optionClass = 'border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-primary';
              if (isAnswered) {
                if (i === quiz.correctIndex) {
                  optionClass = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
                } else if (i === selected) {
                  optionClass = 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
                }
              } else {
                optionClass += ' hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40';
              }
              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleSelect(i)}
                  aria-label={`Option ${i + 1}: ${option}`}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-between gap-3 ${optionClass} disabled:cursor-default`}
                >
                  <span>{option}</span>
                  {isAnswered && i === quiz.correctIndex && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                  {isAnswered && i === selected && i !== quiz.correctIndex && <XCircle size={16} className="text-rose-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="space-y-3 mb-4">
              <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
              }`}>
                <strong>{isCorrect ? '✓ Correct! ' : '✗ Not quite. '}</strong>
                {quiz.explanation}
              </div>

              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="w-full py-2 bg-brand-50 dark:bg-brand-950/50 border border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-brand-100 transition-colors"
              >
                <Bot size={14} />
                <span>Ask AI Assistant About {quiz.topicTitle}</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm active:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>

        {/* AI Learning Assistant */}
        <LearningAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          defaultQuestion={`Can you explain this Salesforce revision topic with practical production context: ${quiz.topicTitle}?`}
          contextTitle={quiz.topicTitle}
        />
      </div>
    </div>
  );
}

export default function ReviseScreen() {
  const [activeQuiz, setActiveQuiz] = useState<MockQuiz | null>(null);
  const [srsRecords, setSrsRecords] = useState<Record<string, SRSRecord>>(() => getAllSRSRecords());
  const [dueTopics, setDueTopics] = useState<SRSRecord[]>(() => getDueSRSTopics());
  const [weakTopics, setWeakTopics] = useState<string[]>(() => getWeakTopicsList());

  const reloadData = () => {
    setSrsRecords(getAllSRSRecords());
    setDueTopics(getDueSRSTopics());
    setWeakTopics(getWeakTopicsList());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const totalCards = Object.keys(srsRecords).length;
  const totalDue = dueTopics.length;
  const cardsList = Object.values(srsRecords);

  const handleStartPracticeByTitle = (title: string) => {
    const match = mockQuizzes.find(
      q => q.topicTitle.toLowerCase() === title.toLowerCase() || q.topicTitle.toLowerCase().includes(title.toLowerCase())
    ) || mockQuizzes[0];
    setActiveQuiz(match);
  };

  return (
    <div className="pb-safe">
      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={reloadData}
        />
      )}

      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-primary">Revise</h1>
        <p className="text-sm text-secondary">Smart spaced repetition & weak topic strengthening</p>
      </div>

      <div className="px-4 space-y-5">
        {/* Overview cards (Human readable labels, dynamic 0s for fresh user) */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Brain, label: 'Due Today', value: totalDue, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950' },
            { icon: Target, label: 'Weak Topics', value: weakTopics.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
            { icon: Zap, label: 'Review Cards', value: totalCards, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
          ].map((stat) => (
            <div key={stat.label} className="card p-3.5 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-2xs text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* What is Spaced Repetition (SRS) Educational Explainer */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle size={16} />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-900 dark:text-white">What is Spaced Repetition (SRS)?</p>
            <p className="text-secondary leading-relaxed mt-0.5">
              <strong>SRS (Spaced Repetition System)</strong> is a memory technique that schedules review drills at increasing intervals (1 day, 3 days, 1 week, 1 month) right as your brain begins to forget a concept. This embeds technical Salesforce knowledge into permanent recall.
            </p>
          </div>
        </div>

        {/* Weak topic alert if any */}
        {weakTopics.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles size={13} />
              Identified Focus Areas:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {weakTopics.map((topic) => (
                <span key={topic} className="chip text-2xs bg-white dark:bg-surface-dark border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active Spaced Review Deck */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-heading">Topics for Spaced Review</h2>
            {totalCards > 0 && (
              <span className="text-2xs text-muted font-medium">
                {totalCards} {totalCards === 1 ? 'topic' : 'topics'} in deck
              </span>
            )}
          </div>

          {cardsList.length > 0 ? (
            <div className="space-y-3">
              {cardsList.map((record) => {
                const totalAttempts = record.correctCount + record.incorrectCount;
                const strength = totalAttempts > 0 ? Math.round((record.correctCount / totalAttempts) * 100) : 50;
                const isDue = record.status === 'due' || dueTopics.some(d => d.topicId === record.topicId);

                return (
                  <div key={record.topicId} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="chip text-2xs bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 mb-1">
                          {record.tag}
                        </span>
                        <h3 className="text-sm font-semibold text-primary">{record.topicTitle}</h3>
                      </div>
                      {isDue ? (
                        <span className="chip text-2xs bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800">
                          Due Today
                        </span>
                      ) : record.status === 'mastered' ? (
                        <span className="chip text-2xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                          Mastered 🎉
                        </span>
                      ) : (
                        <span className="chip text-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Next: {record.nextReviewDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-2xs text-secondary">Recall Strength</span>
                      <StrengthBar percent={strength} />
                      <span className="text-2xs font-semibold text-secondary w-8 text-right">
                        {strength}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                      <span className="text-2xs text-muted">
                        Last review: {new Date(record.lastReviewedDate).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleStartPracticeByTitle(record.topicTitle)}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
                        aria-label={`Practice ${record.topicTitle}`}
                      >
                        <span>Practice</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-sm text-primary">Your Review Queue is Clear</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                You have 0 review cards due right now. Complete daily lessons in <strong>Learn</strong> or start a quick practice drill below to add topics to your spaced repetition queue.
              </p>
            </div>
          )}
        </div>

        {/* Practice Starter Deck (Available Topics to Add to Deck) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-heading">Practice Topics & Add to Deck</h2>
            <Badge label="Interactive Drills" variant="sample" />
          </div>

          <div className="card divide-y divide-border-light dark:divide-border-dark">
            {mockQuizzes.map((quiz) => {
              const inDeck = Boolean(srsRecords[quiz.id]);
              return (
                <div key={quiz.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary leading-snug">{quiz.topicTitle}</p>
                    <p className="text-2xs text-secondary mt-0.5 line-clamp-1">{quiz.question}</p>
                  </div>
                  <button
                    onClick={() => setActiveQuiz(quiz)}
                    className="py-1.5 px-3 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold shrink-0 flex items-center gap-1 transition"
                  >
                    <span>{inDeck ? 'Review' : 'Practice'}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
