/*
  # Train Booking System Database Setup

  This script sets up the complete database schema for the train booking system:
  1. Creates necessary tables (trains, bookings) with proper structure
  2. Enables Row Level Security (RLS) for all tables
  3. Creates appropriate security policies
  4. Adds sample train data for testing
*/

-- Check and create tables using IF NOT EXISTS
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
