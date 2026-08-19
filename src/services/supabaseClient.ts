import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CitizenProfile, AuthUser, SupabaseConfig } from '../types';
import { INITIAL_CITIZENS } from './dummyData';

// Default production Supabase cloud project
const DEFAULT_SUPABASE_URL = 'https://ubxbbnnxhdsyttyagmix.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieGJibm54aGRzeXR0eWFnbWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI5NTEsImV4cCI6MjEwMjY0ODk1MX0.tKKQzSLxw-rWOxaLY8A2ul-z8_eMsQ8OJ1NcNCGu-Lc';

// Dynamic Supabase configuration retrieval (from .env, hardcoded production fallback, or custom settings)
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;
  const customUrl = localStorage.getItem('jansetu_supabase_url') || '';
  const customKey = localStorage.getItem('jansetu_supabase_anon_key') || '';

  const url = customUrl.trim() || envUrl.trim();
  const anonKey = customKey.trim() || envKey.trim();

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') && 
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
};

// Singleton Supabase Client instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client instance:', err);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
};

// Save Supabase credentials dynamically
export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (url) localStorage.setItem('jansetu_supabase_url', url.trim());
  else localStorage.removeItem('jansetu_supabase_url');

  if (anonKey) localStorage.setItem('jansetu_supabase_anon_key', anonKey.trim());
  else localStorage.removeItem('jansetu_supabase_anon_key');

  supabaseInstance = null; // reset instance
  return getSupabaseConfig();
};

// Real Database Health Check Ping
export const checkDatabaseHealth = async (): Promise<'connected' | 'offline' | 'unconfigured'> => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return 'unconfigured';

  const supabase = getSupabase();
  if (!supabase) return 'unconfigured';

  try {
    const { error, status } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error && status !== 200 && status !== 206) {
      // If table doesn't exist yet or auth issue, still reachable if status is not network error
      if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist')) {
        return 'connected'; // connected to Supabase DB, but table needs creation
      }
      console.warn('Supabase DB ping warning:', error.message);
      return 'offline';
    }
    return 'connected';
  } catch (err) {
    console.error('Supabase DB health check error:', err);
    return 'offline';
  }
};

// Data Transformers
export const profileToDbRow = (profile: CitizenProfile, email?: string) => ({
  id: profile.id,
  email: email || `${profile.name.toLowerCase().replace(/\s+/g, '.')}@jansetu.nic.in`,
  name: profile.name,
  avatar: profile.avatar || '',
  gender: profile.gender || 'Male',
  age: profile.age || 35,
  state: profile.state,
  district: profile.district,
  area_type: profile.areaType,
  occupation: profile.occupation,
  annual_income: profile.annualIncome,
  social_category: profile.socialCategory,
  landholding_acres: profile.landholdingAcres,
  kisan_credit_card: profile.kisanCreditCard,
  bpl_card: profile.bplCard,
  aadhaar_linked: profile.aadhaarLinked,
  digilocker_synced: profile.digilockerSynced,
  updated_at: new Date().toISOString(),
});

export const dbRowToProfile = (row: any): CitizenProfile => ({
  id: row.id,
  name: row.name || 'Citizen User',
  avatar: row.avatar || '',
  gender: row.gender || 'Male',
  age: row.age || 35,
  state: row.state || 'Uttar Pradesh',
  district: row.district || 'Varanasi',
  areaType: row.area_type || 'Urban',
  occupation: row.occupation || 'Senior Citizen',
  annualIncome: Number(row.annual_income) || 180000,
  socialCategory: row.social_category || 'General',
  landholdingAcres: Number(row.landholding_acres) || 0,
  kisanCreditCard: Boolean(row.kisan_credit_card),
  bplCard: Boolean(row.bpl_card),
  aadhaarLinked: row.aadhaar_linked !== undefined ? Boolean(row.aadhaar_linked) : true,
  digilockerSynced: row.digilocker_synced !== undefined ? Boolean(row.digilocker_synced) : true,
});

// Local Fallback Storage Helpers for resilience
const LOCAL_USERS_KEY = 'jansetu_auth_local_users';
const LOCAL_PROFILES_KEY = 'jansetu_auth_local_profiles';

export const getLocalUsers = (): Array<AuthUser & { passwordHash: string }> => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveLocalUsers = (users: Array<AuthUser & { passwordHash: string }>) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

export const getLocalProfiles = (): Record<string, CitizenProfile> => {
  const data = localStorage.getItem(LOCAL_PROFILES_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

export const saveLocalProfile = (userId: string, profile: CitizenProfile) => {
  const all = getLocalProfiles();
  all[userId] = profile;
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(all));
};

// Database API Service
export const dbService = {
  async fetchUserProfile(userId: string): Promise<CitizenProfile | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return dbRowToProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile from Supabase profiles table:', err);
      }
    }

    const local = getLocalProfiles();
    return local[userId] || null;
  },

  async saveUserProfile(userId: string, profile: CitizenProfile, email?: string): Promise<boolean> {
    saveLocalProfile(userId, profile);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbRow = profileToDbRow({ ...profile, id: userId }, email);
        const { error } = await supabase
          .from('profiles')
          .upsert(dbRow, { onConflict: 'id' });

        if (error) {
          console.error('Supabase profile upsert error:', error.message);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Supabase saveUserProfile error:', err);
        return false;
      }
    }
    return true;
  },
};
