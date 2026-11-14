import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AssessmentAttempt, PersonalizedImprovementPlan } from '../../types/assessment';
import { assessmentQuestionBank } from '../../data/assessmentQuestionBank';
import { improvementPlanService } from '../../services/improvementPlanService';

interface AssessmentReviewModalProps {
  attempt: AssessmentAttempt;
  improvementPlan?: PersonalizedImprovementPlan | null;
  onClose: () => void;
  onAskAssistant?: (prompt: string, contextTitle: string) => void;
  onNavigateToTopic?: (topic: string) => void;
}

export const AssessmentReviewModal: React.FC<AssessmentReviewModalProps> = ({
  attempt,
  improvementPlan,
  onClose,
  onAskAssistant,
  onNavigateToTopic
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'gaps' | 'plan'>('review');
  const [planState, setPlanState] = useState<PersonalizedImprovementPlan | null>(improvementPlan || null);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  const handleToggleAction = async (actionId: string) => {
    if (!planState) return;
    const updated = await improvementPlanService.completeAction(actionId, attempt.mockUserId);
    if (updated) {
      setPlanState({ ...updated });
    }
  };

  const questionBankMap = new Map(assessmentQuestionBank.map((q) => [q.questionId, q]));
  const userAnswersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const passed = attempt.percentageScore >= 70;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-between sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl mx-auto my-auto rounded-none sm:rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                Assessment Results
              </span>
              <span className="text-xs text-slate-500">
                {new Date(attempt.completedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              {attempt.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Summary Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-2xl shadow-md ${
                  attempt.percentageScore >= 80
                    ? 'bg-emerald-500 text-white'
                    : attempt.percentageScore >= 50
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                <span>{attempt.percentageScore}%</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      passed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {passed ? 'Benchmark Met (≥ 70%)' : 'Needs Reinforcement (< 70%)'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {attempt.percentageScore >= 80
                    ? 'Excellent technical command!'
                    : attempt.percentageScore >= 50
                    ? 'Solid foundation, target weak areas below.'
                    : 'Requires focused revision on key concepts.'}
                </h3>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="block text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {attempt.correctAnswers}
                </span>
                <span className="text-slate-500">Correct</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="block text-rose-600 dark:text-rose-400 font-bold text-sm">
                  {attempt.incorrectAnswers}
                </span>
                <span className="text-slate-500">Incorrect</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="block text-amber-600 dark:text-amber-400 font-bold text-sm">
                  {attempt.unansweredQuestions}
                </span>
                <span className="text-slate-500">Skipped</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="block text-slate-800 dark:text-slate-200 font-bold text-sm">
                  {formatTime(attempt.durationSeconds)}
                </span>
                <span className="text-slate-500">Time</span>
              </div>
            </div>
          </div>

          {/* Educational Disclaimer Banner */}
          <div className="mt-4 p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <strong>Educational Self-Assessment:</strong> These scores evaluate conceptual understanding for daily upskilling and are not official Salesforce certifications or credentials.
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex gap-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'review'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Question Review ({attempt.answers.length})
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'gaps'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Skill Gap Breakdown ({attempt.topicPerformances.length} Topics)
          </button>
          {planState && (
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'plan'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Action Plan ({planState.actions.length})
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Question Review */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              {attempt.answers.map((ans, idx) => {
                const q = questionBankMap.get(ans.questionId);
                if (!q) return null;

                const userSelected = ans.selectedOptionId;
                const isCorrect = ans.isCorrect;
                const isSkipped = !userSelected;

                return (
                  <div
                    key={q.questionId}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Q{idx + 1}.</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.topicTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isSkipped ? (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Skipped
                          </span>
                        ) : isCorrect ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {q.questionText}
                    </h4>

                    {q.codeSnippet && (
                      <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                        <pre>{q.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Options Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt) => {
                        const isUserChoice = userSelected === opt.id;
                        const isCorrectOption = opt.id === q.correctAnswerId;

                        let style =
                          'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
                        if (isCorrectOption) {
                          style =
                            'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500/40';
                        } else if (isUserChoice && !isCorrectOption) {
                          style =
                            'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-white/70 dark:bg-slate-800 border">
                              {opt.id}
                            </span>
                            <span className="flex-1 leading-snug">{opt.label}</span>
                            {isCorrectOption && (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                ✓ Correct
                              </span>
                            )}
                            {isUserChoice && !isCorrectOption && (
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Technical Explanation */}
                    <div className="p-3.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5 border border-slate-200/60 dark:border-slate-700/50">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Explanation & Best Practice:
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Ask Assistant Integration */}
                    {onAskAssistant && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() =>
                            onAskAssistant(
                              `Explain why the correct answer for this question on "${q.topicTitle}" is "${q.correctAnswerId}" and why option "${userSelected || 'none'}" was mistaken: "${q.questionText}"`,
                              `Assessment Question: ${q.topicTitle}`
                            )
                          }
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Ask AI Assistant to clarify this concept
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Skill Gaps Breakdown */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation of technical topics covered in this assessment session:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {attempt.topicPerformances.map((tb) => (
                  <div
                    key={tb.topicId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {tb.topicTitle}
                        </h4>
                        <span className="text-xs text-slate-400 capitalize">({tb.category})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tb.correctAnswers} of {tb.questionsAttempted} questions correct
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            tb.accuracy >= 80
                              ? 'bg-emerald-500'
                              : tb.accuracy >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${tb.accuracy}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold w-10 text-right">
                        {tb.accuracy}%
                      </span>

                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                          tb.classification === 'strong'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : tb.classification === 'developing'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : tb.classification === 'needs_practice'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {tb.classification.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Personalized Improvement Plan */}
          {activeTab === 'plan' && planState && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Your Personalized Remediation Steps
                </p>
                <p>
                  Targeting weak areas identified in this assessment: {planState.weakTopics.join(', ') || 'General Salesforce'}. Complete these 3-5 minute micro-actions to solidify mastery.
                </p>
              </div>

              <div className="space-y-3">
                {planState.actions.map((act) => (
                  <div
                    key={act.actionId}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      act.isCompleted
                        ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/40 opacity-75'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleAction(act.actionId)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors ${
                          act.isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-400 hover:border-slate-600 dark:border-slate-600'
                        }`}
                      >
                        {act.isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {act.actionType.replace('_', ' ')}
                          </span>
                          <h4
                            className={`text-sm font-bold ${
                              act.isCompleted
                                ? 'line-through text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {act.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    {act.relatedId && onNavigateToTopic && !act.isCompleted && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToTopic(act.relatedId!);
                        }}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
                      >
                        Start <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Recorded in your local learning portfolio.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
