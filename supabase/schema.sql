-- ==============================================================================
-- JanSetu AI - Citizen DPI & Governance Portal
-- Supabase Database Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'profiles' Table (Linked to Supabase auth.users)
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

-- 3. Enable Row Level Security (RLS) on 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for 'profiles'
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 5. Create Trigger to Automatically Insert Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        name,
        avatar,
        state,
        district,
        occupation,
        annual_income,
        social_category,
        landholding_acres,
        area_type
    )
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

-- Drop trigger if it already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger to Automatically Update 'updated_at' timestamp
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

-- 7. Additional Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_profiles_state_district ON public.profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON public.profiles(occupation);
