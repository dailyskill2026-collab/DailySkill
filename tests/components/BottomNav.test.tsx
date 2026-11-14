import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import BottomNav from '@/components/common/BottomNav'

function renderWithRouter(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders all 5 navigation tabs', () => {
    renderWithRouter(<BottomNav />)
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Today')).toBeInTheDocument()
    expect(screen.getByLabelText('Explore')).toBeInTheDocument()
    expect(screen.getByLabelText('Learn')).toBeInTheDocument()
    expect(screen.getByLabelText('Revise')).toBeInTheDocument()
    expect(screen.getByLabelText('Me')).toBeInTheDocument()
  })

  it('marks the active tab with aria-current="page"', () => {
    renderWithRouter(<BottomNav />, { initialEntries: ['/explore'] })
    const exploreLink = screen.getByLabelText('Explore')
    expect(exploreLink).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark inactive tabs with aria-current', () => {
    renderWithRouter(<BottomNav />, { initialEntries: ['/'] })
    const exploreLink = screen.getByLabelText('Explore')
    expect(exploreLink).not.toHaveAttribute('aria-current', 'page')
  })
})
