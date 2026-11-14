import React from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from '@/components/common/TopNav'
import BottomNav from '@/components/common/BottomNav'

/** Wrapper for all onboarding screens – provides consistent centering and navigation bars */
export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Top navigation (visible on md+ screens) */}
      <TopNav className="hidden md:flex" />
      <main className="flex justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      {/* Bottom navigation – hidden on md+ */}
      <BottomNav className="md:hidden" />
    </div>
  )
}
