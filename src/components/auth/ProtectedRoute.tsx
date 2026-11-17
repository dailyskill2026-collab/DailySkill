// src/components/auth/ProtectedRoute.tsx
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { repositories } from '@/repositories';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin, signIn } = useAuth();
  const location = useLocation();

  const [adminKey, setAdminKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@salesforce.dev');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Handle Quick Master Admin Key Unlock
  const handlePasskeyUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (adminKey.trim() === 'admin2026' || adminKey.trim() === 'zahed2026') {
      const currentUser = repositories.auth.getCurrentUser();
      if (currentUser) {
        currentUser.isAdmin = true;
        localStorage.setItem('it-daily-mock-user', JSON.stringify(currentUser));
        window.location.reload();
      } else {
        // Sign in with admin account
        signIn('admin@salesforce.dev', 'admin123').then(() => {
          window.location.reload();
        });
      }
    } else {
      setAuthError('Invalid Admin Master Key. Access denied.');
    }
  };

  // Handle Direct Admin Sign In
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthenticating(true);
    try {
      await signIn(adminEmail.trim(), adminPassword);
      window.location.reload();
    } catch (err: any) {
      setAuthError(err.message || 'Admin authentication failed.');
    } finally {
      setAuthenticating(false);
    }
  };

  if (!user && !requireAdmin) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If section requires Admin and current user is not admin, display Admin Gate
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="card max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Lock size={28} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-primary tracking-tight">Admin Authorization Required</h2>
            <p className="text-xs sm:text-sm text-secondary">
              This area is restricted to system administrators. End users cannot view candidate data, user signups, or control feeds.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
              <ShieldAlert size={16} className="shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          {!showKeyForm ? (
            /* Quick Master Passkey Unlock Form */
            <form onSubmit={handlePasskeyUnlock} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-2xs uppercase tracking-wider font-bold text-muted mb-1">
                  Enter Admin Master Access Key:
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key (e.g. admin2026)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Unlock Admin Dashboard</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyForm(true)}
                  className="text-xs text-secondary hover:text-primary underline"
                >
                  Or sign in with Admin credentials
                </button>
              </div>
            </form>
          ) : (
            /* Full Admin Credentials Form */
            <form onSubmit={handleAdminSignIn} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-2xs uppercase tracking-wider font-bold text-muted mb-1">
                  Admin Email:
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wider font-bold text-muted mb-1">
                  Admin Password:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>{authenticating ? 'Authenticating...' : 'Sign In as Admin'}</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyForm(false)}
                  className="text-xs text-secondary hover:text-primary underline"
                >
                  Use Master Access Key instead
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← Return to Learner Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
