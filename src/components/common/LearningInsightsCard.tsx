// src/components/common/LearningInsightsCard.tsx
import React from 'react';
import { computeLearningInsights } from '@/services/learningInsightsService';
import { Target, Award, Flame, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function LearningInsightsCard() {
  const insights = computeLearningInsights();

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-brand-600 dark:text-brand-400" />
          <h2 className="text-sm font-semibold text-primary">Learning Insights</h2>
        </div>
        {insights.isDemoData && (
          <span className="sample-badge">Sample Metrics</span>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-secondary font-medium">Quiz Accuracy</span>
            <Target size={14} className="text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-primary">{insights.quizAccuracy}%</p>
          <p className="text-2xs text-muted">{insights.totalQuizAttempts} total questions</p>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-secondary font-medium">Current Streak</span>
            <Flame size={14} className="text-amber-500" />
          </div>
          <p className="text-xl font-bold text-primary">{insights.currentStreak} Days</p>
          <p className="text-2xs text-muted">Best: {insights.longestStreak} days</p>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary">
            Weekly Goal: {insights.weeklyGoal.completedDays}/{insights.weeklyGoal.targetDays} Days
          </span>
          <span className="text-2xs text-brand-600 dark:text-brand-400 font-bold">
            {insights.weeklyGoal.completionPercent}%
          </span>
        </div>
        <ProgressBar
          percent={insights.weeklyGoal.completionPercent}
          colorClass="bg-brand-600"
          height="h-2"
        />
        <p className="text-2xs text-secondary">
          {insights.weeklyGoal.isGoalMet
            ? '🎉 Great job! You reached your weekly learning goal.'
            : `${insights.weeklyGoal.remainingDays} more active day${insights.weeklyGoal.remainingDays === 1 ? '' : 's'} to meet your goal.`}
        </p>
      </div>

      {/* Strengths & Focus Areas */}
      <div className="space-y-2">
        {insights.strongTopics.length > 0 && (
          <div>
            <span className="text-2xs font-semibold text-secondary uppercase flex items-center gap-1 mb-1.5">
              <CheckCircle size={12} className="text-emerald-500" />
              Strong Topics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {insights.strongTopics.map((t) => (
                <span key={t} className="chip text-2xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {insights.weakTopics.length > 0 && (
          <div>
            <span className="text-2xs font-semibold text-secondary uppercase flex items-center gap-1 mb-1.5">
              <AlertTriangle size={12} className="text-amber-500" />
              Topics to Revise
            </span>
            <div className="flex flex-wrap gap-1.5">
              {insights.weakTopics.map((t) => (
                <span key={t} className="chip text-2xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
