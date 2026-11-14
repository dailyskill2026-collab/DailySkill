import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { InProgressAssessment, AssessmentQuestion } from '../../types/assessment';
import { assessmentService } from '../../services/assessmentService';

interface AssessmentRunnerModalProps {
  inProgress: InProgressAssessment;
  onClose: () => void;
  onSubmit: (inProgress: InProgressAssessment, timeSpentSeconds: number) => void;
}

export const AssessmentRunnerModal: React.FC<AssessmentRunnerModalProps> = ({
  inProgress,
  onClose,
  onSubmit
}) => {
  const [assessment, setAssessment] = useState<InProgressAssessment>(inProgress);
  const [currentIndex, setCurrentIndex] = useState<number>(inProgress.currentQuestionIndex || 0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(inProgress.timeSpentSeconds || 0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Autosave progress every 10 seconds
        if (next % 10 === 0) {
          assessmentService.saveProgress({
            ...assessment,
            currentQuestionIndex: currentIndex,
            timeSpentSeconds: next
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, currentIndex]);

  const questions = assessment.questions;
  const currentQ: AssessmentQuestion | undefined = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    const updatedAnswers = {
      ...assessment.userAnswers,
      [currentQ.questionId]: optionId
    };

    const updated = {
      ...assessment,
      currentQuestionIndex: currentIndex,
      timeSpentSeconds: elapsedSeconds,
      userAnswers: updatedAnswers
    };

    setAssessment(updated);
    assessmentService.saveProgress(updated);
  };

  const handleClearAnswer = () => {
    if (!currentQ) return;
    const updatedAnswers = { ...assessment.userAnswers };
    delete updatedAnswers[currentQ.questionId];

    const updated = {
      ...assessment,
      currentQuestionIndex: currentIndex,
      timeSpentSeconds: elapsedSeconds,
      userAnswers: updatedAnswers
    };

    setAssessment(updated);
    assessmentService.saveProgress(updated);
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex);
      const updated = {
        ...assessment,
        currentQuestionIndex: newIndex,
        timeSpentSeconds: elapsedSeconds
      };
      setAssessment(updated);
      assessmentService.saveProgress(updated);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(assessment.userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-between sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl mx-auto my-auto rounded-none sm:rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {assessment.assessmentType.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {assessment.category ? assessment.category.toUpperCase() : 'SALESFORCE'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              {assessment.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Save & Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Jump Bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Question <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentIndex + 1}</span> of {questions.length}
          </div>

          <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {answeredCount} answered ({unansweredCount} remaining)
          </div>
        </div>

        {/* Question Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {currentQ ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Topic: {currentQ.topicTitle}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize text-slate-500">
                  {currentQ.difficulty}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.questionText}
              </h3>

              {/* Code Snippet if applicable */}
              {currentQ.codeSnippet && (
                <div className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Options */}
              <div className="mt-5 space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = assessment.userAnswers[currentQ.questionId] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-400 text-slate-500'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="flex-1 leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {assessment.userAnswers[currentQ.questionId] && (
                <div className="mt-3 text-right">
                  <button
                    onClick={handleClearAnswer}
                    className="text-xs text-slate-500 hover:text-rose-600 underline transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">No questions available.</div>
          )}

          {/* Quick Jump Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 mb-2 font-medium">Question Navigator:</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(assessment.userAnswers[q.questionId]);
                return (
                  <button
                    key={q.questionId}
                    onClick={() => handleNavigate(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <button
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => handleNavigate(currentIndex + 1)}
                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5 shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Submit Assessment
              </button>
            )}
          </div>
        </div>

        {/* Submission Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Submit Assessment?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You have answered <span className="font-semibold text-indigo-600">{answeredCount}</span> of{' '}
                <span className="font-semibold">{questions.length}</span> questions.
                {unansweredCount > 0 && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ {unansweredCount} unanswered questions will be marked incorrect in your score.
                  </span>
                )}
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Continue Reviewing
                </button>
                <button
                  onClick={() => {
                    setShowConfirmSubmit(false);
                    onSubmit(assessment, elapsedSeconds);
                  }}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
