import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfileStore } from '@/store/profileStore';
import {
  generateDailyPlan,
  getContentById,
  getDailyTopicOffset,
  cycleNextDailyTopic,
} from '@/services/dailyPlan';
import { getDailyReleaseInfo } from '@/data/dailyReleaseFeed';
import { useProgressStore } from '@/store/progressStore';
import { recordDailyActivityCompletion } from '@/services/streakService';
import UpdateActivity from '@/screens/Today/UpdateActivity';
import QuizCard from '@/screens/Today/QuizCard';
import RevisionCard from '@/screens/Today/RevisionCard';
import ProgressBar from '@/components/common/ProgressBar';
import CircularProgress from '@/components/common/CircularProgress';
import InAppReminderBanner from '@/components/common/InAppReminderBanner';
import ContinueLearningBanner from '@/components/common/ContinueLearningBanner';
import { analytics } from '@/services/analyticsService';
import { Zap, ArrowRight, RotateCw, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';

export default function TodayScreen() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const store = useProfileStore();
  const rawName =
    user?.displayName ||
    (store?.name && store.name !== 'Rahul'
      ? store.name
      : user?.email
      ? user.email.split('@')[0]
      : 'Learner');
  const firstName = rawName.split(' ')[0] || 'Learner';
  const technology = store?.technology ? store.technology.toUpperCase() : 'SALESFORCE';
  const role = store?.role ? store.role.replace('salesforce_', '').replace('_', ' ') : 'Developer';
  const dailyDuration = store?.dailyDuration ?? 5;

  const [topicOffset, setTopicOffset] = useState<number>(getDailyTopicOffset());
  const plan = generateDailyPlan(topicOffset);
  const activities = plan.activityIds.map((id) => getContentById(id)).filter(Boolean) as any[];
  const { dailyProgress } = useProgressStore();

  const releaseInfo = getDailyReleaseInfo(topicOffset);

  const completed = activities.filter((a) => dailyProgress[a.id]?.status === 'completed').length;
  const total = activities.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Track app opened on mount
  useEffect(() => {
    analytics.trackAppOpened('today');
  }, []);

  // Update streak when qualifying activities are completed
  useEffect(() => {
    if (completed > 0) {
      recordDailyActivityCompletion();
    }
    if (total > 0 && completed === total) {
      analytics.trackLearningGoalCompleted(total);
    }
  }, [completed, total]);

  const handleNextReleaseTopic = () => {
    const next = cycleNextDailyTopic();
    setTopicOffset(next);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="pb-safe max-w-2xl mx-auto">
      {/* ---- Header Section ---- */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {todayFormatted}
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Flame size={11} className="text-amber-500" /> Daily Sprint
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {greeting()}, {firstName} 👋
            </h1>
          </div>
        </div>

        {/* Profile Pill Badge */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs text-secondary">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/80 flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={12} className="text-indigo-500" />
            <span>{technology} {role.toUpperCase()}</span>
          </span>
          <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-2xs">
            ⏱ {dailyDuration}-min Daily Target
          </span>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Onboarding Banner for new users */}
        {!store.onboardingCompleted && (
          <div className="p-3.5 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800 rounded-xl flex items-center justify-between gap-2 shadow-xs">
            <div>
              <p className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                Personalize Your Learning
              </p>
              <p className="text-2xs text-brand-700 dark:text-brand-300">
                Set your tech, role & goals for tailored daily lessons.
              </p>
            </div>
            <Link
              to="/onboarding"
              className="text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex-shrink-0 shadow-xs"
            >
              Get Started →
            </Link>
          </div>
        )}

        {/* In-App Reminders & Prompts */}
        <InAppReminderBanner />
        <ContinueLearningBanner />

        {/* ---- Daily Goal Card ---- */}
        <div className="card gradient-brand p-5 text-white overflow-hidden relative shadow-md">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="flex items-center justify-between relative">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xs font-bold tracking-wider text-brand-200 uppercase">
                  Today's Goal
                </span>
                {completed === total && total > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                    <CheckCircle2 size={10} /> Completed
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">Your {dailyDuration}-Minute Learning</h2>
              <p className="text-xs sm:text-sm text-brand-200 mb-3">
                {completed === total && total > 0
                  ? '🎉 All done for today! Great work keeping your streak!'
                  : `${total - completed} of ${total} ${total === 1 ? 'activity' : 'activities'} remaining`}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar
                    percent={percent}
                    colorClass="bg-white"
                    trackClass="bg-white/30"
                    height="h-2"
                  />
                </div>
                <span className="text-xs font-bold whitespace-nowrap bg-white/15 px-2 py-0.5 rounded-md">
                  {completed}/{total}
                </span>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0">
              <CircularProgress
                percent={percent}
                size={70}
                strokeWidth={6}
                color="rgba(255,255,255,0.95)"
                trackColor="rgba(255,255,255,0.25)"
              >
                <span className="text-xs font-bold text-white">{percent}%</span>
              </CircularProgress>
            </div>
          </div>
        </div>

        {/* ---- Salesforce Release Feed Switcher ---- */}
        <div className="p-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 truncate">
                  Latest Salesforce Release Feed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                  {releaseInfo.item.releaseTag}
                </span>
              </div>
              <p className="text-2xs text-purple-700/90 dark:text-purple-300/90 truncate">
                Topic {releaseInfo.currentIndex} of {releaseInfo.totalTopics}: {releaseInfo.item.update.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextReleaseTopic}
            title="Rotate to next Salesforce release topic"
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-200 text-xs font-semibold shrink-0 border border-purple-200 dark:border-purple-700 flex items-center gap-1.5 shadow-2xs transition"
          >
            <RotateCw size={12} />
            <span>Next Topic</span>
          </button>
        </div>

        {/* Skill Diagnostic Prompt Card */}
        <div className="card p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">
                Weekly Skill Assessment
              </p>
              <p className="text-2xs text-secondary">
                Identify weak areas with a 3–5 min Quick Diagnostic.
              </p>
            </div>
          </div>
          <Link
            to="/learn?tab=assessments"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1 shadow-xs transition"
          >
            Assess <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ---- Daily Activities Section ---- */}
      <section aria-labelledby="activities-heading" className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 id="activities-heading" className="text-lg font-bold text-primary tracking-tight">
            Today's Activities
          </h2>
          <span className="text-2xs text-muted font-medium">
            3-Step Microlearning
          </span>
        </div>

        <div className="space-y-4">
          {activities.map((activity) => {
            const key = activity.id;
            if (activity.category === 'update') {
              return <UpdateActivity key={key} content={activity} />;
            }
            if (activity.category === 'practice') {
              return <QuizCard key={key} contentId={activity.id} />;
            }
            if (activity.category === 'revision') {
              return <RevisionCard key={key} content={activity} />;
            }
            return null;
          })}
        </div>
      </section>
    </div>
  );
}
