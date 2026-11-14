import React from 'react'

type Variant = 'default' | 'sample' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  label: string
  variant?: Variant
  size?: 'xs' | 'sm'
}

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-gray-100 dark:bg-gray-800 text-secondary',
  sample:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
  error:   'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
  info:    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
}

export default function Badge({ label, variant = 'default', size = 'xs' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${VARIANT_CLASSES[variant]} ${
        size === 'xs' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {label}
    </span>
  )
}
