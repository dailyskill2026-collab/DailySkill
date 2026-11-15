import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useProfileStore, defaultProfile } from '@/store/profileStore'
import WelcomeScreen from '@/screens/Onboarding/WelcomeScreen'
import TechnologyScreen from '@/screens/Onboarding/TechnologyScreen'
import RoleExperienceScreen from '@/screens/Onboarding/RoleExperienceScreen'
import GoalsScreen from '@/screens/Onboarding/GoalsScreen'
import InterestsScreen from '@/screens/Onboarding/InterestsScreen'
import PreferenceScreen from '@/screens/Onboarding/PreferenceScreen'
import SummaryScreen from '@/screens/Onboarding/SummaryScreen'

describe('Onboarding Flow Full Integration Tests', () => {
  beforeEach(() => {
    useProfileStore.setState({ ...defaultProfile })
  })

  it('renders WelcomeScreen with rich hero illustration and proper progress bar', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<WelcomeScreen />} />
          <Route path="/onboarding/technology" element={<TechnologyScreen />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Step 1 of 6/i)).toBeDefined()
    expect(screen.getByText(/17%/i)).toBeDefined()
    expect(screen.getByText(/Welcome to IT Daily Upskilling/i)).toBeDefined()
    expect(screen.getByText(/Bite-sized daily lessons in 5 mins/i)).toBeDefined()

    // Clicking "Get Started" navigates cleanly without crashing
    const getStartedBtn = screen.getByRole('button', { name: /Get Started/i })
    fireEvent.click(getStartedBtn)
    expect(screen.getByText(/Select your primary technology/i)).toBeDefined()
    expect(screen.getByText(/Step 2 of 6/i)).toBeDefined()
  })

  it('navigates through complete 6-step flow to summary and finishes cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/technology']}>
        <Routes>
          <Route path="/onboarding/technology" element={<TechnologyScreen />} />
          <Route path="/onboarding/role" element={<RoleExperienceScreen />} />
          <Route path="/onboarding/goals" element={<GoalsScreen />} />
          <Route path="/onboarding/interests" element={<InterestsScreen />} />
          <Route path="/onboarding/preference" element={<PreferenceScreen />} />
          <Route path="/onboarding/summary" element={<SummaryScreen />} />
          <Route path="/" element={<div data-testid="home-screen">Home Screen</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Step 2: Technology
    expect(screen.getByText(/Select your primary technology/i)).toBeDefined()
    const nextBtn1 = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn1)

    // Step 3: Role & Experience
    expect(screen.getByText(/Select your role/i)).toBeDefined()
    const devRole = screen.getByText(/Salesforce Developer/i)
    fireEvent.click(devRole)
    const nextBtn2 = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn2)

    // Step 4: Goals
    expect(screen.getByText(/What do you want to achieve/i)).toBeDefined()
    const nextBtn3 = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn3)

    // Step 5: Interests
    expect(screen.getByText(/Select Your Learning Interests/i)).toBeDefined()
    const nextBtn4 = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn4)

    // Step 6: Preferences
    expect(screen.getByText(/Daily Learning Preference/i)).toBeDefined()
    const nextBtn5 = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn5)

    // Step 7: Summary & Finish
    expect(screen.getByText(/Review Your Profile/i)).toBeDefined()
    const finishBtn = screen.getByRole('button', { name: /Finish & Start Learning/i })
    fireEvent.click(finishBtn)

    expect(screen.getByTestId('home-screen')).toBeDefined()
    expect(useProfileStore.getState().onboardingCompleted).toBe(true)
  })

  it('allows user to skip onboarding from WelcomeScreen', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<WelcomeScreen />} />
          <Route path="/" element={<div data-testid="home-screen">Home Screen</div>} />
        </Routes>
      </MemoryRouter>
    )

    const skipBtn = screen.getByRole('button', { name: /Skip for now/i })
    fireEvent.click(skipBtn)

    expect(screen.getByTestId('home-screen')).toBeDefined()
    expect(useProfileStore.getState().isGuest).toBe(true)
    expect(useProfileStore.getState().onboardingCompleted).toBe(true)
  })
})
