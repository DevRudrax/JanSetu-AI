import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { Landmark, ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, isLoading } = useAuth();

  // Loading State with GovTech Branding Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary font-black text-2xl shadow-xl shadow-primary/25 animate-pulse">
            JS
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-background shadow">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-base font-extrabold text-on-surface tracking-tight">JanSetu AI Governance Gateway</h2>
          <p className="text-xs text-on-surface-variant font-medium">Verifying cryptographic session & citizen credentials...</p>
        </div>

        <div className="w-48 h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }

  // Unauthenticated -> Render Auth Gateway
  if (!user && !session) {
    return <LoginPage />;
  }

  // Authenticated -> Render Application Content
  return <>{children}</>;
};
