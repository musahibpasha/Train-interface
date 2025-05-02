import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/destination-stats', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Query to get hotels count
    const hotelsQuery = `
      SELECT COUNT(*) as hotelsCount 
      FROM hotels 
      WHERE city = $1
    `;

    // Query to get bookings count
    const bookingsQuery = `
      SELECT COUNT(*) as bookingsCount 
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE h.city = $1
    `;

    const [hotelsResult, bookingsResult] = await Promise.all([
      pool.query(hotelsQuery, [city]),
      pool.query(bookingsQuery, [city])
    ]);

    res.json({
      hotelsCount: parseInt(hotelsResult.rows[0].hotelscount),
      bookingsCount: parseInt(bookingsResult.rows[0].bookingscount)
    });
  } catch (error) {
    console.error('Error fetching destination stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 