import React, { useState } from 'react'
import { Brain, Target, Zap, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { mockRevisionTopics, mockQuizzes } from '@/data'
import { useUIStore } from '@/store/uiStore'
import ProgressBar from '@/components/common/ProgressBar'
import Badge from '@/components/common/Badge'

function StrengthBar({ percent }: { percent: number }) {
  const color =
    percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="strength-bar flex-1">
      <div className={`strength-bar-fill ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

function QuizModal({ onClose }: { onClose: () => void }) {
  const quiz = mockQuizzes[0]
  const [selected, setSelected] = useState<number | null>(null)
  const isAnswered = selected !== null
  const isCorrect = selected === quiz.correctIndex

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="gradient-brand px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-200 font-medium">Sample Quiz Preview</p>
              <h3 id="quiz-modal-title" className="text-lg font-bold text-white">{quiz.topicTitle}</h3>
            </div>
            <Badge label="Sample" variant="sample" />
          </div>
        </div>

        <div className="p-5">
          {/* Sample disclaimer */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 mb-4">
            <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This is a preview. Full quiz with scoring launches in the next sprint.
            </p>
          </div>

          {/* Question */}
          <p className="text-sm font-semibold text-primary mb-4 leading-relaxed">{quiz.question}</p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {quiz.options.map((option, i) => {
              let optionClass = 'border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-primary'
              if (isAnswered) {
                if (i === quiz.correctIndex) {
                  optionClass = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                } else if (i === selected) {
                  optionClass = 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }
              } else {
                optionClass += ' hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40'
              }
              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => setSelected(i)}
                  aria-label={`Option ${i + 1}: ${option}`}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-between gap-3 ${optionClass} disabled:cursor-default`}
                >
                  <span>{option}</span>
                  {isAnswered && i === quiz.correctIndex && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                  {isAnswered && i === selected && i !== quiz.correctIndex && <XCircle size={16} className="text-rose-500 flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className={`p-3 rounded-xl mb-4 text-xs leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
            }`}>
              <strong>{isCorrect ? '✓ Correct! ' : '✗ Not quite. '}</strong>
              {quiz.explanation}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm active:opacity-90 transition-opacity"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReviseScreen() {
  const { reviseModalOpen, openReviseModal, closeReviseModal } = useUIStore()
  const totalDue = mockRevisionTopics.reduce((s, t) => s + t.dueCount, 0)

  return (
    <div className="pb-safe">
      {reviseModalOpen && <QuizModal onClose={closeReviseModal} />}

      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-primary">Revise</h1>
        <p className="text-sm text-secondary">Strengthen your Salesforce knowledge</p>
      </div>

      <div className="px-4 space-y-5">
        {/* Overview cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Brain, label: 'Due Today', value: totalDue, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950' },
            { icon: Target, label: 'Score', value: `73%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
            { icon: Zap, label: 'Revised', value: 134, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
          ].map((stat) => (
            <div key={stat.label} className="card p-3 flex flex-col items-center text-center gap-1">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-2xs text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Quiz card */}
        <button
          onClick={() => openReviseModal('quick')}
          className="w-full card-hover overflow-hidden relative"
          aria-label="Start Quick Quiz"
        >
          <div className="gradient-brand p-5 flex items-center justify-between">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div>
              <p className="text-xs text-brand-200 font-medium mb-1">Sample Preview</p>
              <h3 className="text-lg font-bold text-white">Quick Quiz</h3>
              <p className="text-sm text-brand-200 mt-0.5">3 questions · ~2 min</p>
            </div>
            <div className="flex items-center gap-1 text-white">
              <span className="text-sm font-semibold">Start</span>
              <ChevronRight size={18} />
            </div>
          </div>
        </button>

        {/* Due Topics */}
        <section aria-labelledby="due-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="due-heading" className="section-heading">Topics Due for Revision</h2>
            <Badge label="Sample" variant="sample" />
          </div>
          <div className="space-y-3">
            {mockRevisionTopics.map((topic) => (
              <div key={topic.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`chip text-2xs ${topic.color}`}>{topic.tag}</span>
                      {topic.dueCount > 0 && (
                        <span className="text-2xs font-semibold text-rose-600 dark:text-rose-400">
                          {topic.dueCount} due
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-primary">{topic.title}</p>
                    <p className="text-xs text-muted mt-0.5">Last reviewed {topic.lastReviewedLabel}</p>
                  </div>
                  <button
                    onClick={() => openReviseModal(topic.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold active:opacity-80 transition-opacity"
                    aria-label={`Revise ${topic.title}`}
                  >
                    Revise
                  </button>
                </div>
                {/* Strength bar */}
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-secondary w-14">Strength</span>
                  <StrengthBar percent={topic.strengthPercent} />
                  <span className="text-2xs font-semibold text-secondary w-8 text-right">
                    {topic.strengthPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Strength Overview */}
        <section aria-labelledby="strength-heading" className="pb-2">
          <h2 id="strength-heading" className="section-heading mb-3">Skill Strength Overview</h2>
          <div className="card p-4 space-y-3">
            {mockRevisionTopics.map((topic) => (
              <div key={topic.id} className="flex items-center gap-3">
                <span className="text-xs text-secondary w-28 truncate">{topic.title}</span>
                <ProgressBar
                  percent={topic.strengthPercent}
                  colorClass={
                    topic.strengthPercent >= 70 ? 'bg-emerald-500' :
                    topic.strengthPercent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  }
                  height="h-2"
                />
                <span className="text-xs font-semibold text-secondary w-8 text-right">{topic.strengthPercent}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
