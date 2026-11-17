import { describe, it, expect, beforeEach } from 'vitest';
import { userRegistryService } from '@/services/userRegistryService';

describe('Admin User Registry & App Opens Telemetry Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with seed candidates if storage is empty', () => {
    const candidates = userRegistryService.getAllCandidates();
    expect(candidates.length).toBeGreaterThan(0);
    const candidate = candidates[0];
    expect(candidate.name).toBeDefined();
    expect(candidate.email).toBeDefined();
    expect(candidate.technology).toBeDefined();
    expect(candidate.role).toBeDefined();
  });

  it('registers a new candidate and persists their details', () => {
    const newCandidate = userRegistryService.registerOrUpdateCandidate({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      technology: 'Salesforce',
      role: 'Salesforce Developer',
      experience: 'Mid-Level (3-5 yrs)',
      dailyDuration: 10,
      emailVerified: true,
      authProvider: 'email',
    });

    expect(newCandidate.id).toBeDefined();
    expect(newCandidate.name).toBe('Priya Sharma');
    expect(newCandidate.emailVerified).toBe(true);

    const all = userRegistryService.getAllCandidates();
    const found = all.find((c) => c.email === 'priya.sharma@example.com');
    expect(found).toBeDefined();
    expect(found?.role).toBe('Salesforce Developer');
  });

  it('updates existing candidate without duplicating', () => {
    userRegistryService.registerOrUpdateCandidate({
      name: 'Aarav Patel',
      email: 'aarav.dev@example.com',
      role: 'Junior Admin',
    });

    const initialCount = userRegistryService.getAllCandidates().length;

    userRegistryService.registerOrUpdateCandidate({
      name: 'Aarav Patel',
      email: 'aarav.dev@example.com',
      role: 'Senior Admin',
    });

    const finalCandidates = userRegistryService.getAllCandidates();
    expect(finalCandidates.length).toBe(initialCount);
    const updated = finalCandidates.find((c) => c.email === 'aarav.dev@example.com');
    expect(updated?.role).toBe('Senior Admin');
  });

  it('tracks app opens for candidates and global visitor count', () => {
    const candidate = userRegistryService.registerOrUpdateCandidate({
      name: 'Test Visitor',
      email: 'visitor@example.com',
    });

    const statsBefore = userRegistryService.getRegistryStats();
    userRegistryService.recordAppOpen(candidate.id);
    const statsAfter = userRegistryService.getRegistryStats();

    expect(statsAfter.totalAppOpens).toBeGreaterThanOrEqual(statsBefore.totalAppOpens + 1);

    const updated = userRegistryService.getAllCandidates().find((c) => c.id === candidate.id);
    expect(updated?.appOpensCount).toBeGreaterThanOrEqual(1);
  });

  it('tracks lesson completions and updates candidate streak', () => {
    const candidate = userRegistryService.registerOrUpdateCandidate({
      name: 'Learner Test',
      email: 'learner@example.com',
    });

    userRegistryService.recordLessonCompleted(candidate.id, 'winter27-apex-cursors');

    const updated = userRegistryService.getAllCandidates().find((c) => c.id === candidate.id);
    expect(updated?.lessonsCompletedCount).toBeGreaterThanOrEqual(1);
    expect(updated?.streakDays).toBeGreaterThanOrEqual(1);
  });

  it('exports candidates safely to CSV string', () => {
    const csv = userRegistryService.exportCandidatesToCSV();
    expect(csv).toContain('ID,Name,Email,Technology,Role,Experience');
    expect(csv).toContain('@');
  });

  it('deletes candidate cleanly by id', () => {
    const candidate = userRegistryService.registerOrUpdateCandidate({
      name: 'To Delete',
      email: 'delete.me@example.com',
    });

    const deleted = userRegistryService.deleteCandidate(candidate.id);
    expect(deleted).toBe(true);

    const all = userRegistryService.getAllCandidates();
    expect(all.some((c) => c.id === candidate.id)).toBe(false);
  });
});
