// src/repositories/mock/MockAuthRepository.ts
import type { IAuthRepository, AuthUser } from '../types';

export class MockAuthRepository implements IAuthRepository {
  private currentUser: AuthUser | null = {
    uid: 'mock-user-123',
    email: 'mock.user@salesforce.dev',
    displayName: 'Rahul (Mock)',
    isAnonymous: false,
    isAdmin: true,
  };
  private listeners: Array<(user: AuthUser | null) => void> = [];

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async signUp(email: string, _password: string, displayName?: string): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: displayName || email.split('@')[0],
      isAnonymous: false,
      isAdmin: false,
    };
    this.currentUser = user;
    this.notify();
    return user;
  }

  async signIn(email: string, _password: string): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      isAnonymous: false,
      isAdmin: email.includes('admin') || email === 'dailyskill2026@gmail.com',
    };
    this.currentUser = user;
    this.notify();
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.notify();
  }

  async resetPassword(_email: string): Promise<void> {
    // Mock success
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async checkIsAdmin(): Promise<boolean> {
    return Boolean(this.currentUser?.isAdmin);
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }
}
