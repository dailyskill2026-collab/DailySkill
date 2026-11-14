import React from 'react'
import { NavLink } from 'react-router-dom'

interface SelectableChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export default function SelectableChip({ label, selected, onClick }: SelectableChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
        selected ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-gray-800 text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  )
}
