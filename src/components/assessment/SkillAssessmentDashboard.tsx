import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  AssessmentType,
  SkillCategory,
  InProgressAssessment,
  AssessmentAttempt,
  PersonalizedImprovementPlan
} from '../../types/assessment';
import { LearningChallenge, UserAchievement } from '../../types/challenge';
import { assessmentService } from '../../services/assessmentService';
import { challengeService } from '../../services/challengeService';
import { achievementService } from '../../services/achievementService';
import { improvementPlanService } from '../../services/improvementPlanService';
import { AssessmentRunnerModal } from './AssessmentRunnerModal';
import { AssessmentReviewModal } from './AssessmentReviewModal';

const CATEGORIES: { id: SkillCategory; label: string }[] = [
  { id: 'admin', label: 'Admin & Config' },
  { id: 'apex', label: 'Core Apex' },
  { id: 'lwc', label: 'Lightning Web Components' },
  { id: 'integrations', label: 'Integrations & REST' },
  { id: 'security', label: 'Security & Sharing' },
  { id: 'flows', label: 'Flows & Automation' },
  { id: 'async_apex', label: 'Asynchronous Apex' },
  { id: 'devops', label: 'DevOps & ALM' }
];

interface SkillAssessmentDashboardProps {
  onAskAssistant?: (prompt: string, contextTitle: string) => void;
  onNavigateToTopic?: (topic: string) => void;
}

export const SkillAssessmentDashboard: React.FC<SkillAssessmentDashboardProps> = ({
  onAskAssistant,
  onNavigateToTopic
}) => {
  const [inProgress, setInProgress] = useState<InProgressAssessment | null>(null);
  const [activeModal, setActiveModal] = useState<'runner' | 'review' | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<AssessmentAttempt | null>(null);
  const [activePlan, setActivePlan] = useState<PersonalizedImprovementPlan | null>(null);

  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<LearningChallenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<LearningChallenge[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);

  // Selection state for starting assessments
  const [quickCategory, setQuickCategory] = useState<SkillCategory | 'all'>('all');
  const [topicCategory, setTopicCategory] = useState<SkillCategory>('apex');

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const loadData = async () => {
    const existing = await assessmentService.getInProgress();
    setInProgress(existing);

    const attempts = await assessmentService.getAttempts();
    setHistory(attempts);

    const plan = await improvementPlanService.getActivePlan();
    setActivePlan(plan);

    const daily = await challengeService.getDailyChallenges();
    setDailyChallenges(daily);

    const weekly = await challengeService.getWeeklyChallenges();
    setWeeklyChallenges(weekly);

    const achs = await achievementService.getAchievements();
    setAchievements(achs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStart = async (type: AssessmentType, cat?: SkillCategory) => {
    const assessment = await assessmentService.startAssessment(type, cat);
    setInProgress(assessment);
    setActiveModal('runner');
  };

  const handleResume = () => {
    if (inProgress) {
      setActiveModal('runner');
    }
  };

  const handleDiscardInProgress = async () => {
    await assessmentService.clearInProgress();
    setInProgress(null);
  };

  const handleSubmit = async (assessment: InProgressAssessment, timeSpent: number) => {
    const result = await assessmentService.submitAssessment(assessment, timeSpent);
    setInProgress(null);
    setSelectedAttempt(result.attempt);
    setActivePlan(result.improvementPlan);
    setActiveModal('review');

    // Notify if badges earned
    if (result.newlyEarnedBadges.length > 0) {
      setNotificationToast(`🏆 Achievement Unlocked: ${result.newlyEarnedBadges.map(b => b.title).join(', ')}!`);
      setTimeout(() => setNotificationToast(null), 5000);
    }

    // Refresh challenges and history
    loadData();
  };

  const handleViewAttempt = (attempt: AssessmentAttempt) => {
    setSelectedAttempt(attempt);
    setActiveModal('review');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{notificationToast}</span>
        </div>
      )}

      {/* Header Banner with Disclaimer */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-indigo-400/20">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Skill Assessment & Gap Analysis
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
            Benchmark Your Salesforce Proficiency
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Take focused 3–15 minute scenario diagnostics. Identify weak topics, complete tailored micro-plans, and earn mastery achievements.
          </p>

          <div className="pt-2 flex items-start sm:items-center gap-2 text-xs text-indigo-300/80">
            <ShieldCheck className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Educational Self-Assessment:</strong> Designed to guide daily upskilling; not an official certification.
            </span>
          </div>
        </div>
      </div>

      {/* In-Progress Resume Alert */}
      {inProgress && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                You have an assessment in progress!
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {inProgress.title} ({Object.keys(inProgress.userAnswers).length} of {inProgress.questions.length} questions answered)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardInProgress}
              className="px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 hover:underline"
            >
              Discard
            </button>
            <button
              onClick={handleResume}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              Resume Assessment <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Assessment Modes List (Mobile-Optimized Vertical Stack) */}
      <div className="flex flex-col gap-4">
        {/* Quick Diagnostic */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                5 Questions
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" /> 3–5 min
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Quick Diagnostic
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast, high-yield drill to spot knowledge gaps during coffee breaks.
            </p>

            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Domain:
              </label>
              <select
                value={quickCategory}
                onChange={e => setQuickCategory(e.target.value as SkillCategory | 'all')}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="all">General (Cross-Domain)</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleStart('quick', quickCategory === 'all' ? undefined : quickCategory)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            Start Quick Diagnostic <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Topic Assessment */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                10 Questions
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" /> 8–10 min
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Topic Assessment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Deep dive into a specific technical discipline with scenario-based MCQs.
            </p>

            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Topic:
              </label>
              <select
                value={topicCategory}
                onChange={e => setTopicCategory(e.target.value as SkillCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleStart('topic', topicCategory)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            Start Topic Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skill Check */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-400 transition-all">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                20 Questions
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" /> 15–20 min
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Full Skill Check
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Comprehensive exam covering all 8 Salesforce categories with gap rating.
            </p>

            <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              Covers Admin, Apex, LWC, Integrations, Security, Flows, Async & DevOps.
            </div>
          </div>

          <button
            onClick={() => handleStart('skill_check')}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            Start Comprehensive Check <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Learning Challenges & Badges Section */}
      <div className="flex flex-col gap-4">
        {/* Challenges Widget */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Active Learning Challenges
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Daily & Weekly</span>
          </div>

          <div className="space-y-3">
            {[...dailyChallenges, ...weeklyChallenges].map(c => {
              const progressPct = Math.round((c.currentCount / c.targetCount) * 100);
              return (
                <div
                  key={c.challengeId}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {c.type}
                      </span>
                      {c.title}
                    </span>
                    <span className="font-mono text-slate-500">
                      {c.currentCount}/{c.targetCount}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        c.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {c.description} {c.isCompleted && '🎉 Completed!'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Widget */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Earned Achievements
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {achievements.filter(a => a.earnedAt).length} of {achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {achievements.map(ach => {
              const isEarned = Boolean(ach.earnedAt);
              return (
                <div
                  key={ach.achievementId}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isEarned
                      ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ach.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {ach.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Improvement Plan Summary */}
      {activePlan && (
        <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recommended Action Plan
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Focus: {activePlan.weakTopics.slice(0, 3).join(', ') || 'Core Concepts'}
            </span>
          </div>

          <div className="space-y-2">
            {activePlan.actions.map(act => (
              <div
                key={act.actionId}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      act.isCompleted ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                    }`}
                  >
                    {act.isCompleted && '✓'}
                  </span>
                  <span className={act.isCompleted ? 'line-through text-slate-400' : 'font-medium'}>
                    {act.title}
                  </span>
                </div>

                {act.relatedId && onNavigateToTopic && !act.isCompleted && (
                  <button
                    onClick={() => onNavigateToTopic(act.relatedId!)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    Go <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Assessment Attempts History */}
      {history.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Past Assessment Attempts
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 5).map(att => (
              <div
                key={att.attemptId}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {att.title}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {new Date(att.completedAt).toLocaleDateString()} • {att.correctAnswers}/{att.totalQuestions} correct ({Math.floor(att.durationSeconds / 60)}m {att.durationSeconds % 60}s)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                      att.percentageScore >= 80
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : att.percentageScore >= 50
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {att.percentageScore}%
                  </span>

                  <button
                    onClick={() => handleViewAttempt(att)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Runner Modal */}
      {activeModal === 'runner' && inProgress && (
        <AssessmentRunnerModal
          inProgress={inProgress}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Review Modal */}
      {activeModal === 'review' && selectedAttempt && (
        <AssessmentReviewModal
          attempt={selectedAttempt}
          improvementPlan={activePlan}
          onClose={() => setActiveModal(null)}
          onAskAssistant={onAskAssistant}
          onNavigateToTopic={onNavigateToTopic}
        />
      )}
    </div>
  );
};
