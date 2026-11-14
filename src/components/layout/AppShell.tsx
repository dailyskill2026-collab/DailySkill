import React from 'react'
import TopNav from '@/components/common/TopNav'
import BottomNav from '@/components/common/BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Top navigation – visible on md+ screens */}
      <TopNav className="hidden md:flex" />

      {/* Centered content wrapper to emulate mobile layout on larger screens */}
      <main id="main-content" className="flex justify-center px-4 py-4">
        <div className="w-full max-w-md">
          {/* Screen content */}
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>

      {/* Bottom navigation – only on mobile */}
      <BottomNav className="md:hidden" />
    </div>
  )
}
