import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Use the SERVICE ROLE key server‑side to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Example route: GET /api/cities
app.get('/api/stations', async (_req, res) => {
  // grab all the from/to fields
  const { data: trains, error } = await supabase
    .from('trains')
    .select('from_station, to_station')
  if (error) return res.status(500).json({ error: error.message })

  // dedupe into a Set, then sort
  const stationSet = new Set()
  trains.forEach(({ from_station, to_station }) => {
    if (from_station) stationSet.add(from_station)
    if (to_station)   stationSet.add(to_station)
  })
  const stations = Array.from(stationSet).sort()
  res.json(stations)
})

// GET all trains
app.get('/api/trains', async (_req, res) => {
  const { data, error } = await supabase
    .from('trains')
    .select('*')
    .order('departure_time', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all bookings
app.get('/api/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: true })

  console.log('bookings →', { data, error })  // <-- for debugging

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all user profiles
app.get('/api/profiles', async (_req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/authors
app.get('/api/authors', async (req, res) => {
  const { data, error } = await supabase
    .from('authors')        // ← be sure this matches your actual table name!
    .select('*')
    .order('id', { ascending: true })

  console.log('authors →', { data, error })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

// POST /api/bookings
app.post('/api/bookings', async (req, res) => {
  const booking = req.body
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// Bookings per month (for charts)
app.get('/api/booking-trends', async (_req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('booking_date');
  if (error) return res.status(500).json({ error: error.message });

  // Group by month
  const trends = {};
  data.forEach(({ booking_date }) => {
    const month = booking_date.slice(0, 7); // YYYY-MM
    trends[month] = (trends[month] || 0) + 1;
  });

  // Convert to array sorted by month
  const result = Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  res.json(result);
});

// Destination stats (hotels and bookings count for a city)
app.get('/api/destination-stats', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City parameter is required' });

  // Count hotels in the city
  const { data: hotels, error: hotelsError } = await supabase
    .from('hotels')
    .select('id')
    .eq('city', city);
  if (hotelsError) return res.status(500).json({ error: hotelsError.message });

  const hotelIds = hotels.map(h => h.id);

  // Count bookings for hotels in the city
  let bookingsCount = 0;
  if (hotelIds.length > 0) {
    const { count, error: bookingsError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .in('hotel_id', hotelIds);
    if (bookingsError) return res.status(500).json({ error: bookingsError.message });
    bookingsCount = count;
  }

  res.json({
    hotelsCount: hotels.length,
    bookingsCount: bookingsCount
  });
});

// GET hotel recommendations
app.get('/api/hotel-recommendations', async (req, res) => {
  const { limit = 5 } = req.query;
  const { data, error } = await supabase
    .from('hotels')
    .select(`
      *,
      hotel_recommendations (
        recommendation_score,
        recommendation_reason
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET enhanced booking trends
app.get('/api/enhanced-booking-trends', async (req, res) => {
  const { period = 'month' } = req.query;
  
  const { data, error } = await supabase
    .from('booking_trends')
    .select('*')
    .order('month', { ascending: true })
    .limit(12);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET hotels by city
app.get('/api/hotels', async (req, res) => {
  const { city, limit = 10 } = req.query;
  let query = supabase
    .from('hotels')
    .select('*')
    .order('rating', { ascending: false });

  if (city) {
    query = query.eq('city', city);
  }

  const { data, error } = await query.limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST enhanced booking
app.post('/api/enhanced-bookings', async (req, res) => {
  const booking = {
    ...req.body,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET stations for a city (from stations table)
app.get('/api/stations-by-city', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City parameter is required' });

  const { data, error } = await supabase
    .from('stations')
    .select('station_name')
    .eq('city', city);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data.map(s => s.station_name));
});

// GET all unique cities from stations table
app.get('/api/cities', async (_req, res) => {
  const { data, error } = await supabase
    .from('stations')
    .select('city', { distinct: true });

  if (error) return res.status(500).json({ error: error.message });

  // Extract unique city names
  const cities = Array.from(new Set(data.map(row => row.city))).sort();
  res.json(cities);
});

// PNR Status endpoint
app.get('/api/pnr-status/:pnrNumber', async (req, res) => {
  try {
    const { pnrNumber } = req.params;
    const response = await fetch(
      `https://indianrailapi.com/api/v2/PNRCheck/apikey/e6130a19e7d89e5b4e759e20788d1456/PNRNumber/${pnrNumber}/Route/1/`
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('PNR Status Error:', error);
    res.status(500).json({ error: 'Failed to fetch PNR status' });
  }
});

// ─── ADD THIS HEALTH-CHECK ENDPOINT ─────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/trains',
      '/api/bookings',
      '/api/profiles'
    ]
  });
});
// ─────────────────────────────────────────────────────────────────────────────

const port = process.env.PORT || 5000
app.listen(port, () =>
  console.log(`Backend listening on http://localhost:${port}`)
)