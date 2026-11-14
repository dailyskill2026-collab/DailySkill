import { LearningChallenge, ChallengePeriod, ChallengeCategory } from '../types/challenge';
import { challengeRepository } from '../repositories';

export class ChallengeService {
  /**
   * Generates ISO date period key YYYY-MM-DD for daily challenges.
   */
  public getTodayPeriodKey(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generates weekly period key YYYY-Wxx based on ISO calendar week.
   */
  public getWeeklyPeriodKey(date: Date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  /**
   * Retrieves or initializes today's daily challenges.
   */
  public async getDailyChallenges(userId: string = 'mock-user-1'): Promise<LearningChallenge[]> {
    const todayKey = this.getTodayPeriodKey();
    let challenges = await challengeRepository.getChallenges(userId, 'daily', todayKey);

    if (!challenges || challenges.length === 0) {
      challenges = [
        {
          challengeId: `daily-lesson-${todayKey}`,
          type: 'daily',
          title: 'Daily Micro-Lesson',
          description: 'Read and complete 1 technical lesson today.',
          targetCount: 1,
          currentCount: 0,
          isCompleted: false,
          periodKey: todayKey,
          category: 'lesson'
        },
        {
          challengeId: `daily-mcq-${todayKey}`,
          type: 'daily',
          title: 'Knowledge Drill',
          description: 'Answer 3 practice or assessment questions correctly.',
          targetCount: 3,
          currentCount: 0,
          isCompleted: false,
          periodKey: todayKey,
          category: 'mcq'
        }
      ];
      await challengeRepository.saveChallenges(userId, challenges);
    }

    return challenges;
  }

  /**
   * Retrieves or initializes the current weekly challenges.
   */
  public async getWeeklyChallenges(userId: string = 'mock-user-1'): Promise<LearningChallenge[]> {
    const weekKey = this.getWeeklyPeriodKey();
    let challenges = await challengeRepository.getChallenges(userId, 'weekly', weekKey);

    if (!challenges || challenges.length === 0) {
      challenges = [
        {
          challengeId: `weekly-assessment-${weekKey}`,
          type: 'weekly',
          title: 'Skill Benchmark',
          description: 'Complete at least 1 comprehensive Skill Assessment.',
          targetCount: 1,
          currentCount: 0,
          isCompleted: false,
          periodKey: weekKey,
          category: 'assessment'
        },
        {
          challengeId: `weekly-streak-${weekKey}`,
          type: 'weekly',
          title: 'Consistent Upgrader',
          description: 'Maintain a 3-day active learning streak this week.',
          targetCount: 3,
          currentCount: 0,
          isCompleted: false,
          periodKey: weekKey,
          category: 'streak'
        }
      ];
      await challengeRepository.saveChallenges(userId, challenges);
    }

    return challenges;
  }

  /**
   * Records progress against active challenges matching the category.
   * Returns any challenges that were completed by this increment.
   */
  public async recordProgress(
    category: ChallengeCategory,
    increment: number = 1,
    userId: string = 'mock-user-1'
  ): Promise<LearningChallenge[]> {
    const newlyCompleted: LearningChallenge[] = [];
    const todayKey = this.getTodayPeriodKey();
    const weekKey = this.getWeeklyPeriodKey();

    const daily = await this.getDailyChallenges(userId);
    const weekly = await this.getWeeklyChallenges(userId);
    const all = [...daily, ...weekly];

    for (const c of all) {
      if (c.category === category && !c.isCompleted) {
        const updatedCount = Math.min(c.targetCount, c.currentCount + increment);
        const wasCompleted = c.isCompleted;
        const nowCompleted = updatedCount >= c.targetCount;

        const updated = await challengeRepository.updateChallenge(userId, c.challengeId, {
          currentCount: updatedCount,
          isCompleted: nowCompleted
        });

        if (!wasCompleted && nowCompleted) {
          newlyCompleted.push(updated);
        }
      }
    }

    return newlyCompleted;
  }
}

export const challengeService = new ChallengeService();
