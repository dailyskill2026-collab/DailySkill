import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lazy-loaded screens for code splitting
const TodayScreen   = lazy(() => import('@/screens/Today/TodayScreen'));
const ExploreScreen = lazy(() => import('@/screens/Explore/ExploreScreen'));
const DetailScreen  = lazy(() => import('@/screens/Explore/DetailScreen'));
const LearnScreen   = lazy(() => import('@/screens/Learn/LearnScreen'));
const ReviseScreen  = lazy(() => import('@/screens/Revise/ReviseScreen'));
const MeScreen      = lazy(() => import('@/screens/Me/MeScreen'));

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
            <Route path="/"        element={<TodayScreen />}   />
            <Route path="/explore" element={<ExploreScreen />} />
            <Route path="/explore/:id" element={<DetailScreen />} />
            <Route path="/learn"   element={<LearnScreen />}   />
            <Route path="/revise"  element={<ReviseScreen />}  />
            <Route path="/me"      element={<MeScreen />}      />
            {/* Catch-all: redirect to home */}
            <Route path="*"        element={<TodayScreen />}   />
          </Routes>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}
