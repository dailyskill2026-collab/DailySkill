import React from 'react'
import { Home, Compass, BookOpen, Brain, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Today', Icon: Home },
  { path: '/explore', label: 'Explore', Icon: Compass },
  { path: '/learn', label: 'Learn', Icon: BookOpen },
  { path: '/revise', label: 'Revise', Icon: Brain },
  { path: '/me', label: 'Me', Icon: User },
]

export default function TopNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-30 hidden md:flex items-center justify-between bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-2"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l9 21H3L12 2z"/></svg>
        </div>
        <span className="text-sm font-bold text-primary">IT Daily</span>
      </div>
      {/* Nav links */}
      <div className="flex gap-4">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const isActive =
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <NavLink
              key={path}
              to={path}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors duration-200 ${
                isActive
                  ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'} aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
