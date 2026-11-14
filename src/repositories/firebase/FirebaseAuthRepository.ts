// src/repositories/firebase/FirebaseAuthRepository.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User as FbUser,
} from 'firebase/auth';
import type { IAuthRepository, AuthUser } from '../types';
import { getFirebaseServices } from '@/lib/firebase';

export class FirebaseAuthRepository implements IAuthRepository {
  private getAuth() {
    const services = getFirebaseServices();
    if (!services) {
      throw new Error('Firebase Auth is not configured. Please check VITE_FIREBASE_* environment variables.');
    }
    return services.auth;
  }

  private mapUser(user: FbUser | null, isAdmin = false): AuthUser | null {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
      isAdmin,
    };
  }

  getCurrentUser(): AuthUser | null {
    try {
      const auth = this.getAuth();
      return this.mapUser(auth.currentUser);
    } catch {
      return null;
    }
  }

  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const auth = this.getAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || email.split('@')[0],
      isAnonymous: false,
      isAdmin: false,
    };
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const auth = this.getAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const tokenResult = await user.getIdTokenResult();
    const isAdmin = Boolean(tokenResult.claims.admin);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      isAnonymous: false,
      isAdmin,
    };
  }

  async signOut(): Promise<void> {
    const auth = this.getAuth();
    await fbSignOut(auth);
  }

  async resetPassword(email: string): Promise<void> {
    const auth = this.getAuth();
    await sendPasswordResetEmail(auth, email);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    try {
      const auth = this.getAuth();
      return fbOnAuthStateChanged(auth, async (user) => {
        if (!user) {
          callback(null);
          return;
        }
        try {
          const tokenResult = await user.getIdTokenResult();
          const isAdmin = Boolean(tokenResult.claims.admin);
          callback(this.mapUser(user, isAdmin));
        } catch {
          callback(this.mapUser(user, false));
        }
      });
    } catch {
      callback(null);
      return () => {};
    }
  }

  async checkIsAdmin(): Promise<boolean> {
    try {
      const auth = this.getAuth();
      if (!auth.currentUser) return false;
      const token = await auth.currentUser.getIdTokenResult();
      return Boolean(token.claims.admin);
    } catch {
      return false;
    }
  }
}
