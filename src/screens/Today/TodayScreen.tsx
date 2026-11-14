import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useProfileStore } from '@/store/profileStore';
import { generateDailyPlan, getContentById } from '@/services/dailyPlan';
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
import { Zap, ArrowRight } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';

export default function TodayScreen() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const store = useProfileStore();
  const rawName = user?.displayName || (store?.name && store.name !== 'Rahul' ? store.name : user?.email ? user.email.split('@')[0] : 'Learner');
  const firstName = rawName.split(' ')[0] || 'Learner';
  const technology = store?.technology?.toUpperCase() ?? '';
  const role = store?.role?.replace('salesforce_', '') ?? '';
  const dailyDuration = store?.dailyDuration ?? 0;
  const plan = generateDailyPlan();
  const activities = plan.activityIds.map((id) => getContentById(id)).filter(Boolean) as any[];
  const { dailyProgress } = useProgressStore();

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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="pb-safe">
      {/* ---- Header ---- */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-secondary mb-0.5">{today}</p>
            <h1 className="text-2xl font-bold text-primary">
              {greeting()}, {firstName} 👋
            </h1>
            <p className="text-sm text-secondary">Technology: {technology}</p>
            <p className="text-sm text-secondary">Role: {role}</p>
            <p className="text-sm text-secondary">Daily duration: {dailyDuration} min</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Onboarding Banner for new users */}
        {!store.onboardingCompleted && (
          <div className="mb-4 p-3.5 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-900 dark:text-brand-200">Personalize Your Learning</p>
              <p className="text-xs text-brand-700 dark:text-brand-300">Set your tech, role & goals for tailored daily lessons.</p>
            </div>
            <Link
              to="/onboarding"
              className="text-xs font-medium px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              Get Started →
            </Link>
          </div>
        )}

        {/* Local In-App Reminders (Sprint 10) */}
        <InAppReminderBanner />

        {/* Continue Learning Prompt (Sprint 10) */}
        <ContinueLearningBanner />

        {/* ---- Daily Goal Card ---- */}
        <div className="card gradient-brand p-5 text-white overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="flex items-center justify-between relative">
            <div className="flex-1">
              <p className="text-xs font-medium text-brand-200 uppercase tracking-wider mb-1">Today's Goal</p>
              <h2 className="text-lg font-bold mb-1">Your {dailyDuration}-Minute Learning</h2>
              <p className="text-sm text-brand-200 mb-3">
                {completed === total && total > 0
                  ? '🎉 All done for today! Great work!'
                  : `${total - completed} activity${total - completed === 1 ? '' : 'ies'} remaining`}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar percent={percent} colorClass="bg-white" trackClass="bg-white/30" height="h-2" />
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {completed}/{total}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <CircularProgress percent={percent} size={72} strokeWidth={6} color="rgba(255,255,255,0.9)" trackColor="rgba(255,255,255,0.25)">
                <span className="text-sm font-bold text-white">{percent}%</span>
              </CircularProgress>
            </div>
          </div>
        </div>

        {/* Skill Diagnostic Prompt Card (Sprint 13) */}
        <div className="card p-4 mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Weekly Skill Assessment
              </p>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                Identify weak areas with a 3–5 min Quick Diagnostic.
              </p>
            </div>
          </div>
          <Link
            to="/learn"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shrink-0 flex items-center gap-1 shadow-xs"
          >
            Assess <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ---- Daily Activities ---- */}
      <section aria-labelledby="activities-heading" className="px-4 mt-5">
        <h2 id="activities-heading" className="section-heading mb-3">
          Today's Activities
        </h2>
        <div className="space-y-3">
          {activities.map((activity) => {
            const status = dailyProgress[activity.id]?.status;
            const isCompleted = status === 'completed';
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
