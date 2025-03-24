-- NOTE: This is a sample seed script. In production, you would not insert real user data directly.
-- This script assumes you have already created a user with the specified UUID through the Supabase auth system.

-- Insert test bookings (replace 'your-user-id-here' with the actual user id)
INSERT INTO bookings
(id, user_id, from_city, to_city, date, train, train_number, seats, status, pnr, fare, class_type)
VALUES
-- Confirmed upcoming booking
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
),
-- Waiting list upcoming booking
(
  uuid_generate_v4(),
  'your-user-id-here',
  'Kolkata',
  'Chennai',
  CURRENT_DATE + INTERVAL '15 days',
  'Howrah Mail',
  '12839',
  '1 (S7, 54)',
  'Waiting List (WL3)',
  'PNR8645271903',
  1450.00,
  'SL'
),
-- Past booking
(
  uuid_generate_v4(),
  'your-user-id-here',
  'Bangalore',
  'Hyderabad',
  CURRENT_DATE - INTERVAL '15 days',
  'Bengaluru Express',
  '12785',
  '3 (B2, 23, 24, 25)',
  'Confirmed',
  'PNR1257843690',
  3200.00,
  '2A'
),
-- Cancelled booking
(
  uuid_generate_v4(),
  'your-user-id-here',
  'Jaipur',
  'Ahmedabad',
  CURRENT_DATE + INTERVAL '5 days',
  'Jaipur Express',
  '12956',
  '2 (B1, 34, 35)',
  'Cancelled',
  'PNR9876543210',
  1850.00,
  'SL'
);

-- You can add more test data as needed
