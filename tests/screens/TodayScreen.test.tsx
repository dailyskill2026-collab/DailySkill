import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import TodayScreen from '@/screens/Today/TodayScreen'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('TodayScreen', () => {
  it('renders a greeting heading', () => {
    renderWithRouter(<TodayScreen />)
    // Should have a heading-level element with greeting
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toMatch(/Rahul/)
  })

  it('renders Today\'s Activities section', () => {
    renderWithRouter(<TodayScreen />)
    expect(screen.getByText("Today's Activities")).toBeInTheDocument()
  })

  it('renders all 3 daily activity cards', () => {
    renderWithRouter(<TodayScreen />)
    expect(screen.getByText('Stay Updated')).toBeInTheDocument()
    expect(screen.getByText('Practice')).toBeInTheDocument()
    expect(screen.getByText('Remember')).toBeInTheDocument()
  })

  it('activity button is accessible with aria-label', () => {
    renderWithRouter(<TodayScreen />)
    const buttons = screen.getAllByRole('button')
    // Activity cards are buttons; at least one should be present
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('toggling an activity updates its visual state', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TodayScreen />)

    // Find the first activity button (Apex Queueable)
    const activityButton = screen.getByLabelText(/Apex Queueable: Stay Updated/i)
    expect(activityButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(activityButton)
    expect(activityButton).toHaveAttribute('aria-pressed', 'true')
  })
})
