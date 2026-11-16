import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileStore } from '@/store/profileStore';

// Lazy-loaded screens for code splitting
const TodayScreen   = lazy(() => import('@/screens/Today/TodayScreen'));
const ExploreScreen = lazy(() => import('@/screens/Explore/ExploreScreen'));
const DetailScreen  = lazy(() => import('@/screens/Explore/DetailScreen'));
const LearnScreen   = lazy(() => import('@/screens/Learn/LearnScreen'));
const ReviseScreen  = lazy(() => import('@/screens/Revise/ReviseScreen'));
const MeScreen      = lazy(() => import('@/screens/Me/MeScreen'));
const AuthScreen    = lazy(() => import('@/screens/Auth/AuthScreen'));

// Lazy-loaded Onboarding screens
const WelcomeScreen        = lazy(() => import('@/screens/Onboarding/WelcomeScreen'));
const TechnologyScreen     = lazy(() => import('@/screens/Onboarding/TechnologyScreen'));
const RoleExperienceScreen = lazy(() => import('@/screens/Onboarding/RoleExperienceScreen'));
const GoalsScreen          = lazy(() => import('@/screens/Onboarding/GoalsScreen'));
const InterestsScreen      = lazy(() => import('@/screens/Onboarding/InterestsScreen'));
const PreferenceScreen     = lazy(() => import('@/screens/Onboarding/PreferenceScreen'));
const SummaryScreen        = lazy(() => import('@/screens/Onboarding/SummaryScreen'));

// Simple loading fallback
function ScreenLoader() {
  return (
    <div className="p-4 space-y-4 pb-safe" aria-busy="true" aria-label="Loading screen">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

// Routes root based on whether visitor is a new candidate or verified user
function MainRoute() {
  const { user } = useAuth();
  const profile = useProfileStore();

  const isCandidateReady = Boolean(
    user &&
    user.emailVerified &&
    profile.onboardingCompleted &&
    profile.name &&
    profile.name !== 'Learner' &&
    profile.name !== 'Rahul'
  );

  // If first-time user without completed verified profile, direct to Sign Up & Personalization
  if (!isCandidateReady) {
    return <AuthScreen />;
  }

  return <TodayScreen />;
}

export default function AppRouter() {
  // Lazy load admin screen (only in dev or when enabled)
  const GenerationScreen = lazy(() => import('@/screens/Admin/GenerationScreen'));
  const AdminAnalyticsScreen = lazy(() => import('@/screens/Admin/AdminAnalyticsScreen'));

  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<ScreenLoader />}>
          <Routes>
            {/* Protected Admin routes */}
            <Route
              path="/admin/generation"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <GenerationScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminAnalyticsScreen />
                </ProtectedRoute>
              }
            />

            {/* Auth / Sign Up / Verification / Profile Setup */}
            <Route path="/auth" element={<AuthScreen />} />

            {/* Legacy 6-step Onboarding routes */}
            <Route path="/onboarding"             element={<WelcomeScreen />} />
            <Route path="/onboarding/technology"  element={<TechnologyScreen />} />
            <Route path="/onboarding/role"        element={<RoleExperienceScreen />} />
            <Route path="/onboarding/goals"       element={<GoalsScreen />} />
            <Route path="/onboarding/interests"   element={<InterestsScreen />} />
            <Route path="/onboarding/preference"  element={<PreferenceScreen />} />
            <Route path="/onboarding/summary"     element={<SummaryScreen />} />

            <Route path="/"        element={<MainRoute />} />
            <Route path="/explore" element={<ExploreScreen />} />
            <Route path="/explore/:id" element={<DetailScreen />} />
            <Route path="/learn"   element={<LearnScreen />}   />
            <Route path="/revise"  element={<ReviseScreen />}  />
            <Route path="/me"      element={<MeScreen />}      />

            {/* Catch-all: redirect to home */}
            <Route path="*"        element={<MainRoute />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}
