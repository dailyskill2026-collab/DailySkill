// src/repositories/mock/MockAuthRepository.ts
import type { IAuthRepository, AuthUser } from '../types';

const AUTH_STORAGE_KEY = 'it-daily-auth-user';

export class MockAuthRepository implements IAuthRepository {
  private currentUser: AuthUser | null = this.loadStoredUser();
  private listeners: Array<(user: AuthUser | null) => void> = [];

  private loadStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          if (parsed.email && (parsed.email.includes('admin') || parsed.email === 'dailyskill2026@gmail.com' || parsed.email.includes('zahed'))) {
            parsed.isAdmin = true;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async signUp(email: string, _password: string, displayName?: string): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: displayName || email.split('@')[0],
      isAnonymous: false,
      isAdmin: email.includes('admin') || email === 'dailyskill2026@gmail.com' || email.includes('zahed'),
      emailVerified: false,
    };
    this.currentUser = user;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    this.notify();
    return user;
  }

  async verifyEmail(code: string): Promise<boolean> {
    if (this.currentUser) {
      this.currentUser.emailVerified = true;
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } catch {
        // ignore
      }
      this.notify();
      return true;
    }
    return false;
  }

  async signIn(email: string, _password: string): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      isAnonymous: false,
      isAdmin: email.includes('admin') || email === 'dailyskill2026@gmail.com' || email.includes('zahed'),
      emailVerified: true,
    };
    this.currentUser = user;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    this.notify();
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }

  async resetPassword(_email: string): Promise<void> {
    // Mock success
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  async checkIsAdmin(): Promise<boolean> {
    return Boolean(this.currentUser?.isAdmin);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }
}
