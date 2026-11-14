import React from 'react'
import OnboardingProgress from '@/components/common/OnboardingProgress'
import SelectableChip from '@/components/common/SelectableChip'
import { useProfileStore } from '@/store/profileStore'
import { useNavigate } from 'react-router-dom'

const GOAL_OPTIONS = [
  { key: 'stay_updated', label: 'Stay Updated with Technology' },
  { key: 'improve_skills', label: 'Improve Technical Skills' },
  { key: 'real_projects', label: 'Learn Real‑Time Project Scenarios' },
  { key: 'prepare_interview', label: 'Prepare for Interviews' },
  { key: 'prepare_cert', label: 'Prepare for Certifications' },
  { key: 'grow_role', label: 'Grow into a Senior Developer / Architect Role' },
]

export default function GoalsScreen() {
  const navigate = useNavigate()
  const { goals, setProfile } = useProfileStore(state => ({
    goals: state.goals,
    setProfile: state.setProfile,
  }))

  const toggleGoal = (key: string) => {
    const exists = goals.includes(key as any)
    const newGoals = exists ? goals.filter(g => g !== key) : [...goals, key as any]
    setProfile({ goals: newGoals })
  }

  const next = () => navigate('/onboarding/interests')
  const back = () => navigate('/onboarding/role')

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      <OnboardingProgress step={4} total={6} />
      <h2 className="text-lg font-semibold mb-4">What do you want to achieve?</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {GOAL_OPTIONS.map(opt => (
          <SelectableChip
            key={opt.key}
            label={opt.label}
            selected={goals.includes(opt.key as any)}
            onClick={() => toggleGoal(opt.key)}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={back} className="text-sm text-brand-600 underline">Back</button>
        <button onClick={next} className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:opacity-90 transition">Next</button>
      </div>
    </div>
  )
}
