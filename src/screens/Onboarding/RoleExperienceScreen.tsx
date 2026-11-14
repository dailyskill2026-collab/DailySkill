import React from 'react'
import { Check } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import OnboardingProgress from '@/components/common/OnboardingProgress'
import { useNavigate } from 'react-router-dom'

// Role options specific to Salesforce (MVP)
const ROLE_OPTIONS = [
  { key: 'salesforce_admin', label: 'Salesforce Administrator' },
  { key: 'salesforce_dev', label: 'Salesforce Developer' },
  { key: 'salesforce_lead', label: 'Salesforce Technical Lead' },
  { key: 'salesforce_arch', label: 'Salesforce Architect' },
  { key: 'salesforce_consult', label: 'Salesforce Consultant' },
  { key: 'salesforce_fresher', label: 'Salesforce Fresher / Job Seeker' },
]

const EXPERIENCE_OPTIONS = [
  { key: 'fresher', label: 'Fresher' },
  { key: '0-2', label: '0–2 years' },
  { key: '2-5', label: '2–5 years' },
  { key: '5-8', label: '5–8 years' },
  { key: '8+', label: '8+ years' },
]

function RoleCard({ roleKey, label, isSelected, onSelect }: { roleKey: string; label: string; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-colors ${isSelected ? 'bg-brand-100 dark:bg-brand-950 border-brand-500' : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 hover:border-brand-500'}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-primary">{label}</span>
        {isSelected && <Check size={18} className="text-brand-600" />}
      </div>
    </button>
  )
}

export default function RoleExperienceScreen() {
  const navigate = useNavigate()
  const { role, experience, setProfile } = useProfileStore(state => ({
    role: state.role,
    experience: state.experience,
    setProfile: state.setProfile,
  }))

  const selectRole = (key: string) => {
    setProfile({ role: key as any })
  }
  const selectExperience = (key: string) => {
    setProfile({ experience: key as any })
  }

  const next = () => navigate('/onboarding/goals')
  const back = () => navigate('/onboarding/technology')

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      <OnboardingProgress step={3} total={6} />
      <h2 className="text-lg font-semibold mb-4">Select your role</h2>
      <div className="space-y-2 mb-6">
        {ROLE_OPTIONS.map(opt => (
          <RoleCard
            key={opt.key}
            roleKey={opt.key}
            label={opt.label}
            isSelected={role === opt.key}
            onSelect={() => selectRole(opt.key)}
          />
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">How many years of experience?</h2>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {EXPERIENCE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => selectExperience(opt.key)}
            className={`p-2 rounded-xl border transition-colors ${experience === opt.key ? 'bg-brand-100 dark:bg-brand-950 border-brand-500' : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 hover:border-brand-500'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={back} className="text-sm text-brand-600 underline">Back</button>
        <button onClick={next} className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:opacity-90 transition">
          Next
        </button>
      </div>
    </div>
  )
}
