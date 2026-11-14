import React from 'react'
import { Home, Compass, BookOpen, Brain, User, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { Moon, Sun } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/',        label: 'Today',   Icon: Home,     description: 'Daily 5-minute learning' },
  { path: '/explore', label: 'Explore', Icon: Compass,  description: 'Technology updates feed' },
  { path: '/learn',   label: 'Learn',   Icon: BookOpen, description: 'Structured learning paths' },
  { path: '/revise',  label: 'Revise',  Icon: Brain,    description: 'MCQ & spaced revision' },
  { path: '/me',      label: 'Me',      Icon: User,     description: 'Profile & preferences' },
]

export default function SidebarNav() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-white dark:bg-surface-dark border-r border-border-light dark:border-border-dark"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary leading-none">IT Daily</p>
            <p className="text-2xs text-secondary mt-0.5">Upskilling</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, Icon, description }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            aria-label={`${label} — ${description}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  className={`transition-colors duration-200 flex-shrink-0 ${
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-none ${isActive ? 'text-brand-700 dark:text-brand-300' : ''}`}>
                    {label}
                  </p>
                  <p className="text-2xs text-muted mt-0.5 leading-none truncate">{description}</p>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: theme + version */}
      <div className="px-4 py-4 border-t border-border-light dark:border-border-dark space-y-3">
        <button
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark
            ? <Moon size={18} className="text-brand-400" />
            : <Sun size={18} className="text-amber-500" />}
          <span className="text-sm text-secondary">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          <div className={`ml-auto relative w-9 h-5 rounded-full transition-colors duration-300 ${isDark ? 'bg-brand-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
        <p className="text-center text-2xs text-muted">IT Daily v0.1.0 · Sprint 1</p>
      </div>
    </aside>
  )
}
