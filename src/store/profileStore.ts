import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Technology = 'salesforce' | 'java' | 'python' | 'javascript' | 'aws' | 'azure' | 'devops' | 'qa' | 'ml' | 'other'
export type Role =
  | 'salesforce_admin'
  | 'salesforce_dev'
  | 'salesforce_lead'
  | 'salesforce_arch'
  | 'salesforce_consult'
  | 'salesforce_fresher'
  // placeholder for other techs – will be added later
export type Experience = 'fresher' | '0-2' | '2-5' | '5-8' | '8+'
export type Goal =
  | 'stay_updated'
  | 'improve_skills'
  | 'real_projects'
  | 'prepare_interview'
  | 'prepare_cert'
  | 'grow_role'
export type Interest =
  | 'admin'
  | 'apex'
  | 'triggers'
  | 'async_apex'
  | 'lwc'
  | 'flows'
  | 'integration'
  | 'security'
  | 'experience_cloud'
  | 'sales_cloud'
  | 'service_cloud'
  | 'financial_cloud'
  | 'health_cloud'
  | 'agentforce'
  | 'devops'
  | 'interview'
export type Duration = 2 | 3 | 5 | 10
export type Reminder = 'morning' | 'afternoon' | 'evening' | 'none'
export type WeeklyGoalDays = 3 | 5 | 7

export interface Profile {
  onboardingCompleted: boolean
  isGuest: boolean
  name: string
  technology: Technology
  role: Role
  experience: Experience
  goals: Goal[]
  interests: Interest[]
  dailyDuration: Duration
  weeklyGoal?: WeeklyGoalDays
  reminder: Reminder
}

// Default profile for a new guest user
export const defaultProfile: Profile = {
  onboardingCompleted: false,
  isGuest: false,
  name: 'Rahul',
  technology: 'salesforce',
  role: 'salesforce_dev',
  experience: '0-2',
  goals: ['stay_updated'],
  interests: ['apex', 'lwc', 'integration'],
  dailyDuration: 5,
  weeklyGoal: 5,
  reminder: 'none',
};
;


export const useProfileStore = create<Profile & {
  setProfile: (patch: Partial<Profile>) => void
  resetProfile: () => void
}>(persist(
  (set, get) => ({
    ...defaultProfile,
    setProfile: (patch) => {
      set((state) => ({ ...state, ...patch }));
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('daily-plan-')) localStorage.removeItem(k);
        });
      } catch (e) {
        // ignore storage errors
      }
    },
    resetProfile: () => set(() => ({ ...defaultProfile })),
  }),
  {
    name: 'it-daily-profile', // localStorage key
    // custom serialization to handle validation on load
    deserialize: (str) => {
      try {
        const parsed = JSON.parse(str)
        // basic validation – ensure required fields exist
        const required = [
          'onboardingCompleted',
          'isGuest',
          'name',
          'technology',
          'role',
          'experience',
          'goals',
          'interests',
          'dailyDuration',
          'reminder',
        ]
        for (const key of required) {
          if (!(key in parsed)) throw new Error('Missing key')
        }
        return parsed as Profile
      } catch (_) {
        // corrupted data – fall back to defaults
        return defaultProfile
      }
    },
    // keep the raw string for debugging if needed
    serialize: (state) => JSON.stringify(state),
  }
))
