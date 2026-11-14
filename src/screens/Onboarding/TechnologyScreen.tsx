import React from 'react'
import { Check } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import OnboardingProgress from '@/components/common/OnboardingProgress'
import { useNavigate } from 'react-router-dom'

// Simple card component for technology selection
interface TechnologyCardProps {
  tech: string
  label: string
  isSelected: boolean
  disabled?: boolean
  onSelect: () => void
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ tech, label, isSelected, disabled, onSelect }) => (
  <button
    onClick={onSelect}
    disabled={disabled}
    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-500'
    } ${isSelected ? 'bg-brand-100 dark:bg-brand-950 border-brand-500' : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700'}`}
  >
    <span className="text-base font-medium text-primary">{label}</span>
    {disabled && (
      <span className="text-xs text-muted bg-amber-100 dark:bg-amber-900 rounded px-2 py-0.5 ml-2">Coming Soon</span>
    )}
    {isSelected && <Check size={20} className="text-brand-600" />}
  </button>
)

export default function TechnologyScreen() {
  const navigate = useNavigate()
  const { technology, setProfile } = useProfileStore(state => ({
    technology: state.technology,
    setProfile: state.setProfile,
  }))

  const handleSelect = (tech: string) => {
    setProfile({ technology: tech as any })
  }

  const next = () => navigate('/onboarding/role')
  const back = () => navigate('/') // could go back to welcome if needed

  const techOptions = [
    { key: 'salesforce', label: 'Salesforce', disabled: false },
    { key: 'java', label: 'Java', disabled: true },
    { key: 'python', label: 'Python', disabled: true },
    { key: 'javascript', label: 'JavaScript', disabled: true },
    { key: 'aws', label: 'AWS', disabled: true },
    { key: 'azure', label: 'Azure', disabled: true },
    { key: 'devops', label: 'DevOps', disabled: true },
    { key: 'qa', label: 'QA / Automation', disabled: true },
    { key: 'ml', label: 'AI / ML', disabled: true },
    { key: 'other', label: 'Other', disabled: true },
  ]

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      <OnboardingProgress step={2} total={6} />
      <h2 className="text-lg font-semibold mb-4">Select your primary technology</h2>
      <div className="space-y-2">
        {techOptions.map(opt => (
          <TechnologyCard
            key={opt.key}
            tech={opt.key}
            label={opt.label}
            disabled={opt.disabled}
            isSelected={technology === opt.key && !opt.disabled}
            onSelect={() => handleSelect(opt.key)}
          />
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={back} className="text-sm text-brand-600 underline">Back</button>
        <button onClick={next} className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:opacity-90 transition">
          Next
        </button>
      </div>
    </div>
  )
}
