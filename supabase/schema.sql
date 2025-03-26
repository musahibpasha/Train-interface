-- This file contains the SQL schema that should be applied to your Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- First, drop and recreate the bookings table to ensure clean schema
DROP TABLE IF EXISTS public.bookings CASCADE;

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    train_id UUID REFERENCES public.trains(id),
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    date DATE NOT NULL,
    train TEXT NOT NULL,
    train_number TEXT NOT NULL,
    seats TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    pnr TEXT,
    fare DECIMAL(10,2) NOT NULL,
    class_type TEXT NOT NULL,
    seat_count INTEGER,
    total_price DECIMAL(10,2),
    passenger_name TEXT,
    passenger_email TEXT,
    passenger_phone TEXT,
    passenger_address TEXT,
    booking_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Add status constraint
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_train_id ON public.bookings(train_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Create booking view
CREATE OR REPLACE VIEW public.booking_details AS
SELECT 
    b.*,
    t.name as train_name,
    t.from_station,
    t.to_station,
    t.departure_time,
    t.arrival_time
FROM public.bookings b
LEFT JOIN public.trains t ON b.train_id = t.id;

-- Create update trigger
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Create trigger for profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Add sample data for testing
INSERT INTO bookings (
  user_id,
  from_city,
  to_city,
  date,
  train,
  train_number,
  seats,
  status,
  pnr,
  fare,
  class_type
) VALUES
-- This is a placeholder. Replace auth.uid() with the actual user ID once created.
-- You can run this part manually after creating your account:

(
  INSERT INTO bookings (
    user_id,
    from_city,
    to_city,
    date,
    train,
    train_number,
    seats,
    status,
    pnr,
    fare,
    class_type
  ) VALUES
  (
    '8f9b6542-a913-4a65-91e2-e0293ec1b8a4', -- Your specific UUID
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
);

-- Example booking insertion with new fields
INSERT INTO bookings (
  user_id,
  train_id,
  seat_count,
  total_price,
  passenger_name,
  passenger_email,
  passenger_phone,
  passenger_address,
  booking_date,
  status
) VALUES (
  '8f9b6542-a913-4a65-91e2-e0293ec1b8a4', -- Your specific UUID
  (SELECT id FROM trains WHERE train_number = '730c0878-3e3a-4160-aeff-25eaddc301a9' LIMIT 1), -- Get train_id from trains table
  2,
  2750.00,
  'John Doe',
  'john.doe@example.com',
  '+1234567890',
  '123 Main St, City',
  NOW(),
  'confirmed'
);

-- Refresh the schema cache
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

