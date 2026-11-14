import React, { useState } from 'react'
import {
  Settings, Code2, Layout, GitMerge, Shield, Workflow, Bot, MessageSquare,
  Clock, ChevronRight, BookOpen, Layers, Zap
} from 'lucide-react'
import { mockLearningPaths, mockUser } from '@/data'
import ProgressBar from '@/components/common/ProgressBar'
import Badge from '@/components/common/Badge'
import type { LearningPath } from '@/types'
import { SkillAssessmentDashboard } from '@/components/assessment/SkillAssessmentDashboard'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Settings, Code2, Layout, GitMerge, Shield, Workflow, Bot, MessageSquare, BookOpen, Layers,
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  intermediate: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  advanced: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400',
}

function PathCard({ path, onSelect }: { path: LearningPath; onSelect: (path: LearningPath) => void }) {
  const percent = path.totalLessons > 0
    ? Math.round((path.completedLessons / path.totalLessons) * 100)
    : 0
  const IconComponent = ICON_MAP[path.icon] ?? BookOpen
  const hours = Math.floor(path.durationMinutes / 60)
  const mins = path.durationMinutes % 60
  const duration = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`

  return (
    <button
      onClick={() => onSelect(path)}
      className="w-full text-left card-hover p-4 flex gap-4 items-start cursor-pointer"
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
  const [activeTab, setActiveTab] = useState<'paths' | 'assessments'>('paths')
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)

  const inProgress = mockLearningPaths.filter((p) => p.completedLessons > 0 && p.completedLessons < p.totalLessons)
  const notStarted = mockLearningPaths.filter((p) => p.completedLessons === 0)

  const totalCompleted = mockLearningPaths.reduce((s, p) => s + p.completedLessons, 0)
  const totalLessons = mockLearningPaths.reduce((s, p) => s + p.totalLessons, 0)
  const overallPercent = Math.round((totalCompleted / totalLessons) * 100)

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">Learn</h1>
            <p className="text-sm text-secondary">Structured learning & diagnostic assessments</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Salesforce</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setActiveTab('paths')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'paths'
                ? 'bg-white dark:bg-surface-dark text-primary shadow-xs'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <BookOpen size={15} />
            Learning Paths
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'assessments'
                ? 'bg-white dark:bg-surface-dark text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Zap size={15} className="text-amber-500" />
            Skill Diagnostics & Challenges
          </button>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {activeTab === 'assessments' ? (
          <SkillAssessmentDashboard />
        ) : (
          <>
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
                  {inProgress.map((path) => (
                    <PathCard key={path.id} path={path} onSelect={(p) => setSelectedPath(p)} />
                  ))}
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
                {notStarted.map((path) => (
                  <PathCard key={path.id} path={path} onSelect={(p) => setSelectedPath(p)} />
                ))}
              </div>
            </section>
          </>
        )}

        <div className="h-2" />
      </div>

      {/* Learning Path Curriculum & Syllabus Modal (Sprint 14) */}
      {selectedPath && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl max-w-lg w-full shadow-2xl border border-border-light dark:border-border-dark space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                  {selectedPath.level} Track
                </span>
                <h3 className="text-lg font-bold text-primary mt-1">{selectedPath.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPath(null)}
                className="text-muted hover:text-primary text-sm p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">{selectedPath.description}</p>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1.5 text-xs">
              <p className="font-semibold text-primary">Prerequisites & Scope:</p>
              <p className="text-secondary">
                Designed for {selectedPath.level} learners. Lessons follow a progressive 3–5 min sequence from foundational syntax to enterprise scenario practice.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Curriculum Syllabus ({selectedPath.totalLessons} Lessons)
              </h4>
              <div className="divide-y divide-border-light dark:divide-border-dark text-xs max-h-56 overflow-y-auto">
                {[
                  { title: 'Core Architectural Concepts & Baseline Rules', status: 'Ready to Learn', ready: true },
                  { title: 'Scenario-Based Micro-Practice & Hands-on MCQs', status: 'Ready to Learn', ready: true },
                  { title: 'Governor Limits, Best Practices & Bulkification', status: 'Ready to Learn', ready: true },
                  { title: 'Integration Boundaries & Error Handling', status: 'In Content Development', ready: false },
                  { title: 'Advanced Production Patterns & Optimization', status: 'Scheduled in Release Drop', ready: false },
                ].map((mod, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">Module {idx + 1}: {mod.title}</p>
                      <p className="text-2xs text-muted">Estimated 3–5 minutes</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        mod.ready
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-2xs text-muted">
                {selectedPath.completedLessons} of {selectedPath.totalLessons} completed
              </span>
              <button
                onClick={() => setSelectedPath(null)}
                className="btn-primary text-xs py-2 px-4"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
