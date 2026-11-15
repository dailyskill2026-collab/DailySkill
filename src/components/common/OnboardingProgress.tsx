import React from 'react'
import ProgressBar from '@/components/common/ProgressBar'

interface OnboardingProgressProps {
  step: number // 1‑based step index
  total?: number
  totalSteps?: number
  className?: string
}

export default function OnboardingProgress({ step, total, totalSteps, className = '' }: OnboardingProgressProps) {
  const max = total ?? totalSteps ?? 6
  const current = Math.max(1, Math.min(step, max))
  const percent = Math.round((current / max) * 100)

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
        <span className="tracking-wide">Step {current} of {max}</span>
        <span className="text-brand-600 font-bold">{percent}%</span>
      </div>
      <ProgressBar percent={percent} height="h-2" colorClass="bg-brand-600" />
    </div>
  )
}
