import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/booking-trends', async (req, res) => {
  try {
    // Query: group bookings by date
    const query = `
      SELECT
        TO_CHAR(b.booking_date, 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM bookings b
      GROUP BY date
      ORDER BY date ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows.map(row => ({ date: row.date, count: parseInt(row.count) })));
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 