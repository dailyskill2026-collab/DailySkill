import React, { useState } from 'react';
import { Brain, Target, Zap, ChevronRight, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { mockRevisionTopics, mockQuizzes } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { recordQuizAttempt, getWeakTopicsList } from '@/services/weakTopicService';
import { updateSRSAttempt, getDueSRSTopics } from '@/services/spacedRepetition';
import ProgressBar from '@/components/common/ProgressBar';
import Badge from '@/components/common/Badge';
import { analytics } from '@/services/analyticsService';

function StrengthBar({ percent }: { percent: number }) {
  const color =
    percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="strength-bar flex-1">
      <div className={`strength-bar-fill ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function QuizModal({ onClose }: { onClose: () => void }) {
  const quiz = mockQuizzes[0];
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
    const correct = index === quiz.correctIndex;

    // Record for Weak Topic Analysis and Spaced Repetition (Sprint 10)
    recordQuizAttempt(quiz.topicTitle, correct);
    updateSRSAttempt(quiz.id, quiz.topicTitle, 'Apex', correct);
    analytics.trackRevisionCompleted(quiz.topicTitle, 'revise');
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
              <p className="text-xs text-brand-200 font-medium">Interactive Spaced Practice</p>
              <h3 id="quiz-modal-title" className="text-lg font-bold text-white">{quiz.topicTitle}</h3>
            </div>
            <Badge label="Active" variant="verified" />
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
            <div className={`p-3 rounded-xl mb-4 text-xs leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
            }`}>
              <strong>{isCorrect ? '✓ Correct! ' : '✗ Not quite. '}</strong>
              {quiz.explanation}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm active:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviseScreen() {
  const { reviseModalOpen, openReviseModal, closeReviseModal } = useUIStore();
  const dueTopics = getDueSRSTopics();
  const weakTopics = getWeakTopicsList();
  const totalDue = dueTopics.length > 0 ? dueTopics.length : mockRevisionTopics.reduce((s, t) => s + t.dueCount, 0);

  return (
    <div className="pb-safe">
      {reviseModalOpen && <QuizModal onClose={closeReviseModal} />}

      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-primary">Revise</h1>
        <p className="text-sm text-secondary">Smart spaced repetition & weak topic strengthening</p>
      </div>

      <div className="px-4 space-y-5">
        {/* Overview cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Brain, label: 'Due Today', value: totalDue, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950' },
            { icon: Target, label: 'Weak Topics', value: weakTopics.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
            { icon: Zap, label: 'SRS Cards', value: mockRevisionTopics.length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
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

        {/* Topic list */}
        <div>
          <h2 className="section-heading mb-3">Topics for Spaced Review</h2>
          <div className="space-y-3">
            {mockRevisionTopics.map((topic) => (
              <div key={topic.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="chip text-2xs bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 mb-1">
                      {topic.tag}
                    </span>
                    <h3 className="text-sm font-semibold text-primary">{topic.title}</h3>
                  </div>
                  {topic.dueCount > 0 && (
                    <span className="chip text-2xs bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800">
                      {topic.dueCount} due
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xs text-secondary">Strength</span>
                  <StrengthBar percent={topic.strengthPercent} />
                  <span className="text-2xs font-semibold text-secondary w-8 text-right">
                    {topic.strengthPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                  <span className="text-2xs text-muted">{topic.lastReviewedLabel}</span>
                  <button
                    onClick={openReviseModal}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
                    aria-label={`Revise ${topic.title}`}
                  >
                    <span>Practice</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
