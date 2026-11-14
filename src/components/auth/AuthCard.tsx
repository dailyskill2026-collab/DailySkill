// src/components/auth/AuthCard.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, LogOut, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

export default function AuthCard() {
  const {
    user,
    isAdmin,
    isMock,
    signIn,
    signUp,
    signOut,
    resetPassword,
    pendingGuestMigration,
    confirmGuestMigration,
    dismissGuestMigration,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        setSuccessMsg('Logged in successfully!');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signUp(email, password, displayName);
        setSuccessMsg('Account created successfully!');
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(email);
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated
  if (user) {
    return (
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-primary">Connected Account</h2>
          </div>
          <span className={`chip text-2xs ${isMock ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300'}`}>
            <Database size={12} />
            {isMock ? 'Mock Mode' : 'Firebase Live'}
          </span>
        </div>

        {/* Guest migration confirmation alert */}
        {pendingGuestMigration && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-2">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
              <AlertCircle size={14} />
              Merge Guest Learning Progress?
            </p>
            <p className="text-2xs text-amber-700 dark:text-amber-300">
              We detected learning progress from your guest session. Would you like to migrate this data into your account?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={confirmGuestMigration}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium"
              >
                Merge Progress
              </button>
              <button
                onClick={dismissGuestMigration}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-secondary hover:text-primary rounded-lg text-xs font-medium"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1">
          <p className="text-sm font-bold text-primary">{user.displayName || 'Learner'}</p>
          <p className="text-xs text-secondary">{user.email}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-2xs text-muted font-mono">UID: {user.uid.substring(0, 12)}...</span>
            {isAdmin && (
              <span className="chip text-2xs bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                <ShieldCheck size={12} />
                Admin
              </span>
            )}
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Mode switcher tabs */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'signin' ? 'bg-brand-600 text-white' : 'text-secondary hover:text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'signup' ? 'bg-brand-600 text-white' : 'text-secondary hover:text-primary'
            }`}
          >
            Sign Up
          </button>
        </div>
        <span className={`chip text-2xs ${isMock ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300'}`}>
          {isMock ? 'Mock Mode' : 'Firebase Dev'}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <div>
            <label className="block text-2xs font-semibold text-secondary uppercase mb-1">Display Name</label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark text-xs text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}

        <div>
          <label className="block text-2xs font-semibold text-secondary uppercase mb-1">Email</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark text-xs text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-2xs font-semibold text-secondary uppercase">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); }}
                  className="text-2xs text-brand-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark text-xs text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : mode === 'signin' ? (
            <>
              <LogIn size={15} />
              Sign In
            </>
          ) : mode === 'signup' ? (
            <>
              <UserPlus size={15} />
              Create Account
            </>
          ) : (
            <>
              <KeyRound size={15} />
              Send Reset Link
            </>
          )}
        </button>

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="w-full text-center text-xs text-secondary hover:text-primary pt-1"
          >
            Back to Sign In
          </button>
        )}
      </form>
    </div>
  );
}
