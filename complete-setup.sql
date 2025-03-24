/*
  # Complete Train Booking System Setup

  This script combines all the necessary setup for the train booking system:
  1. Creates profiles table with triggers for new users
  2. Creates trains and bookings tables
  3. Sets up Row Level Security (RLS) for all tables
  4. Adds sample train data for testing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES SETUP ----------------------------------------------------------

-- Create profiles table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "New users can insert their profile" ON profiles;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "New users can insert their profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create functions to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. TRAINS SETUP ------------------------------------------------------------

-- Create trains table
CREATE TABLE IF NOT EXISTS public.trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  train_number TEXT NOT NULL,
  class_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS SETUP ----------------------------------------------------------

-- Create or modify the bookings table with passenger information
DO $$
BEGIN
  -- Check if bookings table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    -- Table exists, check if columns need to be added
    BEGIN
      -- Add columns if they don't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'train_id') THEN
        ALTER TABLE public.bookings ADD COLUMN train_id UUID REFERENCES public.trains;
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'booking_date') THEN
        ALTER TABLE public.bookings ADD COLUMN booking_date TIMESTAMPTZ DEFAULT NOW();
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'seat_count') THEN
        ALTER TABLE public.bookings ADD COLUMN seat_count INTEGER;
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'total_price') THEN
        ALTER TABLE public.bookings ADD COLUMN total_price DECIMAL;
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'passenger_name') THEN
        ALTER TABLE public.bookings ADD COLUMN passenger_name TEXT;
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'passenger_email') THEN
        ALTER TABLE public.bookings ADD COLUMN passenger_email TEXT;
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'passenger_phone') THEN
        ALTER TABLE public.bookings ADD COLUMN passenger_phone TEXT;
      END IF;

      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'passenger_address') THEN
        ALTER TABLE public.bookings ADD COLUMN passenger_address TEXT;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns: %', SQLERRM;
    END;
  ELSE
    -- Create new bookings table with all columns
    CREATE TABLE public.bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users NOT NULL,
      train_id UUID REFERENCES public.trains,
      booking_date TIMESTAMPTZ DEFAULT NOW(),
      seat_count INTEGER NOT NULL,
      total_price DECIMAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      passenger_name TEXT,
      passenger_email TEXT,
      passenger_phone TEXT,
      passenger_address TEXT,
      from_city TEXT,
      to_city TEXT,
      date DATE,
      train TEXT,
      train_number TEXT,
      seats TEXT,
      pnr TEXT,
      fare DECIMAL,
      class_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- 4. SECURITY SETUP ----------------------------------------------------------

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view trains" ON public.trains;
  DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Anyone can view trains"
  ON public.trains
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. UTILITY FUNCTIONS -------------------------------------------------------

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookings
DROP TRIGGER IF EXISTS set_bookings_updated_at ON bookings;
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Create trigger for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 6. SAMPLE DATA -------------------------------------------------------------

-- Add sample train data (only if table is empty)
INSERT INTO public.trains (name, from_station, to_station, departure_time, arrival_time, total_seats, available_seats, price, train_number, class_type)
SELECT
  'Rajdhani Express',
  'Delhi',
  'Mumbai',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 8 hours',
  120,
  75,
  2750.00,
  '12952',
  '3A'
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE train_number = '12952' AND from_station = 'Delhi' AND to_station = 'Mumbai');

INSERT INTO public.trains (name, from_station, to_station, departure_time, arrival_time, total_seats, available_seats, price, train_number, class_type)
SELECT
  'Shatabdi Express',
  'Bangalore',
  'Chennai',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days 6 hours',
  160,
  100,
  1850.00,
  '12007',
  '2A'
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE train_number = '12007' AND from_station = 'Bangalore' AND to_station = 'Chennai');

INSERT INTO public.trains (name, from_station, to_station, departure_time, arrival_time, total_seats, available_seats, price, train_number, class_type)
SELECT
  'Duronto Express',
  'Howrah',
  'New Delhi',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days 16 hours',
  180,
  120,
  3200.00,
  '12273',
  '2A'
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE train_number = '12273' AND from_station = 'Howrah' AND to_station = 'New Delhi');

INSERT INTO public.trains (name, from_station, to_station, departure_time, arrival_time, total_seats, available_seats, price, train_number, class_type)
SELECT
  'Vande Bharat Express',
  'Mumbai',
  'Ahmedabad',
  NOW() + INTERVAL '4 days',
  NOW() + INTERVAL '4 days 5 hours',
  200,
  150,
  1950.00,
  '22901',
  'CC'
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE train_number = '22901' AND from_station = 'Mumbai' AND to_station = 'Ahmedabad');

INSERT INTO public.trains (name, from_station, to_station, departure_time, arrival_time, total_seats, available_seats, price, train_number, class_type)
SELECT
  'Garib Rath Express',
  'Delhi',
  'Patna',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days 10 hours',
  300,
  200,
  1350.00,
  '12203',
  '3A'
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE train_number = '12203' AND from_station = 'Delhi' AND to_station = 'Patna');

-- Notice: You can add sample bookings by replacing 'your-user-id-here' with your user ID after signup
/*
INSERT INTO bookings
(id, user_id, from_city, to_city, date, train, train_number, seats, status, pnr, fare, class_type)
VALUES
(
  uuid_generate_v4(),
  'your-user-id-here',
  'Delhi',
  'Mumbai',
  CURRENT_DATE + INTERVAL '7 days',
  'Rajdhani Express',
  '12952',
  '2 (A3, 12, 13)',
  'Confirmed',
  'PNR4523627189',
  2750.00,
  '3A'
);
*/
