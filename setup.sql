-- Database Setup Script for MakeMyTrip Train Booking Interface
-- This script will create all necessary tables and set up the database schema

-- Enable UUID extension (already enabled in Supabase by default)
-- Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "New users can insert their profile" ON public.profiles;

  -- Create policies
  CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

  CREATE POLICY "New users can insert their profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  date DATE NOT NULL,
  train TEXT NOT NULL,
  train_number TEXT NOT NULL,
  seats TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed', -- Confirmed, Waiting List, Cancelled
  pnr TEXT NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  class_type TEXT NOT NULL, -- 1A, 2A, 3A, SL, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure passenger_address column is added to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS passenger_address TEXT;

-- Enable Row-Level Security on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;

  -- Create policies
  CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create their own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookings
DO $$
BEGIN
  DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
  CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating bookings trigger: %', SQLERRM;
END $$;

-- Create trigger for profiles
DO $$
BEGIN
  DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
  CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profiles trigger: %', SQLERRM;
END $$;

-- Create sample bookings for the current user (if authenticated)
DO $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user's ID
  SELECT auth.uid() INTO current_user_id;

  -- Insert sample bookings if user is authenticated
  IF current_user_id IS NOT NULL THEN
    -- Create user profile if it doesn't exist
    INSERT INTO public.profiles (id, name, email)
    SELECT
      current_user_id,
      COALESCE(
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = current_user_id),
        split_part((SELECT email FROM auth.users WHERE id = current_user_id), '@', 1)
      ),
      (SELECT email FROM auth.users WHERE id = current_user_id)
    WHERE
      NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id);

    -- Create a Delhi to Mumbai booking
    INSERT INTO public.bookings (
      user_id, from_city, to_city, date, train, train_number,
      seats, status, pnr, fare, class_type
    )
    SELECT
      current_user_id,
      'Delhi',
      'Mumbai',
      CURRENT_DATE + INTERVAL '7 days',
      'Rajdhani Express',
      '12952',
      '2 (A3, 12, 13)',
      'Confirmed',
      'PNR' || floor(random() * 9000000000 + 1000000000)::text,
      2750.00,
      '3A'
    WHERE
      NOT EXISTS (
        SELECT 1 FROM public.bookings
        WHERE user_id = current_user_id
        AND from_city = 'Delhi'
        AND to_city = 'Mumbai'
      );

    -- Create a Kolkata to Chennai booking
    INSERT INTO public.bookings (
      user_id, from_city, to_city, date, train, train_number,
      seats, status, pnr, fare, class_type
    )
    SELECT
      current_user_id,
      'Kolkata',
      'Chennai',
      CURRENT_DATE + INTERVAL '15 days',
      'Howrah Mail',
      '12839',
      '1 (S7, 54)',
      'Waiting List (WL3)',
      'PNR' || floor(random() * 9000000000 + 1000000000)::text,
      1450.00,
      'SL'
    WHERE
      NOT EXISTS (
        SELECT 1 FROM public.bookings
        WHERE user_id = current_user_id
        AND from_city = 'Kolkata'
        AND to_city = 'Chennai'
      );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;