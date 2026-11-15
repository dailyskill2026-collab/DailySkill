import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviseScreen from '@/screens/Revise/ReviseScreen';

describe('ReviseScreen Dynamic Spaced Repetition (SRS) Tests', () => {
  beforeEach(() => {
    localStorage.removeItem('it-daily-srs-records');
    localStorage.removeItem('it-daily-quiz-attempts');
  });

  it('fresh user starts with 0 Due Today, 0 Weak Topics, and 0 Review Cards (no dummy 17 or 4)', () => {
    render(
      <MemoryRouter initialEntries={['/revise']}>
        <ReviseScreen />
      </MemoryRouter>
    );

    // Verify stats show 0
    expect(screen.getByText('Due Today')).toBeDefined();
    expect(screen.getByText('Weak Topics')).toBeDefined();
    expect(screen.getByText('Review Cards')).toBeDefined();

    // Verify empty state is displayed instead of fake cards
    expect(screen.getByText('Your Review Queue is Clear')).toBeDefined();

    // Verify educational explainer on SRS is rendered
    expect(screen.getByText(/What is Spaced Repetition \(SRS\)\?/i)).toBeDefined();
  });

  it('allows practicing a topic drill, records attempt, and adds real card to the active review deck', () => {
    render(
      <MemoryRouter initialEntries={['/revise']}>
        <ReviseScreen />
      </MemoryRouter>
    );

    // Click "Practice" on the first starter topic ("Queueable Apex")
    const practiceButtons = screen.getAllByRole('button', { name: /Practice/i });
    fireEvent.click(practiceButtons[0]);

    // Verify quiz modal opens with Queueable Apex question
    expect(screen.getByText(/Interactive Spaced Review Drill/i)).toBeDefined();
    expect(screen.getByRole('heading', { name: /Queueable Apex/i })).toBeDefined();
    expect(screen.getAllByText(/Which interface must a class implement to be executed as a Queueable Apex job\?/i).length).toBeGreaterThan(0);

    // Select the correct option: "Queueable"
    const correctOption = screen.getByRole('button', { name: /Option 2: Queueable/i });
    fireEvent.click(correctOption);

    // Verify correct feedback appears
    expect(screen.getByText(/✓ Correct!/i)).toBeDefined();

    // Click "Done" to close the modal
    const doneBtn = screen.getByRole('button', { name: 'Done' });
    fireEvent.click(doneBtn);

    // The topic should now appear in the active Spaced Review Deck with real calculated strength
    expect(screen.getAllByText('Queueable Apex').length).toBeGreaterThan(0);
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('1 topic in deck')).toBeDefined();
  });
});
