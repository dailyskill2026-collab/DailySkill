import React from 'react'
import { Home, Compass, BookOpen, Brain, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',        label: 'Today',   Icon: Home    },
  { path: '/explore', label: 'Explore', Icon: Compass },
  { path: '/learn',   label: 'Learn',   Icon: BookOpen },
  { path: '/revise',  label: 'Revise',  Icon: Brain   },
  { path: '/me',      label: 'Me',      Icon: User    },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Main navigation"
      className={`
        fixed bottom-0 left-0 right-0 z-30
        bottom-nav-height
        bg-white dark:bg-surface-dark
        border-t border-border-light dark:border-border-dark
        flex items-start justify-around
        pt-2
        max-w-md mx-auto
        shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
        dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
      `}
    >
      {NAV_ITEMS.map(({ path, label, Icon }) => {
        const isActive =
          path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)
        return (
          <NavLink
            key={path}
            to={path}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center gap-0.5 min-w-[3.5rem] px-2 py-0.5 group"
          >
            <div
              className={`
                relative w-10 h-7 rounded-2xl flex items-center justify-center
                transition-all duration-200
                ${isActive
                  ? 'bg-brand-100 dark:bg-brand-950'
                  : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                }
              `}
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </div>
            <span
              className={`text-2xs font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
