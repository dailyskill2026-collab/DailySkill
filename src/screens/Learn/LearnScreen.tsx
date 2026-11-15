import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Settings, Code2, Layout, GitMerge, Shield, Workflow, Bot, MessageSquare,
  Clock, ChevronRight, BookOpen, Layers, Zap, Check, ArrowRight, Play
} from 'lucide-react'
import ProgressBar from '@/components/common/ProgressBar'
import Badge from '@/components/common/Badge'
import type { LearningPath } from '@/types'
import { SkillAssessmentDashboard } from '@/components/assessment/SkillAssessmentDashboard'
import { learningPathService } from '@/services/learningPathService'
import { LEARNING_PATH_CURRICULUM, SyllabusLesson } from '@/data/learningPathCurriculum'
import { InteractiveLessonModal } from '@/components/learning/InteractiveLessonModal'

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
      className="w-full text-left card-hover p-4 flex gap-4 items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
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
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'assessments' ? 'assessments' : 'paths'
  const [activeTab, setActiveTab] = useState<'paths' | 'assessments'>(initialTab)
  
  // Real dynamic learning path state
  const [paths, setPaths] = useState<LearningPath[]>(() => learningPathService.getPaths())
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<SyllabusLesson | null>(null)

  const reloadProgress = () => {
    const updated = learningPathService.getPaths()
    setPaths(updated)
    if (selectedPath) {
      const match = updated.find(p => p.id === selectedPath.id)
      if (match) setSelectedPath(match)
    }
  }

  useEffect(() => {
    reloadProgress()
  }, [])

  const inProgress = paths.filter((p) => p.completedLessons > 0 && p.completedLessons < p.totalLessons)
  const notStarted = paths.filter((p) => p.completedLessons === 0)
  const completedPaths = paths.filter((p) => p.completedLessons >= p.totalLessons && p.totalLessons > 0)

  const totalCompleted = paths.reduce((s, p) => s + p.completedLessons, 0)
  const totalLessons = paths.reduce((s, p) => s + p.totalLessons, 0)
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

  const currentCurriculum = selectedPath ? LEARNING_PATH_CURRICULUM[selectedPath.id] : null

  const handleOpenFirstUncompleted = () => {
    if (!selectedPath || !currentCurriculum) return
    const uncompleted = currentCurriculum.lessons.find(
      l => !learningPathService.isLessonCompleted(selectedPath.id, l.id)
    )
    if (uncompleted) {
      setSelectedLesson(uncompleted)
    } else if (currentCurriculum.lessons.length > 0) {
      setSelectedLesson(currentCurriculum.lessons[0])
    }
  }

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
                { label: 'Paths', value: paths.length },
                { label: 'In Progress', value: inProgress.length },
                { label: 'Completed', value: completedPaths.length },
              ].map((stat) => (
                <div key={stat.label} className="card p-3 text-center">
                  <p className="text-xl font-bold text-primary">{stat.value}</p>
                  <p className="text-2xs text-secondary">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* In-Progress Paths */}
            {inProgress.length > 0 ? (
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
            ) : (
              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-primary">Start Your First Learning Path</h4>
                  <p className="text-2xs text-secondary mt-0.5">
                    Select any syllabus below to complete 5-minute interactive scenario lessons.
                  </p>
                </div>
              </div>
            )}

            {/* All Categories */}
            <section aria-labelledby="all-paths-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="all-paths-heading" className="section-heading">All Learning Paths</h2>
                <Badge label="Interactive Syllabus" variant="verified" />
              </div>
              <div className="card divide-y divide-border-light dark:divide-border-dark">
                {paths.map((path) => (
                  <PathCard key={path.id} path={path} onSelect={(p) => setSelectedPath(p)} />
                ))}
              </div>
            </section>
          </>
        )}

        <div className="h-2" />
      </div>

      {/* Interactive Learning Path Syllabus Modal */}
      {selectedPath && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-surface-dark p-5 sm:p-6 rounded-2xl max-w-lg w-full shadow-2xl border border-border-light dark:border-border-dark space-y-4 max-h-[92vh] overflow-y-auto my-auto animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                  {selectedPath.level} Track
                </span>
                <h3 className="text-lg font-bold text-primary mt-1">{selectedPath.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPath(null)}
                className="text-gray-400 hover:text-primary text-sm p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">{selectedPath.description}</p>

            {/* Progress Bar inside Syllabus */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">Path Progress</span>
                <span className="text-brand-600 font-bold">
                  {selectedPath.completedLessons} of {selectedPath.totalLessons} Lessons (
                  {Math.round((selectedPath.completedLessons / selectedPath.totalLessons) * 100)}%)
                </span>
              </div>
              <ProgressBar
                percent={Math.round((selectedPath.completedLessons / selectedPath.totalLessons) * 100)}
                height="h-2"
                colorClass="bg-brand-600"
              />
            </div>

            {/* Curriculum Lessons List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Curriculum Syllabus ({currentCurriculum ? currentCurriculum.lessons.length : 5} Modules)
                </h4>
                <span className="text-2xs text-muted">Click any module to learn</span>
              </div>

              <div className="divide-y divide-border-light dark:divide-border-dark text-xs max-h-64 overflow-y-auto border border-border-light dark:border-border-dark rounded-xl">
                {currentCurriculum && currentCurriculum.lessons.length > 0 ? (
                  currentCurriculum.lessons.map((lesson) => {
                    const isDone = learningPathService.isLessonCompleted(selectedPath.id, lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className="w-full text-left p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="font-semibold text-primary group-hover:text-brand-600 transition-colors line-clamp-1">
                            Module {lesson.moduleIndex}: {lesson.title}
                          </p>
                          <p className="text-2xs text-muted mt-0.5 flex items-center gap-1.5">
                            <Clock size={11} /> {lesson.duration} • Scenario MCQ
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 group-hover:bg-brand-600 group-hover:text-white transition'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <Check size={12} /> Completed
                            </>
                          ) : (
                            <>
                              Start <ArrowRight size={12} />
                            </>
                          )}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-secondary text-xs">
                    Curriculum is being prepared for this path.
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => setSelectedPath(null)}
                className="text-xs text-secondary hover:text-primary transition underline"
              >
                Close
              </button>
              
              {currentCurriculum && currentCurriculum.lessons.length > 0 && (
                <button
                  onClick={handleOpenFirstUncompleted}
                  className="py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 text-xs"
                >
                  <Play size={13} /> Continue Learning
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lesson Modal (When a module is clicked) */}
      {selectedLesson && selectedPath && currentCurriculum && (
        <InteractiveLessonModal
          pathId={selectedPath.id}
          pathTitle={selectedPath.title}
          lesson={selectedLesson}
          allLessons={currentCurriculum.lessons}
          onClose={() => setSelectedLesson(null)}
          onLessonCompleted={() => {
            reloadProgress()
          }}
          onSelectLesson={(nextLesson) => {
            setSelectedLesson(nextLesson)
          }}
        />
      )}
    </div>
  )
}
