import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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