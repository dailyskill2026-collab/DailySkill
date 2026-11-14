import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ProgressBar from '@/components/common/ProgressBar'

interface OnboardingProgressProps {
  step: number // 1‑based step index
  total: number
}

export default function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  const percent = Math.round((step / total) * 100)
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium">Step {step} of {total}</span>
      <ProgressBar percent={percent} className="flex-1" />
    </div>
  )
}
