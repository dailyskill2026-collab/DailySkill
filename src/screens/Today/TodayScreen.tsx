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
import { recordDailyActivityCompletion, getStreakState } from '@/services/streakService';
import UpdateActivity from '@/screens/Today/UpdateActivity';
import QuizCard from '@/screens/Today/QuizCard';
import RevisionCard from '@/screens/Today/RevisionCard';
import ProgressBar from '@/components/common/ProgressBar';
import CircularProgress from '@/components/common/CircularProgress';
import { analytics } from '@/services/analyticsService';
import { ArrowRight, RotateCw, Sparkles, Flame, CheckCircle2, Award } from 'lucide-react';
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

  const roleMap: Record<string, string> = {
    salesforce_dev: 'Developer',
    salesforce_admin: 'Administrator',
    salesforce_arch: 'Technical Architect',
    salesforce_lead: 'Tech Lead',
    salesforce_consult: 'Consultant / BA',
    salesforce_fresher: 'Junior / Fresher',
  };
  const roleFormatted = roleMap[store?.role] || store?.role?.replace('salesforce_', '').replace('_', ' ') || 'Developer';

  const expMap: Record<string, string> = {
    fresher: 'Fresher (0–1 yr)',
    '0-2': 'Junior (1–3 yrs)',
    '2-5': 'Mid (3–5 yrs)',
    '5-8': 'Senior (5–8 yrs)',
    '8+': 'Architect (8+ yrs)',
  };
  const expFormatted = expMap[store?.experience] || store?.experience || 'All Levels';

  const dailyDuration = store?.dailyDuration ?? 5;

  const [topicOffset, setTopicOffset] = useState<number>(getDailyTopicOffset());
  const plan = generateDailyPlan(topicOffset);
  const activities = plan.activityIds.map((id) => getContentById(id)).filter(Boolean) as any[];
  const { dailyProgress } = useProgressStore();

  const releaseInfo = getDailyReleaseInfo(topicOffset, store);
  const streak = getStreakState();

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
    <div className="pb-safe max-w-2xl mx-auto space-y-4">
      {/* ---- Header Section ---- */}
      <div className="px-4 pt-5 pb-1">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {todayFormatted}
            </span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Flame size={11} className="text-amber-500" />
              {streak.currentStreak} Day Streak
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          {greeting()}, {firstName} 👋
        </h1>

        {/* Personalized Candidate Track Pill */}
        <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>{technology} {roleFormatted.toUpperCase()}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-2xs text-secondary">
            🎯 {expFormatted}
          </span>
          <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-2xs text-secondary">
            ⏱ {dailyDuration} min/day
          </span>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* ---- Daily Goal Card ---- */}
        <div className="card gradient-brand p-5 text-white overflow-hidden relative shadow-md">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="flex items-center justify-between relative">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xs font-bold tracking-wider text-emerald-100 uppercase">
                  Today's Goal
                </span>
                {completed === total && total > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                    <CheckCircle2 size={10} /> Goal Reached
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">Your {dailyDuration}-Minute Sprint</h2>
              <p className="text-xs sm:text-sm text-emerald-100 mb-3">
                {completed === total && total > 0
                  ? '🎉 All activities finished! Streak updated.'
                  : `${total - completed} of ${total} ${total === 1 ? 'step' : 'steps'} remaining today`}
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

        {/* ---- Tailored Salesforce Release Feed Switcher (Pista Green & Sky Blue Theme) ---- */}
        <div className="p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/80 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-sky-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                  Latest Releases (Winter '27 • Summer '26 • Spring '26)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {releaseInfo.item.releaseTag}
                </span>
              </div>
              <p className="text-2xs text-emerald-800/90 dark:text-emerald-300/90 truncate">
                Topic {releaseInfo.currentIndex} of {releaseInfo.totalTopics}: {releaseInfo.item.update.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextReleaseTopic}
            title="Rotate to next tailored Salesforce release topic"
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shrink-0 border border-emerald-200 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs transition"
          >
            <RotateCw size={12} />
            <span>Next Topic</span>
          </button>
        </div>
      </div>

      {/* ---- Daily Activities Section ---- */}
      <section aria-labelledby="activities-heading" className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 id="activities-heading" className="text-lg font-bold text-primary tracking-tight">
            Today's Activities
          </h2>
          <span className="text-2xs text-muted font-medium">
            3-Step Sprint • Tailored for {roleFormatted}
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

        {/* Optional Diagnostic Link at Bottom */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/learn?tab=assessments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <Award size={14} />
            <span>Want to test all skills? Try a 3-minute Quick Diagnostic →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
