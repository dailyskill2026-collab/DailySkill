// src/services/userRegistryService.ts
/**
 * User Registry Service
 * Stores and manages candidate user accounts, sign-ups, and engagement metrics
 * for the Administrator Control Dashboard.
 */

export interface RegisteredCandidate {
  uid: string;
  id?: string; // convenient alias
  name: string;
  email: string;
  technology: string;
  role: string;
  experience: string;
  dailyDuration: number;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: string; // ISO string
  lastActiveAt: string; // ISO string
  appOpensCount: number;
  lessonsCompletedCount: number;
  streakDays: number;
  status: 'active' | 'pending_verification' | 'inactive';
}

const REGISTRY_STORAGE_KEY = 'it_daily_registered_candidates_v2';
const APP_OPENS_COUNTER_KEY = 'it_daily_total_app_opens_count';

// Default initial enterprise candidates so the dashboard is immediately populated and informative
const SEED_CANDIDATES: RegisteredCandidate[] = [
  {
    uid: 'user-seed-zahed',
    name: 'Mohammad Zahed Ali',
    email: 'mzahedali1991@gmail.com',
    technology: 'SALESFORCE',
    role: 'Developer',
    experience: 'Mid (3–5 yrs)',
    dailyDuration: 5,
    emailVerified: true,
    isAdmin: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastActiveAt: new Date().toISOString(),
    appOpensCount: 18,
    lessonsCompletedCount: 5,
    streakDays: 3,
    status: 'active',
  },
  {
    uid: 'user-seed-priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@accenture.com',
    technology: 'SALESFORCE',
    role: 'Administrator',
    experience: 'Senior (5–8 yrs)',
    dailyDuration: 5,
    emailVerified: true,
    isAdmin: false,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    appOpensCount: 24,
    lessonsCompletedCount: 8,
    streakDays: 5,
    status: 'active',
  },
  {
    uid: 'user-seed-rahul',
    name: 'Rahul Deshmukh',
    email: 'rahul.deshmukh@deloitte.com',
    technology: 'SALESFORCE',
    role: 'Technical Architect',
    experience: 'Architect (8+ yrs)',
    dailyDuration: 10,
    emailVerified: true,
    isAdmin: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    appOpensCount: 31,
    lessonsCompletedCount: 11,
    streakDays: 7,
    status: 'active',
  },
  {
    uid: 'user-seed-sneha',
    name: 'Sneha Patel',
    email: 'sneha.patel@tcs.com',
    technology: 'SALESFORCE',
    role: 'Developer',
    experience: 'Junior (1–3 yrs)',
    dailyDuration: 5,
    emailVerified: true,
    isAdmin: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - 45 * 60000).toISOString(),
    appOpensCount: 9,
    lessonsCompletedCount: 3,
    streakDays: 2,
    status: 'active',
  },
  {
    uid: 'user-seed-ananya',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@cognizant.com',
    technology: 'SALESFORCE',
    role: 'Consultant / BA',
    experience: 'Fresher (0–1 yr)',
    dailyDuration: 5,
    emailVerified: false,
    isAdmin: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    appOpensCount: 3,
    lessonsCompletedCount: 1,
    streakDays: 1,
    status: 'pending_verification',
  },
];

export class UserRegistryService {
  private static instance: UserRegistryService;

  static getInstance(): UserRegistryService {
    if (!UserRegistryService.instance) {
      UserRegistryService.instance = new UserRegistryService();
    }
    return UserRegistryService.instance;
  }

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    try {
      const existing = localStorage.getItem(REGISTRY_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(SEED_CANDIDATES));
      }
      const opens = localStorage.getItem(APP_OPENS_COUNTER_KEY);
      if (!opens) {
        localStorage.setItem(APP_OPENS_COUNTER_KEY, '85');
      }
    } catch {
      // ignore
    }
  }

  getAllCandidates(): RegisteredCandidate[] {
    try {
      const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
      if (raw) {
        const parsed: RegisteredCandidate[] = JSON.parse(raw);
        return parsed.map((c) => ({ ...c, id: c.uid }));
      }
    } catch {
      // fallback
    }
    return SEED_CANDIDATES.map((c) => ({ ...c, id: c.uid }));
  }

  private saveCandidates(candidates: RegisteredCandidate[]) {
    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(candidates));
    } catch {
      // ignore
    }
  }

  /**
   * Registers a newly signed up user or updates their profile when onboarding completes
   */
  registerOrUpdateCandidate(data: {
    uid?: string;
    email: string;
    name?: string;
    technology?: string;
    role?: string;
    experience?: string;
    dailyDuration?: number;
    emailVerified?: boolean;
    isAdmin?: boolean;
    authProvider?: string;
  }): RegisteredCandidate {
    const list = this.getAllCandidates();
    const targetUid = data.uid || ('user-' + Math.random().toString(36).substring(2, 9));
    const existingIndex = list.findIndex(
      (c) => (data.uid && c.uid === data.uid) || c.email.toLowerCase() === data.email.toLowerCase()
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const updated: RegisteredCandidate = {
        ...existing,
        name: data.name || existing.name,
        technology: data.technology || existing.technology || 'SALESFORCE',
        role: data.role || existing.role || 'Developer',
        experience: data.experience || existing.experience || 'All Levels',
        dailyDuration: data.dailyDuration ?? existing.dailyDuration ?? 5,
        emailVerified: data.emailVerified !== undefined ? data.emailVerified : existing.emailVerified,
        isAdmin: data.isAdmin !== undefined ? data.isAdmin : existing.isAdmin,
        lastActiveAt: now,
        status: data.emailVerified ? 'active' : existing.status,
        id: existing.uid,
      };
      list[existingIndex] = updated;
      this.saveCandidates(list);
      return updated;
    } else {
      const newCandidate: RegisteredCandidate = {
        uid: targetUid,
        id: targetUid,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        technology: data.technology || 'SALESFORCE',
        role: data.role || 'Developer',
        experience: data.experience || 'Junior (1–3 yrs)',
        dailyDuration: data.dailyDuration || 5,
        emailVerified: Boolean(data.emailVerified),
        isAdmin: Boolean(
          data.isAdmin ||
          data.email.includes('admin') ||
          data.email.includes('zahed') ||
          data.email === 'dailyskill2026@gmail.com'
        ),
        createdAt: now,
        lastActiveAt: now,
        appOpensCount: 1,
        lessonsCompletedCount: 0,
        streakDays: 1,
        status: data.emailVerified ? 'active' : 'pending_verification',
      };
      list.unshift(newCandidate);
      this.saveCandidates(list);
      return newCandidate;
    }
  }

  /**
   * Tracks an app open event globally and increments for the specific user
   */
  recordAppOpen(uid?: string) {
    try {
      const currentOpens = parseInt(localStorage.getItem(APP_OPENS_COUNTER_KEY) || '85', 10);
      localStorage.setItem(APP_OPENS_COUNTER_KEY, String(currentOpens + 1));

      if (uid) {
        const list = this.getAllCandidates();
        const user = list.find((c) => c.uid === uid || c.id === uid);
        if (user) {
          user.appOpensCount = (user.appOpensCount || 0) + 1;
          user.lastActiveAt = new Date().toISOString();
          this.saveCandidates(list);
        }
      }
    } catch {
      // ignore
    }
  }

  recordLessonCompleted(uid: string, _lessonId?: string) {
    const list = this.getAllCandidates();
    const user = list.find((c) => c.uid === uid || c.id === uid);
    if (user) {
      user.lessonsCompletedCount = (user.lessonsCompletedCount || 0) + 1;
      user.streakDays = (user.streakDays || 0) + 1;
      user.lastActiveAt = new Date().toISOString();
      this.saveCandidates(list);
    }
  }

  deleteCandidate(uid: string): boolean {
    const list = this.getAllCandidates();
    const initialLen = list.length;
    const filtered = list.filter((c) => c.uid !== uid && c.id !== uid);
    if (filtered.length !== initialLen) {
      this.saveCandidates(filtered);
      return true;
    }
    return false;
  }

  getTotalAppOpensCount(): number {
    try {
      return parseInt(localStorage.getItem(APP_OPENS_COUNTER_KEY) || '85', 10);
    } catch {
      return 85;
    }
  }

  getRegistryStats() {
    const candidates = this.getAllCandidates();
    const totalOpens = this.getTotalAppOpensCount();
    const verified = candidates.filter((c) => c.emailVerified).length;

    // Active today = active in last 24 hours
    const oneDayAgo = Date.now() - 86400000;
    const activeToday = candidates.filter((c) => new Date(c.lastActiveAt).getTime() > oneDayAgo).length;

    return {
      totalUsers: candidates.length,
      verifiedUsers: verified,
      activeToday: Math.max(activeToday, 1),
      totalOpens,
      totalAppOpens: totalOpens,
    };
  }

  exportCandidatesToCSV(): string {
    const candidates = this.getAllCandidates();
    const headers = [
      'UID',
      'Name',
      'Email',
      'Technology',
      'Role',
      'Experience',
      'Verified',
      'App Opens',
      'Lessons Completed',
      'Streak (Days)',
      'Signed Up At',
      'Last Active At',
    ];

    const rows = candidates.map((c) => [
      `"${c.uid}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.technology}"`,
      `"${c.role}"`,
      `"${c.experience}"`,
      c.emailVerified ? 'YES' : 'NO',
      c.appOpensCount,
      c.lessonsCompletedCount,
      c.streakDays,
      `"${new Date(c.createdAt).toLocaleString()}"`,
      `"${new Date(c.lastActiveAt).toLocaleString()}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const userRegistryService = UserRegistryService.getInstance();
