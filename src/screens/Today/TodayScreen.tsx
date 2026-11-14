import React from 'react';
import { useProfileStore } from '@/store/profileStore';
import { generateDailyPlan, getContentById } from '@/services/dailyPlan';
import { useProgressStore } from '@/store/progressStore';
import UpdateActivity from '@/screens/Today/UpdateActivity';
import QuizCard from '@/screens/Today/QuizCard';
import RevisionCard from '@/screens/Today/RevisionCard';
import ProgressBar from '@/components/common/ProgressBar';
import CircularProgress from '@/components/common/CircularProgress';

export default function TodayScreen() {
  const store = useProfileStore();
  const safeName = store?.name ?? 'User';
  const firstName = safeName.split(' ')[0];
  const technology = store?.technology?.toUpperCase() ?? '';
  const role = store?.role?.replace('salesforce_', '') ?? '';
  const dailyDuration = store?.dailyDuration ?? 0;
  const plan = generateDailyPlan();
  const activities = plan.activityIds.map((id) => getContentById(id)).filter(Boolean) as any[];
  const { dailyProgress } = useProgressStore();

  const completed = activities.filter((a) => dailyProgress[a.id]?.status === 'completed').length;
  const total = activities.length;
  const percent = Math.round((completed / total) * 100);

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

      {/* ---- Daily Goal Card ---- */}
      <div className="px-4">
        <div className="card gradient-brand p-5 text-white overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="flex items-center justify-between relative">
            <div className="flex-1">
              <p className="text-xs font-medium text-brand-200 uppercase tracking-wider mb-1">Today's Goal</p>
              <h2 className="text-lg font-bold mb-1">Your {dailyDuration}-Minute Learning</h2>
              <p className="text-sm text-brand-200 mb-3">
                {completed === total
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
