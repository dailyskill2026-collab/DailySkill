import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, Award, BookOpen, CheckCircle2 } from 'lucide-react'
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
      
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Personalized Career Growth</span>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white tracking-tight">
        Welcome to IT Daily Upskilling
      </h1>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Stay updated. Build your skills. Grow your IT career — just 5 minutes a day.
      </p>

      {/* Branded Upskilling Hero Card */}
      <div className="w-full bg-gradient-to-b from-brand-50/70 to-white dark:from-surface-dark dark:to-bg-dark border border-brand-100 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-5">
          <BookOpen className="w-10 h-10" />
        </div>
        
        <div className="w-full space-y-2.5 text-left">
          <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium">Bite-sized daily lessons in 5 mins</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <Award className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="font-medium">Real-world scenario MCQs & practice</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">Track your streak, recall & mastery</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-semibold rounded-xl mb-3 shadow-md shadow-brand-600/20 transition-all text-sm"
      >
        Get Started
      </button>
      
      <button
        onClick={handleSkip}
        className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition underline"
      >
        Skip for now
      </button>
    </div>
  )
}
