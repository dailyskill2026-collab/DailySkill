import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Code2,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { SyllabusLesson } from '@/data/learningPathCurriculum';
import { learningPathService } from '@/services/learningPathService';
import LearningAssistantModal from '@/components/assistant/LearningAssistantModal';

interface InteractiveLessonModalProps {
  pathId: string;
  pathTitle: string;
  lesson: SyllabusLesson;
  allLessons: SyllabusLesson[];
  onClose: () => void;
  onLessonCompleted: () => void;
  onSelectLesson: (lesson: SyllabusLesson) => void;
}

export const InteractiveLessonModal: React.FC<InteractiveLessonModalProps> = ({
  pathId,
  pathTitle,
  lesson,
  allLessons,
  onClose,
  onLessonCompleted,
  onSelectLesson
}) => {
  const isInitiallyCompleted = learningPathService.isLessonCompleted(pathId, lesson.id);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const quiz = lesson.scenarioQuiz;
  const isCorrect = selectedOption === quiz.correctOptionId;

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    setShowExplanation(true);
  };

  const handleMarkComplete = () => {
    learningPathService.completeLesson(pathId, lesson.id);
    setIsCompleted(true);
    onLessonCompleted();
  };

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleCopyCode = () => {
    if (lesson.codeSnippet) {
      navigator.clipboard.writeText(lesson.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-border-light dark:border-border-dark flex flex-col max-h-[92vh] overflow-hidden my-auto animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-light dark:border-border-dark flex items-start justify-between bg-slate-50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {pathTitle}
              </span>
              <span className="text-2xs text-secondary flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> {lesson.duration}
              </span>
              {isCompleted && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-primary leading-snug">
              Module {lesson.moduleIndex}: {lesson.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Lesson Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" /> Lesson Concept
            </h4>
            <p className="text-secondary leading-relaxed text-xs sm:text-sm">
              {lesson.description}
            </p>
          </div>

          {/* Key Principles Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Architectural Rules
            </h4>
            <ul className="space-y-1.5 text-xs text-secondary">
              {lesson.keyConcepts.map((concept, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Snippet if applicable */}
          {lesson.codeSnippet && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" /> Production Code Pattern
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-2xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                <code>{lesson.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Scenario Practice Quiz */}
          <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Scenario Knowledge Check
              </span>
              <span className="text-2xs text-muted">1 MCQ Question</span>
            </div>

            <p className="text-xs font-semibold text-primary">
              {quiz.question}
            </p>

            <div className="space-y-2">
              {quiz.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isAnswer = opt.id === quiz.correctOptionId;

                let optionStyles = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark hover:border-brand-500';
                if (showExplanation) {
                  if (isAnswer) {
                    optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200';
                  } else if (isSelected) {
                    optionStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${optionStyles}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-amber-300 bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Explanation
                    </>
                  )}
                </div>
                <p className="leading-relaxed">{quiz.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-4 h-4" /> Ask AI Doubt
          </button>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <button
                onClick={handleMarkComplete}
                className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" /> Mark Completed
              </button>
            ) : nextLesson ? (
              <button
                onClick={() => onSelectLesson(nextLesson)}
                className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                Next Lesson <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                Path Completed 🎉
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Doubt Assistant Modal */}
      {isAssistantOpen && (
        <LearningAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          defaultQuestion={`Can you explain this Salesforce concept with a practical example: ${lesson.title}?`}
          contextTitle={`${pathTitle} - ${lesson.title}`}
        />
      )}
    </div>
  );
};
