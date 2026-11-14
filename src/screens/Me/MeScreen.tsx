import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useThemeStore } from '@/store/themeStore';
import { useProfileStore, Duration, WeeklyGoalDays } from '@/store/profileStore';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressStore } from '@/store/progressStore';
import { getStreakState } from '@/services/streakService';
import { exploreContent } from '@/data/exploreContent';
import Badge from '@/components/common/Badge';
import ProgressBar from '@/components/common/ProgressBar';
import { ExploreCard } from '@/components/Explore/ExploreCard';
import AuthCard from '@/components/auth/AuthCard';
import LearningInsightsCard from '@/components/common/LearningInsightsCard';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import PrivacySettingsSection from '@/components/privacy/PrivacySettingsSection';
import { achievementService } from '@/services/achievementService';
import type { UserAchievement } from '@/types/challenge';
import {
  Flame,
  BookOpen,
  Target,
  Award,
  ChevronRight,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  Bookmark,
  Clock,
  Calendar,
  MessageSquare,
  BarChart3,
  Trophy,
  RotateCcw,
} from 'lucide-react';

export default function MeScreen() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const profile = useProfileStore();
  const { setProfile } = useProfileStore();
  const { bookmarks } = useBookmarkStore();
  const { user } = useAuth();
  const { dailyProgress } = useProgressStore();
  const streak = getStreakState();

  const completedLessonsCount = Object.values(dailyProgress).filter(
    (p) => p.status === 'completed'
  ).length;

  const displayName =
    user?.displayName ||
    (profile.name && profile.name !== 'Rahul' ? profile.name : user?.email ? user.email.split('@')[0] : 'Learner (Guest)');
  const initials = (displayName || 'L').substring(0, 2).toUpperCase();

  // Dynamic Skill progress based on actual activity
  const apexPercent = Math.min(100, Math.round((completedLessonsCount / 4) * 100));
  const lwcPercent = dailyProgress['sf-revision-basic-object']?.status === 'completed' ? 100 : 0;
  const adminPercent = dailyProgress['sf-practice-queueable']?.status === 'completed' ? 100 : 0;

  const bookmarkedIds = Array.from(bookmarks);

  useEffect(() => {
    achievementService.getAchievements().then(setAchievements);
  }, []);

  const handleDurationChange = (d: Duration) => {
    setProfile({ dailyDuration: d });
  };

  const handleWeeklyGoalChange = (g: WeeklyGoalDays) => {
    setProfile({ weeklyGoal: g });
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all your local progress, streaks, and quiz results to 0% and start fresh?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-primary">Me</h1>
        <p className="text-sm text-secondary">Your learning profile, insights & preferences</p>
      </div>

      <div className="px-4 space-y-5">
        {/* Authentication & Account Card */}
        <AuthCard />

        {/* Profile card */}
        <div className="card gradient-brand p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 relative">
            <p className="text-lg font-bold text-white">{displayName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="chip text-2xs bg-white/20 text-white px-2 py-0.5 capitalize">
                {profile.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-brand-200 mt-1 capitalize">{profile.experience} experience</p>
          </div>
        </div>

        {/* Learning Insights Dashboard (Sprint 10) */}
        <LearningInsightsCard />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Flame, label: 'Day Streak', value: `${streak.currentStreak} Days`, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
            { icon: BookOpen, label: 'Lessons Done', value: completedLessonsCount, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950' },
            { icon: Target, label: 'Revision Score', value: `${completedLessonsCount > 0 ? 100 : 0}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
            { icon: Award, label: 'Paths Done', value: completedLessonsCount >= 3 ? 1 : 0, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon size={20} className={stat.color} fill={stat.icon === Flame ? 'currentColor' : 'none'} />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p className="text-2xs text-secondary">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Skill progress */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-primary">Skill Progress</h2>
            <Badge label={completedLessonsCount > 0 ? 'Active' : 'Not Started'} variant={completedLessonsCount > 0 ? 'verified' : 'sample'} />
          </div>
          <div className="space-y-3">
            {[
              { skill: 'Apex Development', percent: apexPercent, color: 'bg-brand-500' },
              { skill: 'LWC', percent: lwcPercent, color: 'bg-indigo-500' },
              { skill: 'Administration', percent: adminPercent, color: 'bg-sky-500' },
            ].map((s) => (
              <div key={s.skill}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-secondary">{s.skill}</span>
                  <span className="text-xs font-semibold text-primary">{s.percent}%</span>
                </div>
                <ProgressBar percent={s.percent} colorClass={s.color} height="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Skill Badges (Sprint 13) */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <Trophy size={16} className="text-amber-500" />
              Achievements & Skill Badges
            </h2>
            <Link to="/learn" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Assess Skills →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {achievements.map((ach) => {
              const isEarned = Boolean(ach.earnedAt);
              return (
                <div
                  key={ach.achievementId}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                    isEarned
                      ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-border-light dark:border-border-dark opacity-50 bg-gray-50/50 dark:bg-gray-800/20'
                  }`}
                >
                  <span className="text-lg">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{ach.title}</p>
                    <p className="text-[10px] text-secondary truncate">{ach.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interests */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Learning Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="chip bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Personalization Controls (Sprint 10) */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">Personalization Settings</h2>

          {/* Daily Learning Budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-secondary flex items-center gap-1.5">
                <Clock size={14} className="text-brand-600" />
                Daily Learning Budget
              </span>
              <span className="text-xs font-bold text-primary">{profile.dailyDuration || 5} min/day</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 10] as Duration[]).map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleDurationChange(dur)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    profile.dailyDuration === dur
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800/60 border-border-light dark:border-border-dark text-secondary hover:text-primary'
                  }`}
                >
                  {dur} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Learning Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-secondary flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                Weekly Consistency Goal
              </span>
              <span className="text-xs font-bold text-primary">{profile.weeklyGoal || 5} days/week</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 7] as WeeklyGoalDays[]).map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleWeeklyGoalChange(goal)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    profile.weeklyGoal === goal
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800/60 border-border-light dark:border-border-dark text-secondary hover:text-primary'
                  }`}
                >
                  {goal === 7 ? 'Every Day' : `${goal} Days/Wk`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-4 space-y-1">
          <h2 className="text-sm font-semibold text-primary mb-3">Appearance</h2>

          {/* Theme toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                {isDark ? <Moon size={18} className="text-brand-400" /> : <Sun size={18} className="text-amber-500" />}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-secondary">Switch appearance</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-brand-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isDark ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Saved Articles</h2>
          {bookmarkedIds.length === 0 ? (
            <p className="text-xs text-gray-500">No bookmarks yet.</p>
          ) : (
            <div className="space-y-3">
              {bookmarkedIds.map(id => {
                const content = exploreContent.find(c => c.id === id);
                return content ? <ExploreCard key={id} content={content as any} /> : null;
              })}
            </div>
          )}
        </div>

        {/* In-App Feedback & Help */}
        <div className="card divide-y divide-border-light dark:divide-border-dark">
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Share Feedback</p>
              <p className="text-xs text-secondary">Bugs, feature requests & ideas</p>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </button>

          {[
            { icon: Bookmark, label: 'Saved Articles', sub: 'Your bookmarks' },
            { icon: HelpCircle, label: 'Help & FAQ', sub: 'Get support' },
            { icon: FileText, label: 'Terms & Privacy', sub: 'Legal information' },
          ].map((item) => (
            <div
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{item.label}</p>
                <p className="text-xs text-secondary">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          ))}
        </div>

        {/* Local Privacy & Analytics Controls (Sprint 11) */}
        <PrivacySettingsSection />

        {/* Mock Admin Console Links */}
        <div className="card p-4 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Mock Admin Console
          </h2>
          <div className="flex flex-col gap-2 pt-1 text-xs">
            <Link
              to="/admin/analytics"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 text-primary font-medium"
            >
              <span className="flex items-center gap-2">
                <BarChart3 size={15} className="text-brand-500" />
                Product Analytics & Feedback Dashboard
              </span>
              <ChevronRight size={14} className="text-muted" />
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 text-primary font-medium"
            >
              <span className="flex items-center gap-2">
                <Award size={15} className="text-indigo-500" />
                Content Quality & Knowledge Coverage Audit
              </span>
              <ChevronRight size={14} className="text-muted" />
            </Link>
            <Link
              to="/admin/generation"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 text-primary font-medium"
            >
              <span className="flex items-center gap-2">
                <FileText size={15} className="text-brand-500" />
                AI Content Generation & Publishing
              </span>
              <ChevronRight size={14} className="text-muted" />
            </Link>
          </div>
        </div>

        <p className="text-center text-2xs text-muted pb-2">IT Daily Upskilling v0.14.0 · Sprint 14</p>

        {/* In-App Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          relatedScreen="me"
        />
      </div>
    </div>
  );
}
