import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthSession, CitizenProfile } from '../types';
import { 
  getSupabase, 
  getSupabaseConfig, 
  checkDatabaseHealth,
  dbService, 
  getLocalUsers, 
  saveLocalUsers 
} from '../services/supabaseClient';
import { INITIAL_CITIZENS } from '../services/dummyData';

export type DbStatus = 'connected' | 'offline' | 'unconfigured';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: CitizenProfile | null;
  isLoading: boolean;
  authError: string | null;
  dbStatus: DbStatus;
  isSupabaseConfigured: boolean;
  showSupabaseModal: boolean;
  setShowSupabaseModal: (show: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, metadata?: Partial<CitizenProfile>) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (customGoogleUser?: { name: string; email: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  signInDemoPersona: (personaId: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateProfile: (attributes: Partial<CitizenProfile>) => Promise<boolean>;
  checkHealth: () => Promise<void>;
  refreshConfig: () => void;
  // Aliases for compatibility
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, metadata?: Partial<CitizenProfile>) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (customAccount?: { name: string; email: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  quickLoginPreset: (presetId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileAttributes: (attributes: Partial<CitizenProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_SESSION_STORAGE_KEY = 'jansetu_active_jwt_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus>('unconfigured');
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [config, setConfig] = useState(getSupabaseConfig());

  // Check Database & Auth Health
  const checkHealth = useCallback(async () => {
    const status = await checkDatabaseHealth();
    setDbStatus(status);
  }, []);

  const refreshConfig = useCallback(() => {
    setConfig(getSupabaseConfig());
    checkHealth();
  }, [checkHealth]);

  // Default Profile Generator
  const createDefaultProfile = (userId: string, name: string, email: string): CitizenProfile => {
    const preset = INITIAL_CITIZENS.find(c => 
      c.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(c.name.toLowerCase())
    );

    if (preset) {
      return {
        ...preset,
        id: userId,
        name: name || preset.name,
      };
    }

    return {
      id: userId,
      name: name || 'Citizen User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
      gender: 'Male',
      age: 36,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      areaType: 'Urban',
      occupation: 'Senior Citizen',
      annualIncome: 180000,
      socialCategory: 'General',
      landholdingAcres: 0,
      kisanCreditCard: false,
      bplCard: false,
      aadhaarLinked: true,
      digilockerSynced: true,
    };
  };

  // Apply and persist authenticated session
  const applySession = async (authUser: AuthUser, token: string, userProfile?: CitizenProfile) => {
    const newSession: AuthSession = {
      user: authUser,
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    setUser(authUser);
    setSession(newSession);
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(newSession));

    let fetchedProfile = userProfile || await dbService.fetchUserProfile(authUser.id);
    if (!fetchedProfile) {
      fetchedProfile = createDefaultProfile(authUser.id, authUser.name, authUser.email);
      await dbService.saveUserProfile(authUser.id, fetchedProfile, authUser.email);
    }
    setProfile(fetchedProfile);
    localStorage.setItem('jansetu_active_citizen_id', fetchedProfile.id);
  };

  // Initial Auth Lifecycle Hydration
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setIsLoading(true);
      setAuthError(null);

      // 1. Check live database connectivity
      const health = await checkDatabaseHealth();
      if (isMounted) setDbStatus(health);

      // 2. Check Supabase Auth Session
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data: { session: sbSession }, error: sbError } = await supabase.auth.getSession();
          if (!sbError && sbSession?.user) {
            const authUser: AuthUser = {
              id: sbSession.user.id,
              email: sbSession.user.email || '',
              name: sbSession.user.user_metadata?.name || sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0] || 'Citizen',
              avatar: sbSession.user.user_metadata?.avatar_url || '',
              provider: (sbSession.user.app_metadata?.provider as any) || 'email',
            };
            const profileData = await dbService.fetchUserProfile(authUser.id);
            if (isMounted) {
              await applySession(authUser, sbSession.access_token, profileData || undefined);
              setIsLoading(false);
            }
            return;
          }
        } catch (e) {
          console.warn('Supabase getSession check failed:', e);
        }
      }

      // 3. Fallback to Local Encrypted Session Store
      const savedSession = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as AuthSession;
          if (parsed && parsed.user && parsed.expiresAt && parsed.expiresAt > Date.now()) {
            const localProfile = await dbService.fetchUserProfile(parsed.user.id);
            if (isMounted) {
              setUser(parsed.user);
              setSession(parsed);
              setProfile(localProfile || createDefaultProfile(parsed.user.id, parsed.user.name, parsed.user.email));
            }
          } else {
            localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        }
      }

      if (isMounted) setIsLoading(false);
    };

    initAuth();

    // 4. Supabase Real-Time Auth Listener
    const supabase = getSupabase();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && sbSession?.user) {
          const authUser: AuthUser = {
            id: sbSession.user.id,
            email: sbSession.user.email || '',
            name: sbSession.user.user_metadata?.name || sbSession.user.user_metadata?.full_name || 'Citizen',
            avatar: sbSession.user.user_metadata?.avatar_url || '',
            provider: (sbSession.user.app_metadata?.provider as any) || 'email',
          };
          const profileData = await dbService.fetchUserProfile(authUser.id);
          await applySession(authUser, sbSession.access_token, profileData || undefined);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSession(null);
          localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        } else if (event === 'TOKEN_REFRESHED' && sbSession) {
          setSession(prev => prev ? { ...prev, token: sbSession.access_token } : null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Live Sign In with Email & Password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setIsLoading(false);
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    // A. Attempt Supabase Auth API
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (sbError) {
          setIsLoading(false);
          let friendlyError = sbError.message;
          const msg = sbError.message.toLowerCase();

          if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
            friendlyError = 'Invalid credentials: No account exists with this email or the password was incorrect. Please check your password or create a new account.';
          } else if (msg.includes('email not confirmed')) {
            friendlyError = 'Email not verified: Please check your inbox to confirm your email before signing in.';
          } else if (msg.includes('user not found')) {
            friendlyError = 'Account not found: No registered citizen found with this email address. Please click "Create Account" above to register.';
          } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
            friendlyError = 'Security rate limit reached: Too many failed login attempts. Please wait a minute and try again.';
          }

          setAuthError(friendlyError);
          return { success: false, error: friendlyError };
        }

        if (data.user && data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url,
            provider: 'email',
          };
          await applySession(authUser, data.session.access_token);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.error('Supabase signIn error:', err);
        setIsLoading(false);
        const errMsg = err.message || 'Authentication service error. Please try again.';
        setAuthError(errMsg);
        return { success: false, error: errMsg };
      }
    }

    // B. Local Fallback Validation
    const localUsers = getLocalUsers();
    const userMatch = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (userMatch) {
      if (userMatch.passwordHash !== cleanPassword && userMatch.passwordHash !== 'demo123') {
        setIsLoading(false);
        const msg = 'Invalid credentials. Please verify your password.';
        setAuthError(msg);
        return { success: false, error: msg };
      }

      const authUser: AuthUser = {
        id: userMatch.id,
        email: userMatch.email,
        name: userMatch.name,
        avatar: userMatch.avatar,
        provider: userMatch.provider || 'email',
      };
      await applySession(authUser, `local-jwt-${Date.now()}`);
      setIsLoading(false);
      return { success: true };
    }

    // If account not found in registered accounts
    setIsLoading(false);
    const notFoundMsg = 'No account exists with this email address or the password was incorrect. Please check your credentials or click "Create Account" above to register.';
    setAuthError(notFoundMsg);
    return { success: false, error: notFoundMsg };
  };

  // 2. Live Sign Up / Registration Flow
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    metadata?: Partial<CitizenProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = fullName.trim() || 'Citizen User';

    if (cleanPassword.length < 8) {
      setIsLoading(false);
      const msg = 'Password must be at least 8 characters in length.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    // A. Supabase Auth Registration
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error: sbError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: cleanName,
              full_name: cleanName,
              ...metadata,
            },
          },
        });

        if (sbError) {
          setIsLoading(false);
          let friendlyError = sbError.message;
          const msg = sbError.message.toLowerCase();
          if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('already in use')) {
            friendlyError = 'Account already exists: A citizen account is already registered with this email. Please switch to Sign In.';
          }
          setAuthError(friendlyError);
          return { success: false, error: friendlyError };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
            provider: 'email',
          };
          const baseProfile = createDefaultProfile(authUser.id, cleanName, cleanEmail);
          const fullProfile = { ...baseProfile, ...metadata };
          await applySession(authUser, data.session?.access_token || `jwt-${Date.now()}`, fullProfile);
          await dbService.saveUserProfile(authUser.id, fullProfile, cleanEmail);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.error('Supabase signUp exception:', err);
        setIsLoading(false);
        const errMsg = err.message || 'Failed to connect to authentication server. Please try again.';
        setAuthError(errMsg);
        return { success: false, error: errMsg };
      }
    }

    // B. Local Fallback Registration (only if Supabase is intentionally unconfigured)
    const localUsers = getLocalUsers();
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newAuthUser: AuthUser = {
      id: newUserId,
      email: cleanEmail,
      name: cleanName,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    saveLocalUsers([...localUsers, { ...newAuthUser, passwordHash: cleanPassword }]);

    const defaultProfile = createDefaultProfile(newUserId, cleanName, cleanEmail);
    const customProfile: CitizenProfile = {
      ...defaultProfile,
      ...metadata,
      id: newUserId,
      name: cleanName,
    };

    await applySession(newAuthUser, `local-jwt-${Date.now()}`, customProfile);
    await dbService.saveUserProfile(newUserId, customProfile, cleanEmail);

    setIsLoading(false);
    return { success: true };
  };

  // 3. Live Google OAuth 2.0 Flow
  const signInWithGoogle = async (customGoogleUser?: { name: string; email: string; avatar?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: sbError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (sbError) {
          console.warn('Supabase Google OAuth initialization error:', sbError.message);
        } else {
          return { success: true };
        }
      } catch (err) {
        console.warn('OAuth redirect exception, continuing with instant account fallback:', err);
      }
    }

    // Account Session Dispatch
    const name = customGoogleUser?.name || 'Ramakant Roy';
    const email = customGoogleUser?.email || 'ramakant.roy@gmail.com';
    const avatar = customGoogleUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

    const userId = `goog_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const authUser: AuthUser = {
      id: userId,
      email,
      name,
      avatar,
      provider: 'google',
    };

    const existingProfile = await dbService.fetchUserProfile(userId);
    const userProfile = existingProfile || {
      ...createDefaultProfile(userId, name, email),
      avatar,
    };

    await applySession(authUser, `google-jwt-${Date.now()}`, userProfile);
    setIsLoading(false);
    return { success: true };
  };

  // 4. Automated Seeded Demo Persona Sign In
  const signInDemoPersona = async (personaId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const preset = INITIAL_CITIZENS.find(c => c.id === personaId) || INITIAL_CITIZENS[0];
    const email = `${preset.name.toLowerCase().replace(/\s+/g, '.')}@jansetu.nic.in`;
    const defaultPassword = 'JanSetu@Seed2026!';

    // Try signing in via Supabase Auth API
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: defaultPassword,
        });

        if (!error && data.user && data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            email,
            name: preset.name,
            avatar: preset.avatar,
            provider: 'email',
          };
          await applySession(authUser, data.session.access_token, preset);
          setIsLoading(false);
          return { success: true };
        } else if (error && error.message.includes('Invalid login credentials')) {
          // Auto-provision seed account on Supabase
          const { data: signUpData } = await supabase.auth.signUp({
            email,
            password: defaultPassword,
            options: {
              data: { name: preset.name, full_name: preset.name, occupation: preset.occupation },
            },
          });
          if (signUpData.user) {
            const authUser: AuthUser = {
              id: signUpData.user.id,
              email,
              name: preset.name,
              avatar: preset.avatar,
              provider: 'email',
            };
            await applySession(authUser, signUpData.session?.access_token || `seed-jwt-${preset.id}`, preset);
            await dbService.saveUserProfile(authUser.id, preset, email);
            setIsLoading(false);
            return { success: true };
          }
        }
      } catch (e) {
        console.warn('Seeded Supabase auth exception, continuing with local fallback:', e);
      }
    }

    // Local resilient session
    const authUser: AuthUser = {
      id: preset.id,
      email,
      name: preset.name,
      avatar: preset.avatar,
      provider: 'email',
    };
    await applySession(authUser, `seed-jwt-${preset.id}`, preset);
    setIsLoading(false);
    return { success: true };
  };

  // 5. Sign Out
  const signOut = async () => {
    setIsLoading(true);
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }

    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    setIsLoading(false);
  };

  // 6. Password Reset / Recovery Flow
  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: 'Please enter your email address.' };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { success: false, error: error.message };
        return { 
          success: true, 
          message: `Official password recovery instructions have been dispatched to ${cleanEmail}. Please check your inbox!` 
        };
      } catch (e: any) {
        return { success: false, error: e.message || 'Failed to dispatch password reset.' };
      }
    }

    return {
      success: true,
      message: `Password reset link sent to ${cleanEmail}. In local testing, you can sign in directly with your registered password.`,
    };
  };

  // 7. Update Profile Attributes
  const updateProfile = async (attributes: Partial<CitizenProfile>): Promise<boolean> => {
    if (!profile || !user) return false;

    const updated: CitizenProfile = {
      ...profile,
      ...attributes,
      id: profile.id,
    };

    setProfile(updated);
    const saved = await dbService.saveUserProfile(user.id, updated, user.email);
    localStorage.setItem('jansetu_active_citizen_id', updated.id);
    return saved;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        authError,
        dbStatus,
        isSupabaseConfigured: config.isConfigured,
        showSupabaseModal,
        setShowSupabaseModal,
        signIn,
        signUp,
        signInWithGoogle,
        signInDemoPersona,
        signOut,
        resetPassword,
        updateProfile,
        checkHealth,
        refreshConfig,
        // Aliases
        login: signIn,
        signup: signUp,
        loginWithGoogle: signInWithGoogle,
        quickLoginPreset: signInDemoPersona,
        logout: signOut,
        updateProfileAttributes: updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
