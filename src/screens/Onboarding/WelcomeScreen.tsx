import React from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingProgress from '@/components/common/OnboardingProgress'
import { useProfileStore } from '@/store/profileStore'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const setProfile = useProfileStore(state => state.setProfile)

  const handleStart = () => {
    navigate('/onboarding/technology')
  }

  const handleSkip = () => {
    // Set guest profile and mark onboarding as completed
    setProfile({ onboardingCompleted: true, isGuest: true })
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col items-center text-center">
      <OnboardingProgress step={1} total={6} />
      <h1 className="text-2xl font-bold mb-2">Welcome to IT Daily Upskilling</h1>
      <p className="text-sm text-secondary mb-6">
        Stay updated. Build your skills. Grow your IT career — just 5 minutes a day.
      </p>
      {/* Placeholder illustration */}
      <div className="w-48 h-48 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full mb-6" />
      <button
        onClick={handleStart}
        className="w-full px-4 py-2 bg-brand-600 text-white rounded-xl mb-3 hover:opacity-90 transition"
      >
        Get Started
      </button>
      <button
        onClick={handleSkip}
        className="text-sm text-brand-600 underline"
      >
        Skip for now
      </button>
    </div>
  )
}
