import React from 'react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { exploreContent } from '@/data/exploreContent';
import { Flame, BookOpen, Target, Award, ChevronRight, Moon, Sun, HelpCircle, FileText, LogOut, Bookmark } from 'lucide-react';

export default function MeScreen() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-primary">Me</h1>
        <p className="text-sm text-secondary">Your learning profile</p>
      </div>

      <div className="px-4 space-y-5">
        {/* Profile card */}
        <div className="card gradient-brand p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{mockUser.initials}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 relative">
            <p className="text-lg font-bold text-white">{mockUser.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="chip text-2xs bg-white/20 text-white px-2 py-0.5">
                Salesforce Developer
              </span>
            </div>
            <p className="text-xs text-brand-200 mt-1 capitalize">{mockUser.experienceLevel} level</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Flame, label: 'Day Streak', value: mockUser.streak, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
            { icon: BookOpen, label: 'Lessons Done', value: mockUser.totalLessons, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950' },
            { icon: Target, label: 'Revision Score', value: `${mockUser.revisionScore}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
            { icon: Award, label: 'Paths Done', value: mockUser.pathsCompleted, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950' },
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

        {/* Weekly Activity */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">This Week's Activity</h2>
          <div className="flex justify-between items-end gap-1">
            {['S','M','T','W','T','F','S'].map((day, i) => {
              const count = mockUser.weeklyActivity[i];
              const isToday = i === new Date().getDay();
              const heightPercent = count > 0 ? Math.max(20, (count / 3) * 100) : 8;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      isToday
                        ? 'gradient-brand'
                        : count > 0
                        ? 'bg-brand-300 dark:bg-brand-700'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    style={{ height: `${heightPercent}%`, minHeight: '6px', maxHeight: '48px' }}
                    aria-label={`${day}: ${count} lessons`}
                  />
                  <span className="text-2xs text-secondary">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill progress */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-primary">Skill Progress</h2>
            <Badge label="Sample" variant="sample" />
          </div>
          <div className="space-y-3">
            {[
              { skill: 'Apex Development', percent: 25, color: 'bg-brand-500' },
              { skill: 'LWC', percent: 11, color: 'bg-indigo-500' },
              { skill: 'Administration', percent: 8, color: 'bg-sky-500' },
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

        {/* Interests */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Learning Interests</h2>
          <div className="flex flex-wrap gap-2">
            {mockUser.interests.map((interest) => (
              <span
                key={interest}
                className="chip bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-4 space-y-1">
          <h2 className="text-sm font-semibold text-primary mb-3">Preferences</h2>

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

          {/* Notifications - UI only */}
          <div className="flex items-center justify-between py-2 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Bell size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Daily Reminder</p>
                <p className="text-xs text-secondary">Coming in next sprint</p>
              </div>
            </div>
            <span className="text-2xs font-medium text-muted px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">Soon</span>
          </div>

          {/* Premium preview */}
          <div className="card overflow-hidden">
            <div className="gradient-brand p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-brand-200 font-medium">Coming Soon</p>
                <p className="text-base font-bold text-white">IT Daily Premium</p>
                <p className="text-xs text-brand-200 mt-0.5">Unlimited paths · AI hints · Certificates</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-white text-brand-700 font-semibold text-sm active:opacity-90">
                Learn More
              </button>
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="card p-4 mt-4">
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

          <div className="card divide-y divide-border-light dark:divide-border-dark">
            {[
              { icon: Bookmark, label: 'Saved Articles', sub: 'Your bookmarks' },
              { icon: HelpCircle, label: 'Help & FAQ', sub: 'Get support' },
              { icon: FileText, label: 'Terms & Privacy', sub: 'Legal information' },
              { icon: LogOut, label: 'Sign Out', sub: 'Coming in Sprint 2', disabled: true },
            ].map((item) => (
              <button
                key={item.label}
                disabled={item.disabled}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={item.label}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{item.label}</p>
                  <p className="text-xs text-secondary">{item.sub}</p>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </button>
            ))}
          </div>

          <p className="text-center text-2xs text-muted pb-2">IT Daily Upskilling v0.1.0 · Sprint 1</p>
        </div>
      </div>
    </div>
  );
}
