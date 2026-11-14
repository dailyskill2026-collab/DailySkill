import React, { useState } from 'react'
import {
  Settings, Code2, Layout, GitMerge, Shield, Workflow, Bot, MessageSquare,
  Clock, ChevronRight, BookOpen, Layers,
} from 'lucide-react'
import { mockLearningPaths, mockUser } from '@/data'
import ProgressBar from '@/components/common/ProgressBar'
import Badge from '@/components/common/Badge'
import type { LearningPath } from '@/types'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Settings, Code2, Layout, GitMerge, Shield, Workflow, Bot, MessageSquare, BookOpen, Layers,
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  intermediate: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  advanced: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400',
}

function PathCard({ path }: { path: LearningPath }) {
  const percent = path.totalLessons > 0
    ? Math.round((path.completedLessons / path.totalLessons) * 100)
    : 0
  const IconComponent = ICON_MAP[path.icon] ?? BookOpen
  const hours = Math.floor(path.durationMinutes / 60)
  const mins = path.durationMinutes % 60
  const duration = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`

  return (
    <button
      className="w-full text-left card-hover p-4 flex gap-4 items-start"
      aria-label={`${path.title} — ${percent}% complete`}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center shadow-md`}>
        <IconComponent size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-sm font-bold text-primary leading-snug">{path.title}</p>
          <span className={`chip text-2xs flex-shrink-0 ${LEVEL_COLORS[path.level]}`}>
            {path.level}
          </span>
        </div>
        <p className="text-xs text-secondary mb-2 line-clamp-2">{path.description}</p>
        <div className="flex items-center gap-3 mb-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <BookOpen size={11} /> {path.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {duration}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar percent={percent} colorClass="bg-brand-500" height="h-1.5" />
          </div>
          <span className="text-2xs text-secondary whitespace-nowrap">{percent}%</span>
        </div>
      </div>
      <ChevronRight size={16} className="flex-shrink-0 text-gray-400 mt-1" />
    </button>
  )
}

export default function LearnScreen() {
  const inProgress = mockLearningPaths.filter((p) => p.completedLessons > 0 && p.completedLessons < p.totalLessons)
  const notStarted = mockLearningPaths.filter((p) => p.completedLessons === 0)

  const totalCompleted = mockLearningPaths.reduce((s, p) => s + p.completedLessons, 0)
  const totalLessons = mockLearningPaths.reduce((s, p) => s + p.totalLessons, 0)
  const overallPercent = Math.round((totalCompleted / totalLessons) * 100)

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Learn</h1>
            <p className="text-sm text-secondary">Structured Salesforce learning paths</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Salesforce</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Overall Progress */}
        <div className="card gradient-brand-soft p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-brand">
              <Layers size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-secondary mb-0.5">Overall Progress</p>
              <p className="text-lg font-bold text-primary mb-1">
                {totalCompleted} / {totalLessons} lessons
              </p>
              <ProgressBar percent={overallPercent} colorClass="bg-brand-500" height="h-2" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{overallPercent}%</p>
              <p className="text-2xs text-secondary">complete</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Paths', value: mockLearningPaths.length },
            { label: 'In Progress', value: inProgress.length },
            { label: 'Completed', value: mockUser.pathsCompleted },
          ].map((stat) => (
            <div key={stat.label} className="card p-3 text-center">
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-2xs text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* In-Progress Paths */}
        {inProgress.length > 0 && (
          <section aria-labelledby="inprogress-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="inprogress-heading" className="section-heading">Continue Where You Left Off</h2>
            </div>
            <div className="card divide-y divide-border-light dark:divide-border-dark">
              {inProgress.map((path) => <PathCard key={path.id} path={path} />)}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section aria-labelledby="all-paths-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="all-paths-heading" className="section-heading">All Learning Paths</h2>
            <Badge label="Sample" variant="sample" />
          </div>
          <div className="card divide-y divide-border-light dark:divide-border-dark">
            {notStarted.map((path) => <PathCard key={path.id} path={path} />)}
          </div>
        </section>

        <div className="h-2" />
      </div>
    </div>
  )
}
