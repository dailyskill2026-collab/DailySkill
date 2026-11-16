// src/screens/Auth/AuthScreen.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileStore, Technology, Role, Experience, Duration, Goal } from '@/store/profileStore';
import { repositories } from '@/repositories';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Award,
} from 'lucide-react';

type AuthStep = 'auth' | 'verify' | 'profile';

export default function AuthScreen() {
  const navigate = useNavigate();
  const { user, signIn, signUp, verifyEmail } = useAuth();
  const { setProfile } = useProfileStore();

  const [step, setStep] = useState<AuthStep>('auth');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Step 1: Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 2: Email verification state
  const [otpCode, setOtpCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Step 3: Candidate profile state
  const [fullName, setFullName] = useState('');
  const [selectedTech, setSelectedTech] = useState<Technology>('salesforce');
  const [selectedRole, setSelectedRole] = useState<Role>('salesforce_dev');
  const [selectedExp, setSelectedExp] = useState<Experience>('2-5');
  const [selectedDuration, setSelectedDuration] = useState<Duration>(5);
  const [selectedGoal, setSelectedGoal] = useState<Goal>('stay_updated');

  // Handle Sign Up / Sign In
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!email.includes('@') || !email.includes('.')) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signUp(email, password, fullName || email.split('@')[0]);
        // Transition to Email Verification
        setStep('verify');
      } else {
        await signIn(email, password);
        // If signing in to existing account with completed profile, go home
        const existingProfile = useProfileStore.getState();
        if (existingProfile.onboardingCompleted && existingProfile.name) {
          navigate('/');
        } else {
          setStep('profile');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Verification Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setLoading(true);

    try {
      const code = otpCode.trim();
      if (!code) {
        throw new Error('Please enter the 6-digit verification code.');
      }
      // Demo acceptance: "123456" or any 6-digit code for mock/demo
      const ok = await verifyEmail(code);
      if (!ok) {
        throw new Error('Invalid verification code. Please try again.');
      }
      // Move to candidate profile details form
      setStep('profile');
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerifyDemo = async () => {
    setOtpCode('123456');
    setLoading(true);
    await verifyEmail('123456');
    setLoading(false);
    setStep('profile');
  };

  const handleResendCode = () => {
    setResendNotice(`A fresh 6-digit verification code was sent to ${email}`);
    setTimeout(() => setResendNotice(null), 4000);
  };

  // Handle Profile Form Submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const displayName = fullName.trim() || email.split('@')[0] || 'Learner';

    const patch = {
      name: displayName,
      technology: selectedTech,
      role: selectedRole,
      experience: selectedExp,
      dailyDuration: selectedDuration,
      goals: [selectedGoal],
      onboardingCompleted: true,
      isGuest: false,
    };

    setProfile(patch);

    if (user) {
      try {
        await repositories.user.saveProfile(user.uid, patch);
      } catch {
        // ignore offline storage errors
      }
    }

    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        {/* App Logo & Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-lg mb-2">
          <Sparkles size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          IT Daily Upskilling
        </h1>
        <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
          Master Salesforce release innovations & scenario MCQs — just 5 minutes a day.
        </p>

        {/* Step Indicator Progress */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span
            className={`w-7 h-1.5 rounded-full transition-all duration-300 ${
              step === 'auth' ? 'bg-brand-600 w-10' : 'bg-brand-200 dark:bg-brand-900'
            }`}
          />
          <span
            className={`w-7 h-1.5 rounded-full transition-all duration-300 ${
              step === 'verify' ? 'bg-brand-600 w-10' : 'bg-brand-200 dark:bg-brand-900'
            }`}
          />
          <span
            className={`w-7 h-1.5 rounded-full transition-all duration-300 ${
              step === 'profile' ? 'bg-brand-600 w-10' : 'bg-brand-200 dark:bg-brand-900'
            }`}
          />
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          {/* ============================================================== */}
          {/* STEP 1: AUTHENTICATION (SIGN UP / SIGN IN) */}
          {/* ============================================================== */}
          {step === 'auth' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                    authMode === 'signup'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                    authMode === 'signin'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Sign In
                </button>
              </div>

              <div className="text-left">
                <h2 className="text-lg font-bold text-primary">
                  {authMode === 'signup' ? 'Sign up to get started' : 'Welcome back'}
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  {authMode === 'signup'
                    ? 'Enter your email to verify and unlock your tailored learning curriculum.'
                    : 'Sign in to continue your daily streak and progress.'}
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Zahed Ali"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Please wait...</span>
                  ) : authMode === 'signup' ? (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight size={15} />
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: EMAIL VERIFICATION */}
          {/* ============================================================== */}
          {step === 'verify' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mx-auto">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-xl font-bold text-primary">Verify Your Email Address</h2>
                <p className="text-xs text-secondary leading-relaxed">
                  We've sent a 6-digit confirmation code to{' '}
                  <span className="font-semibold text-primary">{email}</span>. Please enter it below to verify your email.
                </p>
              </div>

              {verifyError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{verifyError}</span>
                </div>
              )}

              {resendNotice && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  <span>{resendNotice}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-2xl font-mono py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-2xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span>💡 Testing mode: Code is <strong>123456</strong></span>
                  <button
                    type="button"
                    onClick={handleQuickVerifyDemo}
                    className="text-2xs font-bold text-amber-900 dark:text-amber-200 underline ml-2"
                  >
                    Quick Verify
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify Email & Continue</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCw size={12} />
                    <span>Resend Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="text-secondary hover:text-primary font-medium"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: CANDIDATE PROFILE & EXPERIENCE CUSTOMIZATION */}
          {/* ============================================================== */}
          {step === 'profile' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                  Step 2 of 2 • Personalization
                </span>
                <h2 className="text-xl font-bold text-primary mt-1">
                  Customize Your Learning Track
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  We tailor your daily Salesforce release lessons and scenario challenges to your exact role & experience level.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Zahed Ali"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* 2. Domain / Technology */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Primary Domain / Technology
                  </label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value as Technology)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="salesforce">Salesforce Ecosystem (Winter '25 & Spring '25)</option>
                    <option value="aws">AWS Cloud Architecture</option>
                    <option value="javascript">Full Stack Web (React / Node)</option>
                    <option value="devops">DevOps & Cloud Engineering</option>
                    <option value="python">Python & AI Engineering</option>
                  </select>
                </div>

                {/* 3. Role */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Your Role in the Ecosystem
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="salesforce_dev">Salesforce Developer (Apex, LWC, Integrations, Cursors)</option>
                    <option value="salesforce_admin">Salesforce Administrator (Flows, UAP, Security, Access)</option>
                    <option value="salesforce_arch">Technical Architect (High Volume, Vector Search, Pub/Sub)</option>
                    <option value="salesforce_lead">Team Lead / Senior Specialist</option>
                    <option value="salesforce_consult">Salesforce Consultant / Business Analyst</option>
                    <option value="salesforce_fresher">Fresher / Trainee (Foundations, Bulkification, Lifecycles)</option>
                  </select>
                </div>

                {/* 4. Experience Level */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'fresher', label: 'Fresher (0–1 yr)' },
                      { id: '0-2', label: 'Junior (1–3 yrs)' },
                      { id: '2-5', label: 'Mid (3–5 yrs)' },
                      { id: '5-8', label: 'Senior (5–8 yrs)' },
                      { id: '8+', label: 'Architect (8+ yrs)' },
                    ].map((exp) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => setSelectedExp(exp.id as Experience)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                          selectedExp === exp.id
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 text-secondary'
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Daily Commitment & Goal */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Daily Time Budget
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value) as Duration)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value={3}>3 min / day (Quick)</option>
                      <option value={5}>5 min / day (Standard)</option>
                      <option value={10}>10 min / day (Deep Dive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Primary Goal
                    </label>
                    <select
                      value={selectedGoal}
                      onChange={(e) => setSelectedGoal(e.target.value as Goal)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="stay_updated">Stay Updated</option>
                      <option value="prepare_interview">Crack Interviews</option>
                      <option value="prepare_cert">Pass Certification</option>
                      <option value="real_projects">Master Hands-on Code</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Complete Setup & Start Learning 🚀</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
