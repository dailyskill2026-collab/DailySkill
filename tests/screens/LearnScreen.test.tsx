import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LearnScreen from '@/screens/Learn/LearnScreen';
import { learningPathService } from '@/services/learningPathService';

describe('LearnScreen Dynamic Progress & Interactive Syllabus Tests', () => {
  beforeEach(() => {
    learningPathService.resetProgress();
  });

  it('starts fresh user with 0% and 0 completed lessons (no fake hardcoded numbers)', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <LearnScreen />
      </MemoryRouter>
    );

    // Verifies 0 / 189 lessons and 0% complete
    expect(screen.getByText(/0 \/ 189 lessons/i)).toBeDefined();
    expect(screen.getAllByText(/0%/i).length).toBeGreaterThan(0);

    // Verifies 0 in progress and 0 completed
    expect(screen.getByText('Start Your First Learning Path')).toBeDefined();
  });

  it('opens interactive syllabus modal when clicking on a learning path', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <LearnScreen />
      </MemoryRouter>
    );

    // Click on "Salesforce Administration" path card
    const adminPath = screen.getByRole('button', { name: /Salesforce Administration/i });
    fireEvent.click(adminPath);

    // Verifies syllabus modal is open with real modules
    expect(screen.getByText(/Beginner Track/i)).toBeDefined();
    expect(screen.getByText(/Curriculum Syllabus/i)).toBeDefined();
    expect(screen.getByText(/Module 1: User Management, Profiles & Permission Sets Architecture/i)).toBeDefined();
  });

  it('opens interactive lesson modal, completes MCQ, and dynamically updates progress', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <LearnScreen />
      </MemoryRouter>
    );

    // 1. Open Salesforce Administration syllabus
    const adminPath = screen.getByRole('button', { name: /Salesforce Administration/i });
    fireEvent.click(adminPath);

    // 2. Click on Module 1
    const module1Btn = screen.getByText(/Module 1: User Management, Profiles & Permission Sets Architecture/i);
    fireEvent.click(module1Btn);

    // 3. Verify lesson modal opened
    expect(screen.getByText(/Key Architectural Rules/i)).toBeDefined();
    expect(screen.getByText(/Scenario Knowledge Check/i)).toBeDefined();

    // 4. Select correct option B
    const optionB = screen.getByText(/Assign a custom Permission Set with an expiration date set to 7 days/i);
    fireEvent.click(optionB);
    expect(screen.getByText(/Correct!/i)).toBeDefined();

    // 5. Click "Mark Completed"
    const markCompleteBtn = screen.getByRole('button', { name: /Mark Completed/i });
    fireEvent.click(markCompleteBtn);

    // Verify progress updated in service
    expect(learningPathService.getOverallProgress().totalCompleted).toBe(1);

    // Close lesson modal
    const closeButtons = screen.getAllByRole('button');
    const lessonCloseBtn = closeButtons.find(b => b.querySelector('svg.lucide-x'));
    if (lessonCloseBtn) fireEvent.click(lessonCloseBtn);

    // Close syllabus modal
    const closeSyllabus = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeSyllabus);

    // Progress on main screen should now show 1 / 189 lessons and In Progress
    expect(screen.getByText(/1 \/ 189 lessons/i)).toBeDefined();
    expect(screen.getByText(/Continue Where You Left Off/i)).toBeDefined();
  });
});
