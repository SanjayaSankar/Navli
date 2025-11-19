-- ===================================
-- NAVLI TRAVEL PLANNER - DATABASE SETUP
-- ===================================
-- Run this in Supabase SQL Editor
-- ===================================

-- ============= TABLES =============

-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  trips_count int DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  start_date date,
  end_date date,
  status text CHECK (status IN ('Upcoming', 'Completed', 'Draft')),
  image_url text,
  itinerary_data jsonb,
  preferences jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Saved Itineraries Table (formerly saved_destinations)
CREATE TABLE IF NOT EXISTS public.saved_itineraries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  image_url text,
  itinerary_data jsonb NOT NULL,
  preferences jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ============= INDEXES =============
-- Improve query performance

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_user_id ON public.saved_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_created_at ON public.saved_itineraries(created_at DESC);

-- ============= RLS POLICIES =============

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES POLICIES =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile (important for signup!)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===== TRIPS POLICIES =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;

-- Allow users to view their own trips
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own trips
CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own trips
CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own trips
CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===== SAVED ITINERARIES POLICIES =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view saved" ON public.saved_itineraries;
DROP POLICY IF EXISTS "Users can insert saved" ON public.saved_itineraries;
DROP POLICY IF EXISTS "Users can delete saved" ON public.saved_itineraries;
DROP POLICY IF EXISTS "Users can update saved" ON public.saved_itineraries;

-- Allow users to view their saved itineraries
CREATE POLICY "Users can view saved" ON public.saved_itineraries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert saved itineraries
CREATE POLICY "Users can insert saved" ON public.saved_itineraries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update saved itineraries
CREATE POLICY "Users can update saved" ON public.saved_itineraries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete saved itineraries
CREATE POLICY "Users can delete saved" ON public.saved_itineraries
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============= FUNCTIONS =============
-- Optional: Auto-create profile on signup

-- Drop function if exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= GRANT PERMISSIONS =============

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.trips TO authenticated;
GRANT ALL ON public.saved_itineraries TO authenticated;

-- ============= VERIFICATION =============
-- Run these queries to verify setup

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- ===================================
-- SETUP COMPLETE!
-- ===================================
-- You should see:
-- - 3 tables created
-- - RLS enabled on all tables
-- - Multiple policies for each table
-- - 1 trigger for auto-creating profiles
-- ===================================
