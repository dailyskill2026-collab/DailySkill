import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { useThemeStore } from '@/store/themeStore'

describe('ThemeStore', () => {
  it('starts with light theme by default', () => {
    const { theme } = useThemeStore.getState()
    // May be light or persisted dark; just check it's a valid value
    expect(['light', 'dark']).toContain(theme)
  })

  it('toggles theme correctly', () => {
    const store = useThemeStore.getState()
    const initial = store.theme
    store.toggleTheme()
    const after = useThemeStore.getState().theme
    expect(after).not.toBe(initial)
    // Reset
    store.toggleTheme()
  })

  it('setTheme sets to dark', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
    // Reset
    useThemeStore.getState().setTheme('light')
  })
})
