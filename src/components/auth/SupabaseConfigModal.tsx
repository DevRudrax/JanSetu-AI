import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveSupabaseCredentials, getSupabaseConfig } from '../../services/supabaseClient';
import { 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  ShieldAlert, 
  Terminal, 
  Server,
  AlertCircle
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- JanSetu AI - Supabase Database Schema & RLS Policies
-- Paste and Run in Supabase SQL Editor
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Citizen User',
    avatar TEXT DEFAULT '',
    gender TEXT DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    age INTEGER DEFAULT 35,
    state TEXT DEFAULT 'Uttar Pradesh',
    district TEXT DEFAULT 'Varanasi',
    area_type TEXT DEFAULT 'Urban' CHECK (area_type IN ('Rural', 'Urban')),
    occupation TEXT DEFAULT 'Senior Citizen' CHECK (occupation IN ('Farmer', 'Student', 'Small Business Owner', 'Senior Citizen', 'Artisan / Worker', 'Healthcare Worker', 'Unemployed', 'Homemaker')),
    annual_income NUMERIC DEFAULT 180000,
    social_category TEXT DEFAULT 'General' CHECK (social_category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
    landholding_acres NUMERIC DEFAULT 0,
    kisan_credit_card BOOLEAN DEFAULT FALSE,
    bpl_card BOOLEAN DEFAULT FALSE,
    aadhaar_linked BOOLEAN DEFAULT TRUE,
    digilocker_synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar, state, district, occupation, annual_income, social_category, landholding_acres, area_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        COALESCE(NEW.raw_user_meta_data->>'state', 'Uttar Pradesh'),
        COALESCE(NEW.raw_user_meta_data->>'district', 'Varanasi'),
        COALESCE(NEW.raw_user_meta_data->>'occupation', 'Senior Citizen'),
        COALESCE((NEW.raw_user_meta_data->>'annual_income')::NUMERIC, 180000),
        COALESCE(NEW.raw_user_meta_data->>'social_category', 'General'),
        COALESCE((NEW.raw_user_meta_data->>'landholding_acres')::NUMERIC, 0),
        COALESCE(NEW.raw_user_meta_data->>'area_type', 'Urban')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_state_district ON public.profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON public.profiles(occupation);`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseConfigured, refreshConfig } = useAuth();
  const currentConfig = getSupabaseConfig();

  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'steps'>('config');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, anonKey);
    refreshConfig();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-border-light rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-light bg-surface-container-low/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-on-surface text-base">Supabase Database & Auth Deployment</h3>
                {isSupabaseConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Local Sandbox Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">Deploy database tables, RLS security rules, and configure live API keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-light bg-surface-container-low/30 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SQL Schema Migration
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'steps'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Setup Guide (3 Steps)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-on-surface">Dual-Mode Architecture</p>
                  <p className="text-on-surface-variant leading-relaxed">
                    You can use JanSetu AI immediately in <strong>Local Sandbox Mode</strong> without any keys. When ready to deploy to Supabase, enter your project credentials below or set <code className="px-1 py-0.5 rounded bg-surface-container font-mono text-[11px]">VITE_SUPABASE_URL</code> in <code className="px-1 py-0.5 rounded bg-surface-container font-mono text-[11px]">.env</code>.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full bg-surface-container-low border border-border-light rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none font-mono"
                />
                <p className="text-[11px] text-on-surface-variant mt-1">Found in Supabase Dashboard → Settings → API</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Supabase Anon (Public) Key
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={e => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-surface-container-low border border-border-light rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none font-mono"
                />
                <p className="text-[11px] text-on-surface-variant mt-1">Safe for client-side use with Row Level Security (RLS)</p>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Credentials saved successfully! Live connection initialized.
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Open Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex gap-2">
                  {(url || anonKey) && (
                    <button
                      type="button"
                      onClick={() => {
                        setUrl('');
                        setAnonKey('');
                        saveSupabaseCredentials('', '');
                        refreshConfig();
                      }}
                      className="px-3 py-2 text-xs font-medium rounded-xl border border-border-light text-on-surface-variant hover:bg-surface-container"
                    >
                      Clear Keys (Use Local)
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-on-surface-variant">
                  Run this SQL in your <strong>Supabase Dashboard → SQL Editor</strong> to create tables, indexes, and RLS security policies.
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-border-light flex items-center gap-1.5 text-on-surface transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
                </button>
              </div>

              <div className="relative rounded-xl border border-border-light bg-slate-950 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-72">
                <pre>{SUPABASE_SCHEMA_SQL}</pre>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4 text-xs">
              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-surface-container-low border border-border-light">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <p className="font-bold text-on-surface">Create a Supabase Project</p>
                  <p className="text-on-surface-variant mt-0.5">Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">supabase.com</a>, log in and click <strong>"New Project"</strong>. Choose your region and set a database password.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-surface-container-low border border-border-light">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <p className="font-bold text-on-surface">Run the SQL Migration</p>
                  <p className="text-on-surface-variant mt-0.5">Go to the <strong>SQL Editor</strong> tab in Supabase, click <strong>"New query"</strong>, paste the schema from the <em>SQL Schema Migration</em> tab above, and click <strong>"Run"</strong>.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-surface-container-low border border-border-light">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <p className="font-bold text-on-surface">Copy API Keys</p>
                  <p className="text-on-surface-variant mt-0.5">Go to <strong>Project Settings → API</strong>. Copy the <strong>Project URL</strong> and <strong>anon public</strong> key, then paste them in the <em>API Credentials</em> tab above or into your <code className="px-1 py-0.5 rounded bg-surface-container font-mono text-[11px]">.env</code> file!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-light bg-surface-container-low/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
