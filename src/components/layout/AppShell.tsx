import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from '@/components/common/BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {isAdminRoute ? (
        <main id="main-content" className="w-full">
          {children}
        </main>
      ) : (
        <>
          {/* Centered mobile-app content wrapper */}
          <main id="main-content" className="flex justify-center px-4 py-4 pb-24">
            <div className="w-full max-w-md">
              {/* Screen content */}
              <div className="animate-fade-in">{children}</div>
            </div>
          </main>

          {/* Bottom navigation – persistent mobile menu bar across all views */}
          <BottomNav />
        </>
      )}
    </div>
  );
}
