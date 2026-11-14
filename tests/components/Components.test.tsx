import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import ProgressBar from '@/components/common/ProgressBar'

describe('ProgressBar', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar percent={50} aria-label="Test progress" />)
    const bar = screen.getByRole('progressbar', { name: /test progress/i })
    expect(bar).toHaveAttribute('aria-valuenow', '50')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps values above 100 to 100', () => {
    render(<ProgressBar percent={150} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '100')
  })

  it('clamps negative values to 0', () => {
    render(<ProgressBar percent={-20} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '0')
  })

  it('applies default label when none is provided', () => {
    render(<ProgressBar percent={30} />)
    const bar = screen.getByRole('progressbar', { name: /30% complete/i })
    expect(bar).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders sample badge with correct text', async () => {
    const { default: Badge } = await import('@/components/common/Badge')
    render(<Badge label="Sample" variant="sample" />)
    expect(screen.getByText('Sample')).toBeInTheDocument()
  })
})
