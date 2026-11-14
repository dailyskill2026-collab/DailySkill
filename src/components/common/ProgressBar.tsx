import React from 'react'

interface ProgressBarProps {
  percent: number
  colorClass?: string
  trackClass?: string
  height?: string
  animated?: boolean
  'aria-label'?: string
}

export default function ProgressBar({
  percent,
  colorClass = 'bg-brand-500',
  trackClass = 'bg-gray-100 dark:bg-gray-800',
  height = 'h-2',
  animated = true,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div
      className={`w-full ${height} ${trackClass} rounded-full overflow-hidden`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${clamped}% complete`}
    >
      <div
        className={`${height} ${colorClass} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
