import express from 'express';
import cors from 'cors';
import destinationStatsRouter from './routes/destinationStats.js';
import bookingTrendsRouter from './routes/bookingTrends.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', destinationStatsRouter);
app.use('/api', bookingTrendsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 