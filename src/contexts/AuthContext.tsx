// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, GuestSnapshot } from '@/repositories/types';
import { repositories } from '@/repositories';
import { useProfileStore } from '@/store/profileStore';
import { useProgressStore } from '@/store/progressStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useHistoryStore } from '@/store/historyStore';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isMock: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  pendingGuestMigration: GuestSnapshot | null;
  confirmGuestMigration: () => Promise<void>;
  dismissGuestMigration: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(repositories.auth.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingGuestMigration, setPendingGuestMigration] = useState<GuestSnapshot | null>(null);

  useEffect(() => {
    const unsubscribe = repositories.auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await repositories.auth.checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkForGuestData = (): GuestSnapshot | null => {
    try {
      const profile = useProfileStore.getState();
      const progress = useProgressStore.getState().dailyProgress;
      const bookmarks = Array.from(useBookmarkStore.getState().bookmarks);
      const history = useHistoryStore.getState().viewed;

      const hasActivity = Object.keys(progress).length > 0 || bookmarks.length > 0 || profile.onboardingCompleted;

      if (hasActivity) {
        return {
          profile,
          dailyProgress: progress,
          bookmarks,
          history,
        };
      }
    } catch {
      // ignore
    }
    return null;
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const guestData = checkForGuestData();
    const newUser = await repositories.auth.signUp(email, password, displayName);
    setUser(newUser);

    if (guestData) {
      setPendingGuestMigration(guestData);
    } else {
      await repositories.user.saveProfile(newUser.uid, {
        name: displayName || email.split('@')[0],
        onboardingCompleted: true,
        isGuest: false,
      });
      useProfileStore.getState().setProfile({
        name: displayName || email.split('@')[0],
        onboardingCompleted: true,
        isGuest: false,
      });
    }

    return newUser;
  };

  const signIn = async (email: string, password: string) => {
    const guestData = checkForGuestData();
    const loggedInUser = await repositories.auth.signIn(email, password);
    setUser(loggedInUser);

    const adminStatus = await repositories.auth.checkIsAdmin();
    setIsAdmin(adminStatus);

    useProfileStore.getState().setProfile({
      name: loggedInUser.displayName || email.split('@')[0],
      isGuest: false,
    });

    if (guestData) {
      setPendingGuestMigration(guestData);
    }

    return loggedInUser;
  };

  const signOut = async () => {
    await repositories.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setPendingGuestMigration(null);
    useProfileStore.getState().setProfile({
      name: '',
      isGuest: true,
    });
  };

  const resetPassword = async (email: string) => {
    await repositories.auth.resetPassword(email);
  };

  const confirmGuestMigration = async () => {
    if (user && pendingGuestMigration) {
      await repositories.user.migrateGuestData(user.uid, pendingGuestMigration);
      setPendingGuestMigration(null);
    }
  };

  const dismissGuestMigration = () => {
    setPendingGuestMigration(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isMock: repositories.isMock,
        signUp,
        signIn,
        signOut,
        resetPassword,
        pendingGuestMigration,
        confirmGuestMigration,
        dismissGuestMigration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
