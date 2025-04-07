import sql from './db.js';

(async () => {
  try {
    const result = await sql`SELECT 1 AS connected`;
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();