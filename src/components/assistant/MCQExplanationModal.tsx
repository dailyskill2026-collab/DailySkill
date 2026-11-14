// src/components/assistant/MCQExplanationModal.tsx
import React from 'react';
import { X, CheckCircle2, XCircle, BookOpen, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';
import type { QuizQuestion } from '@/types/learning';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizQuestion;
  selectedAnswerId: string | null;
  onAskMore?: () => void;
}

export default function MCQExplanationModal({
  isOpen,
  onClose,
  quiz,
  selectedAnswerId,
  onAskMore,
}: Props) {
  if (!isOpen) return null;

  const isCorrect = selectedAnswerId === quiz.correctAnswerId;
  const selectedOption = quiz.options.find((o) => o.id === selectedAnswerId);
  const correctOption = quiz.options.find((o) => o.id === quiz.correctAnswerId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="MCQ Answer Explanation"
    >
      <div className="bg-surface-card rounded-2xl max-w-lg w-full p-5 border border-border-light dark:border-border-dark shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-brand-500" size={18} />
            <h2 className="text-sm font-bold text-primary">MCQ Detailed Explanation</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Question & Scenario */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1.5">
          {quiz.scenario && (
            <p className="text-secondary italic">"{quiz.scenario}"</p>
          )}
          <p className="font-semibold text-primary">{quiz.question}</p>
        </div>

        {/* Selected vs Correct Comparison */}
        <div className="space-y-2">
          {/* User Selection */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                Your Answer: {selectedOption ? `${selectedOption.id}) ${selectedOption.label}` : 'None'}
              </p>
              <p className="text-2xs mt-0.5">
                {isCorrect
                  ? 'Great job! Your answer matches the recommended approach.'
                  : 'This answer does not satisfy the requirement.'}
              </p>
            </div>
          </div>

          {/* Correct Answer Breakdown if user was wrong */}
          {!isCorrect && correctOption && (
            <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Correct Answer: {correctOption.id}) {correctOption.label}</p>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-1">
          <p className="font-semibold text-primary">Why this is the correct solution:</p>
          <div className="p-3 bg-surface-card border border-border-light dark:border-border-dark rounded-xl text-secondary leading-relaxed">
            {quiz.explanation}
          </div>
        </div>

        {/* Why incorrect explanation if applicable */}
        {!isCorrect && selectedOption && (
          <div className="space-y-1">
            <p className="font-semibold text-primary">Why option ({selectedOption.id}) is not suitable:</p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-secondary leading-relaxed">
              {selectedOption.id === 'A' && 'Validation Rules execute synchronously and cannot perform asynchronous external system integrations.'}
              {selectedOption.id === 'C' && 'Formula Fields compute values read-only at runtime and cannot invoke external services or execute async jobs.'}
              {selectedOption.id === 'D' && 'Page Layouts are UI presentation configurations and cannot perform business logic or background execution.'}
              {!['A', 'C', 'D'].includes(selectedOption.id) &&
                `Option ${selectedOption.id} is not designed for asynchronous non-blocking job execution.`}
            </div>
          </div>
        )}

        {/* Source Reference */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1 text-2xs">
          <div className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
            <ShieldCheck size={13} />
            <span>Approved Source Reference:</span>
          </div>
          <p className="text-secondary">
            Salesforce Apex Developer Guide — Asynchronous Apex & Governor Limits
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t dark:border-gray-800">
          {onAskMore ? (
            <button
              onClick={() => {
                onClose();
                onAskMore();
              }}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
            >
              <BookOpen size={14} />
              <span>Ask Assistant More Questions</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
